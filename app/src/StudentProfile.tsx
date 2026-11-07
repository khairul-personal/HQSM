import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BedDouble,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clipboard,
  Copy,
  CreditCard,
  FileBadge,
  FileText,
  GraduationCap,
  HeartPulse,
  History,
  Home,
  IdCard,
  LoaderCircle,
  LockKeyhole,
  MessageSquareText,
  Phone,
  ReceiptText,
  RefreshCcw,
  School,
  ShieldAlert,
  Sparkles,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import {
  prototypeRoles,
  resolveStudentPermission,
  type PrototypeRole,
  type StudentPermission,
  type StudentTab,
} from "./student-permissions";
import "./student-profile.css";

export type ProfileStudent = {
  id: string;
  nameBn: string;
  nameEn: string;
  initials: string;
  branch: "প্রধান শাখা" | "মিরপুর শাখা";
  className: string;
  section: string;
  halaqa: string;
  roll: number;
  status: "সক্রিয়" | "ছুটিতে" | "স্থগিত";
  attendance: number;
  dues: number;
  gender: "বালক" | "বালিকা";
  residential: boolean;
  sponsored: boolean;
  medical: boolean;
  guardianPhone: string;
  avatarTone: string;
  restricted?: boolean;
  enrolledBy?: string;
};

type ProfileState = "ready" | "loading" | "partial-error" | "archived" | "transferred";

const bn = (value: number | string) =>
  String(value).replace(/\d/g, (digit) => "০১২৩৪৫৬৭৮৯"[Number(digit)]);

const formatMoney = (amount: number) => new Intl.NumberFormat("bn-BD").format(amount);

function MaskedValue({ label = "সীমিত তথ্য" }: { label?: string }) {
  return (
    <span className="profile-masked">
      <LockKeyhole size={14} /> {label}
    </span>
  );
}

function Panel({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="profile-panel">
      <header>
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function DataRows({ rows }: { rows: Array<[string, React.ReactNode, string?]> }) {
  return (
    <div className="profile-data-rows">
      {rows.map(([label, value, note]) => (
        <div key={label}>
          <span>{label}</span>
          <b>{value}</b>
          {note && <small>{note}</small>}
        </div>
      ))}
    </div>
  );
}

function OverviewTab({
  student,
  permission,
}: {
  student: ProfileStudent;
  permission: StudentPermission;
}) {
  return (
    <div className="profile-content-grid overview-grid">
      <Panel title="আজকের সারাংশ" description="সর্বশেষ একাডেমিক ও প্রশাসনিক আপডেট">
        <div className="timeline">
          {[
            [CheckCircle2, "আজ উপস্থিত", "সকাল ৭:৫৬ · প্রধান গেট", "success"],
            [BookOpen, "হিফজ এন্ট্রি সম্পন্ন", "পারা ১২ · পৃষ্ঠা ২৩১ · মান ৪.২/৫", "primary"],
            [FileBadge, "হোমওয়ার্ক জমা", "আরবি ব্যাকরণ · সময়মতো", "info"],
          ].map(([Icon, title, meta, tone]) => {
            const TimelineIcon = Icon as typeof CheckCircle2;
            return (
              <div className="timeline-row" key={String(title)}>
                <span className={String(tone)}>
                  <TimelineIcon size={16} />
                </span>
                <div>
                  <b>{String(title)}</b>
                  <small>{String(meta)}</small>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
      <Panel title="শিক্ষা অবস্থান" description="বর্তমান ভর্তি ও শ্রেণি বরাদ্দ">
        <DataRows
          rows={[
            ["শ্রেণি ও সেকশন", `${student.className} · ${student.section}`],
            ["হালাকা", student.halaqa],
            ["শিক্ষাবর্ষ", "২০২৫–২৬", "১ শাওয়াল ১৪৪৬ থেকে"],
            ["শ্রেণি শিক্ষক", "উস্তাদ মাহমুদ হাসান"],
          ]}
        />
      </Panel>
      <Panel
        title="অভিভাবক ও যোগাযোগ"
        description="প্রধান অভিভাবকের যাচাইকৃত তথ্য"
        action={
          <button className="profile-link-button">
            বিস্তারিত <ChevronLeft size={14} />
          </button>
        }
      >
        <div className="guardian-summary">
          <span className="ds-avatar">মর</span>
          <div>
            <b>মো. রফিকুল ইসলাম</b>
            <p>পিতা · প্রধান অভিভাবক</p>
            <span className="verified-label">
              <Check size={12} /> পরিচয় যাচাইকৃত
            </span>
          </div>
          {permission.fields.phone === "visible" ? (
            <button className="ds-button secondary">
              <Phone size={15} /> কল করুন
            </button>
          ) : (
            <MaskedValue />
          )}
        </div>
      </Panel>
      <Panel title="সতর্কতা ও নোট" description="শুধু অনুমোদিত কর্মীদের জন্য">
        <div className="notice-stack">
          {student.medical &&
            (permission.fields.health === "visible" ? (
              <div className="notice danger">
                <HeartPulse size={17} />
                <div>
                  <b>অ্যালার্জি সতর্কতা</b>
                  <p>পেনিসিলিন এড়াতে হবে · জরুরি পরিকল্পনা নথিভুক্ত</p>
                </div>
              </div>
            ) : (
              <div className="notice restricted">
                <ShieldAlert size={17} />
                <div>
                  <b>স্বাস্থ্য তথ্য সীমিত</b>
                  <p>এই ভূমিকার জন্য বিস্তারিত তথ্য প্রদর্শিত নয়</p>
                </div>
              </div>
            ))}
          {student.restricted && (
            <div className="notice warning">
              <ShieldAlert size={17} />
              <div>
                <b>Custody restriction</b>
                <p>শিক্ষার্থী হস্তান্তরের আগে অনুমোদিত অভিভাবক যাচাই করুন</p>
              </div>
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}

function PersonalTab({
  student,
  permission,
}: {
  student: ProfileStudent;
  permission: StudentPermission;
}) {
  return (
    <div className="profile-content-grid">
      <Panel title="পরিচয় তথ্য" description="অফিসিয়াল ভর্তি রেকর্ড">
        <DataRows
          rows={[
            ["বাংলা নাম", student.nameBn],
            ["ইংরেজি নাম", student.nameEn],
            ["আরবি নাম", <span dir="rtl">مُحَمَّد عَبْدُ الله</span>],
            ["জন্মতারিখ", "১২ জানুয়ারি ২০১৩", "বয়স ১৩ বছর ২ মাস"],
            ["লিঙ্গ", student.gender],
            ["রক্তের গ্রুপ", "B+"],
          ]}
        />
      </Panel>
      <Panel title="ঠিকানা ও নাগরিক তথ্য" description="সংবেদনশীল ব্যক্তিগত তথ্য">
        <DataRows
          rows={[
            [
              "বর্তমান ঠিকানা",
              permission.fields.address === "visible" ? (
                "বাড়ি ১৮, রোড ৪, মিরপুর, ঢাকা"
              ) : (
                <MaskedValue />
              ),
            ],
            [
              "স্থায়ী ঠিকানা",
              permission.fields.address === "visible" ? "গ্রাম গোপালপুর, কুমিল্লা" : <MaskedValue />,
            ],
            ["জন্ম নিবন্ধন", "২০১৩২৬৯২৫৪৭১৮৪২"],
            ["জাতীয়তা", "বাংলাদেশি"],
          ]}
        />
      </Panel>
    </div>
  );
}

function GuardiansTab({ permission }: { permission: StudentPermission }) {
  const contact = permission.fields.phone === "visible";
  return (
    <div className="profile-content-grid">
      <Panel title="প্রধান অভিভাবক" description="শিক্ষার্থী গ্রহণ ও জরুরি যোগাযোগে অগ্রাধিকার">
        <div className="guardian-card">
          <span className="ds-avatar large">মর</span>
          <div>
            <h3>মো. রফিকুল ইসলাম</h3>
            <p>পিতা · প্রধান অভিভাবক</p>
            <span className="verified-label">
              <Check size={12} /> NID ও সম্পর্ক যাচাইকৃত
            </span>
          </div>
          {contact ? (
            <button className="ds-button primary">
              <Phone size={15} /> কল করুন
            </button>
          ) : (
            <MaskedValue />
          )}
        </div>
        <DataRows
          rows={[
            ["ফোন", contact ? "কল করুন বাটন ব্যবহার করুন" : <MaskedValue />],
            ["ইমেইল", contact ? "rafiqul@example.com" : <MaskedValue />],
            ["পেশা", "ব্যবসা"],
            ["যোগাযোগের ভাষা", "বাংলা"],
          ]}
        />
      </Panel>
      <Panel title="অনুমোদিত যোগাযোগ" description="শিক্ষার্থী হস্তান্তরের অনুমতিপ্রাপ্ত ব্যক্তি">
        <div className="contact-list">
          {[
            ["সালমা আক্তার", "মাতা", "প্রধান"],
            ["মো. মাহবুব আলম", "মামা", "জরুরি"],
          ].map(([name, relation, tag]) => (
            <div key={name}>
              <span className="ds-avatar small">{name.slice(0, 2)}</span>
              <span>
                <b>{name}</b>
                <small>{relation}</small>
              </span>
              <em>{tag}</em>
              {contact ? (
                <button aria-label={`${name}-কে কল করুন`}>
                  <Phone size={15} />
                </button>
              ) : (
                <LockKeyhole size={15} />
              )}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

const attendanceDays = [
  "present",
  "present",
  "present",
  "late",
  "present",
  "off",
  "off",
  "present",
  "absent",
  "present",
  "present",
  "present",
  "off",
  "off",
  "present",
  "present",
  "leave",
  "present",
  "present",
  "off",
  "off",
  "present",
  "present",
  "present",
  "present",
  "late",
  "off",
  "off",
  "present",
  "present",
  "present",
];

function AttendanceTab() {
  return (
    <div className="profile-content-grid attendance-layout">
      <Panel
        title="মার্চ ২০২৬"
        description="দৈনিক হাজিরা · Asia/Dhaka"
        action={<button className="ds-button secondary">মাস পরিবর্তন</button>}
      >
        <div className="heatmap-weekdays">
          {["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="attendance-heatmap">
          {attendanceDays.map((status, index) => (
            <button className={status} key={index} title={`${bn(index + 1)} মার্চ`}>
              <b>{bn(index + 1)}</b>
              <small>
                {status === "present"
                  ? "উপস্থিত"
                  : status === "late"
                    ? "বিলম্ব"
                    : status === "absent"
                      ? "অনুপস্থিত"
                      : status === "leave"
                        ? "ছুটি"
                        : "বন্ধ"}
              </small>
            </button>
          ))}
        </div>
        <div className="heatmap-legend">
          <span className="present">উপস্থিত</span>
          <span className="late">বিলম্ব</span>
          <span className="absent">অনুপস্থিত</span>
          <span className="leave">ছুটি</span>
        </div>
      </Panel>
      <aside className="attendance-side">
        <Panel title="এই মাস" description="৩১ মার্চ পর্যন্ত">
          <div className="attendance-stats">
            <div>
              <b>৯৬%</b>
              <span>হাজিরা</span>
            </div>
            <div>
              <b>২২</b>
              <span>উপস্থিত</span>
            </div>
            <div>
              <b>১</b>
              <span>অনুপস্থিত</span>
            </div>
            <div>
              <b>২</b>
              <span>বিলম্ব</span>
            </div>
          </div>
        </Panel>
        <Panel title="সাম্প্রতিক ব্যতিক্রম">
          <div className="exception-list">
            <div>
              <i className="absent" />
              <span>
                <b>৯ মার্চ · অনুপস্থিত</b>
                <small>অভিভাবকের নোট নেই</small>
              </span>
            </div>
            <div>
              <i className="leave" />
              <span>
                <b>১৭ মার্চ · অনুমোদিত ছুটি</b>
                <small>চিকিৎসা সংক্রান্ত</small>
              </span>
            </div>
            <div>
              <i className="late" />
              <span>
                <b>২৬ মার্চ · ১৮ মিনিট বিলম্ব</b>
                <small>গেট স্ক্যান ৮:১৮</small>
              </span>
            </div>
          </div>
        </Panel>
      </aside>
    </div>
  );
}

function FeesTab({ student }: { student: ProfileStudent }) {
  return (
    <div className="profile-content-grid fee-layout">
      <Panel title="ফি সারাংশ" description="চলতি শিক্ষাবর্ষ">
        <div className="fee-summary">
          <div>
            <span>মোট ধার্য</span>
            <b>৳ ৪৮,০০০</b>
          </div>
          <div>
            <span>পরিশোধিত</span>
            <b>৳ ৪৫,৫০০</b>
          </div>
          <div className="due">
            <span>বর্তমান বকেয়া</span>
            <b>৳ {formatMoney(student.dues)}</b>
          </div>
          <div className="fund">
            <span>স্পন্সরশিপ</span>
            <b>৳ ১২,০০০</b>
            <small>ফান্ড থেকে পরিশোধিত</small>
          </div>
        </div>
      </Panel>
      <Panel
        title="ইনভয়েস ও রসিদ"
        description="সর্বশেষ লেনদেন"
        action={
          <button className="ds-button primary">
            <CreditCard size={15} /> ফি আদায়
          </button>
        }
      >
        <div className="fee-table">
          <div className="fee-table-head">
            <span>রেফারেন্স</span>
            <span>বিবরণ</span>
            <span>পরিমাণ</span>
            <span>অবস্থা</span>
            <span />
          </div>
          {[
            ["INV-2026-0318", "মার্চ মাসিক ফি", "৳ ২,৫০০", "বকেয়া"],
            ["RC-2026-01842", "ফেব্রুয়ারি মাসিক ফি", "৳ ২,৫০০", "পরিশোধিত"],
            ["FUND-2026-0041", "আবাসন সহায়তা", "৳ ৬,০০০", "ফান্ড থেকে পরিশোধিত"],
            ["RC-2026-01402", "জানুয়ারি মাসিক ফি", "৳ ২,৫০০", "পরিশোধিত"],
          ].map(([id, detail, amount, status]) => (
            <div key={id}>
              <code>{id}</code>
              <span>{detail}</span>
              <b>{amount}</b>
              <em
                className={status === "বকেয়া" ? "due" : status.startsWith("ফান্ড") ? "fund" : "paid"}
              >
                {status}
              </em>
              <button aria-label={`${id} দেখুন`}>
                <ReceiptText size={15} />
              </button>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="স্পন্সরশিপ ও ফান্ড বরাদ্দ" description="অনুমোদিত সহায়তার হিসাব">
        <div className="fund-card">
          <span>
            <Sparkles size={18} />
          </span>
          <div>
            <b>যাকাত শিক্ষা সহায়তা তহবিল</b>
            <p>এপ্রিল ২০২৫ – মার্চ ২০২৬ · ৫০% আবাসন সহায়তা</p>
          </div>
          <strong>
            ৳ ১২,০০০<small>ফান্ড থেকে পরিশোধিত</small>
          </strong>
        </div>
      </Panel>
    </div>
  );
}

function HifzTab() {
  const states = Array.from({ length: 30 }, (_, index) =>
    index < 10 ? "memorised" : index === 10 ? "weak" : index < 13 ? "progress" : "none",
  );
  return (
    <div className="profile-content-grid">
      <Panel title="৩০-পারা অগ্রগতি" description="B5 হিফজ ট্র্যাক · পুনঃমুখস্থ আলাদাভাবে গণনা">
        <div className="profile-para-grid">
          {states.map((state, index) => (
            <button className={state} key={index}>
              <b>{bn(index + 1)}</b>
              <small>
                {state === "memorised"
                  ? "মুখস্থ"
                  : state === "progress"
                    ? "চলছে"
                    : state === "weak"
                      ? "দুর্বল"
                      : "বাকি"}
              </small>
            </button>
          ))}
        </div>
      </Panel>
      <Panel title="সর্বশেষ সবক" description="আজ সকাল ১০:৩৮ · উস্তাদ সালমান">
        <DataRows
          rows={[
            ["নতুন সবক", "পারা ১২ · পৃষ্ঠা ২৩১ · লাইন ১–১৫"],
            ["সাবকি", "সূরা ইউসুফ · আয়াত ৫৩–৬৪"],
            ["মান", "৪.২ / ৫"],
            ["তাজবিদ", "মাখরাজে ১টি সংশোধন"],
          ]}
        />
      </Panel>
    </div>
  );
}

const lightTabContent: Partial<
  Record<
    StudentTab,
    {
      icon: typeof BookOpen;
      title: string;
      description: string;
      rows: Array<[string, string, string?]>;
    }
  >
> = {
  "ভর্তি ও শিক্ষা ইতিহাস": {
    icon: History,
    title: "ভর্তি ও শিক্ষা ইতিহাস",
    description: "প্রতিষ্ঠানে শিক্ষার্থীর সময়রেখা",
    rows: [
      ["২০২৫–২৬", "হিফজ · সেকশন ক", "সক্রিয়"],
      ["২০২৪–২৫", "নাজেরা · সেকশন খ", "উত্তীর্ণ"],
      ["২০২৩–২৪", "নূরানী · সেকশন ক", "ভর্তি"],
    ],
  },
  "পড়াশোনা ও হোমওয়ার্ক": {
    icon: BookOpen,
    title: "পড়াশোনা ও হোমওয়ার্ক",
    description: "চলতি সপ্তাহের কাজ",
    rows: [
      ["আরবি ব্যাকরণ", "সম্পন্ন", "আজ"],
      ["বাংলা", "১টি কাজ বাকি", "আগামীকাল"],
      ["দ্বীনিয়াত", "সম্পন্ন", "গতকাল"],
    ],
  },
  "পরীক্ষা ও ফলাফল": {
    icon: GraduationCap,
    title: "পরীক্ষা ও ফলাফল",
    description: "সর্বশেষ প্রকাশিত ফলাফল",
    rows: [
      ["অর্ধবার্ষিক ২০২৬", "৮৮% · A", "শ্রেণিতে ৪র্থ"],
      ["প্রথম সাময়িক", "৯১% · A+", "শ্রেণিতে ২য়"],
    ],
  },
  আবাসন: {
    icon: BedDouble,
    title: "আবাসন",
    description: "হোস্টেল ও কক্ষ বরাদ্দ",
    rows: [
      ["অবস্থা", "আবাসিক"],
      ["ভবন", "উমর ভবন"],
      ["কক্ষ", "২০৪ · বেড ৩"],
    ],
  },
  "স্বাস্থ্য ও কল্যাণ": {
    icon: HeartPulse,
    title: "স্বাস্থ্য ও কল্যাণ",
    description: "Restricted · অনুমোদিত ভূমিকা",
    rows: [
      ["রক্তের গ্রুপ", "B+"],
      ["অ্যালার্জি", "পেনিসিলিন"],
      ["সর্বশেষ চেকআপ", "১২ ফেব্রুয়ারি ২০২৬"],
    ],
  },
  "আমল ও মুহাসাবা": {
    icon: CheckCircle2,
    title: "আমল ও মুহাসাবা",
    description: "সাপ্তাহিক আত্মমূল্যায়ন",
    rows: [
      ["সালাত জামাতে", "৬/৭ দিন"],
      ["তিলাওয়াত", "৭/৭ দিন"],
      ["আচরণ নোট", "খুব ভালো"],
    ],
  },
  "নথি ও সনদ": {
    icon: FileText,
    title: "নথি ও সনদ",
    description: "ইস্যু করা ও সংরক্ষিত নথি",
    rows: [
      ["জন্ম নিবন্ধন", "যাচাইকৃত", "PDF"],
      ["ভর্তি প্রত্যয়ন", "ইস্যু ১৪ জানুয়ারি", "PDF"],
      ["ID Card", "মেয়াদ ডিসেম্বর ২০২৬", "Print"],
    ],
  },
  "যোগাযোগ লগ": {
    icon: MessageSquareText,
    title: "যোগাযোগ লগ",
    description: "অভিভাবকের সঙ্গে সর্বশেষ যোগাযোগ",
    rows: [
      ["আজ · ১১:৪২", "হাজিরা SMS পাঠানো", "Delivered"],
      ["৮ মার্চ", "শিক্ষকের ফোন কল", "৩ মিনিট"],
      ["২ মার্চ", "মাসিক রিপোর্ট", "Seen"],
    ],
  },
  অডিট: {
    icon: Clipboard,
    title: "অডিট",
    description: "প্রোফাইল পরিবর্তনের immutable লগ",
    rows: [
      ["আজ · ১০:৪২", "হাজিরা আপডেট", "শারমিন আক্তার"],
      ["৮ মার্চ · ১৪:১০", "Guardian verification", "রাশেদ আহমেদ"],
      ["১ মার্চ · ০৯:২২", "ফি রসিদ যোগ", "সিস্টেম"],
    ],
  },
};

function LightTab({ tab }: { tab: StudentTab }) {
  const content = lightTabContent[tab];
  if (!content) return null;
  const Icon = content.icon;
  return (
    <Panel
      title={content.title}
      description={content.description}
      action={<button className="ds-button secondary">সব দেখুন</button>}
    >
      <div className="light-tab">
        <span>
          <Icon size={23} />
        </span>
        <DataRows rows={content.rows} />
      </div>
    </Panel>
  );
}

function ProfileLoading() {
  return (
    <main className="profile-main">
      <div className="profile-loading-head">
        <LoaderCircle className="spin" size={22} />
        <div>
          <b>শিক্ষার্থী প্রোফাইল প্রস্তুত হচ্ছে</b>
          <span>অনুমতি ও সর্বশেষ রেকর্ড মিলিয়ে নেওয়া হচ্ছে</span>
        </div>
      </div>
      <div className="profile-skeleton">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="profile-skeleton panels">
        <i />
        <i />
      </div>
    </main>
  );
}

export default function StudentProfile({
  student,
  role,
  onBack,
  initialTab,
}: {
  student: ProfileStudent;
  role: PrototypeRole;
  onBack: () => void;
  initialTab?: StudentTab;
}) {
  const permission = resolveStudentPermission(student, prototypeRoles[role].context);
  const [tab, setTab] = useState<StudentTab>(
    initialTab && permission.tabs.includes(initialTab)
      ? initialTab
      : (permission.tabs[0] ?? "সারসংক্ষেপ"),
  );
  const [state, setState] = useState<ProfileState>("ready");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!permission.tabs.includes(tab)) setTab(permission.tabs[0] ?? "সারসংক্ষেপ");
  }, [permission.tabs, tab]);

  if (state === "loading") {
    return (
      <>
        <div className="profile-toolbar">
          <button className="back-link" onClick={onBack}>
            <ArrowLeft size={16} /> শিক্ষার্থী তালিকা
          </button>
          <label className="state-switcher">
            <span>Profile state</span>
            <select
              value={state}
              onChange={(event) => setState(event.target.value as ProfileState)}
            >
              <option value="ready">Ready</option>
              <option value="loading">Loading</option>
              <option value="partial-error">Partial error</option>
              <option value="archived">Archived</option>
              <option value="transferred">Transferred</option>
            </select>
          </label>
        </div>
        <ProfileLoading />
      </>
    );
  }

  if (permission.list !== "visible") {
    return (
      <main className="profile-main">
        <div className="profile-toolbar">
          <button className="back-link" onClick={onBack}>
            <ArrowLeft size={16} /> শিক্ষার্থী তালিকা
          </button>
        </div>
        <div className="partial-error permission-denied">
          <span>
            <ShieldAlert size={22} />
          </span>
          <h2>এই শিক্ষার্থীর প্রোফাইল দেখার অনুমতি নেই</h2>
          <p>বর্তমান ভূমিকার scope বা শাখা-অ্যাক্সেসের বাইরে হওয়ায় এই প্রোফাইলটি দেখানো যাচ্ছে না।</p>
          <button className="ds-button secondary" onClick={onBack}>
            <ArrowLeft size={15} /> শিক্ষার্থী তালিকায় ফিরুন
          </button>
        </div>
      </main>
    );
  }

  const copyId = async () => {
    await navigator.clipboard?.writeText(student.id);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const renderTab = () => {
    if (state === "partial-error") {
      return (
        <div className="partial-error">
          <span>
            <AlertCircle size={22} />
          </span>
          <h2>এই অংশটি এখন দেখানো যাচ্ছে না</h2>
          <p>প্রোফাইলের অন্য তথ্য নিরাপদ আছে। সংযোগ ঠিক হলে শুধু এই ট্যাবটি আবার চেষ্টা করুন।</p>
          <button className="ds-button secondary" onClick={() => setState("ready")}>
            <RefreshCcw size={15} /> আবার চেষ্টা করুন
          </button>
        </div>
      );
    }
    if (tab === "সারসংক্ষেপ") return <OverviewTab student={student} permission={permission} />;
    if (tab === "ব্যক্তিগত তথ্য") return <PersonalTab student={student} permission={permission} />;
    if (tab === "অভিভাবক ও যোগাযোগ") return <GuardiansTab permission={permission} />;
    if (tab === "হাজিরা") return <AttendanceTab />;
    if (tab === "ফি ও পেমেন্ট") return <FeesTab student={student} />;
    if (tab === "কুরআন ও হিফজ") return <HifzTab />;
    return <LightTab tab={tab} />;
  };

  return (
    <main className="profile-main">
      <div className="profile-toolbar">
        <button className="back-link" onClick={onBack}>
          <ArrowLeft size={16} /> শিক্ষার্থী তালিকা
        </button>
        <label className="state-switcher">
          <span>Profile state</span>
          <select value={state} onChange={(event) => setState(event.target.value as ProfileState)}>
            <option value="ready">Ready</option>
            <option value="loading">Loading</option>
            <option value="partial-error">Partial error</option>
            <option value="archived">Archived</option>
            <option value="transferred">Transferred</option>
          </select>
        </label>
      </div>

      {(state === "archived" || state === "transferred") && (
        <div className="record-banner">
          <History size={18} />
          <div>
            <b>{state === "archived" ? "আর্কাইভ করা শিক্ষার্থী" : "অন্য শাখায় স্থানান্তরিত"}</b>
            <p>
              {state === "archived"
                ? "রেকর্ডটি শুধু পড়া যাবে; নতুন কার্যক্রম যোগ করা যাবে না।"
                : "১ মার্চ ২০২৬ তারিখে উত্তরা শাখায় স্থানান্তর সম্পন্ন হয়েছে।"}
            </p>
          </div>
        </div>
      )}

      <header className="profile-hero">
        <div
          className={`profile-avatar ${student.avatarTone} ${permission.fields.photo !== "visible" ? "restricted" : ""}`}
        >
          {student.initials}
          {permission.fields.photo !== "visible" && <ShieldAlert size={16} />}
        </div>
        <div className="profile-identity">
          <div className="profile-title-row">
            <div>
              <h1>{student.nameBn}</h1>
              <p>{student.nameEn}</p>
              <span dir="rtl" lang="ar">
                مُحَمَّد عَبْدُ الله
              </span>
            </div>
            <span className="ds-badge success">
              <i className="status-dot" />
              {student.status}
            </span>
          </div>
          <button className="student-id-copy" onClick={copyId}>
            <code>{student.id}</code>
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? "কপি হয়েছে" : "ID কপি"}</span>
          </button>
          <div className="profile-chips">
            <span>
              <School size={13} />
              {student.className}
            </span>
            <span>সেকশন {student.section}</span>
            <span>
              <Users size={13} />
              {student.halaqa}
            </span>
            <span>রোল {bn(student.roll)}</span>
            <span>{student.branch}</span>
            <span>২০২৫–২৬</span>
            {student.residential && (
              <span>
                <Home size={13} />
                আবাসিক
              </span>
            )}
            {student.sponsored && (
              <span className="gold">
                <Sparkles size={13} />
                Sponsored
              </span>
            )}
            {student.medical && permission.fields.health === "visible" && (
              <span className="danger">
                <HeartPulse size={13} />
                Medical alert
              </span>
            )}
            {student.restricted && (
              <span className="danger">
                <ShieldAlert size={13} />
                Custody restriction
              </span>
            )}
          </div>
        </div>
        <div className="profile-actions">
          {permission.tabs.includes("ফি ও পেমেন্ট") && (
            <button className="ds-button primary">
              <WalletCards size={15} /> ফি আদায়
            </button>
          )}
          {permission.fields.phone === "visible" && (
            <button className="ds-button secondary">
              <MessageSquareText size={15} /> অভিভাবককে বার্তা
            </button>
          )}
          <button className="ds-button secondary">
            <IdCard size={15} /> ID card
          </button>
          <button className="ds-button secondary">
            <FileText size={15} /> নথি ইস্যু
          </button>
          <button className="ds-button secondary">
            <RefreshCcw size={15} /> সেকশন / হালাকা
          </button>
          <button className="ds-button secondary">
            <UserRound size={15} /> Status
          </button>
          {permission.fields.phone === "visible" ? (
            <button className="ds-button secondary">
              <Phone size={15} /> কল করুন
            </button>
          ) : (
            <span className="action-restricted">
              <LockKeyhole size={14} /> ফোন সীমিত
            </span>
          )}
        </div>
      </header>

      <section className="profile-metrics">
        <article>
          <span>
            <CalendarDays size={15} />
            এই মাসের হাজিরা
          </span>
          <b>{bn(student.attendance)}%</b>
          <small>গত মাসের চেয়ে ২% বেশি</small>
        </article>
        <article className={student.dues ? "warning" : ""}>
          <span>
            <WalletCards size={15} />
            বকেয়া
          </span>
          <b>{student.dues ? `৳ ${formatMoney(student.dues)}` : "৳ ০"}</b>
          <small>{student.dues ? "পরবর্তী তারিখ ১০ এপ্রিল" : "কোনো বকেয়া নেই"}</small>
        </article>
        <article>
          <span>
            <BookOpen size={15} />
            হিফজ অগ্রগতি
          </span>
          <b>
            ১২.৫ <em>পারা</em>
          </b>
          <small>লক্ষ্যের ৭৮% সম্পন্ন</small>
        </article>
        <article>
          <span>
            <GraduationCap size={15} />
            সর্বশেষ ফলাফল
          </span>
          <b>৮৮%</b>
          <small>অর্ধবার্ষিক · Grade A</small>
        </article>
      </section>

      <nav className="profile-tabs" aria-label="শিক্ষার্থী প্রোফাইল অংশ">
        {permission.tabs.map((item) => (
          <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>
            {item}
          </button>
        ))}
      </nav>
      <section className="profile-tab-content">{renderTab()}</section>
    </main>
  );
}
