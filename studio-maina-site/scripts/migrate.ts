// Одноразове перенесення контенту зі старого коду сайту в Sanity.
//
// Запуск (з папки studio-maina-site):
//   DRY=1 npx sanity exec scripts/migrate.ts --with-user-token   — лише показати, що буде створено
//   npx sanity exec scripts/migrate.ts --with-user-token         — створити й опублікувати
//
// Товари й деталі беруться зі знімка scripts/migration-data.json (витягнутого з catalog.js і details.ts).
// Токен не потрібен у файлах: --with-user-token використовує вхід, зроблений через `sanity login`.
import {randomUUID} from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import {getCliClient} from 'sanity/cli'

type Opt = {label: string; price: number; note: string}
type Source = {
  id: string
  name: string
  desc: string
  opts: Opt[]
  sale?: {short: string; text: string; every: number; off: number}
  details: {
    cat: string
    lead: string
    composition: string
    prep: string
    shelf: string
    nutrition: [string, string, string]
    facts: [string, string, string]
    related: string[]
    gallery?: string[]
  }
}

const DRY = process.env.DRY === '1'
const client = getCliClient({apiVersion: '2025-02-19'})

const data = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'scripts/migration-data.json'), 'utf8'),
) as {freeDelivery: number; products: Source[]}
const products = data.products

const ASSETS_DIR = path.resolve(process.cwd(), '../Сайт/public/assets')

// Фото товарів: локальні файли з public/assets і три з Unsplash (їх використовував сайт)
const IMAGE: Record<string, string> = {
  varenyky: 'b8623.png',
  kovbasa: '40cdf.png',
  khinkaliMeat: 'e8c65.png',
  vyshnya: '9f603.png',
  khlib: '1835a.png',
  khinkaliCheese: '50585.png',
  pelmeni: '1bf7b.png',
  syr: '9e5d6.png',
  cinnabon:
    'https://images.unsplash.com/photo-1694632288834-17d86b340745?auto=format&fit=crop&w=1600&q=85',
  syrnyky:
    'https://images.unsplash.com/photo-1681760161787-858b651df036?auto=format&fit=crop&w=1600&q=85',
  strudel:
    'https://images.unsplash.com/photo-1657313938000-23c4322dbe22?auto=format&fit=crop&w=1600&q=85',
}
// Додаткові фото (перше фото сторінки = головне, тому тут лише решта)
const GALLERY: Record<string, string[]> = {pelmeni: ['932dc.png', '96af8.png', '891ab.png']}

// Порядок категорій у меню та порядок товарів (як було в Menu.tsx)
const CATEGORY_ORDER = [
  'Хліб',
  'Солодка випічка',
  'Вареники',
  'Пельмені та хінкалі',
  'Ковбаси',
  'Крафтові сири',
]
const CATEGORY_SLUG: Record<string, string> = {
  Хліб: 'khlib',
  'Солодка випічка': 'sweet',
  Вареники: 'varenyky',
  'Пельмені та хінкалі': 'pelmeni-khinkali',
  Ковбаси: 'kovbasy',
  'Крафтові сири': 'syry',
}
const MENU_ORDER = [
  'varenyky',
  'khlib',
  'khinkaliCheese',
  'pelmeni',
  'vyshnya',
  'syr',
  'khinkaliMeat',
  'kovbasa',
  'cinnabon',
  'syrnyky',
  'strudel',
]
const HITS = [
  'varenyky',
  'kovbasa',
  'khinkaliMeat',
  'vyshnya',
  'khlib',
  'khinkaliCheese',
  'pelmeni',
  'syr',
]
const NEW = ['khinkaliCheese', 'vyshnya', 'cinnabon']

const HERO_TEXT =
  'Це заморожені напівфабрикати, свіжий хліб, крафтові сири, ковбаси та консервація. Готуємо так, як для власної родини, і привозимо по всій Україні.'

const key = () => randomUUID().slice(0, 12)
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9а-яіїєґ]+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/\./g, '-')

// --- Завантаження фото (кожен файл лише раз) ---
const assetCache = new Map<string, string>()
async function uploadImage(source: string): Promise<string> {
  const cached = assetCache.get(source)
  if (cached) return cached
  if (DRY) return `dry-asset-${source}`
  let doc
  if (source.startsWith('http')) {
    const res = await fetch(source)
    if (!res.ok) throw new Error(`Не вдалося завантажити ${source}: ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    const name = `${new URL(source).pathname.split('/').pop() || 'photo'}.jpg`
    doc = await client.assets.upload('image', buf, {filename: name})
  } else {
    const file = path.join(ASSETS_DIR, source)
    doc = await client.assets.upload('image', fs.createReadStream(file), {filename: source})
  }
  assetCache.set(source, doc._id)
  console.log('  фото:', source.slice(0, 60), '→', doc._id)
  return doc._id
}
const imageField = async (source: string, alt: string) => ({
  _type: 'image',
  asset: {_type: 'reference', _ref: await uploadImage(source)},
  alt,
})

async function main() {
  // Захист від повторного запуску: не перезаписуємо те, що власник уже міг змінити
  const existing = await client.fetch<number>(
    'count(*[_type in ["product","category","siteSettings","homePage"]])',
  )
  if (existing > 0) {
    throw new Error(
      `У датасеті вже є ${existing} документів сайту. Скрипт зупинено, щоб нічого не перезаписати.`,
    )
  }

  console.log(DRY ? 'ПРОБНИЙ ЗАПУСК (нічого не записується)' : 'Створюю документи...')

  // 1. Категорії
  const categoryIds = new Map<string, string>()
  const categoryDocs = CATEGORY_ORDER.map((title, i) => {
    const _id = randomUUID()
    categoryIds.set(title, _id)
    return {
      _id,
      _type: 'category',
      title,
      slug: {_type: 'slug', current: CATEGORY_SLUG[title]},
      order: (i + 1) * 10,
    }
  })

  // 2. Товари (спершу всі id, щоб «Вам також сподобається» могло посилатися одне на одного)
  const productIds = new Map<string, string>(products.map((p) => [p.id, randomUUID()]))
  const ref = (slug: string) => {
    const id = productIds.get(slug)
    if (!id) throw new Error(`Невідомий товар: ${slug}`)
    return {_type: 'reference', _ref: id}
  }

  const productDocs = []
  for (const p of products) {
    const categoryId = categoryIds.get(p.details.cat)
    if (!categoryId) throw new Error(`Невідома категорія «${p.details.cat}» у ${p.id}`)
    const gallery = []
    for (const src of GALLERY[p.id] ?? []) {
      gallery.push({_key: key(), ...(await imageField(src, p.name))})
    }
    productDocs.push({
      _id: productIds.get(p.id)!,
      _type: 'product',
      title: p.name,
      slug: {_type: 'slug', current: p.id},
      category: {_type: 'reference', _ref: categoryId},
      description: p.desc,
      image: await imageField(IMAGE[p.id], p.name),
      gallery,
      inStock: true,
      isHit: HITS.includes(p.id),
      isNew: NEW.includes(p.id),
      order: (MENU_ORDER.indexOf(p.id) + 1) * 10,
      variants: p.opts.map((o) => ({
        _key: slugify(o.label),
        _type: 'variant',
        label: o.label,
        price: o.price,
        note: o.note,
      })),
      sale: p.sale
        ? {
            active: true,
            badge: p.sale.short,
            text: p.sale.text,
            every: p.sale.every,
            discountPercent: Math.round(p.sale.off * 100),
          }
        : {active: false},
      details: {
        lead: p.details.lead,
        composition: p.details.composition,
        preparation: p.details.prep,
        shelfLife: p.details.shelf,
        calories: p.details.nutrition[0],
        protein: p.details.nutrition[1],
        carbs: p.details.nutrition[2],
        factFormat: p.details.facts[0],
        factCooking: p.details.facts[1],
        factStorage: p.details.facts[2],
        related: p.details.related.map((slug) => ({_key: key(), ...ref(slug)})),
      },
    })
  }

  // 3. Контакти та налаштування (значення поточні з сайту; заглушки власник замінить у Studio)
  const siteSettings = {
    _id: 'siteSettings',
    _type: 'siteSettings',
    announcement: 'Доставка по всій Україні · Нова Пошта та кур’єр',
    about: HERO_TEXT,
    phone: '+380 67 000 00 00',
    address: 'м. _____ вул. ______',
    workingHours: 'Пн - Нд  |  9:00 - 20:20',
    instagramUrl: 'https://instagram.com/maina.by.rivka',
    telegramUrl: 'https://t.me/',
    viberPhone: '+380 67 000 00 00',
    whatsappPhone: '+380 67 000 00 00',
    freeDeliveryFrom: data.freeDelivery,
  }

  // 4. Головна сторінка
  const homePage = {
    _id: 'homePage',
    _type: 'homePage',
    heroEyebrow: 'Домашня кухня · з 2026',
    heroTitle: 'Maina by Rivka',
    heroText: HERO_TEXT,
    heroImage: await imageField('33110.png', 'Магазин Maina by Rivka'),
    tags: [
      '# Вареники',
      '# Пельмені',
      '# Крафтовий сир',
      '# Ковбаси',
      '# Випічка',
      '# Консервація',
    ],
    features: [
      {
        _key: key(),
        _type: 'feature',
        title: 'Ліплено руками',
        text: 'Жодних конвеєрів. Кожен вареник загорнуто вручну щодня.',
      },
      {
        _key: key(),
        _type: 'feature',
        title: 'Швидка заморозка',
        text: 'Шокова заморозка зберігає смак так, ніби щойно зі столу.',
      },
      {
        _key: key(),
        _type: 'feature',
        title: 'Чистий склад',
        text: 'Фермерські продукти, без замінників та зайвої хімії.',
      },
    ],
    ticker: [
      '🥐  Тільки що прийшла додому, 5 хв і все готово',
      '🥟  Тільки що прийшла додому, 5 хв і все готово',
      '🧀  Тільки що прийшла додому, 5 хв і все готово',
    ],
    hitsEyebrow: 'Хіти продажів',
    hitsTitle: 'З чого почати',
    hits: HITS.map((slug) => ({_key: key(), ...ref(slug)})),
    deliveryTitle: 'Як відбувається доставка ?',
    deliverySteps: [
      {
        _key: key(),
        _type: 'step',
        title: 'Герметично пакуємо',
        text: 'Кожну позицію пакуємо окремо, щоб зберегти свіжість, смак і захистити продукти в дорозі.',
        image: await imageField('f535c.png', 'Пакування'),
      },
      {
        _key: key(),
        _type: 'step',
        title: 'Зберігаємо температуру',
        text: 'Кожну позицію пакуємо окремо, щоб зберегти свіжість, смак і захистити продукти в дорозі.',
        image: await imageField('29d1f.png', 'Температура'),
      },
      {
        _key: key(),
        _type: 'step',
        title: 'Передаємо в доставку',
        text: 'Надійно фіксуємо замовлення в коробці та передаємо перевізнику в день відправлення.',
        image: await imageField('5f9d4.png', 'Доставка'),
      },
    ],
    orderEyebrow: 'Оформлення',
    orderTitle: 'Замовити - просто',
    orderText:
      'Оберіть зручний спосіб — напишіть у месенджер, зателефонуйте або складіть кошик на сайті. Відправляємо по всій Україні Новою Поштою, у Києві — власним кур’єром.',
    orderImage: await imageField('33110.png', 'Maina by Rivka'),
  }

  const all = [...categoryDocs, ...productDocs, siteSettings, homePage]
  console.log(
    `Підготовлено: ${categoryDocs.length} категорій, ${productDocs.length} товарів, 2 сторінки.`,
  )
  if (DRY) return

  // Одна транзакція: або створюється все, або нічого. Id без «drafts.» = одразу опубліковано.
  const tx = client.transaction()
  for (const doc of all) tx.createOrReplace(doc)
  await tx.commit()
  console.log('Готово: усе створено й опубліковано.')
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
