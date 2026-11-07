# Madrasa Management Dashboard — Master Design Prompt

> Paste PART A first (together with the PRD v3.0 file if your tool accepts attachments). Then use one PART B prompt per message to build screens one at a time. Do not ask for all screens in one message.

---

## PART A — Master prompt

You are a principal product designer who has shipped data-heavy SaaS dashboards (in the class of Linear, Stripe Dashboard, Notion, Vercel) and has deep sensitivity to South Asian Muslim institutions. Design the frontend for a multi-tenant **Madrasa Management System** used in Bangladesh. The full requirements are in the attached PRD v3.0 (Bengali). Follow it as the source of truth; this prompt defines the visual and interaction quality bar.

### 1. Product context

- Users: Principal (Muhtamim), Academic Admin, Branch Admin, Hifz Head, teachers and Hifz teachers, Exam Controller, Accountant/Cashier, Finance Lead, Admission Officer, Hostel Supervisor, Welfare Officer, parents (guardians), and a SaaS super-admin.
- Institutions: Qawmi and Hifz madrasas first (Noorani/Qaida → Nazera → Hifz tracks), Alia later. Many have separate boys' and girls' branches with strict privacy (purdah) rules.
- Devices: office staff on desktop (1280–1920 px); teachers and parents on low-cost Android phones (360 px wide, slow 3G/4G, bright sunlight).
- Primary language is **Bengali**; English is secondary; Arabic appears in Quranic text, names, question papers and certificates (must render right-to-left correctly inside Bengali screens).

### 2. Design direction — "Calm, dignified, modern"

- Feel: a quiet, trustworthy, premium tool — closer to a well-made banking or Linear-style app than a school-portal template. Generous whitespace, precise alignment, restrained colour.
- Islamic identity is expressed through **colour, typography and very subtle geometry**, not decoration. A faint girih/star geometric pattern (3–5% opacity) may appear only on the login screen, empty states and print headers.
- **Never use:** mosque or crescent clipart, Arabic-calligraphy wallpaper, heavy gradients, neon colours, glassmorphism, stock photos of children, emoji as icons, or generic "edtech" illustrations.
- Icons: one consistent outline set (Lucide or Phosphor, 1.5 px stroke). Status always uses icon + text + colour, never colour alone.

### 3. Design tokens (use exactly)

Colours (light theme; also supply a dark theme with the given values):

| Token         | Light               | Dark             |
| ------------- | ------------------- | ---------------- |
| primary       | #0F6B4A             | #3FA57D          |
| primary-soft  | #E7F0EC             | #173328          |
| accent (gold) | #B8862B             | #D9AE5C          |
| background    | #FAF8F3 (warm sand) | #121614          |
| surface       | #FFFFFF             | #1A201D          |
| border        | #E4E0D6             | #2C3430          |
| text          | #1C2420             | #ECEFED          |
| text-muted    | #5F6B65             | #9AA59F          |
| success       | #1E8E5A             | brighter variant |
| warning       | #C77700             | brighter variant |
| danger        | #C2413A             | brighter variant |
| info          | #2F6FB0             | brighter variant |

- Gold is an accent only: Khatam (Quran completion) moments, certificates, premium badges, key highlights. Never for large areas.
- Typography: Bengali — **Hind Siliguri** (fallback Noto Sans Bengali); Latin and numerals — **Inter**; Arabic — **Noto Naskh Arabic**, Quranic verses — **Amiri Quran**. Scale 12 / 14 / 16 (body) / 18 / 20 / 24 / 30 px. Bengali body never below 15 px; Bengali line-height ≥ 1.6 (Bengali conjuncts and vowel signs need room).
- Spacing: 4 px base (4, 8, 12, 16, 24, 32, 48). Radius: inputs 8, cards 12, modals 16. Shadows: barely visible, only on floating elements (menus, modals, toasts).
- Numbers: Bengali digits (১২৩) by default in the Bengali UI; IDs, phone numbers and receipt numbers always in Latin digits. Currency: ৳ with South Asian grouping (৳ ১২,৩৪,৫৬৭).

### 4. App shell

- Desktop: left sidebar 264 px (collapsible to a 72 px icon rail), 64 px top bar, content max-width 1440 px, 12-column grid.
- Top bar: institution switcher, branch switcher (shows Boys/Girls/Mixed tag), academic session, global search / command palette (Ctrl+K: students, staff, invoices, receipts, pages), language toggle (বাং/EN), notifications, profile.
- Sidebar groups: Overview · Academic · Finance · Administration · Welfare · Communication · Management. Show only what the role can access.
- Mobile: bottom navigation with 4–5 role-specific tabs (e.g. teacher: আজ, হাজিরা, সবক, হোমওয়ার্ক, আরও), compact top bar with branch/session and search. No horizontal page scroll at 360 px; wide tables scroll inside their own container or turn into cards.

### 5. Core components (design every state)

KPI card (value, comparison, time range, "last updated", skeleton) · Data table (sticky header, column chooser, sortable, filter chips, saved views, row selection with bulk-action bar, pagination, density toggle, card view on mobile) · Status badge (Draft, Submitted, Pending approval, Approved, Locked, Published, Paid, Partial, Overdue, Present, Late, Absent, Leave, Unmarked) · Workflow stepper · Approval card (what, who requested, money/student impact, attachments, Approve / Send back with reason) · Profile header + tab bar · Attendance grid · Sabak (Hifz lesson) entry row · 30-Para progress grid · Audio recorder/player with waveform and upload progress · Fee collection panel · Form sections with inline validation and sticky save bar · File upload with camera option · Print preview · Toasts · Confirm dialog showing affected count · Empty / loading / error / offline / no-permission states.

Every form shows its save state: "সংরক্ষিত ১০:৪২" · "সংরক্ষণ হচ্ছে…" · "সংযোগ নেই — ড্রাফট ফোনে আছে".

### 6. Privacy is a first-class visual state

- Girls' branch photos may be disabled by policy: use a dignified initials avatar (soft primary background, Bengali initials) everywhere — this is a normal state, not an error.
- Fields the viewer is not allowed to see appear masked with a small lock icon and the label "সীমিত তথ্য". Restricted tabs simply do not appear.
- Phone numbers of guardians are not shown in full to teachers; show a "কল করুন" button instead.
- Medical information shows only a small "চিকিৎসা সতর্কতা" flag on the profile header; details live in a restricted tab.

### 7. Content and sample data

- Use realistic Bengali sample data, never lorem ipsum: names like মোহাম্মদ আব্দুল্লাহ আল মামুন, আয়েশা সিদ্দিকা, উম্মে হাবিবা, মাওলানা আব্দুর রহিম; classes like নূরানী ১ম, হিফজ বিভাগ, মিজান, নাহবেমীর, হেদায়াতুন্নাহু; halaqas named after the teacher.
- Include edge cases: very long names, student without photo, zero dues, large dues, 0 marks vs absent vs not entered, a sponsored (লিল্লাহ/যাকাত) student.
- Microcopy: simple, respectful Bengali, never blaming ("এই শিক্ষার্থীর হাজিরা দেওয়া হয়নি", not "আপনি ভুল করেছেন"). Islamic greetings only where natural (e.g. login: "আসসালামু আলাইকুম").

### 8. Quality bar

- WCAG 2.2 AA contrast; touch targets ≥ 44 × 44 px; visible focus rings; every input labelled; full keyboard flow for marks entry and fee collection.
- Teacher attendance for a 40-student class must be completable in under 30 seconds on a phone; Hifz lesson entry under 10 seconds per student.
- Destructive or bulk actions always preview impact first, then confirm, then show a result summary.
- Before finishing any screen, check: alignment on the 4 px grid, consistent badge usage, Bengali text not clipped, Arabic rendered RTL, 360 px mobile version works, all states designed.

### 9. Output

For each screen I request: desktop (1440 px) and mobile (360 px) versions, the key states, and a short note listing components used and any assumptions. Build reusable components first; keep tokens as variables (CSS variables / design variables) so the dark theme is a token swap.

Confirm you understand, then wait for my first screen request.

---

## PART B — Screen-by-screen prompts (send one at a time)

**B1 · Design system page**
Build the token sheet and component library from Part A, sections 3 and 5: colours (light + dark), type scale with Bengali, English and Arabic samples, spacing, radius, icons, and every component in all states (default, hover, focus, disabled, loading, error, empty). Include all status badges.

**B2 · Login and institution picker (S01)**
Phone OTP login and password + 2FA login, Bengali-first, subtle geometric pattern background, institution picker for users who belong to several madrasas. Mobile and desktop.

**B3 · Principal dashboard (S03)**
Greeting with Hijri and Gregorian date; branch and session filter. KPI cards: active students (boys/girls, residential split), today's attendance (Present/Late/Absent/Leave/Unmarked with pending registers past the morning cutoff), today's collection (fees, fund allocation, donations separated), dues with ageing (0–30, 31–60, 60+), fund balances (Zakat, Lillah, Orphan, General, Construction), Hifz progress vs target, homework status, approvals waiting (with age and priority), upcoming events. Every card has a "last updated" label and opens a detail list. Show the loading-skeleton and the no-data state too.

**B4 · Teacher "Today" screen and attendance register (S04, S12) — mobile first**
Today's classes/halaqas as cards with a countdown to the attendance cutoff. Attendance register: student list with photo-or-initials avatar, one-tap Present/Late/Absent/Leave toggles, a "সবাই উপস্থিত" shortcut, unmarked students highlighted, a summary sheet before submit, and offline/draft states.

**B5 · Hifz halaqa lesson entry and progress (S14, S15)**
One screen for a whole halaqa. Each row: student, auto-suggested next range (Para / Surah / page steppers) for Sabak, Sabaki and Amukta in three compact segments, quality rating (3–5 steps), mistake-type chips, optional note. Student detail: 30-Para grid (memorised, in progress, weak, not started — colour + pattern), target vs actual chart, Khatam celebration state in gold. Hifz Head view: halaqa comparison, students falling behind, students close to Khatam.

**B6 · Student list and full student profile (S07, S08)**
List: search, filter chips (branch, class, section, halaqa, status, gender, residential, sponsored, has dues), saved views, bulk-action bar. Profile header: photo or initials, Bengali name large with English and Arabic names below, student ID with copy button, chips (class, section, halaqa, roll, branch, status, residential, sponsored, medical flag), four key numbers (attendance %, dues ৳, Hifz progress, last result), quick actions. Tabs: সারসংক্ষেপ, ব্যক্তিগত তথ্য, অভিভাবক ও যোগাযোগ, ভর্তি ও শিক্ষা ইতিহাস, হাজিরা (calendar heatmap), কুরআন ও হিফজ, পড়াশোনা ও হোমওয়ার্ক, পরীক্ষা ও ফলাফল, ফি ও পেমেন্ট, আবাসন, স্বাস্থ্য ও কল্যাণ (restricted), নথি ও সনদ, যোগাযোগ লগ, অডিট. Show the same profile as seen by a male teacher without girls'-section permission (masked fields, hidden tabs).

**B7 · Staff list and teacher profile (S11)**
Header with designation, employment type and status; key numbers (weekly class load, attendance this month, leave balance, pending tasks). Tabs: সারসংক্ষেপ, ব্যক্তিগত তথ্য, যোগ্যতা ও সনদ (Dawrah/Takmil, Hafiz, Qari, Ifta, Alia, general degrees, ijazah), চাকরি তথ্য, শিক্ষাদান দায়িত্ব (assignments with effective dates + weekly routine), হাজিরা ও ছুটি, বেতন (restricted), কাজ ও মূল্যায়ন, নথি, সিস্টেম অ্যাক্সেস (roles, 2FA, sessions).

**B8 · Admission pipeline (S05, S06)**
Enquiry kanban (New, Contacted, Visit scheduled, Converted, Lost) with follow-up dates; application review screen with document checklist, interview/Hifz-level result, seat capacity by branch and gender, duplicate-candidate warning, approve/waitlist/reject with reason, and the auto-created admission-fee invoice shown on approval.

**B9 · Fee collection desk and receipt (S20)**
Search student → outstanding invoices with ageing → allocate amount → method (cash, bKash/Nagad reference, bank, fund allocation) → change calculation → receipt preview in A4 and 80 mm thermal formats with institution header, serial and QR. Show the sponsored-student case where part of the invoice is "ফান্ড থেকে পরিশোধিত". Fully keyboard operable.

**B10 · Sponsorship and fund allocation approval (S21, S22)**
Finance Lead inbox: pending allocations with fund, student, fee head, amount, eligibility proof (restricted), fund balance before/after; insufficient-fund state. Fund statement view: income, allocations, expenses, balance per fund.

**B11 · Homework (S16, S27)**
Teacher: create homework (audience, due date, attachment, submission type: text, file, audio, offline in-class check), check list with filters (submitted, late, not submitted), audio playback with feedback. Guardian mobile: homework list per child, record and submit recitation audio with timer, size limit and upload progress, retry on failure.

**B12 · Marks entry and result publishing (S17, S18)**
Spreadsheet-style marks grid with keyboard navigation, range validation, distinct states for 0 / absent / exempt / not entered, autosave status, missing-entry counter. Result review: discrepancy report, preview, lock, publish with version history.

**B13 · Guardian portal home (S26)**
Mobile. Child switcher at top (avatars), today's attendance and Sabak, homework due, latest result, dues with "পরিশোধ করুন" / office payment instructions, notices with acknowledgement. Must feel simple enough for a first-time smartphone user.

**B14 · Question bank and paper builder (S33)**
Question bank table (class, subject, chapter, type, marks, language, difficulty, status), Arabic questions rendered RTL with harakat, paper builder with running marks total vs required, Set A/B, lock workflow, print preview of a bilingual Bengali/Arabic A4 paper, and the print-window restriction state.

**B15 · Settings and permissions (S30)**
Institution profile, branches with Boys/Girls/Mixed type, photo policy per branch, attendance cutoff per shift, fund eligible-use rules, role templates with a permission matrix (module × action), girls'-section access toggle with an explanation of what it reveals.

**B16 · System states pack**
Empty, loading skeleton, error, offline, no-permission, subscription grace banner and limited-mode banner — each with a short Bengali message and a clear next action.
