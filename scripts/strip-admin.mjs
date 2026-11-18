// Android TV uygulamasından admin sayfasını çıkarır: yönetim yalnızca web adresinden (telefon/PC) yapılır.
// `npm run sync:android` içinde cap copy'den sonra çalışır.
import { existsSync, rmSync } from 'node:fs'

const targets = [
  'android/app/src/main/assets/public/admin.html',
  'android/app/src/main/assets/public/content-seed.json',
]
for (const f of targets) {
  if (existsSync(f)) {
    rmSync(f)
    console.log('APK içinden kaldırıldı:', f)
  }
}
