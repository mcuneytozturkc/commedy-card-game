// ═══ Türkçe metin benzerliği — mükerrer / benzer kart tespiti (submit.html ve admin.html kullanır) ═══
function trFold(s) {
  return String(s == null ? '' : s).toLocaleLowerCase('tr')
    .replace(/[âäà]/g, 'a').replace(/[êë]/g, 'e').replace(/[îï]/g, 'i').replace(/[ôö]/g, 'o').replace(/[ûü]/g, 'u')
    .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ç/g, 'c');
}
function normText(s) { return trFold(s).replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim(); }

// Kart kalıbında sürekli geçen sözcükler (ilk 5 harfe indirgenmiş): benzerliği şişirmesin
const STOP = new Set(['soyle', 'yapab', 'yapam', 'hakki', 'bir', 'sey', 'ama', 'icin', 'ile', 'gibi', 'olan', 'kadar',
  'daha', 'cok', 'var', 'yok', 'bu', 'su', 'ki', 'de', 'da', 'mi', 'mu', 'ne', 'ben', 'sen', 'o', 'her', 'hic', 'veya', 'ya', 've',
  'yapil', 'yap', 'gor', 'yapm', 'yaki', 'duym', 'duyma']);
function contentStems(s) {
  return new Set(normText(s).split(' ').filter(w => w.length > 2).map(w => w.slice(0, 5)).filter(w => !STOP.has(w)));
}
function bigrams(s) {
  const t = normText(s).replace(/ /g, ''), m = new Map();
  for (let i = 0; i < t.length - 1; i++) { const g = t.slice(i, i + 2); m.set(g, (m.get(g) || 0) + 1); }
  return m;
}
function dice(a, b) {
  const A = bigrams(a), B = bigrams(b); let inter = 0, na = 0, nb = 0;
  A.forEach(v => na += v); B.forEach(v => nb += v);
  A.forEach((v, k) => { if (B.has(k)) inter += Math.min(v, B.get(k)); });
  return na + nb ? (2 * inter) / (na + nb) : 0;
}
function jaccard(a, b) {
  const A = contentStems(a), B = contentStems(b);
  if (!A.size || !B.size) return 0;
  let inter = 0; A.forEach(x => { if (B.has(x)) inter++; });
  return inter / (A.size + B.size - inter);
}
// Skor 0–1: birebir aynı (normalize edilmiş) = 1. Aksi halde bigram benzerliği ile içerik-sözcük benzerliğinin birleşimi.
function simScore(a, b) {
  const na = normText(a), nb = normText(b);
  if (!na || !nb) return { score: 0, exact: false };
  if (na === nb) return { score: 1, exact: true };
  const d = dice(a, b), j = jaccard(a, b);
  // Kalıp sözcükleri ("hakkında söylenebilecek ama…") bigram'ı şişirir → ceza düşülür; asıl ölçüt içerik sözcükleri
  return { score: Math.max(j, d - 0.25), exact: false, dice: d, jac: j };
}
const SIM_WARN = 0.6, SIM_STRONG = 0.85; // ≥0.6 "benzer", ≥0.85 "çok benzer", 1 = birebir
// pool: [{text, source, game, id}] → eşiği geçenler, en benzer önde
function findSimilar(text, pool, opts) {
  const th = (opts && opts.threshold) || SIM_WARN, limit = (opts && opts.limit) || 3;
  return pool.map(p => ({ ...p, ...simScore(text, p.text) })).filter(r => r.score >= th)
    .sort((x, y) => y.score - x.score).slice(0, limit);
}
if (typeof module !== 'undefined') module.exports = { trFold, normText, simScore, findSimilar, SIM_WARN, SIM_STRONG };
