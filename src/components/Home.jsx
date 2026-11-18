import { useRef, useEffect, useState } from 'react'
import Navbar from './Navbar.jsx'
import { GAMES } from '../data/games.js'
import { openPage } from '../publicUrl.js'

export default function Home({ onOpenGame, onOpenLogoQuiz, onOpenOkNok, onOpenSubmit }) {
  const cardRefs = useRef([])
  const plusRef = useRef(null)
  const optRefs = useRef([])
  const [menu, setMenu] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => cardRefs.current[0]?.focus(), 100)
    return () => clearTimeout(t)
  }, [])

  // Menü açılınca ilk seçeneğe, kapanınca + düğmesine odaklan (kumandayla gezilebilsin)
  useEffect(() => {
    if (menu) setTimeout(() => optRefs.current[0]?.focus(), 50)
  }, [menu])
  const closeMenu = () => { setMenu(false); setTimeout(() => plusRef.current?.focus(), 50) }

  function onMenuKey(e, idx) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); optRefs.current[idx + 1]?.focus() }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); optRefs.current[idx - 1]?.focus() }
    else if (e.key === 'Escape' || e.key === 'Backspace') { e.preventDefault(); closeMenu() }
  }

  function handleCardKey(e, idx, handler) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handler()
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      cardRefs.current[idx + 1]?.focus()
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (idx === 0) plusRef.current?.focus()
      else cardRefs.current[idx - 1]?.focus()
    }
  }

  const gameList = Object.values(GAMES)

  // Ek oyunlar (sabit kartlar)
  const extraCards = [
    {
      id: '__logo__',
      handler: onOpenLogoQuiz,
      borderColor: '#7c3aed44',
      emoji: '🏷️',
      name: 'Logo Bilmece',
      desc: 'Kim daha çok bilecek?',
    },
    {
      id: '__oknok__',
      handler: onOpenOkNok,
      borderColor: '#ec489944',
      emoji: '💑',
      name: 'Ok mu Nok mu?',
      desc: 'Hmm...',
    },
  ]

  const GAME_DESCS = {
    comedy: 'Sen olsan ne derdin?',
  }

  const allCards = [...gameList.map(g => ({
    id: g.id,
    handler: () => onOpenGame(g.id),
    borderColor: g.color + '44',
    emoji: g.emoji,
    name: g.name,
    desc: GAME_DESCS[g.id] || g.description,
  })), ...extraCards]

  return (
    <>
      <Navbar
        onHome={() => {}}
        right={
          <button
            ref={plusRef}
            className="nav-plus"
            title="Kart / Soru gönder"
            aria-label="Kart / Soru gönder"
            onClick={() => setMenu(true)}
            onKeyDown={(e) => { if (e.key === 'ArrowDown') { e.preventDefault(); cardRefs.current[0]?.focus() } }}
          >+</button>
        }
      />
      <div className="screen screen-welcome">
        <div className="welcome-hero">🎭</div>
        <div className="welcome-title">Yusuf Show</div>
        <div className="welcome-sub">Tiyatral komedi kart oyunu — 2 ila 6 oyuncu, 1 sunucu</div>

        <div className="games-grid">
          {allCards.map((card, idx) => (
            <div
              key={card.id}
              ref={el => (cardRefs.current[idx] = el)}
              className="game-card"
              tabIndex={0}
              style={{ borderColor: card.borderColor }}
              onClick={card.handler}
              onKeyDown={e => handleCardKey(e, idx, card.handler)}
            >
              <span className="game-card-emoji">{card.emoji}</span>
              <div className="game-card-name">{card.name}</div>
              <div className="game-card-desc">{card.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {menu && (
        <div className="modal-back" onClick={closeMenu}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">✍️ Kart / Soru Gönder</div>
            <div className="modal-sub">Kendi kartını yaz, admin onaylarsa oyuna eklensin.</div>
            <button ref={el => (optRefs.current[0] = el)} className="modal-opt" onKeyDown={(e) => onMenuKey(e, 0)}
              onClick={() => { setMenu(false); onOpenSubmit() }}>
              <span className="modal-opt-emoji">📱</span>
              <span><b>QR okut</b><small>Telefonunla okutup formu telefondan doldur</small></span>
            </button>
            <button ref={el => (optRefs.current[1] = el)} className="modal-opt" onKeyDown={(e) => onMenuKey(e, 1)}
              onClick={() => openPage('submit.html')}>
              <span className="modal-opt-emoji">💻</span>
              <span><b>Forma git</b><small>Bu cihazda formu aç</small></span>
            </button>
            <button ref={el => (optRefs.current[2] = el)} className="btn-secondary" style={{ marginTop: 6 }} onKeyDown={(e) => onMenuKey(e, 2)} onClick={closeMenu}>Vazgeç</button>
          </div>
        </div>
      )}
    </>
  )
}
