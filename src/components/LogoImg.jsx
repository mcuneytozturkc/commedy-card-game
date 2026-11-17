// Brandfetch Logo API (yazısız marka simgesi). Client ID public/config.js'ten okunur.
// Önce type=symbol, yoksa type=icon denenir. fallback/404: kayıt yoksa Brandfetch'in yer tutucu
// logosu yerine 404 döner, böylece bulunamayan markalar oyundan elenebilir.
export function brandfetchId() {
  return (typeof window !== 'undefined' && window.YS_BRANDFETCH_CLIENT_ID) || ''
}

export const LOGO_TYPES = ['symbol', 'icon']

export function logoUrl(domain, type = 'symbol') {
  return `https://cdn.brandfetch.io/domain/${domain}/w/400/h/400/fallback/404/type/${type}?c=${encodeURIComponent(brandfetchId())}`
}

function tryLoad(url, timeoutMs) {
  return new Promise(resolve => {
    const im = new Image()
    const t = setTimeout(() => resolve(false), timeoutMs)
    im.onload  = () => { clearTimeout(t); resolve(true) }
    im.onerror = () => { clearTimeout(t); resolve(false) }
    im.src = url
  })
}

const CACHE_KEY = 'ys_logo_types'
function readCache() { try { return JSON.parse(sessionStorage.getItem(CACHE_KEY) || '{}') } catch { return {} } }
function writeCache(c) { try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(c)) } catch { /* yoksay */ } }

// Her markanın yüklenen ilk türünü bulur (symbol → icon); hiçbiri yoksa null. Sonuç oturum boyunca hatırlanır.
export async function resolveLogo(l, timeoutMs = 10000) {
  const cache = readCache()
  if (cache[l.domain] === 'none') return null
  if (cache[l.domain]) return { ...l, type: cache[l.domain] }
  for (const type of LOGO_TYPES) {
    if (await tryLoad(logoUrl(l.domain, type), timeoutMs)) {
      const c = readCache(); c[l.domain] = type; writeCache(c)
      return { ...l, type }
    }
  }
  const c = readCache(); c[l.domain] = 'none'; writeCache(c)
  return null
}

// Seviye kuralı: big+symbol → kolay, big+icon → orta, small (symbol/icon) → zor.
export function tierOf(l) {
  if (l.big) return l.type === 'symbol' ? 'kolay' : 'orta'
  return 'zor'
}

// Seçilen seviyeye uyan, gerçekten yüklenen n markayı bulur (karıştırıp 30'arlı gruplarla dener).
export async function pickForTier(logos, tier, n = 25) {
  const pool = (tier === 'zor' ? logos.small.map(l => ({ ...l, big: false })) : logos.big.map(l => ({ ...l, big: true })))
    .sort(() => Math.random() - 0.5)
  const found = []
  for (let i = 0; i < pool.length && found.length < n; i += 30) {
    const res = await Promise.all(pool.slice(i, i + 30).map(l => resolveLogo(l)))
    for (const r of res) if (r && tierOf(r) === tier) found.push(r)
  }
  return found.slice(0, n)
}

export default function LogoImg({ logo }) {
  if (!logo) return null
  return <img src={logoUrl(logo.domain, logo.type || 'symbol')} alt="logo" />
}
