# Interface system — Madrasa Management (হলি কুরআন স্কুল এন্ড মাদরাসা)

Saved 2026-11-10 after the shell + S03 redesign. Later screens must follow this file.
If this file and `docs/design-rollout.md` disagree, this file wins (the dark-green frame is retired).
PRD v3 stays authoritative for features, roles, numbers and workflows.

## Direction

- **Reference (selected by the user, do not re-open):** Opedia "School Management Dashboard UI", Samsun Nahar /
  Opedia Studio — https://www.behance.net/gallery/185861803/School-Management-Dashboard-UI-Design-I-Admin-Panel
  Kept from it: light sidebar, quiet top bar, compact summary strip, open spacing, wide panel + narrow rail.
  Not copied: its logo, people, purple, awards/library/course promo, upsell banner, decorative donut.
- **Who:** the director/office staff at a desk every morning; teachers on cheap Android phones.
- **Feel:** a calm, well-kept ledger. White paper on warm sand, emerald ink for selection and action.
- **Focal point of S03:** the "আজকের কাজ" list. Summaries sit above it; everything else supports it.
- **Identity:** the real crest (`public/crest.png`) in the sidebar. No religious imagery, gradients, glass, emoji icons.

## Tokens (single source: `src/theme.css`)

- Colour: primary `#0F6B4A` · primary-hover `#0B5A3E` · primary-soft `#E7F0EC` · background `#FAF8F3` ·
  surface `#FFFFFF` · surface-sunken `#F4F1EA` · border `#E4E0D6` · text `#1C2420` · muted `#5F6B65` · gold `#B8862B` (sparse).
- Text-safe status colours (use these for text/icons, never the raw palette): `--success-text #17714A`,
  `--warning-text #8A5200`, `--danger-text #A8322C`, `--info-text #255E97`, `--accent-text #86601A`.
  Measured: muted on white 5.56, on background 5.24; primary on white 6.52; status text on its soft tint 4.9–5.7.
  `--subtle #7B857F` is 3.8:1 — decoration only, never text.
- Status = icon + label + colour, always.
- Depth: **borders + spacing only**. `--shadow-float` only on popover, drawer, palette, phone drawer.
- Spacing 4px base (`--s1..--s7` = 4, 8, 12, 16, 24, 32, 48). Radius: input 8, card 12, modal 16.
- Page padding 24 desktop / 16 phone; panel padding 24 (KPI 20); panel gap 24 (KPI gap 16).

## Typography (first priority)

- `--font-bn: "Inter", "Noto Sans Bengali", …` — Inter renders Latin/IDs, every Bengali glyph falls through to
  **Noto Sans Bengali**. Loaded weights: 400, 500, 600 only (both families). `font-synthesis: none` — no fake bold.
  Arabic: Noto Naskh Arabic / Amiri Quran, RTL, unchanged.
- Scale (size / line-height / weight): body, table, input 16/26/400 · nav + important labels 16/24/500 ·
  metadata 14/22/400 in `--muted` · section title 18/28/600 · page title 24/34/600 · KPI value 30/40/600.
- Normal letter spacing; no text-transform; never shrink, zoom or clip Bengali — wrap or change layout.
- Numbers: Bengali digits (`bn()`); IDs, phones, receipt numbers in Latin (`.latin`); money `takaFromPaisa` →
  "৳ ১২,৩৪,৫৬৭" (no-break space); `tabular-nums` + right-aligned in columns (`.amount`).
- Dates: fixed Asia/Dhaka calendar day; Hijri via `hijriDate` (Umm al-Qura).

## Motion

- `--ease: cubic-bezier(0.2, 0.8, 0.2, 1)`; `--t-fast 140ms` (hover/pressed colour), `--t-pop 160ms`
  (menus: opacity + 4px), `--t-panel 200ms` (drawer/dialog/route: opacity + ≤ 8px).
- Sidebar collapse changes the grid column once; no width animation. Never `transition: all`, bounce, stagger, count-up.
- `prefers-reduced-motion`: animations off, everything still works.

## Shell (`src/shell/`)

- `AppShell.tsx` + `shell.css`: sidebar 264 / rail 72 / top bar 64 / content max 1440.
  ≥1280 expanded (user can collapse, remembered) · 768–1279 icon rail with tooltips · <768 off-canvas drawer +
  bottom navigation (role's first 4 destinations + "আরও").
- Nav row: 46px, 20px outline icon (lucide, stroke 1.75), label 16/500; selected = `--primary-soft` fill +
  `--primary-hover` text 600. Group caption 14/500 muted. Badge only for actionable pending counts (gold-soft pill).
- Menu entries come from `resolveNavigation(context)` in `student-permissions.ts` (tested). Hidden ≠ authorized.
- **One scope control** (top bar, left): institution + branch + session in one popover; state in `ShellState.tsx`
  (`useShellState`). Pages must read scope from there, never add their own branch/session filter.
- Search: `Ctrl/Cmd+K` palette (pages the role may open). Notifications: honest "not connected yet" popover.
- Profile menu at the foot of the sidebar (language, sign out). No promo banner.
- Real restrictions stay visible: subscription strip under the top bar; "সীমিত অ্যাক্সেস" pill when the viewer has no
  girls'-section access.
- **Dev inspector** (`DevInspector.tsx`, dashed "DEV" pill, bottom-right): role, subscription mode, data fixture
  (data / loading / empty / unavailable), force offline, links to prototype pages. Shown in `vite dev`; in a build only
  after `localStorage.setItem("madrasa.dev-inspector","1")`. No test control may live in product UI.

## Reusable patterns

- `Popover` (`shell/Popover.tsx`): anchored menu/dialog — aria-expanded, Escape + focus return, outside click,
  ↑↓ Home End, viewport clamp. Options: `.sh-option` 44px rows, check icon for the selected radio.
- Drawer / palette: native `<dialog>` + `showModal()` (focus trap, Escape, focus return for free).
- KPI summary (`.dash-kpi`): label 16/500 → period 14 muted → value 30/600 → hairline → labelled lines
  (`.dash-lines`, label left / value right) → footer "হালনাগাদ HH:MM" + one detail link. No mini-boxes, no per-KPI tint.
  Four columns only when the content area is ≥ 1100px (container query), else 2, else 1.
- Panel (`.dash-panel`): title 18/600 + quiet note right; rows separated by 1px `--border`; footer = updated time + link.
- Work row (`.dash-task`): kind + "জরুরি" badge → title 16/500 → meta 14 muted → amount (if any) → one 44px secondary button.
- Filter chips (`.dash-filters`): 44px pills with count, `aria-pressed`.
- Progress (`.dash-bar`): label + "actual / target · %" above an 8px bar (`role="meter"`). Prefer over donuts.
- Date-led list (`.dash-events`): 60px date block, title, type badge + weekday.
- Buttons: `.ds-button` primary (one per page header) / secondary; 44px in the redesigned screens.
- States: skeleton matching the final layout (loading) · real zeros + plain sentence (empty) · one retry panel
  (unavailable) · warning strip with last data kept (offline) · `SystemState kind="no-permission"`.
- Loading rule: scope change → skeleton at once (never old-scope numbers); same-scope refresh → keep data + "হালনাগাদ হচ্ছে…";
  request id guards against a late answer overwriting a newer selection.

## Business rules the layout must keep (S03)

- Attendance: Present / Late / Absent / Leave / Unmarked always separate; Unmarked ≠ Absent; denominator shown.
- Students: branch split and residence split are two labelled lines; never added together.
- Collection: cash = fee receipts − fee refunds + donations (`collectionCash`); fund allocation shown apart, not cash.
- Dues bands: ০–৩০ দিন · ৩১–৬০ দিন · ৬০ দিনের বেশি.
- Approvals: dashboard row opens a review; no approve/return from the dashboard; own request cannot be approved.
- Every number from tested domain functions (`dashboard-domain.ts`); every metric has a period and "হালনাগাদ" time.
