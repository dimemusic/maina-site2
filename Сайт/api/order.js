// Vercel serverless function: POST /api/order
// Приймає замовлення з сайту й надсилає його в Telegram через Bot API.
// Сума рахується тут, за актуальними цінами з Sanity: з браузера приходять лише id товару, ключ варіанта й кількість.
// Перед відправкою замовлення отримує номер (атомарний лічильник orderCounter) і зберігається в Sanity як документ order.
// Ім'я, телефон і адреса в Sanity НЕ потрапляють (датасет публічний), вони йдуть лише в Telegram.
// Токени й ключі беруться ТІЛЬКИ зі змінних середовища:
//   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_WRITE_TOKEN
//   (та необов'язковий SANITY_API_READ_TOKEN).
import { cartTotals, findOption, normalizePhone, promoDiscount, sanitizeLines } from '../src/lib/order-math.js'

const SANITY_API_VERSION = '2025-02-19'
const MAX_LINES = 30

// Беремо з Sanity лише ті товари, що є в кошику, і поріг безкоштовної доставки.
// Запит іде напряму (api.sanity.io, не CDN), щоб ціни завжди були свіжими.
const CATALOG_QUERY = `{
  "products": *[_type == "product" && inStock != false && slug.current in $ids]{
    "id": slug.current,
    "name": title,
    sku,
    "opts": variants[]{ "key": _key, label, price, note },
    "sale": select(sale.active == true => { "short": sale.badge, "text": sale.text, "every": sale.every, "off": sale.discountPercent / 100 })
  },
  "freeDelivery": *[_id == "siteSettings"][0].freeDeliveryFrom
}`

class CatalogError extends Error {}

async function fetchCatalog(ids) {
  const projectId = process.env.SANITY_PROJECT_ID
  const dataset = process.env.SANITY_DATASET || 'production'
  if (!projectId) throw new CatalogError('SANITY_PROJECT_ID не заданий у змінних середовища')
  const headers = { 'Content-Type': 'application/json' }
  // Токен потрібен лише якщо датасет приватний; для публічного можна не задавати
  if (process.env.SANITY_API_READ_TOKEN) headers.Authorization = `Bearer ${process.env.SANITY_API_READ_TOKEN}`
  let res
  try {
    res = await fetch(`https://${projectId}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${dataset}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: CATALOG_QUERY, params: { ids } }),
      signal: AbortSignal.timeout(8000),
    })
  } catch (err) {
    throw new CatalogError(`Sanity недоступний (${err instanceof Error ? err.name : 'unknown'})`)
  }
  // У лог потрапляє лише статус, без заголовків і токена
  if (!res.ok) throw new CatalogError(`Sanity відповів ${res.status}`)
  const { result } = await res.json()
  return {
    catalog: Object.fromEntries((result?.products ?? []).filter((p) => p.id && Array.isArray(p.opts)).map((p) => [p.id, p])),
    freeDelivery: typeof result?.freeDelivery === 'number' ? result.freeDelivery : null,
  }
}

// --- Запис замовлення в Sanity ---
const COUNTER_ID = 'orderCounter'
const COUNTER_START = 1000 // перше замовлення отримає 1001

// Одна транзакція до Sanity (api.sanity.io/data/mutate). Кидає помилку з кодом статусу, без токена й тіла запиту.
async function sanityMutate(mutations, { returnDocuments = false } = {}) {
  const projectId = process.env.SANITY_PROJECT_ID
  const dataset = process.env.SANITY_DATASET || 'production'
  const token = process.env.SANITY_API_WRITE_TOKEN
  if (!projectId || !token) throw new Error('SANITY_PROJECT_ID або SANITY_API_WRITE_TOKEN не задані у змінних середовища')
  const res = await fetch(
    `https://${projectId}.api.sanity.io/v${SANITY_API_VERSION}/data/mutate/${dataset}${returnDocuments ? '?returnDocuments=true' : ''}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ mutations }),
      signal: AbortSignal.timeout(4000),
    },
  )
  if (!res.ok) throw new Error(`Sanity mutate відповів ${res.status}`)
  return res.json()
}

// Наступний номер: createIfNotExists + inc в одній транзакції, тож два одночасних замовлення не отримають однаковий номер
async function nextOrderNumber() {
  const { results } = await sanityMutate(
    [
      { createIfNotExists: { _id: COUNTER_ID, _type: 'orderCounter', value: COUNTER_START } },
      { patch: { id: COUNTER_ID, inc: { value: 1 } } },
    ],
    { returnDocuments: true },
  )
  const value = results?.find((r) => r.operation === 'update')?.document?.value
  if (!Number.isInteger(value)) throw new Error('Sanity не повернув номер замовлення')
  return value
}

// Зберігає замовлення без персональних даних. `create` (не createOrReplace) не дасть перезаписати вже існуюче замовлення.
async function saveOrder({ lines, catalog }) {
  const number = await nextOrderNumber()
  const { saved, total } = cartTotals(lines, catalog)
  const items = lines.map((l) => {
    const p = catalog[l.id]
    const o = findOption(p, l.opt)
    return {
      _key: `${l.id}-${l.opt}`.slice(0, 64),
      _type: 'orderItem',
      sku: typeof p.sku === 'string' ? p.sku.trim() : '',
      title: p.name,
      option: o.label,
      qty: l.qty,
      price: o.price,
      sum: o.price * l.qty - promoDiscount(p, l.opt, l.qty),
    }
  })
  await sanityMutate([
    {
      create: {
        _id: `order-${number}`,
        _type: 'order',
        number,
        createdAt: new Date().toISOString(),
        status: 'new',
        items,
        total,
        discount: saved,
        telegramSent: false,
      },
    },
  ])
  return number
}

async function markTelegramSent(number) {
  await sanityMutate([{ patch: { id: `order-${number}`, set: { telegramSent: true } } }])
}

// --- Простий rate limit: до 5 замовлень з одного IP за 10 хвилин ---
// Пам'ять живе, поки живе інстанс функції, тож це захист «за найкращих зусиль»
// (разом із honeypot-полем цього достатньо від простого спаму).
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5
const hits = new Map()

function tooManyRequests(ip) {
  const now = Date.now()
  for (const [key, times] of hits) {
    const fresh = times.filter((t) => now - t < WINDOW_MS)
    if (fresh.length) hits.set(key, fresh)
    else hits.delete(key)
  }
  const times = hits.get(ip) ?? []
  if (times.length >= MAX_PER_WINDOW) return true
  hits.set(ip, [...times, now])
  return false
}

const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const money = (n) => `${Number.isInteger(n) ? n : n.toFixed(2)} ₴`
const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

function buildMessage({ orderLabel, savedToSanity, name, phone, address, comment, lines, catalog, freeDelivery }) {
  const { saved, total } = cartTotals(lines, catalog)
  const items = lines.map((l) => {
    const p = catalog[l.id]
    const o = findOption(p, l.opt)
    const off = promoDiscount(p, l.opt, l.qty)
    const promo = off > 0 ? ` (🎁 ${escapeHtml(p.sale.short)}: −${money(off)})` : ''
    const sku = typeof p.sku === 'string' && p.sku.trim() ? ` [${escapeHtml(p.sku.trim())}]` : ''
    return `• ${escapeHtml(p.name)}${sku}, ${escapeHtml(o.label)} × ${l.qty} = ${money(o.price * l.qty - off)}${promo}`
  })
  return [
    `🛒 <b>Нове замовлення №${escapeHtml(orderLabel)}</b>`,
    ...(savedToSanity ? [] : ['⚠️ Не збережено в Sanity, номер тимчасовий. Занесіть замовлення вручну.']),
    '',
    `👤 ${escapeHtml(name)}`,
    `📞 ${escapeHtml(phone)}`,
    `📦 Нова пошта: ${escapeHtml(address)}`,
    '',
    ...items,
    '',
    ...(saved > 0 ? [`Знижка за акціями: −${money(saved)}`] : []),
    `<b>Разом: ${money(total)}</b>`,
    `Доставка: ${freeDelivery !== null && total >= freeDelivery ? 'безкоштовна' : 'за тарифами перевізника'}`,
    ...(comment ? ['', `💬 ${escapeHtml(comment)}`] : []),
  ].join('\n')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Метод не підтримується.' })
  }

  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      body = null
    }
  }
  if (!body || typeof body !== 'object') return res.status(400).json({ error: 'Некоректний запит.' })

  // Honeypot: це поле заповнюють лише боти. Вдаємо, що все добре, але нічого не надсилаємо.
  if (typeof body.website === 'string' && body.website.trim() !== '') return res.status(200).json({ ok: true })

  const ip = String(req.headers['x-forwarded-for'] ?? req.socket?.remoteAddress ?? 'unknown').split(',')[0].trim()
  if (tooManyRequests(ip)) return res.status(429).json({ error: 'Забагато замовлень. Спробуйте за кілька хвилин.' })

  const name = text(body.name, 100)
  const address = text(body.address, 200)
  const comment = text(body.comment, 500)
  const phone = normalizePhone(body.phone)

  if (name.length < 2) return res.status(400).json({ error: 'Вкажіть ім’я.' })
  if (!phone) return res.status(400).json({ error: 'Некоректний номер телефону.' })
  if (address.length < 5) return res.status(400).json({ error: 'Вкажіть місто та відділення Нової пошти.' })

  const rawLines = body.lines
  if (!Array.isArray(rawLines) || rawLines.length === 0) return res.status(400).json({ error: 'Кошик порожній.' })
  if (rawLines.length > MAX_LINES) return res.status(400).json({ error: 'Забагато позицій у кошику.' })
  const ids = [...new Set(rawLines.map((l) => l?.id).filter((id) => typeof id === 'string' && id.length > 0 && id.length <= 100))]

  // Ціни, назви й акції беремо ТІЛЬКИ з Sanity. Усе, що прийшло з браузера, крім id/варіанта/кількості, ігнорується.
  let catalog
  let freeDelivery
  try {
    ;({ catalog, freeDelivery } = await fetchCatalog(ids))
  } catch (err) {
    console.error('Не вдалося отримати каталог із Sanity:', err instanceof CatalogError ? err.message : 'unknown')
    return res.status(503).json({ error: 'Не вдалося перевірити ціни. Спробуйте ще раз за хвилину або зателефонуйте нам.' })
  }
  const lines = sanitizeLines(rawLines, catalog)
  // Якщо хоч одна позиція зникла чи змінилась (товар прибрали, змінили варіанти), не надсилаємо замовлення
  // з іншою сумою, ніж бачив покупець: просимо оновити сторінку й перевірити кошик.
  if (lines.length !== rawLines.length) {
    return res.status(409).json({ error: 'Деякі товари в кошику змінилися або більше недоступні. Оновіть сторінку й перевірте кошик.' })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) {
    console.error('TELEGRAM_BOT_TOKEN або TELEGRAM_CHAT_ID не задані у змінних середовища')
    return res.status(500).json({ error: 'Сервер замовлень ще не налаштований. Зателефонуйте нам, будь ласка.' })
  }

  // Номер і запис у Sanity. Якщо Sanity недоступний, замовлення все одно йде в Telegram із запасним номером.
  let orderNumber = null
  try {
    orderNumber = await saveOrder({ lines, catalog })
  } catch (err) {
    console.error('Не вдалося зберегти замовлення в Sanity:', err instanceof Error ? err.message : 'unknown')
  }
  const savedToSanity = orderNumber !== null
  const orderLabel = savedToSanity ? String(orderNumber) : `T-${String(Date.now()).slice(-6)}`

  try {
    const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: buildMessage({ orderLabel, savedToSanity, name, phone, address, comment, lines, catalog, freeDelivery }),
        parse_mode: 'HTML',
      }),
    })
    if (!tg.ok) {
      // У лог пишемо лише статус і опис помилки від Telegram — без токена
      const info = await tg.json().catch(() => ({}))
      console.error('Telegram error', tg.status, info.description)
      return res.status(502).json({ error: 'Не вдалося передати замовлення. Спробуйте ще раз пізніше.' })
    }
    // Замовлення вже в Telegram: збій позначки не повинен показувати покупцеві помилку
    if (savedToSanity) {
      await markTelegramSent(orderNumber).catch((err) =>
        console.error('Не вдалося поставити telegramSent:', err instanceof Error ? err.message : 'unknown'),
      )
    }
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Telegram request failed', err instanceof Error ? err.name : 'unknown')
    return res.status(502).json({ error: 'Не вдалося передати замовлення. Спробуйте ще раз пізніше.' })
  }
}
