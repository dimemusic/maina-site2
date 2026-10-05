import { useEffect, useState } from 'react'
import { PrimaryButton } from './Layout'
import { P, promoDiscount } from './Products'

export type Line = { id: string; opt: number; qty: number }

const F = "font-['Montserrat',sans-serif] wdth"

export default function Cart({
  open,
  lines,
  onClose,
  setQty,
  onOpenProduct,
  onClear,
}: {
  open: boolean
  lines: Line[]
  onClose: () => void
  setQty: (i: number, qty: number) => void
  onOpenProduct: (id: string) => void
  onClear: () => void
}) {
  const [done, setDone] = useState(false)
  const gross = lines.reduce((s, l) => s + P[l.id].opts[l.opt].price * l.qty, 0)
  const saved = lines.reduce((s, l) => s + promoDiscount(P[l.id], l.opt, l.qty), 0)
  const total = gross - saved
  const count = lines.reduce((s, l) => s + l.qty, 0)
  const FREE = 1500

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) setDone(false)
  }, [open])

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div onClick={onClose} className={`absolute inset-0 bg-[#1f2a1e]/40 backdrop-blur-[2px] transition-opacity duration-500 ${open ? 'opacity-100' : 'opacity-0'}`} />
      <aside
        role="dialog"
        aria-label="Кошик"
        className={`absolute top-0 right-0 flex h-full w-full max-w-[round(calc(var(--u)*464),4px)] flex-col bg-white shadow-[-24px_0_60px_-30px_rgba(38,51,37,0.5)] transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <header className="flex items-center justify-between border-b border-[#e9e9e9] px-[round(calc(var(--u)*32),4px)] py-[round(calc(var(--u)*24),4px)]">
          <div className="flex items-baseline gap-[round(calc(var(--u)*8),4px)]">
            <h2 className="font-evo-bold text-[length:round(calc(var(--u)*32),2px)] leading-[round(calc(var(--u)*40),4px)] text-[#3a4c38]">Кошик</h2>
            {count > 0 && <span className={`${F} text-[length:round(calc(var(--u)*14),2px)] text-[#929292]`}>{count} шт</span>}
          </div>
          <button onClick={onClose} aria-label="Закрити" className="flex size-[round(calc(var(--u)*40),4px)] cursor-pointer items-center justify-center rounded-full border border-[#e6e6e6] text-[#3a4c38] transition-all duration-300 hover:rotate-90 hover:border-[#3a4c38]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 3l10 10M13 3L3 13" /></svg>
          </button>
        </header>

        {done ? (
          <div className="animate-fade flex flex-1 flex-col items-center justify-center gap-[round(calc(var(--u)*16),4px)] px-[round(calc(var(--u)*32),4px)] text-center">
            <div className="flex size-[round(calc(var(--u)*72),4px)] items-center justify-center rounded-full bg-[#3a4c38] text-white">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            </div>
            <h3 className="font-evo-bold text-[length:round(calc(var(--u)*24),2px)] leading-[round(calc(var(--u)*32),4px)] text-[#3a4c38]">Дякуємо за замовлення!</h3>
            <p className={`${F} max-w-[round(calc(var(--u)*320),4px)] text-[length:round(calc(var(--u)*16),2px)] leading-[round(calc(var(--u)*24),4px)] text-[#4c5147]`}>Ми зателефонуємо протягом 15 хвилин, щоб підтвердити деталі та доставку.</p>
            <PrimaryButton className="mt-[round(calc(var(--u)*8),4px)] max-w-[round(calc(var(--u)*240),4px)]" onClick={onClose}>Продовжити покупки</PrimaryButton>
          </div>
        ) : lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-[round(calc(var(--u)*16),4px)] px-[round(calc(var(--u)*32),4px)] text-center">
            <p className="font-evo-bold text-[length:round(calc(var(--u)*24),2px)] leading-[round(calc(var(--u)*32),4px)] text-[#3a4c38]">Кошик порожній</p>
            <p className={`${F} text-[length:round(calc(var(--u)*16),2px)] leading-[round(calc(var(--u)*24),4px)] text-[#929292]`}>Додайте щось смачне з нашого меню</p>
            <PrimaryButton className="mt-[round(calc(var(--u)*8),4px)] max-w-[round(calc(var(--u)*240),4px)]" onClick={onClose}>До меню</PrimaryButton>
          </div>
        ) : (
          <>
            <div className="border-b border-[#e9e9e9] px-[round(calc(var(--u)*32),4px)] py-[round(calc(var(--u)*16),4px)]">
              <p className={`${F} text-[length:round(calc(var(--u)*14),2px)] leading-[round(calc(var(--u)*24),4px)] text-[#4c5147]`}>
                {total >= FREE ? 'Безкоштовна доставка вже ваша 🎉' : <>До безкоштовної доставки ще <b className="font-semibold text-[#b05a3f]">{FREE - total} ₴</b></>}
              </p>
              <div className="mt-[round(calc(var(--u)*8),4px)] h-[calc(var(--u)*4)] overflow-hidden rounded-full bg-[#eef0ec]">
                <div className="h-full rounded-full bg-[#3a4c38] transition-[width] duration-700 ease-out" style={{ width: `${Math.min(100, (total / FREE) * 100)}%` }} />
              </div>
            </div>

            <ul className="flex-1 overflow-y-auto px-[round(calc(var(--u)*32),4px)]">
              {lines.map((l, i) => {
                const p = P[l.id]
                const o = p.opts[l.opt]
                const off = promoDiscount(p, l.opt, l.qty)
                const left = p.sale ? p.sale.every - (l.qty % p.sale.every) : 0
                return (
                  <li key={`${l.id}-${l.opt}`} className="animate-fade flex gap-[round(calc(var(--u)*16),4px)] border-b border-[#f0f0f0] py-[round(calc(var(--u)*16),4px)]">
                    <button onClick={() => onOpenProduct(l.id)} className="group size-[round(calc(var(--u)*88),4px)] shrink-0 cursor-pointer overflow-hidden rounded-[round(calc(var(--u)*8),4px)]">
                      <img alt={p.name} src={p.img} className="size-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </button>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-[round(calc(var(--u)*8),4px)]">
                        <button onClick={() => onOpenProduct(l.id)} className="font-evo-bold cursor-pointer text-left text-[length:round(calc(var(--u)*16),2px)] leading-[round(calc(var(--u)*24),4px)] text-[#3a4c38] hover:underline">{p.name}</button>
                        <button onClick={() => setQty(i, 0)} aria-label="Видалити" className="cursor-pointer p-[calc(var(--u)*4)] text-[#b7b7b7] transition-colors hover:text-[#b05a3f]">
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 3l10 10M13 3L3 13" /></svg>
                        </button>
                      </div>
                      <p className={`${F} text-[length:round(calc(var(--u)*14),2px)] leading-[round(calc(var(--u)*24),4px)] text-[#929292]`}>{o.label}</p>
                      {p.sale && (
                        <p className={`${F} mb-[round(calc(var(--u)*8),4px)] text-[length:round(calc(var(--u)*13),2px)] leading-[round(calc(var(--u)*16),4px)] font-medium text-[#b05a3f]`}>
                          🎁 {off > 0 ? `Акція застосована: −${off} ₴` : `${p.sale.text} · додайте ще ${left}`}
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex h-[round(calc(var(--u)*32),4px)] items-center rounded-full border border-[#e6e6e6]">
                          {[-1, 1].map((d) => (
                            <button
                              key={d}
                              onClick={() => setQty(i, l.qty + d)}
                              aria-label={d < 0 ? 'Менше' : 'Більше'}
                              className={`flex size-[round(calc(var(--u)*32),4px)] cursor-pointer items-center justify-center rounded-full text-[#3a4c38] transition-colors hover:bg-[#3a4c38]/8 ${d > 0 ? 'order-3' : ''}`}
                            >
                              {d < 0 ? '−' : '+'}
                            </button>
                          ))}
                          <span className={`${F} order-2 w-[round(calc(var(--u)*24),4px)] text-center text-[length:round(calc(var(--u)*14),2px)] font-semibold text-[#3a4c38]`}>{l.qty}</span>
                        </div>
                        <p className={`${F} text-[length:round(calc(var(--u)*18),2px)] font-semibold text-[#b05a3f]`}>
                          {off > 0 && <s className="mr-[round(calc(var(--u)*8),4px)] text-[length:round(calc(var(--u)*14),2px)] font-normal text-[#b7b7b7]">{o.price * l.qty} ₴</s>}
                          {o.price * l.qty - off} ₴
                        </p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>

            <div className="px-[round(calc(var(--u)*32),4px)] pb-[round(calc(var(--u)*16),4px)]">
              <button onClick={onClear} className={`${F} flex h-[round(calc(var(--u)*40),4px)] w-full cursor-pointer items-center justify-center rounded-[round(calc(var(--u)*8),4px)] border border-[#b05a3f] bg-[#b05a3f]/8 text-[length:round(calc(var(--u)*14),2px)] leading-[round(calc(var(--u)*16),4px)] font-semibold text-[#963c3c] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#b05a3f] hover:text-white hover:shadow-[0_10px_18px_-12px_rgba(150,60,60,0.8)] active:translate-y-0`}>
                Очистити кошик
              </button>
            </div>

            <footer className="flex flex-col gap-[round(calc(var(--u)*16),4px)] border-t border-[#e9e9e9] px-[round(calc(var(--u)*32),4px)] py-[round(calc(var(--u)*24),4px)]">
              <div className={`${F} flex items-center justify-between text-[length:round(calc(var(--u)*14),2px)] text-[#929292]`}>
                <span>Доставка</span>
                <span>{total >= FREE ? 'Безкоштовно' : 'За тарифами перевізника'}</span>
              </div>
              {saved > 0 && (
                <div className={`${F} flex items-center justify-between text-[length:round(calc(var(--u)*14),2px)] font-semibold text-[#b05a3f]`}>
                  <span>Знижка за акціями</span>
                  <span>−{saved} ₴</span>
                </div>
              )}
              <div className="flex items-baseline justify-between">
                <span className="font-evo-bold text-[length:round(calc(var(--u)*20),2px)] text-[#3a4c38]">Разом</span>
                <span key={total} className={`${F} animate-fade text-[length:round(calc(var(--u)*32),2px)] leading-[round(calc(var(--u)*40),4px)] font-semibold text-[#b05a3f]`}>{total} ₴</span>
              </div>
              <PrimaryButton
                className="max-w-none"
                onClick={() => {
                  setDone(true)
                  onClear()
                }}
              >
                Оформити замовлення
              </PrimaryButton>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}
