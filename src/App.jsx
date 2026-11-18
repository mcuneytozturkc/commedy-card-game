import { useState, useEffect } from 'react'
import Home from './components/Home.jsx'
import CardGame from './components/CardGame.jsx'
import ModeSelect from './components/ModeSelect.jsx'
import SubmitQr from './components/SubmitQr.jsx'
import LogoQuiz from './components/LogoQuiz.jsx'
import OkNok from './components/OkNok.jsx'
import SplashScreen from './components/SplashScreen.jsx'
import { refreshContent } from './content.js'

// Splash yalnızca oturumun ilk açılışında gösterilir (tv.html'den Geri ile dönünce tekrar çıkmaz)
function splashSeen() {
  try { return sessionStorage.getItem('ys_splash') === '1' } catch { return false }
}
function markSplashSeen() {
  try { sessionStorage.setItem('ys_splash', '1') } catch { /* yoksay */ }
}

export default function App() {
  const [splash, setSplash] = useState(() => !splashSeen())
  // QR ile gelen oyuncu: ?logo=KOD ya da ?oknok=KOD → doğrudan ilgili oyunun katılma ekranı
  const [view, setView] = useState(() => {
    try {
      const sp = new URLSearchParams(window.location.search)
      for (const [param, name] of [['logo', 'logoquiz'], ['oknok', 'oknok']]) {
        const code = sp.get(param)
        if (code && /^[A-Za-z0-9]{6}$/.test(code)) {
          window.history.replaceState(null, '', window.location.pathname)
          return { name, joinCode: code.toUpperCase() }
        }
      }
    } catch { /* yoksay */ }
    return { name: 'home' }
  })

  // Oyun içeriğini (kartlar, sorular, logolar) Firebase'den yenile; olmazsa önbellek/gömülü liste kullanılır
  useEffect(() => { refreshContent() }, [])

  // Android TV Geri tuşu = tarayıcı geçmişi: alt ekrandayken Geri ana sayfaya döner (uygulamayı kapatmaz)
  useEffect(() => {
    const onPop = () => setView({ name: 'home' })
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  if (splash) {
    return <SplashScreen duration={2000} onDone={() => { markSplashSeen(); setSplash(false) }} />
  }

  const open = (v) => {
    window.history.pushState({ ys: v.name }, '')
    setView(v)
  }
  const goHome = () => {
    if (window.history.state && window.history.state.ys) window.history.back()
    else setView({ name: 'home' })
  }
  // Mod seçiminden tek ekran oyuna geçerken geçmiş girdisini değiştir (Geri yine ana sayfaya götürsün)
  const replaceWith = (v) => {
    window.history.replaceState({ ys: v.name }, '')
    setView(v)
  }

  if (view.name === 'modeselect') {
    return (
      <ModeSelect
        gameId={view.gameId}
        onHome={goHome}
        onSingleScreen={() => replaceWith({ name: 'cardgame', gameId: view.gameId })}
      />
    )
  }
  if (view.name === 'cardgame') {
    return <CardGame key={view.gameId} gameId={view.gameId} onHome={goHome} />
  }
  if (view.name === 'logoquiz') {
    return <LogoQuiz key={view.joinCode || 'lq'} joinCode={view.joinCode} onHome={goHome} />
  }
  if (view.name === 'oknok') {
    return <OkNok key={view.joinCode || 'ok'} joinCode={view.joinCode} onHome={goHome} />
  }
  if (view.name === 'submitqr') {
    return <SubmitQr onHome={goHome} />
  }
  return (
    <Home
      onOpenGame={(gameId) => open({ name: 'modeselect', gameId })}
      onOpenLogoQuiz={() => open({ name: 'logoquiz' })}
      onOpenOkNok={() => open({ name: 'oknok' })}
      onOpenSubmit={() => open({ name: 'submitqr' })}
    />
  )
}
