// Vercel serverless function: GET /api/np
// Автопідказки Нової пошти для форми замовлення. Дві дії через query:
//   ?action=cities&q=Київ          → [{ ref, name, area }]  (до 8 міст/сіл, q від 2 символів)
//   ?action=warehouses&ref=<UUID>[&q=текст] → [{ ref, name }]  (до 30 відділень і поштоматів: пошук за q, номером чи вулицею; відділення раніше за поштомати)
// Ключ береться ТІЛЬКИ зі змінної середовища NOVA_POSHTA_API_KEY; у відповідь він не потрапляє, як і сирі помилки НП.
const NP_URL = 'https://api.novaposhta.ua/v2.0/json/'
const MAX_CITIES = 8
const MAX_WAREHOUSES = 30
const POSTOMAT_TYPE_REF = 'f9316480-5f2d-425d-bc2c-ac7cd29decf0'
// Відповіді однакові для всіх покупців, тож їх можна кешувати на стороні Vercel
const CACHE_CONTROL = 'public, s-maxage=3600, stale-while-revalidate=86400'
const RATE_LIMIT_WAIT_MS = 600 // НП пропускає один запит на ключ приблизно раз на 0,5 с
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

class NpError extends Error {}

async function callNp(modelName, calledMethod, methodProperties, attempt = 1) {
  let res
  try {
    res = await fetch(NP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: process.env.NOVA_POSHTA_API_KEY, modelName, calledMethod, methodProperties }),
      signal: AbortSignal.timeout(8000),
    })
  } catch (err) {
    throw new NpError(`Нова пошта недоступна (${err instanceof Error ? err.name : 'unknown'})`)
  }
  const json = await res.json().catch(() => null)
  // У лог сервера (не клієнту) потрапляють статус і поля errors/warnings; ключ і решта тіла — ні
  const problems = json?.errors?.length || json?.warnings?.length
  console.log(`НП ${modelName}.${calledMethod}: HTTP ${res.status}, success=${json?.success}`)
  if (problems) console.warn('НП errors/warnings:', JSON.stringify({ errors: json.errors, warnings: json.warnings }))
  // Ліміт частоти: НП відповідає HTTP 200, success=false, errors=["To many requests"] — чекаємо й пробуємо ще
  if (!json?.success && json?.errors?.some?.((e) => /many requests/i.test(String(e))) && attempt < 3) {
    await sleep(RATE_LIMIT_WAIT_MS)
    return callNp(modelName, calledMethod, methodProperties, attempt + 1)
  }
  if (!res.ok) throw new NpError(`Нова пошта відповіла ${res.status}`)
  if (!json?.success || !Array.isArray(json.data)) throw new NpError('Нова пошта повернула помилку')
  return json.data
}

async function searchCities(q) {
  const data = await callNp('Address', 'searchSettlements', { CityName: q, Limit: String(MAX_CITIES), Page: '1' })
  return (data[0]?.Addresses ?? [])
    .filter((a) => a.Ref && a.MainDescription && Number(a.Warehouses) > 0)
    .slice(0, MAX_CITIES)
    .map((a) => ({ ref: a.Ref, name: a.MainDescription, area: [a.Region, a.Area].filter(Boolean).join(', ') }))
}

const isPostomat = (w) => w.TypeOfWarehouse === POSTOMAT_TYPE_REF || /^поштомат/i.test(w.Description)

async function listWarehouses(settlementRef, q) {
  const data = await callNp('Address', 'getWarehouses', {
    SettlementRef: settlementRef,
    Language: 'UA',
    ...(q ? { FindByString: q } : {}),
    Limit: String(MAX_WAREHOUSES),
    Page: '1',
  })
  const items = data.filter((w) => w.Ref && w.Description)
  // Відділення спершу, поштомати потім (сортування стабільне, порядок від НП всередині груп зберігається)
  return [...items.filter((w) => !isPostomat(w)), ...items.filter(isPostomat)].map((w) => ({ ref: w.Ref, name: w.Description }))
}

// --- Простий rate limit: до 60 запитів з одного IP за хвилину (підказки йдуть частіше, ніж замовлення) ---
// Пам'ять живе, поки живе інстанс функції, тож це захист «за найкращих зусиль».
const WINDOW_MS = 60 * 1000
const MAX_PER_WINDOW = 60
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

const param = (v) => (typeof v === 'string' ? v.trim() : '')

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Метод не підтримується.' })
  }

  if (!process.env.NOVA_POSHTA_API_KEY) {
    console.error('NOVA_POSHTA_API_KEY не заданий у змінних середовища')
    return res.status(503).json({ error: 'Підказки Нової пошти недоступні.' })
  }

  const ip = String(req.headers['x-forwarded-for'] ?? req.socket?.remoteAddress ?? 'unknown').split(',')[0].trim()
  if (tooManyRequests(ip)) return res.status(429).json({ error: 'Забагато запитів. Спробуйте за хвилину.' })

  const query = req.query ?? {}
  const action = param(query.action)

  try {
    if (action === 'cities') {
      const q = param(query.q)
      if (q.length < 2 || q.length > 50) return res.status(400).json({ error: 'Некоректний запит.' })
      const cities = await searchCities(q)
      res.setHeader('Cache-Control', CACHE_CONTROL) // лише після успіху, щоб не кешувати помилки
      return res.status(200).json(cities)
    }
    if (action === 'warehouses') {
      const ref = param(query.ref)
      const q = param(query.q)
      if (!UUID.test(ref) || q.length > 50) return res.status(400).json({ error: 'Некоректний запит.' })
      const warehouses = await listWarehouses(ref, q)
      res.setHeader('Cache-Control', CACHE_CONTROL)
      return res.status(200).json(warehouses)
    }
    return res.status(400).json({ error: 'Некоректний запит.' })
  } catch (err) {
    console.error('Помилка Нової пошти:', err instanceof NpError ? err.message : 'unknown')
    return res.status(502).json({ error: 'Нова пошта не відповідає. Спробуйте пізніше.' })
  }
}
