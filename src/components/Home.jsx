import { useRef, useEffect } from 'react'
import Navbar from './Navbar.jsx'
import { GAMES } from '../data/games.js'

export default function Home({ onOpenGame, onOpenLogoQuiz, onOpenOkNok, onOpenSubmit }) {
  const cardRefs = useRef([])

  useEffect(() => {
    const t = setTimeout(() => cardRefs.current[0]?.focus(), 100)
    return () => clearTimeout(t)
  }, [])

  function handleCardKey(e, idx, handler) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handler()
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      cardRefs.current[idx + 1]?.focus()
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      cardRefs.current[idx - 1]?.focus()
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
    {
      id: '__submit__',
      handler: onOpenSubmit,
      borderColor: '#22c55e44',
      emoji: '✍️',
      name: 'Kart / Soru Gönder',
      desc: 'QR ile telefonundan kendi kartını yolla',
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
      <Navbar onHome={() => {}} />
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
    </>
  )
}
