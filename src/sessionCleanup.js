// Eski oturumları Firebase'den siler (Realtime Database'de otomatik süre aşımı yok).
// Her yeni oturum açılırken çağrılır; böylece veritabanında en fazla son birkaç saatin oturumu kalır.
// Sunucu saatine göre hesaplanır (TV/telefon saati yanlış olsa da güvenli). `createdAt` yazılmamış eski oturumlar da silinir.
import { ref, get, query, orderByChild, endAt, update, onValue } from 'firebase/database'
import { db } from './firebase.js'

const MAX_AGE_MS = 12 * 60 * 60 * 1000

function serverOffset() {
  return new Promise(resolve => {
    const t = setTimeout(() => resolve(0), 3000)
    onValue(ref(db, '.info/serverTimeOffset'), s => { clearTimeout(t); resolve(s.val() || 0) }, () => { clearTimeout(t); resolve(0) }, { onlyOnce: true })
  })
}

export async function cleanupOldSessions(maxAgeMs = MAX_AGE_MS) {
  try {
    const cutoff = Date.now() + (await serverOffset()) - maxAgeMs
    const snap = await get(query(ref(db, 'sessions'), orderByChild('createdAt'), endAt(cutoff)))
    const upd = {}
    snap.forEach(ch => { upd[ch.key] = null })
    const n = Object.keys(upd).length
    if (n) await update(ref(db, 'sessions'), upd)
    return n
  } catch {
    return 0 // temizlik başarısız olsa da oyun etkilenmesin
  }
}
