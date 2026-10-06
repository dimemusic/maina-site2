import { A, PrimaryButton, type Page } from '../components/Layout'
import { HitCard } from '../components/Products'
import { contactLinks, sized, useContent, type Product } from '../lib/content'

// Іконки блоку «переваги» — частина дизайну, підставляються за порядком
const FEATURE_ICONS = ['a87ad.svg', '32d9e.svg', '9cbb2.svg']

export default function Home({ go, openProduct }: { go: (p: Page) => void; openProduct: (id: string) => void }) {
  const { home, site, byId, products } = useContent()
  // Хіти: список із Sanity; якщо він порожній, беремо товари з позначкою «Хіт продажів»
  const picked = home.hits.map((id) => byId[id]).filter((p): p is Product => !!p)
  const hits = picked.length > 0 ? picked : products.filter((p) => p.isHit)
  const tagRows = [home.tags.slice(0, 3), home.tags.slice(3, 6)].filter((r) => r.length > 0)
  const heroRows = [['3c512.svg', site.address], ['931b3.svg', site.phone], ['e95a5.svg', site.workingHours]].filter(([, t]) => t)
  const links = contactLinks(site)
  const contactCards = ([['Instagram', links.instagram], ['Telegram', links.telegram], ['Viber', links.viber], ['WhatsApp', links.whatsapp], ['Телефон', links.phone]] as const).flatMap(([t, l]) => (l ? [[t, l.label, l.href] as const] : []))
  const heroImg = sized(home.heroImage, 1600)
  return (
    <main>
      {/* Hero */}
      <section className="group/hero relative isolate overflow-hidden">
        <img alt="Магазин Maina by Rivka" src={heroImg} className="animate-page absolute inset-0 -z-20 size-full object-cover transition-transform duration-[2.4s] ease-out group-hover/hero:scale-[1.03] md:hidden" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(28,38,27,0.75)_0%,rgba(28,38,27,0.88)_100%)] md:hidden" />
        <div className="mx-auto max-w-[round(calc(var(--u)*1200),4px)] px-6 max-md:flex max-md:min-h-[calc(100svh-64px)] max-md:flex-col max-md:justify-center max-md:pt-10 max-md:pb-16 md:grid md:gap-12 md:pt-[round(calc(var(--u)*64),4px)] lg:grid-cols-2 lg:gap-[round(calc(var(--u)*24),4px)] xl:px-0">
          <div className="flex flex-col">
          <p className="animate-page font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*12),2px)] leading-[round(calc(var(--u)*16),4px)] font-normal tracking-[calc(var(--u)*4)] text-[#6f7c66] max-md:text-[#d9c9a3] uppercase">{home.heroEyebrow}</p>
          <h1 className="animate-page font-evo mt-6 md:mt-[round(calc(var(--u)*64),4px)] text-[length:round(calc(var(--u)*56),2px)] leading-[round(calc(var(--u)*56),4px)] tracking-[calc(var(--u)*-2)] text-[#3a4c38] max-md:text-[#faf6ec] [animation-delay:80ms]">{home.heroTitle}</h1>
          <p className="animate-page font-['Montserrat',sans-serif] wdth mt-[round(calc(var(--u)*16),4px)] max-w-[round(calc(var(--u)*363),4px)] text-[length:round(calc(var(--u)*14),2px)] leading-[round(calc(var(--u)*24),4px)] font-normal text-[#808080] max-md:text-[#faf6ec]/80 [animation-delay:160ms]">
            {home.heroText}
          </p>
          <div className="animate-page mt-[round(calc(var(--u)*24),4px)] hidden flex-col gap-[round(calc(var(--u)*8),4px)] [animation-delay:240ms] md:flex">
            {tagRows.map((row, i) => (
              <div key={i} className="flex flex-wrap gap-[round(calc(var(--u)*8),4px)]">
                {row.map((t) => (
                  <span key={t} className="font-['Montserrat',sans-serif] wdth inline-flex items-center justify-center rounded-[round(calc(var(--u)*40),4px)] border border-[rgba(47,58,46,0.41)] px-[round(calc(var(--u)*16),4px)] py-[round(calc(var(--u)*4),4px)] text-[length:round(calc(var(--u)*12),2px)] leading-[round(calc(var(--u)*24),4px)] font-semibold text-[rgba(76,81,71,0.4)]">
                    {t}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div className="animate-page mt-6 md:mt-[round(calc(var(--u)*32),4px)] flex flex-col gap-[round(calc(var(--u)*8),4px)] [animation-delay:320ms]">
            {heroRows.map(([i, t]) => (
              <div key={t} className="group flex items-center gap-[round(calc(var(--u)*16),4px)]">
                <img alt="" src={`${A}/${i}`} width={18} height={18} className="size-[round(calc(var(--u)*18),4px)] max-md:brightness-0 max-md:invert transition-transform duration-300 group-hover:scale-125" />
                <p className="font-evo text-[length:round(calc(var(--u)*12),2px)] leading-[round(calc(var(--u)*24),4px)] whitespace-pre text-[#272727] max-md:text-[#faf6ec]">{t}</p>
              </div>
            ))}
          </div>
          <div className="animate-page mt-8 md:mt-[round(calc(var(--u)*48),4px)] flex flex-col gap-[round(calc(var(--u)*8),4px)] [animation-delay:400ms]">
            <PrimaryButton onClick={() => go('menu')} className="max-md:!max-w-none max-md:!bg-[#faf6ec] max-md:!text-[#3a4c38]">
              Обрати страви
            </PrimaryButton>
            <a href="#order" className="font-evo flex h-[round(calc(var(--u)*56),4px)] w-full max-w-[round(calc(var(--u)*320),4px)] max-md:max-w-none items-center justify-center rounded-[round(calc(var(--u)*8),4px)] border border-[#3a4c38] max-md:border-[#faf6ec]/70 p-[round(calc(var(--u)*16),4px)] text-[length:round(calc(var(--u)*16),2px)] leading-[round(calc(var(--u)*24),4px)] text-[#3a4c38] max-md:text-[#faf6ec] transition-all duration-300 hover:bg-[#3a4c38]/6 max-md:hover:bg-[#faf6ec]/10 hover:tracking-[calc(var(--u)*0.5)]">
              Як замовити?
            </a>
          </div>
          </div>
          <div className="animate-page group relative hidden h-[round(calc(var(--u)*420),4px)] overflow-hidden rounded-[round(calc(var(--u)*8),4px)] shadow-[0px_-1px_40.9px_0px_rgba(0,0,0,0.25)] [animation-delay:200ms] md:block lg:h-[round(calc(var(--u)*612),4px)]">
            <img alt="Магазин Maina by Rivka" src={heroImg} className="size-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-105" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto mt-[round(calc(var(--u)*80),4px)] grid max-w-[round(calc(var(--u)*1200),4px)] px-6 md:grid-cols-3 xl:px-0">
        {home.features.map((f, i) => (
          <div key={f._key} style={{ ['--d' as string]: `${i * 120}ms` }} className={`reveal group flex flex-col gap-[round(calc(var(--u)*8),4px)] px-[round(calc(var(--u)*24),4px)] py-[round(calc(var(--u)*8),4px)] ${i === 1 ? 'md:border-x md:border-[rgba(47,58,46,0.5)]' : ''} ${i > 0 ? 'max-md:border-t max-md:border-[rgba(47,58,46,0.2)]' : ''} max-md:px-0 max-md:py-[round(calc(var(--u)*16),4px)]`}>
            <div className="flex items-center gap-[round(calc(var(--u)*8),4px)]">
              <img alt="" src={`${A}/${FEATURE_ICONS[i % FEATURE_ICONS.length]}`} height={24} className="h-[round(calc(var(--u)*24),4px)] transition-transform duration-500 group-hover:rotate-[20deg] group-hover:scale-110" />
              <p className="font-evo-bold text-[length:round(calc(var(--u)*16),2px)] leading-[round(calc(var(--u)*32),4px)] text-[#3a4c38]">{f.title}</p>
            </div>
            <p className="font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*14),2px)] leading-[round(calc(var(--u)*24),4px)] font-normal text-[#6d7268]">{f.text}</p>
          </div>
        ))}
      </section>

      {/* Ticker */}
      {home.ticker.length > 0 && (
        <div className="mt-[round(calc(var(--u)*64),4px)] h-[round(calc(var(--u)*32),4px)] overflow-hidden bg-[#41593e]">
          <div className="animate-marquee flex h-full w-max items-center gap-[round(calc(var(--u)*80),4px)] pr-[round(calc(var(--u)*80),4px)]">
            {[...home.ticker, ...home.ticker, ...home.ticker, ...home.ticker].map((t, i) => (
              <p key={i} className="font-evo text-[length:round(calc(var(--u)*16),2px)] whitespace-pre text-[#819d7e]">{t}</p>
            ))}
          </div>
        </div>
      )}

      {/* Hits */}
      <section className="mx-auto mt-[round(calc(var(--u)*40),4px)] max-w-[round(calc(var(--u)*1200),4px)] px-6 xl:px-0">
        <p className="reveal font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*12),2px)] leading-[round(calc(var(--u)*16),4px)] font-normal tracking-[calc(var(--u)*4)] text-[#bf9064] uppercase">{home.hitsEyebrow}</p>
        <h2 className="reveal font-evo-bold mt-[round(calc(var(--u)*16),4px)] text-[length:round(calc(var(--u)*40),2px)] leading-[round(calc(var(--u)*48),4px)] text-[#3a4c38]">{home.hitsTitle}</h2>
        <div className="mt-[round(calc(var(--u)*24),4px)] grid grid-cols-1 gap-x-[round(calc(var(--u)*24),4px)] gap-y-[round(calc(var(--u)*24),4px)] sm:grid-cols-2 lg:grid-cols-4">
          {hits.map((p, i) => (
            <div key={p.id} className="reveal" style={{ ['--d' as string]: `${(i % 4) * 90}ms` }}>
              <HitCard p={p} onOpen={() => openProduct(p.id)} />
            </div>
          ))}
        </div>
        <div className="mt-[round(calc(var(--u)*40),4px)] flex justify-center">
          <PrimaryButton onClick={() => go('menu')} className="max-md:!max-w-none">Переглянути все меню</PrimaryButton>
        </div>
      </section>

      {/* Delivery */}
      <section className="mt-[round(calc(var(--u)*40),4px)] bg-[#3a4c38] px-6 pt-[round(calc(var(--u)*32),4px)] pb-[round(calc(var(--u)*56),4px)] xl:px-0 lg:pb-[round(calc(var(--u)*112),4px)]">
        <div className="relative mx-auto max-w-[round(calc(var(--u)*1200),4px)]">
          <h2 className="reveal font-evo-bold text-[length:round(calc(var(--u)*40),2px)] leading-[round(calc(var(--u)*48),4px)] text-white">{home.deliveryTitle}</h2>
          
          <div className="relative mt-[round(calc(var(--u)*56),4px)]">
            <img alt="" src={`${A}/dabf7.svg`} className="pointer-events-none absolute bottom-full mb-[round(calc(var(--u)*16),4px)] left-[round(calc(var(--u)*598),4px)] hidden h-[round(calc(var(--u)*58.419),4px)] w-[round(calc(var(--u)*266.246),4px)] -scale-y-100 rotate-[-4.5deg] lg:block" />
            <img alt="" src={`${A}/ffc93.svg`} className="pointer-events-none absolute top-full mt-[round(calc(var(--u)*16),4px)] left-[round(calc(var(--u)*159),4px)] hidden h-[round(calc(var(--u)*50.216),4px)] w-[round(calc(var(--u)*266.246),4px)] rotate-[3.59deg] lg:block" />
          <div className="grid gap-[round(calc(var(--u)*24),4px)] md:grid-cols-3 lg:gap-[round(calc(var(--u)*24),4px)]">
            {home.steps.map((s, i) => (
              <div key={s._key} className="reveal group flex flex-col" style={{ ['--d' as string]: `${i * 150}ms` }}>
                <div className="relative aspect-[339/198] overflow-hidden rounded-t-[round(calc(var(--u)*8),4px)]">
                  {s.img && <img alt="" src={sized(s.img, 900)} loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                </div>
                <div className="flex min-h-[round(calc(var(--u)*144),4px)] flex-col gap-[round(calc(var(--u)*8),4px)] rounded-b-[round(calc(var(--u)*8),4px)] bg-[#263325] p-[round(calc(var(--u)*16),4px)] transition-colors duration-500 group-hover:bg-[#1f2a1e]">
                  <p className="font-evo-bold text-[length:round(calc(var(--u)*20),2px)] leading-[round(calc(var(--u)*32),4px)] text-[#f2f2f2]">
                    <span className="mr-[round(calc(var(--u)*16),4px)] inline-block transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:text-[#bf9064]">{i + 1}.</span>
                    {s.title}
                  </p>
                  <p className="font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*14),2px)] leading-[round(calc(var(--u)*24),4px)] font-normal text-[#869383]">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
          </div>
          
        </div>
      </section>

      {/* Order */}
      <section id="order" className="mx-auto mt-[round(calc(var(--u)*40),4px)] grid max-w-[round(calc(var(--u)*1200),4px)] scroll-mt-[round(calc(var(--u)*120),4px)] gap-[round(calc(var(--u)*24),4px)] px-6 pb-[round(calc(var(--u)*80),4px)] lg:grid-cols-2 lg:items-end xl:px-0">
        <div className="flex flex-col">
          <p className="reveal font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*12),2px)] leading-[round(calc(var(--u)*16),4px)] font-normal tracking-[calc(var(--u)*4)] text-[#3a4c38] uppercase">{home.orderEyebrow}</p>
          <h2 className="reveal font-evo-bold mt-[round(calc(var(--u)*16),4px)] text-[length:round(calc(var(--u)*40),2px)] leading-[round(calc(var(--u)*48),4px)] text-[#3a4c38]">{home.orderTitle}</h2>
          <p className="reveal font-['Montserrat',sans-serif] wdth mt-[round(calc(var(--u)*16),4px)] max-w-[round(calc(var(--u)*443),4px)] text-[length:round(calc(var(--u)*16),2px)] leading-[round(calc(var(--u)*24),4px)] font-normal text-[#4c5147]">
            {home.orderText}
          </p>
          <div className="reveal group mt-[round(calc(var(--u)*16),4px)] h-[round(calc(var(--u)*456),4px)] overflow-hidden rounded-[round(calc(var(--u)*8),4px)]">
            {home.orderImage && <img alt="" src={sized(home.orderImage, 1200)} loading="lazy" className="size-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-105" />}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-[round(calc(var(--u)*24),4px)] sm:grid-cols-2">
          {contactCards.map(([t, s, href], i) => (
            <a key={t} href={href} {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})} className="reveal group flex h-[round(calc(var(--u)*136),4px)] flex-col rounded-[round(calc(var(--u)*8),4px)] border border-[#c3c3c3] bg-white p-[round(calc(var(--u)*24),4px)] transition-all duration-300 hover:-translate-y-1 hover:border-[#3a4c38] hover:shadow-[0_16px_30px_-18px_rgba(38,51,37,0.6)]" style={{ ['--d' as string]: `${i * 70}ms` }}>
              <p className="font-evo-bold text-[length:round(calc(var(--u)*20),2px)] leading-[round(calc(var(--u)*32),4px)] text-[#3a4c38]">{t}</p>
              <p className="font-['Montserrat',sans-serif] wdth pt-[round(calc(var(--u)*8),4px)] text-[length:round(calc(var(--u)*14),2px)] leading-[round(calc(var(--u)*24),4px)] font-normal text-[#4c5147]">{s}</p>
              <p className="font-['Montserrat',sans-serif] wdth mt-[round(calc(var(--u)*16),4px)] flex gap-[round(calc(var(--u)*8),4px)] text-[length:round(calc(var(--u)*14),2px)] leading-[round(calc(var(--u)*24),4px)] font-medium text-[#3a4c38]">
                Перейти <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
              </p>
            </a>
          ))}
          <button onClick={() => go('menu')} className="reveal group flex h-[round(calc(var(--u)*136),4px)] cursor-pointer flex-col rounded-[round(calc(var(--u)*8),4px)] border border-[rgba(47,58,46,0.12)] bg-[#3a4c38] p-[round(calc(var(--u)*24),4px)] text-left transition-all duration-300 hover:-translate-y-1 hover:bg-[#2c3b2a] hover:shadow-[0_16px_30px_-14px_rgba(38,51,37,0.8)]" style={{ ['--d' as string]: '350ms' }}>
            <p className="font-evo-bold text-[length:round(calc(var(--u)*20),2px)] leading-[round(calc(var(--u)*32),4px)] text-[#f0f0f0]">Кошик на сайті</p>
            <p className="font-['Montserrat',sans-serif] wdth pt-[round(calc(var(--u)*8),4px)] text-[length:round(calc(var(--u)*14),2px)] leading-[round(calc(var(--u)*24),4px)] font-normal text-[#a4a4a4]">Оформити онлайн</p>
            <p className="font-['Montserrat',sans-serif] wdth mt-[round(calc(var(--u)*16),4px)] flex gap-[round(calc(var(--u)*8),4px)] text-[length:round(calc(var(--u)*14),2px)] leading-[round(calc(var(--u)*24),4px)] font-medium text-[#80927e] transition-colors duration-300 group-hover:text-white">
              Перейти <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
            </p>
          </button>
        </div>
      </section>
    </main>
  )
}
