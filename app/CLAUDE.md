# Madrasa Management System — Frontend Prototype

Multi-tenant madrasa (Islamic school) management dashboard for Bangladesh. This repo is the
**frontend prototype**: real UI, real domain logic and tests, browser-local mock data, no backend.

## Source of truth

- Requirements: `docs/PRD_v3.md` (Bengali). It is large — read only the sections you need:
  ch.1 roles & permissions (line ~80) · ch.2 girls' branch & photo policy (~138) ·
  ch.3 navigation & dashboards (~156) · ch.4 workflows (~200) · ch.5–10 modules M01–M26 (~233–728) ·
  ch.11 full profiles (~729) · ch.12 frontend design spec & screen list S01–S38 (~832) ·
  ch.13 notifications (~977) · ch.15 money & result rules (~1058) · ch.20 acceptance tests T01–T30 (~1181).
- **Design system (current, wins over older design notes): `.interface-design/system.md`** — light Opedia-style
  shell, Noto Sans Bengali, tokens, motion, reusable patterns. Read it before any UI work.
- Older visual bar and screen briefs: `docs/design-prompt.md` (Part A = rules, Part B = screens).
- Progress log: `docs/progress.md` — read it at the start of every session, update it after every phase.
- If the PRD and the design prompt disagree, the PRD wins. If anything is ambiguous, ask before building.

## Commands (run all four after every change set; report results)

- `pnpm format`
- `pnpm exec tsc --noEmit`
- `pnpm test` (Vitest)
- `pnpm build`
  A phase is not done until all four pass. The >500 kB chunk warning is known; fix it only in the final phase.

## Architecture rules

- Reuse the B1 design system: existing tokens (CSS variables) and components. Do not add new colours,
  fonts, radii or one-off components when an existing one fits; extend the shared component instead.
- **One shared permission resolver** decides every visible / masked / hidden field, tab, action and route.
  Never write role checks inline in components. Deep links (direct URLs) must go through the resolver.
- **One routing scheme**: hash routes (`#/students`, `#/staff/EMP-024`, `#/sponsorships`). Refresh and back must work.
- Money is **integer paisa** everywhere. No floating point for amounts. Display with ৳ and South Asian grouping.
- Domain logic (money, permissions, results, limits) lives in pure functions with Vitest tests;
  UI numbers must come from those tested functions, never be recomputed in components.
- Idempotency: retrying a submit/approve/post never creates a second record.
- Posted/published/locked records are immutable; corrections create a reversal, adjustment or new version.
- Test controls (role, subscription mode, data fixtures, offline) live only in the development inspector
  (`src/shell/DevInspector.tsx`, "DEV" pill). Never put a test control in product UI.
- Scope (branch + session) comes from the shell's single control (`useShellState`); pages do not add their own.

## Product rules that are easy to get wrong

- Unmarked attendance is never Absent; no guardian message for unmarked.
- Girls' branch: viewers without girls'-section access see initials avatar and "সীমিত তথ্য" for photo, phone,
  address, health; restricted tabs are absent (not disabled); searches must not reveal hidden matches.
- 0 marks, absent, exempt and not-entered are four different states; publish is blocked while any cell is not entered.
- Fund allocation ≠ concession. Restricted funds follow eligible-use rules; balances never go negative;
  insufficient fund stays pending; never auto-switch funds. Unpaid pledges never count as available balance.
- Nobody approves a request they created. The last Institution Admin cannot be removed.
- Subscription limited mode still allows attendance, homework, existing-invoice collection, receipts,
  transactional and emergency messages; blocks new admissions, new users, promotional bulk SMS.

## Language, content and design

- Bengali-first UI; English secondary; Arabic/Quranic text RTL with correct harakat.
- Fonts: Noto Sans Bengali 400/500/600 (BN letters + digits), Inter (Latin/IDs), Noto Naskh Arabic (AR),
  Amiri Quran (verses). No Hind Siliguri, no weight 700, no synthetic bold.
- Bengali digits by default; IDs, phone and receipt numbers in Latin digits.
- Realistic Bengali sample data only (no lorem ipsum). Respectful, non-blaming microcopy.
- Every screen: desktop 1440px and mobile 360px (no page-level horizontal scroll); loading, empty, error,
  offline and no-permission states; WCAG 2.2 AA; touch targets ≥ 44px; keyboard support.
- Never: mosque/crescent clipart, heavy gradients, glassmorphism, emoji as icons, generic edtech styling.

## Working style

- Before a multi-file task, read the relevant PRD section and existing code, then state a short plan.
- Keep changes scoped to the current phase; do not refactor unrelated screens.
- Commit after each completed phase with a clear message (e.g. `feat(B12): exams, marks entry, publishing`).
- When reporting, list: what was built, tests added, the four command results, and any open questions.
