import { useEffect, useRef, useMemo } from 'react'
import qrcode from 'qrcode-generator'
import Navbar from './Navbar.jsx'
import { submitUrl } from '../publicUrl.js'

// TV'de kart/soru gönderme sayfasının QR'ı: yazı işi telefondan yapılır
export default function SubmitQr({ onHome }) {
  const backRef = useRef(null)
  const url = submitUrl()

  const svg = useMemo(() => {
    if (!url) return ''
    try {
      const qr = qrcode(0, 'M')
      qr.addData(url)
      qr.make()
      return qr.createSvgTag({ cellSize: 6, margin: 0, scalable: true })
    } catch {
      return ''
    }
  }, [url])

  useEffect(() => {
    const t = setTimeout(() => backRef.current?.focus(), 100)
    return () => clearTimeout(t)
  }, [])

  function onKey(e) {
    if (e.key === 'Escape' || e.key === 'Backspace') {
      e.preventDefault()
      onHome()
    }
  }

  return (
    <>
      <Navbar onHome={onHome} />
      <div className="screen screen-welcome" onKeyDown={onKey}>
        <div className="welcome-hero">✍️</div>
        <div className="welcome-title">Kart / Soru Gönder</div>
        <div className="welcome-sub" style={{ marginBottom: 28 }}>
          Telefonunun kamerasıyla okut, kendi kartını yaz. Admin onaylarsa oyuna eklenir.
        </div>

        {svg ? (
          <>
            <div
              style={{ background: '#fff', borderRadius: 20, padding: 14, width: 260, height: 260 }}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
            <div style={{ color: 'var(--text-muted)', marginTop: 14, fontSize: 15, wordBreak: 'break-all' }}>{url}</div>
          </>
        ) : (
          <div style={{ maxWidth: 520, padding: '14px 18px', borderRadius: 14, background: 'rgba(239,68,68,.12)', border: '1px solid #ef4444', lineHeight: 1.6 }}>
            ⚠️ Telefonların ulaşacağı site adresi henüz ayarlanmamış. <code>public/config.js</code> içindeki
            <code> YS_PUBLIC_BASE_URL</code> alanına yayın adresini yaz.
          </div>
        )}

        <button ref={backRef} className="btn-secondary mt12" style={{ maxWidth: 320, marginTop: 28 }} onClick={onHome}>
          ← Geri dön
        </button>
      </div>
    </>
  )
}
