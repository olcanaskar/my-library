# Kütüphanem

Her ders bir kitap, her not bir sayfa. Ders notlarını kitaplık düzeninde tutan,
tarayıcıda çalışan mini uygulama.

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # statik çıktı: out/
npm run lint
```

## Neler var

- **Kitaplık:** dersler kitap sırtı olarak; sırt kalınlığı sayfa sayısıyla büyür
- **Defter:** not listesi, sayfa numaraları ve "kaldığın yer" ayracı
- **Editör:** çizgili / kareli / noktalı / düz kağıt, otomatik kaydetme
- **Arama:** tüm notlarda başlık, içerik ve ders adına göre
- **Karanlık mod**
- Veriler `localStorage`'da: hesap yok, sunucu yok, internet gerekmez

## Teknoloji

| Katman | Seçim |
|---|---|
| Framework | Next.js 16 (App Router, statik export) |
| Dil | TypeScript |
| Stil | Tailwind CSS 4 |
| Depolama | `localStorage` (tek noktadan: `lib/storage.ts`) |

## Mimari notları

- `output: "export"` — sunucu tarafı yok, ileride Capacitor ile app'e taşınabilir.
- Rota: `/?kitap=<id>&not=<id>`. Dinamik segment yok.
- Kağıt çizgileri 32px aralıkta; metin `line-height: 32px` olmak zorunda.
  Bu ikisi ayrılırsa tema bozulur.
- Sunucu ve istemci farklı içerik üretmesin diye `useHydrated()` ile ilk boyama
  atlanır.

## Klasörler

```
app/            tek sayfa + tema tokenları
components/
  library/      kitaplık, kitap sırtı, yeni kitap
  book/         defter görünümü
  editor/       kağıt sayfa + editör
  search/       arama
  ui/           ikonlar, modal
lib/            tipler, depolama, hook'lar, formatlama
```

## Ekip

- **A — Vitrin:** `components/library/*`, `app/page.tsx`
- **B — İçerik:** `components/book/*`, `components/editor/*`, `lib/*`

Yol haritası ve iş bölümü: [PLAN.md](./PLAN.md)
