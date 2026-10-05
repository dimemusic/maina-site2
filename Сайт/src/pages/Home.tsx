import { A, PrimaryButton, type Page } from '../components/Layout'
import { HitCard, P } from '../components/Products'

const TAGS = [['# Вареники', '# Пельмені', '# Крафтовий сир'], ['# Ковбаси', '# Випічка', '# Консервація']]
const FEATURES = [
  { icon: 'a87ad.svg', title: 'Ліплено руками', text: 'Жодних конвеєрів. Кожен вареник загорнуто вручну щодня.' },
  { icon: '32d9e.svg', title: 'Швидка заморозка', text: 'Шокова заморозка зберігає смак так, ніби щойно зі столу.' },
  { icon: '9cbb2.svg', title: 'Чистий склад', text: 'Фермерські продукти, без замінників та зайвої хімії.' },
]
const HITS = ['varenyky', 'kovbasa', 'khinkaliMeat', 'vyshnya', 'khlib', 'khinkaliCheese', 'pelmeni', 'syr']
const STEPS = [
  { title: 'Герметично пакуємо', text: 'Кожну позицію пакуємо окремо, щоб зберегти свіжість, смак і захистити продукти в дорозі.', img: 'f535c.png', crop: true },
  { title: 'Зберігаємо температуру', text: 'Кожну позицію пакуємо окремо, щоб зберегти свіжість, смак і захистити продукти в дорозі.', img: '29d1f.png' },
  { title: 'Передаємо в доставку', text: 'Надійно фіксуємо замовлення в коробці та передаємо перевізнику в день відправлення.', img: '5f9d4.png' },
]
const CONTACTS = [
  ['Instagram', '@maina.by.rivka'],
  ['Telegram', 'Написати в чат'],
  ['Viber', '+380 67 000 00 00'],
  ['WhatsApp', '+380 67 000 00 00'],
  ['Телефон', '+380 67 000 00 00'],
]
const TICKER = ['🥐  Тільки що прийшла додому, 5 хв і все готово', '🥟  Тільки що прийшла додому, 5 хв і все готово', '🧀  Тільки що прийшла додому, 5 хв і все готово']

export default function Home({ go, openProduct }: { go: (p: Page) => void; openProduct: (id: string) => void }) {
  return (
    <main>
      {/* Hero */}
      <section className="group/hero relative isolate overflow-hidden">
        <img alt="Магазин Maina by Rivka" src={`${A}/33110.png`} className="animate-page absolute inset-0 -z-20 size-full object-cover transition-transform duration-[2.4s] ease-out group-hover/hero:scale-[1.03] md:hidden" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(28,38,27,0.75)_0%,rgba(28,38,27,0.88)_100%)] md:hidden" />
        <div className="mx-auto max-w-[round(calc(var(--u)*1200),4px)] px-6 max-md:flex max-md:min-h-[calc(100svh-64px)] max-md:flex-col max-md:justify-center max-md:pt-10 max-md:pb-16 md:grid md:gap-12 md:pt-[round(calc(var(--u)*64),4px)] lg:grid-cols-2 lg:gap-[round(calc(var(--u)*24),4px)] xl:px-0">
          <div className="flex flex-col">
          <p className="animate-page font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*12),2px)] leading-[round(calc(var(--u)*16),4px)] font-normal tracking-[calc(var(--u)*4)] text-[#6f7c66] max-md:text-[#d9c9a3] uppercase">Домашня кухня · з 2026</p>
          <h1 className="animate-page font-evo mt-6 md:mt-[round(calc(var(--u)*64),4px)] text-[length:round(calc(var(--u)*56),2px)] leading-[round(calc(var(--u)*56),4px)] tracking-[calc(var(--u)*-2)] text-[#3a4c38] max-md:text-[#faf6ec] [animation-delay:80ms]">Maina by Rivka </h1>
          <p className="animate-page font-['Montserrat',sans-serif] wdth mt-[round(calc(var(--u)*16),4px)] max-w-[round(calc(var(--u)*363),4px)] text-[length:round(calc(var(--u)*14),2px)] leading-[round(calc(var(--u)*24),4px)] font-normal text-[#808080] max-md:text-[#faf6ec]/80 [animation-delay:160ms]">
            Це заморожені напівфабрикати, свіжий хліб, крафтові сири, ковбаси та консервація. Готуємо так, як для власної родини, і привозимо по всій Україні.
          </p>
          <div className="animate-page mt-[round(calc(var(--u)*24),4px)] hidden flex-col gap-[round(calc(var(--u)*8),4px)] [animation-delay:240ms] md:flex">
            {TAGS.map((row, i) => (
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
            {[['3c512.svg', 'м. _____ вул. ______'], ['931b3.svg', '+ 380 XX XXX XX XX'], ['e95a5.svg', 'Пн - Нд  |  9:00 - 20:20']].map(([i, t]) => (
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
            <img alt="Магазин Maina by Rivka" src={`${A}/33110.png`} className="size-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-105" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto mt-[round(calc(var(--u)*80),4px)] grid max-w-[round(calc(var(--u)*1200),4px)] px-6 md:grid-cols-3 xl:px-0">
        {FEATURES.map((f, i) => (
          <div key={f.title} style={{ ['--d' as string]: `${i * 120}ms` }} className={`reveal group flex flex-col gap-[round(calc(var(--u)*8),4px)] px-[round(calc(var(--u)*24),4px)] py-[round(calc(var(--u)*8),4px)] ${i === 1 ? 'md:border-x md:border-[rgba(47,58,46,0.5)]' : ''} ${i > 0 ? 'max-md:border-t max-md:border-[rgba(47,58,46,0.2)]' : ''} max-md:px-0 max-md:py-[round(calc(var(--u)*16),4px)]`}>
            <div className="flex items-center gap-[round(calc(var(--u)*8),4px)]">
              <img alt="" src={`${A}/${f.icon}`} height={24} className="h-[round(calc(var(--u)*24),4px)] transition-transform duration-500 group-hover:rotate-[20deg] group-hover:scale-110" />
              <p className="font-evo-bold text-[length:round(calc(var(--u)*16),2px)] leading-[round(calc(var(--u)*32),4px)] text-[#3a4c38]">{f.title}</p>
            </div>
            <p className="font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*14),2px)] leading-[round(calc(var(--u)*24),4px)] font-normal text-[#6d7268]">{f.text}</p>
          </div>
        ))}
      </section>

      {/* Ticker */}
      <div className="mt-[round(calc(var(--u)*64),4px)] h-[round(calc(var(--u)*32),4px)] overflow-hidden bg-[#41593e]">
        <div className="animate-marquee flex h-full w-max items-center gap-[round(calc(var(--u)*80),4px)] pr-[round(calc(var(--u)*80),4px)]">
          {[...TICKER, ...TICKER, ...TICKER, ...TICKER].map((t, i) => (
            <p key={i} className="font-evo text-[length:round(calc(var(--u)*16),2px)] whitespace-pre text-[#819d7e]">{t}</p>
          ))}
        </div>
      </div>

      {/* Hits */}
      <section className="mx-auto mt-[round(calc(var(--u)*40),4px)] max-w-[round(calc(var(--u)*1200),4px)] px-6 xl:px-0">
        <p className="reveal font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*12),2px)] leading-[round(calc(var(--u)*16),4px)] font-normal tracking-[calc(var(--u)*4)] text-[#bf9064] uppercase">Хіти продажів</p>
        <h2 className="reveal font-evo-bold mt-[round(calc(var(--u)*16),4px)] text-[length:round(calc(var(--u)*40),2px)] leading-[round(calc(var(--u)*48),4px)] text-[#3a4c38]">З чого почати</h2>
        <div className="mt-[round(calc(var(--u)*24),4px)] grid grid-cols-1 gap-x-[round(calc(var(--u)*24),4px)] gap-y-[round(calc(var(--u)*24),4px)] sm:grid-cols-2 lg:grid-cols-4">
          {HITS.map((id, i) => (
            <div key={id} className="reveal" style={{ ['--d' as string]: `${(i % 4) * 90}ms` }}>
              <HitCard p={P[id]} onOpen={() => openProduct(id)} />
            </div>
          ))}
        </div>
        <div className="mt-[round(calc(var(--u)*40),4px)] flex justify-center">
          <PrimaryButton onClick={() => go('menu')}>Переглянути все меню</PrimaryButton>
        </div>
      </section>

      {/* Delivery */}
      <section className="mt-[round(calc(var(--u)*40),4px)] bg-[#3a4c38] px-6 pt-[round(calc(var(--u)*32),4px)] pb-[round(calc(var(--u)*56),4px)] xl:px-0 lg:pb-[round(calc(var(--u)*112),4px)]">
        <div className="relative mx-auto max-w-[round(calc(var(--u)*1200),4px)]">
          <h2 className="reveal font-evo-bold text-[length:round(calc(var(--u)*40),2px)] leading-[round(calc(var(--u)*48),4px)] text-white">Як відбувається доставка ?</h2>
          
          <div className="relative mt-[round(calc(var(--u)*56),4px)]">
            <img alt="" src={`${A}/dabf7.svg`} className="pointer-events-none absolute bottom-full mb-[round(calc(var(--u)*16),4px)] left-[round(calc(var(--u)*598),4px)] hidden h-[round(calc(var(--u)*58.419),4px)] w-[round(calc(var(--u)*266.246),4px)] -scale-y-100 rotate-[-4.5deg] lg:block" />
            <img alt="" src={`${A}/ffc93.svg`} className="pointer-events-none absolute top-full mt-[round(calc(var(--u)*16),4px)] left-[round(calc(var(--u)*159),4px)] hidden h-[round(calc(var(--u)*50.216),4px)] w-[round(calc(var(--u)*266.246),4px)] rotate-[3.59deg] lg:block" />
          <div className="grid gap-[round(calc(var(--u)*24),4px)] md:grid-cols-3 lg:gap-[round(calc(var(--u)*24),4px)]">
            {STEPS.map((s, i) => (
              <div key={s.title} className="reveal group flex flex-col" style={{ ['--d' as string]: `${i * 150}ms` }}>
                <div className="relative aspect-[339/198] overflow-hidden rounded-t-[round(calc(var(--u)*8),4px)]">
                  {s.crop ? (
                    <img alt="" src={`${A}/${s.img}`} className="absolute top-[-70.91%] left-[-43.66%] h-[172.13%] w-[149.85%] max-w-none transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <img alt="" src={`${A}/${s.img}`} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  )}
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
          <p className="reveal font-['Montserrat',sans-serif] wdth text-[length:round(calc(var(--u)*12),2px)] leading-[round(calc(var(--u)*16),4px)] font-normal tracking-[calc(var(--u)*4)] text-[#3a4c38] uppercase">Оформлення</p>
          <h2 className="reveal font-evo-bold mt-[round(calc(var(--u)*16),4px)] text-[length:round(calc(var(--u)*40),2px)] leading-[round(calc(var(--u)*48),4px)] text-[#3a4c38]">Замовити - просто</h2>
          <p className="reveal font-['Montserrat',sans-serif] wdth mt-[round(calc(var(--u)*16),4px)] max-w-[round(calc(var(--u)*443),4px)] text-[length:round(calc(var(--u)*16),2px)] leading-[round(calc(var(--u)*24),4px)] font-normal text-[#4c5147]">
            Оберіть зручний спосіб — напишіть у месенджер, зателефонуйте або складіть кошик на сайті. Відправляємо по всій Україні Новою Поштою, у Києві — власним кур’єром.
          </p>
          <div className="reveal group mt-[round(calc(var(--u)*16),4px)] h-[round(calc(var(--u)*456),4px)] overflow-hidden rounded-[round(calc(var(--u)*8),4px)]">
            <img alt="" src={`${A}/33110.png`} className="size-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-105" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-[round(calc(var(--u)*24),4px)] sm:grid-cols-2">
          {CONTACTS.map(([t, s], i) => (
            <a key={t} href="#" className="reveal group flex h-[round(calc(var(--u)*136),4px)] flex-col rounded-[round(calc(var(--u)*8),4px)] border border-[#c3c3c3] bg-white p-[round(calc(var(--u)*24),4px)] transition-all duration-300 hover:-translate-y-1 hover:border-[#3a4c38] hover:shadow-[0_16px_30px_-18px_rgba(38,51,37,0.6)]" style={{ ['--d' as string]: `${i * 70}ms` }}>
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
