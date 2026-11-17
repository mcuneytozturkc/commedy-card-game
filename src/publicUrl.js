// Telefonların açacağı sitenin adresi. public/config.js içindeki YS_PUBLIC_BASE_URL öncelikli.
// Boşsa ve sayfa gerçek bir adresten açılmışsa onu kullanır; localhost / dosya ise '' döner (telefon ulaşamaz).
export function publicBase() {
  const cfg = (typeof window !== 'undefined' && window.YS_PUBLIC_BASE_URL) || ''
  if (cfg) return cfg.endsWith('/') ? cfg : cfg + '/'
  const { protocol, hostname, origin } = window.location
  if (protocol === 'file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(hostname)) return ''
  return origin + import.meta.env.BASE_URL
}

export function submitUrl() {
  const b = publicBase()
  return b ? b + 'submit.html' : ''
}

// Aynı sitedeki düz HTML sayfasına git (Vite public klasöründen sunulur; APK içinde de çalışır)
export function openPage(name) {
  window.location.href = import.meta.env.BASE_URL + name
}

// Telefonların QR ile oturuma katılma adresi: sayfa gerçek bir adresten (ör. yerel ağ IP'si) açıldıysa o,
// localhost / APK ise config.js'teki yayın adresi kullanılır. param: 'logo' | 'oknok'
function joinUrl(param, code) {
  const { protocol, hostname, origin } = window.location
  const isLocal = protocol === 'file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(hostname)
  const base = isLocal ? publicBase() : origin + import.meta.env.BASE_URL
  return base ? base + '?' + param + '=' + encodeURIComponent(code) : ''
}
export const logoJoinUrl  = (code) => joinUrl('logo', code)
export const oknokJoinUrl = (code) => joinUrl('oknok', code)
