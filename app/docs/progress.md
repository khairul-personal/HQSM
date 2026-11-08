# Progress log — Madrasa Management System (frontend prototype)

Read this at the start of every session. Update it after every phase.

## Where things are

- Code: `E:\HQSM\app\` inside repo https://github.com/khairul-personal/HQSM (public). The school website stays at the repo root.
- Rules: `app/CLAUDE.md`. Requirements: `app/docs/PRD_v3.md`. Visual bar: `app/docs/design-prompt.md`.
  Task prompt (phases 0–6): `app/docs/task-prompt.md`.
- Prototype came from Figma Make (https://www.figma.com/make/Iqa09JI9aDZ74dQFuQPf8J/Review-Attached-Content),
  "Download code". Stack: React 19, Vite 8, TS 5.9, Tailwind 4, react-router 7 (`createHashRouter`), Vitest 5, oxfmt.
- pnpm is not installed globally: run every command as `npx -y pnpm@10 <cmd>` from `app/`.

## Current status (2026-11-08)

- Phase 0 approved. User decisions: build B2–B5 **before** B12; **do not push** until the whole project is finished
  (local commits only); a live preview is wanted (`.claude/launch.json` → `madrasa-app`, http://localhost:8443).
- **Design overhaul DONE (2026-11-08).** Look: deep green frame (user choice). Rules: `docs/design-rollout.md`;
  single token source: `src/theme.css`. Every screen stylesheet rewritten onto tokens (no raw hex except `#fff`
  on green; Bengali text ≥ 15px; shared `.ds-button`/`.ds-badge`; 44px touch targets on phones). CSS 21.3k → 17.3k
  lines. Checked in the preview at 1440px and 360px (no page-level sideways scroll on any section).
  Small open design items: student-profile attendance heatmap shows day status by colour only on phones; Arabic
  inside Bengali homework titles has no Arabic font; approval cards have no "who requested" line (no data);
  guardian logout is icon-only. `hifz.css` is unused, kept for B5.
- Phase 0b **DONE** (all 4 fixes).
- Phase 0c (B1 route + B2 login, B3 dashboard, B4 teacher Today/attendance, B5 Hifz), in 4 commits:
  - 0c-1 **DONE**: `#/login` (B2, `Login.tsx` + `auth-domain.ts`, 11 tests): phone OTP, password, 2FA required for
    privileged roles, 5 wrong tries → 15 min lock, 60 s resend, institution picker, lands on
    `homeSectionForRole` (resolver). `#/` now redirects to `#/login`. `#/design-system` (B1) standalone, staff only
    (`resolveWorkspacePermission`). Sidebar has a "Prototype" group + sign-out. Demo accounts in the labelled
    Prototype panel on the login page. Shared display helpers for new screens: `src/bn-format.ts`.
  - 0c-2 **DONE**: `#/dashboard` (B3, `Dashboard.tsx` + `dashboard-domain.ts` + demo `dashboard-data.ts`, 14 tests).
    Greeting, Gregorian + Hijri date, branch/session filter (girls' branch absent without access). 9 cards per PRD
    ch.3, each with "সর্বশেষ হালনাগাদ" and a detail list; Prototype switch for loading / no data / data unavailable;
    no-permission state for other roles. Cards per role from `resolveDashboardPermission` (Admin/মুহতামিম all;
    Academic Admin no money cards; Finance Lead no academic cards). Admin and মুহতামিম now land on the dashboard;
    sidebar "ওভারভিউ" opens it. Fixed demo "today" = 2026-11-08 09:40, cutoff 09:00. Checked at 1440px and 360px.
  - 0c-3 **DONE**: `#/attendance` (S04 Today) + `#/attendance/:registerId` (S12 register) — `TeacherToday.tsx` +
    `attendance-domain.ts` + demo `attendance-data.ts` + `attendance.css` (replaces the unused `teacher.css`), 17 tests.
    Access from the settings matrix (`resolveAttendancePermission`: attendance view/create) — teacher sees own
    class/halaqa only, admin all; girls' registers absent without girls' access; photo only if resolver + branch
    photo policy allow. Cutoff per shift comes from Settings (`attendanceCutoff`), countdown open/due-soon/overdue.
    One-tap উপস্থিত/দেরি/অনুপস্থিত/ছুটি, "সবাই উপস্থিত" (only fills unmarked; approved leave → ছুটি), unmarked rows
    highlighted + filter, keyboard 1–4 and ↑↓, summary sheet before submit (unmarked must be confirmed, stays
    unmarked, no message). Submit idempotent; one guardian message per finalized absent. After submit: correction
    needs a reason → new version + history, correction message only if Absent involved; locked at ২০:০০.
    Offline: marks saved as a draft in localStorage, submit queued ("এখনো পাঠানো হয়নি"), survives reload, syncs once
    on reconnect; a register finalized by another submission → conflict, never overwritten. Class teacher now lands
    on `#/attendance`. Prototype bar: clock ০৭:৫৫/০৮:৪০, loading/empty/error, offline, demo reset.
    Checked in the preview at desktop and 360px (no sideways scroll, 44px buttons).
    Open: Branch Admin finalize of an overdue register and approval of after-lock corrections are not built
    (domain returns "locked"); real Hifz-session teacher assignment comes from staff data later.
  - **Next:** 0c-4 B5 Hifz entry + progress.

### Baseline checks (2026-11-08)

format OK (oxfmt, no config file — harmless warning) · tsc OK · test **9 files / 54 tests pass** · build OK
(one 591 kB chunk warning — known, fix in Phase 6).

### Code map

- `src/App.tsx` (1430 lines): app shell, student list (B6a), router. All routes in `src/app-routes.ts`.
- One screen per file: `StudentProfile`, `StaffDirectory`, `StaffProfile`, `AdmissionPipeline`, `FeeCollection`,
  `SponsorshipFunds`, `Homework`, `GuardianHome`, `ExamPaperBuilder`, `InstitutionSettings`, `SystemStates`.
- Domain logic + tests: `finance-domain`, `sponsorship-domain`, `homework-domain`, `guardian-portal-domain`,
  `exam-paper-domain`, `settings-domain`, `subscription-domain`, `student-permissions` (the shared resolver).
- **Orphans (not routed):** `modules.tsx` (module hub), `hifz.css` (kept for B5).

## Phase 0 audit — screens

| Brief                         | Route                         | State                                                                                  |
| ----------------------------- | ----------------------------- | -------------------------------------------------------------------------------------- |
| B1 design system              | `#/design-system`             | Routed (0c-1), standalone page                                                         |
| B2 login                      | `#/login`                     | Done (0c-1)                                                                            |
| B3 dashboard                  | `#/dashboard`                 | Done (0c-2)                                                                            |
| B4 teacher Today + attendance | `#/attendance`, `#/attendance/:id` | Done (0c-3)                                                                       |
| B5 Hifz entry + progress      | —                             | **Missing** (only a tab inside the student profile)                                    |
| B6a student list              | `#/students`                  | Done                                                                                   |
| B6b student profile           | `#/students/:id`              | Done. Bug: an unknown ID shows a made-up record ("আয়েশা সিদ্দিকা") instead of "not found" |
| B7 staff                      | `#/staff`, `#/staff/:id`      | Done                                                                                   |
| B8 admissions                 | `#/admissions`                | Done                                                                                   |
| B9 fees                       | `#/fees`                      | Done                                                                                   |
| B10 sponsorship               | `#/sponsorships`              | Done                                                                                   |
| B11 homework                  | `#/homework/...`              | Done (offline gap, see below)                                                          |
| B12 exams/marks               | `#/results/:id` = profile tab | **Missing** (no exam setup, marks grid, publish)                                       |
| B13 guardian                  | `#/guardian/:id`              | First version exists + 4 tests                                                         |
| B14 question bank             | `#/exam-papers`               | First version exists + 5 tests                                                         |
| B15 settings                  | `#/settings`                  | First version exists + 5 tests                                                         |
| B16 system states             | `#/system-states`             | First version exists + 3 tests                                                         |

## Phase 0 audit — the 5 earlier fixes

1. **Hash routing** — OK: one `createHashRouter`, all paths in `app-routes.ts`, tested. Gaps: the prototype role
   is not in the URL, so a refresh resets it to a default picked from the route (deep link as HR → opens as
   Finance Lead); unknown routes silently show the student list; unknown student IDs show a fake record.
2. **Unpaid pledge test** — OK (`sponsorship-domain.test.ts:86`).
3. **B11 homework** — completion % OK (from tested `completionPercentage`). **Offline audio NOT done**: the
   "এখনো পাঠানো হয়নি" note only appears when the demo state switch is set to Offline; the recording is not stored
   (no IndexedDB/localStorage), so it is lost on a real disconnect or reload.
4. **Admission Officer / own profile / last admin** — Admission Officer does not inherit Admin: OK (tested).
   Own-profile hides "Access বন্ধ"/"অব্যাহতি শুরু": works, but decided inside `StaffProfile.tsx`, not the resolver.
   Last Institution Admin: blocked inside the component only, no test.
5. **Approvals** — self-approval blocked: OK (tested, sponsorship only). **One-click approve for low-risk only:
   NOT done** — there is no risk level; bulk approve works for any items that pass checks, whatever the amount.

### Other issues found

- 9 inline role checks in components (App.tsx 4, ExamPaperBuilder 2, GuardianHome 1, Homework 1,
  SponsorshipFunds 1). App.tsx also silently switches the role when you navigate (e.g. to Homework → Class teacher).
- Money in `App.tsx` student list (`dues`) is plain taka, not paisa — check all screens in Phase 6.

## Phase 0b — fix list (each with a test)

1. DONE — Routing: unknown student/staff ID → not-found state; unknown route → not-found; keep role on refresh
   (e.g. `?role=` in the hash or sessionStorage) so deep links reopen as the same role.
2. DONE (metadata in localStorage via `src/homework-outbox.ts`; real audio Blob would go to IndexedDB) — Homework offline audio: store the recording in IndexedDB with status "এখনো পাঠানো হয়নি"; it survives reload
   and offline; sends on reconnect; idempotent (no double submission). Domain test for the queue.
3. DONE (`resolveStaffAccountActions`) — Move own-profile and last-Institution-Admin rules into the resolver (`resolveStaffPermission`) + tests.
4. DONE (`approvalRisk`/`checkApproval`: > ৳২,০০০, eligible-use exception, or fund < 10% left = high risk → review note required, never bulk) — Approval risk level in the domain (e.g. exception or above a threshold = high risk → no one-click/bulk,
   needs review + reason) + tests; self-approval rule stays.

## Phase plan (each ends with format + tsc + test + build passing, a commit, and an update here)

| Phase | Scope                                                                                                            |
| ----- | ---------------------------------------------------------------------------------------------------------------- |
| 0b    | Fix list above. Commit `fix: baseline gaps before B12`                                                           |
| 1     | B12 exams, marks entry, result publishing (S17, S18) — new                                                       |
| 2     | B13 guardian home (S26) — exists; check against task prompt, fill gaps + tests                                   |
| 3     | B16 system states + subscription modes — exists; same                                                            |
| 4     | B14 question bank + paper builder (S33) — exists; same                                                           |
| 5     | B15 settings + permissions (S30) — exists; same                                                                  |
| 6     | E2E journeys, T01–T30 mapping, consistency (inline role checks), a11y, responsive, code split, `docs/handoff.md` |
| D     | Design overhaul of all screens (user request) — DONE                                                             |
| 0c    | B1 route + B2 login, B3 dashboard, B4 teacher Today/attendance, B5 Hifz — approved, before B12                   |

## Screens S01–S38 (PRD ch.12.5)

- Done: S04, S12, S05, S06, S07, S08, S11, S16, S20, S21, S27 (homework part).
- First version, to be completed: S26 (B13), S30 (B15), S33 (B14), B16 states.
- Missing, in plan: S17, S18 (Phase 1).
- Missing, not in plan (needs decision): S01, S03, S04, S12, S14, S15.
- Later: S02, S09, S10, S13, S19, S22–S25, S28, S29, S31, S32, S34–S38.

## Open questions (waiting for user)

1. Phases 2–5 screens already have first versions. OK to treat those phases as "check + fill gaps" rather than rebuild?
2. GitHub Pages for the app: later — nothing is pushed until the project is finished.

## Test count

122 (14 files) — 2026-11-08 after Phase 0c-3 (baseline was 54).
