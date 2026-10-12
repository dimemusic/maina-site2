import { useEffect, useRef, useState } from 'react'
import { sized, useContent } from '../lib/content'

const SHOW_MS = 3500
const F = "font-['Montserrat',sans-serif] wdth"

// Глобальне повідомлення «додано в кошик». App передає лише id товару й ключ варіанта, а назву, вагу й фото
// беремо тут із каталогу. tick збільшується при кожному додаванні: вміст оновлюється, таймер стартує знову.
// Наведення (чи фокус) ставить таймер на паузу. Поки кошик відкритий (hidden), toast не показуємо.
export default function Toast({ id, opt, tick, hidden, onCart }: { id: string; opt: string; tick: number; hidden: boolean; onCart: () => void }) {
  const { byId } = useContent()
  const p = byId[id]
  const o = p?.opts.find((x) => x.key === opt)
  const name = p ? p.name.replace(/\s+/g, ' ').trim() : ''

  const [visible, setVisible] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const left = useRef(SHOW_MS)
  const startedAt = useRef(0)
  const held = useRef(false) // курсор над toast або фокус усередині

  const run = () => {
    clearTimeout(timer.current)
    startedAt.current = Date.now()
    timer.current = setTimeout(() => setVisible(false), left.current)
  }
  const pause = () => {
    held.current = true
    if (timer.current === undefined) return
    clearTimeout(timer.current)
    timer.current = undefined
    left.current = Math.max(0, left.current - (Date.now() - startedAt.current))
  }
  const resume = () => {
    held.current = false
    if (timer.current === undefined && visible) run()
  }
  const close = () => {
    clearTimeout(timer.current)
    timer.current = undefined
    setVisible(false)
  }

  useEffect(() => {
    if (tick === 0) return
    left.current = SHOW_MS
    setVisible(true)
    clearTimeout(timer.current)
    timer.current = undefined
    if (!held.current) run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick])

  useEffect(() => () => clearTimeout(timer.current), [])

  const shown = visible && !hidden && !!p

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-[calc(16px+env(safe-area-inset-bottom))] z-[60] md:inset-x-auto md:right-6 md:bottom-6 md:w-[360px]">
      <div
        onMouseEnter={pause}
        onMouseLeave={resume}
        onFocus={pause}
        onBlur={resume}
        className={`relative rounded-[16px] border border-[rgba(58,76,56,0.1)] bg-white p-4 shadow-[0_24px_48px_-20px_rgba(38,51,37,0.35),0_8px_20px_-12px_rgba(38,51,37,0.2)] transition-all duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          shown ? 'pointer-events-auto visible translate-0 opacity-100' : 'invisible translate-y-4 opacity-0 md:translate-x-6 md:translate-y-0'
        }`}
      >
        <div className="flex items-start gap-3 pr-7">
          {p && <img alt="" src={sized(p.img, 160)} width={56} height={56} className="size-14 shrink-0 rounded-[8px] object-cover" />}
          <div role="status" aria-live="polite" className="flex min-w-0 flex-1 flex-col gap-1">
            <p className={`${F} line-clamp-2 font-semibold text-[16px] leading-[22px] text-[#3a4c38]`}>{name}</p>
            <p className={`${F} flex items-center gap-1.5 text-[14px] leading-[20px] text-[#929292]`}>
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5a8a4e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              <span className="truncate">{o?.label ? `${o.label} · додано в кошик` : 'додано в кошик'}</span>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Закрити сповіщення"
          className="absolute top-2 right-2 flex size-8 cursor-pointer items-center justify-center rounded-full text-[#b7b7b7] transition-colors hover:bg-[#3a4c38]/6 hover:text-[#3a4c38]"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 3l10 10M13 3L3 13" /></svg>
        </button>
        <div className="mt-3">
          <button
            type="button"
            onClick={() => {
              close()
              onCart()
            }}
            className="font-evo-bold flex h-9 w-full cursor-pointer items-center justify-center rounded-[8px] bg-[#3a4c38] px-4 text-[14px] leading-[20px] text-[#faf6ec] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2c3b2a] hover:shadow-[0_10px_18px_-10px_rgba(58,76,56,0.8)] active:translate-y-0"
          >
            Відкрити кошик
          </button>
        </div>
      </div>
    </div>
  )
}
