import { useState } from 'react'
import { A, Wave } from '../components/Layout'
import { MenuCard, P } from '../components/Products'

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

const CATS: { label: string; icon: string; font: string; inset?: boolean; ids?: string[] }[] = [
  { label: 'Усе меню', icon: '9bfa7.svg', font: "font-['Montserrat',sans-serif] font-semibold" },
  { label: 'Акції', icon: '9a0b8.svg', font: "font-['Montserrat',sans-serif] font-semibold", ids: ['kovbasa', 'syr'] },
  { label: 'Новинки', icon: '17f6c.svg', font: "font-['Montserrat',sans-serif] font-semibold", ids: ['khinkaliCheese', 'vyshnya', 'cinnabon'] },
  { label: 'Хліб', icon: 'c3098.svg', font: "font-['Montserrat',sans-serif] font-medium", inset: true, ids: ['khlib'] },
  { label: 'Солодка випічка', icon: 'd23ac.svg', font: "font-['Montserrat',sans-serif] font-medium", ids: ['cinnabon', 'syrnyky', 'strudel'] },
  { label: 'Вареники', icon: '28e8b.svg', font: "font-['Montserrat',sans-serif] font-medium", ids: ['varenyky', 'vyshnya'] },
  { label: 'Пельмені та хінкалі', icon: 'fa09a.svg', font: "font-['Montserrat',sans-serif] font-medium", ids: ['pelmeni', 'khinkaliCheese', 'khinkaliMeat'] },
  { label: 'Ковбаси', icon: 'd4540.svg', font: "font-['Montserrat',sans-serif] font-medium", ids: ['kovbasa'] },
  { label: 'Крафтові сири', icon: 'cad78.svg', font: "font-['Montserrat',sans-serif] font-medium", ids: ['syr'] },
]
const ALL = ['varenyky', 'khlib', 'khinkaliCheese', 'pelmeni', 'vyshnya', 'syr', 'khinkaliMeat', 'kovbasa', 'cinnabon', 'syrnyky', 'strudel']

export default function Menu({ openProduct, onAdd }: { openProduct: (id: string) => void; onAdd: (id: string, opt: number) => void }) {
  const [cat, setCat] = useState(0)
  const [sortOpen, setSortOpen] = useState(false)
  const [sort, setSort] = useState(0)
  const base = CATS[cat].ids ?? ALL
  const price = (id: string) => P[id].opts[0].price
  const ids = sort === 0 ? base : [...base].sort((a, b) => (sort === 1 ? price(a) - price(b) : price(b) - price(a)))

  return (
    <main className="pb-[round(calc(var(--u)*24),4px)]">
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

        <div className="mt-[round(calc(var(--u)*32),4px)] flex flex-col gap-[round(calc(var(--u)*24),4px)] lg:flex-row">
          <aside className="flex w-full shrink-0 flex-col lg:w-[round(calc(var(--u)*242),4px)]">
            <p className="font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*14),2px)] leading-[round(calc(var(--u)*16),4px)] font-normal tracking-[calc(var(--u)*2)] text-[#81857e] uppercase">Категорії</p>
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
            <div className="group mt-[round(calc(var(--u)*24),4px)] flex flex-col rounded-[round(calc(var(--u)*16),4px)] bg-[#f6f6f6] p-[round(calc(var(--u)*24),4px)] transition-colors duration-300 hover:bg-[#eef1ec]">
              <p className="font-['Montserrat',sans-serif] wdth w-[round(calc(var(--u)*180),4px)] text-[length:round(calc(var(--u)*20),2px)] leading-[round(calc(var(--u)*32),4px)] font-semibold text-[#293b2a]">Не знаєте, що обрати?</p>
              <p className="font-['Montserrat',sans-serif] wdth w-[round(calc(var(--u)*180),4px)] pt-[round(calc(var(--u)*8),4px)] text-[length:round(calc(var(--u)*12),2px)] leading-[round(calc(var(--u)*24),4px)] font-normal text-[#737970]">Напишіть нам — зберемо смачний набір для вашого столу.</p>
              <a href="#" className="font-['Montserrat',sans-serif] wdth relative mt-[round(calc(var(--u)*16),4px)] w-fit pb-[round(calc(var(--u)*8),4px)] text-[length:round(calc(var(--u)*12),2px)] leading-[round(calc(var(--u)*16),4px)] font-normal text-[#a34e3d]">
                Порадитися
                <span className="absolute bottom-0 left-0 h-px w-full origin-left bg-[#a34e3d] transition-transform duration-300 group-hover:scale-x-[1.25]" />
              </a>
            </div>
          </aside>

          <div className="grid flex-1 grid-cols-1 content-start items-start gap-[round(calc(var(--u)*24),4px)] sm:grid-cols-2 lg:grid-cols-3">
            {ids.map((id, i) => (
              <div key={`${cat}-${sort}-${id}`} className="animate-page" style={{ animationDelay: `${i * 60}ms` }}>
                <MenuCard p={P[id]} onOpen={() => openProduct(id)} onAdd={onAdd} />
              </div>
            ))}
            {ids.length === 0 && (
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
