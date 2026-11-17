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
