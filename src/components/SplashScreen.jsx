import { useEffect } from 'react'

function playIntroSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const t = ctx.currentTime

    // Low body — "tok" hissi
    const osc1 = ctx.createOscillator()
    const g1 = ctx.createGain()
    osc1.connect(g1); g1.connect(ctx.destination)
    osc1.type = 'sine'
    osc1.frequency.value = 180
    g1.gain.setValueAtTime(0.35, t)
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.14)
    osc1.start(t); osc1.stop(t + 0.15)

    // High ring — temiz çıngırak
    const osc2 = ctx.createOscillator()
    const g2 = ctx.createGain()
    osc2.connect(g2); g2.connect(ctx.destination)
    osc2.type = 'sine'
    osc2.frequency.value = 880
    g2.gain.setValueAtTime(0.18, t + 0.01)
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.32)
    osc2.start(t + 0.01); osc2.stop(t + 0.35)
  } catch (_) {}
}

export default function SplashScreen({ onDone, duration = 2000 }) {
  useEffect(() => {
    playIntroSound()
    const timer = setTimeout(onDone, duration)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="splash-overlay">
      <div className="splash-inner">
        <div className="splash-emoji"><img className="logo-img" src={import.meta.env.BASE_URL + 'icon.png'} alt="" /></div>
        <div className="splash-title">Yusuf Show</div>
        <div className="splash-sub">Yükleniyor…</div>
        <div className="splash-dots">
          <span /><span /><span />
        </div>
      </div>
    </div>
  )
}
