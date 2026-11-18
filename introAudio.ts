// Generated cinematic sound (no audio files). Nothing plays until the visitor taps the Sound button.
export function createIntroSound() {
  let ctx: AudioContext | null = null; let master: GainNode | null = null; const stops: (() => void)[] = []
  const noise = (c: AudioContext, sec = 2) => { const b = c.createBuffer(1, c.sampleRate * sec, c.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const s = c.createBufferSource(); s.buffer = b; s.loop = true; return s }
  return {
    get on() { return !!ctx },
    start() {
      if (ctx) return; const AC = window.AudioContext || (window as any).webkitAudioContext; if (!AC) return
      ctx = new AC(); const c = ctx; master = c.createGain(); master.gain.value = 0; master.connect(c.destination); master.gain.linearRampToValueAtTime(0.9, c.currentTime + 1.5)
      const rain = noise(c); const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1400; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 7500
      const rg = c.createGain(); rg.gain.value = 0.07; rain.connect(hp); hp.connect(lp); lp.connect(rg); rg.connect(master); rain.start()
      const o1 = c.createOscillator(), o2 = c.createOscillator(); o1.frequency.value = 46; o2.frequency.value = 69; o1.type = o2.type = 'sine'
      const dg = c.createGain(); dg.gain.value = 0.07; const lfo = c.createOscillator(); lfo.frequency.value = 0.12; const lg = c.createGain(); lg.gain.value = 0.03; lfo.connect(lg); lg.connect(dg.gain)
      o1.connect(dg); o2.connect(dg); dg.connect(master); o1.start(); o2.start(); lfo.start()
      stops.push(() => { rain.stop(); o1.stop(); o2.stop(); lfo.stop() })
    },
    hit(kind: 'thunder' | 'impact') {
      if (!ctx || !master) return; const c = ctx, t = c.currentTime
      if (kind === 'thunder') {
        const n = noise(c, 3); const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(600, t); f.frequency.exponentialRampToValueAtTime(70, t + 2.6)
        const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.12); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.8); n.connect(f); f.connect(g); g.connect(master); n.start(t); n.stop(t + 3)
      } else {
        const o = c.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(95, t); o.frequency.exponentialRampToValueAtTime(30, t + 1.3)
        const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.8, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6); o.connect(g); g.connect(master); o.start(t); o.stop(t + 1.7)
      }
    },
    fadeOut(ms = 1000) { if (!ctx || !master) return; const c = ctx; master.gain.cancelScheduledValues(c.currentTime); master.gain.setValueAtTime(master.gain.value, c.currentTime); master.gain.linearRampToValueAtTime(0, c.currentTime + ms / 1000); window.setTimeout(() => { stops.forEach(s => { try { s() } catch { /* already stopped */ } }); c.close().catch(() => {}); ctx = null }, ms + 80) },
  }
}
