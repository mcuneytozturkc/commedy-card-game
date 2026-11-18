// ═══ Ortak: Firebase ayarı + yardımcılar (tv.html ve play.html kullanır) ═══
const FB_CONFIG = {
  apiKey: "AIzaSyA9M8Worx1TJAEnBimNYzMIYNRlj5WDZwg",
  authDomain: "commedy-card-game.firebaseapp.com",
  databaseURL: "https://commedy-card-game-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "commedy-card-game"
};
const TEAM_EMOJI  = ['🟣', '🩷', '🔵', '🟢'];
const DEFAULT_TEAM_NAMES = ['Mor Takım', 'Pembe Takım', 'Mavi Takım', 'Yeşil Takım'];
const UNIT_COLORS = ['#a855f7', '#ec4899', '#3b82f6', '#22c55e', '#f59e0b', '#06b6d4', '#ef4444', '#84cc16'];
const LETTERS = 'ABCDEFGHIJKLMNOP';
const MAX_PLAYERS = 6;   // en fazla oyuncu sayısı (hem bireysel hem takım modunda toplam)

function initDb() {
  if (!firebase.apps.length) firebase.initializeApp(FB_CONFIG);
  return firebase.database();
}
// Oturum yolu: Logo Bilmece ile aynı 'sessions' düğümü (mevcut güvenlik kuralları aynen geçerli)
function sessionRef(db, code) { return db.ref('sessions/' + code); }

function genCode() {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // karışan harfler (0/O, 1/I) yok
  let r = ''; for (let i = 0; i < 5; i++) r += c[Math.floor(Math.random() * c.length)];
  return r;
}
function genId() { return Math.random().toString(36).slice(2, 10); }
function shuffle(a) {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
// Firebase boş düğümleri tutmaz, sayısal anahtarları diziye çevirir → hep [[anahtar, değer], ...] olarak oku
function entries(o) { return Object.keys(o || {}).map(k => [k, o[k]]).filter(e => e[1] != null); }

// ───── Takımlar ─────
function teamList(D) {
  return entries(D.teams).sort((a, b) => a[0].localeCompare(b[0])).map(([id, t]) => ({ id, idx: +id.slice(1), name: t.name }));
}
function teamMembers(D, tid) {
  return entries(D.players).filter(([, p]) => p.team === tid)
    .sort((a, b) => (a[1].joinedAt || 0) - (b[1].joinedAt || 0) || a[0].localeCompare(b[0]))
    .map(([pid, p]) => ({ pid, name: p.name, online: p.online !== false }));
}

// ───── Yarışan "birimler": takım modunda takımlar, bireysel modda oyuncuların kendisi ─────
function isSolo(D) { return D.teamMode === 'solo'; }
function playerList(D) {
  return entries(D.players).filter(([, p]) => p.name)
    .sort((a, b) => (a[1].joinedAt || 0) - (b[1].joinedAt || 0) || a[0].localeCompare(b[0]))
    .map(([pid, p]) => ({ pid, name: p.name, team: p.team || null, online: p.online !== false }));
}
function units(D) {
  if (!isSolo(D)) return teamList(D);
  return playerList(D).map((p, i) => ({ id: p.pid, idx: i, name: p.name }));
}
function unitColor(u) { return UNIT_COLORS[u.idx % UNIT_COLORS.length]; }
function unitEmoji(D, u) { return isSolo(D) ? '👤' : TEAM_EMOJI[u.idx % 4]; }
// Oyuncunun ait olduğu birim: takım modunda takım kimliği, bireyselde kendi kimliği
function unitOf(D, pid) {
  const p = (D.players || {})[pid];
  if (!p) return null;
  return isSolo(D) ? pid : (p.team || null);
}
// Sıradaki kişi: takımın üyeleri arasında tur sırasına göre döner (bireyselde herkes kendi sırası)
function pickSpeaker(D, uid, round) {
  if (isSolo(D)) return (D.players || {})[uid] ? uid : null;
  const m = teamMembers(D, uid);
  return m.length ? m[round % m.length].pid : null;
}
// Aksiyon kartları (hareket) yazıyla cevaplanamaz → her zaman sesli/canlı
function effectiveMode(mode, card) { return card && card.type === 'action' ? 'spoken' : mode; }
// Telefonların açacağı sitenin yayınlanmış adresi (sonu "/" ile biter). Boşsa sayfanın kendi adresi kullanılır.
// TV sayfası Android APK içinde (localhost) ya da bilgisayardan dosya/localhost olarak açılıyorsa MUTLAKA doldur.
// Tek ayar yeri: public/config.js → window.YS_PUBLIC_BASE_URL = 'https://siten.com/';
const PUBLIC_BASE_URL = (() => { const v = (typeof window !== 'undefined' && window.YS_PUBLIC_BASE_URL) || ''; return v && !v.endsWith('/') ? v + '/' : v; })();
function playUrl(code) {
  const base = PUBLIC_BASE_URL || location.href.replace(/[^/]*([?#].*)?$/, '');
  return base + 'play.html?c=' + code;
}
// Kart / soru gönderme sayfasının adresi ('' = telefonlar ulaşamaz)
function submitUrl() {
  if (joinUrlProblem()) return '';
  return (PUBLIC_BASE_URL || location.href.replace(/[^/]*([?#].*)?$/, '')) + 'submit.html';
}
// Telefonlar bu adrese ulaşamayacaksa nedenini döndürür (yoksa null)
function joinUrlProblem() {
  if (PUBLIC_BASE_URL) return null;
  if (location.protocol === 'file:') return 'Bu sayfa bilgisayardaki dosyadan açıldı; telefonlar buna bağlanamaz.';
  if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) return 'Bu sayfa "localhost" adresinden açıldı (geliştirme sunucusu ya da Android TV uygulaması); telefonlar buna bağlanamaz.';
  return null;
}

// ───── Kullanıcı kartları (gönderme + admin onayı) ─────
// Firebase: cards/pending/{id} (herkes ekleyebilir, yalnız admin okur) → cards/approved/{id} (herkes okur, yalnız admin yazar)
const SUBMIT_GAMES = {
  comedy:    { name: 'Komedi Kartları', emoji: '😂', hint: 'Örn: "Asansörde yapabileceğin ama iş toplantısında yapamayacağın bir şey"' },
  pantomime: { name: 'Pantomim Şov',    emoji: '🤫', hint: 'Örn: "Karanlıkta mobilyaya parmağını çarpan ama kimseyi uyandırmak istemeyen biri"' },
  theatre:   { name: 'Mini Sahne',      emoji: '🎬', hint: 'Örn: kısa bir sahne/rol görevi' },
  imitation: { name: 'Taklit Ustası',   emoji: '🎤', hint: 'Örn: taklit edilecek ses/kişi/hayvan' },
  riddle:    { name: 'Bilmece / Soru',  emoji: '🧩', hint: 'Örn: "Anahtarlarım var ama kilit açamam. Ben neyim?"' }
};
function typeForGame(game, kind) {
  return game === 'comedy' ? (kind === 'action' ? 'action' : 'verbal')
    : game === 'pantomime' ? 'action' : game === 'theatre' ? 'theatre' : game === 'imitation' ? 'sound' : 'riddle';
}
// Yerleşik + onaylı kartlar: oyun başına tek liste
function loadApprovedCards(db) {
  return db.ref('cards/approved').once('value')
    .then(s => entries(s.val()).map(([id, c]) => ({ ...c, id })))
    .catch(() => []);
}
// Oyun içeriği: Firebase content/comedy (admin yönetir). Okunamazsa cards.js'teki gömülü liste kullanılır.
let CONTENT_CARDS = null;
function setContentCards(game, list) { CONTENT_CARDS = CONTENT_CARDS || {}; CONTENT_CARDS[game] = list; }
function loadContentCards(db) {
  return db.ref('content/comedy').once('value')
    .then(s => { const v = entries(s.val()).sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(e => e[1]).filter(c => c && c.text); if (v.length) setContentCards('comedy', v); })
    .catch(() => {});
}
function contentCards(game) {
  return (CONTENT_CARDS && CONTENT_CARDS[game]) || (typeof BUILTIN_CARDS !== 'undefined' && BUILTIN_CARDS[game]) || [];
}
function builtinPool(game) {
  return contentCards(game).map((c, i) => ({ text: c.text, source: 'yerleşik', game, id: 'b' + i }));
}
