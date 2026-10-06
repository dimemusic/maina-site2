// Логіка кошика, спільна для сайту (src/) і серверної функції api/order.js.
// Без імпортів і без даних: каталог (товари з Sanity) завжди передається параметром,
// тож сайт і сервер рахують однаково, але кожен зі своїми, свіжими цінами.

/** @typedef {{ key: string, label: string, price: number, note: string }} Option */
/** @typedef {{ short: string, text: string, every: number, off: number }} Promo */
/** @typedef {{ id: string, name: string, opts: Option[], sale?: Promo | null }} CatalogItem */
/** @typedef {Record<string, CatalogItem>} Catalog */
/** @typedef {{ id: string, opt: string, qty: number }} Line */

export const MAX_QTY = 99

/** @param {CatalogItem} p @param {string} key @returns {Option | undefined} */
export const findOption = (p, key) => p.opts.find((o) => o.key === key)

// every Nth unit of the same pack gets `off` (0–1) discount
/** @param {CatalogItem} p @param {string} optKey @param {number} qty */
export function promoDiscount(p, optKey, qty) {
  const o = findOption(p, optKey)
  return p.sale && o ? Math.floor(qty / p.sale.every) * o.price * p.sale.off : 0
}

/**
 * Drops cart lines that point to products/options which no longer exist
 * (e.g. an old cart saved in localStorage) or have a broken quantity.
 * @param {unknown} raw
 * @param {Catalog} catalog
 * @returns {Line[]}
 */
export function sanitizeLines(raw, catalog) {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((l) => {
    const p = l && typeof l.id === 'string' && Object.prototype.hasOwnProperty.call(catalog, l.id) ? catalog[l.id] : null
    if (!p || typeof l.opt !== 'string' || !findOption(p, l.opt) || !Number.isInteger(l.qty) || l.qty < 1) return []
    return [{ id: l.id, opt: l.opt, qty: Math.min(l.qty, MAX_QTY) }]
  })
}

/** @param {Line[]} lines @param {Catalog} catalog */
export function cartTotals(lines, catalog) {
  const gross = lines.reduce((s, l) => s + (findOption(catalog[l.id], l.opt)?.price ?? 0) * l.qty, 0)
  const saved = lines.reduce((s, l) => s + promoDiscount(catalog[l.id], l.opt, l.qty), 0)
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
