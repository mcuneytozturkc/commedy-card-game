import { useState, useRef, useEffect } from 'react'
import Navbar from './Navbar.jsx'
import { OKNOK_QUESTIONS, getToxicity } from '../data/oknok.js'
import { shuffle, confetti } from '../confetti.js'
import SplashScreen from './SplashScreen.jsx'

const ROUND_COUNT = 10

export default function OkNok({ onHome }) {
  const [splash, setSplash] = useState(true)
  const [stage, setStage] = useState('setup') // setup | game | result
  const [sunucu, setSunucu] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [partnerName, setPartnerName] = useState('')
  const [questions, setQuestions] = useState([])
  const [qIdx, setQIdx] = useState(0)
  const [answers, setAnswers] = useState([])
  const okBtnRef = useRef(null)

  useEffect(() => {
    if (stage === 'game') okBtnRef.current?.focus()
  }, [stage, qIdx])

  if (splash) {
    return <SplashScreen duration={750} onDone={() => setSplash(false)} />
  }

  // ===== SETUP =====
  function startGame() {
    setQuestions(shuffle([...OKNOK_QUESTIONS]).slice(0, ROUND_COUNT))
    setQIdx(0)
    setAnswers([])
    setStage('game')
  }

  if (stage === 'setup') {
    return (
      <>
        <Navbar onHome={onHome} />
        <div className="screen screen-lq" style={{ justifyContent: 'center' }}>
          <div className="oknok-setup-card">
            <div style={{ fontSize: 64, marginBottom: 8 }}>💑</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 20 }}>Ok mu Nok mu?</h2>
            <input
              className="lq-input"
              placeholder="Sunucu"
              value={sunucu}
              maxLength={20}
              onChange={e => setSunucu(e.target.value)}
              autoFocus
            />
            <input
              className="lq-input"
              style={{ marginTop: 10 }}
              placeholder="Oyuncu adı"
              value={playerName}
              maxLength={30}
              onChange={e => setPlayerName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') startGame() }}
            />
            <input
              className="lq-input"
              style={{ marginTop: 10 }}
              placeholder="Partner adı"
              value={partnerName}
              maxLength={30}
              onChange={e => setPartnerName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') startGame() }}
            />
            <button className="lq-btn lq-btn-primary" style={{ marginTop: 20 }} onClick={startGame}>
              Oyuna Başla 🚀
            </button>
          </div>
          <button className="btn-secondary" style={{ maxWidth: 480, marginTop: 12 }} onClick={onHome}>
            ← Ana menü
          </button>
        </div>
      </>
    )
  }

  // ===== RESULT =====
  if (stage === 'result') {
    const nokCount = answers.filter(a => a === 'nok').length
    const okCount  = answers.filter(a => a === 'ok').length
    const tox = getToxicity(nokCount)
    const player = playerName.trim() || 'Oyuncu'
    const partner = partnerName.trim() || 'Partner'
    if (nokCount === 0) confetti()

    return (
      <>
        <Navbar onHome={onHome} />
        <div className="screen screen-lq" style={{ justifyContent: 'center' }}>
          <div className="oknok-result-card">
            <div className="oknok-result-emoji">{tox.emoji}</div>
            <div className="oknok-result-couple">{player}</div>
            <div className="oknok-result-title">{tox.title}</div>
            <div className="oknok-result-msg">{tox.msg}</div>

            <div className="oknok-result-msg" style={{ marginTop: 12, fontStyle: 'italic', fontSize: 15, color: 'var(--text-muted)' }}>
              {partner} umarız cevaplardan mutlusundur. {player} toxic mi değil mi sen açıkla.
            </div>

            <div className="oknok-score-row">
              <div className="oknok-score-block oknok-ok">
                <span className="oknok-score-num">{okCount}</span>
                <span className="oknok-score-lbl">✅ Ok</span>
              </div>
              <div className="oknok-score-divider" />
              <div className="oknok-score-block oknok-nok">
                <span className="oknok-score-num">{nokCount}</span>
                <span className="oknok-score-lbl">❌ Nok</span>
              </div>
            </div>

            <div className="oknok-toxbar-wrap">
              <div className="oknok-toxbar">
                <div
                  className="oknok-toxbar-fill"
                  style={{ width: `${(nokCount / ROUND_COUNT) * 100}%` }}
                />
              </div>
              <div className="oknok-toxbar-labels">
                <span>💚 Sağlıklı</span>
                <span>☠️ Toxik</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 8, flexWrap: 'wrap' }}>
              <button className="lq-btn lq-btn-primary" style={{ flex: 1 }} onClick={startGame}>
                Tekrar Oyna
              </button>
              <button className="lq-btn lq-btn-outline" style={{ flex: 1 }} onClick={onHome}>
                Ana menü
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  // ===== GAME =====
  const question = questions[qIdx]
  const progress = (qIdx / ROUND_COUNT) * 100

  function handleChoice(val) {
    const next = [...answers, val]
    setAnswers(next)
    if (qIdx + 1 >= ROUND_COUNT) {
      setStage('result')
    } else {
      setQIdx(qIdx + 1)
    }
  }

  return (
    <>
      <Navbar
        onHome={onHome}
        center={<div className="nav-game-badge">💑 Ok mu Nok mu?</div>}
        right={
          <span style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 700 }}>
            {qIdx + 1} / {ROUND_COUNT}
          </span>
        }
      />
      <div className="screen screen-lq" style={{ justifyContent: 'center' }}>
        <div className="oknok-game-card">
          <div className="oknok-progress-wrap">
            <div className="oknok-progress-bar">
              <div className="oknok-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, textAlign: 'right' }}>
              Soru {qIdx + 1} / {ROUND_COUNT}
            </div>
          </div>

          <div className="oknok-question">
            <span className="oknok-q-icon">🤔</span>
            <div className="oknok-q-text">{question}</div>
          </div>

          <div className="oknok-choices">
            <button
              ref={okBtnRef}
              className="oknok-choice oknok-choice-ok"
              onClick={() => handleChoice('ok')}
            >
              <span className="oknok-choice-icon">✅</span>
              <span className="oknok-choice-label">Ok</span>
              <span className="oknok-choice-sub">Normal, olabilir</span>
            </button>
            <button
              className="oknok-choice oknok-choice-nok"
              onClick={() => handleChoice('nok')}
            >
              <span className="oknok-choice-icon">❌</span>
              <span className="oknok-choice-label">Nok</span>
              <span className="oknok-choice-sub">Kabul edilemez!</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
