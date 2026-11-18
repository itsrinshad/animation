import { Suspense, lazy, useEffect, useState } from 'react'
import { supabase } from './lib'
import type { IntroItem } from './Intro'
const Intro = lazy(() => import('./Intro'))

// Admin-controlled: site_settings.intro = { active: 'builtin' | 'none' | <custom id>, items: IntroItem[] }.
// Plays once per browser session. ?nointro skips it, ?intro=preview forces it (used by the admin Preview button).
const q = () => location.search
const forced = () => /[?&]intro=preview\b/.test(q())
const wanted = () => { try { return forced() || (!sessionStorage.getItem('sym_intro_seen') && !/[?&]nointro\b/.test(q())) } catch { return false } }
export function IntroGate() {
  const [state, setState] = useState<'wait' | 'off' | 'on'>(wanted() ? 'wait' : 'off'); const [item, setItem] = useState<IntroItem | null>(null)
  useEffect(() => {
    if (state !== 'wait') return; let live = true
    const timeout = new Promise<null>(r => window.setTimeout(() => r(null), 2200))
    Promise.race([Promise.resolve(supabase.from('site_settings').select('value').eq('key', 'intro').maybeSingle()).then(r => r.data?.value ?? null).catch(() => null), timeout]).then((cfg: any) => {
      if (!live) return
      const active = cfg?.active ?? 'builtin'
      if (active === 'none' && !forced()) return setState('off')
      const it = (cfg?.items ?? []).find((x: IntroItem) => x.id === active) ?? null
      setItem(active !== 'builtin' ? it : null); setState('on')
    })
    return () => { live = false }
  }, [state])
  if (state === 'off') return null
  if (state === 'wait') return <div className="in-boot" />
  return <Suspense fallback={<div className="in-boot" />}><Intro item={item} onDone={() => { setState('off'); if (forced()) history.replaceState(null, '', location.pathname) }} /></Suspense>
}
