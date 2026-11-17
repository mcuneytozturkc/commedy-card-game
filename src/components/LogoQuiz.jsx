import { useState, useRef, useEffect } from 'react'
import { ref, set, update, get, onValue, runTransaction } from 'firebase/database'
import Navbar from './Navbar.jsx'
import QrCode from './QrCode.jsx'
import { logoJoinUrl } from '../publicUrl.js'
import { db } from '../firebase.js'
import { LQ_LOGOS } from '../data/logos.js'
import LogoImg, { pickForTier, brandfetchId } from './LogoImg.jsx'
import { shuffle } from '../confetti.js'
import SplashScreen from './SplashScreen.jsx'

const DIFF_LABEL  = { kolay: '😊 Kolay', orta: '😤 Orta', zor: '🔥 Zor' }
const DIFF_BADGE  = { kolay: 'db-easy',  orta: 'db-medium', zor: 'db-hard' }

function genCode() { return Math.random().toString(36).substr(2, 6).toUpperCase() }

export default function LogoQuiz({ onHome, joinCode }) {
  const [splash,   setSplash]   = useState(true)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [mode,     setMode]     = useState(joinCode ? 'join' : null) // null | 'legacy' (kağıt-kalem) | 'online' (sunucu) | 'join' (oyuncu)

  // ── Legacy states ──────────────────────────────────────────────
  const [legacyStage,   setLegacyStage]   = useState('setup') // setup|game|end
  const [diff,          setDiff]          = useState('kolay')
  const [legacyHost,    setLegacyHost]    = useState('')
  const [logos,         setLogos]         = useState([])
  const [idx,           setIdx]           = useState(0)
  const [revealed,      setRevealed]      = useState(false)
  const [loadingLogos,  setLoadingLogos]  = useState(false)
  const firstBtnRef = useRef(null)

  // ── Online (Firebase) states ───────────────────────────────────
  const [role,          setRole]          = useState(null) // host|player
  const [joined,        setJoined]        = useState(false)
  const [myName,        setMyName]        = useState('')
  const [code,          setCode]          = useState('')
  const [onlineDiff,    setOnlineDiff]    = useState('kolay')
  const [data,          setData]          = useState(null)
  const [err,           setErr]           = useState('')
  const [hostNameInput, setHostNameInput] = useState('')
  const [joinCodeInput, setJoinCodeInput] = useState(joinCode || '')
  const [joinNameInput, setJoinNameInput] = useState('')
  const [guessInput,    setGuessInput]    = useState('')
  const unsubRef    = useRef(null)
  const sessionRef  = useRef(null)

  // Online/offline listener
  useEffect(() => {
    const on  = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online',  on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online',  on)
      window.removeEventListener('offline', off)
      if (unsubRef.current) unsubRef.current()
    }
  }, [])

  useEffect(() => {
    if (mode === 'legacy' && legacyStage === 'game') firstBtnRef.current?.focus()
  }, [mode, legacyStage, idx])

  if (splash) return <SplashScreen duration={750} onDone={() => setSplash(false)} />

  // ════════════════════════════════════════════════════════════════
  // MOD SEÇİMİ
  // ════════════════════════════════════════════════════════════════
  if (!mode) {
    return (
      <>
        <Navbar onHome={onHome} />
        <div className="screen screen-lq">
          <div className="lq-mode-card">
            <div style={{ fontSize: 56, marginBottom: 4 }}>🏷️</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 6 }}>Logo Bilmece</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28, textAlign: 'center' }}>
              Nasıl oynamak istersiniz?
            </p>

            {!isOnline && <div className="lq-err" style={{ maxWidth: 440 }}>📵 Logolar internetten geldiği için bağlantı gerekli.</div>}
            <div className="lq-mode-options">
              <button className={'lq-mode-btn' + (!isOnline ? ' lq-mode-disabled' : '')} disabled={!isOnline}
                onClick={() => { setMode('legacy'); setErr('') }}>
                <span className="lq-mode-icon">📝</span>
                <div className="lq-mode-text">
                  <div className="lq-mode-title">Kağıt &amp; Kalem</div>
                  <div className="lq-mode-sub">Logo ekranda, herkes tahminini kağıda yazar veya söyler</div>
                </div>
              </button>

              <button className={'lq-mode-btn' + (!isOnline ? ' lq-mode-disabled' : '')} disabled={!isOnline}
                onClick={() => { setMode('online'); setErr('') }}>
                <span className="lq-mode-icon">📱</span>
                <div className="lq-mode-text">
                  <div className="lq-mode-title">Telefondan Yazma</div>
                  <div className="lq-mode-sub">Sunucu ol — oyuncular QR ile katılıp tahminini telefonda yazar</div>
                </div>
              </button>

              <button className={'lq-mode-btn' + (!isOnline ? ' lq-mode-disabled' : '')} disabled={!isOnline}
                onClick={() => { setMode('join'); setErr('') }}>
                <span className="lq-mode-icon">🔑</span>
                <div className="lq-mode-text">
                  <div className="lq-mode-title">Oturuma Katıl</div>
                  <div className="lq-mode-sub">Sunucunun verdiği oturum koduyla oyuna gir</div>
                </div>
              </button>
            </div>
          </div>
          <button className="btn-secondary" style={{ maxWidth: 500 }} onClick={onHome}>
            ← Ana menü
          </button>
        </div>
      </>
    )
  }

  // ════════════════════════════════════════════════════════════════
  // LEGACY MOD
  // ════════════════════════════════════════════════════════════════
  async function loadTier(d) {
    if (!brandfetchId()) { setErr('Brandfetch Client ID girilmemiş (public/config.js).'); return [] }
    setErr(''); setLoadingLogos(true)
    const list = await pickForTier(LQ_LOGOS, d)
    setLoadingLogos(false)
    if (!list.length) setErr('Logolar yüklenemedi — internet bağlantısını kontrol et.')
    return list
  }
  async function startLegacy() {
    if (loadingLogos) return
    const list = await loadTier(diff)
    if (!list.length) return
    setLogos(shuffle(list))
    setIdx(0); setRevealed(false)
    setLegacyStage('game')
  }
  function legacyNext() {
    if (idx + 1 >= logos.length) { setLegacyStage('end'); return }
    setIdx(idx + 1); setRevealed(false)
  }

  if (mode === 'legacy') {
    const hostLabel = legacyHost.trim() || 'Sunucu'
    const nav = (
      <Navbar
        onHome={() => { setMode(null); setLegacyStage('setup') }}
        center={legacyStage === 'game' ? <div className="nav-game-badge">🏷️ Kağıt &amp; Kalem — {DIFF_LABEL[diff]}</div> : null}
        right={legacyStage === 'game'
          ? <><div className="nav-host-chip">🎤 {hostLabel}</div><button className="nav-btn" onClick={() => setLegacyStage('end')}>Bitir</button></>
          : null}
      />
    )

    if (legacyStage === 'setup') {
      return (
        <>
          {nav}
          <div className="screen screen-lq">
            <div className="lq-card" style={{ maxWidth: 500, textAlign: 'center' }}>
              <div style={{ fontSize: 52, marginBottom: 8 }}>📝</div>
              <h3 style={{ fontSize: 20, marginBottom: 16 }}>Kağıt &amp; Kalem</h3>

              <div className="host-input-row" style={{ marginBottom: 20 }}>
                <span className="host-icon">🎤</span>
                <input
                  className="setup-input"
                  placeholder="Sunucu adı"
                  value={legacyHost}
                  maxLength={20}
                  autoFocus
                  onChange={e => setLegacyHost(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') startLegacy() }}
                />
              </div>

              <div className="setup-label" style={{ marginBottom: 10, textAlign: 'left' }}>Zorluk seç</div>
              <div className="diff-row" style={{ marginBottom: 20 }}>
                {['kolay', 'orta', 'zor'].map(d => (
                  <button key={d} className={'diff-btn' + (diff === d ? ' sel-' + d : '')} onClick={() => setDiff(d)}>
                    {DIFF_LABEL[d]}
                  </button>
                ))}
              </div>

              <div style={{
                background: 'var(--surface2)', borderRadius: 14, padding: '16px 20px',
                marginBottom: 20, color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.6,
                textAlign: 'center',
              }}>
                ✏️ Kağıtları kalemleri hazırlayın.<br />
                Hazırsanız başlayalım!
              </div>

              {err && <div className="lq-err" style={{ marginBottom: 10 }}>{err}</div>}
              <button className="lq-btn lq-btn-primary" onClick={startLegacy} disabled={loadingLogos}>
                {loadingLogos ? 'Logolar yükleniyor…' : 'Hazırız, Başlayalım! 🚀'}
              </button>
            </div>
            <button className="btn-secondary" style={{ maxWidth: 500 }} onClick={() => setMode(null)}>← Geri</button>
          </div>
        </>
      )
    }

    if (legacyStage === 'end') {
      return (
        <>
          {nav}
          <div className="screen screen-lq">
            <div style={{ textAlign: 'center', maxWidth: 440 }}>
              <div style={{ fontSize: 72, marginBottom: 12 }}>🏆</div>
              <div className="end-title">Oyun Bitti!</div>
              <div style={{ color: 'var(--text-muted)', marginTop: 8, marginBottom: 32 }}>
                {logos.length} logo oynandı — kim kazandı kağıtlara bakın! 😄
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="lq-btn lq-btn-primary" style={{ flex: 1 }} onClick={startLegacy}>Tekrar Oyna</button>
                <button className="lq-btn lq-btn-outline" style={{ flex: 1 }} onClick={() => setMode(null)}>Mod Seç</button>
              </div>
            </div>
          </div>
        </>
      )
    }

    // legacy game — logolar tek tek gösterilir, puanlama yok
    const logo = logos[idx]
    return (
      <>
        {nav}
        <div className="screen screen-lq">
          <div className={'logo-frame' + (logo.type === 'icon' && !revealed ? ' blurred' : '')} style={{ position: 'relative' }}>
            <span className="logo-num-badge">{idx + 1} / {logos.length}</span>
            <LogoImg logo={logo} />
          </div>

          {revealed && (
            <div style={{
              fontSize: 22, fontWeight: 800, marginBottom: 8, textAlign: 'center',
              background: 'rgba(124,58,237,.15)', borderRadius: 12, padding: '12px 28px',
              border: '1px solid rgba(124,58,237,.3)',
            }}>
              {logo.name}
            </div>
          )}

          <div className="lq-action-row" style={{ maxWidth: 480 }}>
            {!revealed
              ? <button ref={firstBtnRef} className="lq-btn lq-btn-primary" onClick={() => setRevealed(true)}>
                  🔍 Logoyu Göster
                </button>
              : <button className="lq-btn lq-btn-primary" onClick={legacyNext}>
                  {idx + 1 >= logos.length ? 'Oyunu Bitir 🏁' : 'Sonraki Logo →'}
                </button>
            }
          </div>
        </div>
      </>
    )
  }

  // ════════════════════════════════════════════════════════════════
  // ONLINE MOD (Firebase)
  // ════════════════════════════════════════════════════════════════
  function subscribe(c) {
    sessionRef.current = ref(db, 'sessions/' + c)
    if (unsubRef.current) unsubRef.current()
    unsubRef.current = onValue(sessionRef.current, snap => setData(snap.val()))
  }
  function leaveOnline() {
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null }
    sessionRef.current = null
    setRole(null); setJoined(false); setData(null)
    setCode(''); setErr(''); setGuessInput('')
    setMode(null)
  }

  async function createSession() {
    if (loadingLogos) return
    const name = hostNameInput.trim() || 'Sunucu'
    const c = genCode()
    const list = await loadTier(onlineDiff)
    if (!list.length) return
    const shuffled = shuffle(list).map(l => ({ name: l.name, domain: l.domain, type: l.type }))
    setMyName(name); setRole('host'); setCode(c)
    set(ref(db, 'sessions/' + c), {
      host: name, difficulty: onlineDiff, status: 'waiting',
      logoIndex: 0, logos: shuffled, players: {}, guesses: {},
    }).then(() => { setJoined(true); subscribe(c) })
      .catch(e => setErr('Firebase hatası: ' + e.message))
  }
  function hostStart()  { update(sessionRef.current, { status: 'active', logoIndex: 0 }) }
  function hostReveal() { set(ref(db, 'sessions/' + code + '/status'), 'revealing') }
  function hostMark(player, correct) {
    set(ref(db, 'sessions/' + code + '/guesses/' + player + '/correct'), correct)
    if (correct) runTransaction(ref(db, 'sessions/' + code + '/players/' + player + '/score'), s => (s || 0) + 1)
  }
  function hostNext() {
    get(sessionRef.current).then(snap => {
      const d = snap.val()
      const next = (d.logoIndex || 0) + 1
      if (next >= (d.logos || []).length) { hostEnd(); return }
      update(sessionRef.current, { logoIndex: next, status: 'guessing', guesses: {} })
    })
  }
  function hostEnd() { set(ref(db, 'sessions/' + code + '/status'), 'ended') }
  function joinSession() {
    const c = joinCodeInput.trim().toUpperCase()
    const name = joinNameInput.trim().replace(/[.#$\[\]\/]/g, '').slice(0, 20)
    if (!c || c.length < 6) { setErr('6 karakterli kodu gir'); return }
    if (!name) { setErr('Adını gir'); return }
    get(ref(db, 'sessions/' + c)).then(snap => {
      if (!snap.exists()) { setErr('Oturum bulunamadı'); return }
      const d = snap.val()
      if (d.status === 'ended') { setErr('Bu oyun sona ermiş'); return }
      setMyName(name); setRole('player'); setCode(c)
      set(ref(db, 'sessions/' + c + '/players/' + name), { score: 0 }).then(() => {
        setErr(''); setJoined(true); subscribe(c)
      }).catch(() => setErr('Katılırken hata oluştu, tekrar dene'))
    }).catch(() => setErr('Bağlantı hatası'))
  }
  function submitGuess() {
    const txt = guessInput.trim()
    if (!txt) return
    set(ref(db, 'sessions/' + code + '/guesses/' + myName), { text: txt, submitted: true, correct: null })
  }

  const onlineNav = (
    <Navbar
      onHome={() => { leaveOnline(); onHome() }}
      center={joined ? <div className="nav-game-badge">🏷️ Online — {data ? DIFF_LABEL[data.difficulty] : ''}</div> : null}
      right={joined ? <button className="nav-btn" onClick={leaveOnline}>Çık</button> : null}
    />
  )

  // Online setup (not yet joined)
  if (!joined) {
    return (
      <>
        {onlineNav}
        <div className="screen screen-lq">
          {err && <div className="lq-err">{err}</div>}

          {mode === 'online' && <div className="lq-card">
            <h3>🎤 Sunucu Ol</h3>
            <p>Oturum oluştur — oyuncular QR kodu okutup ya da kodu girerek telefonundan katılır.</p>
            <div className="diff-row">
              {['kolay', 'orta', 'zor'].map(d => (
                <button key={d} className={'diff-btn' + (onlineDiff === d ? ' sel-' + d : '')} onClick={() => setOnlineDiff(d)}>
                  {DIFF_LABEL[d]}
                </button>
              ))}
            </div>
            <input className="lq-input" placeholder="Sunucu adın" value={hostNameInput}
              onChange={e => setHostNameInput(e.target.value)} />
            <button className="lq-btn lq-btn-primary" onClick={createSession} disabled={loadingLogos}>{loadingLogos ? 'Logolar yükleniyor…' : 'Oturum Oluştur'}</button>
          </div>}

          {mode === 'join' && <div className="lq-card">
            <h3>🔑 Oturuma Katıl</h3>
            <p>Sunucunun verdiği 6 haneli kodu ve adını gir.</p>
            <input className="lq-code-input" placeholder="KOD" maxLength={6} value={joinCodeInput}
              onChange={e => setJoinCodeInput(e.target.value.toUpperCase())} />
            <input className="lq-input" placeholder="Adın" value={joinNameInput}
              onChange={e => setJoinNameInput(e.target.value)} />
            <button className="lq-btn lq-btn-primary" onClick={joinSession}>Katıl</button>
          </div>}

          <button className="btn-secondary" style={{ maxWidth: 440 }} onClick={() => setMode(null)}>← Mod Seç</button>
        </div>
      </>
    )
  }

  // Online game data
  const onlinePlayers = Object.keys(data?.players || {})
  const status  = data?.status || 'waiting'
  const onlineLogos = data?.logos || []
  const oIdx    = data?.logoIndex || 0
  const oLogo   = onlineLogos[oIdx]
  const guesses = data?.guesses || {}
  const revealed2 = status === 'revealing'

  // Scores / ended
  if (status === 'ended') {
    const sorted = Object.entries(data?.players || {}).sort((a, b) => b[1].score - a[1].score)
    const medals = ['🥇','🥈','🥉','4️⃣','5️⃣']
    return (
      <>
        {onlineNav}
        <div className="screen screen-lq">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 64, marginBottom: 8 }}>🏆</div>
            <div className="end-title">{sorted.length > 0 ? `${sorted[0][0]} Kazandı! 🎉` : 'Oyun Bitti!'}</div>
            <div className="end-sub">{onlineLogos.length} logo oynandı</div>
          </div>
          {sorted.map(([name, info], i) => (
            <div className={'lq-score-row' + (i === 0 ? ' first' : '')} key={name}>
              <span style={{ fontSize: 18, width: 26 }}>{medals[i] || ''}</span>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 700, textAlign: 'left' }}>{name}</span>
              <span style={{ fontSize: 20, fontWeight: 800 }}>{info.score} <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>puan</span></span>
            </div>
          ))}
          <button className="lq-btn lq-btn-outline" style={{ maxWidth: 420, marginTop: 16 }} onClick={leaveOnline}>
            Ana menü
          </button>
        </div>
      </>
    )
  }

  // Host lobby
  if (role === 'host' && status === 'waiting') {
    return (
      <>
        {onlineNav}
        <div className="screen screen-lq">
          <div className="session-display">
            <div className="code-label">Oturum Kodu</div>
            <div className="code-val">{code}</div>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0 8px' }}><QrCode url={logoJoinUrl(code)} size={200} /></div>
            <div className="code-hint">Oyuncular QR'ı okutur ya da uygulamada → Logo Bilmece → Oturuma Katıl → bu kodu girer</div>
          </div>
          <div className="lq-player-list">
            <div className="pl-label">Katılanlar ({onlinePlayers.length})</div>
            {onlinePlayers.length === 0
              ? <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Oyuncular bekleniyor…</div>
              : onlinePlayers.map(p => <span className="lq-chip" key={p}>👤 {p}</span>)}
          </div>
          <div className="lq-action-row">
            <button className="lq-btn lq-btn-primary" disabled={onlinePlayers.length === 0} onClick={hostStart}>
              {onlinePlayers.length === 0 ? 'En az 1 oyuncu bekleniyor' : `Başlat (${onlinePlayers.length} oyuncu)`}
            </button>
          </div>
        </div>
      </>
    )
  }

  // Player lobby
  if (role === 'player' && status === 'waiting') {
    return (
      <>
        {onlineNav}
        <div className="screen screen-lq">
          <div className="lq-info">Sunucunun oyunu başlatması bekleniyor…</div>
          <div className="lq-player-list">
            <div className="pl-label">Katılanlar — {onlinePlayers.length} kişi</div>
            {onlinePlayers.map(p => <span className="lq-chip" key={p}>{p}</span>)}
          </div>
        </div>
      </>
    )
  }

  // Host game
  if (role === 'host') {
    const submitted = onlinePlayers.filter(p => guesses[p]?.submitted).length
    return (
      <>
        {onlineNav}
        <div className="screen screen-lq">
          <div className={'logo-frame' + (oLogo?.type === 'icon' && !revealed2 ? ' blurred' : '')}>
            <span className="logo-num-badge">{oIdx + 1} / {onlineLogos.length}</span>
            <span className={'diff-badge-sm ' + DIFF_BADGE[data.difficulty]}>{DIFF_LABEL[data.difficulty]}</span>
            {oLogo && <LogoImg logo={oLogo} />}
          </div>
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 14, fontSize: 14 }}>
            {revealed2 ? 'Logoyu gördünüz — tahminleri işaretleyin' : 'Oyuncular tahmin giriyor…'}
          </div>
          <div className="guesses-box">
            <div className="gb-title"><span>Tahminler</span><span>{submitted}/{onlinePlayers.length} gönderdi</span></div>
            {onlinePlayers.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Tahminler burada görünecek…</div>}
            {onlinePlayers.map(p => {
              const g = guesses[p]
              const sent = g?.submitted
              const cls = 'guess-row' + (g?.correct === true ? ' correct' : g?.correct === false ? ' wrong' : '')
              return (
                <div className={cls} key={p}>
                  <span className="guess-player">{p}</span>
                  {sent ? (
                    <>
                      <span className="guess-text">{g.text}</span>
                      {revealed2 && (
                        <div className="mark-btns">
                          <button className="mk-btn mk-ok" onClick={() => hostMark(p, true)}>✅</button>
                          <button className="mk-btn mk-no" onClick={() => hostMark(p, false)}>❌</button>
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="guess-pending">yazıyor… <span className="waiting-dot" /></span>
                  )}
                </div>
              )
            })}
          </div>
          {revealed2 && (() => {
            const right = onlinePlayers.filter(p => guesses[p]?.correct === true)
            return (
              <div className="lq-submitted" style={{ maxWidth: 520, marginBottom: 12, ...(right.length ? {} : { background: 'rgba(239,68,68,.1)', borderColor: 'rgba(239,68,68,.3)', color: '#fca5a5' }) }}>
                {right.length ? `✅ Doğru bilenler: ${right.join(', ')}` : 'Henüz doğru bilen işaretlenmedi'}
              </div>
            )
          })()}
          <div className="lq-player-list" style={{ marginBottom: 12 }}>
            <div className="pl-label">Puan durumu</div>
            {[...onlinePlayers].sort((a, b) => (data.players[b]?.score || 0) - (data.players[a]?.score || 0)).map(p => (
              <span className="lq-chip" key={p}>👤 {p} · {data.players[p]?.score || 0}</span>
            ))}
          </div>
          <div className="lq-action-row">
            {!revealed2
              ? <button className="lq-btn lq-btn-primary" onClick={hostReveal}>🔍 Logoyu Göster</button>
              : <>
                  <button className="lq-btn lq-btn-green" onClick={hostNext}>
                    {oIdx + 1 >= onlineLogos.length ? 'Bitir ve Skorlar 🏁' : 'Sonraki Logo →'}
                  </button>
                  <button className="lq-btn lq-btn-outline" onClick={hostEnd}>Oyunu Bitir</button>
                </>
            }
          </div>
        </div>
      </>
    )
  }

  // Player game
  const myGuess   = guesses[myName]
  const mySubmitted = myGuess?.submitted
  return (
    <>
      {onlineNav}
      <div className="screen screen-lq">
        <div className="logo-frame" style={{ flexDirection: 'column', gap: 6, textAlign: 'center' }}>
          <span className="logo-num-badge">{oIdx + 1} / {onlineLogos.length}</span>
          <span className={'diff-badge-sm ' + DIFF_BADGE[data.difficulty]}>{DIFF_LABEL[data.difficulty]}</span>
          <div style={{ fontSize: 54 }}>📺</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Logoya ekrandan bak</div>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{revealed2 ? 'Logo açıklandı!' : 'Ekrandaki logo ne?'}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {revealed2 ? 'Sunucu değerlendiriyor…' : 'Tahminini yaz ve gönder'}
          </div>
        </div>
        {!revealed2 && (
          <>
            <div className="lq-guess-row">
              <input className="lq-guess-input" placeholder="Tahminin…"
                value={mySubmitted ? myGuess.text : guessInput}
                disabled={mySubmitted}
                onChange={e => setGuessInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submitGuess() }}
              />
              <button className="lq-btn lq-btn-primary" style={{ width: 'auto', padding: '13px 22px' }}
                disabled={mySubmitted} onClick={submitGuess}>Gönder</button>
            </div>
            {mySubmitted && <div className="lq-submitted">✅ Tahminin gönderildi!</div>}
          </>
        )}
        {revealed2 && myGuess && (
          <div style={{
            borderRadius: 12, padding: 12, fontWeight: 700, maxWidth: 420, width: '100%', textAlign: 'center',
            ...(myGuess.correct === true
              ? { background: 'rgba(34,197,94,.15)', border: '1px solid rgba(34,197,94,.4)', color: '#86efac' }
              : myGuess.correct === false
              ? { background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: '#fca5a5' }
              : { background: 'rgba(245,158,11,.1)', color: '#fcd34d' }),
          }}>
            {myGuess.correct === true ? '✅ Doğru! +1 puan' : myGuess.correct === false ? '❌ Yanlış!' : '⏳ Sonuç bekleniyor…'}
          </div>
        )}
      </div>
    </>
  )
}
