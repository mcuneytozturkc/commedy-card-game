import { useState } from 'react'
import Home from './components/Home.jsx'
import CardGame from './components/CardGame.jsx'
import LogoQuiz from './components/LogoQuiz.jsx'
import OkNok from './components/OkNok.jsx'
import SplashScreen from './components/SplashScreen.jsx'

export default function App() {
  const [splash, setSplash] = useState(true)
  const [view, setView] = useState({ name: 'home' })

  if (splash) {
    return <SplashScreen duration={2000} onDone={() => setSplash(false)} />
  }

  const goHome = () => setView({ name: 'home' })

  if (view.name === 'cardgame') {
    return <CardGame key={view.gameId} gameId={view.gameId} onHome={goHome} />
  }
  if (view.name === 'logoquiz') {
    return <LogoQuiz onHome={goHome} />
  }
  if (view.name === 'oknok') {
    return <OkNok onHome={goHome} />
  }
  return (
    <Home
      onOpenGame={(gameId) => setView({ name: 'cardgame', gameId })}
      onOpenLogoQuiz={() => setView({ name: 'logoquiz' })}
      onOpenOkNok={() => setView({ name: 'oknok' })}
    />
  )
}
