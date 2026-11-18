// Oyun içeriği (kartlar, Ok mu Nok mu soruları/sonuç metinleri, logo markaları): Firebase `content/` yolundan okunur.
// Admin sayfasından değiştirilir → uygulamayı güncellemeye gerek kalmaz. Okunamazsa (internet yok, kural yayınlanmamış,
// boş) önce son önbellek, o da yoksa uygulamaya gömülü yedek liste kullanılır.
import { ref, get } from 'firebase/database'
import { db } from './firebase.js'
import { OKNOK_QUESTIONS, TOXICITY } from './data/oknok.js'
import { LQ_LOGOS } from './data/logos.js'
import { GAMES } from './data/games.js'

const CACHE_KEY = 'ys_content_v1'
const fallback = {
  comedy: GAMES.comedy.cards,
  oknokQuestions: OKNOK_QUESTIONS,
  toxicity: TOXICITY,
  logos: LQ_LOGOS,
}

const toList = (o) => (o ? Object.entries(o).sort(([a], [b]) => (a < b ? -1 : 1)).map(([, v]) => v) : [])

// Firebase'den gelen ham veriyi uygulamanın kullandığı biçime çevirir; boş/bozuk bölümler atlanır (yedek kullanılır)
function normalize(raw) {
  const out = {}
  const comedy = toList(raw?.comedy).filter(c => c && typeof c.text === 'string' && c.text.trim())
  if (comedy.length) out.comedy = comedy.map(c => ({ text: c.text, category: c.category || '✨ Genel', type: c.type || 'verbal' }))
  const qs = toList(raw?.oknok?.questions).filter(q => typeof q === 'string' && q.trim())
  if (qs.length) out.oknokQuestions = qs
  const tox = toList(raw?.oknok?.toxicity).filter(t => t && typeof t.max === 'number' && t.title).sort((a, b) => a.max - b.max)
  if (tox.length) out.toxicity = tox
  const okLogo = l => l && l.name && l.domain
  const big = toList(raw?.logos?.big).filter(okLogo)
  const small = toList(raw?.logos?.small).filter(okLogo)
  if (big.length || small.length) {
    out.logos = { big: big.length ? big : fallback.logos.big, small: small.length ? small : fallback.logos.small }
  }
  return out
}

let store = { ...fallback }
try {
  const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')
  if (cached) store = { ...fallback, ...normalize(cached) }
} catch { /* yoksay */ }

export function getContent() { return store }

let inflight = null
let lastOk = 0
// Firebase'den içeriği yeniler. 60 sn içinde tekrar çağrılırsa mevcut olanı kullanır; hata olursa sessizce yedekte kalır.
export function refreshContent({ force = false, timeoutMs = 6000 } = {}) {
  if (inflight) return inflight
  if (!force && Date.now() - lastOk < 60000) return Promise.resolve(store)
  inflight = Promise.race([
    get(ref(db, 'content')).then(snap => {
      const raw = snap.val()
      if (raw) {
        store = { ...fallback, ...normalize(raw) }
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(raw)) } catch { /* yoksay */ }
      }
      lastOk = Date.now()
      return store
    }),
    new Promise(resolve => setTimeout(() => resolve(store), timeoutMs)),
  ]).catch(() => store).finally(() => { inflight = null })
  return inflight
}

export function getToxicity(nokCount) {
  const t = store.toxicity
  return t.find(x => x.max >= nokCount) || t[t.length - 1]
}
