import { FormEvent, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  Columns3,
  FileCheck2,
  FileText,
  GraduationCap,
  GripVertical,
  History,
  LayoutList,
  LoaderCircle,
  MoreHorizontal,
  Plus,
  Search,
  ShieldAlert,
  UserRound,
  Users,
  WifiOff,
  X,
} from "lucide-react";
import {
  prototypeRoles,
  resolveAdmissionPermission,
  type PrototypeRole,
} from "./student-permissions";
import { BlockedActionNotice, SystemState, useSubscription } from "./SystemStates";
import "./admission.css";

type Stage = "নতুন" | "যোগাযোগ হয়েছে" | "পরিদর্শন নির্ধারিত" | "আবেদনে রূপান্তরিত" | "বাতিল/হারানো";
type AppStatus =
  | "Draft"
  | "Submitted"
  | "Review"
  | "Waitlisted"
  | "Approved"
  | "Rejected"
  | "Enrolled";
type DemoState = "ready" | "loading" | "empty" | "offline" | "denied";
type Enquiry = {
  id: string;
  guardian: string;
  phone: string;
  gender: "বালক" | "বালিকা";
  age: string;
  className: string;
  track: string;
  residential: boolean;
  source: string;
  followUp: string;
  overdue?: boolean;
  stage: Stage;
  lostReason?: string;
};

type Application = {
  id: string;
  name: string;
  guardian: string;
  phone: string;
  gender: "বালক" | "বালিকা";
  branch: string;
  className: string;
  track: string;
  residential: boolean;
  age: string;
  status: AppStatus;
  capacity: string;
  full?: boolean;
  duplicate?: boolean;
  approved?: boolean;
  studentId?: string;
  invoiceId?: string;
};

const stages: Stage[] = ["নতুন", "যোগাযোগ হয়েছে", "পরিদর্শন নির্ধারিত", "আবেদনে রূপান্তরিত", "বাতিল/হারানো"];
const appStatuses: AppStatus[] = [
  "Draft",
  "Submitted",
  "Review",
  "Waitlisted",
  "Approved",
  "Rejected",
  "Enrolled",
];
const maskPhone = (phone: string) => `${phone.slice(0, 3)}•••${phone.slice(-4)}`;

const initialEnquiries: Enquiry[] = [
  {
    id: "ENQ-0268",
    guardian: "মো. রফিকুল ইসলাম",
    phone: "01712345678",
    gender: "বালক",
    age: "৮ বছর ৪ মাস",
    className: "হিফজ",
    track: "সাধারণ",
    residential: true,
    source: "ওয়েবসাইট",
    followUp: "আজ, ৪:৩০ PM",
    overdue: true,
    stage: "নতুন",
  },
  {
    id: "ENQ-0267",
    guardian: "সাবিহা সুলতানা",
    phone: "01819774512",
    gender: "বালিকা",
    age: "৬ বছর",
    className: "নূরানী",
    track: "বাংলা মাধ্যম",
    residential: false,
    source: "রেফারেন্স",
    followUp: "আগামীকাল",
    stage: "নতুন",
  },
  {
    id: "ENQ-0264",
    guardian: "আব্দুল কাদের",
    phone: "01922684930",
    gender: "বালক",
    age: "১০ বছর",
    className: "হিফজ",
    track: "তাখাসসুস",
    residential: true,
    source: "ফোন",
    followUp: "১২ নভেম্বর",
    stage: "যোগাযোগ হয়েছে",
  },
  {
    id: "ENQ-0259",
    guardian: "তাহমিনা আক্তার",
    phone: "01638442108",
    gender: "বালিকা",
    age: "৭ বছর ২ মাস",
    className: "প্রথম শ্রেণি",
    track: "জাতীয়",
    residential: false,
    source: "Walk-in",
    followUp: "আজ, ১১:০০ AM",
    overdue: true,
    stage: "পরিদর্শন নির্ধারিত",
  },
  {
    id: "ENQ-0252",
    guardian: "মো. সালাউদ্দিন",
    phone: "01308112745",
    gender: "বালক",
    age: "৯ বছর",
    className: "নাজেরা",
    track: "কিতাব",
    residential: false,
    source: "ওয়েবসাইট",
    followUp: "সম্পন্ন",
    stage: "আবেদনে রূপান্তরিত",
  },
  {
    id: "ENQ-0248",
    guardian: "সাইফুল হক",
    phone: "01765302248",
    gender: "বালক",
    age: "১২ বছর",
    className: "মিশকাত",
    track: "কিতাব",
    residential: true,
    source: "রেফারেন্স",
    followUp: "—",
    stage: "বাতিল/হারানো",
    lostReason: "অন্য প্রতিষ্ঠানে ভর্তি",
  },
];

const initialApplications: Application[] = [
  {
    id: "APP-2026-0142",
    name: "আয়েশা সিদ্দিকা",
    guardian: "তাহমিনা আক্তার",
    phone: "01638442108",
    gender: "বালিকা",
    branch: "প্রধান শাখা",
    className: "হিফজ",
    track: "হিফজ",
    residential: true,
    age: "৩ দিন",
    status: "Review",
    capacity: "২৮/৩০ আসন পূর্ণ",
    duplicate: true,
  },
  {
    id: "APP-2026-0141",
    name: "মুহাম্মদ ইয়াসিন",
    guardian: "মো. রফিকুল ইসলাম",
    phone: "01712345678",
    gender: "বালক",
    branch: "প্রধান শাখা",
    className: "হিফজ",
    track: "হিফজ",
    residential: true,
    age: "৫ দিন",
    status: "Approved",
    capacity: "২৮/৩০ আসন পূর্ণ",
    approved: true,
    invoiceId: "INV-2026-1848",
  },
  {
    id: "APP-2026-0139",
    name: "মারইয়াম বিনতে আলী",
    guardian: "আব্দুল কাদের",
    phone: "01922684930",
    gender: "বালিকা",
    branch: "মিরপুর শাখা",
    className: "নূরানী",
    track: "সাধারণ",
    residential: false,
    age: "৮ দিন",
    status: "Waitlisted",
    capacity: "৩০/৩০ আসন পূর্ণ",
    full: true,
  },
  {
    id: "APP-2026-0136",
    name: "হাসান মাহমুদ",
    guardian: "সাইফুল হক",
    phone: "01765302248",
    gender: "বালক",
    branch: "প্রধান শাখা",
    className: "মিশকাত",
    track: "কিতাব",
    residential: true,
    age: "১২ দিন",
    status: "Submitted",
    capacity: "২৪/৩০ আসন পূর্ণ",
  },
];

function EnquiryCard({
  enquiry,
  onMove,
  onConvert,
}: {
  enquiry: Enquiry;
  onMove: (stage: Stage) => void;
  onConvert: () => void;
}) {
  return (
    <article
      className="ad-enquiry-card"
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/plain", enquiry.id)}
    >
      <header>
        <span>{enquiry.id}</span>
        <GripVertical size={15} />
      </header>
      <h3>{enquiry.guardian}</h3>
      <p>
        {maskPhone(enquiry.phone)} · {enquiry.gender}, {enquiry.age}
      </p>
      <div className="ad-card-tags">
        <b>{enquiry.className}</b>
        <span>{enquiry.track}</span>
        {enquiry.residential && <em>আবাসিক</em>}
      </div>
      <div className="ad-card-source">
        <span>{enquiry.source}</span>
        <span className={enquiry.overdue ? "overdue" : ""}>
          <CalendarClock size={13} />
          {enquiry.followUp}
        </span>
      </div>
      {enquiry.lostReason && <p className="ad-lost-reason">কারণ: {enquiry.lostReason}</p>}
      <footer>
        {enquiry.stage !== "আবেদনে রূপান্তরিত" && enquiry.stage !== "বাতিল/হারানো" && (
          <button onClick={onConvert}>
            আবেদনে নিন <ArrowRight size={13} />
          </button>
        )}
        <label aria-label="ধাপ পরিবর্তন">
          <MoreHorizontal size={15} />
          <select value={enquiry.stage} onChange={(e) => onMove(e.target.value as Stage)}>
            {stages.map((stage) => (
              <option key={stage}>{stage}</option>
            ))}
          </select>
        </label>
      </footer>
    </article>
  );
}

function StatePanel({
  state,
  onNew,
}: {
  state: Exclude<DemoState, "ready"> | "no-results";
  onNew: () => void;
}) {
  const kind =
    state === "denied"
      ? "no-permission"
      : state === "no-results" || state === "empty"
        ? "empty"
        : state;
  return (
    <SystemState
      kind={kind}
      title={
        state === "empty"
          ? "প্রথম enquiry যোগ করুন"
          : state === "no-results"
            ? "কোনো ফল পাওয়া যায়নি"
            : state === "denied"
              ? "ভর্তি ব্যবস্থাপনার অনুমতি নেই"
              : undefined
      }
      message={
        state === "empty"
          ? "ভর্তির আগ্রহী অভিভাবকদের তথ্য এখানে ধাপে ধাপে অনুসরণ করুন।"
          : state === "no-results"
            ? "ফিল্টার বা খোঁজ পরিবর্তন করে আবার চেষ্টা করুন।"
            : undefined
      }
      actionLabel={state === "empty" ? "নতুন enquiry" : undefined}
      onAction={state === "empty" ? onNew : undefined}
      className="ad-state"
    />
  );
}

function ReviewDetail({
  application,
  canViewSponsorship,
  onBack,
  onUpdate,
  onOpenStudent,
}: {
  application: Application;
  canViewSponsorship: boolean;
  onBack: () => void;
  onUpdate: (patch: Partial<Application>) => void;
  onOpenStudent: (id: string) => void;
}) {
  const [decision, setDecision] = useState<"approve" | "reject" | null>(null);
  const [reason, setReason] = useState("");
  const [confirmedDifferent, setConfirmedDifferent] = useState(false);
  const approve = () => {
    if (application.full) return;
    onUpdate({
      status: "Approved",
      approved: true,
      invoiceId: application.invoiceId || "INV-2026-1851",
    });
    setDecision(null);
  };
  const enroll = () => {
    const id = application.studentId || "HQ-2026-00123";
    onUpdate({ status: "Enrolled", studentId: id });
    onOpenStudent(id);
  };
  return (
    <main className="ad-main ad-review">
      <button className="ad-back" onClick={onBack}>
        <ArrowLeft size={16} /> আবেদন তালিকায় ফিরুন
      </button>
      <div className="ad-review-head">
        <div>
          <span className="ad-kicker">APPLICATION REVIEW · {application.id}</span>
          <h1>{application.name}</h1>
          <p>
            {application.className} · {application.branch} · {application.gender}
          </p>
        </div>
        <span className={`ad-status ${application.status.toLowerCase()}`}>
          {application.status}
        </span>
      </div>
      {application.duplicate && !confirmedDifferent && (
        <div className="ad-duplicate">
          <AlertTriangle size={21} />
          <div>
            <b>সম্ভাব্য ডুপ্লিকেট পাওয়া গেছে</b>
            <p>নাম, জন্মতারিখ ও অভিভাবকের ফোন একটি বিদ্যমান শিক্ষার্থী/আবেদনের সাথে মিলেছে।</p>
          </div>
          <button>দেখুন</button>
          <button onClick={() => setConfirmedDifferent(true)}>ভিন্ন শিক্ষার্থী নিশ্চিত করুন</button>
        </div>
      )}
      <div className="ad-review-grid">
        <div className="ad-review-content">
          <details className="ad-section" open>
            <summary>
              <span>
                <UserRound size={18} /> আবেদনকারী ও অভিভাবক
              </span>
              <ChevronDown size={17} />
            </summary>
            <div className="ad-profile-data">
              <div className="ad-photo">
                আসি<span>ছবি নীতি অনুযায়ী</span>
              </div>
              <dl>
                <div>
                  <dt>পূর্ণ নাম</dt>
                  <dd>{application.name}</dd>
                </div>
                <div>
                  <dt>জন্মতারিখ</dt>
                  <dd>১২ মার্চ ২০১৭ · ৮ বছর</dd>
                </div>
                <div>
                  <dt>অভিভাবক</dt>
                  <dd>{application.guardian}</dd>
                </div>
                <div>
                  <dt>ফোন</dt>
                  <dd>{application.phone}</dd>
                </div>
                <div>
                  <dt>আবাসিক</dt>
                  <dd>{application.residential ? "হ্যাঁ" : "না"}</dd>
                </div>
                <div>
                  <dt>শাখা নীতি</dt>
                  <dd>ছবি আবশ্যক</dd>
                </div>
              </dl>
            </div>
          </details>
          <details className="ad-section" open>
            <summary>
              <span>
                <FileCheck2 size={18} /> ডকুমেন্ট চেকলিস্ট
              </span>
              <ChevronDown size={17} />
            </summary>
            <div className="ad-checklist">
              {[
                ["জন্ম নিবন্ধন", "received"],
                ["আগের TC/প্রত্যয়ন", "missing"],
                ["ছবি", "exception"],
              ].map(([label, state]) => (
                <div key={label}>
                  <span className={state}>
                    <Check size={14} />
                  </span>
                  <b>{label}</b>
                  <select defaultValue={state}>
                    <option value="received">Received</option>
                    <option value="missing">Missing</option>
                    <option value="exception">Exception</option>
                  </select>
                  {state === "exception" && <small>কারণ: শাখা অফিসে তোলা হবে</small>}
                </div>
              ))}
            </div>
          </details>
          <details className="ad-section" open>
            <summary>
              <span>
                <ClipboardCheck size={18} /> সাক্ষাৎকার ও ভর্তি পরীক্ষা
              </span>
              <ChevronDown size={17} />
            </summary>
            <div className="ad-fields">
              <label>
                সময়সূচি
                <input defaultValue="১৪ নভেম্বর, ১০:৩০ AM" />
              </label>
              <label>
                ফলাফল
                <select defaultValue="উত্তীর্ণ">
                  <option>উত্তীর্ণ</option>
                  <option>পুনরায় মূল্যায়ন</option>
                  <option>অনুত্তীর্ণ</option>
                </select>
              </label>
              <label>
                বর্তমানে কতটুকু মুখস্থ
                <input defaultValue="৭ পারা · পৃষ্ঠা ১৪২" />
              </label>
              <label className="wide">
                পরীক্ষকের নোট
                <textarea defaultValue="তিলাওয়াত শুদ্ধ। মাখরাজে অল্প অনুশীলন প্রয়োজন।" />
              </label>
            </div>
          </details>
          {canViewSponsorship && (
            <details className="ad-section">
              <summary>
                <span>
                  <GraduationCap size={18} /> স্পন্সরশিপ / লিল্লাহ অনুরোধ <em>ঐচ্ছিক</em>
                </span>
                <ChevronDown size={17} />
              </summary>
              <div className="ad-fields">
                <label>
                  সহায়তার ধরন
                  <select>
                    <option>লিল্লাহ eligibility review</option>
                    <option>আংশিক waiver</option>
                  </select>
                </label>
                <label>
                  মাসিক পারিবারিক আয়
                  <input placeholder="৳" />
                </label>
              </div>
            </details>
          )}
        </div>
        <aside className="ad-review-aside">
          <section className={`ad-capacity ${application.full ? "full" : ""}`}>
            <span>
              <Building2 size={18} />
            </span>
            <div>
              <small>নির্বাচিত শাখা, ক্লাস ও লিঙ্গ</small>
              <b>{application.capacity}</b>
              <p>
                {application.branch} · {application.className} · {application.gender}
              </p>
            </div>
          </section>
          <section className="ad-timeline">
            <h2>
              <History size={17} /> স্ট্যাটাস টাইমলাইন
            </h2>
            {[
              ["Review শুরু", "রাশেদ আহমেদ · আজ, ১০:৪২"],
              ["Submitted", "অভিভাবক পোর্টাল · ৮ নভেম্বর"],
              ["Draft তৈরি", "ভর্তি ডেস্ক · ৬ নভেম্বর"],
            ].map(([title, meta]) => (
              <div key={title}>
                <i />
                <b>{title}</b>
                <small>{meta}</small>
              </div>
            ))}
          </section>
          <section className="ad-decision">
            {application.status === "Approved" || application.status === "Enrolled" ? (
              <>
                <div className="ad-approved-note">
                  <CheckCircle2 size={18} />
                  <div>
                    <b>অনুমোদিত</b>
                    <small>Invoice: {application.invoiceId}</small>
                  </div>
                </div>
                <button className="ds-button primary" onClick={enroll}>
                  {application.studentId ? "শিক্ষার্থী প্রোফাইল দেখুন" : "Enroll ও Student ID তৈরি"}
                </button>
              </>
            ) : application.full ? (
              <>
                <p>
                  <AlertTriangle size={15} /> আসন পূর্ণ থাকায় অনুমোদন করা যাবে না। আসন খালি হলে তালিকা থেকে
                  Review করুন।
                </p>
                <button
                  className="ds-button primary"
                  onClick={() => onUpdate({ status: "Waitlisted" })}
                >
                  Waitlist-এ রাখুন
                </button>
              </>
            ) : (
              <>
                <button
                  className="ds-button primary"
                  onClick={() => setDecision("approve")}
                  disabled={application.duplicate && !confirmedDifferent}
                >
                  <Check size={16} /> Approve
                </button>
                <button
                  className="ds-button secondary"
                  onClick={() => onUpdate({ status: "Waitlisted" })}
                >
                  Waitlist
                </button>
                <button className="ds-button danger" onClick={() => setDecision("reject")}>
                  Reject
                </button>
              </>
            )}
          </section>
        </aside>
      </div>
      {decision && (
        <div className="ad-modal-backdrop">
          <section className="ad-modal" role="dialog" aria-modal="true">
            <button className="ad-modal-x" onClick={() => setDecision(null)}>
              <X size={18} />
            </button>
            {decision === "approve" ? (
              <>
                <span className="ad-modal-icon">
                  <FileText size={22} />
                </span>
                <h2>আবেদন অনুমোদন করবেন?</h2>
                <p>
                  অনুমোদনের সাথে ভর্তি-ফি invoice স্বয়ংক্রিয়ভাবে তৈরি হবে। পুনরায় ক্লিক করলেও দ্বিতীয় invoice
                  বা শিক্ষার্থী তৈরি হবে না।
                </p>
                <div className="ad-invoice-preview">
                  <span>ভর্তি ফি</span>
                  <b>৳ ১২,০০০</b>
                  <span>অনুমোদিত waiver</span>
                  <b>− ৳ ২,০০০</b>
                  <strong>ব্যালেন্স</strong>
                  <strong>৳ ১০,০০০</strong>
                </div>
                <button className="ds-button primary" onClick={approve}>
                  অনুমোদন ও invoice তৈরি
                </button>
              </>
            ) : (
              <>
                <span className="ad-modal-icon danger">
                  <AlertTriangle size={22} />
                </span>
                <h2>প্রত্যাখ্যানের কারণ</h2>
                <p>এই কারণটি status timeline-এ সংরক্ষিত থাকবে।</p>
                <textarea
                  autoFocus
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="কারণ লিখুন (আবশ্যক)"
                />
                <button
                  className="ds-button danger"
                  disabled={!reason.trim()}
                  onClick={() => {
                    onUpdate({ status: "Rejected" });
                    setDecision(null);
                  }}
                >
                  Reject application
                </button>
              </>
            )}
          </section>
        </div>
      )}
      {application.studentId && (
        <div className="ad-toast">
          <CheckCircle2 size={18} />
          <div>
            <b>{application.studentId} তৈরি হয়েছে</b>
            <span>একই আবেদন থেকে আরেকটি Student ID তৈরি হবে না।</span>
          </div>
          <button onClick={() => onOpenStudent(application.studentId!)}>প্রোফাইল খুলুন</button>
        </div>
      )}
    </main>
  );
}

export default function AdmissionPipeline({
  role,
  onOpenStudent,
}: {
  role: PrototypeRole;
  onOpenStudent: (id: string) => void;
}) {
  const { decision: subscriptionAccess } = useSubscription();
  const newEnquiryAccess = subscriptionAccess("new-enquiry");
  const newAdmissionAccess = subscriptionAccess("new-admission");
  const permission = resolveAdmissionPermission(prototypeRoles[role].context);
  const [section, setSection] = useState<"enquiries" | "applications">("enquiries");
  const [view, setView] = useState<"board" | "list">("board");
  const [demoState, setDemoState] = useState<DemoState>("ready");
  const [enquiries, setEnquiries] = useState(initialEnquiries);
  const [applications, setApplications] = useState(initialApplications);
  const [activeStage, setActiveStage] = useState<Stage>("নতুন");
  const [status, setStatus] = useState<AppStatus | "All">("All");
  const [query, setQuery] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const review = applications.find((app) => app.id === reviewId);

  const move = (id: string, stage: Stage) => {
    if (stage === "বাতিল/হারানো") {
      const reason = window.prompt("হারানোর কারণ লিখুন (আবশ্যক)");
      if (!reason?.trim()) return;
      setEnquiries((items) =>
        items.map((item) => (item.id === id ? { ...item, stage, lostReason: reason } : item)),
      );
      return;
    }
    setEnquiries((items) => items.map((item) => (item.id === id ? { ...item, stage } : item)));
  };
  const convert = (enquiry: Enquiry) => {
    if (!newAdmissionAccess.allowed) return;
    const existing = applications.find((app) => app.phone === enquiry.phone);
    if (existing) {
      setReviewId(existing.id);
      setSection("applications");
      return;
    }
    const next: Application = {
      id: `APP-2026-${String(143 + applications.length).padStart(4, "0")}`,
      name: "নাম পূরণ করুন",
      guardian: enquiry.guardian,
      phone: enquiry.phone,
      gender: enquiry.gender,
      branch: "প্রধান শাখা",
      className: enquiry.className,
      track: enquiry.track,
      residential: enquiry.residential,
      age: "আজ",
      status: "Draft",
      capacity: "২৮/৩০ আসন পূর্ণ",
    };
    setApplications((items) => [next, ...items]);
    move(enquiry.id, "আবেদনে রূপান্তরিত");
    setReviewId(next.id);
    setSection("applications");
  };
  const filteredApplications = useMemo(
    () =>
      applications.filter(
        (app) =>
          (status === "All" || app.status === status) &&
          (!query || `${app.name} ${app.id}`.toLowerCase().includes(query.toLowerCase())),
      ),
    [applications, status, query],
  );

  if (permission.access === "hidden" || demoState === "denied")
    return (
      <main className="ad-main">
        <StatePanel state="denied" onNew={() => {}} />
      </main>
    );
  if (review)
    return (
      <ReviewDetail
        application={review}
        canViewSponsorship={permission.canViewSponsorship}
        onBack={() => setReviewId(null)}
        onUpdate={(patch) =>
          patch.status === "Enrolled" && !newAdmissionAccess.allowed
            ? undefined
            : setApplications((items) =>
                items.map((item) => (item.id === review.id ? { ...item, ...patch } : item)),
              )
        }
        onOpenStudent={onOpenStudent}
      />
    );

  return (
    <main className="ad-main">
      <div className="ad-page-head">
        <div>
          <span className="ad-kicker">B8 · ADMISSION PIPELINE</span>
          <h1>ভর্তি ব্যবস্থাপনা</h1>
          <p>Enquiry থেকে আবেদন, পর্যালোচনা ও enrollment—এক জায়গায়।</p>
        </div>
        <div>
          <label className="ad-demo">
            STATE
            <select value={demoState} onChange={(e) => setDemoState(e.target.value as DemoState)}>
              <option value="ready">Ready</option>
              <option value="loading">Loading</option>
              <option value="empty">Empty board</option>
              <option value="offline">Offline</option>
              <option value="denied">No permission</option>
            </select>
          </label>
          <button
            className="ds-button primary"
            disabled={!newEnquiryAccess.allowed}
            onClick={() => setNewOpen(true)}
          >
            <Plus size={16} /> নতুন enquiry
          </button>
        </div>
      </div>
      {!newAdmissionAccess.allowed && <BlockedActionNotice action="new-admission" compact />}
      <div className="ad-tabs">
        <button
          className={section === "enquiries" ? "active" : ""}
          onClick={() => setSection("enquiries")}
        >
          Enquiry board <span>{enquiries.length}</span>
        </button>
        <button
          className={section === "applications" ? "active" : ""}
          onClick={() => setSection("applications")}
        >
          Applications <span>{applications.length}</span>
        </button>
      </div>
      {demoState !== "ready" ? (
        <StatePanel state={demoState} onNew={() => setNewOpen(true)} />
      ) : section === "enquiries" ? (
        <>
          <div className="ad-toolbar">
            <div className="ad-stage-switch">
              <label>কলাম</label>
              <select value={activeStage} onChange={(e) => setActiveStage(e.target.value as Stage)}>
                {stages.map((stage) => (
                  <option key={stage}>
                    {stage} · {enquiries.filter((item) => item.stage === stage).length}
                  </option>
                ))}
              </select>
            </div>
            <div className="ad-view-toggle">
              <button className={view === "board" ? "active" : ""} onClick={() => setView("board")}>
                <Columns3 size={15} /> Board
              </button>
              <button className={view === "list" ? "active" : ""} onClick={() => setView("list")}>
                <LayoutList size={15} /> List
              </button>
            </div>
          </div>
          {view === "board" ? (
            <div className="ad-board">
              {stages.map((stage) => (
                <section
                  key={stage}
                  className={stage === activeStage ? "mobile-active" : ""}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => move(e.dataTransfer.getData("text/plain"), stage)}
                >
                  <header>
                    <span className={`ad-stage-dot s${stages.indexOf(stage)}`} />
                    <h2>{stage}</h2>
                    <b>{enquiries.filter((item) => item.stage === stage).length}</b>
                  </header>
                  <div>
                    {enquiries
                      .filter((item) => item.stage === stage)
                      .map((enquiry) => (
                        <EnquiryCard
                          key={enquiry.id}
                          enquiry={enquiry}
                          onMove={(next) => move(enquiry.id, next)}
                          onConvert={() => convert(enquiry)}
                        />
                      ))}
                    {!enquiries.some((item) => item.stage === stage) && (
                      <p className="ad-column-empty">এই ধাপে কেউ নেই</p>
                    )}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="ad-list">
              <div className="ad-list-head">
                <span>অভিভাবক</span>
                <span>শিক্ষার্থী</span>
                <span>ক্লাস / ট্র্যাক</span>
                <span>Follow-up</span>
                <span>ধাপ</span>
              </div>
              {enquiries.map((enquiry) => (
                <div key={enquiry.id}>
                  <span>
                    <b>{enquiry.guardian}</b>
                    <small>{maskPhone(enquiry.phone)}</small>
                  </span>
                  <span>
                    {enquiry.gender} · {enquiry.age}
                  </span>
                  <span>
                    {enquiry.className} · {enquiry.track}
                  </span>
                  <span className={enquiry.overdue ? "overdue" : ""}>{enquiry.followUp}</span>
                  <select
                    value={enquiry.stage}
                    onChange={(e) => move(enquiry.id, e.target.value as Stage)}
                  >
                    {stages.map((stage) => (
                      <option key={stage}>{stage}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="ad-app-toolbar">
            <label className="ad-search">
              <Search size={16} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="নাম বা application নম্বর"
              />
            </label>
            <div className="ad-filters">
              <button>
                শাখা <em>বালক/বালিকা</em>
                <ChevronDown size={13} />
              </button>
              <button>
                ক্লাস <ChevronDown size={13} />
              </button>
              <button>
                ট্র্যাক <ChevronDown size={13} />
              </button>
              <button>
                আবাসিক <ChevronDown size={13} />
              </button>
            </div>
          </div>
          <div className="ad-status-tabs">
            <button className={status === "All" ? "active" : ""} onClick={() => setStatus("All")}>
              All <span>{applications.length}</span>
            </button>
            {appStatuses.map((item) => (
              <button
                key={item}
                className={status === item ? "active" : ""}
                onClick={() => setStatus(item)}
              >
                {item}
                <span>{applications.filter((app) => app.status === item).length}</span>
              </button>
            ))}
          </div>
          {filteredApplications.length ? (
            <div className="ad-app-list">
              <div className="ad-app-head">
                <span>আবেদনকারী</span>
                <span>Application</span>
                <span>শাখা ও ক্লাস</span>
                <span>বয়স</span>
                <span>স্ট্যাটাস</span>
                <span />
              </div>
              {filteredApplications.map((app) => (
                <button key={app.id} onClick={() => setReviewId(app.id)}>
                  <span>
                    <i>{app.name.slice(0, 2)}</i>
                    <span>
                      <b>{app.name}</b>
                      <small>
                        {app.guardian} · {maskPhone(app.phone)}
                      </small>
                    </span>
                  </span>
                  <strong>{app.id}</strong>
                  <span>
                    {app.branch}
                    <small>
                      {app.gender} · {app.className} · {app.track}
                    </small>
                  </span>
                  <span>
                    <Clock3 size={13} /> {app.age}
                  </span>
                  <span className={`ad-status ${app.status.toLowerCase()}`}>{app.status}</span>
                  <ArrowRight size={16} />
                </button>
              ))}
            </div>
          ) : (
            <StatePanel state="no-results" onNew={() => {}} />
          )}
        </>
      )}
      {demoState === "offline" && (
        <div className="ad-offline-note">
          <WifiOff size={15} /> Offline · খসড়া এই ডিভাইসে রাখা হচ্ছে
        </div>
      )}
      {newOpen && (
        <div className="ad-modal-backdrop">
          <form
            className="ad-modal ad-quick-form"
            onSubmit={(e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              setEnquiries((items) => [
                {
                  id: `ENQ-0${269 + items.length}`,
                  guardian: String(data.get("guardian")),
                  phone: String(data.get("phone")),
                  gender: String(data.get("gender")) as "বালক" | "বালিকা",
                  age: String(data.get("age")),
                  className: String(data.get("className")),
                  track: "সাধারণ",
                  residential: data.get("residential") === "on",
                  source: String(data.get("source")),
                  followUp: "আগামীকাল",
                  stage: "নতুন",
                },
                ...items,
              ]);
              setNewOpen(false);
            }}
          >
            <button type="button" className="ad-modal-x" onClick={() => setNewOpen(false)}>
              <X size={18} />
            </button>
            <span className="ad-modal-icon">
              <Plus size={22} />
            </span>
            <h2>নতুন enquiry</h2>
            <p>প্রাথমিক তথ্য দিয়ে দ্রুত সংরক্ষণ করুন। পরে বিস্তারিত যোগ করা যাবে।</p>
            <div className="ad-fields">
              <label>
                অভিভাবকের নাম
                <input name="guardian" required autoFocus />
              </label>
              <label>
                ফোন
                <input name="phone" required pattern="[0-9]{11}" placeholder="01XXXXXXXXX" />
              </label>
              <label>
                শিক্ষার্থীর লিঙ্গ
                <select name="gender">
                  <option>বালক</option>
                  <option>বালিকা</option>
                </select>
              </label>
              <label>
                বয়স
                <input name="age" required placeholder="যেমন: ৮ বছর" />
              </label>
              <label>
                কাঙ্ক্ষিত ক্লাস
                <select name="className">
                  <option>হিফজ</option>
                  <option>নূরানী</option>
                  <option>নাজেরা</option>
                  <option>মিশকাত</option>
                </select>
              </label>
              <label>
                উৎস
                <select name="source">
                  <option>Walk-in</option>
                  <option>ওয়েবসাইট</option>
                  <option>রেফারেন্স</option>
                  <option>ফোন</option>
                </select>
              </label>
            </div>
            <label className="ad-check">
              <input type="checkbox" name="residential" /> আবাসিক আসন প্রয়োজন
            </label>
            <button className="ds-button primary" type="submit">
              Enquiry সংরক্ষণ করুন
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
