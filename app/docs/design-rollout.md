> **2026-11-10:** superseded for shell, fonts and layout by `.interface-design/system.md` (light Opedia-style frame,
> Noto Sans Bengali). The deep-green frame below is retired. Keep this file only for per-screen history.

# Design rollout brief — move every screen onto `src/theme.css`

Chosen look (user, 2026-11-08): **deep green frame** — dark green sidebar, gold marks the active item, calm light
content area. Reference: the pilot at `#/students` (shell + student list), styled in `src/theme.css`.
Quality bar: `docs/design-prompt.md` Part A ("calm, dignified, modern"; Stripe-style tables, Linear-style restraint).

## Why the old design looked generic

- Text was 7–12px almost everywhere (spec: Bengali never below 15px; line-height ≥ 1.6).
- 330 different hex colours instead of the 12 design tokens; shadows, gradients and pills everywhere.
- Each screen invented its own buttons, badges, cards and tables.

## Rules for every screen stylesheet

1. **Colours:** only `var(--token)` from `theme.css` (`--primary`, `--primary-soft`, `--primary-line`, `--accent`,
   `--accent-soft`, `--background`, `--surface`, `--surface-sunken`, `--border`, `--border-strong`, `--text`,
   `--muted`, `--subtle`, `--success(-soft)`, `--warning(-soft)`, `--danger(-soft)`, `--info(-soft)`, `--frame*`).
   No raw hex/rgb (exception: `#fff` text on `--primary`/`--frame`). For a tint use
   `color-mix(in srgb, var(--token) N%, transparent)`. Do not add tokens.
2. **Type:** only `var(--fs-*)`. Bengali body text, table cells, inputs, buttons: `--fs-md` (15) or `--fs-base` (16).
   Secondary lines, labels, table headers, badges: `--fs-sm` (14). `--fs-xs` (12) only for Latin-only IDs/kbd hints.
   Headings: section 18–20, page title 30 (24 on mobile). Bengali paragraphs `line-height: var(--lh-bn)`;
   single-line UI 1.3–1.5. Weights 400/500/600 (700 only for big numbers). No uppercase + letter-spacing on Bengali.
   IDs, phone, receipt numbers and amounts: `font-family: var(--font-latin); font-variant-numeric: tabular-nums`.
   Arabic: `var(--font-ar)`, `direction: rtl`.
3. **Space and shape:** 4px grid via `--s1…--s7`. Radius: inputs/buttons/chips `--r-input`, cards `--r-card`,
   modals/sheets `--r-modal`, badges 6px. Shadow only on floating things (menus, modals, toasts, sticky bars):
   `--shadow-float`. Cards = `--surface` + 1px `--border`, no shadow. No gradients, no glass, no blur, no glow.
4. **Components:** use `.ds-button` (primary/secondary/danger) and `.ds-badge` (success/info/warning/danger/neutral)
   from `theme.css`; delete local rules that restyle them. Status = icon or dot + text + colour, never colour alone.
5. **Tables:** header row `--surface-sunken`, `--fs-sm`, `--muted`, weight 600, height 44; cells `--fs-md`,
   padding `--s3 --s4`, 1px `--border` between rows, no zebra; money/number columns right-aligned, tabular.
6. **Forms:** inputs 40–44px tall, 1px `--border-strong`, `--r-input`, focus = `border-color: var(--primary)` +
   `box-shadow: var(--focus)`. Labels `--fs-sm` 600 `--text`, help text `--fs-sm` `--muted`.
7. **Touch & responsive:** controls ≥ 44px tall on mobile (≥ 36px desktop). Keep existing breakpoints and layouts;
   bigger text must not overflow — widen columns, allow wrapping, or switch to stacked layout. No page-level
   horizontal scroll at 360px; wide tables scroll inside their own container.
8. **Gold** (`--accent`) only for Khatam/certificate moments, sponsorship/premium highlights, and the active nav item.
9. Delete dead or duplicated rules while you are there — every file should end up shorter.

## Boundaries

- Keep every class name (other screens and tests may share them). Change markup/TSX only if CSS alone cannot do it,
  and never change logic, data, domain `.ts` files or tests.
- `theme.css` is shared and owned by the lead; screen files must not override its shell/table/button rules.
- Done = `npx -y pnpm@10 exec tsc --noEmit` and `npx -y pnpm@10 build` pass (run from `app/`).
