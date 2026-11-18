import { useState, useEffect } from 'react'
import Navbar from './Navbar.jsx'
import { GAMES, TEAM_COLORS, TYPE_CONFIG } from '../data/games.js'
import { getContent, refreshContent } from '../content.js'
import { confetti, shuffle } from '../confetti.js'
import SplashScreen from './SplashScreen.jsx'

function PhaseBar({ phase }) {
  const order = { card: 0, judge: 1, result: 2 }
  const cur = order[phase]
  const stepCls = (i) => 'ph-step' + (i < cur ? ' done' : i === cur ? ' active' : '')
  const lineCls = (i) => 'ph-line' + (i < cur ? ' done' : '')
  return (
    <div className="phase-bar">
      <div className={stepCls(0)}>1</div>
      <div className={lineCls(1)} />
      <div className={stepCls(1)}>2</div>
      <div className={lineCls(2)} />
      <div className={stepCls(2)}>3</div>
    </div>
  )
}

export default function CardGame({ gameId, onHome }) {
  const game = GAMES[gameId]
  useEffect(() => { refreshContent() }, [])

  const [splash, setSplash] = useState(true)
  const [stage, setStage] = useState('setup') // setup | howto | game | end
  const [hostName, setHostName] = useState('')
  const [roundCount, setRoundCount] = useState(10)
  const [teamCount, setTeamCount] = useState(2)
  const [teamNames, setTeamNames] = useState(['Takım 1', 'Takım 2', 'Takım 3', 'Takım 4'])
  const [teams, setTeams] = useState([])
  const [deck, setDeck] = useState([])
  const [cardIndex, setCardIndex] = useState(0)
  const [phase, setPhase] = useState('card') // card | judge | result
  const [flipped, setFlipped] = useState(false)
  const [showJudgeBtn, setShowJudgeBtn] = useState(false)
  const [judgeWinner, setJudgeWinner] = useState(null)

  const currentCard = deck[cardIndex]

  function goToHowTo() {
    setStage('howto')
  }

  function startGame() {
    const ts = []
    for (let i = 0; i < teamCount; i++) {
      ts.push({ name: (teamNames[i] || ('Takım ' + (i + 1))).trim() || ('Takım ' + (i + 1)), color: TEAM_COLORS[i], score: 0 })
    }
    setTeams(ts)
    setDeck(shuffle([...(gameId === 'comedy' ? getContent().comedy : game.cards)]).slice(0, roundCount))
    setCardIndex(0)
    setPhase('card')
    setFlipped(false)
    setShowJudgeBtn(false)
    setJudgeWinner(null)
    setStage('game')
  }

  function flipCard() {
    if (phase !== 'card' || flipped) return
    setFlipped(true)
    setTimeout(() => setShowJudgeBtn(true), 700)
  }

  function startJudge() {
    setJudgeWinner(null)
    setPhase('judge')
  }

  function selectWinner(idx) {
    setJudgeWinner(idx)
    setTimeout(() => {
      if (idx >= 0) {
        setTeams((prev) => prev.map((t, i) => (i === idx ? { ...t, score: t.score + 1 } : t)))
        confetti()
      }
      setPhase('result')
    }, 350)
  }

  function nextCard() {
    const ni = cardIndex + 1
    if (ni >= deck.length) {
      endGame()
      return
    }
    setCardIndex(ni)
    setJudgeWinner(null)
    setFlipped(false)
    setShowJudgeBtn(false)
    setPhase('card')
  }

  function endGame() {
    const sorted = [...teams].sort((a, b) => b.score - a.score)
    if (sorted[0] && sorted[0].score > (sorted[1] ? sorted[1].score : 0)) confetti()
    setStage('end')
  }

  if (splash) {
    return <SplashScreen duration={750} onDone={() => setSplash(false)} />
  }

  // ===== SETUP =====
  if (stage === 'setup') {
    return (
      <>
        <Navbar onHome={onHome} />
        <div className="screen screen-setup">
          <div className="setup-container fade-in">
            <div className="setup-header">
              <div style={{ fontSize: 52, marginBottom: 8 }}>{game.emoji}</div>
              <h2>{game.name}</h2>
            </div>

            <div className="setup-section">
              <div className="host-input-row">
                <span className="host-icon">🎤</span>
                <input
                  className="setup-input"
                  placeholder="Sunucu adı"
                  value={hostName}
                  maxLength={20}
                  onChange={(e) => setHostName(e.target.value)}
                />
              </div>
            </div>

            <div className="setup-section">
              <div className="setup-label">Tur sayısı</div>
              <div className="count-buttons">
                {[5, 10, 15, 20].map((n) => (
                  <button
                    key={n}
                    className={'count-btn' + (roundCount === n ? ' selected' : '')}
                    onClick={() => setRoundCount(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="setup-section">
              <div className="setup-label">Kaç takım?</div>
              <div className="count-buttons">
                {[2, 3, 4].map((n) => (
                  <button
                    key={n}
                    className={'count-btn' + (teamCount === n ? ' selected' : '')}
                    onClick={() => setTeamCount(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="setup-section">
              <div className="setup-label">Takım isimleri</div>
              <div className="teams-inputs">
                {Array.from({ length: teamCount }).map((_, i) => (
                  <div className="team-input-row" key={i}>
                    <div className="team-color-dot" style={{ background: TEAM_COLORS[i] }} />
                    <input
                      className="setup-input"
                      placeholder={'Takım ' + (i + 1)}
                      value={teamNames[i]}
                      maxLength={20}
                      onChange={(e) => {
                        const next = [...teamNames]
                        next[i] = e.target.value
                        setTeamNames(next)
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button className="btn-primary" onClick={goToHowTo}>
              Oyunu Başlat 🚀
            </button>
            <button className="btn-secondary mt12" onClick={onHome}>
              ← Geri dön
            </button>
          </div>
        </div>
      </>
    )
  }

  // ===== HOW TO =====
  if (stage === 'howto') {
    return (
      <>
        <Navbar onHome={onHome} />
        <div className="screen screen-setup">
          <div className="setup-container fade-in">
            <div className="setup-header">
              <div style={{ fontSize: 64, marginBottom: 8 }}>{game.emoji}</div>
              <h2>Nasıl Oynanır?</h2>
              <p style={{ lineHeight: 1.7, fontSize: 17 }}>
                Sunucu kartları okur, takımlar oynar.<br />
                En çok güldüren takım puanları toplar.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 4 }}>
                {roundCount} tur • {teamCount} takım
              </p>
            </div>
            <button className="btn-primary" onClick={startGame}>
              Hazır, Oyuna Başla! 🚀
            </button>
            <button className="btn-secondary mt12" onClick={() => setStage('setup')}>
              ← Geri dön
            </button>
          </div>
        </div>
      </>
    )
  }

  // ===== END =====
  if (stage === 'end') {
    const sorted = [...teams].sort((a, b) => b.score - a.score)
    const medals = ['🥇', '🥈', '🥉', '4️⃣']
    const winnerLead = sorted[0] && sorted[0].score > (sorted[1] ? sorted[1].score : 0)
    let rank = 1
    return (
      <>
        <Navbar onHome={onHome} />
        <div className="screen screen-end">
          <div className="end-container fade-in">
            <div className="end-trophy">🏆</div>
            <div className="end-title">{winnerLead ? (sorted[0].name + ' Kazandı! 🎉') : 'Oyun Bitti!'}</div>
            <div className="end-sub">{roundCount} tur oynandı • Tebrikler!</div>
            <div className="final-scores">
              {sorted.map((t, i) => {
                if (i > 0 && t.score < sorted[i - 1].score) rank = i + 1
                return (
                  <div className={'final-row' + (i === 0 ? ' first' : '')} key={t.name + i}>
                    <span className="final-rank">{medals[rank - 1] || rank}</span>
                    <div className="final-dot" style={{ background: t.color }} />
                    <div className="final-name">{t.name}</div>
                    <div className="final-score">
                      {t.score} <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>puan</span>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="end-actions">
              <button className="btn-game" onClick={onHome}>Yeni Oyuna Başla</button>
            </div>
          </div>
        </div>
      </>
    )
  }

  // ===== GAME =====
  const maxScore = Math.max(...teams.map((t) => t.score))
  const winnerTeam = judgeWinner >= 0 ? teams[judgeWinner] : null
  const tc = currentCard ? TYPE_CONFIG[currentCard.type] || TYPE_CONFIG.verbal : TYPE_CONFIG.verbal

  return (
    <>
      <Navbar
        onHome={onHome}
        center={
          <>
            <div className="nav-game-badge">
              <span>{game.emoji}</span>
              <span>{game.name}</span>
            </div>
            <span className="nav-card-num">{cardIndex + 1} / {deck.length}</span>
          </>
        }
        right={
          <>
            <div className="nav-host-chip">🎤 {hostName.trim() || 'Sunucu'}</div>
            <button className="nav-btn" onClick={endGame}>Bitir</button>
          </>
        }
      />
      <div className="screen screen-game">
        <div className="scores-strip">
          {teams.map((t, i) => (
            <div className={'score-chip' + (t.score === maxScore && t.score > 0 ? ' leading' : '')} key={i}>
              <div className="score-dot" style={{ background: t.color }} />
              {t.name} <strong>{t.score}</strong>
            </div>
          ))}
        </div>

        <div className="game-main">
          <PhaseBar phase={phase} />

          {phase === 'card' && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="card-wrap">
                <div
                  className={'card-inner' + (flipped ? ' flipped' : '')}
                  tabIndex={0}
                  onClick={flipCard}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flipCard() } }}
                >
                  <div className="card-face card-front">
                    <span className="card-front-icon">🎴</span>
                    <span className="card-front-text">Kartı çevirmek için dokun</span>
                  </div>
                  <div className="card-face card-back">
                    <span className={'card-type-badge ' + tc.cls}>{tc.label}</span>
                    <div className="card-text">{currentCard ? currentCard.text : ''}</div>
                    <div className="card-category">{currentCard ? currentCard.category : ''}</div>
                  </div>
                </div>
              </div>
              {showJudgeBtn && (
                <button className="btn-game fade-in" onClick={startJudge}>
                  Kazananı Seç →
                </button>
              )}
            </div>
          )}

          {phase === 'judge' && (
            <div className="judge-container fade-in">
              <div className="judge-title">🏆 Bu Turun Kazananı</div>
              <div className="judge-sub">En komik / yaratıcı performansı seç</div>
              <div className="judge-teams">
                {teams.map((t, i) => (
                  <button
                    key={i}
                    className={'judge-team-btn' + (judgeWinner === i ? ' selected' : '')}
                    onClick={() => selectWinner(i)}
                  >
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                    <span>{t.name}</span>
                    <span className="judge-score-badge">{t.score} puan</span>
                  </button>
                ))}
              </div>
              <button
                className={'judge-tie-btn' + (judgeWinner === -1 ? ' selected' : '')}
                onClick={() => selectWinner(-1)}
              >
                🤝 Berabere — puan yok
              </button>
            </div>
          )}

          {phase === 'result' && (
            <div className="result-container fade-in">
              <div className="result-emoji">{winnerTeam ? '🏆' : '🤝'}</div>
              <div className="result-title">{winnerTeam ? (winnerTeam.name + ' Kazandı!') : 'Berabere!'}</div>
              <div className="result-sub">
                {winnerTeam ? ('+1 puan — ' + (hostName.trim() || 'Sunucu') + ' seçti') : 'Bu turda puan yok'}
              </div>
              {winnerTeam && (
                <div className="result-winner-box">
                  <div className="result-winner-label">Bu turun galibi</div>
                  <div className="result-winner-name" style={{ color: winnerTeam.color }}>
                    {winnerTeam.name}
                  </div>
                </div>
              )}
              <div className="result-actions">
                <button className="btn-game" onClick={nextCard}>
                  {cardIndex + 1 >= deck.length ? 'Sonuçları Gör 🏁' : 'Sonraki Kart →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
