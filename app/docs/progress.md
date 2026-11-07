# Progress log — Madrasa Management System (frontend prototype)

Read this at the start of every session. Update it after every phase.

## Where things are

- Code: `E:\HQSM\app\` inside repo https://github.com/khairul-personal/HQSM (public). The school website stays at the repo root.
- Rules: `app/CLAUDE.md`. Requirements: `app/docs/PRD_v3.md`. Visual bar: `app/docs/design-prompt.md`.
  Original task prompt (written for an existing prototype): `app/docs/task-prompt.md`.

## Phase 0 findings (2026-11-08)

- **No prototype exists.** The task prompt assumes B1–B11 are already built. I searched the local drives,
  every khairul-personal repo and claude.ai artifacts and found nothing (khairul-creates/HQSM can't be reached).
  Decision (user, 2026-11-08): build from scratch in `app/`.
- So the Phase 0 step 3 checks (hash routing, pledge test, B11 completion %, Admission Officer role, approvals)
  are not "fixes". They are built in as requirements in the phases below.
- Toolchain: Node 24.18, npm 11.16. **pnpm is not installed** → install via `npm i -g pnpm` (needs OK).
- Checks baseline: none yet (no code).

## UPDATE 2026-11-08: real prototype imported from Figma Make
- Source: https://www.figma.com/make/Iqa09JI9aDZ74dQFuQPf8J/Review-Attached-Content, exported with "Download code"
  and copied into `app/`. Figma Make's own notes are in `app/AGENTS.md`. Stack: React 19, Vite 8, TS 5.9,
  Tailwind 4, react-router 7, Vitest 5, oxfmt. Run pnpm via `npx -y pnpm@10 <cmd>` (no global pnpm installed).
- Baseline checks (2026-11-08): format OK · tsc OK · test 9 files / 54 tests pass · build OK (591 kB chunk warning, known).
- **Next: Phase 0 on the real code** (audit screens vs design-prompt Part B, verify the 5 earlier fixes in
  `docs/task-prompt.md` Phase 0 step 3, rewrite this file), then stop for user approval.
- The from-scratch plan below is obsolete; keep it only for reference.

## Old from-scratch plan (obsolete)

Vite + React 18 + TypeScript (strict) · Vitest + Testing Library (+ vitest-axe) · Prettier · lucide-react icons ·
hash routing (one router, `#/…`) · CSS variables for tokens (light + dark) · mock data in browser localStorage
with a seed · fonts from Google Fonts (Hind Siliguri, Inter, Noto Naskh Arabic, Amiri Quran).
Core pure modules with tests first: `money` (integer paisa, ৳ + South Asian grouping), `digits` (BN/Latin),
`permissions` (single resolver: visible / masked / hidden per field, tab, action, route), `attendance`,
`hifz`, `funds`, `results`, `subscription`, `idempotency`.

## Phase plan (each ends with format + tsc + test + build passing, a commit, and an update here)

| Phase | Scope                                                                                                                                                                             | Screens                  |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| F1    | Scaffold, tokens, B1 design system page, app shell (sidebar/top bar/bottom nav), hash router, permission resolver + prototype role switcher, money/digit utils, Bengali seed data | B1                       |
| F2    | Login (OTP / password+2FA), institution picker; principal dashboard                                                                                                               | B2 S01, B3 S03           |
| F3    | Teacher Today + attendance register; Hifz lesson entry + progress                                                                                                                 | B4 S04 S12, B5 S14 S15   |
| F4    | Student list + full profile (incl. masked girls'-branch view); staff list + profile                                                                                               | B6 S07 S08, B7 S11       |
| F5    | Admission pipeline (enquiry kanban, review, auto invoice); fee desk + receipt                                                                                                     | B8 S05 S06, B9 S20       |
| F6    | Sponsorship + fund allocation (pledge test); homework (offline audio, tested completion %)                                                                                        | B10 S21 S22, B11 S16 S27 |
| 1     | Exams, marks entry, result publishing                                                                                                                                             | B12 S17 S18              |
| 2     | Guardian portal home                                                                                                                                                              | B13 S26                  |
| 3     | System states pack + subscription modes                                                                                                                                           | B16                      |
| 4     | Question bank + paper builder                                                                                                                                                     | B14 S33                  |
| 5     | Settings + permissions                                                                                                                                                            | B15 S30                  |
| 6     | E2E journeys, PRD T01–T30 mapping, a11y, responsive, code splitting, `docs/handoff.md`                                                                                            | —                        |

This is about 12 phases, so expect several chat sessions. Each session finishes its phase and records the exact stop point here.

## Screens S01–S38 status

Done: none. Planned in the phases above: S01, S03–S08, S11, S12, S14–S18, S20–S22, S26, S27, S30, S33.
Not planned (later): S02, S09, S10, S13, S19, S23–S25, S28, S29, S31, S32, S34–S38.

## Open questions (waiting for user)

1. Install pnpm globally (`npm i -g pnpm`)? Alternative: use npm and change the four commands.
2. Publish the built prototype on GitHub Pages at `/HQSM/app/`? (Mock data only.)
3. Commit and push to GitHub after each phase, as the kit says?

## Test count

0
