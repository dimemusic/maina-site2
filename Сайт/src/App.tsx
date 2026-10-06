import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Footer, Header, type Page } from './components/Layout'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Product from './pages/Product'
import Cart, { type Line } from './components/Cart'
import { useContent } from './lib/content'
import { sanitizeLines } from './lib/order-math.js'

// Адреси сторінок через History API, без бібліотек: / — головна, /menu — асортимент, /product/<id> — товар.
// Усе, що не підійшло, показує головну (а адресу виправляє на /).
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')
type Route = { page: Page; id: string }
const HOME: Route = { page: 'home', id: '' }

function parseRoute(pathname: string): Route {
  const path = (pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname).replace(/\/+$/, '') || '/'
  if (path === '/menu') return { page: 'menu', id: '' }
  const product = path.match(/^\/product\/([^/]+)$/)
  if (product) {
    try {
      return { page: 'product', id: decodeURIComponent(product[1]) }
    } catch {
      return HOME // зіпсоване кодування в адресі
    }
  }
  return HOME
}
const pathOf = ({ page, id }: Route) => BASE + (page === 'menu' ? '/menu' : page === 'product' ? `/product/${encodeURIComponent(id)}` : '/')

export default function App() {
  const { byId } = useContent()
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.pathname))
  const { page, id: pid } = route
  const pathRef = useRef(pathOf(route))
  const [rawLines, setRawLines] = useState<unknown>(() => {
    try {
      return JSON.parse(localStorage.getItem('cart') ?? '[]')
    } catch {
      return []
    }
  })
  // Товари й варіанти, яких більше немає в каталозі (їх прибрали в Sanity), відкидаємо, щоб сайт не ламався
  const lines = useMemo<Line[]>(() => sanitizeLines(rawLines, byId), [rawLines, byId])
  const setLines = (update: (ls: Line[]) => Line[]) => setRawLines((raw: unknown) => update(sanitizeLines(raw, byId)))
  const [bump, setBump] = useState(0)
  const [cartOpen, setCartOpen] = useState(false)
  const cart = lines.reduce((s, l) => s + l.qty, 0)
  useEffect(() => localStorage.setItem('cart', JSON.stringify(lines)), [lines])

  useEffect(() => {
    // Невідома адреса (наприклад /foo чи /menu/) → показуємо головну й виправляємо адресу
    if (window.location.pathname !== pathRef.current) window.history.replaceState(null, '', pathRef.current + window.location.search + window.location.hash)
    // Позицію прокрутки при «Назад/Вперед» не відновлюємо самі: нова сторінка завжди відкривається зверху
    window.history.scrollRestoration = 'manual'
    const onPop = () => {
      const next = parseRoute(window.location.pathname)
      const nextPath = pathOf(next)
      if (nextPath === pathRef.current) return // змінився лише якір (#order) на тій самій сторінці
      pathRef.current = nextPath
      setRoute(next)
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = (next: Route) => {
    const path = pathOf(next)
    if (path !== pathRef.current) {
      window.history.pushState(null, '', path) // кожна сторінка — окремий запис в історії, тож «Назад» працює
      pathRef.current = path
      setRoute(next)
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }
  const go = (p: Page) => navigate({ page: p, id: '' })
  const open = (id: string) => navigate({ page: 'product', id })
  const add = (id: string, opt: string) => {
    setLines((ls) => {
      const i = ls.findIndex((l) => l.id === id && l.opt === opt)
      return i < 0 ? [...ls, { id, opt, qty: 1 }] : ls.map((l, j) => (j === i ? { ...l, qty: l.qty + 1 } : l))
    })
    setBump((b) => b + 1)
  }
  const setQty = (i: number, qty: number) => setLines((ls) => (qty <= 0 ? ls.filter((_, j) => j !== i) : ls.map((l, j) => (j === i ? { ...l, qty } : l))))
  const closeCart = useCallback(() => setCartOpen(false), [])

  // Scroll-reveal for any element marked .reveal
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    document.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [page, pid])

  return (
    <div className="min-h-screen overflow-x-clip bg-white">
      <Header go={go} cart={cart} bump={bump} onCart={() => setCartOpen(true)} />
      <div key={page === 'product' ? pid : page} className="animate-page">
        {page === 'home' && <Home go={go} openProduct={open} />}
        {page === 'menu' && <Menu openProduct={open} onAdd={add} />}
        {page === 'product' && <Product id={pid} go={go} openProduct={open} onAdd={add} />}
      </div>
      <Cart
        open={cartOpen}
        lines={lines}
        onClose={closeCart}
        setQty={setQty}
        onClear={() => setRawLines([])}
        onOpenProduct={(id) => {
          setCartOpen(false)
          open(id)
        }}
      />
      <Footer go={go} gap={page === 'home' ? 36 : 16} />
    </div>
  )
}
