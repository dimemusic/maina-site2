import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { A, PrimaryButton, Wave } from '../components/Layout'
import { MenuCard } from '../components/Products'
import { useContent, type Product } from '../lib/content'

const SORTS = ['За замовчуванням', 'За зростанням ціни', 'За зниженням ціни']

// Bars of rising / falling height read as "price up / price down" at a glance
const SORT_ICONS = [
  <path key="0" d="M4 7h16M4 12h16M4 17h16" />,
  <path key="1" d="M4 18h4M4 13h8M4 8h12M18 6v12m0 0-3-3m3 3 3-3" />,
  <path key="2" d="M4 6h12M4 11h8M4 16h4M18 18V6m0 0-3 3m3-3 3 3" />,
]
const SortIcon = ({ i }: { i: number }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-[round(calc(var(--u)*20),4px)] shrink-0">
    {SORT_ICONS[i]}
  </svg>
)

// Для пошуку: без урахування регістру, а різні апострофи (' ʼ ` ´) вважаємо тим самим ’, що в назвах товарів
const norm = (s: string) => s.toLocaleLowerCase('uk').replace(/['ʼ`´]/g, '’').replace(/\s+/g, ' ').trim()

const FIELD = "font-['Montserrat',sans-serif] wdth"

function SearchField({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute top-1/2 left-[round(calc(var(--u)*16),4px)] size-[round(calc(var(--u)*20),4px)] -translate-y-1/2 text-[#929292]">
        <circle cx="11" cy="11" r="6.5" />
        <path d="m20 20-4.2-4.2" />
      </svg>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onChange('')}
        maxLength={60}
        autoComplete="off"
        enterKeyHint="search"
        placeholder="Пошук товарів"
        aria-label="Пошук товарів"
        // 16px у полі, щоб iOS не наближав сторінку при фокусі; власний хрестик замість рідного
        className={`${FIELD} w-full rounded-[round(calc(var(--u)*8),4px)] border border-[#e6e6e6] bg-white py-[round(calc(var(--u)*12),4px)] pr-[round(calc(var(--u)*44),4px)] pl-[round(calc(var(--u)*44),4px)] text-[16px] text-[#3a4c38] outline-none transition-colors placeholder:text-[#b7b7b7] focus:border-[#3a4c38] [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden`}
      />
      {value && (
        <button type="button" onClick={() => onChange('')} aria-label="Очистити пошук" className="absolute top-1/2 right-[round(calc(var(--u)*8),4px)] flex size-[round(calc(var(--u)*32),4px)] -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[#929292] transition-colors hover:text-[#3a4c38]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 3l10 10M13 3L3 13" /></svg>
        </button>
      )}
    </div>
  )
}

type Cat = { label: string; icon: string; font: string; inset?: boolean; match: (p: Product) => boolean }
const SEMI = "font-['Montserrat',sans-serif] font-semibold"
const MEDIUM = "font-['Montserrat',sans-serif] font-medium"

// Список категорій приходить із Sanity; іконки (частина дизайну) підбираємо за slug категорії
const CAT_ICONS: Record<string, { icon: string; inset?: boolean }> = {
  khlib: { icon: 'c3098.svg', inset: true },
  sweet: { icon: 'd23ac.svg' },
  varenyky: { icon: '28e8b.svg' },
  'pelmeni-khinkali': { icon: 'fa09a.svg' },
  kovbasy: { icon: 'd4540.svg' },
  syry: { icon: 'cad78.svg' },
}

export default function Menu({ openProduct, onAdd }: { openProduct: (id: string) => void; onAdd: (id: string, opt: string) => void }) {
  const { products, categories } = useContent()
  const CATS: Cat[] = [
    { label: 'Усе меню', icon: '9bfa7.svg', font: SEMI, match: () => true },
    { label: 'Акції', icon: '9a0b8.svg', font: SEMI, match: (p) => !!p.sale },
    { label: 'Новинки', icon: '17f6c.svg', font: SEMI, match: (p) => p.isNew },
    ...categories.map((c) => ({ label: c.title, icon: CAT_ICONS[c.slug]?.icon ?? '9bfa7.svg', inset: CAT_ICONS[c.slug]?.inset, font: MEDIUM, match: (p: Product) => p.catSlug === c.slug })),
  ]
  const [cat, setCat] = useState(0)
  const [sortOpen, setSortOpen] = useState(false)
  const [sort, setSort] = useState(0)
  const [query, setQuery] = useState('')
  const current = CATS[cat] ?? CATS[0]
  // Пошук діє поверх вибраної категорії: усі слова із запиту мають бути в назві або короткому описі
  const words = norm(query).split(' ').filter(Boolean)
  const base = products.filter(current.match).filter((p) => {
    const text = norm(`${p.name} ${p.desc}`)
    return words.every((w) => text.includes(w))
  })
  const price = (p: Product) => p.opts[0].price
  const list = sort === 0 ? base : [...base].sort((a, b) => (sort === 1 ? price(a) - price(b) : price(b) - price(a)))

  // Висота липкої шапки сайту (разом із рядком про доставку, що на телефоні може перенестись на два рядки):
  // від неї відраховуємо, де має зупинитися наша смуга з пошуком і категоріями
  const [headerH, setHeaderH] = useState(96)
  useLayoutEffect(() => {
    const header = document.querySelector('header.sticky')
    if (!header) return
    const update = () => setHeaderH(Math.round(header.getBoundingClientRect().height))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(header)
    return () => ro.disconnect()
  }, [])

  const barRef = useRef<HTMLDivElement>(null)
  const chipsRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const firstRun = useRef(true)
  useEffect(() => {
    // Вибрана категорія в рядку на телефоні завжди має бути в зоні видимості
    chipsRef.current?.querySelector('[data-active]')?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
    // Якщо список уже прокручено нижче початку, повертаємо його початок під липку смугу, щоб результат було видно
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    const grid = listRef.current
    if (!grid) return
    const offset = headerH + (barRef.current?.offsetHeight ?? 16) + 8
    const top = grid.getBoundingClientRect().top + window.scrollY - offset
    if (window.scrollY > top) window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat, query])

  return (
    <main className="pb-[round(calc(var(--u)*24),4px)]" style={{ ['--sticky-top' as string]: `${headerH}px` }}>
      <Wave />
      <div className="mx-auto max-w-[round(calc(var(--u)*1200),4px)] px-6 xl:px-0">
        <div className="animate-page relative z-30 mt-[round(calc(var(--u)*24),4px)] flex flex-wrap items-end justify-between gap-4 border-b border-[#e9e9e9] py-[round(calc(var(--u)*16),4px)]">
          <div className="flex flex-col gap-[round(calc(var(--u)*8),4px)]">
            <p className="font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*14),2px)] leading-[round(calc(var(--u)*16),4px)] font-normal tracking-[calc(var(--u)*4)] text-[#bf9064] uppercase">Maina by Rivka</p>
            <h1 className="font-evo-bold text-[length:round(calc(var(--u)*40),2px)] leading-[round(calc(var(--u)*48),4px)] text-[#3a4c38]">Наше меню</h1>
          </div>
          <div className="relative flex items-center gap-[round(calc(var(--u)*16),4px)]">
            <p className="font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*14),2px)] leading-[round(calc(var(--u)*24),4px)] font-normal text-[#6d746a]">Сортувати:</p>
            <button onClick={() => setSortOpen((o) => !o)} className="flex cursor-pointer items-center justify-center gap-[round(calc(var(--u)*8),4px)] rounded-[round(calc(var(--u)*56),4px)] border border-[#e6e6e6] px-[round(calc(var(--u)*16),4px)] py-[round(calc(var(--u)*8),4px)] transition-colors duration-300 hover:border-[#3a4c38]">
              <span className="text-[#3a4c38]"><SortIcon i={sort} /></span>
              <span className="font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*16),2px)] leading-[round(calc(var(--u)*24),4px)] font-normal text-[#7e7e7e]">{SORTS[sort]}</span>
              <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7e7e7e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`size-[round(calc(var(--u)*24),4px)] shrink-0 transition-transform duration-300 ${sortOpen ? 'rotate-180' : ''}`}><path d="m7 10 5 5 5-5" /></svg>
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                <ul className="animate-fade absolute top-full right-0 z-20 mt-[round(calc(var(--u)*8),4px)] flex min-w-[round(calc(var(--u)*240),4px)] flex-col gap-[calc(var(--u)*4)] rounded-[round(calc(var(--u)*16),4px)] border border-[#e6e6e6] bg-white p-[round(calc(var(--u)*8),4px)] shadow-[0_18px_40px_-20px_rgba(38,51,37,0.45)]">
                  {SORTS.map((label, i) => (
                    <li key={label}>
                      <button
                        onClick={() => {
                          setSort(i)
                          setSortOpen(false)
                        }}
                        className={`font-['Montserrat',sans-serif] wdth flex w-full cursor-pointer items-center justify-between gap-[round(calc(var(--u)*16),4px)] rounded-[round(calc(var(--u)*8),4px)] px-[round(calc(var(--u)*16),4px)] py-[round(calc(var(--u)*8),4px)] text-left text-[length:round(calc(var(--u)*16),2px)] leading-[round(calc(var(--u)*24),4px)] whitespace-nowrap transition-colors duration-200 ${sort === i ? 'bg-[#3a4c38] font-semibold text-white' : 'text-[#4c5147] hover:bg-[#3a4c38]/6'}`}
                      >
                        <span className="flex items-center gap-[round(calc(var(--u)*8),4px)]">
                          <SortIcon i={i} />
                          {label}
                        </span>
                        {sort === i && <span>✓</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* Телефон і планшет: пошук і категорії липнуть під шапкою сайту. Категорії в один рядок із горизонтальним скролом */}
        <div ref={barRef} className="sticky top-[calc(var(--sticky-top)-1px)] z-20 -mx-6 bg-white px-6 py-[round(calc(var(--u)*8),4px)] shadow-[0_10px_16px_-14px_rgba(38,51,37,0.4)] lg:hidden">
          <SearchField id="menu-search-mobile" value={query} onChange={setQuery} />
          <div ref={chipsRef} className="-mx-6 mt-[round(calc(var(--u)*8),4px)] flex gap-[round(calc(var(--u)*8),4px)] overflow-x-auto px-6 pb-[calc(var(--u)*2)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATS.map((c, i) => {
              const on = i === cat
              return (
                <button
                  key={c.label}
                  data-active={on || undefined}
                  aria-pressed={on}
                  onClick={() => setCat(i)}
                  className={`group flex shrink-0 cursor-pointer items-center gap-[round(calc(var(--u)*8),4px)] rounded-[round(calc(var(--u)*56),4px)] border px-[round(calc(var(--u)*12),4px)] py-[round(calc(var(--u)*4),4px)] whitespace-nowrap transition-colors duration-300 ${on ? 'border-[#3a4c38] bg-[#3a4c38]' : 'border-[#e6e6e6] hover:border-[#3a4c38]'}`}
                >
                  <img alt="" src={`${A}/${c.icon}`} className={`${c.inset ? 'size-[round(calc(var(--u)*18),2px)]' : 'size-[round(calc(var(--u)*20),4px)]'} ${on ? 'brightness-0 invert' : i === 0 ? 'brightness-0 opacity-75' : ''}`} />
                  <span className={`text-[length:round(calc(var(--u)*14),2px)] leading-[round(calc(var(--u)*24),4px)] ${on ? `${FIELD} font-semibold text-white` : `${c.font} wdth text-[#4a4a4a]`}`}>{c.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-[round(calc(var(--u)*24),4px)] flex flex-col gap-[round(calc(var(--u)*24),4px)] lg:mt-[round(calc(var(--u)*32),4px)] lg:flex-row">
          {/* Від 1024px: липка бічна панель (пошук + категорії). На менших екранах тут лишається лише картка внизу, під товарами */}
          {/* Внутрішні відступи (20 з боків, 12 зверху, 28 знизу) дають місце тіні активної категорії, а від’ємні margin повертають розташування на місце: контент лишається шириною 242px і стоїть там само, де стояв */}
          <aside className="order-last flex w-full shrink-0 flex-col [scrollbar-width:thin] lg:sticky lg:top-[calc(var(--sticky-top)+4px)] lg:order-none lg:-mx-5 lg:-mt-3 lg:-mb-7 lg:max-h-[calc(100vh-var(--sticky-top)+8px)] lg:w-[calc(var(--u)*282)] lg:self-start lg:overflow-y-auto lg:px-5 lg:pt-3 lg:pb-7">
            <div className="hidden lg:block">
              <SearchField id="menu-search-desktop" value={query} onChange={setQuery} />
              <p className="font-['Montserrat',sans-serif] wdth mt-[round(calc(var(--u)*24),4px)] text-[length:round(calc(var(--u)*14),2px)] leading-[round(calc(var(--u)*16),4px)] font-normal tracking-[calc(var(--u)*2)] text-[#81857e] uppercase">Категорії</p>
              <div className="mt-[round(calc(var(--u)*16),4px)] flex flex-col gap-[round(calc(var(--u)*8),4px)]">
                {CATS.map((c, i) => {
                  const on = i === cat
                  return (
                    <button
                      key={c.label}
                      onClick={() => setCat(i)}
                      className={`group flex cursor-pointer items-center gap-[round(calc(var(--u)*16),4px)] rounded-[round(calc(var(--u)*8),4px)] p-[round(calc(var(--u)*8),4px)] text-left transition-all duration-300 ${on ? 'bg-[#3a4c38] drop-shadow-[-1px_8px_10px_rgba(0,0,0,0.15)]' : 'hover:translate-x-1.5 hover:bg-[#3a4c38]/6'}`}
                    >
                      <span className="flex size-[round(calc(var(--u)*24),4px)] items-center justify-center">
                        <img alt="" src={`${A}/${c.icon}`} className={`${c.inset ? 'size-[round(calc(var(--u)*21.3),4px)]' : 'size-[round(calc(var(--u)*24),4px)]'} transition-transform duration-300 group-hover:scale-110 ${on ? 'brightness-0 invert' : i === 0 ? 'brightness-0 opacity-75' : ''}`} />
                      </span>
                      <span className={`text-[length:round(calc(var(--u)*16),2px)] leading-[round(calc(var(--u)*24),4px)] whitespace-nowrap ${on ? "font-['Montserrat',sans-serif] wdth font-semibold text-white" : `${c.font} wdth text-[#4a4a4a]`}`}>{c.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="group flex flex-col rounded-[round(calc(var(--u)*16),4px)] bg-[#f6f6f6] p-[round(calc(var(--u)*24),4px)] transition-colors duration-300 hover:bg-[#eef1ec] lg:mt-[round(calc(var(--u)*24),4px)]">
              <p className="font-['Montserrat',sans-serif] wdth w-[round(calc(var(--u)*180),4px)] text-[length:round(calc(var(--u)*20),2px)] leading-[round(calc(var(--u)*32),4px)] font-semibold text-[#293b2a]">Не знаєте, що обрати?</p>
              <p className="font-['Montserrat',sans-serif] wdth w-[round(calc(var(--u)*180),4px)] pt-[round(calc(var(--u)*8),4px)] text-[length:round(calc(var(--u)*12),2px)] leading-[round(calc(var(--u)*24),4px)] font-normal text-[#737970]">Напишіть нам — зберемо смачний набір для вашого столу.</p>
              <a href="#" className="font-['Montserrat',sans-serif] wdth relative mt-[round(calc(var(--u)*16),4px)] w-fit pb-[round(calc(var(--u)*8),4px)] text-[length:round(calc(var(--u)*12),2px)] leading-[round(calc(var(--u)*16),4px)] font-normal text-[#a34e3d]">
                Порадитися
                <span className="absolute bottom-0 left-0 h-px w-full origin-left bg-[#a34e3d] transition-transform duration-300 group-hover:scale-x-[1.25]" />
              </a>
            </div>
          </aside>

          <div ref={listRef} className="grid min-w-0 flex-1 grid-cols-1 content-start items-start gap-[round(calc(var(--u)*24),4px)] sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p, i) => (
              <div key={`${cat}-${sort}-${p.id}`} className="animate-page" style={{ animationDelay: `${i * 60}ms` }}>
                <MenuCard p={p} onOpen={() => openProduct(p.id)} onAdd={onAdd} />
              </div>
            ))}
            {list.length === 0 && words.length > 0 && (
              <div role="status" className="animate-page col-span-full flex flex-col items-center gap-[round(calc(var(--u)*16),4px)] py-[round(calc(var(--u)*64),4px)] text-center">
                <p className="font-evo-bold text-[length:round(calc(var(--u)*24),2px)] leading-[round(calc(var(--u)*32),4px)] text-[#3a4c38]">Нічого не знайдено</p>
                <p className={`${FIELD} max-w-[round(calc(var(--u)*360),4px)] text-[length:round(calc(var(--u)*16),2px)] leading-[round(calc(var(--u)*24),4px)] break-words text-[#929292]`}>
                  {cat !== 0 ? `У категорії «${current.label}» за` : 'За'} запитом «{query.trim()}» нічого немає. Спробуйте інше слово.
                </p>
                <PrimaryButton className="mt-[round(calc(var(--u)*8),4px)] max-w-[round(calc(var(--u)*240),4px)]" onClick={() => setQuery('')}>
                  Очистити пошук
                </PrimaryButton>
              </div>
            )}
            {list.length === 0 && words.length === 0 && (
              <p className="animate-page font-['Montserrat',sans-serif] wdth col-span-full py-[round(calc(var(--u)*64),4px)] text-center text-[length:round(calc(var(--u)*16),2px)] leading-[round(calc(var(--u)*24),4px)] text-[#929292]">
                Скоро тут з’являться нові позиції
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
