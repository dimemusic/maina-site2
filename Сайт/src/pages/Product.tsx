import { useState } from 'react'
import { A, PrimaryButton, Wave, type Page } from '../components/Layout'
import { MenuCard } from '../components/Products'
import { sized, useContent, type Product as ProductData } from '../lib/content'

// Close-up crops of the single product photo when there's no dedicated gallery
const CROPS = [
  { z: 1, o: '50% 50%' },
  { z: 1.7, o: '20% 30%' },
  { z: 1.7, o: '80% 60%' },
  { z: 2.2, o: '50% 80%' },
]

type Props = { go: (p: Page) => void; openProduct: (id: string) => void; onAdd: (id: string, opt: string) => void }

export default function Product({ id, ...rest }: Props & { id: string }) {
  const { byId } = useContent()
  const p = byId[id]
  // Товар могли прибрати в Sanity, поки сторінка була відкрита
  if (!p) {
    return (
      <main className="flex flex-col items-center gap-4 px-6 py-[round(calc(var(--u)*120),4px)] text-center">
        <p className="font-evo-bold text-[length:round(calc(var(--u)*24),2px)] text-[#3a4c38]">Такого товару вже немає</p>
        <PrimaryButton onClick={() => rest.go('menu')}>До меню</PrimaryButton>
      </main>
    )
  }
  return <ProductView p={p} {...rest} />
}

function ProductView({ p, go, openProduct, onAdd }: Props & { p: ProductData }) {
  const { byId } = useContent()
  const id = p.id
  const d = p.details
  const related = d.related.map((rid) => byId[rid]).filter((r): r is ProductData => !!r)
  // Перше фото — головне; якщо додаткових немає, показуємо наближені фрагменти головного
  const gallery = p.gallery.length > 0 ? [p.img, ...p.gallery].map((src) => ({ src: sized(src, 1200), z: 1, o: '50% 50%' })) : CROPS.map((c) => ({ src: sized(p.img, 1200), ...c }))
  const [img, setImg] = useState(0)
  const [sel, setSel] = useState(0)
  const opt = p.opts[sel]
  const [tab, setTab] = useState<'desc' | 'prep'>('desc')
  const [added, setAdded] = useState(false)
  const thumbs = gallery.map((g, i) => ({ ...g, i })).filter((g) => g.i !== img)

  return (
    <main className="pb-[round(calc(var(--u)*64),4px)]">
      <Wave />
      <div className="mx-auto max-w-[round(calc(var(--u)*1200),4px)] px-6 xl:px-0">
        <p className="animate-page font-['Montserrat',sans-serif] wdth mt-[round(calc(var(--u)*64),4px)] text-[length:round(calc(var(--u)*14),2px)] leading-[round(calc(var(--u)*24),4px)] font-normal whitespace-pre text-[#6d746a]">
          <button onClick={() => go('menu')} className="cursor-pointer transition-colors hover:text-[#3a4c38] hover:underline">Асортимент</button>
          {'  /  '}
          <button onClick={() => go('menu')} className="cursor-pointer transition-colors hover:text-[#3a4c38] hover:underline">{p.cat}</button>
          {`  /  ${p.name}`}
        </p>

        <div className="mt-[round(calc(var(--u)*40),4px)] grid gap-[round(calc(var(--u)*24),4px)] lg:grid-cols-2">
          <div className="animate-page flex flex-col gap-[round(calc(var(--u)*24),4px)]">
            <div className="group relative h-[round(calc(var(--u)*300),4px)] overflow-hidden rounded-[round(calc(var(--u)*8),4px)] sm:h-[round(calc(var(--u)*399),4px)]">
              <div key={img} className="animate-fade size-full" style={{ scale: String(gallery[img].z), transformOrigin: gallery[img].o }}>
                <img alt={p.name} src={gallery[img].src} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              {p.sale && <span className="font-['Montserrat',sans-serif] wdth absolute top-[round(calc(var(--u)*16),4px)] left-[round(calc(var(--u)*16),4px)] -rotate-3 rounded-full bg-[#b05a3f] px-[round(calc(var(--u)*16),4px)] py-[calc(var(--u)*6)] text-[length:round(calc(var(--u)*14),2px)] leading-[round(calc(var(--u)*16),4px)] font-semibold text-white uppercase shadow-md">Акція · {p.sale.short}</span>}
            </div>
            <div className="grid grid-cols-3 gap-[round(calc(var(--u)*24),4px)]">
              {thumbs.map((t) => (
                <button key={t.i} onClick={() => setImg(t.i)} className="group h-[round(calc(var(--u)*96),4px)] cursor-pointer overflow-hidden rounded-[round(calc(var(--u)*8),4px)] ring-[#3a4c38] ring-offset-2 transition-all duration-300 hover:ring-2">
                  <div className="size-full" style={{ scale: String(t.z), transformOrigin: t.o }}>
                    <img alt="" src={t.src} className="size-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="animate-page flex flex-col [animation-delay:120ms]">
            <div className="flex flex-col gap-[round(calc(var(--u)*24),4px)] border-b border-[#d9d9d9] pb-[round(calc(var(--u)*24),4px)]">
              <h1 className="font-evo-bold text-[length:round(calc(var(--u)*40),2px)] leading-[round(calc(var(--u)*48),4px)] whitespace-pre-wrap text-[#3a4c38]">{p.name}</h1>
              <p className="font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*16),2px)] leading-[round(calc(var(--u)*24),4px)] font-normal text-[#4c5147]">
                {d.lead}
              </p>
            </div>
            <div className="mt-[round(calc(var(--u)*16),4px)] flex flex-col gap-[round(calc(var(--u)*24),4px)]">
              <p className="font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*14),2px)] leading-[round(calc(var(--u)*16),4px)] font-normal tracking-[calc(var(--u)*4)] text-[#3a4c38] uppercase">{p.opts[0].label.includes('шт') ? 'оберіть кількість' : 'оберіть вагу'}</p>
              <div className="flex gap-[round(calc(var(--u)*16),4px)]">
                {p.opts.map((o, i) => (
                  <button
                    key={o.label}
                    onClick={() => setSel(i)}
                    className={`font-['Montserrat',sans-serif] wdth flex h-[round(calc(var(--u)*40),4px)] w-[round(calc(var(--u)*104),4px)] cursor-pointer items-center justify-center rounded-[round(calc(var(--u)*90),4px)] border text-[length:round(calc(var(--u)*16),2px)] leading-[round(calc(var(--u)*24),4px)] font-normal whitespace-nowrap transition-all duration-300 ${
                      sel === i ? 'border-[#3a4c38] bg-[#3a4c38] text-white' : 'border-[#b7b7b7] bg-white text-[#3a4c38] hover:border-[#3a4c38]'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-[round(calc(var(--u)*32),4px)] flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-[round(calc(var(--u)*16),4px)]">
                <p key={sel} className="animate-fade font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*40),2px)] leading-[round(calc(var(--u)*24),4px)] font-semibold whitespace-nowrap text-[#b05a3f]">{opt.price} ₴</p>
                <p className="font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*16),2px)] leading-[round(calc(var(--u)*24),4px)] font-normal text-[#4c5147]">{opt.note.replace('за', 'За')}</p>
              </div>
              <PrimaryButton
                className="h-[round(calc(var(--u)*64),4px)]! max-w-[round(calc(var(--u)*224),4px)] gap-[round(calc(var(--u)*16),4px)] px-[round(calc(var(--u)*24),4px)]"
                onClick={() => {
                  onAdd(id, opt.key)
                  setAdded(true)
                  setTimeout(() => setAdded(false), 1400)
                }}
              >
                <img alt="" src={`${A}/c1ddd.svg`} width={24} height={24} className="size-[round(calc(var(--u)*24),4px)] transition-transform duration-300 group-hover:-rotate-12" />
                <span>Додати до кошика</span>
              </PrimaryButton>
            </div>
            {p.sale && (
              <div className="mt-[round(calc(var(--u)*24),4px)] flex items-center gap-[round(calc(var(--u)*16),4px)] rounded-[round(calc(var(--u)*8),4px)] border border-dashed border-[#b05a3f]/50 bg-[#b05a3f]/6 p-[round(calc(var(--u)*16),4px)]">
                <span className="flex size-[round(calc(var(--u)*40),4px)] shrink-0 items-center justify-center rounded-full bg-[#b05a3f] text-white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z" /></svg>
                </span>
                <div className="flex flex-col">
                  <p className="font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*16),2px)] leading-[round(calc(var(--u)*24),4px)] font-semibold text-[#b05a3f]">{p.sale.text}</p>
                  <p className="font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*14),2px)] leading-[round(calc(var(--u)*24),4px)] text-[#4c5147]">Знижка застосується в кошику автоматично</p>
                </div>
              </div>
            )}
            <div className="mt-[round(calc(var(--u)*48),4px)] grid grid-cols-3">
              {['Формат', 'Приготування', 'Зберігання'].map((k, i) => [k, d.facts[i]]).map(([k, v], i) => (
                <div key={k} className={`group flex flex-col gap-[round(calc(var(--u)*8),4px)] px-[round(calc(var(--u)*16),4px)] ${i === 1 ? 'border-x border-[#e0e0e0]' : ''}`}>
                  <p className="font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*14),2px)] leading-[round(calc(var(--u)*16),4px)] font-normal tracking-[calc(var(--u)*2)] text-[#afafaf] uppercase transition-colors duration-300 group-hover:text-[#bf9064]">{k}</p>
                  <p className="font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*16),2px)] leading-[round(calc(var(--u)*24),4px)] font-semibold text-[#4c5147]">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-[round(calc(var(--u)*64),4px)] max-w-[round(calc(var(--u)*508),4px)]">
          <div className="relative flex gap-[round(calc(var(--u)*24),4px)] border-b border-[#c3c3c3]">
            {(['desc', 'prep'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative flex items-center justify-center cursor-pointer px-[round(calc(var(--u)*16),4px)] py-[round(calc(var(--u)*8),4px)] text-[length:round(calc(var(--u)*20),2px)] leading-[round(calc(var(--u)*48),4px)] whitespace-nowrap transition-colors duration-300 ${tab === t ? "font-['Montserrat',sans-serif] font-semibold text-[#3a4c38]" : 'font-evo text-[#636c62] hover:text-[#3a4c38]'}`}
              >
                {t === 'desc' ? 'Опис' : 'Приготування'}
                <span className={`absolute right-0 -bottom-px left-0 h-[calc(var(--u)*2)] origin-center bg-[#3a4c38] transition-transform duration-500 ease-out ${tab === t ? 'scale-x-100' : 'scale-x-0'}`} />
              </button>
            ))}
          </div>
          <div key={tab} className="animate-fade">
            {tab === 'desc' ? (
              <>
                {d.composition && <Block title="СКЛАД:" text={d.composition} border />}
                {d.shelf && <Block title="ТЕРМІН ПРИДАТНОСТІ:" text={d.shelf} border />}
                <div className="mt-[round(calc(var(--u)*16),4px)] flex flex-col gap-[round(calc(var(--u)*8),4px)] text-[length:round(calc(var(--u)*16),2px)] leading-[round(calc(var(--u)*24),4px)]">
                  {['Енергетична цінність продукту:', 'Білки:', 'Вуглеводи:'].map((k, i) => [k, ` ${d.nutrition[i]}`]).filter((_, i) => d.nutrition[i]).map(([k, v]) => (
                    <p key={k} className="font-['Montserrat',sans-serif] wdth font-normal text-[#4c5147]">
                      <span className="font-['Montserrat',sans-serif] font-semibold text-[#262626]">{k}</span>
                      {v}
                    </p>
                  ))}
                </div>
              </>
            ) : (
              d.prep && <Block title="СПОСІБ ПРИГОТУВАННЯ:" text={d.prep} />
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <>
            <h2 className="reveal font-['Montserrat',sans-serif] font-semibold mt-[round(calc(var(--u)*88),4px)] text-[length:round(calc(var(--u)*40),2px)] leading-[round(calc(var(--u)*48),4px)] text-[#3a4c38] lg:-ml-[round(calc(var(--u)*8),4px)]">{'Вам також сподобається '}</h2>
            <div className="mt-[round(calc(var(--u)*24),4px)] grid grid-cols-1 gap-[round(calc(var(--u)*24),4px)] sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r, i) => (
                <div key={r.id} className="reveal" style={{ ['--d' as string]: `${i * 90}ms` }}>
                  <MenuCard p={r} onOpen={() => openProduct(r.id)} onAdd={onAdd} />
                </div>
              ))}
            </div>
          </>
        )}
        <div className="mt-[round(calc(var(--u)*40),4px)] flex justify-center">
          <PrimaryButton onClick={() => go('menu')}>Весь асортимент</PrimaryButton>
        </div>
      </div>
    </main>
  )
}

function Block({ title, text, border = false }: { title: string; text: string; border?: boolean }) {
  return (
    <div className={`flex flex-col gap-[round(calc(var(--u)*8),4px)] py-[round(calc(var(--u)*16),4px)] ${border ? 'border-b border-[#c4c4c4]' : ''}`}>
      <p className="font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*20),2px)] leading-[round(calc(var(--u)*48),4px)] font-semibold text-[#3a4c38]">{title}</p>
      <p className="font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*16),2px)] leading-[round(calc(var(--u)*24),4px)] font-normal text-[#4c5147]">{text}</p>
    </div>
  )
}
