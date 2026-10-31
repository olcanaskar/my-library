# My Library

Every subject a book, every note a page. A small browser app that keeps class
notes on a library shelf.

**Live:** https://my-library-pi-one.vercel.app

## Running

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static output: out/
npm run lint
npx vercel --prod # deploy (project: my-library)
```

Pushes to `master` are deployed automatically by Vercel; the command above is
only the manual fallback.

## Desktop app (Windows)

The Electron shell in `desktop/` serves the exported site from a local HTTP
server (`127.0.0.1:47823`), so the desktop app runs without the Next.js dev
server. It is a separate build and does not affect the web deployment.

```bash
npm run desktop:install # install Electron dependencies (once)
npm run desktop:build   # Next build + portable exe
# -> desktop/release/MyLibrary-0.1.0-portable.exe
npm run desktop:start   # run from source (needs out/ from npm run build)
```

The portable exe stores its library under its own app data folder; browser and
desktop `localStorage` are independent. The build is unsigned, so Windows may
show a SmartScreen warning on first launch.

## What's inside

- **Library:** subjects as book spines; the spine grows thicker with the page count
- **Page:** clicking a book lifts it off the shelf and the cover swings open;
  arrows then turn pages one by one
- **Editor:** lined / grid / dotted / plain paper, autosave
- **Search:** across titles, content and subject names
- **Dark mode**
- Data lives in `localStorage`: no account, no server, no internet needed

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, static export) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Storage | `localStorage` (single entry point: `lib/storage.ts`) |

## Architecture notes

- `output: "export"` — no server side, so the app can move to Capacitor later.
- Route: `/?kitap=<id>&not=<id>`. No dynamic segments.
- Paper rules are 32px apart; body text must use `line-height: 32px`.
  If those two drift apart, the theme breaks.
- `useHydrated()` skips the first paint so the server and the client never
  disagree about the content.

## Folders

```
app/            single page + theme tokens
components/
  library/      shelf, book spine, new book
  editor/       paper page + editor + page navigation
  search/       search
  ui/           icons, modal
lib/            types, storage, hooks, formatting
```

## Team

- **A — Front of house:** `components/library/*`, `app/page.tsx`
- **B — Content:** `components/editor/*`, `components/search/*`, `lib/*`

Roadmap and work split: [PLAN.md](./PLAN.md)
