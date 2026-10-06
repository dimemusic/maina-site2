import { useCallback, useEffect, useState } from 'react'
import { Footer, Header, type Page } from './components/Layout'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Product from './pages/Product'
import Cart, { type Line } from './components/Cart'
import { sanitizeLines } from './data/catalog.js'

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [lines, setLines] = useState<Line[]>(() => {
    try {
      // Товари, яких більше немає в каталозі, відкидаємо, щоб сайт не ламався
      return sanitizeLines(JSON.parse(localStorage.getItem('cart') ?? '[]'))
    } catch {
      return []
    }
  })
  const [bump, setBump] = useState(0)
  const [cartOpen, setCartOpen] = useState(false)
  const cart = lines.reduce((s, l) => s + l.qty, 0)
  useEffect(() => localStorage.setItem('cart', JSON.stringify(lines)), [lines])
  const [pid, setPid] = useState('pelmeni')

  const go = (p: Page) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }
  const open = (id: string) => {
    setPid(id)
    go('product')
  }
  const add = (id: string, opt: number) => {
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
        onClear={() => setLines([])}
        onOpenProduct={(id) => {
          setCartOpen(false)
          open(id)
        }}
      />
      <Footer go={go} gap={page === 'home' ? 36 : 16} />
    </div>
  )
}
