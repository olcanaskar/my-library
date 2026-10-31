# My Library

Her konu bir kitap, her not bir sayfa.

Ders notlarını kütüphane rafında tutan, hesap gerektirmeyen ve cihazında
çalışan bir not defteri. Konular kitap sırtı olur; sayfalar doldukça sırt
kalınlaşır.

[Web uygulamasını aç](https://my-library-pi-one.vercel.app) ·
[Son sürümü indir](https://github.com/olcanaskar/my-library/releases/latest)

| Masaüstü | Android |
|:---:|:---:|
| <img src="docs/screenshot-desktop.png" alt="My Library masaüstü görünümü" width="640" /> | <img src="docs/screenshot-android.png" alt="My Library Android görünümü" width="220" /> |

## İndir

| Platform | Dosya | Not |
|---|---|---|
| Windows 10+ | [MyLibrary-0.1.0-portable.exe](https://github.com/olcanaskar/my-library/releases/download/v0.1.0/MyLibrary-0.1.0-portable.exe) | Kurulum gerekmez; imzasız |
| macOS 13+ | [MyLibrary-0.1.0-mac-universal.dmg](https://github.com/olcanaskar/my-library/releases/download/v0.1.0/MyLibrary-0.1.0-mac-universal.dmg) | Intel + Apple Silicon; notarize edilmemiş |
| Android 7+ | [MyLibrary-0.1.0-debug.apk](https://github.com/olcanaskar/my-library/releases/download/v0.1.0/MyLibrary-0.1.0-debug.apk) | Play Store dışı; yerel kurulum |
| Web | [Tarayıcıda aç](https://my-library-pi-one.vercel.app) | Kurulum gerekmez |

Tüm sürümler, checksum'lar ve sürüm notları:
[Releases](https://github.com/olcanaskar/my-library/releases).

## Kurulum

### Windows

1. `.exe` dosyasını indir ve çalıştır.
2. SmartScreen uyarırsa **More info → Run anyway** seç.
3. Uygulama kurulum gerektirmez; istediğin yere taşıyabilirsin.

### macOS

1. `.dmg` dosyasını aç.
2. **My Library**'yi Applications klasörüne sürükle.
3. İlk açılışta uygulamaya sağ tıkla → **Open**.

macOS sürümü ad-hoc imzalıdır ama Apple tarafından notarize edilmemiştir.
Gatekeeper yine de engellerse Terminal'de şunu çalıştır:

```bash
xattr -cr "/Applications/My Library.app"
```

### Android

1. `.apk` dosyasını indir.
2. Telefonda bilinmeyen kaynaklardan kuruluma izin ver.
3. APK'yı açıp kur.

APK debug imzalıdır; Play Store dışında, yerel kurulum için hazırlanmıştır.
“App not installed” hatası alırsan eski sürümü kaldırıp tekrar kur.

### Web

[my-library-pi-one.vercel.app](https://my-library-pi-one.vercel.app) adresini aç.
Kurulum veya hesap gerekmez.

## Kullanım

- **Yeni defter:** Sağ üstteki **+** düğmesi veya raftaki **+ New book**.
- **Not yaz:** Bir kitaba tıkla/dokun; kapak açılır. Alt oklarla sayfalar arasında gez.
- **Otomatik kayıt:** Yazarken kaydedilir; ayrıca kaydetmen gerekmez.
- **Ara:** Büyüteç simgesi; defter adı, not başlığı ve içerikte arar.
- **Tema:** Güneş/ay simgesiyle aydınlık ve karanlık tema arasında geçiş yap.
- **Kağıt:** Çizgili, kareli, noktalı veya düz sayfa seç.
- **Kitap sırtı:** Sayfa sayısı arttıkça kitap kalınlaşır.

## Verileriniz

- Hesap, abonelik veya sunucu yok.
- Notlar cihazın yerel deposunda tutulur; masaüstü ve Android sürümleri
  çevrimdışı çalışır.
- Tarayıcı, Windows/macOS ve Android kütüphaneleri ayrıdır. Notlar aralarında
  otomatik olarak senkronize olmaz.
- Tarayıcı verilerini veya uygulama verilerini temizlemek notları siler. Şu an
  otomatik bulut yedeği yoktur.

## Sorun giderme

- **Windows uyarısı:** SmartScreen → **More info → Run anyway**.
- **macOS “uygulama hasarlı” diyor:** Sağ tık → **Open**; gerekirse yukarıdaki
  `xattr` komutunu çalıştır.
- **Android kurulmuyor:** Eski APK'yı kaldır; farklı imzayla kurulmuş bir sürüm
  olabilir.
- **Notlar kayboldu:** Tarayıcı/uygulama verileri temizlenmiş olabilir; My Library
  notları yerel olarak tutar.

## Geliştirme

Kaynaktan çalıştırma, derleme komutları, mimari ve klasör yapısı:
[DEVELOPMENT.md](DEVELOPMENT.md).
