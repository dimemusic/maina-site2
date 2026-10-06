import { useEffect, useState, type ReactNode } from 'react'

export const A = '/assets'

export type Page = 'home' | 'menu' | 'product'

export function Monogram({ light = false, onClick }: { light?: boolean; onClick?: () => void }) {
  const color = light ? 'text-white' : 'text-[#3a4c38]'
  return (
    <button onClick={onClick} className="group flex h-[round(calc(var(--u)*40),4px)] cursor-pointer flex-col items-start text-left">
      <span className={`font-['Fraunces:SemiBold_Italic'] wonk font-medium italic leading-[round(calc(var(--u)*24),4px)] ${color} text-[length:round(calc(var(--u)*24),2px)] tracking-[calc(var(--u)*-0.5)] whitespace-nowrap transition-transform duration-300 group-hover:-rotate-2`}>
        Maina
      </span>
      <span className={`font-['Montserrat',sans-serif] wdth h-[round(calc(var(--u)*9.281),4px)] font-normal leading-[round(calc(var(--u)*8),4px)] opacity-70 ${color} text-[length:round(calc(var(--u)*12),2px)] tracking-[calc(var(--u)*4)] uppercase whitespace-nowrap transition-[letter-spacing] duration-300 group-hover:tracking-[calc(var(--u)*5)]`}>
        by Rivka
      </span>
    </button>
  )
}

function scrollToContacts(go?: (p: Page) => void) {
  const order = document.getElementById('order')
  const prev = order?.previousElementSibling
  if (!prev) {
    if (!go) return document.getElementById('contacts')?.scrollIntoView({ behavior: 'smooth' })
    go('home')
    let tries = 0
    const wait = () => (document.getElementById('order') ? scrollToContacts() : ++tries < 30 && requestAnimationFrame(wait))
    return void requestAnimationFrame(wait)
  }
  const header = document.querySelector('header')?.getBoundingClientRect().height ?? 0
  window.scrollTo({ top: prev.getBoundingClientRect().bottom + window.scrollY - header, behavior: 'smooth' })
}

const NAV = ['Асортимент', 'Про нас', 'Замовлення', 'Контакти']

const SOCIALS = [
  ['Instagram', 'https://instagram.com/maina.by.rivka', <><rect key="a" x="3" y="3" width="18" height="18" rx="5" /><circle key="b" cx="12" cy="12" r="4" /><circle key="c" cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></>],
  ['Telegram', 'https://t.me/', <path key="a" d="M21 4 3 11l6 2.5M21 4l-3 16-9-6.5M21 4 9 13.5V19l3-3.5" />],
  ['Viber', 'viber://chat?number=%2B380670000000', <path key="a" d="M12 3c-5 0-8 2.5-8 7.5 0 3 1 5 3 6.2V21l3-2.6c.6.1 1.3.1 2 .1 5 0 8-2.5 8-7.5S17 3 12 3Zm-2.5 5c.6 1.8 2.2 3.6 4.5 4.6l1-.9 1.5.8c-.3 1-1 1.5-2 1.4-3-.6-5.5-3.2-6-6 0-1 .6-1.7 1.5-1.9l.8 1.5Z" />],
] as const

function MobileMenu({ open, close, go, cart, onCart }: { open: boolean; close: () => void; go: (p: Page) => void; cart: number; onCart: () => void }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => void (document.body.style.overflow = '')
  }, [open])
  const pick = (i: number) => {
    close()
    if (i === 3) setTimeout(() => scrollToContacts(go), 50)
    else go(i === 0 ? 'menu' : 'home')
  }
  return (
    <div className={`fixed inset-0 z-50 flex flex-col bg-[#faf6ec] transition-all duration-400 ease-out md:hidden ${open ? 'visible opacity-100' : 'invisible -translate-y-3 opacity-0'}`} aria-hidden={!open}>
      <div className="flex h-[round(calc(var(--u)*60),4px)] items-center gap-3 border-b border-dashed border-[#3a4c38]/25 px-4 sm:px-6">
        <div className="flex-1">
          <Monogram onClick={() => (close(), go('home'))} />
        </div>
        <button onClick={() => (close(), onCart())} aria-label="Відкрити кошик" className="relative flex size-10 cursor-pointer items-center justify-center">
          <img alt="" src={`${A}/79452.svg`} width={24} height={24} className="size-6" />
          {cart > 0 && <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-[#b05a3f] text-[12px] font-semibold text-white">{cart}</span>}
        </button>
        <span className="h-6 w-px bg-[#3a4c38]/20" />
        <button onClick={close} aria-label="Закрити меню" className="flex size-10 cursor-pointer items-center justify-center text-[#3a4c38]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="size-7"><path d="M5 5l14 14M19 5 5 19" /></svg>
        </button>
      </div>
      <nav className="flex flex-col gap-2 px-8 pt-12">
        {NAV.map((n, i) => (
          <button
            key={n}
            onClick={() => pick(i)}
            style={{ transitionDelay: open ? `${80 + i * 60}ms` : '0ms' }}
            className={`font-evo w-fit cursor-pointer py-1 text-left text-[32px] leading-[40px] tracking-[-0.5px] text-[#3a4c38] transition-all duration-500 ease-out active:text-[#b05a3f] ${open ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}
          >
            {n}
          </button>
        ))}
      </nav>
      <div className="mt-auto flex items-center gap-6 px-8 pb-12">
        {SOCIALS.map(([label, href, icon]) => (
          <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="flex size-12 items-center justify-center rounded-full border border-[#3a4c38]/20 text-[#b05a3f] transition-colors active:bg-[#3a4c38]/8">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-6">{icon}</svg>
          </a>
        ))}
      </div>
    </div>
  )
}

export function Header({ go, cart, bump, onCart }: { go: (p: Page) => void; cart: number; bump: number; onCart: () => void }) {
  const [menu, setMenu] = useState(false)
  return (
    <>
    <MobileMenu open={menu} close={() => setMenu(false)} go={go} cart={cart} onCart={onCart} />
    <header className="sticky top-0 z-40">
      <div className="flex justify-center bg-[#3a4c38] px-[round(calc(var(--u)*16),4px)] py-[round(calc(var(--u)*8),4px)]">
        <p className="font-['Montserrat',sans-serif] wdth text-center text-[10px] sm:text-[length:round(calc(var(--u)*12),2px)] font-normal leading-[round(calc(var(--u)*16),4px)] tracking-[1px] sm:tracking-[calc(var(--u)*2)] sm:whitespace-nowrap text-[#faf6ec] uppercase">
          Доставка по всій Україні · Нова Пошта та кур’єр
        </p>
      </div>
      <div className="border-b border-[#e9e9e9] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-[round(calc(var(--u)*60),4px)] max-w-[round(calc(var(--u)*1200),4px)] items-center gap-3 px-4 sm:gap-6 sm:px-6 xl:px-0">
          <div className="min-w-0 flex-1">
            <Monogram onClick={() => go('home')} />
          </div>
          <nav className="hidden items-center gap-[round(calc(var(--u)*64),4px)] md:flex">
            {NAV.map((n, i) => (
              <button
                key={n}
                onClick={() => (i === 3 ? scrollToContacts(go) : go(i === 0 ? 'menu' : 'home'))}
                className="group relative flex cursor-pointer items-center justify-center py-[round(calc(var(--u)*8),4px)]"
              >
                <span className="font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*14),2px)] leading-[round(calc(var(--u)*24),4px)] font-normal text-[#4c5147] transition-colors duration-300 group-hover:text-[#3a4c38]">
                  {n}
                </span>
                <span className="absolute top-[round(calc(var(--u)*29),4px)] left-0 h-px w-0 bg-[#b0563a] transition-[width] duration-300 ease-out group-hover:w-full" />
              </button>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-3 sm:gap-[round(calc(var(--u)*24),4px)] md:ml-[round(calc(var(--u)*64),4px)]">
            <button
              onClick={() => go('menu')}
              className="font-['Montserrat',sans-serif] wdth hidden sm:flex sm:w-[round(calc(var(--u)*136),4px)] h-[round(calc(var(--u)*40),4px)] cursor-pointer items-center justify-center rounded-[round(calc(var(--u)*8),4px)] bg-[#3a4c38] px-4 sm:px-[round(calc(var(--u)*24),4px)] py-[round(calc(var(--u)*8),4px)] text-[length:round(calc(var(--u)*14),2px)] leading-[round(calc(var(--u)*24),4px)] font-semibold text-[#faf6ec] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2c3b2a] hover:shadow-[0_8px_18px_-8px_rgba(58,76,56,0.7)] active:translate-y-0"
            >
              Замовити
            </button>
            <button onClick={onCart} aria-label="Відкрити кошик" className="group relative flex h-[round(calc(var(--u)*40),4px)] w-12 sm:w-[round(calc(var(--u)*67),4px)] cursor-pointer items-center justify-center rounded-[round(calc(var(--u)*8),4px)] border border-[#3a4c38] p-[round(calc(var(--u)*8),4px)] transition-colors duration-300 hover:bg-[#3a4c38]/8">
              <img alt="Кошик" src={`${A}/79452.svg`} width={24} height={24} className="size-[round(calc(var(--u)*24),4px)] transition-transform duration-300 group-hover:-rotate-6" />
              {cart > 0 && (
                <span key={bump} className="animate-bump absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-[#b05a3f] text-[length:round(calc(var(--u)*12),2px)] font-semibold text-white">
                  {cart}
                </span>
              )}
            </button>
            <button onClick={() => setMenu(true)} aria-label="Відкрити меню" className="flex size-10 cursor-pointer items-center justify-center text-[#3a4c38] md:hidden">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="size-7"><path d="M4 7h16M4 12h16M10 17h10" /></svg>
            </button>
          </div>
        </div>
      </div>
    </header>
    </>
  )
}

export function Wave() {
  return (
    <div className="pointer-events-none relative mt-[round(calc(var(--u)*12),4px)] h-[round(calc(var(--u)*76),4px)] overflow-x-clip" aria-hidden>
      <img alt="" src={`${A}/c725d.svg`} className="animate-wave absolute top-0 left-[-14.2%] h-[round(calc(var(--u)*73),4px)] w-[124.4%] max-w-none" />
    </div>
  )
}

export function Footer({ gap = 16, go }: { gap?: number; go: (p: Page) => void }) {
  const rows = [
    [`${A}/38537.svg`, 'м. _____ вул. ______'],
    [`${A}/fe43d.svg`, '+ 380 XX XXX XX XX'],
    [`${A}/06150.svg`, 'Пн - Нд  |  9:00 - 20:20'],
  ]
  return (
    <footer id="contacts" className="scroll-mt-[round(calc(var(--u)*320),4px)] bg-[#3a4c38] px-6 pt-[round(calc(var(--u)*40),4px)] xl:px-0">
      <div className="mx-auto flex max-w-[round(calc(var(--u)*1200),4px)] flex-col gap-[round(calc(var(--u)*24),4px)]">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="flex max-w-[round(calc(var(--u)*363),4px)] flex-col gap-[round(calc(var(--u)*16),4px)]">
            <Monogram light onClick={() => go('home')} />
            <p className="font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*14),2px)] leading-[round(calc(var(--u)*24),4px)] font-normal text-[#808c7e]">
              Це заморожені напівфабрикати, свіжий хліб, крафтові сири, ковбаси та консервація. Готуємо так, як для власної родини, і привозимо по всій Україні.
            </p>
          </div>
          <div className="flex w-[round(calc(var(--u)*177),4px)] flex-col" style={{ gap }}>
            <p className="font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*12),2px)] leading-[round(calc(var(--u)*16),4px)] font-normal tracking-[calc(var(--u)*4)] text-[#808c7e] uppercase">САмовивіз</p>
            <div className="flex flex-col gap-[round(calc(var(--u)*8),4px)]">
              {rows.map(([icon, t]) => (
                <div key={t} className="group flex items-center gap-[round(calc(var(--u)*16),4px)]">
                  <img alt="" src={icon} width={16} height={16} className="size-[round(calc(var(--u)*16),4px)] transition-transform duration-300 group-hover:scale-125" />
                  <p className="font-evo text-[length:round(calc(var(--u)*12),2px)] leading-[round(calc(var(--u)*24),4px)] whitespace-pre text-[#c0c0c0] transition-colors duration-300 group-hover:text-white">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-2 border-t border-[#586757] pt-[round(calc(var(--u)*24),4px)] pb-[round(calc(var(--u)*24),4px)] sm:flex-row">
          <p className="font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*12),2px)] leading-[round(calc(var(--u)*16),4px)] font-normal text-[rgba(250,246,236,0.55)]">© 2026 Maina by Rivka. Усі права захищені.</p>
          <p className="font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*12),2px)] leading-[round(calc(var(--u)*16),4px)] font-normal text-[rgba(250,246,236,0.55)]">Зроблено з любов’ю до домашньої кухні</p>
        </div>
      </div>
    </footer>
  )
}

export function PrimaryButton({ children, onClick, className = '', type = 'button', disabled = false }: { children: ReactNode; onClick?: () => void; className?: string; type?: 'button' | 'submit'; disabled?: boolean }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`group font-evo-bold disabled:pointer-events-none disabled:opacity-50 flex h-[round(calc(var(--u)*56),4px)] w-full max-w-[round(calc(var(--u)*320),4px)] cursor-pointer items-center justify-center gap-2 rounded-[round(calc(var(--u)*8),4px)] bg-[#3a4c38] p-[round(calc(var(--u)*16),4px)] text-[length:round(calc(var(--u)*16),2px)] leading-[round(calc(var(--u)*24),4px)] text-[#faf6ec] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2c3b2a] hover:shadow-[0_14px_24px_-12px_rgba(58,76,56,0.8)] active:translate-y-0 ${className}`}
    >
      {children}
    </button>
  )
}
