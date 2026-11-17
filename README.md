# Yusuf Show 🎭

Sıra tabanlı komedi kart oyunu — React + Vite ile yazılmıştır.

2–4 takım yarışır, 1 sunucu en komik/yaratıcı performansı seçer. Her oyunda kart
çekilir, sıradaki kişi karta uygun bir şey söyler veya canlandırır, sunucu puanı verir.

## Oyunlar

| Oyun | Açıklama | Kart |
|------|----------|------|
| 😂 Komedi Kartları | Yaratıcı cevaplar + komik hareketler | 82 |
| 🤫 Pantomim Şov | Konuşmadan, sadece mimikle anlat | 80 |
| 🎬 Mini Sahne | İkili senaryo canlandırma | 80 |
| 🎤 Taklit Ustası | Ses, aksan, karakter taklidi | 80 |
| 🏷️ Logo Bilmece | Firebase ile çok oyunculu logo tahmini | 45 logo |

## Kurulum

```bash
npm install
npm run dev      # geliştirme sunucusu
npm run build    # production derleme (dist/)
npm run preview  # derlemeyi önizle
```

## Yapı

```
src/
  data/
    games.js     # 4 kart oyununun tüm kartları
    logos.js     # Logo Bilmece logoları (easy/medium/hard)
  components/
    Home.jsx     # Ana menü + oyun listesi
    CardGame.jsx # Kurulum → oyun → sonuç akışı
    LogoQuiz.jsx # Firebase çok oyunculu logo oyunu
    Navbar.jsx
  firebase.js    # Firebase Realtime Database yapılandırması
  App.jsx
  main.jsx
  index.css
```

## Logo Bilmece (çok oyunculu)

Firebase Realtime Database kullanır. Sunucu bir oturum oluşturur, 6 haneli kod
paylaşır; oyuncular kendi telefonlarından katılır. Yapılandırma `src/firebase.js`
içindedir.

## Android TV (APK) — USB ile yükleme

Uygulama Capacitor ile bir WebView APK'sına paketlenebilir. `android/` klasörü hazırdır
ve Android TV için yapılandırılmıştır (leanback launcher + TV banner, dokunmatik opsiyonel).

### Gerekli (kendi bilgisayarında)
- Android Studio (JDK + Android SDK ile birlikte gelir)

### Adımlar
```bash
npm install                 # capacitor paketleri dahil
npm run sync:android        # vite build + dist'i android'e kopyalar
npm run open:android        # projeyi Android Studio'da açar
```
Android Studio'da: **Build > Build Bundle(s)/APK(s) > Build APK(s)**.
APK şurada oluşur: `android/app/build/outputs/apk/debug/app-debug.apk`

Komut satırını tercih edersen (Android SDK kuruluysa):
```bash
cd android && ./gradlew assembleDebug
```

### TV'ye yükleme
1. APK'yı bir USB belleğe kopyala, TV'ye tak.
2. Android TV > **Ayarlar > Uygulamalar > Güvenlik > Bilinmeyen kaynaklar**'a izin ver
   (kullanacağın dosya yöneticisi için).
3. TV'de bir dosya yöneticisi (ör. "X-plore", "File Commander") ile USB'deki APK'yı aç ve kur.
4. Alternatif: aynı ağdaki bilgisayardan `adb connect <tv-ip>` sonra `adb install app-debug.apk`.

### Kumanda notu
Android TV kumandası D-pad ile gezinir; bu sürüm tıklama odaklıdır. İmleçli (air-mouse)
kumanda ile sorunsuz çalışır. Tam D-pad (ok tuşu + Enter) navigasyonu istersen kod
tarafında butonların odaklanabilir yapılması gerekir.
