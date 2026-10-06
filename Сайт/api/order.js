// Vercel serverless function: POST /api/order
// Приймає замовлення з сайту й надсилає його в Telegram через Bot API.
// Токен і chat ID беруться ТІЛЬКИ зі змінних середовища (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID).
import { CATALOG, FREE_DELIVERY, cartTotals, normalizePhone, promoDiscount, sanitizeLines } from '../src/data/catalog.js'

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

function buildMessage({ name, phone, address, comment, lines }) {
  const { saved, total } = cartTotals(lines)
  const items = lines.map((l) => {
    const p = CATALOG[l.id]
    const o = p.opts[l.opt]
    const off = promoDiscount(p, l.opt, l.qty)
    const promo = off > 0 ? ` (🎁 ${escapeHtml(p.sale.short)}: −${money(off)})` : ''
    return `• ${escapeHtml(p.name)}, ${escapeHtml(o.label)} × ${l.qty} = ${money(o.price * l.qty - off)}${promo}`
  })
  return [
    '🛒 <b>Нове замовлення</b>',
    '',
    `👤 ${escapeHtml(name)}`,
    `📞 ${escapeHtml(phone)}`,
    `📦 Нова пошта: ${escapeHtml(address)}`,
    '',
    ...items,
    '',
    ...(saved > 0 ? [`Знижка за акціями: −${money(saved)}`] : []),
    `<b>Разом: ${money(total)}</b>`,
    `Доставка: ${total >= FREE_DELIVERY ? 'безкоштовна' : 'за тарифами перевізника'}`,
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
  const lines = sanitizeLines(body.lines)

  if (name.length < 2) return res.status(400).json({ error: 'Вкажіть ім’я.' })
  if (!phone) return res.status(400).json({ error: 'Некоректний номер телефону.' })
  if (address.length < 5) return res.status(400).json({ error: 'Вкажіть місто та відділення Нової пошти.' })
  if (lines.length === 0) return res.status(400).json({ error: 'Кошик порожній або товарів більше немає в наявності.' })

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) {
    console.error('TELEGRAM_BOT_TOKEN або TELEGRAM_CHAT_ID не задані у змінних середовища')
    return res.status(500).json({ error: 'Сервер замовлень ще не налаштований. Зателефонуйте нам, будь ласка.' })
  }

  try {
    const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: buildMessage({ name, phone, address, comment, lines }), parse_mode: 'HTML' }),
    })
    if (!tg.ok) {
      // У лог пишемо лише статус і опис помилки від Telegram — без токена
      const info = await tg.json().catch(() => ({}))
      console.error('Telegram error', tg.status, info.description)
      return res.status(502).json({ error: 'Не вдалося передати замовлення. Спробуйте ще раз пізніше.' })
    }
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Telegram request failed', err instanceof Error ? err.name : 'unknown')
    return res.status(502).json({ error: 'Не вдалося передати замовлення. Спробуйте ще раз пізніше.' })
  }
}
