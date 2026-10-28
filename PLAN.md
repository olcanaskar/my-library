# My Library — Project Plan

> A web app that organises class notes around a "library" metaphor: every
> subject is a notebook with its own cover colour and its own paper texture.

**Status (28 October 2026):** the MVP is complete and working. Part of V1 is done
(search, resume where you left off, dark mode, the cover-opening animation). The
interface is fully English. Next up: PWA, Capacitor.

---

## 1. One sentence

A student opens their library, picks a subject, opens the notebook and keeps
writing where they left off.

## 2. Problem and target user

| Question | Answer |
|---|---|
| Who? | High school / university students (us and our classmates) |
| Which problem? | Notes are scattered across WhatsApp, Drive, paper notebooks and phones; "what did I write in that subject" gets lost |
| Why this app? | Not a file list but a **library**: subject = book, note = page. Memorable and searchable |
| What makes it different | Every subject has its own paper (grid for maths, lined for literature) and the whole thing feels like a library |

## 3. Scope

### MVP — required to call it "done"
- [x] Library screen: subjects as books on a shelf
- [x] Add a book (name, colour, paper type)
- [x] A book opens straight into the page you left off on — no page list in between
- [x] Page editor: title + body, autosave
- [x] Delete a page / edit its title
- [x] Persistence with `localStorage` (reload → nothing lost)
- [x] Works properly on mobile and desktop

### V1 — if there is time (there probably is)
- [x] Book-opening animation (the cover fills the screen in the subject colour,
  then swings open on its left edge, ~400 ms)
- [x] Search across all notes (toolbar button)
- [x] Resume where you left off (clicking a book opens its page directly)
- [x] Page number + arrow-key / button page turning
- [x] Page-turn transition (short slide animation)
- [x] Dark mode

### V2 — try before the presentation, drop if it does not land
- [ ] Study mode (hide the note, test yourself from the titles)
- [ ] AI-generated cover art or note summaries
- [ ] Cross-device sync with Supabase
- [ ] PDF / markdown export

### Out of scope (on purpose)
Real-time collaboration, user accounts, class sharing, a store release of the
mobile app.

## 4. Information architecture and screens

```
Library ──▶ Page (subject + note) ──▶ Editor
   │              │
   │              └─ previous / next page · new page
   └─ new book · search · dark mode
```

**Library (desktop)**
```
┌──────────────────────────────────────────┐
│  My Library                       ⌕  ☾   │
│                                          │
│   ┌───┐ ┌───┐ ┌───┐ ┌───┐  ┌┄┄┄┐        │
│   │ M │ │ P │ │ L │ │ H │  │ + │        │
│   │ a │ │ h │ │ i │ │ i │  │   │        │
│   │ t │ │ y │ │ t │ │ s │  │   │        │
│   └───┘ └───┘ └───┘ └───┘  └┄┄┄┘        │
│  ═════════════════════════════════════   │
│   spine thickness = page count           │
└──────────────────────────────────────────┘
```

**Library (mobile):** the same shelf, with slightly shorter spines and horizontal
scrolling when it overflows.

**Page (opened straight from the shelf)**
```
┌──────────────────────────────────────┐
│ ←  ● Mathematics   Saved   [+]  🗑   │
│    Page 2 of 5                        │
├──────────────────────────────────────┤
│ 12 October          Derivatives       │
│ ──────────────────────────────────── │
│  │ The slope at a point is defined   │
│  │ with a limit...                   │
│  │                                   │
│  ← Previous         2 / 5     Next → │
└──────────────────────────────────────┘
```

## 5. Data model

```ts
type Paper = 'lined' | 'grid' | 'dotted' | 'plain'

type Subject = {
  id: string
  name: string
  color: string          // spine / cover colour
  paper: Paper           // notebook paper
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
  lastNoteBySubject: Record<string, string>   // resume bookmark
  theme: 'light' | 'dark'
}
```

`localStorage` key: `kutuphanem.v1` (kept as-is so existing data survives).
Reads are wrapped in `try/catch`; on a version mismatch the raw value is backed
up before starting fresh.

## 6. Technology choices

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | One repo, one deploy, file-based routing |
| Styling | Tailwind CSS | Fast, vibe-code friendly, responsive |
| Icons | Inline SVG (`components/ui/icons.tsx`) | No dependency, exactly the shapes we need |
| State | React state + `useLibrary()` hook | No backend, no complexity |
| Animation | CSS transitions and keyframes | Two-hour budget |
| Deploy | Vercel | `git push` → live link |

Rule: **no new dependencies in the first three days.** Before adding a library,
ask "would I write this in 30 lines?"

## 6.1. Web → app strategy

**Decision: web first, then Capacitor.** The same codebase can move into a store
app later.

| Path | What it gives | Effort | Store | Risk |
|---|---|---|---|---|
| PWA | Home-screen install, full screen, offline | ~1 hour | No | Low |
| **Capacitor** | Wraps the web code in a native shell, iOS + Android | 1-2 days | Yes | Low |
| Expo (React Native) | Truly native feel, single codebase | Rewrite | Yes | High |

**Seven rules for writing a "portable" web app** (applied on day 0, expensive to
retrofit):

1. `next.config.ts` → `output: 'export'` (static site, no server)
2. No API routes, **no server actions**, no middleware
3. No dynamic routes: `/?kitap=mat&not=abc` (query params) or single-page state
   instead of `/book/[id]`
4. `localStorage` is touched **only** through `lib/storage.ts` → swapping to
   Capacitor Preferences is a one-file change
5. Self-hosted fonts (`next/font/local`), no CDN → works offline
6. `100dvh`, `env(safe-area-inset-*)`, tap targets ≥ 44px, nothing hover-only
7. `next/image` optimisation disabled, all assets local

**Migration day (about a day):**
```bash
npm i @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init "My Library" app.mylibrary
npx cap add android   # and/or ios
npm run build && npx cap sync
npx cap open android
```
Replace the `localStorage` calls inside `lib/storage.ts` with
`@capacitor/preferences`; the UI does not change.

**Note:** iOS builds need a Mac; Android builds anywhere. For a school
presentation PWA + Android is enough, iOS can wait.

## 7. Design system

**Colours**
```
paper   #FAF7F0    ink      #2A2A28
rule    #DED7C6    margin   #D98C8C
muted   #7C7667    shelf    #B0824D
```
Subject palette (eight colours): #4A5C9E · #3E7C8C · #5B8C5A · #C9A227 ·
#D08C3C · #C05746 · #A8557A · #7C5C9E

**Typography**
- Book spines and page titles: **Caveat** (handwriting, titles only)
- Body: **Inter** / system-ui, 16px, 32px line height
- Rule: the handwriting font is **never** used for body text.

**Paper (one component, four variants)**
```css
.paper-lined {
  background-image: repeating-linear-gradient(
    transparent 0 31px, var(--rule) 31px 32px
  );
}
.paper-grid {
  background-image:
    repeating-linear-gradient(transparent 0 31px, var(--rule) 31px 32px),
    repeating-linear-gradient(90deg, transparent 0 31px, var(--rule) 31px 32px);
}
.paper-dotted {
  background-image: radial-gradient(var(--rule) 1.1px, transparent 1.2px);
  background-size: 32px 32px;
}
```
`line-height: 32px` is **mandatory** — if the rules stop lining up with the text,
the theme collapses.

**Motion:** 180-300 ms, `ease-out`. `prefers-reduced-motion` is respected.
**Accessibility:** contrast ≥ 4.5, everything reachable by keyboard, visible
focus ring.

## 8. Work split (2 people)

| Person | Role | Responsibility | Files |
|---|---|---|---|
| **A** | Front of house | Library, shelf, book spines, colours/covers, new-book dialog, page-turn and opening animation, dark mode, presentation material | `components/library/*`, `app/page.tsx` |
| **B** | Content + plumbing | Types, storage hook, paper theme system, editor, autosave, delete/edit, search, deploy | `lib/*`, `components/editor/*`, `components/search/*` |

Rule: **every file has exactly one owner.** If a change is needed in someone
else's file, say so first.
Shared files (`types.ts`, the `globals.css` tokens, `layout.tsx`) are written
**together** on day 0 and then left alone.

**Single-person risk:** the whole data layer sits with B. Mitigation: on day 1 A
builds the "add a new book" flow against B's `useLibrary()` API. That tests the
API early and lets A continue if B gets stuck.

**Scope rule with two people:** if a feature costs either person more than four
hours, it gets split or dropped.

## 9. Calendar (2 people, 5 days assumed)

| Day | A (front of house) | B (content) | Shared |
|---|---|---|---|
| 0 (2-3 hours) | — | — | Scaffold, types, design tokens, empty screens, static export + Vercel deploy |
| 1 | Static library view, book spines | `useLibrary` + direct page open + editor shell | Evening: adding a book works end to end |
| 2 | New-book dialog, page-turn animation | Editor + paper theme + autosave | Evening: a real note can be written |
| 3 | Dark mode, mobile shelf, empty states | Search, resume, delete/edit, page arrows | Merge to `main` at the end of the day |
| 4 | Slides, demo rehearsal | Debugging, Lighthouse, backup video | Rehearse together |
| 5 | Presentation | Presentation | — |

If time is short: days 3 and 4 merge; **search** stays, animation and dark mode
drop.
With three days: cut to the MVP (library + writing + saving), drop the animation
entirely.

## 10. Git discipline

- `main` always runs and can always be deployed.
- Branches: `feature/library`, `feature/notebook`, `feature/data`.
- **Merge into `main` at least once a day.** No merges on the last day.
- Commit messages: `feat: tie spine thickness to page count`
- `node_modules`, `.next`, `.env` are never committed.

## 11. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Paper rules do not line up with the text | One paper implementation, `line-height` in one place; no paper CSS anywhere else |
| Animation swallows the schedule | Two-hour total budget; if exceeded, ship a static transition |
| Merge conflicts | File ownership + daily merges |
| Corrupt `localStorage` / quota | `try/catch`, version check, backup key, fresh start |
| The mobile keyboard scrolls the page | Autosizing `textarea`, no fixed bottom bars |
| Internet/DNS on demo day | 60-second backup screen recording + `npm run dev` locally |
| "It's all done but looks empty" | Fill it with real class notes on day 2, no exceptions |

## 12. Demo script (90 seconds)

1. The library opens — four books, different colours. "Every subject is a book." (10s)
2. Click "Mathematics" — it opens directly at the page you left off on. (10s)
3. Type two lines; the status dot goes Saving → Saved. (20s)
4. Press "+ New page", write a line, then go back — **the book's spine has
   grown thicker.** (15s)
5. Search: type "derivative", the note opens straight away. (15s)
6. Show dark mode and the mobile shelf. (10s)
7. Closing: "Notes don't get lost, because they have a place." (5s)

## 13. Definition of Done

- [ ] No note is lost when the page is reloaded
- [ ] Writing on a phone is comfortable (the page does not jump while the keyboard is open)
- [ ] Zero-book and zero-page states look right (empty states)
- [ ] Deleting asks for confirmation
- [ ] Every flow can be completed with a keyboard
- [ ] Lighthouse accessibility ≥ 90
- [ ] Live link + backup demo video are ready

## 14. Folder structure (current)

```
kutuphanem/
  app/
    layout.tsx
    page.tsx                     # single page: library / page (query params)
    globals.css                  # theme tokens + paper styles
  components/
    library/LibraryView.tsx
    library/BookSpine.tsx
    library/BookOpening.tsx
    library/NewBookDialog.tsx
    editor/NoteEditor.tsx
    search/SearchDialog.tsx
    ui/Modal.tsx
    ui/icons.tsx
  lib/
    types.ts
    storage.ts                   # localStorage ↔ Capacitor Preferences single point
    useLibrary.ts
    useHydrated.ts
    format.ts
    id.ts
  public/
```

Route rule: `/?kitap=mat&not=abc123`. No dynamic segments → static export and
Capacitor both work.

## 15. Open questions

1. **Deadline?** The calendar assumes five days; if it is shorter, days 3-4 merge
   and V1 gets trimmed.
2. **Names?** Who are A and B? (for file and commit ownership)
3. **Where will the presentation happen?** A web link + an Android APK is enough;
   iOS needs a Mac.
4. **Is Supabase needed?** Not for now; notes stay on the device. Add it later if
   two people write at the same time.
