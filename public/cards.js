// Yerleşik kartlar — src/data/games.js'ten üretildi (kaynak o dosya; kartları orada değiştirirsen bu dosyayı yeniden üret).
// Kullanıcıların gönderip admin onayıyla eklenen kartlar Firebase'de (cards/approved) durur.
const BUILTIN_CARDS = {
 "comedy": [
  {
   "text": "Bilgisayarlar hakkında söylenebilecek ama partnerinin hakkında söyleyemeyeceğin bir şey",
   "category": "Teknoloji",
   "type": "verbal"
  },
  {
   "text": "Hem bilgisayarlar hem partnerinin hakkında söyleyebileceğin bir şey",
   "category": "Teknoloji",
   "type": "verbal"
  },
  {
   "text": "Soyunduğunda duymak istemeyeceğin bir şey",
   "category": "Sosyal",
   "type": "verbal"
  },
  {
   "text": "Birini beklerken yapabileceğin ama yatakta yapmaman gereken bir şey",
   "category": "Günlük",
   "type": "verbal"
  },
  {
   "text": "Annenin evinde yapabileceğin ama ofiste yapamayacağın bir şey",
   "category": "Ofis",
   "type": "verbal"
  },
  {
   "text": "Yazıcıya söyleyebileceğin ama sevgiliye söyleyemeyeceğin bir şey",
   "category": "Teknoloji",
   "type": "verbal"
  },
  {
   "text": "Bebeklere yakışan ama 30 yaşında yapılınca garip kaçan bir şey",
   "category": "Yaş",
   "type": "verbal"
  },
  {
   "text": "Wi-Fi hakkında söyleyebileceğin ama eşin hakkında söyleyemeyeceğin bir şey",
   "category": "Teknoloji",
   "type": "verbal"
  },
  {
   "text": "Asansörde yapabileceğin ama iş toplantısında yapamayacağın bir şey",
   "category": "Ofis",
   "type": "verbal"
  },
  {
   "text": "Kediler hakkında söylenebilecek ama patronun hakkında söyleyemeyeceğin bir şey",
   "category": "Hayvanlar",
   "type": "verbal"
  },
  {
   "text": "Trafikte yapabileceğin ama akşam yemeğinde yapamayacağın bir şey",
   "category": "Trafik",
   "type": "verbal"
  },
  {
   "text": "Yaşlı bir araba hakkında söylenebilecek ama büyükbaban hakkında söyleyemeyeceğin bir şey",
   "category": "Trafik",
   "type": "verbal"
  },
  {
   "text": "Spor salonu hakkında söyleyebileceğin ama romantik bir akşamda söyleyemeyeceğin bir şey",
   "category": "Spor",
   "type": "verbal"
  },
  {
   "text": "Hava durumu hakkında söylenebilecek ama doktoruna söyleyemeyeceğin bir şey",
   "category": "Günlük",
   "type": "verbal"
  },
  {
   "text": "Çorba hakkında söylenebilecek ama eski sevgilinin hakkında söyleyemeyeceğin bir şey",
   "category": "Yemek",
   "type": "verbal"
  },
  {
   "text": "Tost makinesine söylenebilecek ama yeni patrona söyleyemeyeceğin bir şey",
   "category": "Ev",
   "type": "verbal"
  },
  {
   "text": "Pizza hakkında söylenebilecek ama bebeğin hakkında söyleyemeyeceğin bir şey",
   "category": "Yemek",
   "type": "verbal"
  },
  {
   "text": "Kayınvalidene söyleyemezsin ama koltuk hakkında rahatlıkla söyleyebileceğin bir şey",
   "category": "Ev",
   "type": "verbal"
  },
  {
   "text": "Tatilde rahatlıkla yapabileceğin ama Pazartesi sabahı ofiste yapamayacağın bir şey",
   "category": "✈️ Tatil",
   "type": "verbal"
  },
  {
   "text": "Buzdolabı hakkında söylenebilecek ama kayınvalidenin hakkında söyleyemeyeceğin bir şey",
   "category": "Ev",
   "type": "verbal"
  },
  {
   "text": "Telefonuna söyleyebileceğin ama anneannene söyleyemeyeceğin bir şey",
   "category": "Teknoloji",
   "type": "verbal"
  },
  {
   "text": "Markette yapabileceğin ama düğünde yapamayacağın bir şey",
   "category": "Alışveriş",
   "type": "verbal"
  },
  {
   "text": "Köpeğine söyleyebileceğin ama iş arkadaşına söyleyemeyeceğin bir şey",
   "category": "Hayvanlar",
   "type": "verbal"
  },
  {
   "text": "Klima hakkında söylenebilecek ama sevgilin hakkında söyleyemeyeceğin bir şey",
   "category": "❄️ Ev",
   "type": "verbal"
  },
  {
   "text": "Saç kurutma makinesine söyleyebileceğin ama berberine söyleyemeyeceğin bir şey",
   "category": "Günlük",
   "type": "verbal"
  },
  {
   "text": "Banyoda yapabileceğin ama mutfakta yapmaman gereken bir şey",
   "category": "Ev",
   "type": "verbal"
  },
  {
   "text": "Bir kaktüs hakkında söylenebilecek ama ablanın hakkında söyleyemeyeceğin bir şey",
   "category": "Doğa",
   "type": "verbal"
  },
  {
   "text": "Otobüs durağında yapabileceğin ama iş görüşmesinde yapamayacağın bir şey",
   "category": "Sosyal",
   "type": "verbal"
  },
  {
   "text": "Çamaşır makinesine söyleyebileceğin ama komşuna söyleyemeyeceğin bir şey",
   "category": "Ev",
   "type": "verbal"
  },
  {
   "text": "Bir kar tanesi hakkında söylenebilecek ama kuzenin hakkında söyleyemeyeceğin bir şey",
   "category": "❄️ Doğa",
   "type": "verbal"
  },
  {
   "text": "Plajda yapabileceğin ama camide yapamayacağın bir şey",
   "category": "Tatil",
   "type": "verbal"
  },
  {
   "text": "Mikrodalgaya söyleyebileceğin ama doktora söyleyemeyeceğin bir şey",
   "category": "Ev",
   "type": "verbal"
  },
  {
   "text": "Bir balon hakkında söylenebilecek ama patronun hakkında söyleyemeyeceğin bir şey",
   "category": "Eğlence",
   "type": "verbal"
  },
  {
   "text": "Yatakta söyleyebileceğin ama büyük aile yemeğinde söyleyemeyeceğin bir şey",
   "category": "Sosyal",
   "type": "verbal"
  },
  {
   "text": "Süpürgeye söyleyebileceğin ama yeni tanıştığın birine söyleyemeyeceğin bir şey",
   "category": "Ev",
   "type": "verbal"
  },
  {
   "text": "Bir muz hakkında söylenebilecek ama eşinin annesine söyleyemeyeceğin bir şey",
   "category": "Yemek",
   "type": "verbal"
  },
  {
   "text": "Sıcak bir yaz günü hakkında söylenebilecek ama eski sevgiline söyleyemeyeceğin bir şey",
   "category": "☀️ Doğa",
   "type": "verbal"
  },
  {
   "text": "Bir robot süpürgeye söyleyebileceğin ama çocuğuna söyleyemeyeceğin bir şey",
   "category": "Teknoloji",
   "type": "verbal"
  },
  {
   "text": "Spor ayakkabısı hakkında söylenebilecek ama sevgiline söyleyemeyeceğin bir şey",
   "category": "Moda",
   "type": "verbal"
  },
  {
   "text": "Bir lambaya söyleyebileceğin ama iş arkadaşına söyleyemeyeceğin bir şey",
   "category": "Ev",
   "type": "verbal"
  },
  {
   "text": "Kuaförde yapabileceğin ama hastanede yapamayacağın bir şey",
   "category": "Günlük",
   "type": "verbal"
  },
  {
   "text": "Bir karpuz hakkında söylenebilecek ama nişanlının hakkında söyleyemeyeceğin bir şey",
   "category": "Yemek",
   "type": "verbal"
  },
  {
   "text": "Bulaşık makinesine söyleyebileceğin ama partnerinin annesine söyleyemeyeceğin bir şey",
   "category": "Ev",
   "type": "verbal"
  },
  {
   "text": "Sinema salonunda yapabileceğin ama kütüphanede yapamayacağın bir şey",
   "category": "Sosyal",
   "type": "verbal"
  },
  {
   "text": "Bir yorgan hakkında söylenebilecek ama patronun hakkında söyleyemeyeceğin bir şey",
   "category": "Ev",
   "type": "verbal"
  },
  {
   "text": "Asansörde söyleyebileceğin ama asansör görevlisine söyleyemeyeceğin bir şey",
   "category": "Sosyal",
   "type": "verbal"
  },
  {
   "text": "Bir kahve makinesine söyleyebileceğin ama ilk randevuda söyleyemeyeceğin bir şey",
   "category": "☕ Günlük",
   "type": "verbal"
  },
  {
   "text": "Bahçedeyken yapabileceğin ama toplantı odasında yapamayacağın bir şey",
   "category": "Doğa",
   "type": "verbal"
  },
  {
   "text": "Bir tencere hakkında söylenebilecek ama kayınpederinin hakkında söyleyemeyeceğin bir şey",
   "category": "Ev",
   "type": "verbal"
  },
  {
   "text": "Akşam yatarken söyleyebileceğin ama sabah toplantısında söyleyemeyeceğin bir şey",
   "category": "Günlük",
   "type": "verbal"
  },
  {
   "text": "Bir prizden bahsederken söyleyebileceğin ama partnerinden bahsederken söyleyemeyeceğin bir şey",
   "category": "Ev",
   "type": "verbal"
  },
  {
   "text": "Köy düğününde yapabileceğin ama lüks restoranda yapamayacağın bir şey",
   "category": "Sosyal",
   "type": "verbal"
  },
  {
   "text": "Bir tavuk hakkında söylenebilecek ama öğretmenine söyleyemeyeceğin bir şey",
   "category": "Hayvanlar",
   "type": "verbal"
  },
  {
   "text": "Eski bir telefon hakkında söylenebilecek ama büyükannenin hakkında söyleyemeyeceğin bir şey",
   "category": "Teknoloji",
   "type": "verbal"
  },
  {
   "text": "Duşta söyleyebileceğin ama iş yerinde söyleyemeyeceğin bir şey",
   "category": "Günlük",
   "type": "verbal"
  },
  {
   "text": "Bir terlik hakkında söylenebilecek ama yeni komşuna söyleyemeyeceğin bir şey",
   "category": "Ev",
   "type": "verbal"
  },
  {
   "text": "Bir kediye söyleyebileceğin ama trafik polisine söyleyemeyeceğin bir şey",
   "category": "Hayvanlar",
   "type": "verbal"
  },
  {
   "text": "Halı saha maçında yapabileceğin ama iş yemeğinde yapamayacağın bir şey",
   "category": "⚽ Spor",
   "type": "verbal"
  },
  {
   "text": "Bir ütüye söyleyebileceğin ama partnerinin arkadaşına söyleyemeyeceğin bir şey",
   "category": "Ev",
   "type": "verbal"
  },
  {
   "text": "Bir patatese söyleyebileceğin ama spor hocana söyleyemeyeceğin bir şey",
   "category": "Yemek",
   "type": "verbal"
  },
  {
   "text": "Kar yağarken yapabileceğin ama sınavda yapamayacağın bir şey",
   "category": "⛄ Doğa",
   "type": "verbal"
  },
  {
   "text": "Bir vantilatöre söyleyebileceğin ama yeni iş arkadaşına söyleyemeyeceğin bir şey",
   "category": "Ev",
   "type": "verbal"
  },
  {
   "text": "Bir ağaç hakkında söylenebilecek ama dayının hakkında söyleyemeyeceğin bir şey",
   "category": "Doğa",
   "type": "verbal"
  },
  {
   "text": "Konser alanında yapabileceğin ama iş toplantısında yapamayacağın bir şey",
   "category": "Eğlence",
   "type": "verbal"
  },
  {
   "text": "Çok beğendiğin ama utanarak yediğin bir yemeği yermiş gibi davran",
   "category": "Hareket",
   "type": "action"
  },
  {
   "text": "Aynada kendinle buluşacakmış gibi hazırlan — süreç önemli!",
   "category": "Hareket",
   "type": "action"
  },
  {
   "text": "Komşunu ziyarete gelmiş gibi kapıdan gir",
   "category": "Hareket",
   "type": "action"
  },
  {
   "text": "10 saniyede çok yorgunum uyuyacağım dan tamam bir bölüm daha izlerim e geç",
   "category": "Hareket",
   "type": "action"
  },
  {
   "text": "Sepete ürün ekle, fiyatı gör, kaldır — duygularını yüzünle anlat",
   "category": "Alışveriş",
   "type": "action"
  },
  {
   "text": "Annenin seni üç kez isimle çağırışını taklit et — tonlamayla birlikte",
   "category": "Hareket",
   "type": "action"
  },
  {
   "text": "Şarjı biten telefona bağlı kalmaya çalışan birini oyna",
   "category": "Teknoloji",
   "type": "action"
  },
  {
   "text": "Banka müdürü gibi davranarak kendi doğum günü pastanı iste",
   "category": "Hareket",
   "type": "action"
  },
  {
   "text": "İlk kez yüksek topuklu ayakkabı giymiş biri gibi salonda yürü",
   "category": "Moda",
   "type": "action"
  },
  {
   "text": "Çok ekşi bir limonu ilk kez tadan birini canlandır",
   "category": "Yemek",
   "type": "action"
  },
  {
   "text": "Otobüse son anda yetişmeye çalışan birini oyna — ve kaçırdın",
   "category": "Günlük",
   "type": "action"
  },
  {
   "text": "Selfie çekmeye çalışıp 10 farklı poz deneyen birini canlandır",
   "category": "Sosyal",
   "type": "action"
  },
  {
   "text": "Sıcak çorbayı üflemeden içip dilini yakan birini oyna",
   "category": "Yemek",
   "type": "action"
  },
  {
   "text": "Asansörde yanlış kata bastığını fark eden birini canlandır",
   "category": "Günlük",
   "type": "action"
  },
  {
   "text": "Çok beğenmediğin bir hediyeyi açarken mutlu görünmeye çalış",
   "category": "Sosyal",
   "type": "action"
  },
  {
   "text": "Karanlıkta sessizce buzdolabına gidip atıştırmalık arayan birini oyna",
   "category": "Ev",
   "type": "action"
  },
  {
   "text": "Yağmurda şemsiyesi ters dönen birini canlandır",
   "category": "☔ Günlük",
   "type": "action"
  },
  {
   "text": "Spor salonunda ağır aleti kaldıramayıp idare ediyormuş gibi yapan biri",
   "category": "Spor",
   "type": "action"
  },
  {
   "text": "Telefonda komik bir mesaj okuyup kahkaha atmamaya çalışan toplantı katılımcısı",
   "category": "Ofis",
   "type": "action"
  },
  {
   "text": "Yeni aldığın ayakkabıyla caka satarak yürü ama ayağın acıyor",
   "category": "Moda",
   "type": "action"
  },
  {
   "text": "Garip bir dans hareketini ciddi ciddi öğretmeye çalışan biri ol",
   "category": "Eğlence",
   "type": "action"
  },
  {
   "text": "Çok gizli bir sır söyleyecekmiş gibi yaklaş ama unutmuş gibi yap",
   "category": "Sosyal",
   "type": "action"
  }
 ]
};
const GAME_META = {"comedy":{"name":"Komedi Kartları","emoji":"😂"}};
const COMEDY_CARDS = BUILTIN_CARDS.comedy; // eski ad (geriye uyumluluk)
