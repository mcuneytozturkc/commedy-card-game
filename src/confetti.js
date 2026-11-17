export function confetti() {
  const cols = ['#a855f7', '#ec4899', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#fff']
  for (let i = 0; i < 70; i++) {
    setTimeout(() => {
      const el = document.createElement('div')
      el.className = 'confetti-piece'
      const sz = 6 + Math.random() * 9
      el.style.cssText =
        `left:${Math.random() * 100}vw;top:-20px;width:${sz}px;height:${sz}px;` +
        `background:${cols[~~(Math.random() * cols.length)]};` +
        `border-radius:${Math.random() > 0.5 ? '50%' : '3px'};` +
        `animation-duration:${1.4 + Math.random() * 2.2}s;`
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 4000)
    }, i * 25)
  }
}

export function shuffle(a) {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) {
    const j = ~~(Math.random() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}
