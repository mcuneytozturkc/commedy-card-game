import { useMemo } from 'react'
import qrcode from 'qrcode-generator'

// Verilen adres için QR (SVG). Adres boşsa hiçbir şey çizmez.
export default function QrCode({ url, size = 220 }) {
  const svg = useMemo(() => {
    if (!url) return ''
    try {
      const qr = qrcode(0, 'M')
      qr.addData(url)
      qr.make()
      return qr.createSvgTag({ cellSize: 6, margin: 0, scalable: true })
    } catch { return '' }
  }, [url])
  if (!svg) return null
  return <div style={{ background: '#fff', borderRadius: 16, padding: 12, width: size, height: size }} dangerouslySetInnerHTML={{ __html: svg }} />
}
