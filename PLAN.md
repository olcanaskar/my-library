# Kütüphanem — Proje Planı

> Ders notlarını "kitaplık" metaforuyla düzenleyen; her dersin kendi kapak rengi ve
> kendi kağıt dokusuna sahip bir defter olduğu web uygulaması.

**Durum (28 Ekim 2026):** MVP tamam ve çalışıyor. V1'in bir kısmı bitti
(arama, ayraç, karanlık mod). Sırada: kitap açma animasyonu, PWA, Capacitor.

---

## 1. Tek cümle

Öğrenci kütüphanesini açar, dersini seçer, defterini açar ve kaldığı yerden yazmaya devam eder.

## 2. Problem ve hedef kullanıcı

| Soru | Cevap |
|---|---|
| Kim? | Lise/üniversite öğrencisi (biz ve sınıf arkadaşlarımız) |
| Hangi sorun? | Notlar WhatsApp, Drive, defter, telefon arasında dağılıyor; "hangi derste ne yazmıştım" kayboluyor |
| Neden bu uygulama? | Dosya listesi değil, **kitaplık**: ders = kitap, not = sayfa. Akılda kalıcı ve aranabilir |
| Farkı | Her dersin kendi kağıdı (kareli matematik, çizgili edebiyat) ve kütüphane hissi |

## 3. Kapsam

### MVP — "bitti" sayılması için şart
- [x] Kitaplık ekranı: dersler raflarda kitap olarak
- [x] Yeni kitap ekle (ad, renk, kağıt türü)
- [x] Kitap içi: o dersin notları listesi
- [x] Not editörü: başlık + gövde, otomatik kaydet
- [x] Not sil / başlığı düzenle
- [x] `localStorage` ile kalıcılık (yenile → kaybolmasın)
- [x] Mobil + masaüstü düzgün çalışsın

### V1 — zaman kalırsa (muhtemelen kalır)
- [ ] Kitap açma animasyonu (CSS 3D, 200-300 ms)
- [x] Tüm notlarda arama (ara butonu)
- [x] Kitap ayracı: "Kaldığın yer" kartı
- [x] Sayfa numarası
- [ ] Sayfa çevirme geçişi
- [x] Karanlık mod

### V2 — sunumdan önce denenir, olmazsa çıkar
- [ ] Çalışma modu (notu kapat, başlıklardan kendini test et)
- [ ] AI'dan kapak görseli veya not özeti
- [ ] Supabase ile hesaplar arası senkron
- [ ] PDF / markdown dışa aktarma

### Kapsam dışı (bilinçli olarak)
Gerçek zamanlı işbirliği, kullanıcı hesabı, sınıf paylaşımı, mobil uygulama mağaza sürümü.

## 4. Bilgi mimarisi ve ekranlar

```
Kitaplık ──▶ Kitap (ders) ──▶ Not (sayfa)
   │              │                │
   │              │                └─ editör: başlık + metin
   │              └─ not listesi + "yeni sayfa"
   └─ yeni kitap · arama · karanlık mod
```

**Kitaplık (masaüstü)**
```
┌──────────────────────────────────────────┐
│  Kütüphanem                [+ Yeni Kitap]│
│                                          │
│   ┌───┐ ┌───┐ ┌───┐ ┌───┐                │
│   │ M │ │ F │ │ B │ │ T │                │
│   │ a │ │ i │ │ i │ │ a │                │
│   │ t │ │ z │ │ y │ │ r │                │
│   └───┘ └───┘ └───┘ └───┘                │
│  ═════════════════════════════════════   │
│   kitap sırtı kalınlığı = not sayısı     │
└──────────────────────────────────────────┘
```

**Kitaplık (mobil):** raf yerine 2 sütunlu kapak ızgarası.

**Not sayfası**
```
┌──────────────────────────────────────┐
│ 12 Ekim        Türev                 │
│ ──────────────────────────────────── │
│  │ Fonksiyonun bir noktadaki eğimi   │
│  │ limit ile tanımlanır...           │
│  │                                   │
│                              [ 3 ]   │
└──────────────────────────────────────┘
```

## 5. Veri modeli

```ts
type Paper = 'lined' | 'grid' | 'dotted' | 'plain'

type Subject = {
  id: string
  name: string
  color: string          // sırt/kapak rengi
  paper: Paper           // defter kağıdı
  createdAt: number
  order: number
}

type Note = {
  id: string
  subjectId: string
  title: string
  body: string
  createdAt: number
  updatedAt: number
}

type Store = {
  version: 1
  subjects: Subject[]
  notes: Note[]
  lastNoteBySubject: Record<string, string>   // kitap ayracı
  theme: 'light' | 'dark'
}
```

`localStorage` anahtarı: `kutuphanem.v1`
Bozuk veri ihtimaline karşı okuma `try/catch` ile, sürüm uyuşmazsa yedekleyip sıfırla.

## 6. Teknoloji seçimi

| Katman | Seçim | Gerekçe |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | Tek repo, tek deploy, dosya tabanlı routing |
| Stil | Tailwind CSS | Hızlı, vibe-code dostu, responsive |
| İkon | lucide-react | Hafif, tutarlı |
| Durum | React state + `useLocalStorage` hook'u | Backend yok, karmaşıklık yok |
| Animasyon | CSS transition (gerekirse framer-motion) | 2 saatlik bütçe |
| Deploy | Vercel | `git push` → canlı link |

Kural: **ilk 3 gün bağımlılık eklemek yasak.** Bir kütüphane eklemeden önce "bunu 30 satırla yazar mıyım?" sorusu sorulur.

## 6.1. Web → App geçiş stratejisi

**Karar: web-first, sonra Capacitor.** Aynı kod tabanı, mağaza uygulamasına taşınabilir.

| Yol | Ne verir | Emek | Mağaza | Risk |
|---|---|---|---|---|
| PWA | Ana ekrana eklenir, tam ekran, offline | ~1 saat | Yok | Düşük |
| **Capacitor** | Web kodunu native kabuğa sarar, iOS + Android | 1-2 gün | Var | Düşük |
| Expo (React Native) | Gerçek native his, tek kod tabanı | Baştan yazım | Var | Yüksek |

**Web'i "taşınabilir" yazmak için 7 kural** (Gün 0'da uygulanır, sonradan düzeltmesi pahalı):

1. `next.config.ts` → `output: 'export'` (statik site, sunucu yok)
2. API route, **server action**, middleware **yok**
3. Dinamik rota **yok**: `/kitap/[id]` yerine `/?kitap=mat&not=abc` (query param) veya tek sayfa state
4. `localStorage`'a **sadece** `lib/storage.ts` içinden erişilir → app'te Capacitor Preferences'a tek dosyada geçilir
5. Fontlar self-host (`next/font/local`), CDN yok → offline çalışsın
6. `100dvh`, `env(safe-area-inset-*)`, dokunma hedefi ≥ 44px, hover'a bağlı işlev yok
7. `next/image` optimizasyonu kapalı, tüm görseller yerel

**Taşıma günü (yaklaşık 1 gün):**
```bash
npm i @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init "Kütüphanem" app.kutuphanem
npx cap add android   # ve/veya ios
npm run build && npx cap sync
npx cap open android
```
`lib/storage.ts` içindeki `localStorage` çağrıları `@capacitor/preferences` ile değiştirilir; UI'a dokunulmaz.

**Not:** iOS derlemesi için Mac gerekir; Android her yerde derlenir. Okul sunumu için
PWA + Android yeterli, iOS sonraya bırakılabilir.

## 7. Tasarım sistemi

**Renkler**
```
paper   #FAF7F0    ink      #2A2A28
rule    #DCD5C4    margin   #D98C8C
muted   #8A8577    shelf    #8B6B4A
```
Ders renkleri (8'li palet): #C05746 · #D08C3C · #C9A227 · #5B8C5A · #3E7C8C · #4A5C9E · #7C5C9E · #A8557A

**Tipografi**
- Kitap sırtı ve not başlığı: **Caveat** (el yazısı, sadece başlık)
- Gövde: **Inter** / system-ui, 16px, satır aralığı 32px
- Kural: el yazısı fontu **asla** gövde metninde kullanılmaz.

**Kağıt (tek bileşen, dört varyant)**
```css
.paper-lined {
  background-image: repeating-linear-gradient(
    transparent 0 31px, var(--rule) 31px 32px
  );
  background-position-y: 8px;
}
.paper-grid {
  background-image:
    repeating-linear-gradient(transparent 0 31px, var(--rule) 31px 32px),
    repeating-linear-gradient(90deg, transparent 0 31px, var(--rule) 31px 32px);
}
.paper-dotted {
  background-image: radial-gradient(var(--rule) 1px, transparent 1px);
  background-size: 32px 32px;
}
```
`line-height: 32px` **zorunlu** — çizgiler yazıyla hizalanmazsa tema çöker.

**Motion:** 180-300 ms, `ease-out`. `prefers-reduced-motion` desteklenir.
**Erişilebilirlik:** kontrast ≥ 4.5, tüm etkileşimler klavyeyle, görünür focus halkası.

## 8. İş bölümü (2 kişi)

| Kişi | Rol | Sorumluluk | Dosyalar |
|---|---|---|---|
| **A** | Vitrin | Kitaplık, raf, kitap sırtları, renk/kapak, yeni kitap modalı, açma animasyonu, karanlık mod, sunum materyali | `components/library/*`, `app/page.tsx` |
| **B** | İçerik + altyapı | Tipler, storage hook'u, kitap sayfası, not listesi, editör, kağıt tema sistemi, otomatik kaydet, sil/düzenle, arama, deploy | `lib/*`, `components/book/*`, `components/editor/*`, `components/search/*` |

Kural: **her dosyanın tek sahibi var.** Başkasının dosyasında değişiklik gerekiyorsa önce söylenir.
Ortak dosyalar (`types.ts`, `globals.css` tokenları, `layout.tsx`) ilk gün **birlikte** yazılır, sonra dokunulmaz.

**Tek kişiye bağımlılık riski:** Tüm veri katmanı B'de. Önlem: A, 1. gün B'nin `useStore()` API'sini
kullanarak "yeni kitap ekle" akışını yazar. Böylece API erken test edilir, B tıkandığında A devam edebilir.

**2 kişide kapsam kuralı:** Bir özellik, iki kişiden birinin 4 saatten fazlasını alıyorsa ya bölünür ya düşer.

## 9. Takvim (2 kişi, 5 gün varsayımı)

| Gün | A (Vitrin) | B (İçerik) | Ortak |
|---|---|---|---|
| 0 (2-3 saat) | — | — | İskelet, tipler, tasarım tokenları, boş ekranlar, statik export + Vercel deploy |
| 1 | Kitaplık statik görünüm, kitap sırtları | `useStore` + kitap sayfası + not listesi | Akşam: yeni kitap ekleme uçtan uca çalışsın |
| 2 | Yeni kitap modalı, açma animasyonu | Editör + kağıt teması + otomatik kaydet | Akşam: gerçek not yazılabilsin |
| 3 | Karanlık mod, mobil raf düzeni, boş durumlar | Arama, ayraç, sil/düzenle | Gün sonu `main`'e merge |
| 4 | Sunum slaytları, demo provası | Hata ayıklama, Lighthouse, yedek video | Birlikte prova |
| 5 | Sunum | Sunum | — |

Süre kısaysa: Gün 3 ve 4 birleşir; V1 listesinden **arama** kalır, animasyon ve karanlık mod düşer.
Süre 3 gün ise: MVP'ye inilir (kitaplık + not yazma + kayıt), animasyon tamamen çıkar.

## 10. Git disiplini

- `main` her zaman çalışır ve deploy edilebilir.
- Dallar: `feature/kitaplik`, `feature/defter`, `feature/veri`.
- **Her gün en az bir kez `main`'e merge.** Son gün merge yok.
- Commit: `feat: kitap sırtı kalınlığı not sayısına bağlandı`
- `node_modules`, `.next`, `.env` commit edilmez.

## 11. Riskler ve önlemler

| Risk | Önlem |
|---|---|
| Kağıt çizgileri yazıyla hizalanmıyor | Tek `PaperPage` bileşeni, `line-height` tek yerden; başka yerde kağıt CSS'i yok |
| Animasyon işi yutuyor | Toplam bütçe 2 saat; süre aşarsa sabit geçiş |
| Merge çakışması | Dosya sahipliği + günlük merge |
| `localStorage` bozulması / kota | `try/catch`, sürüm kontrolü, kullanıcıya "veri sıfırlandı" uyarısı |
| Mobil klavye sayfayı kaydırıyor | `textarea` autosize, `position: fixed` alt barlar yok |
| Demo günü internet/DNS | 60 saniyelik yedek ekran kaydı + `npm run dev` ile yerel demo |
| "Hepsi bitti ama boş görünüyor" | Gün 2'de gerçek ders notlarıyla doldurma zorunlu |

## 12. Demo senaryosu (90 saniye)

1. Kütüphane açılır — dört kitap, renkleri farklı. "Her ders bir kitap." (10 sn)
2. "Matematik"e tıklanır — kitap açılır, kaldığı sayfa gelir. (10 sn)
3. İki satır not yazılır, sayfa numarası artar. (20 sn)
4. Kütüphaneye dönülür — **kitabın sırtı kalınlaşmıştır.** (10 sn)
5. Arama: "türev" yazılır, not bulunur. (15 sn)
6. Karanlık mod + mobil görünüm gösterilir. (10 sn)
7. Kapanış: "Notlar kaybolmuyor, çünkü yeri belli." (5 sn)

## 13. Bitti tanımı (Definition of Done)

- [ ] Sayfa yenilendiğinde hiçbir not kaybolmuyor
- [ ] Telefonda yazı yazmak rahat (klavye açıkken sayfa kaymıyor)
- [ ] Kütüphanede 0 kitap ve 0 not durumları düzgün görünüyor (empty state)
- [ ] Silme işlemi onay istiyor
- [ ] Klavye ile tüm akış tamamlanabiliyor
- [ ] Lighthouse erişilebilirlik ≥ 90
- [ ] Canlı link + yedek demo videosu hazır

## 14. Klasör yapısı (hedef)

```
kutuphanem/
  app/
    layout.tsx
    page.tsx                     # tek sayfa: kitaplık / kitap / not (query param ile)
    globals.css                  # tema tokenları + kağıt stilleri
  components/
    library/Shelf.tsx
    library/BookSpine.tsx
    library/NewBookDialog.tsx
    book/NoteList.tsx
    editor/PaperPage.tsx
    editor/NoteEditor.tsx
    search/SearchDialog.tsx
    ui/                          # buton, modal, input
  lib/
    types.ts
    storage.ts                   # localStorage ↔ Capacitor Preferences tek nokta
    useStore.ts
    id.ts
  public/                        # fontlar, kağıt dokuları
```

Rota kuralı: `/?kitap=matematik&not=abc123`. Dinamik segment yok → statik export ve
Capacitor sorunsuz çalışır.

## 15. Açık sorular

1. **Teslim tarihi?** Takvim 5 güne göre kurgulandı; kısaysa Gün 3-4 birleşir, V1 kırpılır.
2. **İsimler?** A / B kimler? (dosya sahipliği ve commit sahipliği için)
3. **Sunum nerede gösterilecek?** Web linki + Android APK yeterli; iOS Mac gerektirir.
4. **Supabase gerekli mi?** Şimdilik hayır; notlar cihazda kalır. İki kişi aynı anda yazacaksa sonra eklenir.
