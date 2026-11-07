import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  Clock3,
  Copy,
  Download,
  EyeOff,
  FileText,
  Filter,
  HeartPulse,
  HeartHandshake,
  Info,
  LayoutDashboard,
  LoaderCircle,
  LockKeyhole,
  Mic,
  MoreHorizontal,
  NotebookPen,
  PanelLeftClose,
  PanelLeftOpen,
  Phone,
  Play,
  Plus,
  Printer,
  RefreshCw,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  UploadCloud,
  UserRound,
  Users,
  WifiOff,
  WalletCards,
  MessageSquareText,
  GraduationCap,
  X,
} from "lucide-react";
import "./design-system.css";

const colors = [
  ["Primary", "#0F6B4A", "#3FA57D"],
  ["Primary soft", "#E7F0EC", "#173328"],
  ["Accent", "#B8862B", "#D9AE5C"],
  ["Background", "#FAF8F3", "#121614"],
  ["Surface", "#FFFFFF", "#1A201D"],
  ["Border", "#E4E0D6", "#2C3430"],
  ["Text", "#1C2420", "#ECEFED"],
  ["Text muted", "#5F6B65", "#9AA59F"],
  ["Success", "#1E8E5A", "#36B878"],
  ["Warning", "#C77700", "#E49A26"],
  ["Danger", "#C2413A", "#EB6A63"],
  ["Info", "#2F6FB0", "#69A2DD"],
];

const statuses = [
  ["Draft", "খসড়া", "neutral", CircleDashed],
  ["Submitted", "জমা হয়েছে", "info", CheckCircle2],
  ["Pending approval", "অনুমোদন বাকি", "warning", Clock3],
  ["Approved", "অনুমোদিত", "success", Check],
  ["Locked", "লক করা", "neutral", LockKeyhole],
  ["Published", "প্রকাশিত", "success", CheckCircle2],
  ["Paid", "পরিশোধিত", "success", Check],
  ["Partial", "আংশিক", "warning", Clock3],
  ["Overdue", "বকেয়া", "danger", AlertCircle],
  ["Present", "উপস্থিত", "success", Check],
  ["Late", "বিলম্ব", "warning", Clock3],
  ["Absent", "অনুপস্থিত", "danger", X],
  ["Leave", "ছুটি", "info", Info],
  ["Unmarked", "হাজিরা দেওয়া হয়নি", "neutral", CircleDashed],
];

const iconSamples = [
  ["শিক্ষার্থী", UserRound],
  ["হিফজ", BookOpen],
  ["পেমেন্ট", FileText],
  ["সতর্কতা", AlertCircle],
  ["প্রিন্ট", Printer],
  ["আপলোড", UploadCloud],
  ["সুরক্ষা", LockKeyhole],
  ["আরও", MoreHorizontal],
];

const shellGroups = [
  ["Overview", "ওভারভিউ", LayoutDashboard],
  ["Academic", "একাডেমিক", GraduationCap],
  ["Finance", "অর্থ ও হিসাব", WalletCards],
  ["Administration", "প্রশাসন", Building2],
  ["Welfare", "কল্যাণ", HeartHandshake],
  ["Communication", "যোগাযোগ", MessageSquareText],
  ["Management", "ব্যবস্থাপনা", BarChart3],
];

function StatusBadge({
  label,
  tone,
  icon: Icon,
}: {
  label: string;
  tone: string;
  icon: typeof Check;
}) {
  return (
    <span className={`ds-badge ${tone}`}>
      <Icon size={13} strokeWidth={1.8} />
      {label}
    </span>
  );
}

function ThemePreview({ dark = false }: { dark?: boolean }) {
  return (
    <article className="ds-theme-preview" data-theme={dark ? "dark" : "light"}>
      <div className="ds-preview-head">
        <div>
          <span>{dark ? "DARK THEME" : "LIGHT THEME"}</span>
          <h3>{dark ? "রাতের ইন্টারফেস" : "দিনের ইন্টারফেস"}</h3>
        </div>
        <div className="ds-theme-dot" />
      </div>
      <div className="ds-mini-kpi">
        <div>
          <small>আজকের উপস্থিতি</small>
          <strong>৯২.৬%</strong>
          <p>সর্বশেষ আপডেট ১০:৪২</p>
        </div>
        <StatusBadge label="চূড়ান্ত" tone="success" icon={CheckCircle2} />
      </div>
      <div className="ds-mini-row">
        <span className="ds-avatar">মআ</span>
        <div>
          <b>মোহাম্মদ আব্দুল্লাহ আল মামুন</b>
          <small>STU-10241 · হিফজ বিভাগ</small>
        </div>
        <ChevronRight size={16} />
      </div>
      <div className="ds-preview-actions">
        <button className="ds-button primary">প্রোফাইল দেখুন</button>
        <button className="ds-button secondary">হাজিরা</button>
      </div>
    </article>
  );
}

function SectionTitle({ index, title, note }: { index: string; title: string; note: string }) {
  return (
    <div className="ds-section-title">
      <span>{index}</span>
      <div>
        <h2>{title}</h2>
        <p>{note}</p>
      </div>
    </div>
  );
}

export default function DesignSystemPage({ onClose }: { onClose?: () => void }) {
  return (
    <div className="ds-page">
      <header className="ds-topbar">
        <div className="ds-wordmark">
          <span>HQ</span>
          <div>
            <b>হলি কুরআন স্কুল এন্ড মাদরাসা</b>
            <small>PRODUCT DESIGN SYSTEM · v1.0</small>
          </div>
        </div>
        <div className="ds-top-actions">
          <span className="ds-spec-label">WCAG 2.2 AA</span>
          <span className="ds-spec-label">4 PX GRID</span>
          {onClose && (
            <button className="ds-back" onClick={onClose}>
              <ArrowLeft size={15} /> প্রোডাক্টে ফিরুন
            </button>
          )}
        </div>
      </header>

      <main className="ds-main">
        <section className="ds-intro">
          <div>
            <span className="ds-kicker">FOUNDATIONS & COMPONENTS</span>
            <h1>শান্ত, মর্যাদাপূর্ণ ও আধুনিক</h1>
            <p>
              বাংলাদেশের মাদরাসার জন্য Bengali-first interface system। প্রতিটি component কম ক্ষমতার মোবাইল,
              keyboard navigation এবং সংবেদনশীল তথ্যের privacy মাথায় রেখে তৈরি।
            </p>
          </div>
          <div className="ds-intro-meta">
            <div>
              <b>১৫ px</b>
              <span>সর্বনিম্ন বাংলা body</span>
            </div>
            <div>
              <b>৪৪ px</b>
              <span>সর্বনিম্ন touch target</span>
            </div>
            <div>
              <b>২টি</b>
              <span>token-swap theme</span>
            </div>
          </div>
        </section>

        <section className="ds-section">
          <SectionTitle
            index="01"
            title="রঙ ও Theme"
            note="Light এবং dark একই semantic token ব্যবহার করে; component markup বদলায় না।"
          />
          <div className="ds-token-themes">
            <div className="ds-color-sheet">
              <div className="ds-color-head">
                <span>Token</span>
                <span>Light</span>
                <span>Dark</span>
              </div>
              {colors.map(([name, light, dark]) => (
                <div className="ds-color-row" key={name}>
                  <b>{name}</b>
                  <div>
                    <i style={{ background: light }} />
                    <code>{light}</code>
                  </div>
                  <div>
                    <i style={{ background: dark }} />
                    <code>{dark}</code>
                  </div>
                </div>
              ))}
            </div>
            <div className="ds-theme-pair">
              <ThemePreview />
              <ThemePreview dark />
            </div>
          </div>
        </section>

        <section className="ds-section">
          <SectionTitle
            index="02"
            title="Typography"
            note="বাংলা body কখনো ১৫px-এর নিচে নয়; আরবি content Bengali interface-এর ভেতরেও RTL।"
          />
          <div className="ds-type-grid">
            <article className="ds-spec-card ds-bengali-type">
              <span className="ds-card-label">BENGALI · HIND SILIGURI</span>
              <div className="type-row display">
                <small>30 / 42</small>
                <p>মোহাম্মদ আব্দুল্লাহ আল মামুন</p>
              </div>
              <div className="type-row heading">
                <small>24 / 36</small>
                <p>আজকের হাজিরা ও পড়াশোনার সারাংশ</p>
              </div>
              <div className="type-row body">
                <small>16 / 28</small>
                <p>এই শিক্ষার্থীর হাজিরা এখনো দেওয়া হয়নি। জমা দেওয়ার আগে তালিকাটি দেখুন।</p>
              </div>
              <div className="type-row caption">
                <small>15 / 24</small>
                <p>সর্বশেষ সংরক্ষিত আজ সকাল ১০:৪২</p>
              </div>
            </article>
            <article className="ds-spec-card">
              <span className="ds-card-label">LATIN & NUMERALS · INTER</span>
              <div className="latin-sample">
                <b>Student ID</b>
                <strong>STU-10241</strong>
                <p>Receipt RC-2026-01842 · +880 1712-345678</p>
              </div>
              <div className="number-samples">
                <div>
                  <small>বাংলা সংখ্যা</small>
                  <b>৳ ১২,৩৪,৫৬৭</b>
                </div>
                <div>
                  <small>ID ও ফোন</small>
                  <b>INV-2026-1842</b>
                </div>
              </div>
            </article>
            <article className="ds-spec-card ds-arabic-card">
              <span className="ds-card-label">ARABIC · NOTO NASKH / AMIRI QURAN</span>
              <p className="arabic-name" dir="rtl">
                عَائِشَةُ الصِّدِّيقَة
              </p>
              <div className="quran-sample">
                <span>কুরআনের নমুনা · সূরা আল-ফাতিহা</span>
                <p dir="rtl" lang="ar">
                  ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ
                </p>
                <small>সমস্ত প্রশংসা আল্লাহর জন্য, যিনি সকল জগতের প্রতিপালক।</small>
              </div>
            </article>
          </div>
        </section>

        <section className="ds-section">
          <SectionTitle
            index="03"
            title="Spacing, Radius ও Icons"
            note="৪px base grid, restrained radius এবং একমাত্র Lucide outline icon family।"
          />
          <div className="ds-foundation-grid">
            <article className="ds-spec-card">
              <span className="ds-card-label">SPACING · 4 PX BASE</span>
              <div className="spacing-list">
                {[4, 8, 12, 16, 24, 32, 48].map((space) => (
                  <div key={space}>
                    <code>{space}</code>
                    <i style={{ width: `${space * 2}px` }} />
                  </div>
                ))}
              </div>
            </article>
            <article className="ds-spec-card">
              <span className="ds-card-label">RADIUS</span>
              <div className="radius-list">
                <div>
                  <i className="r8" />
                  <span>8 · Input</span>
                </div>
                <div>
                  <i className="r12" />
                  <span>12 · Card</span>
                </div>
                <div>
                  <i className="r16" />
                  <span>16 · Modal</span>
                </div>
              </div>
            </article>
            <article className="ds-spec-card">
              <span className="ds-card-label">ICONS · LUCIDE 1.5 PX</span>
              <div className="icon-grid">
                {iconSamples.map(([label, Icon]) => (
                  <div key={label as string}>
                    <Icon size={20} strokeWidth={1.5} />
                    <span>{label as string}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="ds-section">
          <SectionTitle
            index="04"
            title="Status badges"
            note="Status কখনো শুধু রঙ দিয়ে বোঝানো হয় না—icon, text ও colour একসঙ্গে ব্যবহৃত।"
          />
          <div className="ds-badge-board">
            {statuses.map(([english, bengali, tone, Icon]) => (
              <div key={english as string}>
                <StatusBadge
                  label={bengali as string}
                  tone={tone as string}
                  icon={Icon as typeof Check}
                />
                <small>{english as string}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="ds-section">
          <SectionTitle
            index="05"
            title="Actions ও Form controls"
            note="Default, hover, focus, disabled, loading, validation এবং offline save state।"
          />
          <div className="ds-component-grid two">
            <article className="ds-spec-card">
              <span className="ds-card-label">BUTTONS</span>
              <div className="button-showcase">
                <div>
                  <small>Default</small>
                  <button className="ds-button primary">সংরক্ষণ করুন</button>
                </div>
                <div>
                  <small>Hover</small>
                  <button className="ds-button primary hover-state">সংরক্ষণ করুন</button>
                </div>
                <div>
                  <small>Focus</small>
                  <button className="ds-button primary focus-state">সংরক্ষণ করুন</button>
                </div>
                <div>
                  <small>Disabled</small>
                  <button className="ds-button primary" disabled>
                    সংরক্ষণ করুন
                  </button>
                </div>
                <div>
                  <small>Loading</small>
                  <button className="ds-button primary">
                    <LoaderCircle size={15} className="spin" /> সংরক্ষণ হচ্ছে
                  </button>
                </div>
                <div>
                  <small>Danger</small>
                  <button className="ds-button danger">রেকর্ড বাতিল</button>
                </div>
              </div>
            </article>
            <article className="ds-spec-card">
              <span className="ds-card-label">INPUTS & SAVE STATES</span>
              <div className="input-showcase">
                <label>
                  শিক্ষার্থীর নাম
                  <input value="মোহাম্মদ আব্দুল্লাহ আল মামুন" readOnly />
                  <small>সংরক্ষিত ১০:৪২</small>
                </label>
                <label className="focus-demo">
                  জামাত
                  <div className="select-demo">
                    হিফজ বিভাগ <ChevronDown size={15} />
                  </div>
                </label>
                <label className="error">
                  অভিভাবকের ফোন
                  <input value="01712" readOnly />
                  <small>
                    <AlertCircle size={13} /> সম্পূর্ণ ফোন নম্বর লিখুন
                  </small>
                </label>
                <label className="disabled">
                  শিক্ষার্থী ID
                  <input value="STU-10241" disabled readOnly />
                </label>
                <div className="save-states">
                  <span>
                    <Check size={13} /> সংরক্ষিত ১০:৪২
                  </span>
                  <span>
                    <LoaderCircle size={13} className="spin" /> সংরক্ষণ হচ্ছে…
                  </span>
                  <span className="offline">
                    <WifiOff size={13} /> সংযোগ নেই — ড্রাফট ফোনে আছে
                  </span>
                </div>
              </div>
            </article>
          </div>
          <article className="ds-form-section">
            <div className="ds-form-heading">
              <div>
                <span className="ds-card-label">FORM SECTION · INLINE VALIDATION</span>
                <h3>শিক্ষার্থীর পরিচয় ও ভর্তি তথ্য</h3>
                <p>প্রয়োজনীয় তথ্যগুলো পূরণ করুন। তারকা চিহ্নিত ঘর বাধ্যতামূলক।</p>
              </div>
              <StatusBadge label="খসড়া" tone="neutral" icon={CircleDashed} />
            </div>
            <div className="ds-form-fields">
              <label>
                শিক্ষার্থীর বাংলা নাম <i>*</i>
                <input defaultValue="মোহাম্মদ আব্দুল্লাহ আল মামুন" />
                <small className="valid">
                  <Check size={13} /> নামটি গ্রহণযোগ্য
                </small>
              </label>
              <label>
                Student ID
                <input defaultValue="STU-10241" />
                <small>ইংরেজি অক্ষর ও সংখ্যা ব্যবহার করুন</small>
              </label>
              <label className="has-error">
                জন্মতারিখ <i>*</i>
                <input placeholder="দিন / মাস / বছর" />
                <small>
                  <AlertCircle size={13} /> জন্মতারিখ লিখুন
                </small>
              </label>
              <label>
                শাখা <i>*</i>
                <div className="select-demo">
                  বালক শাখা <ChevronDown size={15} />
                </div>
              </label>
              <label className="full">
                বিশেষ নির্দেশনা
                <textarea defaultValue="শিক্ষার্থীটি লিল্লাহ সহায়তার আওতায় আছে।" rows={3} />
                <small>এই তথ্য শুধু অনুমোদিত দায়িত্বপ্রাপ্তরা দেখতে পারবেন</small>
              </label>
            </div>
            <div className="ds-sticky-savebar">
              <span>
                <Check size={14} /> সংরক্ষিত ১০:৪২
              </span>
              <div>
                <button>বাতিল</button>
                <button>পরিবর্তন সংরক্ষণ</button>
              </div>
            </div>
            <div className="ds-savebar-states">
              <div className="saved">
                <Check size={14} /> সংরক্ষিত ১০:৪২
              </div>
              <div className="saving">
                <LoaderCircle size={14} className="spin" /> সংরক্ষণ হচ্ছে…
              </div>
              <div className="offline">
                <WifiOff size={14} /> সংযোগ নেই — ড্রাফট ফোনে আছে
              </div>
            </div>
          </article>
        </section>

        <section className="ds-section">
          <SectionTitle
            index="06"
            title="Privacy ও Profile"
            note="Girls’ branch photo policy, masked fields, guardian contact ও restricted medical data।"
          />
          <article className="ds-profile-card">
            <div className="ds-profile-main">
              <span className="ds-avatar large">আস</span>
              <div>
                <div className="profile-name-line">
                  <h3>আয়েশা সিদ্দিকা</h3>
                  <StatusBadge label="সক্রিয়" tone="success" icon={CheckCircle2} />
                  <span className="medical-flag">
                    <HeartPulse size={14} /> চিকিৎসা সতর্কতা
                  </span>
                </div>
                <p>STU-10482 · নূরানী ১ম · বালিকা শাখা</p>
                <small>ছবি প্রদর্শন প্রতিষ্ঠানটির privacy policy অনুযায়ী বন্ধ</small>
              </div>
            </div>
            <div className="privacy-fields">
              <div>
                <small>অভিভাবকের ফোন</small>
                <b>01••• ••••78</b>
                <button>
                  <Phone size={14} /> কল করুন
                </button>
              </div>
              <div className="masked-field">
                <small>ব্যক্তিগত ঠিকানা</small>
                <b>
                  <LockKeyhole size={14} /> সীমিত তথ্য
                </b>
                <span>এই ভূমিকার অনুমতি নেই</span>
              </div>
              <div>
                <small>আবাসিক অবস্থা</small>
                <b>অনাবাসিক</b>
                <span>বালিকা শাখা</span>
              </div>
            </div>
          </article>
        </section>

        <section className="ds-section">
          <SectionTitle
            index="07"
            title="KPI, Table ও Workflow"
            note="Data-heavy screens-এর reusable patterns, loading ও empty state-সহ।"
          />
          <div className="ds-kpi-grid">
            <article className="ds-kpi-card">
              <div>
                <span>সক্রিয় শিক্ষার্থী</span>
                <MoreHorizontal size={18} />
              </div>
              <strong>১,২৪৮</strong>
              <p>
                <span>↑ ২.৪%</span> গত মাস থেকে
              </p>
              <small>আপডেট ২ মিনিট আগে</small>
            </article>
            <article className="ds-kpi-card loading">
              <div className="skeleton s1" />
              <div className="skeleton s2" />
              <div className="skeleton s3" />
            </article>
            <article className="ds-kpi-card empty">
              <CircleDashed size={22} />
              <b>এই সময়ে কোনো তথ্য নেই</b>
              <p>অন্য শাখা বা সময়সীমা বেছে দেখুন</p>
            </article>
          </div>

          <article className="ds-table-card">
            <div className="ds-table-top">
              <div>
                <h3>শিক্ষার্থী তালিকা</h3>
                <p>১,২৪৮ জন সক্রিয় শিক্ষার্থী</p>
              </div>
              <div>
                <button>
                  <SlidersHorizontal size={15} /> কলাম
                </button>
                <button>
                  <Download size={15} /> এক্সপোর্ট
                </button>
                <button className="primary">
                  <Plus size={15} /> শিক্ষার্থী যোগ করুন
                </button>
              </div>
            </div>
            <div className="ds-table-tools">
              <label>
                <Search size={15} /> <input placeholder="নাম বা Student ID" />
              </label>
              <button className="filter-chip">
                প্রধান শাখা <X size={12} />
              </button>
              <button className="filter-chip">
                হিফজ বিভাগ <X size={12} />
              </button>
              <button className="filter-add">
                <Filter size={14} /> ফিল্টার
              </button>
            </div>
            <div className="ds-bulk-bar">
              <span>২ জন নির্বাচিত</span>
              <button>ক্লাস পরিবর্তন</button>
              <button>নোটিশ পাঠান</button>
              <button>নির্বাচন বাতিল</button>
            </div>
            <div className="ds-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>
                      <input type="checkbox" aria-label="সব নির্বাচন" />
                    </th>
                    <th>শিক্ষার্থী</th>
                    <th>ক্লাস ও হালাকা</th>
                    <th>হাজিরা</th>
                    <th>বকেয়া</th>
                    <th>অবস্থা</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {[
                    [
                      "মোহাম্মদ আব্দুল্লাহ আল মামুন",
                      "STU-10241",
                      "হিফজ · আব্দুর রহিম",
                      "৯৬%",
                      "৳ ০",
                      "সক্রিয়",
                    ],
                    [
                      "উম্মে হাবিবা বিনতে মোস্তাফিজ",
                      "STU-10482",
                      "নূরানী ১ম · ক",
                      "৮৮%",
                      "৳ ১২,৫০০",
                      "বকেয়া",
                    ],
                    ["আহমাদ ইবনে হাসান", "STU-10319", "নাহবেমীর · খ", "৯১%", "ফান্ড থেকে", "লিল্লাহ"],
                  ].map((row, index) => (
                    <tr key={row[1]}>
                      <td>
                        <input
                          type="checkbox"
                          defaultChecked={index < 2}
                          aria-label={`${row[0]} নির্বাচন`}
                        />
                      </td>
                      <td>
                        <div className="student-cell">
                          <span className="ds-avatar small">{row[0].slice(0, 2)}</span>
                          <div>
                            <b>{row[0]}</b>
                            <small>{row[1]}</small>
                          </div>
                        </div>
                      </td>
                      <td>{row[2]}</td>
                      <td>{row[3]}</td>
                      <td>{row[4]}</td>
                      <td>
                        <StatusBadge
                          label={row[5]}
                          tone={
                            row[5] === "বকেয়া" ? "danger" : row[5] === "লিল্লাহ" ? "info" : "success"
                          }
                          icon={row[5] === "বকেয়া" ? AlertCircle : CheckCircle2}
                        />
                      </td>
                      <td>
                        <MoreHorizontal size={18} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="ds-pagination">
              <span>১–২৫ / ১,২৪৮</span>
              <div>
                <button aria-label="আগের পৃষ্ঠা">
                  <ChevronLeft size={15} />
                </button>
                <button className="active">১</button>
                <button>২</button>
                <button>৩</button>
                <button aria-label="পরের পৃষ্ঠা">
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </article>

          <article className="ds-workflow-card">
            <div>
              <h3>ভর্তি Workflow</h3>
              <p>Application APP-2026-0142</p>
            </div>
            <div className="ds-stepper">
              {["খসড়া", "জমা হয়েছে", "পর্যালোচনা", "অনুমোদিত", "ভর্তি সম্পন্ন"].map((step, index) => (
                <div className={index < 3 ? "done" : index === 3 ? "current" : ""} key={step}>
                  <span>{index < 3 ? <Check size={14} /> : index + 1}</span>
                  <b>{step}</b>
                  {index < 4 && <i />}
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="ds-section">
          <SectionTitle
            index="08"
            title="Domain components"
            note="Approval, attendance, Hifz progress, audio, fee collection, upload ও print patterns।"
          />
          <div className="ds-domain-grid">
            <article className="ds-approval-card">
              <div className="approval-head">
                <StatusBadge label="উচ্চ অগ্রাধিকার" tone="danger" icon={AlertCircle} />
                <span>১৮ মিনিট আগে</span>
              </div>
              <h3>যাকাত ফান্ড থেকে ফি বরাদ্দ</h3>
              <p>উম্মে হাবিবা · নূরানী ১ম · নভেম্বর মাসের বেতন</p>
              <div className="approval-impact">
                <div>
                  <small>অনুরোধকৃত</small>
                  <b>৳ ৩,৫০০</b>
                </div>
                <div>
                  <small>ফান্ডে থাকবে</small>
                  <b>৳ ৮৬,৫০০</b>
                </div>
                <button>
                  <FileText size={14} /> ২টি প্রমাণ
                </button>
              </div>
              <div className="approval-actions">
                <button>কারণসহ ফেরত দিন</button>
                <button className="primary">
                  <Check size={15} /> অনুমোদন করুন
                </button>
              </div>
            </article>

            <article className="ds-attendance-card">
              <div className="component-head">
                <div>
                  <h3>দ্রুত হাজিরা</h3>
                  <p>হিফজ · আব্দুর রহিম হালাকা</p>
                </div>
                <button>সবাই উপস্থিত</button>
              </div>
              {["মোহাম্মদ আব্দুল্লাহ", "আহমাদ ইবনে হাসান", "মাহমুদুল হাসান"].map((name, index) => (
                <div className={`attendance-row ${index === 2 ? "unmarked" : ""}`} key={name}>
                  <span className="ds-avatar small">{name.slice(0, 2)}</span>
                  <b>{name}</b>
                  <div>
                    {["উপস্থিত", "বিলম্ব", "অনুপস্থিত", "ছুটি"].map((state, stateIndex) => (
                      <button
                        className={index < 2 && stateIndex === index ? "active" : ""}
                        key={state}
                      >
                        {state}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </article>

            <article className="ds-hifz-card">
              <div className="component-head">
                <div>
                  <h3>সবক এন্ট্রি</h3>
                  <p>মোহাম্মদ আব্দুল্লাহ · পারা ১২</p>
                </div>
                <StatusBadge label="লক্ষ্যে আছে" tone="success" icon={CheckCircle2} />
              </div>
              <div className="sabak-segments">
                <div>
                  <small>সবক</small>
                  <b>সূরা হুদ · ১–৮</b>
                </div>
                <div>
                  <small>সবকিয়া</small>
                  <b>পৃষ্ঠা ২২০–২২২</b>
                </div>
                <div>
                  <small>আমুক্তা</small>
                  <b>পারা ১০</b>
                </div>
              </div>
              <div className="para-grid" aria-label="৩০ পারার অগ্রগতি">
                {Array.from({ length: 30 }, (_, index) => (
                  <span
                    className={
                      index < 10 ? "complete" : index < 12 ? "progress" : index === 12 ? "weak" : ""
                    }
                    key={index}
                  >
                    {index + 1}
                  </span>
                ))}
              </div>
            </article>

            <article className="ds-audio-card">
              <div className="audio-head">
                <button>
                  <Play size={17} fill="currentColor" />
                </button>
                <div>
                  <b>তিলাওয়াত-আল-ফাতিহা.m4a</b>
                  <small>০১:২৪ · ১.৮ MB</small>
                </div>
                <button className="mic-button">
                  <Mic size={17} /> আবার রেকর্ড
                </button>
              </div>
              <div className="waveform">
                {Array.from({ length: 38 }, (_, index) => (
                  <i key={index} style={{ height: `${12 + ((index * 17) % 30)}px` }} />
                ))}
              </div>
              <div className="upload-progress">
                <span style={{ width: "68%" }} />
              </div>
              <small>আপলোড হচ্ছে ৬৮% · সংযোগ বিচ্ছিন্ন হলে আবার শুরু হবে</small>
            </article>

            <article className="ds-fee-card">
              <div className="component-head">
                <div>
                  <h3>ফি সংগ্রহ</h3>
                  <p>INV-2026-1842 · নভেম্বর</p>
                </div>
                <b className="fee-due">৳ ১২,৫০০</b>
              </div>
              <div className="fee-lines">
                <span>
                  মাসিক বেতন <b>৳ ৩,৫০০</b>
                </span>
                <span>
                  আবাসিক ফি <b>৳ ৯,০০০</b>
                </span>
                <span className="fund">
                  লিল্লাহ ফান্ড থেকে <b>− ৳ ৩,৫০০</b>
                </span>
              </div>
              <label>
                গ্রহণের পরিমাণ
                <input value="৳ ৯,০০০" readOnly />
              </label>
              <button className="ds-button primary">পেমেন্ট গ্রহণ ও রসিদ</button>
            </article>

            <article className="ds-upload-card">
              <UploadCloud size={28} />
              <h3>নথি আপলোড করুন</h3>
              <p>PDF, JPG অথবা PNG · সর্বোচ্চ ১০ MB</p>
              <div>
                <button>ফাইল বেছে নিন</button>
                <button>ক্যামেরা খুলুন</button>
              </div>
              <div className="uploaded-file">
                <FileText size={18} />
                <span>
                  <b>জন্ম-নিবন্ধন.pdf</b>
                  <small>১.২ MB · সম্পন্ন</small>
                </span>
                <CheckCircle2 size={17} />
              </div>
            </article>
          </div>

          <article className="ds-print-card">
            <div className="print-toolbar">
              <div>
                <h3>রসিদ Print preview</h3>
                <p>A4 · ১ পৃষ্ঠা · বাংলা glyph যাচাই করা হয়েছে</p>
              </div>
              <button>
                <Printer size={15} /> প্রিন্ট করুন
              </button>
            </div>
            <div className="print-sheet">
              <div className="print-brand">
                <div>
                  <b>হলি কুরআন স্কুল এন্ড মাদরাসা</b>
                  <small>প্রধান শাখা · ঢাকা</small>
                </div>
                <span>রসিদ</span>
              </div>
              <div className="print-row">
                <span>রসিদ নং</span>
                <b>RC-2026-01842</b>
                <span>তারিখ</span>
                <b>৭ নভেম্বর ২০২৬</b>
              </div>
              <div className="print-row">
                <span>শিক্ষার্থী</span>
                <b>মোহাম্মদ আব্দুল্লাহ</b>
                <span>মোট</span>
                <b>৳ ৯,০০০</b>
              </div>
            </div>
          </article>
        </section>

        <section className="ds-section">
          <SectionTitle
            index="09"
            title="Feedback ও System states"
            note="Toast, destructive confirm, loading, error, offline, empty এবং no-permission।"
          />
          <div className="ds-feedback-grid">
            <div className="ds-toast success">
              <CheckCircle2 size={18} />
              <div>
                <b>হাজিরা সংরক্ষিত হয়েছে</b>
                <span>৪০ জন শিক্ষার্থীর রেজিস্টার চূড়ান্ত</span>
              </div>
              <X size={15} />
            </div>
            <div className="ds-toast error">
              <AlertCircle size={18} />
              <div>
                <b>পেমেন্ট সংরক্ষণ হয়নি</b>
                <span>সংযোগ ফিরে এলে আবার চেষ্টা করুন</span>
              </div>
              <RefreshCw size={15} />
            </div>
            <article className="ds-confirm-card">
              <span>
                <ShieldAlert size={22} />
              </span>
              <h3>৪০ জনের হাজিরা চূড়ান্ত করবেন?</h3>
              <p>চূড়ান্ত করার পর সংশোধনের জন্য অনুমোদন লাগবে। ৩ জনের হাজিরা দেওয়া হয়নি।</p>
              <div>
                <button>তালিকায় ফিরুন</button>
                <button>চূড়ান্ত করুন</button>
              </div>
            </article>
          </div>
          <div className="ds-state-grid">
            {[
              [CircleDashed, "কোনো আবেদন নেই", "নতুন আবেদন এলে এখানে দেখা যাবে।", "নতুন আবেদন"],
              [LoaderCircle, "তথ্য লোড হচ্ছে", "শিক্ষার্থীদের তালিকা প্রস্তুত করা হচ্ছে।", ""],
              [AlertCircle, "তথ্য আনা যায়নি", "সমস্যাটি সাময়িক। আবার চেষ্টা করুন।", "আবার চেষ্টা করুন"],
              [WifiOff, "আপনি এখন offline", "ড্রাফট এই ফোনে আছে; সংযোগ এলে sync হবে।", "ড্রাফট দেখুন"],
              [
                EyeOff,
                "এই তথ্য দেখার অনুমতি নেই",
                "প্রয়োজনে প্রতিষ্ঠানের admin-এর সঙ্গে যোগাযোগ করুন।",
                "ফিরে যান",
              ],
            ].map(([Icon, title, text, action], index) => (
              <article className={`ds-state-card state-${index}`} key={title as string}>
                <span>
                  <Icon size={22} className={index === 1 ? "spin" : ""} />
                </span>
                <h3>{title as string}</h3>
                <p>{text as string}</p>
                {action && <button>{action as string}</button>}
              </article>
            ))}
          </div>
        </section>

        <section className="ds-section">
          <SectionTitle
            index="10"
            title="App shell"
            note="Desktop expanded ও collapsed sidebar, complete top bar এবং teacher-role mobile bottom navigation।"
          />
          <div className="ds-shell-label">
            <span>DESKTOP · EXPANDED SIDEBAR 264 PX</span>
            <span>TOP BAR 64 PX</span>
          </div>
          <article className="ds-shell-demo expanded">
            <aside className="shell-sidebar">
              <div className="shell-brand">
                <span>HQ</span>
                <div>
                  <b>হলি কুরআন</b>
                  <small>স্কুল এন্ড মাদরাসা</small>
                </div>
                <PanelLeftClose size={16} />
              </div>
              <nav>
                {shellGroups.map(([english, bengali, Icon], index) => (
                  <button className={index === 0 ? "active" : ""} key={english as string}>
                    <Icon size={18} strokeWidth={1.5} />
                    <span>{bengali as string}</span>
                    {index === 2 && <small>৪</small>}
                    <ChevronRight size={14} />
                  </button>
                ))}
              </nav>
              <div className="shell-user">
                <span className="ds-avatar small">সা</span>
                <div>
                  <b>Saifullah</b>
                  <small>পরিচালক</small>
                </div>
                <MoreHorizontal size={16} />
              </div>
            </aside>
            <div className="shell-body">
              <header className="shell-topbar">
                <button className="institution-switch">
                  <span>HQ</span>
                  <div>
                    <small>প্রতিষ্ঠান</small>
                    <b>হলি কুরআন স্কুল</b>
                  </div>
                  <ChevronDown size={14} />
                </button>
                <button className="shell-switch">
                  <div>
                    <small>শাখা</small>
                    <b>প্রধান শাখা</b>
                  </div>
                  <em>বালক</em>
                  <ChevronDown size={14} />
                </button>
                <button className="shell-switch">
                  <CalendarDays size={16} />
                  <div>
                    <small>শিক্ষাবর্ষ</small>
                    <b>২০২৬</b>
                  </div>
                  <ChevronDown size={14} />
                </button>
                <label className="shell-search">
                  <Search size={16} />
                  <input placeholder="শিক্ষার্থী, রসিদ বা পৃষ্ঠা খুঁজুন" />
                  <kbd>Ctrl+K</kbd>
                </label>
                <button className="language-toggle">
                  <b>বাং</b>
                  <span>EN</span>
                </button>
                <button className="notification-button" aria-label="নোটিফিকেশন">
                  <Bell size={17} />
                  <i />
                </button>
              </header>
              <div className="shell-canvas">
                <div className="shell-breadcrumb">ওভারভিউ / আজকের সারাংশ</div>
                <div className="shell-placeholder-title" />
                <div className="shell-placeholder-subtitle" />
                <div className="shell-placeholder-grid">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            </div>
          </article>
          <div className="ds-branch-tag-variants">
            <span>Branch type tag variants</span>
            <em className="boys">বালক</em>
            <em className="girls">বালিকা</em>
            <em className="mixed">মিশ্র</em>
          </div>

          <div className="ds-shell-secondary">
            <div>
              <div className="ds-shell-label">
                <span>DESKTOP · COLLAPSED SIDEBAR 72 PX</span>
              </div>
              <article className="ds-shell-demo collapsed">
                <aside className="shell-sidebar">
                  <div className="shell-brand">
                    <span>HQ</span>
                    <PanelLeftOpen size={16} />
                  </div>
                  <nav>
                    {shellGroups.map(([english, , Icon], index) => (
                      <button className={index === 0 ? "active" : ""} key={english as string}>
                        <Icon size={19} strokeWidth={1.5} />
                        {index === 2 && <small>৪</small>}
                      </button>
                    ))}
                  </nav>
                  <span className="ds-avatar small">সা</span>
                </aside>
                <div className="shell-canvas compact">
                  <div className="shell-placeholder-title" />
                  <div className="shell-placeholder-grid">
                    <i />
                    <i />
                  </div>
                </div>
              </article>
            </div>

            <div>
              <div className="ds-shell-label">
                <span>MOBILE · TEACHER ROLE · 360 PX</span>
              </div>
              <article className="teacher-mobile-shell">
                <header>
                  <div>
                    <small>প্রধান শাখা · ২০২৬</small>
                    <b>আজকের কাজ</b>
                  </div>
                  <button aria-label="খুঁজুন">
                    <Search size={17} />
                  </button>
                  <button aria-label="নোটিফিকেশন">
                    <Bell size={17} />
                  </button>
                </header>
                <main>
                  <p>আসসালামু আলাইকুম, মাওলানা আব্দুর রহিম</p>
                  <article>
                    <span>পরবর্তী ক্লাস</span>
                    <h4>হিফজ · আব্দুর রহিম হালাকা</h4>
                    <small>সকাল ৮:৩০ · ৩০ জন শিক্ষার্থী</small>
                    <button>হাজিরা শুরু করুন</button>
                  </article>
                  <div className="mobile-task-row">
                    <span>
                      <BookOpen size={17} />
                    </span>
                    <div>
                      <b>সবক এন্ট্রি</b>
                      <small>১২ জন বাকি</small>
                    </div>
                    <ChevronRight size={15} />
                  </div>
                </main>
                <nav>
                  {[
                    ["আজ", LayoutDashboard],
                    ["হাজিরা", CheckCircle2],
                    ["সবক", BookOpen],
                    ["হোমওয়ার্ক", NotebookPen],
                    ["আরও", MoreHorizontal],
                  ].map(([label, Icon], index) => (
                    <button className={index === 0 ? "active" : ""} key={label as string}>
                      <Icon size={20} strokeWidth={1.5} />
                      <span>{label as string}</span>
                    </button>
                  ))}
                </nav>
              </article>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
