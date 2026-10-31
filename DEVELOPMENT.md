# Development

Technical notes for running, building and extending My Library.

**Live:** https://my-library-pi-one.vercel.app

## Requirements

- Node.js 22+ and npm.
- Android builds: JDK 21, Android SDK platform 36 and build-tools 36.
- macOS `dmg`/`zip` builds must run on macOS, or use the GitHub Actions
  workflow.

## Web app

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static output: out/
npm run lint
npx vercel --prod # deploy (project: my-library)
```

Pushes to `master` are deployed automatically by Vercel; the command above is
only the manual fallback.

## Desktop app (Windows / macOS)

The Electron shell in `desktop/` serves the exported site from a local HTTP
server (`127.0.0.1:47823`), so the desktop app runs without the Next.js dev
server. It is a separate build and does not affect the web deployment.

```bash
npm run desktop:install   # install Electron dependencies (once)
npm run desktop:build     # Next build + Windows portable exe
# -> desktop/release/MyLibrary-0.1.0-portable.exe
npm run desktop:build:mac # macOS universal dmg + zip (run on macOS)
npm run desktop:start     # run from source (needs out/ from npm run build)
```

Linux and Windows can build the Windows target; macOS `dmg`/`zip` targets must
be built on macOS. The CI workflow builds the macOS app as an unpacked universal
bundle, ad-hoc signs it (`codesign --force --deep --sign -`) and then packages
the DMG/ZIP. Local macOS builds are not signed.

The desktop app stores its library under its own app data folder; browser and
desktop `localStorage` are independent.

## Android app

The Capacitor shell in `mobile/` bundles the same static export into a local
WebView. It does not need the dev server or an internet connection.

```bash
npm run build
npm run mobile:install
npm run mobile:build:apk
# -> mobile/release/MyLibrary-0.1.0-debug.apk
adb install -r mobile/release/MyLibrary-0.1.0-debug.apk
```

`mobile/build-apk.mjs` runs `cap sync android`, then the Gradle debug build, and
copies the APK into `mobile/release/`. The Android app has its own
`localStorage`, separate from the browser and desktop libraries.

Bump `versionCode` in `mobile/android/app/build.gradle` for every installable
Android update; Android will only install a higher version code over an existing
app.

## Native CI builds

The `Native builds` GitHub Actions workflow can build either target or both:

```bash
gh workflow run builds.yml -f target=macos
gh workflow run builds.yml -f target=android
gh workflow run builds.yml                  # both
gh run list --workflow=builds.yml
gh run download <run-id> -D desktop/release/ci
```

The macOS job produces `MyLibrary-0.1.0-mac-universal.dmg` and `.zip`; the
Android job produces `mobile/release/MyLibrary-0.1.0-debug.apk`.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, static export) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Storage | `localStorage` (single entry point: `lib/storage.ts`) |
| Desktop | Electron + electron-builder |
| Android | Capacitor |

## Architecture notes

- `output: "export"` - no server side; the same output is bundled by Electron
  and Capacitor.
- Route: `/?kitap=<id>&not=<id>`. No dynamic segments.
- Paper rules are 32px apart; body text must use `line-height: 32px`.
  If those two drift apart, the theme breaks.
- `useHydrated()` skips the first paint so the server and the client never
  disagree about the content.
- The Android `MainActivity` is intentionally left empty; the bottom system
  navigation inset is handled in CSS with `env(safe-area-inset-bottom)`.
  Do not add a native inset listener that replaces the WebView's own handling,
  or the top status-bar inset breaks.

## Folders

```
app/            single page + theme tokens
components/
  library/      shelf, book spine, new book
  editor/       paper page + editor + page navigation
  search/       search
  ui/           icons, modal
desktop/        Electron shell + electron-builder config
mobile/         Capacitor Android shell
docs/           README screenshots
lib/            types, storage, hooks, formatting
```

## Signing and distribution

- Windows: unsigned portable exe; SmartScreen may warn.
- macOS: ad-hoc signed in CI, not notarized; Gatekeeper may warn.
- Android: debug-signed APK for sideloading, not for Google Play.
- Store distribution needs the relevant signing/notarization accounts and a
  release keystore/AAB.
- Release downloads are published on GitHub Releases:
  https://github.com/olcanaskar/my-library/releases

## Team

- **A — Front of house:** `components/library/*`, `app/page.tsx`
- **B — Content:** `components/editor/*`, `components/search/*`, `lib/*`

Roadmap and work split: [PLAN.md](./PLAN.md)
