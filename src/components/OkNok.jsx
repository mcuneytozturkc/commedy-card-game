import { useState, useRef, useEffect } from 'react'
import { ref, set, update, get, onValue, serverTimestamp } from 'firebase/database'
import { cleanupOldSessions } from '../sessionCleanup.js'
import Navbar from './Navbar.jsx'
import QrCode from './QrCode.jsx'
import { db } from '../firebase.js'
import { getContent, getToxicity, refreshContent } from '../content.js'
import { shuffle, confetti } from '../confetti.js'
import { oknokJoinUrl } from '../publicUrl.js'
import SplashScreen from './SplashScreen.jsx'

const ROUND_COUNT = 10

function genCode() { return Math.random().toString(36).substr(2, 6).toUpperCase() }
function cleanName(s) { return s.trim().replace(/\s+/g, ' ').slice(0, 20) }
const other = (who) => (who === 'a' ? 'b' : 'a')

// Sunucu (TV): çiftler telefondan QR/kodla katılır. Her turda havuzdan rastgele bir kişi "oyuncu" seçilir,
// eşi "partner" olur; seçilen kişi havuzdan çıkar, eşi kalır. Havuz bitince ya da sunucu isteyince oyun biter.
export default function OkNok({ onHome, joinCode }) {
  const [splash, setSplash] = useState(true)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [mode, setMode] = useState(joinCode ? 'join' : null) // null | 'host' | 'join'
  const [role, setRole] = useState(null) // host | player (oturuma girildikten sonra)
  const [code, setCode] = useState('')
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')
  const [joinCodeInput, setJoinCodeInput] = useState(joinCode || '')
  const [nameA, setNameA] = useState('')
  const [nameB, setNameB] = useState('')
  const [myCid, setMyCid] = useState('')
  // sunucuda yerel tur durumu
  const [questions, setQuestions] = useState([])
  const [qIdx, setQIdx] = useState(0)
  const [answers, setAnswers] = useState([])
  const [results, setResults] = useState([]) // yalnızca sunucuda (bellekte); veritabanına yazılmaz
  const sessionRef = useRef(null)
  const unsubRef = useRef(null)
  const mainRef = useRef(null)

  useEffect(() => {
    const on = () => setIsOnline(true), off = () => setIsOnline(false)
    window.addEventListener('online', on); window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on); window.removeEventListener('offline', off)
      if (unsubRef.current) unsubRef.current()
    }
  }, [])

  useEffect(() => { refreshContent() }, [])

  const stage = data?.stage
  useEffect(() => {
    const t = setTimeout(() => mainRef.current?.focus(), 80)
    return () => clearTimeout(t)
  }, [mode, role, stage, qIdx, data?.status])

  if (splash) return <SplashScreen duration={750} onDone={() => setSplash(false)} />

  function subscribe(c) {
    sessionRef.current = ref(db, 'sessions/' + c)
    if (unsubRef.current) unsubRef.current()
    unsubRef.current = onValue(sessionRef.current, snap => setData(snap.val()))
  }
  function leave(goBack) {
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null }
    sessionRef.current = null
    setRole(null); setData(null); setCode(''); setErr(''); setMyCid('')
    setMode(null)
    if (goBack) onHome()
  }

  // ───────── Sunucu işlemleri ─────────
  function createSession() {
    const c = genCode()
    cleanupOldSessions()
    set(ref(db, 'sessions/' + c), { type: 'oknok', status: 'lobby', createdAt: serverTimestamp() })
      .then(() => { setCode(c); setRole('host'); setErr(''); subscribe(c) })
      .catch(e => setErr('Firebase hatası: ' + e.message))
  }
  function pickFrom(keys) {
    const pick = keys[Math.floor(Math.random() * keys.length)]
    const rest = {}
    keys.filter(k => k !== pick).forEach(k => { rest[k] = true })
    const [cid, who] = pick.split(':')
    return { cid, who, rest: Object.keys(rest).length ? rest : null }
  }
  function resetRound() {
    setQuestions(shuffle([...getContent().oknokQuestions]).slice(0, ROUND_COUNT))
    setQIdx(0); setAnswers([])
  }
  function startGame() {
    const keys = []
    Object.keys(data?.couples || {}).forEach(cid => keys.push(cid + ':a', cid + ':b'))
    if (!keys.length) return
    const { cid, who, rest } = pickFrom(keys)
    resetRound(); setResults([])
    update(sessionRef.current, {
      status: 'playing', stage: 'intro', round: 1, total: keys.length,
      pool: rest, current: { cid, who },
    })
  }
  function startQuestions() {
    resetRound()
    update(sessionRef.current, { stage: 'game' })
  }
  function handleChoice(val) {
    const next = [...answers, val]
    setAnswers(next)
    if (qIdx + 1 < ROUND_COUNT) { setQIdx(qIdx + 1); return }
    const nok = next.filter(a => a === 'nok').length
    const tox = getToxicity(nok)
    const c = data.couples[data.current.cid]
    if (nok === 0) confetti()
    setResults(r => [...r, {
      player: c[data.current.who], partner: c[other(data.current.who)],
      ok: ROUND_COUNT - nok, nok, emoji: tox.emoji, title: tox.title,
    }])
    update(sessionRef.current, { stage: 'result' })
  }
  function nextPlayer() {
    const keys = Object.keys(data?.pool || {})
    if (!keys.length) { endGame(); return }
    const { cid, who, rest } = pickFrom(keys)
    resetRound()
    update(sessionRef.current, { pool: rest, current: { cid, who }, stage: 'intro', round: (data.round || 1) + 1 })
  }
  function endGame() { update(sessionRef.current, { status: 'ended' }) }

  // ───────── Oyuncu (telefon) işlemleri ─────────
  function joinSession() {
    const c = joinCodeInput.trim().toUpperCase()
    const a = cleanName(nameA), b = cleanName(nameB)
    if (c.length < 6) { setErr('6 karakterli kodu gir'); return }
    if (!a || !b) { setErr('Çiftin iki ismini de yaz'); return }
    get(ref(db, 'sessions/' + c)).then(snap => {
      const d = snap.val()
      if (!d || d.type !== 'oknok') { setErr('Oturum bulunamadı'); return }
      if (d.status !== 'lobby') { setErr('Oyun başlamış, artık katılınamıyor'); return }
      const cid = 'c' + Math.random().toString(36).slice(2, 7)
      set(ref(db, 'sessions/' + c + '/couples/' + cid), { a, b }).then(() => {
        setMyCid(cid); setCode(c); setRole('player'); setErr(''); subscribe(c)
      }).catch(() => setErr('Katılırken hata oluştu, tekrar dene'))
    }).catch(() => setErr('Bağlantı hatası'))
  }

  // ───────── Ortak veriler ─────────
  const couples = data?.couples || {}
  const couplesList = Object.entries(couples)
  const status = data?.status || 'lobby'
  const cur = data?.current
  const curCouple = cur ? couples[cur.cid] : null
  const player = curCouple ? curCouple[cur.who] : ''
  const partner = curCouple ? curCouple[other(cur.who)] : ''
  const remaining = Object.keys(data?.pool || {}).length
  const nav = (right) => (
    <Navbar onHome={() => leave(true)} center={role ? <div className="nav-game-badge">💑 Ok mu Nok mu?</div> : null} right={right} />
  )

  // ───────── Giriş ekranı ─────────
  if (!role && !mode) {
    return (
      <>
        <Navbar onHome={onHome} />
        <div className="screen screen-lq">
          <div className="lq-mode-card">
            <div style={{ fontSize: 56, marginBottom: 4 }}>💑</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 6 }}>Ok mu Nok mu?</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20, textAlign: 'center' }}>
              Çiftler telefonundan katılır, sunucu ekranda oynatır.
            </p>
            {!isOnline && <div className="lq-err" style={{ maxWidth: 440 }}>📵 Oyun için internet bağlantısı gerekli.</div>}
            <div className="lq-mode-options">
              <button ref={mainRef} className={'lq-mode-btn' + (!isOnline ? ' lq-mode-disabled' : '')} disabled={!isOnline}
                onClick={() => { setMode('host'); setErr('') }}>
                <span className="lq-mode-icon">🎤</span>
                <div className="lq-mode-text">
                  <div className="lq-mode-title">Sunucu Ol</div>
                  <div className="lq-mode-sub">Oturum aç, çiftler QR ile telefonundan katılsın</div>
                </div>
              </button>
              <button className={'lq-mode-btn' + (!isOnline ? ' lq-mode-disabled' : '')} disabled={!isOnline}
                onClick={() => { setMode('join'); setErr('') }}>
                <span className="lq-mode-icon">🔑</span>
                <div className="lq-mode-text">
                  <div className="lq-mode-title">Oturuma Katıl</div>
                  <div className="lq-mode-sub">Sunucunun verdiği kodla çift olarak gir</div>
                </div>
              </button>
            </div>
          </div>
          <button className="btn-secondary" style={{ maxWidth: 500 }} onClick={onHome}>← Ana menü</button>
        </div>
      </>
    )
  }

  // ───────── Sunucu: oturum açma ─────────
  if (!role && mode === 'host') {
    return (
      <>
        <Navbar onHome={() => setMode(null)} />
        <div className="screen screen-lq" style={{ justifyContent: 'center' }}>
          {err && <div className="lq-err">{err}</div>}
          <div className="oknok-setup-card">
            <div style={{ fontSize: 64, marginBottom: 8 }}>💑</div>
            <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>Ok mu Nok mu?</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
              Oturumu aç; çiftler QR kodu okutup iki ismi de yazarak katılır.
            </p>
            <button ref={mainRef} className="lq-btn lq-btn-primary" onClick={createSession}>Oturum Aç 🚀</button>
          </div>
          <button className="btn-secondary" style={{ maxWidth: 480, marginTop: 12 }} onClick={() => setMode(null)}>← Geri</button>
        </div>
      </>
    )
  }

  // ───────── Oyuncu: katılma formu ─────────
  if (!role && mode === 'join') {
    return (
      <>
        <Navbar onHome={() => (joinCode ? onHome() : setMode(null))} />
        <div className="screen screen-lq" style={{ justifyContent: 'center' }}>
          {err && <div className="lq-err">{err}</div>}
          <div className="lq-card">
            <h3>💑 Çift Olarak Katıl</h3>
            <p>Oturum kodunu ve çiftin iki ismini yaz.</p>
            <input className="lq-code-input" placeholder="KOD" maxLength={6} value={joinCodeInput}
              onChange={e => setJoinCodeInput(e.target.value.toUpperCase())} />
            <input className="lq-input" placeholder="1. kişinin adı" value={nameA} maxLength={20}
              autoFocus={!!joinCode} onChange={e => setNameA(e.target.value)} />
            <input className="lq-input" placeholder="2. kişinin adı" value={nameB} maxLength={20}
              onChange={e => setNameB(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') joinSession() }} />
            <button className="lq-btn lq-btn-primary" onClick={joinSession}>Katıl</button>
          </div>
          <button className="btn-secondary" style={{ maxWidth: 440 }} onClick={() => (joinCode ? onHome() : setMode(null))}>← Geri</button>
        </div>
      </>
    )
  }

  // ───────── Oyun bitti (herkes) ─────────
  if (status === 'ended') {
    const ranked = [...results].sort((a, b) => a.nok - b.nok)
    const medals = ['🥇', '🥈', '🥉']
    return (
      <>
        {nav(null)}
        <div className="screen screen-lq" style={{ justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 64, marginBottom: 8 }}>🏁</div>
            <div className="end-title">Oyun Bitti!</div>
            <div className="end-sub">{role === 'host' ? 'En az Nok alan en sağlıklı' : 'Sonuçlar sunucu ekranında 📺'}</div>
          </div>
          {role === 'host' && ranked.length === 0 && <div style={{ color: 'var(--text-muted)' }}>Hiç tur oynanmadı.</div>}
          {role === 'host' && ranked.map((r, i) => (
            <div className={'lq-score-row' + (i === 0 ? ' first' : '')} key={r.player + i}>
              <span style={{ fontSize: 18, width: 26 }}>{medals[i] || r.emoji}</span>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 700, textAlign: 'left' }}>
                {r.player}<span style={{ color: 'var(--text-muted)', fontWeight: 500 }}> · {r.title}</span>
              </span>
              <span style={{ fontSize: 14, fontWeight: 800 }}>✅ {r.ok} · ❌ {r.nok}</span>
            </div>
          ))}
          <button ref={mainRef} className="lq-btn lq-btn-outline" style={{ maxWidth: 420, marginTop: 16 }} onClick={() => leave(true)}>
            Ana menü
          </button>
        </div>
      </>
    )
  }

  // ───────── Lobi ─────────
  if (status === 'lobby') {
    if (role === 'host') {
      return (
        <>
          {nav(null)}
          <div className="screen screen-lq">
            <div className="session-display">
              <div className="code-label">Oturum Kodu</div>
              <div className="code-val">{code}</div>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0 8px' }}>
                <QrCode url={oknokJoinUrl(code)} size={200} />
              </div>
              <div className="code-hint">Çiftler QR'ı okutur ya da uygulamada → Ok mu Nok mu? → Oturuma Katıl → bu kodu girer</div>
            </div>
            <div className="lq-player-list">
              <div className="pl-label">Katılan çiftler ({couplesList.length})</div>
              {couplesList.length === 0
                ? <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Çiftler bekleniyor…</div>
                : couplesList.map(([cid, c]) => <span className="lq-chip" key={cid}>💑 {c.a} &amp; {c.b}</span>)}
            </div>
            <div className="lq-action-row">
              <button ref={mainRef} className="lq-btn lq-btn-primary" disabled={couplesList.length === 0} onClick={startGame}>
                {couplesList.length === 0 ? 'En az 1 çift bekleniyor' : `Oyunu Başlat (${couplesList.length} çift, ${couplesList.length * 2} kişi)`}
              </button>
            </div>
          </div>
        </>
      )
    }
    const mine = couples[myCid]
    return (
      <>
        {nav(null)}
        <div className="screen screen-lq">
          <div className="lq-info">✅ {mine ? `${mine.a} & ${mine.b}` : 'Çift'} katıldı — sunucunun oyunu başlatması bekleniyor…</div>
          <div className="lq-player-list">
            <div className="pl-label">Katılan çiftler ({couplesList.length})</div>
            {couplesList.map(([cid, c]) => <span className="lq-chip" key={cid}>💑 {c.a} &amp; {c.b}</span>)}
          </div>
        </div>
      </>
    )
  }

  // ───────── Oyun sürüyor: telefon görünümü ─────────
  if (role === 'player') {
    const mine = cur && cur.cid === myCid
    return (
      <>
        {nav(null)}
        <div className="screen screen-lq" style={{ justifyContent: 'center' }}>
          <div className="oknok-result-card">
            <div className="oknok-result-emoji">{stage === 'result' ? '👏' : '🎤'}</div>
            <div className="oknok-result-couple">Tur {data?.round}</div>
            <div className="oknok-result-title">{player}</div>
            <div className="oknok-result-msg">Partneri: {partner}</div>
            {mine && <div className="oknok-result-msg" style={{ color: 'var(--accent2)', fontWeight: 700 }}>Sahne sizde 🎭</div>}
            <div className="oknok-result-msg">{stage === 'result' ? 'Tur bitti — sonuç ekranda 📺' : 'Ekrana bakın, sorular geliyor…'}</div>
          </div>
        </div>
      </>
    )
  }

  // ───────── Oyun sürüyor: sunucu (TV) görünümü ─────────
  const endBtn = <button className="nav-btn" onClick={endGame}>Oyunu Bitir</button>

  if (stage === 'intro') {
    return (
      <>
        {nav(endBtn)}
        <div className="screen screen-lq" style={{ justifyContent: 'center' }}>
          <div className="oknok-result-card">
            <div className="oknok-result-emoji">🎤</div>
            <div className="oknok-result-couple">Tur {data.round} / {data.total} — Sıradaki oyuncu</div>
            <div className="oknok-result-title" style={{ fontSize: 40 }}>{player}</div>
            <div className="oknok-result-msg" style={{ fontSize: 18 }}>💑 Partneri: <b>{partner}</b></div>
            <div className="oknok-result-msg">Sırada bekleyen: {remaining} kişi</div>
            <button ref={mainRef} className="lq-btn lq-btn-primary" style={{ marginTop: 12 }} onClick={startQuestions}>
              Sorulara Başla 🚀
            </button>
          </div>
        </div>
      </>
    )
  }

  if (stage === 'result') {
    const nokCount = answers.filter(a => a === 'nok').length
    const okCount = answers.filter(a => a === 'ok').length
    const tox = getToxicity(nokCount)
    const last = remaining === 0
    return (
      <>
        {nav(null)}
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
              <div className="oknok-score-block oknok-ok"><span className="oknok-score-num">{okCount}</span><span className="oknok-score-lbl">✅ Ok</span></div>
              <div className="oknok-score-divider" />
              <div className="oknok-score-block oknok-nok"><span className="oknok-score-num">{nokCount}</span><span className="oknok-score-lbl">❌ Nok</span></div>
            </div>
            <div className="oknok-toxbar-wrap">
              <div className="oknok-toxbar"><div className="oknok-toxbar-fill" style={{ width: `${(nokCount / ROUND_COUNT) * 100}%` }} /></div>
              <div className="oknok-toxbar-labels"><span>💚 Sağlıklı</span><span>☠️ Toxik</span></div>
            </div>
            <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 8, flexWrap: 'wrap' }}>
              <button ref={mainRef} className="lq-btn lq-btn-primary" style={{ flex: 1 }} onClick={nextPlayer}>
                {last ? 'Sonuçları Göster 🏁' : 'Sıradaki Oyuncu →'}
              </button>
              {!last && <button className="lq-btn lq-btn-outline" style={{ flex: 1 }} onClick={endGame}>Oyunu Bitir</button>}
            </div>
          </div>
        </div>
      </>
    )
  }

  // stage === 'game'
  const question = questions[qIdx]
  const progress = (qIdx / ROUND_COUNT) * 100
  return (
    <>
      {nav(<span style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 700 }}>{player} · {qIdx + 1} / {ROUND_COUNT}</span>)}
      <div className="screen screen-lq" style={{ justifyContent: 'center' }}>
        <div className="oknok-game-card">
          <div className="oknok-progress-wrap">
            <div className="oknok-progress-bar"><div className="oknok-progress-fill" style={{ width: `${progress}%` }} /></div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, textAlign: 'right' }}>
              Soru {qIdx + 1} / {ROUND_COUNT}
            </div>
          </div>
          <div className="oknok-question">
            <span className="oknok-q-icon">🤔</span>
            <div className="oknok-q-text">{question}</div>
          </div>
          <div className="oknok-choices">
            <button ref={mainRef} className="oknok-choice oknok-choice-ok" onClick={() => handleChoice('ok')}>
              <span className="oknok-choice-icon">✅</span><span className="oknok-choice-label">Ok</span>
              <span className="oknok-choice-sub">Normal, olabilir</span>
            </button>
            <button className="oknok-choice oknok-choice-nok" onClick={() => handleChoice('nok')}>
              <span className="oknok-choice-icon">❌</span><span className="oknok-choice-label">Nok</span>
              <span className="oknok-choice-sub">Kabul edilemez!</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
