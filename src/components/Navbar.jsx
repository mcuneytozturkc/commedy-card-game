export default function Navbar({ onHome, center, right }) {
  return (
    <nav className="navbar">
      <div
        className="nav-brand"
        tabIndex={0}
        onClick={onHome}
        onKeyDown={(e) => { if (e.key === 'Enter') onHome() }}
      >
        <span className="nav-logo">🎭</span>
        <span className="nav-title">Yusuf Show</span>
      </div>
      <div className="nav-center">{center}</div>
      <div className="nav-right">{right}</div>
    </nav>
  )
}
