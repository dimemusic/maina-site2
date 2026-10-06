// Дані сайту з Sanity: товари, категорії, контакти й тексти головної.
// Браузер питає Sanity під час відкриття сторінки, тому зміни власників видно без перезбірки сайту.
// Датасет публічний, токен не потрібен; ідентифікатор проєкту береться зі змінних VITE_SANITY_*.
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { CatalogItem } from './order-math.js'

const PROJECT_ID = import.meta.env.VITE_SANITY_PROJECT_ID
const DATASET = import.meta.env.VITE_SANITY_DATASET || 'production'
const API_VERSION = '2025-02-19'
const CACHE_KEY = 'content-cache-v1'

export type Details = {
  lead: string
  composition: string
  prep: string
  shelf: string
  nutrition: [string, string, string]
  facts: [string, string, string]
  related: string[]
}
export type Product = CatalogItem & {
  desc: string
  img: string
  gallery: string[]
  cat: string
  catSlug: string
  isHit: boolean
  isNew: boolean
  details: Details
}
export type Category = { title: string; slug: string }
export type Site = {
  announcement: string
  about: string
  phone: string
  address: string
  workingHours: string
  instagramUrl: string
  telegramUrl: string
  viberPhone: string
  whatsappPhone: string
  freeDeliveryFrom: number
}
export type Home = {
  heroEyebrow: string
  heroTitle: string
  heroText: string
  heroImage: string
  tags: string[]
  features: { _key: string; title: string; text: string }[]
  ticker: string[]
  hitsEyebrow: string
  hitsTitle: string
  hits: string[]
  deliveryTitle: string
  steps: { _key: string; title: string; text: string; img: string }[]
  orderEyebrow: string
  orderTitle: string
  orderText: string
  orderImage: string
}
export type Content = {
  products: Product[]
  byId: Record<string, Product>
  categories: Category[]
  site: Site
  home: Home
}

const QUERY = `{
  "products": *[_type == "product" && inStock != false] | order(order asc, title asc) {
    "id": slug.current,
    "name": title,
    "desc": description,
    "img": image.asset->url,
    "gallery": gallery[].asset->url,
    "cat": category->title,
    "catSlug": category->slug.current,
    isHit,
    isNew,
    "opts": variants[]{ "key": _key, label, price, note },
    "sale": select(sale.active == true => { "short": sale.badge, "text": sale.text, "every": sale.every, "off": sale.discountPercent / 100 }),
    "details": details{
      lead, composition, "prep": preparation, "shelf": shelfLife,
      calories, protein, carbs, factFormat, factCooking, factStorage,
      "related": related[]->slug.current
    }
  },
  "categories": *[_type == "category"] | order(order asc) { title, "slug": slug.current },
  "site": *[_id == "siteSettings"][0]{
    announcement, about, phone, address, workingHours,
    instagramUrl, telegramUrl, viberPhone, whatsappPhone, freeDeliveryFrom
  },
  "home": *[_id == "homePage"][0]{
    heroEyebrow, heroTitle, heroText, "heroImage": heroImage.asset->url,
    tags,
    features[]{ _key, title, text },
    ticker,
    hitsEyebrow, hitsTitle, "hits": hits[]->slug.current,
    deliveryTitle,
    "steps": deliverySteps[]{ _key, title, text, "img": image.asset->url },
    orderEyebrow, orderTitle, orderText, "orderImage": orderImage.asset->url
  }
}`

/* eslint-disable @typescript-eslint/no-explicit-any */
const str = (v: unknown) => (typeof v === 'string' ? v : '')
const strs = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x !== '') : [])

function normalize(raw: any): Content {
  const products: Product[] = (raw?.products ?? [])
    .filter((p: any) => p?.id && Array.isArray(p.opts) && p.opts.length > 0)
    .map((p: any): Product => {
      const d = p.details ?? {}
      return {
        id: p.id,
        name: str(p.name),
        desc: str(p.desc),
        img: str(p.img),
        gallery: strs(p.gallery),
        cat: str(p.cat),
        catSlug: str(p.catSlug),
        isHit: !!p.isHit,
        isNew: !!p.isNew,
        opts: p.opts.map((o: any) => ({ key: str(o.key), label: str(o.label), price: Number(o.price) || 0, note: str(o.note) })),
        sale: p.sale ? { short: str(p.sale.short), text: str(p.sale.text), every: Number(p.sale.every) || 2, off: Number(p.sale.off) || 0 } : null,
        details: {
          lead: str(d.lead),
          composition: str(d.composition),
          prep: str(d.prep),
          shelf: str(d.shelf),
          nutrition: [str(d.calories), str(d.protein), str(d.carbs)],
          facts: [str(d.factFormat), str(d.factCooking), str(d.factStorage)],
          related: strs(d.related),
        },
      }
    })
  const s = raw?.site ?? {}
  const h = raw?.home ?? {}
  return {
    products,
    byId: Object.fromEntries(products.map((p) => [p.id, p])),
    categories: (raw?.categories ?? []).filter((c: any) => c?.slug && c?.title).map((c: any) => ({ title: c.title, slug: c.slug })),
    site: {
      announcement: str(s.announcement),
      about: str(s.about),
      phone: str(s.phone),
      address: str(s.address),
      workingHours: str(s.workingHours),
      instagramUrl: str(s.instagramUrl),
      telegramUrl: str(s.telegramUrl),
      viberPhone: str(s.viberPhone),
      whatsappPhone: str(s.whatsappPhone),
      freeDeliveryFrom: Number(s.freeDeliveryFrom) || 0,
    },
    home: {
      heroEyebrow: str(h.heroEyebrow),
      heroTitle: str(h.heroTitle),
      heroText: str(h.heroText),
      heroImage: str(h.heroImage),
      tags: strs(h.tags),
      features: (h.features ?? []).map((f: any) => ({ _key: str(f._key), title: str(f.title), text: str(f.text) })),
      ticker: strs(h.ticker),
      hitsEyebrow: str(h.hitsEyebrow),
      hitsTitle: str(h.hitsTitle),
      hits: strs(h.hits),
      deliveryTitle: str(h.deliveryTitle),
      steps: (h.steps ?? []).map((st: any) => ({ _key: str(st._key), title: str(st.title), text: str(st.text), img: str(st.img) })),
      orderEyebrow: str(h.orderEyebrow),
      orderTitle: str(h.orderTitle),
      orderText: str(h.orderText),
      orderImage: str(h.orderImage),
    },
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

async function fetchRaw(signal: AbortSignal): Promise<unknown> {
  if (!PROJECT_ID) throw new Error('VITE_SANITY_PROJECT_ID не задано')
  const url = `https://${PROJECT_ID}.apicdn.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${encodeURIComponent(QUERY)}`
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`Sanity відповів ${res.status}`)
  return (await res.json()).result
}

// Останню успішну відповідь тримаємо в localStorage: сторінка відкривається миттєво,
// а свіжі дані підтягуються у фоні. Якщо Sanity недоступний, сайт працює з останньою копією.
function readCache(): Content | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    const content = raw ? normalize(JSON.parse(raw)) : null
    return content && content.products.length > 0 ? content : null
  } catch {
    return null
  }
}
function writeCache(raw: unknown) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(raw))
  } catch {
    /* приватний режим або переповнене сховище: просто працюємо без кешу */
  }
}

const ContentContext = createContext<Content | null>(null)

export function useContent(): Content {
  const c = useContext(ContentContext)
  if (!c) throw new Error('useContent має викликатися всередині ContentGate')
  return c
}

const SCREEN = 'flex min-h-screen flex-col items-center justify-center gap-4 bg-[#faf6ec] px-6 text-center font-[\'Montserrat\',sans-serif] text-[#3a4c38]'

/** Показує дані з Sanity, а поки їх немає, екран завантаження чи помилки. */
export function ContentGate({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Content | null>(readCache)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const ac = new AbortController()
    fetchRaw(ac.signal)
      .then((raw) => {
        const fresh = normalize(raw)
        if (fresh.products.length === 0) throw new Error('У Sanity немає опублікованих товарів')
        setContent(fresh)
        setFailed(false)
        writeCache(raw)
      })
      .catch((err) => {
        if (ac.signal.aborted) return
        console.error('Не вдалося завантажити дані з Sanity:', err instanceof Error ? err.message : err)
        setFailed(true)
      })
    return () => ac.abort()
  }, [attempt])

  if (content) return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>
  if (failed) {
    return (
      <div className={SCREEN}>
        <p className="text-[20px] font-semibold">Не вдалося завантажити меню</p>
        <p className="max-w-[360px] text-[14px] text-[#4c5147]">Перевірте інтернет і спробуйте ще раз.</p>
        <button
          onClick={() => {
            setFailed(false)
            setAttempt((a) => a + 1)
          }}
          className="cursor-pointer rounded-lg bg-[#3a4c38] px-6 py-3 text-[14px] font-semibold text-[#faf6ec]"
        >
          Спробувати ще раз
        </button>
      </div>
    )
  }
  return (
    <div className={SCREEN} role="status" aria-live="polite">
      <p className="text-[16px]">Завантажуємо меню…</p>
    </div>
  )
}

// --- Допоміжне для відображення ---

/** Sanity CDN віддає зображення потрібного розміру й у сучасному форматі (WebP/AVIF). */
export const sized = (url: string, width: number) => (url ? `${url}?w=${width}&auto=format&q=80` : '')

const digits = (s: string) => s.replace(/\D/g, '')

/** Посилання на контакти з налаштувань; порожні поля пропускаються. */
export function contactLinks(site: Site) {
  const igName = (() => {
    try {
      return '@' + new URL(site.instagramUrl).pathname.split('/').filter(Boolean)[0]
    } catch {
      return ''
    }
  })()
  const phone = digits(site.phone)
  const viber = digits(site.viberPhone)
  const whatsapp = digits(site.whatsappPhone)
  return {
    instagram: site.instagramUrl ? { label: igName.length > 1 ? igName : 'Instagram', href: site.instagramUrl } : null,
    telegram: site.telegramUrl ? { label: 'Написати в чат', href: site.telegramUrl } : null,
    viber: viber ? { label: site.viberPhone, href: `viber://chat?number=%2B${viber}` } : null,
    whatsapp: whatsapp ? { label: site.whatsappPhone, href: `https://wa.me/${whatsapp}` } : null,
    phone: phone ? { label: site.phone, href: `tel:+${phone}` } : null,
  }
}
