import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createIntroSound } from './introAudio'

export type IntroItem = { id: string; name: string; video: string; poster?: string }
// Built-in sequence timeline (seconds after the tap): 1.2 hand rises · 3.6 face reveal · 6.6 full body · 11.6 title · 14.6 enter
const T = { awake: 1.2, face: 3.6, body: 6.6, title: 11.6, enter: 14.6 }
const TITLE = 'SYMBIOTES'.split('')
const lite = () => { const n = navigator as any; return (n.deviceMemory && n.deviceMemory <= 2) || (n.hardwareConcurrency && n.hardwareConcurrency <= 2) || !!n.connection?.saveData }

export default function Intro({ onDone, item }: { onDone: () => void; item?: IntroItem | null }) {
  const custom = !!item
  const reduced = useMemo(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches, [])
  const [started, setStarted] = useState(false); const [phase, setPhase] = useState(0); const [leaving, setLeaving] = useState(false); const [vidOk, setVidOk] = useState(true)
  const [snd, setSnd] = useState(false); const [flash, setFlash] = useState(0); const [fs, setFs] = useState(false); const [vio, setVio] = useState(true)
  const vid = useRef<HTMLVideoElement>(null); const cv = useRef<HTMLCanvasElement>(null); const sound = useRef(createIntroSound()); const btn = useRef<HTMLButtonElement>(null)
  const timers = useRef<number[]>([]); const done = useRef(false)
  const src = custom ? item!.video : (window.innerWidth * (window.devicePixelRatio || 1) < 1000 ? '/intro/intro-sm.mp4' : '/intro/intro.mp4')
  const poster = custom ? item!.poster : '/intro/poster.jpg'

  const finish = useCallback(() => {
    if (done.current) return; done.current = true; sound.current.fadeOut(1100); setLeaving(true)
    try { sessionStorage.setItem('sym_intro_seen', '1') } catch { /* private mode */ }
    window.setTimeout(onDone, 1000)
  }, [onDone])

  // the tap is the one user gesture the browser needs: it unlocks sound and (where supported) fullscreen
  const begin = (withSound: boolean) => {
    if (started) return; setStarted(true)
    if (withSound) { sound.current.start(); setSnd(true) }
    try { const el = document.documentElement as any; if (!document.fullscreenElement && (el.requestFullscreen || el.webkitRequestFullscreen)) (el.requestFullscreen ?? el.webkitRequestFullscreen).call(el)?.catch?.(() => {}) } catch { /* not supported (e.g. iPhone) */ }
    if (custom && vid.current) { vid.current.muted = !withSound; vid.current.play().catch(() => setVidOk(false)) }
  }

  useEffect(() => {
    if (!started) return
    if (reduced) { setPhase(4); return }
    const at = (s: number, fn: () => void) => timers.current.push(window.setTimeout(fn, s * 1000))
    if (custom) { at(0.3, () => setPhase(1)); at(9, () => setPhase(4)); return () => timers.current.forEach(clearTimeout) }
    at(0.05, () => vid.current?.play().catch(() => setVidOk(false)))
    at(T.awake, () => setPhase(1))
    at(T.face, () => { setPhase(2); setFlash(n => n + 1); sound.current.hit('thunder') })
    at(5.4, () => setVio(false))   // the hand/face scenes are cyan in the source; tint them to the purple palette, leave the statue as is
    at(T.body, () => { setPhase(2); sound.current.hit('thunder') })
    at(T.title, () => { setPhase(3); setFlash(n => n + 1); sound.current.hit('impact') })
    at(T.enter, () => setPhase(4))
    return () => timers.current.forEach(clearTimeout)
  }, [started, reduced, custom])
  useEffect(() => { if (phase >= 4) btn.current?.focus({ preventScroll: true }) }, [phase])
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') finish(); if (e.key === 'Enter') { if (!started) begin(true); else if (phase >= 4) finish() } }
    window.addEventListener('keydown', k); const prev = document.body.style.overflow; document.body.style.overflow = 'hidden'
    const f = () => setFs(!!document.fullscreenElement); document.addEventListener('fullscreenchange', f)
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = prev; document.removeEventListener('fullscreenchange', f) }
  })

  // atmosphere: rain + particles drawn at the screen's real resolution, paused when the tab is hidden
  useEffect(() => {
    const c = cv.current; if (!c || reduced || custom) return; const g = c.getContext('2d'); if (!g) return
    const low = lite(); const dpr = Math.min(window.devicePixelRatio || 1, low ? 1 : 2); let W = 0, H = 0, raf = 0, last = performance.now()
    type D = { x: number; y: number; l: number; v: number; a: number }
    let rain: D[] = [], dust: { x: number; y: number; r: number; v: number; a: number; p: number }[] = []
    const size = () => { W = window.innerWidth; H = window.innerHeight; c.width = W * dpr; c.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.max(70, Math.min(low ? 120 : 260, Math.round(W * H / 9000))); rain = Array.from({ length: n }, () => ({ x: Math.random() * (W + 200) - 100, y: Math.random() * H, l: 14 + Math.random() * 26, v: 900 + Math.random() * 700, a: 0.1 + Math.random() * 0.28 }))
      dust = Array.from({ length: low ? 25 : 60 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: 0.6 + Math.random() * 1.6, v: 6 + Math.random() * 16, a: 0.1 + Math.random() * 0.35, p: Math.random() * 6 })) }
    size(); window.addEventListener('resize', size)
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw); const dt = Math.min(0.05, (now - last) / 1000); last = now; if (document.visibilityState !== 'visible') return
      g.clearRect(0, 0, W, H); g.lineWidth = 1; g.lineCap = 'round'
      for (const d of rain) { d.y += d.v * dt; d.x -= d.v * dt * 0.18; if (d.y > H + 40) { d.y = -40; d.x = Math.random() * (W + 200) - 60 } g.strokeStyle = `rgba(209,184,255,${d.a})`; g.beginPath(); g.moveTo(d.x, d.y); g.lineTo(d.x + d.l * 0.18, d.y - d.l); g.stroke() }
      for (const p of dust) { p.y -= p.v * dt; p.p += dt; p.x += Math.sin(p.p) * 8 * dt; if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W } g.fillStyle = `rgba(209,184,255,${p.a * (0.6 + 0.4 * Math.sin(p.p * 2))})`; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.283); g.fill() }
    }
    raf = requestAnimationFrame(draw); return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', size) }
  }, [reduced, custom])

  const toggleSound = () => { if (snd) { sound.current.fadeOut(500); sound.current = createIntroSound(); setSnd(false); if (vid.current) vid.current.muted = true } else { sound.current.start(); setSnd(true); if (vid.current) vid.current.muted = false } }
  const goFs = () => { const el = document.documentElement as any; if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); else (el.requestFullscreen ?? el.webkitRequestFullscreen)?.call(el)?.catch?.(() => {}) }
  const canFs = !!(document.fullscreenEnabled || (document as any).webkitFullscreenEnabled)

  return (
    <div className={'in-root' + (leaving ? ' leaving' : '') + ' ph' + phase + (started ? ' started' : '') + (custom ? ' custom' : '') + (vio && !custom ? ' vio' : '')} role="dialog" aria-label="SYMBIOTES opening" aria-modal="true">
      <div className="in-cam"><div className="in-stage">
        {vidOk
          ? <video ref={vid} className="in-vid" src={src} poster={poster} muted playsInline preload={started ? 'auto' : 'metadata'} onError={() => setVidOk(false)} onEnded={() => custom && setPhase(4)} />
          : <img className="in-vid in-kb" src={poster || '/intro/poster.jpg'} alt="" />}
      </div></div>
      <i className="in-fog f1" /><i className="in-fog f2" /><i className="in-fog f3" />
      {!custom && <canvas ref={cv} className="in-cv" aria-hidden="true" />}
      <i className="in-vig" />
      {flash > 0 && <i key={flash} className="in-flash" />}

      {!started && (
        <div className="in-gate">
          <img className="in-emblem on" src="/intro/emblem.webp" alt="" />
          <p className="in-welcome">SYMBIOTES</p>
          <button className="in-btn" onClick={() => begin(true)} autoFocus>TAP TO ENTER</button>
          <p className="in-tag">🔊 sound on · full screen</p>
          <button className="in-link" onClick={() => begin(false)}>Enter without sound</button>
        </div>)}

      {started && !custom && (
        <div className="in-title" aria-hidden={phase < 3 && !reduced}>
          <img className="in-emblem" src="/intro/emblem.webp" alt="" />
          <h1 className="in-word" aria-label="SYMBIOTES">{TITLE.map((l, i) => <span key={i} style={{ animationDelay: `${i * 0.09}s` }}>{l}</span>)}</h1>
        </div>)}
      <div className="in-enter">
        <p className="in-welcome">WELCOME TO SYMBIOTES</p>
        <p className="in-tag">Enter the darkness. Become one of us.</p>
        <button ref={btn} className="in-btn" onClick={finish} tabIndex={phase >= 4 ? 0 : -1}>ENTER WEBSITE</button>
      </div>

      <div className="in-bar">
        {canFs && <button className="in-mini" onClick={goFs} aria-label="Toggle fullscreen">{fs ? '⤡ Exit fullscreen' : '⛶ Fullscreen'}</button>}
        {started && <button className="in-mini" onClick={toggleSound} aria-pressed={snd} aria-label="Sound">{snd ? '🔊 Sound on' : '🔇 Sound off'}</button>}
        <button className="in-mini in-skip" onClick={finish}>SKIP INTRO ⏭</button>
      </div>
    </div>
  )
}
