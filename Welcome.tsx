import { Link } from 'react-router-dom'
import { BGS, CHARS } from './catalog'
import { DeadlineBanner } from './deadline'
import { UploadGuide } from './Uploads'
import { GuildLinks } from './Home'
import { BigWord, Marquee, Reveal, useCine } from './Cine'

const FEATURES: [string, string, string][] = [
  ['🏆', 'Leaderboards & glory', 'Weekly and lifetime rankings, a personal glory tracker and a live weekly deadline countdown.'],
  ['💬', 'Guild chat', 'Group chats and direct messages with your teammates.'],
  ['📣', 'News & polls', 'Announcements from the admins and polls everyone can vote in.'],
  ['🏅', 'Achievements', 'Badges for Glory Champion, Weekly MVP, Most Active and more.'],
  ['🧑‍🎤', '5 characters & wardrobe', 'Pick a chibi companion, dress it with 45 skins each and feed it 9 foods.'],
  ['🏠', 'Your own room', 'A live 16:9 profile room with 5 backgrounds and up to 14 decorations.'],
  ['🚶', 'Roaming companion', 'Your mini character walks, sits and naps across every page.'],
  ['📤', 'Player uploads', 'Create characters, skins, foods and backgrounds for everyone.'],
  ['📡', 'Activity tab', 'See who is active and inactive today.'],
]
const BENEFITS = ['A friendly, active guild family', 'Weekly rewards: 3,000 glory = a new skin, 5,000 = a new character', 'Climb the leaderboard and collect badges', 'Decorate a room and show it off to visitors', 'Teammates and tips for every game night']
const STEPS = ['Ask an admin for an account (use Join below).', 'Log in, then add your game name and photo on My Profile.', 'Meet your companion on the LEO page: feed it, dress it, pick a room.', 'Play with the guild. Glory is recorded 10–11 PM IST; the week closes Sunday 11:59 PM IST.', 'Hit 3,000 or 5,000 glory in a week and claim your reward.', 'Make your own art on the Upload page. Admins approve it and you get notified.']

// Public landing page (no login). Cinematic scroll experience.
export function Welcome() {
  useCine()
  return (
    <div className="cine">
      <div className="scroll-bar" aria-hidden="true" />
      <section className="hero" aria-label="SYMBIOTES">
        <div className="hero-rays" aria-hidden="true" /><div className="hero-glow" aria-hidden="true" />
        <div className="hero-ghost" aria-hidden="true">SYMBIOTES</div>
        <div className="hero-in">
          <p className="eyebrow">Free Fire guild · official platform</p>
          <h1 className="hero-h"><span>Enter</span><span>the Dark.</span></h1>
          <p className="serif hero-sub">Different players. One united team.</p>
          <div className="hero-cta"><a href="#join" className="cta cta-fill">Join the guild</a><Link to="/login" className="cta">Login</Link></div>
        </div>
        <a href="#feat" className="scroll-cue" aria-label="Scroll down"><i /></a>
      </section>

      <Marquee words={['GLORY', 'RANKS', 'CHAT', 'ROOMS', 'REWARDS', 'LEGACY']} outline />

      <section id="feat" className="sec"><BigWord>IMPACT</BigWord>
        <Reveal><p className="serif cap">Everything the guild needs, in one place.</p></Reveal>
        <div className="grid3">{FEATURES.map(([i, t, d], n) => <Reveal key={t} delay={(n % 3) * 0.08} className="fcard"><b className="num">{String(n + 1).padStart(2, '0')}</b><span className="fi" aria-hidden="true">{i}</span><h3>{t}</h3><p>{d}</p></Reveal>)}</div>
      </section>

      <Marquee words={['ENTER THE DARKNESS', 'BECOME ONE OF US']} reverse />

      <section className="sec"><BigWord outline>RISE</BigWord>
        <Reveal><p className="serif cap">Why join?</p></Reveal>
        <ol className="lines">{BENEFITS.map((b, i) => <Reveal as="li" key={b} delay={i * 0.06}><em>{String(i + 1).padStart(2, '0')}</em><span>{b}</span></Reveal>)}</ol>
      </section>

      <section className="sec" aria-label="Characters"><BigWord>CAST</BigWord>
        <Reveal><p className="serif cap">Meet the 5 characters.</p></Reveal>
        <div className="hscroll">{CHARS.map(c => <Reveal key={c.key} className="ccard"><div className="cglow" /><img src={`/assets/chars/${c.key}/default.png`} alt={`${c.nick}`} loading="lazy" /><b>#{String(c.num).padStart(2, '0')} · {c.nick}</b><small>{c.first} {c.last}</small></Reveal>)}</div>
      </section>

      <section className="sec" aria-label="Rooms"><BigWord outline>REALMS</BigWord>
        <Reveal><p className="serif cap">Five rooms to call home.</p></Reveal>
        <div className="hscroll wide">{BGS.map(b => <Reveal key={b.code} className="rcard"><img src={`/assets/bg/${b.code}_t.jpg`} alt={b.name} loading="lazy" /><div><b>{b.name}</b><small>{b.unlock}</small></div></Reveal>)}</div>
      </section>

      <section className="sec"><BigWord>PATH</BigWord>
        <Reveal><p className="serif cap">How to use the site.</p></Reveal>
        <ol className="steps">{STEPS.map((s, i) => <Reveal as="li" key={s} delay={i * 0.05}><i>{i + 1}</i><span>{s}</span></Reveal>)}</ol>
        <Reveal><DeadlineBanner /></Reveal>
      </section>

      <section className="sec"><Reveal><UploadGuide /></Reveal></section>

      <section id="join" className="sec cta-sec"><BigWord>JOIN US</BigWord>
        <Reveal><p className="serif cap">Message an admin for your account, then log in.</p></Reveal>
        <Reveal><div className="my-3"><GuildLinks /></div><div className="hero-cta"><Link to="/login" className="cta cta-fill">Login</Link></div></Reveal>
        <footer className="foot">SYMBIOTES © Free Fire guild family</footer>
      </section>
    </div>)
}
