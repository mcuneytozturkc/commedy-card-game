// Gömülü oyun içeriğinden (src/data) Firebase'e ilk yükleme dosyasını üretir: public/content-seed.json
// Kullanım: node scripts/gen-seed.mjs   → sonra admin sayfası > ⚙️ İçerik > "Yerleşik içeriği yükle"
import { writeFileSync } from 'node:fs'
import { GAMES } from '../src/data/games.js'
import { OKNOK_QUESTIONS, TOXICITY } from '../src/data/oknok.js'
import { LQ_LOGOS } from '../src/data/logos.js'

const keyed = (arr, prefix, fn = x => x) => Object.fromEntries(arr.map((x, i) => [prefix + String(i + 1).padStart(4, '0'), fn(x)]))
const seed = {
  comedy: keyed(GAMES.comedy.cards, 'c', c => ({ text: c.text, category: c.category || '✨ Genel', type: c.type })),
  oknok: {
    questions: keyed(OKNOK_QUESTIONS, 'q'),
    toxicity: keyed(TOXICITY, 't'),
  },
  logos: {
    big: keyed(LQ_LOGOS.big, 'b', l => ({ name: l.name, domain: l.domain })),
    small: keyed(LQ_LOGOS.small, 's', l => ({ name: l.name, domain: l.domain })),
  },
}
writeFileSync('public/content-seed.json', JSON.stringify(seed))
console.log('comedy', GAMES.comedy.cards.length, '| oknok', OKNOK_QUESTIONS.length, '| tox', TOXICITY.length, '| big', LQ_LOGOS.big.length, '| small', LQ_LOGOS.small.length)
