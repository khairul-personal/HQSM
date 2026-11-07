# Claude Code task prompt — finish the madrasa frontend prototype

Paste everything below the line into Claude Code (start in plan mode).

---

You are taking over an existing frontend prototype mid-way. Read `CLAUDE.md` first; it holds the project rules, commands and where to find things in `docs/PRD_v3.md` and `docs/design-prompt.md`. Follow it in every phase.

Work in phases. Phase 0 ends with a stop for my approval. After I approve, run Phases 1–6 in order without waiting, but a phase only counts as done when `pnpm format`, `pnpm exec tsc --noEmit`, `pnpm test` and `pnpm build` all pass; then commit and update `docs/progress.md`. Stop and ask me only if you are blocked, a check cannot be made to pass, or the PRD is ambiguous on something that changes behaviour. If your context gets long, finish the current phase, update `docs/progress.md` with exactly where you are, and tell me to start a new session that continues from it.

## Phase 0 — Orientation and baseline audit (no new features)

1. Inspect the repo: structure, routing, design tokens, shared components, the shared permission resolver, mock data, and existing tests.
2. Confirm which screens exist. Expected done: B1 design system, B2 login + institution picker, B3 principal dashboard, B4 teacher Today + attendance, B5 Hifz entry + progress, B6a student list, B6b student profile, B7 staff list + profile, B8 admission pipeline, B9 fee collection + receipt, B10 sponsorship + fund allocation, B11 homework. For each, note gaps against `docs/design-prompt.md` Part B and the PRD.
3. Verify these specific earlier fixes are in place, and list any that are not:
   - All routes use one hash-routing scheme; refresh and back work on every deep link.
   - A test proves an unpaid pledge does not increase a fund's available balance.
   - B11 homework: the displayed completion % comes from the tested domain function; offline-recorded audio survives a lost connection and is clearly marked "এখনো পাঠানো হয়নি".
   - Admission Officer does not inherit Admin; own-profile hides "access বন্ধ"/"অব্যাহতি শুরু"; last Institution Admin cannot be removed.
   - Approvals: one-click Approve only for low-risk items; self-approval blocked.
4. Run the four commands and record the results.
5. Create `docs/progress.md` with: screens done/remaining (S01–S38 from PRD ch.12.5), test count, open issues, and the phase plan below. Write any fixes from step 3 as Phase 0b items.
6. **Stop.** Report findings and the plan. Wait for my approval.

## Phase 0b — Fix baseline gaps

Fix every item found in Phase 0 step 3, with tests. Run checks, commit `fix: baseline gaps before B12`.

## Phase 1 — B12 · Exams, marks entry and result publishing (S17, S18). NEW screen.

Permissions (via the shared resolver): add role Exam Controller. Teachers enter marks only for their assigned subjects. Exam Controller reviews, locks and publishes but never enters marks. মুহতামিম approves reopening a published result. Guardians see only published results of their own children.

1. Exam setup (Exam Controller): name, session/term, classes, subjects; per subject components (লিখিত / মৌখিক / ব্যবহারিক; Hifz: তিলাওয়াত), full and pass marks; configurable grading scale (e.g. মুমতাজ, জায়্যিদ জিদ্দান, জায়্যিদ, মকবুল, রাসিব) with ranges; optional subjects. Published rule versions are frozen; edits create a new version.
2. Marks entry (teacher, desktop-first, spreadsheet style): students × components grid; Tab/Enter/arrow navigation; paste from spreadsheet. Four visually distinct cell states: a number (including ০), অনুপস্থিত, অব্যাহতি, প্রবেশ করানো হয়নি — ০ and empty must never look alike. Inline range validation, autosave status, "৪টি ঘর বাকি" counter, submit for review. Mobile 360px: one student per card.
3. Review and publish: completion by subject/teacher; discrepancy report (missing, out of range, suspicious patterns such as identical marks for everyone); stepper খসড়া → পর্যালোচিত → লক → প্রকাশিত. Publish blocked while any cell is not entered, listing what is missing. Previews: tabulation sheet, A4 individual marksheet (Bengali with Arabic subject names RTL), pass/fail summary, merit list if enabled. Reopen: reason + মুহতামিম approval → new published version; old version kept; affected guardians flagged.
4. Guardian view (mobile): published results per child with version label; never drafts.
5. States: loading, no exams yet, offline (entries kept locally, submit disabled), locked read-only, no-permission.
6. Tests: teacher cannot enter marks for an unassigned subject (including by URL); Exam Controller cannot edit marks; publish blocked when any cell is not entered; ০ / absent / exempt / not-entered handled distinctly in totals and pass/fail; weighted example from PRD ch.15 gives ৭৩ if weighting is implemented; published snapshot unchanged after a grading edit; reopen creates version 2 and keeps version 1; guardian cannot see unpublished results.
   Commit `feat(B12): exams, marks entry, result publishing`.

## Phase 2 — B13 · Guardian portal home (S26). NEW screen, mobile 360px first.

- Reuse the Guardian role (two children in different classes) and the B2 phone-OTP login.
- Child switcher with avatars (initials per policy); everything below follows the selected child only.
- Cards in order: আজকের হাজিরা (status and time; "এখনো দেওয়া হয়নি" when unmarked — never shown as absent), আজকের সবক (summary only, no restricted notes), হোমওয়ার্ক (due soon → B11), সর্বশেষ ফলাফল (published only → B12), বকেয়া (৳, due date, "পরিশোধের নিয়ম" sheet with office/bKash instructions), নোটিশ (with "পড়েছি" acknowledgement).
- Payment proof upload (bKash/Nagad reference + screenshot) sets status "যাচাই বাকি", never "পরিশোধিত", until a cashier verifies; the B9 verification-pending list shows it.
- Built for first-time smartphone users: large text, one primary action per card, labelled icons, no jargon.
- States: loading, offline (cached data with time), no linked children ("অফিসে যোগাযোগ করুন"), link revoked (all child data and attachments inaccessible immediately), no-permission.
- Tests: switching child never shows the other child's data; no access to another student by URL; payment proof → pending, not paid; revoked link loses all access.
  Commit `feat(B13): guardian portal home`.

## Phase 3 — B16 · System states pack. Shared components + wiring.

- Reusable state components: empty, loading skeleton, error with retry, offline, no-permission — short Bengali message plus a clear next action. Replace one-off state designs in earlier screens with these where they differ.
- Subscription states per PRD M24: Grace banner (১৪ দিন, all features, countdown), Limited mode (৩০ দিন), Suspended (read and export only), switchable from the prototype dev tool.
- Limited mode enforced in logic, not just UI. Allowed: viewing, export, attendance, সবক, homework, monthly invoices for existing students, collecting payments on existing invoices, receipts, transactional and emergency messages. Blocked: new enquiry/admission, new users/branches, promotional bulk SMS. Blocked actions explain why and whom to contact.
- Tests: limited mode blocks new admission; fee collection and absence messages still work; suspended allows only read/export.
  Commit `feat(B16): shared system states and subscription modes`.

## Phase 4 — B14 · Question bank and paper builder (S33). NEW screen.

- Bank table: class, subject, chapter/topic (syllabus link optional), type (MCQ, সংক্ষিপ্ত, রচনামূলক, শূন্যস্থান, মিলকরণ, তারকিব, তরজমা, কুরআন/আরবি পাঠ), marks, difficulty, language (BN/EN/AR), status (খসড়া, অনুমোদিত), duplicate flag. Arabic RTL with harakat.
- Teachers see their own drafts plus approved questions; Exam Controller sees all.
- Paper builder: running total vs the required total from the B12 exam version; component mapping check; Set A / Set B.
- Stepper খসড়া → পর্যালোচনা → অনুমোদিত/লক → প্রিন্ট. Lock blocked on total mismatch or unmapped components. Editing a locked paper creates a new version; the old one is archived.
- Print: A4 bilingual Bengali/Arabic paper with institution header and a separate answer-key sheet. Locked-paper preview and print only inside the configured print window and only for users with print permission; every preview/print/download is logged (who, when, copies).
- Tests: lock blocked on mismatch; unapproved paper cannot print; preview outside the window blocked; every print attempt logged; teachers cannot see others' drafts.
  Commit `feat(B14): question bank and paper builder`.

## Phase 5 — B15 · Settings and permissions (S30). NEW screen.

- Sections: প্রতিষ্ঠান প্রোফাইল; শাখা (বালক/বালিকা/মিশ্র); ছবি নীতি per branch (বাধ্যতামূলক/ঐচ্ছিক/সংরক্ষণ নয়); হাজিরার cutoff per shift; Student/Staff ID format; fund eligible-use rules (used by B10); role templates with a module × action permission matrix read from and written to the shared resolver; per-user girls'-section access toggle with a plain-Bengali explanation of exactly what it reveals.
- Only Institution Admin can change settings; privacy, money and permission changes require a reason; every change is audited with before/after.
- Settings must drive behaviour: photo policy updates avatars everywhere; fund rule edits change B10 eligibility; matrix edits change what the resolver allows; cutoff changes affect B4 countdowns.
- Tests: non-admin cannot open settings (including by URL); "সংরক্ষণ নয়" hides photos in list, profile, attendance and Hifz screens; editing a fund rule changes B10 results; every change creates an audit entry.
  Commit `feat(B15): settings and permissions`.

## Phase 6 — Final integration, quality and handoff

1. **End-to-end journeys.** Add integration tests (Playwright if it installs cleanly in this environment; otherwise Vitest + Testing Library) for:
   a. Enquiry → application → approve (auto admission-fee invoice) → enrol → student profile → collect fee → receipt.
   b. Sponsored student: Zakat 75% on ৳১,২০০ → allocation approved by Finance Lead → receipt shows "ফান্ড থেকে পরিশোধিত" ৳৯০০, due ০.
   c. Morning attendance with one absent and one unmarked → absent produces one guardian message; unmarked produces none and appears in the Branch Admin pending list.
   d. Hifz: সবক entry → progress grid → Khatam verification → "সনদ প্রস্তুত"; re-memorised range does not increase total.
   e. Guardian records homework audio offline → reconnects → submits → teacher checks with feedback → guardian sees it.
   f. Exam setup → marks → publish → guardian sees result; reopen → version 2.
   g. Question paper → lock → print inside window; blocked outside.
   h. Privacy sweep: a male staff user without girls'-section access, across list, search (incl. phone), profile, attendance, Hifz, homework, fees and direct URLs.
   i. Limited subscription mode across admission, fees, attendance and messaging.
2. **PRD acceptance coverage.** Map PRD ch.20 tests T01–T30 to automated tests. Add missing ones that a frontend prototype can prove. Mark backend-only ones (e.g. T16 restore, T08 webhooks) as "backend — not applicable" in `docs/progress.md`.
3. **Consistency pass.** Same badge, state, avatar, money and date components everywhere; no hard-coded colours; no inline role checks (search the code and fix); Bengali digits and ৳ formatting consistent; Arabic RTL correct.
4. **Accessibility.** Run axe (e.g. `@axe-core/react` or `vitest-axe`) on every screen; fix all serious/critical issues; verify keyboard flows for marks entry and fee collection.
5. **Responsive.** Check every screen at 360px and 1440px; no page-level horizontal scroll.
6. **Performance.** Route-level code splitting so the >500 kB chunk warning disappears; lazy-load heavy views (print, charts).
7. **Handoff docs** in `docs/handoff.md`:
   - Screen map S01–S38 with route, status (done / R1b / later) and owning components.
   - Component inventory with props and states.
   - Permission resolver rules as a table (role × resource × visible/masked/hidden/actions).
   - Mock data shapes written as draft API contracts (entities and fields from PRD ch.16), noting what the backend must enforce server-side.
   - Known gaps and assumptions, and the list of open PRD decisions from ch.22.
8. Run the four commands, commit `chore: final integration, a11y, perf, handoff`, and give me a final report: screens done, test count, PRD coverage table, open questions.

Begin with Phase 0.
