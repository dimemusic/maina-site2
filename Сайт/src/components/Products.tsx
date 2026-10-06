import { useState } from 'react'
import { sized, type Product } from '../lib/content'
import type { Promo } from '../lib/order-math.js'

// Товари, ціни й акції приходять із Sanity (src/lib/content.tsx), тут лише картки.

/* Home "Хіти продажів" card */
export function HitCard({ p, onOpen }: { p: Product; onOpen: () => void }) {
  return (
    <article onClick={onOpen} className="group flex min-h-[round(calc(var(--u)*368),4px)] cursor-pointer flex-col gap-[round(calc(var(--u)*8),4px)] rounded-t-[round(calc(var(--u)*8),4px)] border-b border-[#3a4c38] pb-[round(calc(var(--u)*16),4px)] transition-transform duration-500 ease-out hover:-translate-y-1.5">
      <div className="relative isolate h-[round(calc(var(--u)*179),4px)] w-full overflow-hidden rounded-t-[round(calc(var(--u)*8),4px)] [contain:paint]">
        <img alt={p.name} src={sized(p.img, 640)} loading="lazy" className="size-full transform-gpu object-cover [backface-visibility:hidden] transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.08]" />
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
export function MenuCard({ p, onOpen, onAdd }: { p: Product; onOpen: () => void; onAdd: (id: string, opt: string) => void }) {
  const [sel, setSel] = useState(0)
  const opt = p.opts[sel]
  const [added, setAdded] = useState(false)
  return (
    <article onClick={onOpen} className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-[round(calc(var(--u)*8),4px)] border border-[rgba(58,76,56,0.1)] bg-white transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-[rgba(58,76,56,0.25)] hover:shadow-[0_22px_40px_-24px_rgba(38,51,37,0.55)]">
      <div className="relative h-[round(calc(var(--u)*166),4px)] w-full overflow-hidden">
        <img alt={p.name} src={sized(p.img, 640)} loading="lazy" className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]" />
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
              onAdd(p.id, opt.key)
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
