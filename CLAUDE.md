# HQSM website — START HERE

Static school website (HTML/CSS/JS, English only). Contact forms use `mailto:` (no backend).

## Files
- `_src/pages/` — page sources. **Edit these**, then run `python _src/build.py` to regenerate the root `*.html`.
- Root `*.html`, `style.css`, `script.js` — built site that gets served.
- `assets/` — web images (crest, logo, class photos, principal). `assets/src/` = original full-size images.
- Local preview: `.claude/launch.json` → `python -m http.server 5500`.

## Madrasa management app (separate project, same repo)
- Lives in `app/`. Its own rules: `app/CLAUDE.md`; progress: `app/docs/progress.md` (read first).
- App design system (light shell, Noto Sans Bengali, tokens): `app/.interface-design/system.md`.

## GitHub
- Repo: https://github.com/khairul-personal/HQSM (public since 2026-11-08), branch `main`.
- Commit after changes. **Do NOT push** until the madrasa app (`app/`) project is finished (user, 2026-11-08) — local commits only.
- App preview: `.claude/launch.json` → `madrasa-app` (Vite dev server, http://localhost:8443).

## Status
- 2026-11-08: put under git, pushed to GitHub, repo made public, GitHub Pages turned on.
- 2026-11-10: user asked to push all local commits (up to B4 progress note `136826b`) — pushed. No-push rule still applies to new work unless the user asks again.

- 2026-11-10: app shell + Director Dashboard (S03) redesigned to the Opedia light reference; committed locally, not pushed.

## Next step
- Live site (GitHub Pages, from `main` root): https://khairul-personal.github.io/HQSM/ — every push to main redeploys.

## Rules
- Use the real crest, its colours and real school content. No generic one-pagers.
