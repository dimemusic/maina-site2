// Одноразово проставляє артикули MB-001, MB-002… товарам, у яких поля sku ще немає, і публікує зміни.
// Товари, що вже мають артикул (опублікований чи в чернетці), не чіпаються; нумерація продовжується після найбільшого наявного.
//
// Запуск (з папки studio-maina-site):
//   DRY=1 npx sanity exec scripts/add-sku.ts --with-user-token   — лише показати, що буде змінено
//   npx sanity exec scripts/add-sku.ts --with-user-token         — проставити й опублікувати
//
// Токен не потрібен у файлах: --with-user-token використовує вхід, зроблений через `sanity login`.
import {getCliClient} from 'sanity/cli'

type Doc = {_id: string; title?: string; sku?: string; order?: number}

const DRY = process.env.DRY === '1'
const client = getCliClient({apiVersion: '2025-02-19'})
const baseId = (id: string) => id.replace(/^drafts\./, '')

async function main() {
  // Усі версії товарів: опубліковані й чернетки
  const docs = await client.fetch<Doc[]>(
    '*[_type == "product"] | order(order asc, title asc) {_id, title, sku, order}',
  )

  const byBase = new Map<string, Doc[]>()
  for (const d of docs) byBase.set(baseId(d._id), [...(byBase.get(baseId(d._id)) ?? []), d])

  let max = 0
  for (const d of docs) {
    const m = /^MB-(\d+)$/.exec(d.sku ?? '')
    if (m) max = Math.max(max, Number(m[1]))
  }

  const todo = [...byBase.entries()].filter(([, versions]) => versions.every((v) => !v.sku))
  console.log(`Товарів: ${byBase.size}, без артикула: ${todo.length}, найбільший наявний номер: ${max}`)
  if (todo.length === 0) return

  const tx = client.transaction()
  for (const [id, versions] of todo) {
    const sku = `MB-${String(++max).padStart(3, '0')}`
    console.log(`  ${sku}  ${versions[0].title ?? id}${versions.length > 1 ? '  (+ чернетка)' : ''}`)
    // Патч опублікованого документа одразу публікує артикул; чернетку, якщо вона є, оновлюємо теж,
    // щоб її публікація не стерла артикул.
    for (const v of versions) tx.patch(v._id, {setIfMissing: {sku}})
  }

  if (DRY) {
    console.log('DRY=1: нічого не записано.')
    return
  }
  // Одна транзакція: або всі артикули проставляються, або жодного
  await tx.commit()
  console.log('Готово: артикули проставлено й опубліковано.')
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
