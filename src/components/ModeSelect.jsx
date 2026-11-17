import { useRef, useEffect } from 'react'
import Navbar from './Navbar.jsx'
import { GAMES } from '../data/games.js'
import { openPage } from '../publicUrl.js'

// Komedi Kartları: telefonlu (tv.html) ya da tek ekran (eski CardGame) modu seç
export default function ModeSelect({ gameId, onSingleScreen, onHome }) {
  const refs = useRef([])
  const game = GAMES[gameId]

  useEffect(() => {
    const t = setTimeout(() => refs.current[0]?.focus(), 100)
    return () => clearTimeout(t)
  }, [])

  const cards = [
    {
      emoji: '📱',
      name: 'Telefonlarla Oyna',
      desc: 'TV sunucu olur, en fazla 6 oyuncu QR kodla telefonundan katılır. Sahneye çıkan canlı söyler/oynar; kazananı sunucu seçer ya da oyuncular oylar.',
      handler: () => openPage('tv.html'),
      borderColor: '#a855f744',
    },
    {
      emoji: '📺',
      name: 'Tek Ekranda Oyna',
      desc: 'Telefon yok. Sunucu kartları okur, kazananı ekrandan seçer.',
      handler: onSingleScreen,
      borderColor: '#f59e0b44',
    },
  ]

  function onKey(e, idx, handler) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handler()
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      refs.current[idx + 1]?.focus()
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (idx === 0) return
      refs.current[idx - 1]?.focus()
    } else if (e.key === 'Escape' || e.key === 'Backspace') {
      e.preventDefault()
      onHome()
    }
  }

  return (
    <>
      <Navbar onHome={onHome} />
      <div className="screen screen-welcome">
        <div className="welcome-hero">{game ? game.emoji : '😂'}</div>
        <div className="welcome-title">{game ? game.name : 'Komedi Kartları'}</div>
        <div className="welcome-sub">Nasıl oynamak istersiniz?</div>

        <div className="games-grid" style={{ maxWidth: 760 }}>
          {cards.map((c, idx) => (
            <div
              key={c.name}
              ref={el => (refs.current[idx] = el)}
              className="game-card"
              tabIndex={0}
              style={{ borderColor: c.borderColor }}
              onClick={c.handler}
              onKeyDown={e => onKey(e, idx, c.handler)}
            >
              <span className="game-card-emoji">{c.emoji}</span>
              <div className="game-card-name">{c.name}</div>
              <div className="game-card-desc">{c.desc}</div>
            </div>
          ))}
        </div>

        <button className="btn-secondary mt12" style={{ maxWidth: 320 }} onClick={onHome}>← Geri dön</button>
      </div>
    </>
  )
}
