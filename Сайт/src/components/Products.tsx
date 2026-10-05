import { useState } from 'react'
import { A } from './Layout'

export type Option = { label: string; price: number; note: string }
export type Product = { id: string; name: string; desc: string; img: string; opts: Option[]; sale?: Promo }
export type Promo = { short: string; text: string; every: number; off: number }

// every Nth unit of the same pack gets `off` (0–1) discount
export const promoDiscount = (p: Product, opt: number, qty: number) => (p.sale ? Math.floor(qty / p.sale.every) * p.opts[opt].price * p.sale.off : 0)

const kg = (half: number, full: number): Option[] => [
  { label: '0.5 кг', price: half, note: 'за 500 г' },
  { label: '1 кг', price: full, note: 'за 1 кг' },
]

export const P: Record<string, Product> = {
  varenyky: { id: 'varenyky', name: 'Вареники з картоплею та грибами', desc: 'Ніжне тісто, картопля й обсмажені печериці — ліплені вручну, як удома.', img: `${A}/b8623.png`, opts: kg(145, 280) },
  kovbasa: { id: 'kovbasa', name: 'Сиров’ялена ковбаса', desc: 'Витримана й ароматна: добірне м’ясо, натуральні спеції та жодних консервантів.', img: `${A}/40cdf.png`, opts: [{ label: '250 г', price: 215, note: 'за 250 г' }, { label: '500 г', price: 410, note: 'за 500 г' }], sale: { short: '2 + 1', text: 'Беріть 2 — третя в подарунок', every: 3, off: 1 } },
  khinkaliMeat: { id: 'khinkaliMeat', name: 'Хінкалі з м’ясом', desc: 'Соковита яловичина, запашна зелень і м’яке тісто — ситно та по-домашньому.', img: `${A}/e8c65.png`, opts: kg(185, 355) },
  vyshnya: { id: 'vyshnya', name: 'Вареники з вишнею', desc: 'Тонке тісто, стигла вишня та трішки цукру — яскравий смак у кожному варенику.', img: `${A}/9f603.png`, opts: kg(155, 295) },
  khlib: { id: 'khlib', name: 'Домашній хліб', desc: 'Рум’яна скоринка, пухкий м’якуш і аромат закваски — випікаємо невеликими партіями.', img: `${A}/1835a.png`, opts: [{ label: '1 шт', price: 85, note: 'за 1 шт' }, { label: '2 шт', price: 160, note: 'за 2 шт' }] },
  khinkaliCheese: { id: 'khinkaliCheese', name: 'Хінкалі з сиром', desc: 'Тягучий сулугуні та бринза в ніжному тісті — вершкова начинка з легкою солонуватістю.', img: `${A}/50585.png`, opts: kg(175, 335) },
  pelmeni: { id: 'pelmeni', name: 'Пельмені з м’ясом', desc: 'Соковита яловичина й свинина, цибуля та делікатні спеції — просто й дуже смачно.', img: `${A}/1bf7b.png`, opts: kg(169, 320) },
  syr: { id: 'syr', name: 'Крафтовий сир', desc: 'Добірне молоко, витримка й ніжний вершковий післясмак — для сніданків і винних вечорів.', img: `${A}/9e5d6.png`, opts: [{ label: '200 г', price: 195, note: 'за 200 г' }, { label: '400 г', price: 370, note: 'за 400 г' }], sale: { short: '−50%', text: 'Другий сир за пів ціни', every: 2, off: 0.5 } },
  cinnabon: { id: 'cinnabon', name: 'Булочки з корицею', desc: 'Пухке здобне тісто, щедра кориця та вершковий крем, що тане в кожному завитку.', img: 'https://images.unsplash.com/photo-1694632288834-17d86b340745?auto=format&fit=crop&w=1080&q=80', opts: [{ label: '1 шт', price: 65, note: 'за 1 шт' }, { label: '4 шт', price: 240, note: 'за 4 шт' }] },
  syrnyky: { id: 'syrnyky', name: 'Сирники домашні', desc: 'Ніжний фермерський сир, ваніль і золотиста скоринка — ідеальні до ранкової кави.', img: 'https://images.unsplash.com/photo-1681760161787-858b651df036?auto=format&fit=crop&w=1080&q=80', opts: [{ label: '0.5 кг', price: 210, note: 'за 500 г' }, { label: '1 кг', price: 399, note: 'за 1 кг' }] },
  strudel: { id: 'strudel', name: 'Яблучний штрудель', desc: 'Тонке хрустке тісто, соковиті яблука, родзинки та кориця — класика для затишного чаювання.', img: 'https://images.unsplash.com/photo-1657313938000-23c4322dbe22?auto=format&fit=crop&w=1080&q=80', opts: [{ label: '1 шт', price: 245, note: 'за 1 шт' }, { label: '2 шт', price: 470, note: 'за 2 шт' }] },
}

/* Home "Хіти продажів" card */
export function HitCard({ p, onOpen }: { p: Product; onOpen: () => void }) {
  return (
    <article onClick={onOpen} className="group flex min-h-[round(calc(var(--u)*368),4px)] cursor-pointer flex-col gap-[round(calc(var(--u)*8),4px)] rounded-t-[round(calc(var(--u)*8),4px)] border-b border-[#3a4c38] pb-[round(calc(var(--u)*16),4px)] transition-transform duration-500 ease-out hover:-translate-y-1.5">
      <div className="relative isolate h-[round(calc(var(--u)*179),4px)] w-full overflow-hidden rounded-t-[round(calc(var(--u)*8),4px)] [contain:paint]">
        <img alt={p.name} src={p.img} className="size-full transform-gpu object-cover [backface-visibility:hidden] transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.08]" />
        {p.sale && <SaleBadge promo={p.sale} />}
        <div className="absolute inset-0 bg-[#3a4c38]/0 transition-colors duration-500 group-hover:bg-[#3a4c38]/10" />
      </div>
      <div className="flex h-[round(calc(var(--u)*88),4px)] overflow-hidden flex-col gap-[round(calc(var(--u)*8),4px)]">
        <p className="font-evo-bold text-[length:round(calc(var(--u)*16),2px)] leading-[round(calc(var(--u)*24),4px)] line-clamp-2 text-[#3a4c38]">{p.name}</p>
        <p className="font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*14),2px)] leading-[round(calc(var(--u)*16),4px)] font-normal line-clamp-2 text-[#929292]">{p.desc}</p>
      </div>
      <div className="flex flex-1 items-end gap-[round(calc(var(--u)*8),4px)] whitespace-nowrap">
        <p className="font-evo-bold text-[length:round(calc(var(--u)*20),2px)] leading-[round(calc(var(--u)*32),4px)] text-[#963c3c]">{p.opts[0].price} ₴</p>
        <p className="font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*12),2px)] leading-[round(calc(var(--u)*16),4px)] font-normal text-[#9c9c9c]">{p.opts[0].note}</p>
      </div>
      <div className="flex h-[round(calc(var(--u)*40),4px)] w-full items-center justify-center rounded-[round(calc(var(--u)*8),4px)] border border-[#e6e6e6] p-[round(calc(var(--u)*8),4px)] transition-all duration-300 group-hover:border-[#3a4c38] group-hover:bg-[#3a4c38]">
        <p className="font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*14),2px)] leading-[round(calc(var(--u)*16),4px)] font-semibold text-[#3a4c38] transition-colors duration-300 group-hover:text-white">Переглянути</p>
      </div>
    </article>
  )
}

/* Menu / related card with weight toggle */
export function MenuCard({ p, onOpen, onAdd }: { p: Product; onOpen: () => void; onAdd: (id: string, opt: number) => void }) {
  const [sel, setSel] = useState(0)
  const opt = p.opts[sel]
  const [added, setAdded] = useState(false)
  return (
    <article onClick={onOpen} className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-[round(calc(var(--u)*8),4px)] border border-[rgba(58,76,56,0.1)] bg-white transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-[rgba(58,76,56,0.25)] hover:shadow-[0_22px_40px_-24px_rgba(38,51,37,0.55)]">
      <div className="relative h-[round(calc(var(--u)*166),4px)] w-full overflow-hidden">
        <img alt={p.name} src={p.img} className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]" />
        {p.sale && <SaleBadge promo={p.sale} />}
      </div>
      <div className="flex flex-1 flex-col gap-[round(calc(var(--u)*16),4px)] p-[round(calc(var(--u)*16),4px)]">
        <div className="flex flex-1 flex-col gap-[round(calc(var(--u)*16),4px)]">
          <div className="flex h-[round(calc(var(--u)*88),4px)] flex-col gap-[round(calc(var(--u)*8),4px)]">
            <p className="font-evo-bold text-[length:round(calc(var(--u)*16),2px)] leading-[round(calc(var(--u)*24),4px)] line-clamp-2 text-[#3a4c38]">{p.name}</p>
            <p className="font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*14),2px)] leading-[round(calc(var(--u)*16),4px)] font-normal line-clamp-2 text-[#929292]">{p.desc}</p>
          </div>
          <div className="flex gap-[round(calc(var(--u)*8),4px)]" onClick={(e) => e.stopPropagation()}>
            {p.opts.map((o, i) => {
              const on = sel === i
              return (
                <button
                  key={o.label}
                  onClick={() => setSel(i)}
                  className={`flex h-[round(calc(var(--u)*28),4px)] w-[round(calc(var(--u)*64),4px)] cursor-pointer items-center justify-center rounded-[round(calc(var(--u)*37),4px)] border px-[round(calc(var(--u)*8),4px)] text-[length:round(calc(var(--u)*12),2px)] leading-[round(calc(var(--u)*16),4px)] whitespace-nowrap transition-all duration-300 ${
                    on
                      ? "border-[#3a4c38] bg-[#3a4c38] font-['Montserrat',sans-serif] font-medium text-white"
                      : "border-[#b2b2b2] font-['Montserrat',sans-serif] font-normal text-[#b2b2b2] hover:border-[#3a4c38] hover:text-[#3a4c38]"
                  } wdth`}
                >
                  {o.label}
                </button>
              )
            })}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-[rgba(51,68,49,0.1)] pt-[round(calc(var(--u)*8),4px)]">
          <div className="flex flex-col">
            <p className="font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*20),2px)] leading-[round(calc(var(--u)*24),4px)] font-semibold whitespace-nowrap text-[#b05a3f]">
              {opt.price} ₴
            </p>
            <p className="font-['Montserrat',sans-serif] wdth pt-[round(calc(var(--u)*8),4px)] text-[length:round(calc(var(--u)*12),2px)] leading-[round(calc(var(--u)*16),4px)] font-normal text-[#999]">{opt.note}</p>
          </div>
          <button
            aria-label={`Замовити: ${p.name}`}
            aria-disabled={added}
            onClick={(e) => {
              e.stopPropagation()
              if (added) return
              onAdd(p.id, sel)
              setAdded(true)
              setTimeout(() => setAdded(false), 1200)
            }}
            className={`relative flex size-[round(calc(var(--u)*40),4px)] items-center justify-center rounded-full text-white transition-all duration-300 ${added ? 'cursor-default scale-110 bg-[#5a8a4e] shadow-[0_6px_16px_-6px_rgba(90,138,78,0.7)]' : 'cursor-pointer bg-[#334431] hover:scale-110 hover:rotate-90 active:scale-95'}`}
          >
            <span className={`font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*24),2px)] leading-none font-normal transition-all duration-300 ${added ? 'scale-50 rotate-90 opacity-0' : ''}`}>+</span>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={`absolute size-[round(calc(var(--u)*20),4px)] transition-all duration-300 ${added ? 'scale-100 opacity-100' : 'scale-50 -rotate-45 opacity-0'}`}>
              <path d="m5 12.5 4.5 4.5L19 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  )
}

function SaleBadge({ promo }: { promo: Promo }) {
  return (
    <>
    <span className="font-['Montserrat',sans-serif] wdth absolute top-[round(calc(var(--u)*12),4px)] left-[round(calc(var(--u)*12),4px)] z-10 inline-flex h-[round(calc(var(--u)*28),4px)] -rotate-3 items-center rounded-full bg-[#b05a3f] px-[round(calc(var(--u)*12),4px)] text-[length:round(calc(var(--u)*12),2px)] leading-[round(calc(var(--u)*16),4px)] font-semibold tracking-[calc(var(--u)*1)] text-white uppercase shadow-[0_6px_14px_-6px_rgba(120,40,20,0.6)] transition-transform duration-300 group-hover:rotate-0 group-hover:scale-105">
      Акція · {promo.short}
    </span>
    <span className="font-['Montserrat',sans-serif] wdth absolute inset-x-0 bottom-0 z-10 flex items-center gap-[round(calc(var(--u)*8),4px)] bg-[#b05a3f]/92 px-[round(calc(var(--u)*12),4px)] py-[calc(var(--u)*6)] text-[length:round(calc(var(--u)*13),2px)] leading-[round(calc(var(--u)*20),4px)] font-semibold text-white backdrop-blur-sm">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z" /></svg>
      {promo.text}
    </span>
    </>
  )
}
