// Shared between the React site and the serverless function api/order.js.
// Keep this file plain JS with no imports, so Vercel can bundle it into the function.

/** @typedef {{ label: string, price: number, note: string }} Option */
/** @typedef {{ short: string, text: string, every: number, off: number }} Promo */
/** @typedef {{ id: string, name: string, desc: string, opts: Option[], sale?: Promo }} CatalogItem */
/** @typedef {{ id: string, opt: number, qty: number }} Line */

/** @param {number} half @param {number} full @returns {Option[]} */
const kg = (half, full) => [
  { label: '0.5 кг', price: half, note: 'за 500 г' },
  { label: '1 кг', price: full, note: 'за 1 кг' },
]

/** @type {Record<string, CatalogItem>} */
export const CATALOG = {
  varenyky: { id: 'varenyky', name: 'Вареники з картоплею та грибами', desc: 'Ніжне тісто, картопля й обсмажені печериці — ліплені вручну, як удома.', opts: kg(145, 280) },
  kovbasa: { id: 'kovbasa', name: 'Сиров’ялена ковбаса', desc: 'Витримана й ароматна: добірне м’ясо, натуральні спеції та жодних консервантів.', opts: [{ label: '250 г', price: 215, note: 'за 250 г' }, { label: '500 г', price: 410, note: 'за 500 г' }], sale: { short: '2 + 1', text: 'Беріть 2 — третя в подарунок', every: 3, off: 1 } },
  khinkaliMeat: { id: 'khinkaliMeat', name: 'Хінкалі з м’ясом', desc: 'Соковита яловичина, запашна зелень і м’яке тісто — ситно та по-домашньому.', opts: kg(185, 355) },
  vyshnya: { id: 'vyshnya', name: 'Вареники з вишнею', desc: 'Тонке тісто, стигла вишня та трішки цукру — яскравий смак у кожному варенику.', opts: kg(155, 295) },
  khlib: { id: 'khlib', name: 'Домашній хліб', desc: 'Рум’яна скоринка, пухкий м’якуш і аромат закваски — випікаємо невеликими партіями.', opts: [{ label: '1 шт', price: 85, note: 'за 1 шт' }, { label: '2 шт', price: 160, note: 'за 2 шт' }] },
  khinkaliCheese: { id: 'khinkaliCheese', name: 'Хінкалі з сиром', desc: 'Тягучий сулугуні та бринза в ніжному тісті — вершкова начинка з легкою солонуватістю.', opts: kg(175, 335) },
  pelmeni: { id: 'pelmeni', name: 'Пельмені з м’ясом', desc: 'Соковита яловичина й свинина, цибуля та делікатні спеції — просто й дуже смачно.', opts: kg(169, 320) },
  syr: { id: 'syr', name: 'Крафтовий сир', desc: 'Добірне молоко, витримка й ніжний вершковий післясмак — для сніданків і винних вечорів.', opts: [{ label: '200 г', price: 195, note: 'за 200 г' }, { label: '400 г', price: 370, note: 'за 400 г' }], sale: { short: '−50%', text: 'Другий сир за пів ціни', every: 2, off: 0.5 } },
  cinnabon: { id: 'cinnabon', name: 'Булочки з корицею', desc: 'Пухке здобне тісто, щедра кориця та вершковий крем, що тане в кожному завитку.', opts: [{ label: '1 шт', price: 65, note: 'за 1 шт' }, { label: '4 шт', price: 240, note: 'за 4 шт' }] },
  syrnyky: { id: 'syrnyky', name: 'Сирники домашні', desc: 'Ніжний фермерський сир, ваніль і золотиста скоринка — ідеальні до ранкової кави.', opts: [{ label: '0.5 кг', price: 210, note: 'за 500 г' }, { label: '1 кг', price: 399, note: 'за 1 кг' }] },
  strudel: { id: 'strudel', name: 'Яблучний штрудель', desc: 'Тонке хрустке тісто, соковиті яблука, родзинки та кориця — класика для затишного чаювання.', opts: [{ label: '1 шт', price: 245, note: 'за 1 шт' }, { label: '2 шт', price: 470, note: 'за 2 шт' }] },
}

export const FREE_DELIVERY = 1500
export const MAX_QTY = 99

// every Nth unit of the same pack gets `off` (0–1) discount
/** @param {CatalogItem} p @param {number} opt @param {number} qty */
export const promoDiscount = (p, opt, qty) => (p.sale ? Math.floor(qty / p.sale.every) * p.opts[opt].price * p.sale.off : 0)

/**
 * Drops cart lines that point to products/options which no longer exist
 * (e.g. an old cart saved in localStorage) or have a broken quantity.
 * @param {unknown} raw
 * @returns {Line[]}
 */
export function sanitizeLines(raw) {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((l) => {
    const p = l && typeof l.id === 'string' && Object.prototype.hasOwnProperty.call(CATALOG, l.id) ? CATALOG[l.id] : null
    if (!p || !Number.isInteger(l.opt) || !p.opts[l.opt] || !Number.isInteger(l.qty) || l.qty < 1) return []
    return [{ id: l.id, opt: l.opt, qty: Math.min(l.qty, MAX_QTY) }]
  })
}

/** @param {Line[]} lines */
export function cartTotals(lines) {
  const gross = lines.reduce((s, l) => s + CATALOG[l.id].opts[l.opt].price * l.qty, 0)
  const saved = lines.reduce((s, l) => s + promoDiscount(CATALOG[l.id], l.opt, l.qty), 0)
  return { gross, saved, total: gross - saved }
}

/**
 * Accepts Ukrainian mobile numbers in any common spelling
 * (+380 50 123 45 67, 380501234567, 050-123-45-67, (050) 123 4567)
 * and returns "+380501234567", or null if it is not a valid number.
 * @param {unknown} input
 */
export function normalizePhone(input) {
  if (typeof input !== 'string' || /[^\d\s()+-]/.test(input)) return null
  const digits = input.replace(/\D/g, '')
  if (/^380\d{9}$/.test(digits)) return '+' + digits
  if (/^0\d{9}$/.test(digits)) return '+38' + digits
  return null
}
