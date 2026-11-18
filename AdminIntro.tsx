import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from './lib'
import type { IntroItem } from './Intro'

type Cfg = { active: string; items: IntroItem[] }
const MAX_MB = 25
const pub = (p: string) => supabase.storage.from('site-media').getPublicUrl(p).data.publicUrl

// first-frame poster, made in the browser so the admin only uploads one file
async function posterOf(f: File): Promise<Blob | null> {
  const url = URL.createObjectURL(f)
  try {
    const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.src = url
    await new Promise<void>((res, rej) => { v.onloadeddata = () => res(); v.onerror = () => rej(new Error('bad video')) })
    v.currentTime = Math.min(1, (v.duration || 2) / 3); await new Promise<void>(r => { v.onseeked = () => r(); window.setTimeout(r, 1500) })
    const c = document.createElement('canvas'); const w = Math.min(1280, v.videoWidth || 1280); c.width = w; c.height = Math.round(w * (v.videoHeight || 720) / (v.videoWidth || 1280))
    c.getContext('2d')!.drawImage(v, 0, 0, c.width, c.height); return await new Promise(r => c.toBlob(r, 'image/jpeg', 0.82))
  } catch { return null } finally { URL.revokeObjectURL(url) }
}

export function AdminIntro() {
  const [cfg, setCfg] = useState<Cfg>({ active: 'builtin', items: [] }); const [name, setName] = useState(''); const [file, setFile] = useState<File | null>(null); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false)
  useEffect(() => { supabase.from('site_settings').select('value').eq('key', 'intro').maybeSingle().then(r => r.data?.value && setCfg({ active: r.data.value.active ?? 'builtin', items: r.data.value.items ?? [] })) }, [])
  const save = async (next: Cfg, ok = 'Saved ✅') => {
    const { error } = await supabase.from('site_settings').upsert({ key: 'intro', value: next, updated_at: new Date().toISOString() })
    if (error) setMsg(error.message + ' (run SYMBIOTES_PHASE5_INTRO.sql?)'); else { setCfg(next); setMsg(ok) }
  }
  const add = async () => {
    if (!file || name.trim().length < 2) return; setBusy(true); setMsg('')
    if (!/^video\/(mp4|webm)$/.test(file.type)) { setBusy(false); return setMsg('Use an MP4 or WebM video.') }
    if (file.size > MAX_MB * 1048576) { setBusy(false); return setMsg(`Video is ${(file.size / 1048576).toFixed(1)} MB. Maximum is ${MAX_MB} MB. Compress it first.`) }
    const id = 'c' + Date.now().toString(36); const ext = file.type === 'video/webm' ? 'webm' : 'mp4'
    const v = await supabase.storage.from('site-media').upload(`intro/${id}.${ext}`, file, { contentType: file.type })
    if (v.error) { setBusy(false); return setMsg('Upload failed: ' + v.error.message) }
    let poster: string | undefined; const pb = await posterOf(file)
    if (pb) { const p = await supabase.storage.from('site-media').upload(`intro/${id}.jpg`, pb, { contentType: 'image/jpeg' }); if (!p.error) poster = pub(`intro/${id}.jpg`) }
    await save({ active: id, items: [...cfg.items, { id, name: name.trim(), video: pub(`intro/${id}.${ext}`), poster }] }, 'Added and set as the starting animation ✅')
    setName(''); setFile(null); setBusy(false)
  }
  const del = async (it: IntroItem) => {
    if (!confirm(`Delete "${it.name}"?`)) return
    const base = it.video.split('/site-media/')[1]; if (base) await supabase.storage.from('site-media').remove([base, base.replace(/\.(mp4|webm)$/, '.jpg')])
    await save({ active: cfg.active === it.id ? 'builtin' : cfg.active, items: cfg.items.filter(x => x.id !== it.id) }, 'Deleted')
  }
  const Row = ({ id, title, sub, it }: { id: string; title: string; sub: string; it?: IntroItem }) => (
    <label className="glass p-3 flex items-center gap-3 cursor-pointer"><input type="radio" name="act" checked={cfg.active === id} onChange={() => save({ ...cfg, active: id }, `"${title}" is now the starting animation ✅`)} />
      <div className="flex-1 min-w-0"><b className="block truncate">{title}</b><small className="text-gray-400">{sub}</small></div>
      {it?.poster && <img src={it.poster} alt="" className="w-20 rounded" />}{it && <button className="text-rose-300 text-xs underline" onClick={e => { e.preventDefault(); del(it) }}>Delete</button>}</label>)
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2"><Link to="/admin" className="text-xs underline text-gray-400">← Admin</Link><h1 className="text-xl font-bold">🎬 Starting animation</h1></div>
      <p className="text-sm text-gray-300">Choose what visitors see when they first open the website (once per visit). Visitors tap once to start it, which also unlocks sound and full screen.</p>
      <Row id="builtin" title="SYMBIOTES Awakening (built-in)" sub="Cinematic sequence with generated rain, thunder and title reveal" />
      {cfg.items.map(it => <Row key={it.id} id={it.id} title={it.name} sub="Custom video" it={it} />)}
      <Row id="none" title="No animation" sub="Go straight to the website" />
      <a className="sym-btn inline-block" href="/?intro=preview" target="_blank" rel="noreferrer">▶ Preview the active one</a>
      <section className="glass p-3" aria-label="Add animation"><b>➕ Add a new animation</b>
        <p className="text-xs text-gray-400 mb-2">Landscape 16:9 MP4 or WebM, up to {MAX_MB} MB (1080p, 10–20 seconds is ideal). Any sound inside the video plays when the visitor taps “Enter with sound”.</p>
        <input className="sym-inp" placeholder="Name, e.g. Diwali intro" value={name} maxLength={40} onChange={e => setName(e.target.value)} />
        <label className="upload-box !p-3 text-sm block">🎞️ {file ? file.name : 'Choose video file'}<input type="file" accept="video/mp4,video/webm" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} /></label>
        <button className="sym-btn w-full mt-2" disabled={busy || !file || name.trim().length < 2} onClick={add}>{busy ? 'Uploading…' : 'Upload and use it'}</button>
      </section>
      {msg && <p className="text-amber-300 text-sm" role="status">{msg}</p>}
    </div>)
}
