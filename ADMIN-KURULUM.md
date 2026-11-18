# Kart gönderme + admin onayı — kurulum

Sayfalar: `submit.html` (herkes kart/soru gönderir), `admin.html` (admin onaylar/reddeder/düzenler), `database.rules.json` (güvenlik kuralları).
Akış: gönderilen kart `cards/pending` altına düşer → admin onaylarsa `cards/approved` altına taşınır → TV, oyun başlarken onaylı komedi kartlarını havuza katar.

## Bir kerelik Firebase ayarı (≈5 dk)
1. Firebase Console → proje **commedy-card-game** → **Authentication → Sign-in method → E-posta/Şifre**'yi etkinleştir.
2. **Authentication → Users → Kullanıcı ekle**: kendi e-postan + güçlü bir şifre (admin hesabın bu).
3. `admin.html`'i aç, bu hesapla giriş yap. Sağ üstte **UID** görünür; kopyala. (Kurallar henüz güncellenmediyse "okunamadı" uyarısı çıkar, UID yine görünür.)
4. **Realtime Database → Kurallar**: `database.rules.json` içindeki `"cards": { ... }` bloğunu kopyala, `ADMIN_UID` yerine kendi UID'ni yaz, Yayınla de.
   - Şu anki kurallarını önce kontrol et. Dosyadaki `sessions` bölümü (herkese açık okuma/yazma) şu anki davranışı korumak için konuldu; mevcut `sessions` kuralların farklıysa onları aynen bırak, yalnızca `cards` bloğunu ekle.
5. Sayfaları yayınla (GitHub Pages / Netlify). `admin.html` linkini kimseye verme (giriş zaten şifreli, ama gizli tutmak iyi).

## Mükerrer / benzer kontrolü
- Gönderirken: yerleşik + onaylı kartlarla karşılaştırılır. Birebir aynıysa gönderilemez; benzerse (≥%60) uyarı çıkar ama gönderilebilir.
- Admin panelinde: her bekleyen kart yerleşik, onaylı ve diğer bekleyen kartlarla karşılaştırılır. Birebir aynı olanın "Onayla" düğmesi kapalıdır; benzerler turuncu işaretlenir ve en yakın eşleşmeler yüzdeyle listelenir.
- Anlam olarak aynı ama farklı kelimelerle yazılmış kartlar (eş anlamlılar) otomatik yakalanmaz; son kararı admin verir.

## Notlar
- "Bilmece / Soru" türü kayıt altına alınır ama şu an oynanan bir bilmece modu yok; TV yalnızca **Komedi** kartlarını havuza katıyor. Diğer türler (Pantomim, Mini Sahne, Taklit, Bilmece) onaylı listede bekler.
- İstemci tarafı hız sınırı (8 sn arayla, saatte 20 kart) ve bot tuzağı var; asıl koruma admin onayıdır. Kurallar ayrıca alan uzunluklarını ve izin verilen oyun türlerini doğrular.

## ⚙️ Oyun içeriği Firebase'de (uygulamayı güncellemeden değiştir)
Komedi kartları, Ok mu Nok mu soruları ve sonuç metinleri, Logo Bilmece marka listeleri (büyük/küçük) Firebase'de `content/` altında durur.
Uygulama (TV, telefon, web) bunları açılışta okur; okunamazsa son önbelleği, o da yoksa uygulamaya gömülü yedek listeyi kullanır.
Yeni özellik değilse (yalnızca içerik) APK yeniden yapmaya / push etmeye gerek yoktur.

**Bir kerelik kurulum**
1. `database.rules.json` içindeki yeni `"content"` bloğunu Firebase → Realtime Database → Kurallar'a ekle (`ADMIN_UID` yerine kendi UID'n) ve Yayınla.
2. `admin.html` → giriş → **⚙️ İçerik** sekmesi → **"Yerleşik içeriği Firebase'e yükle"**. (Gömülü listeyi `content/` altına yazar; sonradan eklediklerini silmemesi için bunu yalnızca ilk kez yap.)

**Günlük kullanım:** admin → ⚙️ İçerik → listeyi seç → ekle / düzenle / sil. Değişiklik anında geçerlidir (uygulama bir sonraki açılışta ya da oyuna girişte yeniler).
- Logo markaları için alan adı gerekir (örn. `nike.com`); simgesi Brandfetch'te bulunmayan markalar oyunda otomatik elenir.
- Gömülü yedek liste (`src/data/*.js`, `public/cards.js`) güncel tutulmak zorunda değil; yalnızca internet/Firebase yokken devreye girer. Yeniden üretmek için: `node scripts/gen-seed.mjs`.

## 🧹 Eski oturumların temizliği
Realtime Database'de otomatik süre aşımı yoktur; bu yüzden her yeni oturum (Komedi, Logo Bilmece, Ok mu Nok mu) açılırken **12 saatten eski** (ya da `createdAt` alanı olmayan eski) oturumlar silinir. Zamanlama sunucu saatine göre yapılır. Admin → ⚙️ İçerik → **🧹 Eski oturumları temizle** ile elle de çalıştırılabilir.
- Bunun hızlı çalışması için kurallarda `sessions` altında `".indexOn": ["createdAt"]` bulunmalı (`database.rules.json`'da var; Firebase'e yayınlamayı unutma). Yayınlanmazsa temizlik sessizce çalışmaz, oyun etkilenmez.
- Ok mu Nok mu tur sonuçları veritabanına yazılmaz; yalnızca sunucu ekranının belleğinde tutulur.
