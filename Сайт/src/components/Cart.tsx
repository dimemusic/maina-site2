import { useEffect, useState, type FormEvent } from 'react'
import { PrimaryButton } from './Layout'
import { sized, useContent } from '../lib/content'
import { cartTotals, findOption, normalizePhone, promoDiscount, type Line } from '../lib/order-math.js'

export type { Line }

const F = "font-['Montserrat',sans-serif] wdth"
const INPUT = `${F} w-full rounded-[round(calc(var(--u)*8),4px)] border border-[#e6e6e6] px-[round(calc(var(--u)*16),4px)] py-[round(calc(var(--u)*12),4px)] text-[length:round(calc(var(--u)*16),2px)] text-[#3a4c38] outline-none transition-colors placeholder:text-[#b7b7b7] focus:border-[#3a4c38]`
const LABEL = `${F} mb-[calc(var(--u)*4)] block text-[length:round(calc(var(--u)*14),2px)] font-medium text-[#4c5147]`
const ERR = `${F} mt-[calc(var(--u)*4)] text-[length:round(calc(var(--u)*13),2px)] text-[#963c3c]`

type Step = 'cart' | 'checkout' | 'done'
type Errors = { name?: string; phone?: string; address?: string }

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
  const [step, setStep] = useState<Step>('cart')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [comment, setComment] = useState('')
  const [website, setWebsite] = useState('') // honeypot: люди його не бачать, боти заповнюють
  const [errors, setErrors] = useState<Errors>({})
  const [sending, setSending] = useState(false)
  const [serverError, setServerError] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const { byId: P, site } = useContent()
  const { saved, total } = cartTotals(lines, P)
  const count = lines.reduce((s, l) => s + l.qty, 0)
  const FREE = site.freeDeliveryFrom

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
    if (!open) setStep((s) => (s === 'done' ? 'cart' : s))
  }, [open])

  useEffect(() => {
    if (!open || lines.length === 0) setConfirmClear(false)
  }, [open, lines.length])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (sending || lines.length === 0) return
    const normalized = normalizePhone(phone)
    const errs: Errors = {}
    if (name.trim().length < 2) errs.name = 'Вкажіть ім’я'
    if (!normalized) errs.phone = 'Введіть номер у форматі +380 50 123 45 67 або 050 123 45 67'
    if (address.trim().length < 5) errs.address = 'Вкажіть місто та відділення Нової пошти'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSending(true)
    setServerError('')
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: normalized, address: address.trim(), comment: comment.trim(), website, lines }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Не вдалося надіслати замовлення. Спробуйте ще раз.')
      }
      // Очищаємо кошик лише після успішної відповіді сервера
      onClear()
      setName('')
      setPhone('')
      setAddress('')
      setComment('')
      setStep('done')
    } catch (err) {
      const offline = err instanceof TypeError // fetch кидає TypeError, коли немає зв’язку
      setServerError(offline ? 'Немає зв’язку із сервером. Перевірте інтернет і спробуйте ще раз — кошик збережено.' : (err as Error).message)
    } finally {
      setSending(false)
    }
  }

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

        {step === 'done' ? (
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
        ) : step === 'checkout' ? (
          <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-[round(calc(var(--u)*32),4px)] py-[round(calc(var(--u)*16),4px)]">
              <button type="button" onClick={() => setStep('cart')} className={`${F} mb-[round(calc(var(--u)*16),4px)] cursor-pointer text-[length:round(calc(var(--u)*14),2px)] text-[#929292] hover:text-[#3a4c38]`}>
                ← Назад до кошика
              </button>
              <h3 className="font-evo-bold mb-[round(calc(var(--u)*16),4px)] text-[length:round(calc(var(--u)*20),2px)] text-[#3a4c38]">Контактні дані</h3>
              <div className="flex flex-col gap-[round(calc(var(--u)*16),4px)]">
                <div>
                  <label htmlFor="o-name" className={LABEL}>Ім’я *</label>
                  <input id="o-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} autoComplete="name" placeholder="Олена" className={INPUT} />
                  {errors.name && <p className={ERR}>{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="o-phone" className={LABEL}>Телефон *</label>
                  <input id="o-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={25} autoComplete="tel" placeholder="+380 50 123 45 67" className={INPUT} />
                  {errors.phone && <p className={ERR}>{errors.phone}</p>}
                </div>
                <div>
                  <label htmlFor="o-address" className={LABEL}>Місто та відділення Нової пошти *</label>
                  <input id="o-address" value={address} onChange={(e) => setAddress(e.target.value)} maxLength={200} placeholder="Київ, відділення №12" className={INPUT} />
                  {errors.address && <p className={ERR}>{errors.address}</p>}
                </div>
                <div>
                  <label htmlFor="o-comment" className={LABEL}>Коментар</label>
                  <textarea id="o-comment" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} rows={3} placeholder="Побажання до замовлення (необов’язково)" className={`${INPUT} resize-none`} />
                </div>
                {/* Honeypot: невидиме для людей поле-пастка проти ботів */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label>
                    Не заповнюйте це поле
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                  </label>
                </div>
              </div>
            </div>
            <footer className="flex flex-col gap-[round(calc(var(--u)*16),4px)] border-t border-[#e9e9e9] px-[round(calc(var(--u)*32),4px)] py-[round(calc(var(--u)*24),4px)]">
              <div className="flex items-baseline justify-between">
                <span className="font-evo-bold text-[length:round(calc(var(--u)*20),2px)] text-[#3a4c38]">Разом</span>
                <span className={`${F} text-[length:round(calc(var(--u)*28),2px)] font-semibold text-[#b05a3f]`}>{total} ₴</span>
              </div>
              {serverError && (
                <p role="alert" className={`${F} rounded-[round(calc(var(--u)*8),4px)] border border-[#b05a3f] bg-[#b05a3f]/8 px-[round(calc(var(--u)*12),4px)] py-[round(calc(var(--u)*8),4px)] text-[length:round(calc(var(--u)*14),2px)] text-[#963c3c]`}>
                  {serverError}
                </p>
              )}
              <PrimaryButton type="submit" disabled={sending} className="max-w-none">
                {sending ? 'Надсилаємо…' : 'Підтвердити замовлення'}
              </PrimaryButton>
            </footer>
          </form>
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
                const o = findOption(p, l.opt)!
                const off = promoDiscount(p, l.opt, l.qty)
                const left = p.sale ? p.sale.every - (l.qty % p.sale.every) : 0
                return (
                  <li key={`${l.id}-${l.opt}`} className="animate-fade flex gap-[round(calc(var(--u)*16),4px)] border-b border-[#f0f0f0] py-[round(calc(var(--u)*16),4px)]">
                    <button onClick={() => onOpenProduct(l.id)} className="group size-[round(calc(var(--u)*88),4px)] shrink-0 cursor-pointer overflow-hidden rounded-[round(calc(var(--u)*8),4px)]">
                      <img alt={p.name} src={sized(p.img, 240)} className="size-full object-cover transition-transform duration-500 group-hover:scale-110" />
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
              {confirmClear ? (
                <div className="animate-fade flex flex-col gap-[round(calc(var(--u)*8),4px)]">
                  <p className={`${F} text-center text-[length:round(calc(var(--u)*14),2px)] leading-[round(calc(var(--u)*24),4px)] font-medium text-[#4c5147]`}>Очистити кошик?</p>
                  <div className="flex gap-[round(calc(var(--u)*8),4px)] pb-[round(calc(var(--u)*8),4px)]">
                    <button
                      onClick={() => {
                        setConfirmClear(false)
                        onClear()
                      }}
                      className={`${F} flex h-[round(calc(var(--u)*40),4px)] flex-1 cursor-pointer items-center justify-center rounded-[round(calc(var(--u)*8),4px)] border border-[#b05a3f] bg-[#b05a3f]/8 text-[length:round(calc(var(--u)*14),2px)] leading-[round(calc(var(--u)*16),4px)] font-semibold text-[#963c3c] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#b05a3f] hover:text-white hover:shadow-[0_10px_18px_-12px_rgba(150,60,60,0.8)] active:translate-y-0`}
                    >
                      Так, очистити
                    </button>
                    <button
                      onClick={() => setConfirmClear(false)}
                      className={`${F} flex h-[round(calc(var(--u)*40),4px)] flex-1 cursor-pointer items-center justify-center rounded-[round(calc(var(--u)*8),4px)] border border-[#e6e6e6] bg-white text-[length:round(calc(var(--u)*14),2px)] leading-[round(calc(var(--u)*16),4px)] font-semibold text-[#3a4c38] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#3a4c38] active:translate-y-0`}
                    >
                      Скасувати
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setConfirmClear(true)} className={`${F} flex h-[round(calc(var(--u)*40),4px)] w-full cursor-pointer items-center justify-center rounded-[round(calc(var(--u)*8),4px)] border border-[#b05a3f] bg-[#b05a3f]/8 text-[length:round(calc(var(--u)*14),2px)] leading-[round(calc(var(--u)*16),4px)] font-semibold text-[#963c3c] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#b05a3f] hover:text-white hover:shadow-[0_10px_18px_-12px_rgba(150,60,60,0.8)] active:translate-y-0`}>
                  Очистити кошик
                </button>
              )}
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
                  setServerError('')
                  setStep('checkout')
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
