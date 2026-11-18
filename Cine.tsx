import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

// Small helpers for the cinematic scroll style: reveal-on-scroll, marquee strips and a scroll-driven parallax variable.
export function useCine() {
  useEffect(() => {
    const root = document.documentElement; let raf = 0
    const on = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; const max = Math.max(1, root.scrollHeight - window.innerHeight); root.style.setProperty('--sy', String(window.scrollY)); root.style.setProperty('--sp', String(window.scrollY / max)) }) }
    on(); window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on)
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); if (raf) cancelAnimationFrame(raf) }
  }, [])
}
export function Reveal({ children, delay = 0, className = '', as: Tag = 'div', style }: { children: ReactNode; delay?: number; className?: string; as?: any; style?: CSSProperties }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    if (!('IntersectionObserver' in window)) { el.classList.add('in'); return }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { el.classList.add('in'); io.unobserve(el) } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' })
    io.observe(el); return () => io.disconnect()
  }, [])
  return <Tag ref={ref} className={'rv ' + className} style={{ ...style, transitionDelay: delay + 's' }}>{children}</Tag>
}
export function Marquee({ words, reverse, outline }: { words: string[]; reverse?: boolean; outline?: boolean }) {
  const row = words.map((w, i) => <span key={i}>{w}<i aria-hidden="true">✦</i></span>)
  return <div className={'mq' + (outline ? ' mq-o' : '') + (reverse ? ' mq-r' : '')} aria-hidden="true"><div className="mq-t">{row}{row}</div></div>
}
export function BigWord({ children, outline }: { children: string; outline?: boolean }) {
  return <Reveal className={'bigword' + (outline ? ' bw-o' : '')}><span>{children}</span></Reveal>
}
