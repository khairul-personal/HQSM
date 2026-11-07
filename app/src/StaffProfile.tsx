import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Banknote,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Copy,
  FileBadge,
  FileText,
  GraduationCap,
  History,
  KeyRound,
  Laptop,
  LockKeyhole,
  MessageSquareText,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  UserMinus,
  UserRoundCog,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import {
  prototypeRoles,
  resolveStaffPermission,
  type PrototypeRole,
  type StaffPermission,
  type StaffTab,
} from "./student-permissions";
import { staffRecords, type StaffRecord } from "./staff-data";
import "./staff.css";

type ProfileState = "ready" | "loading" | "partial-error";

const bn = (value: number | string) =>
  String(value).replace(/\d/g, (digit) => "০১২৩৪৫৬৭৮৯"[Number(digit)]);

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

function OverviewTab({ staff }: { staff: StaffRecord }) {
  return (
    <div className="profile-content-grid overview-grid">
      <Panel title="আজকের সারাংশ" description="হাজিরা, ক্লাস ও অসম্পূর্ণ কাজ">
        <div className="timeline">
          <div className="timeline-row">
            <span className="success">
              <CheckCircle2 size={16} />
            </span>
            <div>
              <b>আজ উপস্থিত · ৭:৪৮</b>
              <small>প্রধান গেট · Biometric verified</small>
            </div>
          </div>
          <div className="timeline-row">
            <span>
              <BookOpen size={16} />
            </span>
            <div>
              <b>৪টি ক্লাস নির্ধারিত</b>
              <small>২টি সম্পন্ন · পরবর্তী হিফজ—ক, ১১:২০</small>
            </div>
          </div>
          <div className="timeline-row">
            <span className="info">
              <ClipboardCheck size={16} />
            </span>
            <div>
              <b>{bn(staff.pendingTasks)}টি কাজ অসম্পূর্ণ</b>
              <small>সাপ্তাহিক অগ্রগতি নোট আজ জমা দিতে হবে</small>
            </div>
          </div>
        </div>
      </Panel>
      <Panel title="চাকরি সারাংশ" description="বর্তমান নিয়োগ ও দায়িত্ব">
        <DataRows
          rows={[
            ["পদবি", staff.designation],
            ["বিভাগ", staff.department],
            ["যোগদানের তারিখ", "১২ জানুয়ারি ২০২১", "৫ বছর ২ মাস"],
            ["সুপারভাইজার", "মাওলানা নাঈমুল হাসান"],
            ["চাকরির ধরন", staff.employmentType],
          ]}
        />
      </Panel>
      <Panel title="এই সপ্তাহের রুটিন" description="পরবর্তী ক্লাস ও হালাকা">
        <div className="staff-upcoming">
          {[
            ["আজ · ১১:২০", "হিফজ—ক", "সবক ও আমুক্তা"],
            ["আজ · ২:১৫", "হিফজ—খ", "সাপ্তাহিক মূল্যায়ন"],
            ["আগামীকাল · ৮:৩০", "হালাকা ১", "তিলাওয়াত ও তাজবীদ"],
          ].map(([time, title, detail]) => (
            <div key={time}>
              <span>
                <Clock3 size={15} />
              </span>
              <div>
                <b>{title}</b>
                <small>{detail}</small>
              </div>
              <em>{time}</em>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="HR ও একাডেমিক নোট" description="সর্বশেষ অনুমোদিত আপডেট">
        <div className="notice-stack staff-notes">
          <div className="notice">
            <BadgeCheck size={17} />
            <div>
              <b>বার্ষিক নথি সম্পূর্ণ</b>
              <p>NID, সনদ ও চুক্তিপত্র যাচাই করা হয়েছে</p>
            </div>
          </div>
          <div className="notice warning">
            <CalendarDays size={17} />
            <div>
              <b>ছুটির অনুরোধ অপেক্ষমাণ</b>
              <p>১৮–১৯ এপ্রিল · বিকল্প শিক্ষক প্রয়োজন</p>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

const degrees = [
  ["দাওরায়ে হাদিস / তাকমিল", "জামিয়া ইসলামিয়া দারুল উলূম", "২০১৮", "মুমতাজ"],
  ["ফজিলত", "ইসলামি আরবি বিশ্ববিদ্যালয়", "২০১৬", "প্রথম বিভাগ"],
  ["হাফেজ", "মারকাযুল হিফজ বাংলাদেশ", "২০১১", "সম্পন্ন"],
  ["কারী", "ইকরা কিরাআত ইনস্টিটিউট", "২০১৩", "A"],
  ["ইফতা", "মারকাযুদ দাওয়াহ", "২০১৯", "জায়্যিদ জিদ্দান"],
  ["আলিয়া কামিল / ফাজিল", "সরকারি মাদরাসা-ই-আলিয়া", "২০১৭", "প্রথম বিভাগ"],
  ["সাধারণ ডিগ্রি · BA", "জাতীয় বিশ্ববিদ্যালয়", "২০১৭", "CGPA ৩.৪২"],
];

function QualificationsTab() {
  return (
    <div className="staff-tab-stack">
      <Panel title="শিক্ষাগত যোগ্যতা" description="যাচাইকৃত ডিগ্রি ও একাডেমিক ফলাফল">
        <div className="degree-grid">
          {degrees.map(([degree, institution, year, result]) => (
            <article key={degree}>
              <span>
                <GraduationCap size={18} />
              </span>
              <div>
                <h3>{degree}</h3>
                <p>{institution}</p>
                <small>
                  {bn(year)} · {result}
                </small>
              </div>
              <BadgeCheck size={16} />
            </article>
          ))}
        </div>
      </Panel>
      <div className="profile-content-grid">
        <Panel title="ইজাজত ও সনদ" description="শায়খ ও প্রতিষ্ঠান কর্তৃক প্রদত্ত">
          <div className="certificate-list">
            <div>
              <FileBadge size={18} />
              <span>
                <b>ইজাজত ফি হিফজিল কুরআন</b>
                <small>শাইখ আবদুল হাই · ২০১৮ · যাচাইকৃত</small>
              </span>
              <button>দেখুন</button>
            </div>
            <div>
              <FileBadge size={18} />
              <span>
                <b>সনদুত তাজবীদ</b>
                <small>ইকরা কিরাআত ইনস্টিটিউট · ২০১৩</small>
              </span>
              <button>দেখুন</button>
            </div>
          </div>
        </Panel>
        <Panel title="প্রশিক্ষণ" description="পেশাগত উন্নয়ন">
          <div className="training-list">
            <div>
              <Check size={15} />
              <span>
                <b>শিশু সুরক্ষা ও Safeguarding</b>
                <small>ফেব্রুয়ারি ২০২৬ · নবায়ন ২০২৭</small>
              </span>
            </div>
            <div>
              <Check size={15} />
              <span>
                <b>শ্রেণিকক্ষ ও আচরণ ব্যবস্থাপনা</b>
                <small>আগস্ট ২০২৫ · ১২ ঘণ্টা</small>
              </span>
            </div>
          </div>
          <div className="specialisation-chips">
            {["হিফজ মুরাজাআত", "তাজবীদ", "মাখারিজ", "কিশোর শিক্ষা", "আরবি ভাষা"].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

const routine = [
  ["রবি", "হিফজ—ক", "হালাকা ১", "হিফজ—খ", "—"],
  ["সোম", "হিফজ—ক", "হালাকা ১", "তাজবীদ", "হিফজ—খ"],
  ["মঙ্গল", "হিফজ—ক", "—", "হিফজ—খ", "মূল্যায়ন"],
  ["বুধ", "হিফজ—ক", "হালাকা ১", "তাজবীদ", "—"],
  ["বৃহঃ", "হিফজ—ক", "হালাকা ১", "হিফজ—খ", "মূল্যায়ন"],
];

function TeachingTab() {
  return (
    <div className="staff-tab-stack">
      <div className="load-warning">
        <AlertCircle size={18} />
        <div>
          <b>দায়িত্ব পরিবর্তনে শিক্ষক-শূন্য হওয়ার ঝুঁকি</b>
          <p>হিফজ—ক থেকে এই শিক্ষককে সরালে ৬ দিনের জন্য কোনো প্রধান শিক্ষক থাকবে না।</p>
        </div>
        <button className="ds-button secondary">বিকল্প দেখুন</button>
      </div>
      <Panel title="বর্তমান শিক্ষাদান দায়িত্ব" description="কার্যকর তারিখসহ শ্রেণি, বিষয় ও হালাকা">
        <div className="assignment-grid">
          {[
            ["হিফজ—ক", "সবক, সবকিয়া ও আমুক্তা", "১ জানুয়ারি ২০২৬", "চলমান"],
            ["হালাকা ১", "তিলাওয়াত ও তাজবীদ", "১ জুলাই ২০২৫", "৩০ জুন ২০২৬"],
            ["হিফজ—খ", "সাপ্তাহিক মূল্যায়ন", "১ মার্চ ২০২৬", "৩১ মে ২০২৬"],
          ].map(([title, detail, start, end]) => (
            <article key={title}>
              <span>
                <BookOpen size={18} />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{detail}</p>
                <small>
                  কার্যকর: {start} — {end}
                </small>
              </div>
              <em>সক্রিয়</em>
            </article>
          ))}
        </div>
      </Panel>
      <Panel
        title="সাপ্তাহিক রুটিন"
        description="২৪ পিরিয়ড · অনুমোদিত লোড ১৮–২৬"
        action={
          <span className="load-indicator">
            <i />
            ৮৮% লোড
          </span>
        }
      >
        <div className="routine-scroll">
          <table className="routine-grid">
            <thead>
              <tr>
                <th>দিন</th>
                <th>১ম</th>
                <th>২য়</th>
                <th>৩য়</th>
                <th>৪র্থ</th>
              </tr>
            </thead>
            <tbody>
              {routine.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, index) => (
                    <td key={`${row[0]}-${index}`} className={cell === "—" ? "empty" : ""}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="Substitute history" description="সাম্প্রতিক বিকল্প শিক্ষকের রেকর্ড">
        <DataRows
          rows={[
            ["১২ মার্চ ২০২৬", "উস্তাদ মাহমুদ · হিফজ—ক", "অসুস্থতা"],
            ["১৮ ফেব্রুয়ারি ২০২৬", "কারী আবু তাহের · তাজবীদ", "প্রশিক্ষণ"],
            ["৭ জানুয়ারি ২০২৬", "মাওলানা নাঈম · হালাকা ১", "অনুমোদিত ছুটি"],
          ]}
        />
      </Panel>
    </div>
  );
}

function PayrollTab({ permission }: { permission: StaffPermission }) {
  const full = permission.payroll === "full";
  return (
    <div className="staff-tab-stack">
      {full && (
        <div className="profile-content-grid">
          <Panel title="বেতন কাঠামো" description="কার্যকর ১ জানুয়ারি ২০২৬">
            <DataRows
              rows={[
                ["মূল বেতন", "৳ ৩২,০০০"],
                ["বাড়িভাড়া", "৳ ১২,৮০০", "মূল বেতনের ৪০%"],
                ["চিকিৎসা ভাতা", "৳ ২,০০০"],
                ["যাতায়াত", "৳ ১,৫০০"],
                ["মোট বেতন", "৳ ৪৮,৩০০"],
              ]}
            />
          </Panel>
          <Panel title="পরিশোধের মাধ্যম" description="সংবেদনশীল তথ্য মাস্ক করা">
            <div className="payment-method">
              <span>
                <Banknote size={20} />
              </span>
              <div>
                <b>ইসলামী ব্যাংক বাংলাদেশ</b>
                <p>হিসাব •••• •••• ৭৪২১</p>
                <small>Routing ••• ১২৫ · Payroll primary</small>
              </div>
              <ShieldCheck size={17} />
            </div>
            <div className="payment-method">
              <span>
                <Smartphone size={20} />
              </span>
              <div>
                <b>bKash wallet</b>
                <p>০১৭•••৫৬৭৮</p>
                <small>Backup · নাম যাচাইকৃত</small>
              </div>
              <ShieldCheck size={17} />
            </div>
          </Panel>
        </div>
      )}
      <Panel
        title="পে-স্লিপ"
        description={full ? "বেতন, কর্তন ও পরিশোধের রেকর্ড" : "নিজের প্রকাশিত পে-স্লিপ শুধু দেখা যাবে"}
      >
        <div className="payslip-list">
          {[
            ["মার্চ ২০২৬", "৳ ৪৬,৮০০", "পরিশোধিত · ২৮ মার্চ"],
            ["ফেব্রুয়ারি ২০২৬", "৳ ৪৮,৩০০", "পরিশোধিত · ২৭ ফেব্রুয়ারি"],
            ["জানুয়ারি ২০২৬", "৳ ৪৮,৩০০", "পরিশোধিত · ২৮ জানুয়ারি"],
          ].map(([month, amount, status]) => (
            <div key={month}>
              <span>
                <FileText size={18} />
              </span>
              <div>
                <b>{month}</b>
                <small>{status}</small>
              </div>
              <strong>{amount}</strong>
              <button>PDF</button>
            </div>
          ))}
        </div>
      </Panel>
      {full && (
        <Panel title="অগ্রিম ও সমন্বয়" description="চলমান এবং নিষ্পত্তিকৃত">
          <DataRows
            rows={[
              ["বেতন অগ্রিম", "৳ ১৫,০০০", "অবশিষ্ট ৳ ৫,০০০ · এপ্রিল ২০২৬"],
              ["কর সমন্বয়", "৳ ১,৫০০ কর্তন", "মার্চ ২০২৬"],
            ]}
          />
        </Panel>
      )}
    </div>
  );
}

function AccessTab() {
  return (
    <div className="staff-tab-stack">
      <div className="profile-content-grid">
        <Panel title="Roles & permissions" description="কার্যকর সিস্টেম ভূমিকা">
          <div className="access-role-list">
            <div>
              <ShieldCheck size={18} />
              <span>
                <b>Teacher · Hifz</b>
                <small>হিফজ বিভাগ · প্রধান শাখা</small>
              </span>
              <em>Primary</em>
            </div>
            <div>
              <Users size={18} />
              <span>
                <b>Class teacher</b>
                <small>হিফজ—ক · সেকশন scope</small>
              </span>
              <em>Active</em>
            </div>
          </div>
        </Panel>
        <Panel title="নিরাপত্তা" description="Authentication posture">
          <DataRows
            rows={[
              ["2FA", <span className="access-good">সক্রিয় · Authenticator</span>],
              ["শেষ লগইন", "আজ ৭:৩৯", "Dhaka · Chrome"],
              ["পাসওয়ার্ড", "৪২ দিন আগে পরিবর্তিত"],
              ["Recovery", "HR verified"],
            ]}
          />
        </Panel>
      </div>
      <Panel title="Active sessions" description="বর্তমানে সাইন-ইন করা ডিভাইস">
        <div className="session-list">
          <div>
            <span>
              <Laptop size={19} />
            </span>
            <div>
              <b>Chrome · Windows 11</b>
              <small>Dhaka · বর্তমান সেশন · সক্রিয় এখন</small>
            </div>
            <em>Current</em>
          </div>
          <div>
            <span>
              <Smartphone size={19} />
            </span>
            <div>
              <b>Make Teacher · Android</b>
              <small>Dhaka · শেষ সক্রিয় ২ ঘণ্টা আগে</small>
            </div>
            <button className="ds-button secondary">
              <X size={14} /> Revoke
            </button>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function LightTab({
  tab,
  staff,
  permission,
}: {
  tab: StaffTab;
  staff: StaffRecord;
  permission: StaffPermission;
}) {
  const descriptions: Partial<Record<StaffTab, string>> = {
    "ব্যক্তিগত তথ্য": "যোগাযোগ, ঠিকানা, জরুরি যোগাযোগ ও পরিচয় তথ্য",
    "চাকরি তথ্য": "নিয়োগ, চুক্তি, পদোন্নতি ও কর্মস্থল ইতিহাস",
    "হাজিরা ও ছুটি": "দৈনিক হাজিরা, ছুটির ব্যালেন্স ও আবেদন",
    "কাজ ও মূল্যায়ন": "লক্ষ্য, অসম্পূর্ণ কাজ ও অনুমোদিত মূল্যায়ন",
    নথি: "চুক্তিপত্র, NID, ছবি ও HR নথি",
    অডিট: "রেকর্ড পরিবর্তন ও সংবেদনশীল অ্যাক্সেস লগ",
  };
  return (
    <div className="profile-content-grid">
      <Panel title={tab} description={descriptions[tab]}>
        <DataRows
          rows={[
            ["কর্মী", `${staff.nameBn} · ${staff.id}`],
            ["সর্বশেষ হালনাগাদ", "আজ, সকাল ৯:২৪"],
            ["রেকর্ড অবস্থা", "যাচাইকৃত"],
            ...(tab === "কাজ ও মূল্যায়ন"
              ? ([
                  [
                    "Observation notes",
                    permission.observationNotes === "visible"
                      ? "সর্বশেষ পর্যবেক্ষণ ১২ মার্চ ২০২৬"
                      : "নিজের ভিউতে গোপন",
                  ],
                ] as Array<[string, React.ReactNode, string?]>)
              : []),
          ]}
        />
      </Panel>
      <Panel title="সাম্প্রতিক কার্যক্রম" description="এই অংশের সর্বশেষ পরিবর্তন">
        <div className="timeline">
          <div className="timeline-row">
            <span>
              <History size={16} />
            </span>
            <div>
              <b>রেকর্ড পর্যালোচনা করা হয়েছে</b>
              <small>HR Officer · ২ দিন আগে</small>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function ProfileLoading() {
  return (
    <main className="profile-main">
      <div className="profile-skeleton hero">
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

export default function StaffProfile({
  staff,
  role,
  onBack,
}: {
  staff: StaffRecord;
  role: PrototypeRole;
  onBack: () => void;
}) {
  const permission = resolveStaffPermission(staff, prototypeRoles[role].context);
  const [tab, setTab] = useState<StaffTab>(permission.tabs[0] ?? "সারসংক্ষেপ");
  const [state, setState] = useState<ProfileState>("ready");
  const [copied, setCopied] = useState(false);
  const [accountActionError, setAccountActionError] = useState("");

  useEffect(() => {
    if (!permission.tabs.includes(tab)) setTab(permission.tabs[0] ?? "সারসংক্ষেপ");
  }, [permission.tabs, tab]);

  if (permission.record === "hidden") {
    return (
      <main className="profile-main">
        <div className="profile-toolbar">
          <button className="back-link" onClick={onBack}>
            <ArrowLeft size={16} /> কর্মী তালিকা
          </button>
        </div>
        <div className="partial-error permission-denied">
          <span>
            <ShieldAlert size={22} />
          </span>
          <h2>এই কর্মীর প্রোফাইল দেখার অনুমতি নেই</h2>
          <p>বর্তমান ভূমিকার record scope-এর বাইরে হওয়ায় কোনো প্রোফাইল তথ্য দেখানো হয়নি।</p>
          <button className="ds-button secondary" onClick={onBack}>
            <ArrowLeft size={15} /> কর্মী তালিকায় ফিরুন
          </button>
        </div>
      </main>
    );
  }

  if (state === "loading") return <ProfileLoading />;

  const copyId = async () => {
    await navigator.clipboard?.writeText(staff.id);
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
          <h2>এই ট্যাবটি এখন দেখানো যাচ্ছে না</h2>
          <p>প্রোফাইলের অন্য তথ্য নিরাপদ আছে। সংযোগ ঠিক হলে শুধু এই ট্যাবটি আবার চেষ্টা করুন।</p>
          <button className="ds-button secondary" onClick={() => setState("ready")}>
            <RefreshCcw size={15} /> আবার চেষ্টা করুন
          </button>
        </div>
      );
    }
    if (tab === "সারসংক্ষেপ") return <OverviewTab staff={staff} />;
    if (tab === "যোগ্যতা ও সনদ") return <QualificationsTab />;
    if (tab === "শিক্ষাদান দায়িত্ব") return <TeachingTab />;
    if (tab === "বেতন ও পে রোল") return <PayrollTab permission={permission} />;
    if (tab === "সিস্টেম অ্যাক্সেস") return <AccessTab />;
    return <LightTab tab={tab} staff={staff} permission={permission} />;
  };

  const inactive = staff.status === "স্থগিত" || staff.status === "অব্যাহতিপ্রাপ্ত";
  const isOwnProfile = staff.isCurrentUser === true;
  const isLastInstitutionAdmin =
    staff.institutionAdmin === true &&
    staffRecords.filter(
      (record) =>
        record.institutionAdmin === true &&
        record.status !== "স্থগিত" &&
        record.status !== "অব্যাহতিপ্রাপ্ত",
    ).length === 1;
  const handleAccountRestriction = () => {
    if (isLastInstitutionAdmin) {
      setAccountActionError("প্রতিষ্ঠানে অন্তত একজন Institution Admin থাকতে হবে");
      return;
    }
    setAccountActionError("");
  };

  return (
    <main className="profile-main staff-profile-main">
      <div className="profile-toolbar">
        <button className="back-link" onClick={onBack}>
          <ArrowLeft size={16} /> কর্মী তালিকা
        </button>
        <label className="state-switcher">
          <span>Profile state</span>
          <select value={state} onChange={(event) => setState(event.target.value as ProfileState)}>
            <option value="ready">Ready</option>
            <option value="loading">Loading</option>
            <option value="partial-error">Partial tab error</option>
          </select>
        </label>
      </div>

      {inactive && (
        <div className="record-banner staff-record-banner">
          <LockKeyhole size={18} />
          <div>
            <b>
              {staff.status === "স্থগিত" ? "স্থগিত কর্মী · Read only" : "অব্যাহতিপ্রাপ্ত কর্মী · Read only"}
            </b>
            <p>সিস্টেম অ্যাক্সেস প্রত্যাহার করা হয়েছে; ইতিহাস ও নথি শুধু দেখা যাবে।</p>
          </div>
        </div>
      )}

      <header className="profile-hero staff-profile-hero">
        <div className={`profile-avatar ${staff.avatarTone}`}>
          {staff.initials}
          {staff.gender === "নারী" && !staff.photoConsent && <ShieldCheck size={16} />}
        </div>
        <div className="profile-identity">
          <div className="profile-title-row">
            <div>
              <h1>{staff.nameBn}</h1>
              <p>{staff.nameEn}</p>
              <span dir="rtl" lang="ar">
                {staff.nameAr}
              </span>
            </div>
            <span className={`ds-badge ${staff.status === "সক্রিয়" ? "success" : "neutral"}`}>
              <i className="status-dot" />
              {staff.status}
            </span>
          </div>
          <button className="student-id-copy" onClick={copyId}>
            <code>{staff.id}</code>
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? "কপি হয়েছে" : "ID কপি"}</span>
          </button>
          <div className="profile-chips">
            <span>
              <UserRoundCog size={13} /> {staff.designation}
            </span>
            <span>{staff.department}</span>
            <span>{staff.branch}</span>
            <span>{staff.employmentType}</span>
          </div>
        </div>
        <div className="profile-actions">
          {permission.actions === "manage" ? (
            <>
              <button className="ds-button primary" disabled={inactive}>
                <UserRoundCog size={15} /> দায়িত্ব বরাদ্দ
              </button>
              <button className="ds-button secondary" disabled={inactive}>
                <Users size={15} /> Substitute দিন
              </button>
              <button className="ds-button secondary" disabled={inactive}>
                <MessageSquareText size={15} /> বার্তা
              </button>
              {!isOwnProfile && (
                <>
                  <button
                    className="ds-button secondary"
                    disabled={inactive}
                    onClick={handleAccountRestriction}
                  >
                    <KeyRound size={15} /> Access বন্ধ
                  </button>
                  <button
                    className="ds-button danger"
                    disabled={inactive}
                    onClick={handleAccountRestriction}
                  >
                    <UserMinus size={15} /> অব্যাহতি শুরু
                  </button>
                </>
              )}
            </>
          ) : (
            <button className="ds-button secondary">
              <MessageSquareText size={15} /> HR-কে বার্তা
            </button>
          )}
        </div>
      </header>
      {accountActionError && (
        <div className="staff-action-error" role="alert">
          <AlertCircle size={17} />
          <span>{accountActionError}</span>
        </div>
      )}

      <section className="profile-metrics">
        <article>
          <span>
            <BookOpen size={15} /> সাপ্তাহিক ক্লাস
          </span>
          <b>{bn(staff.weeklyLoad)}</b>
          <small>অনুমোদিত লোড ১৮–২৬</small>
        </article>
        <article>
          <span>
            <CalendarDays size={15} /> এই মাসের হাজিরা
          </span>
          <b>{bn(staff.attendance)}%</b>
          <small>২২ কর্মদিবসের হিসাব</small>
        </article>
        <article>
          <span>
            <WalletCards size={15} /> ছুটির ব্যালেন্স
          </span>
          <b>
            {bn(staff.leaveBalance)} <em>দিন</em>
          </b>
          <small>নৈমিত্তিক ও অসুস্থতা ছুটি</small>
        </article>
        <article className={staff.pendingTasks ? "warning" : ""}>
          <span>
            <ClipboardCheck size={15} /> অসম্পূর্ণ কাজ
          </span>
          <b>{bn(staff.pendingTasks)}</b>
          <small>১টি আজ শেষ করতে হবে</small>
        </article>
      </section>

      <nav className="profile-tabs" aria-label="কর্মী প্রোফাইল অংশ">
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
