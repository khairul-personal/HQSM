import { useEffect, useMemo, useState } from "react";
import { createHashRouter, redirect, RouterProvider, useLocation, useNavigate } from "react-router";
import {
  AlertCircle,
  Bell,
  BookOpenCheck,
  FileText,
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Columns3,
  Download,
  Filter,
  GraduationCap,
  HandCoins,
  HeartPulse,
  IdCard,
  Import,
  LayoutDashboard,
  ListFilter,
  LoaderCircle,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  PanelLeftClose,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Settings,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  Users,
  WalletCards,
  WifiOff,
  X,
  type LucideIcon,
  LogOut,
  Palette,
} from "lucide-react";
import StudentProfile from "./StudentProfile";
import StaffDirectory from "./StaffDirectory";
import StaffProfile from "./StaffProfile";
import AdmissionPipeline from "./AdmissionPipeline";
import FeeCollection from "./FeeCollection";
import SponsorshipFunds from "./SponsorshipFunds";
import Homework from "./Homework";
import GuardianHome from "./GuardianHome";
import ExamPaperBuilder from "./ExamPaperBuilder";
import InstitutionSettings from "./InstitutionSettings";
import Login from "./Login";
import Dashboard from "./Dashboard";
import TeacherToday from "./TeacherToday";
import DesignSystemPage from "./DesignSystemPage";
import { InstitutionSettingsProvider, useInstitutionSettings } from "./InstitutionSettingsContext";
import { isPhotoVisible } from "./settings-domain";
import SystemStatesReview, {
  BlockedActionNotice,
  SubscriptionChrome,
  SubscriptionProvider,
  SystemState,
  useSubscription,
} from "./SystemStates";
import {
  appRoutes,
  guardianHomePath,
  isKnownRoute,
  isSectionPath,
  sectionPath,
  resultStudentIdFromPath,
  staffIdFromPath,
  staffPath,
  studentIdFromPath,
  studentPath,
  type AppSection,
} from "./app-routes";
import { staffRecords, type StaffRecord } from "./staff-data";
import { browserSessionStorage, loadStoredRole, storeRole } from "./prototype-role";
import {
  homeSectionForRole,
  prototypeRoles,
  resolveStudentPermission,
  resolveWorkspacePermission,
  staffRoleKeys,
  type PrototypeRole,
} from "./student-permissions";
import "./design-system.css";
import "./student-list.css";
import "./theme.css";

type ViewState = "ready" | "loading" | "empty" | "offline" | "denied";
type Status = "সক্রিয়" | "ছুটিতে" | "স্থগিত";
type Student = {
  id: string;
  nameBn: string;
  nameEn: string;
  initials: string;
  branch: "প্রধান শাখা" | "মিরপুর শাখা";
  className: string;
  section: string;
  halaqa: string;
  roll: number;
  status: Status;
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

const bn = (value: number | string) =>
  String(value).replace(/\d/g, (digit) => "০১২৩৪৫৬৭৮৯"[Number(digit)]);

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("bn-BD").format(amount).replace("BDT", "").trim();

const students: Student[] = [
  {
    id: "STU-10241",
    nameBn: "মুহাম্মদ আব্দুল্লাহ",
    nameEn: "Muhammad Abdullah",
    initials: "মআ",
    branch: "প্রধান শাখা",
    className: "হিফজ",
    section: "ক",
    halaqa: "উস্তাদ সালমান",
    roll: 4,
    status: "সক্রিয়",
    attendance: 96,
    dues: 0,
    gender: "বালক",
    residential: true,
    sponsored: true,
    medical: false,
    guardianPhone: "01712-345678",
    avatarTone: "sage",
    enrolledBy: "EMP-ADMISSION-001",
  },
  {
    id: "STU-10240",
    nameBn: "ফাতিমা তুয যাহরা",
    nameEn: "Fatima Tuz Zahra",
    initials: "ফয",
    branch: "প্রধান শাখা",
    className: "নূরানী",
    section: "খ",
    halaqa: "উম্মে সালামা",
    roll: 12,
    status: "সক্রিয়",
    attendance: 93,
    dues: 2500,
    gender: "বালিকা",
    residential: false,
    sponsored: false,
    medical: true,
    guardianPhone: "01819-774512",
    avatarTone: "rose",
    restricted: true,
    enrolledBy: "EMP-ADMISSION-001",
  },
  {
    id: "STU-10239",
    nameBn: "আহমাদ বিন হাসান",
    nameEn: "Ahmad Bin Hasan",
    initials: "আহ",
    branch: "মিরপুর শাখা",
    className: "মিশকাত",
    section: "ক",
    halaqa: "উস্তাদ মাহমুদ",
    roll: 7,
    status: "ছুটিতে",
    attendance: 78,
    dues: 4000,
    gender: "বালক",
    residential: true,
    sponsored: false,
    medical: true,
    guardianPhone: "01922-684930",
    avatarTone: "sand",
  },
  {
    id: "STU-10238",
    nameBn: "মারইয়াম বিনতে আলী",
    nameEn: "Maryam Binte Ali",
    initials: "মা",
    branch: "প্রধান শাখা",
    className: "হিফজ",
    section: "ক",
    halaqa: "উম্মে সালামা",
    roll: 9,
    status: "সক্রিয়",
    attendance: 98,
    dues: 0,
    gender: "বালিকা",
    residential: true,
    sponsored: true,
    medical: false,
    guardianPhone: "01638-442108",
    avatarTone: "violet",
    restricted: true,
  },
  {
    id: "STU-10237",
    nameBn: "ইয়াসিন আরাফাত",
    nameEn: "Yasin Arafat",
    initials: "ইআ",
    branch: "প্রধান শাখা",
    className: "হিফজ",
    section: "খ",
    halaqa: "উস্তাদ সালমান",
    roll: 15,
    status: "সক্রিয়",
    attendance: 88,
    dues: 1800,
    gender: "বালক",
    residential: false,
    sponsored: false,
    medical: false,
    guardianPhone: "01308-112745",
    avatarTone: "blue",
  },
  {
    id: "STU-10236",
    nameBn: "সুমাইয়া ইসলাম",
    nameEn: "Sumaiya Islam",
    initials: "সু",
    branch: "মিরপুর শাখা",
    className: "নাজেরা",
    section: "ক",
    halaqa: "ফাতিমা যাহরা",
    roll: 3,
    status: "স্থগিত",
    attendance: 64,
    dues: 3200,
    gender: "বালিকা",
    residential: false,
    sponsored: false,
    medical: false,
    guardianPhone: "01511-907231",
    avatarTone: "peach",
    restricted: true,
  },
  {
    id: "STU-10235",
    nameBn: "উমর ফারুক",
    nameEn: "Umar Faruq",
    initials: "উফ",
    branch: "প্রধান শাখা",
    className: "নাজেরা",
    section: "খ",
    halaqa: "উস্তাদ মাহমুদ",
    roll: 18,
    status: "সক্রিয়",
    attendance: 91,
    dues: 0,
    gender: "বালক",
    residential: false,
    sponsored: true,
    medical: false,
    guardianPhone: "01765-302248",
    avatarTone: "mint",
  },
];

/** Students enrolled from the admission pipeline in this prototype; opened by ID, not listed. */
const newlyEnrolled: Record<string, Student> = {
  "HQ-2026-00123": {
    ...students[0],
    id: "HQ-2026-00123",
    nameBn: "আয়েশা সিদ্দিকা",
    nameEn: "Ayesha Siddika",
    initials: "আসি",
    gender: "বালিকা",
    sponsored: false,
    guardianPhone: "01638-442108",
    enrolledBy: "EMP-ADMISSION-001",
  },
};

const filters = ["শাখা", "ক্লাস", "সেকশন", "হালাকা", "স্ট্যাটাস", "লিঙ্গ", "আবাসিক", "স্পন্সরড"];
const columns = ["হালাকা", "রোল", "স্ট্যাটাস", "উপস্থিতি", "বকেয়া", "ফ্ল্যাগ"];

const maskPhone = (phone: string) => `${phone.slice(0, 3)}•••${phone.slice(-4)}`;

function StatusBadge({ status }: { status: Status }) {
  const tone = status === "সক্রিয়" ? "success" : status === "ছুটিতে" ? "info" : "neutral";
  return (
    <span className={`ds-badge ${tone}`}>
      <i className="status-dot" />
      {status}
    </span>
  );
}

function AppShell({
  children,
  role,
  setRole,
  activeSection = "students",
  onNavigate,
}: {
  children: React.ReactNode;
  role: PrototypeRole;
  setRole: (role: PrototypeRole) => void;
  activeSection?: AppSection;
  onNavigate?: (section: AppSection) => void;
}) {
  const { settings } = useInstitutionSettings();
  const photosVisible = isPhotoVisible(settings, "main");
  return (
    <div className={`student-shell ds-page ${photosVisible ? "" : "photos-hidden"}`}>
      <aside className="student-sidebar">
        <div className="student-brand">
          <span>HQ</span>
          <div>
            <b>হলি কুরআন</b>
            <small>স্কুল এন্ড মাদরাসা</small>
          </div>
          <PanelLeftClose size={16} />
        </div>
        <nav aria-label="প্রধান নেভিগেশন">
          <button
            className={activeSection === "dashboard" ? "active" : ""}
            onClick={() => onNavigate?.("dashboard")}
          >
            <LayoutDashboard size={18} />
            <span>ওভারভিউ</span>
          </button>
          <p>একাডেমিক</p>
          <button
            className={activeSection === "admissions" ? "active" : ""}
            onClick={() => onNavigate?.("admissions")}
          >
            <ClipboardList size={18} />
            <span>ভর্তি ব্যবস্থাপনা</span>
            <b>১৪</b>
          </button>
          <button
            className={activeSection === "students" ? "active" : ""}
            onClick={() => onNavigate?.("students")}
          >
            <Users size={18} />
            <span>শিক্ষার্থী</span>
            <b>১২৪৮</b>
          </button>
          <button>
            <GraduationCap size={18} />
            <span>ক্লাস ও সেকশন</span>
          </button>
          <button
            className={activeSection === "attendance" ? "active" : ""}
            onClick={() => onNavigate?.("attendance")}
          >
            <IdCard size={18} />
            <span>আজ · হাজিরা</span>
          </button>
          <button
            className={activeSection === "homework" ? "active" : ""}
            onClick={() => onNavigate?.("homework")}
          >
            <BookOpenCheck size={18} />
            <span>হোমওয়ার্ক</span>
            <b>৬</b>
          </button>
          <button
            className={activeSection === "examPapers" ? "active" : ""}
            onClick={() => onNavigate?.("examPapers")}
          >
            <FileText size={18} />
            <span>প্রশ্নপত্র</span>
            <b>৩</b>
          </button>
          <button
            className={activeSection === "guardian" ? "active" : ""}
            onClick={() => onNavigate?.("guardian")}
          >
            <UserRound size={18} />
            <span>অভিভাবক হোম</span>
          </button>
          <p>পরিচালনা</p>
          <button
            className={activeSection === "staff" ? "active" : ""}
            onClick={() => onNavigate?.("staff")}
          >
            <BriefcaseBusiness size={18} />
            <span>শিক্ষক ও কর্মচারী</span>
            <b>৮৭</b>
          </button>
          <button
            className={activeSection === "fees" ? "active" : ""}
            onClick={() => onNavigate?.("fees")}
          >
            <WalletCards size={18} />
            <span>ফি ও পেমেন্ট</span>
          </button>
          <button
            className={activeSection === "sponsorships" ? "active" : ""}
            onClick={() => onNavigate?.("sponsorships")}
          >
            <HandCoins size={18} />
            <span>স্পন্সরশিপ ও ফান্ড</span>
            <b>৪</b>
          </button>
          <button>
            <MessageSquareText size={18} />
            <span>যোগাযোগ</span>
          </button>
          <button
            className={activeSection === "settings" ? "active" : ""}
            onClick={() => onNavigate?.("settings")}
          >
            <Settings size={18} />
            <span>সেটিংস</span>
          </button>
        </nav>
        <nav aria-label="Prototype">
          <p>Prototype</p>
          <button
            className={activeSection === "designSystem" ? "active" : ""}
            onClick={() => onNavigate?.("designSystem")}
          >
            <Palette size={18} />
            <span>ডিজাইন সিস্টেম</span>
          </button>
        </nav>
        <div className="sidebar-profile">
          <span className="ds-avatar small">রা</span>
          <div>
            <b>রাশেদ আহমেদ</b>
            <small>একাডেমিক অ্যাডমিন</small>
          </div>
          <button
            type="button"
            className="sidebar-signout"
            aria-label="সাইন আউট"
            title="সাইন আউট"
            onClick={() => onNavigate?.("login")}
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      <section className="student-workspace">
        <header className="student-topbar">
          <button className="mobile-menu" aria-label="মেনু">
            <Menu size={20} />
          </button>
          <button className="institution-picker">
            <span className="mini-mark">HQ</span>
            <div>
              <small>প্রতিষ্ঠান</small>
              <b>হলি কুরআন স্কুল</b>
            </div>
            <ChevronDown size={14} />
          </button>
          <button className="branch-picker">
            <Building2 size={16} />
            <div>
              <small>শাখা</small>
              <b>সকল শাখা</b>
            </div>
            <em>মিশ্র</em>
            <ChevronDown size={14} />
          </button>
          <div className="topbar-spacer" />
          <label className="role-switcher" title="Prototype permission role">
            <span>DEV ROLE</span>
            <select value={role} onChange={(event) => setRole(event.target.value as PrototypeRole)}>
              {(activeSection === "staff"
                ? staffRoleKeys.map(
                    (key) =>
                      [key, prototypeRoles[key]] as [
                        PrototypeRole,
                        (typeof prototypeRoles)[PrototypeRole],
                      ],
                  )
                : activeSection === "admissions"
                  ? (["admin", "admission-officer"] as PrototypeRole[]).map(
                      (key) =>
                        [key, prototypeRoles[key]] as [
                          PrototypeRole,
                          (typeof prototypeRoles)[PrototypeRole],
                        ],
                    )
                  : (Object.entries(prototypeRoles) as Array<
                      [PrototypeRole, (typeof prototypeRoles)[PrototypeRole]]
                    >)
              ).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </label>
          <span className="privacy-pill">
            <ShieldAlert size={14} /> সীমিত অ্যাক্সেস
          </span>
          <button className="icon-button" aria-label="নোটিফিকেশন">
            <Bell size={18} />
            <i />
          </button>
          <span className="ds-avatar small">রা</span>
        </header>
        {children}
      </section>
    </div>
  );
}

function EmptyState({
  state,
  clear,
  setState,
}: {
  state: Exclude<ViewState, "ready"> | "no-results";
  clear: () => void;
  setState: (state: ViewState) => void;
}) {
  if (state !== "no-results") {
    const kind = state === "denied" ? "no-permission" : state === "loading" ? "loading" : state;
    return (
      <SystemState
        kind={kind}
        title={state === "empty" ? "এখনও কোনো শিক্ষার্থী নেই" : undefined}
        message={
          state === "empty" ? "প্রথম শিক্ষার্থী যোগ করুন অথবা আগে থেকে থাকা তালিকা Import করুন।" : undefined
        }
        actionLabel={
          state === "empty"
            ? "প্রথম শিক্ষার্থী যোগ করুন"
            : state === "offline"
              ? "আবার চেষ্টা করুন"
              : undefined
        }
        onAction={state === "offline" ? () => setState("ready") : undefined}
      />
    );
  }
  return (
    <div className="student-state">
      <div className="state-icon">
        <ListFilter size={28} />
      </div>
      <h2>এই ফিল্টারে কোনো ফল নেই</h2>
      <p>বানান পরীক্ষা করুন অথবা সক্রিয় ফিল্টারগুলো মুছে আবার চেষ্টা করুন।</p>
      <button className="ds-button secondary" onClick={clear}>
        <RotateCcw size={15} />
        ফিল্টার মুছুন
      </button>
    </div>
  );
}

type BulkAction = "SMS" | "ID card print" | "section change";

function BulkPreview({
  action,
  selected,
  role,
  onClose,
  onDone,
}: {
  action: BulkAction;
  selected: Student[];
  role: PrototypeRole;
  onClose: () => void;
  onDone: () => void;
}) {
  const { decision: subscriptionAccess } = useSubscription();
  const smsAccess = subscriptionAccess("bulk-promotional-message");
  const [step, setStep] = useState<"preview" | "confirm" | "result">("preview");
  const excluded =
    action === "SMS"
      ? selected.filter(
          (student) =>
            resolveStudentPermission(student, prototypeRoles[role].context).fields.phone !==
            "visible",
        )
      : [];
  const affected = selected.length - excluded.length;
  const labels = {
    SMS: ["SMS পাঠান", "অভিভাবকের নম্বরে নির্বাচিত বার্তা পাঠানো হবে"],
    "ID card print": ["ID কার্ড প্রিন্ট", "নির্বাচিত শিক্ষার্থীদের কার্ড PDF হিসেবে তৈরি হবে"],
    "section change": ["সেকশন পরিবর্তন", "নির্বাচিত শিক্ষার্থীদের নতুন সেকশনে নেওয়া হবে"],
  }[action];
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="bulk-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header>
          <div className={`modal-symbol ${step === "result" ? "done" : ""}`}>
            {step === "result" ? (
              <Check size={20} />
            ) : action === "SMS" ? (
              <MessageSquareText size={20} />
            ) : action === "ID card print" ? (
              <Printer size={20} />
            ) : (
              <ChevronsUpDown size={20} />
            )}
          </div>
          <div>
            <small>
              {step === "preview" ? "PREVIEW" : step === "confirm" ? "CONFIRM" : "COMPLETE"}
            </small>
            <h2 id="bulk-title">{step === "result" ? "কাজটি সম্পন্ন হয়েছে" : labels[0]}</h2>
          </div>
          <button onClick={onClose} aria-label="বন্ধ করুন">
            <X size={19} />
          </button>
        </header>
        {step === "preview" && (
          <div className="modal-content">
            <p>{labels[1]}</p>
            {action === "SMS" && !smsAccess.allowed && (
              <BlockedActionNotice action="bulk-promotional-message" compact />
            )}
            <div className="impact-grid">
              <div>
                <span>প্রভাবিত হবে</span>
                <b>{bn(affected)} জন</b>
              </div>
              <div className={excluded.length ? "warning" : ""}>
                <span>বাদ যাবে</span>
                <b>{bn(excluded.length)} জন</b>
              </div>
            </div>
            {action === "SMS" && (
              <label className="message-preview">
                <span>বার্তার প্রিভিউ</span>
                <textarea defaultValue="সম্মানিত অভিভাবক, আপনার সন্তানের মাসিক অগ্রগতি প্রতিবেদন প্রস্তুত হয়েছে। — হলি কুরআন স্কুল" />
              </label>
            )}
            {action === "section change" && (
              <label className="section-select">
                <span>নতুন সেকশন</span>
                <select defaultValue="">
                  <option value="" disabled>
                    সেকশন নির্বাচন করুন
                  </option>
                  <option>হিফজ — খ</option>
                  <option>নাজেরা — ক</option>
                </select>
              </label>
            )}
            {excluded.length > 0 && (
              <div className="excluded-box">
                <b>
                  <AlertCircle size={15} /> বাদ পড়বে
                </b>
                {excluded.map((s) => (
                  <p key={s.id}>
                    <span>{s.nameBn}</span>
                    <small>অভিভাবকের ফোন দেখার অনুমতি নেই</small>
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
        {step === "confirm" && (
          <div className="confirm-view">
            <div className="confirm-ring">
              <Check size={24} />
            </div>
            <h3>{bn(affected)} জনের জন্য নিশ্চিত করবেন?</h3>
            <p>নিশ্চিত করার পর কাজটি সঙ্গে সঙ্গে শুরু হবে।</p>
          </div>
        )}
        {step === "result" && (
          <div className="result-view">
            <div>
              <CheckCircle2 size={18} />
              <span>
                <b>{bn(affected)} জন</b>
                <small>সফলভাবে সম্পন্ন</small>
              </span>
            </div>
            {excluded.length > 0 && (
              <div className="skipped">
                <AlertCircle size={18} />
                <span>
                  <b>{bn(excluded.length)} জন</b>
                  <small>অনুমতির কারণে বাদ</small>
                </span>
              </div>
            )}
            <p>এই কাজের বিস্তারিত Activity log-এ সংরক্ষিত হয়েছে।</p>
          </div>
        )}
        <footer>
          {step !== "result" ? (
            <button className="ds-button secondary" onClick={onClose}>
              বাতিল
            </button>
          ) : (
            <span />
          )}
          <button
            className="ds-button primary"
            disabled={action === "SMS" && !smsAccess.allowed}
            onClick={() =>
              step === "preview"
                ? setStep("confirm")
                : step === "confirm"
                  ? setStep("result")
                  : (onDone(), onClose())
            }
          >
            {step === "preview" ? "পরবর্তী" : step === "confirm" ? "নিশ্চিত করুন" : "সম্পন্ন"}{" "}
            <ChevronLeft size={15} />
          </button>
        </footer>
      </section>
    </div>
  );
}

function StudentList({
  role,
  setRole,
  onOpenStudent,
  onNavigate,
}: {
  role: PrototypeRole;
  setRole: (role: PrototypeRole) => void;
  onOpenStudent: (student: Student) => void;
  onNavigate?: (section: AppSection) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [shownColumns, setShownColumns] = useState(columns);
  const [columnMenu, setColumnMenu] = useState(false);
  const [filterSheet, setFilterSheet] = useState(false);
  const [bulkAction, setBulkAction] = useState<BulkAction | null>(null);
  const [state, setState] = useState<ViewState>("ready");
  const permissionContext = prototypeRoles[role].context;

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    return students.filter((student) => {
      const permission = resolveStudentPermission(student, permissionContext);
      if (permission.list === "hidden") return false;
      const searchablePhone = permission.fields.phone === "visible" ? student.guardianPhone : "";
      const text = [student.nameBn, student.nameEn, student.id, student.roll, searchablePhone]
        .join(" ")
        .toLowerCase();
      if (normalized && !text.includes(normalized)) return false;
      if (activeFilters.includes("বকেয়া আছে") && !student.dues) return false;
      if (activeFilters.includes("স্পন্সরড") && !student.sponsored) return false;
      if (activeFilters.includes("আবাসিক") && !student.residential) return false;
      if (
        (activeFilters.includes("হিফজ") || activeFilters.includes("ক্লাস")) &&
        student.className !== "হিফজ"
      )
        return false;
      if (activeFilters.includes("শাখা") && student.branch !== "প্রধান শাখা") return false;
      if (activeFilters.includes("সেকশন") && student.section !== "ক") return false;
      if (activeFilters.includes("হালাকা") && student.halaqa !== "উস্তাদ সালমান") return false;
      if (activeFilters.includes("স্ট্যাটাস") && student.status !== "সক্রিয়") return false;
      if (activeFilters.includes("লিঙ্গ") && student.gender !== "বালক") return false;
      return true;
    });
  }, [activeFilters, permissionContext, query]);

  const clearFilters = () => {
    setQuery("");
    setActiveFilters([]);
  };
  const toggleFilter = (filter: string) =>
    setActiveFilters((old) =>
      old.includes(filter) ? old.filter((item) => item !== filter) : [...old, filter],
    );
  const allSelected = filtered.length > 0 && filtered.every((s) => selected.includes(s.id));
  const selectedStudents = students.filter(
    (student) =>
      selected.includes(student.id) &&
      resolveStudentPermission(student, permissionContext).list !== "hidden",
  );
  const showCol = (name: string) => shownColumns.includes(name);

  return (
    <AppShell role={role} setRole={setRole} activeSection="students" onNavigate={onNavigate}>
      <main className="student-main">
        <div className="page-heading">
          <div>
            <p>
              <span>একাডেমিক</span>
              <ChevronLeft size={13} />
              শিক্ষার্থী
            </p>
            <h1>
              শিক্ষার্থী <small>{state === "empty" ? "০" : "১,২৪৮"} জন</small>
            </h1>
            <span>সকল শাখা ও সক্রিয় শিক্ষাবর্ষের শিক্ষার্থী</span>
          </div>
          <div className="page-actions">
            <label className="state-switcher" title="ডেমো স্টেট">
              <span>দৃশ্য</span>
              <select value={state} onChange={(e) => setState(e.target.value as ViewState)}>
                <option value="ready">স্বাভাবিক</option>
                <option value="loading">লোডিং</option>
                <option value="empty">খালি প্রতিষ্ঠান</option>
                <option value="offline">অফলাইন</option>
                <option value="denied">অনুমতি নেই</option>
              </select>
            </label>
            <button className="ds-button secondary">
              <Import size={16} />
              Import
            </button>
            <button className="ds-button primary">
              <Plus size={16} />
              নতুন শিক্ষার্থী
            </button>
          </div>
        </div>

        {state === "ready" ? (
          <>
            <section className="list-toolbar">
              <div className="search-and-mobile-filter">
                <label className="student-search">
                  <Search size={18} />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="নাম, ID, রোল বা অভিভাবকের ফোন"
                  />
                  {query && (
                    <button onClick={() => setQuery("")} aria-label="সার্চ মুছুন">
                      <X size={15} />
                    </button>
                  )}
                </label>
                <button className="mobile-filter-button" onClick={() => setFilterSheet(true)}>
                  <Filter size={17} />
                  ফিল্টার{activeFilters.length > 0 && <b>{bn(activeFilters.length)}</b>}
                </button>
              </div>
              <div className="saved-views">
                <span>
                  <Sparkles size={14} />
                  সংরক্ষিত ভিউ
                </span>
                <button
                  className={activeFilters.includes("হিফজ") ? "active" : ""}
                  onClick={() => setActiveFilters(["হিফজ"])}
                >
                  আমার হিফজ বিভাগ
                </button>
                <button
                  className={activeFilters.includes("বকেয়া আছে") ? "active" : ""}
                  onClick={() => setActiveFilters(["বকেয়া আছে"])}
                >
                  বকেয়াদার
                </button>
              </div>
              <div className="filter-chips">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    className={activeFilters.includes(filter) ? "active" : ""}
                    onClick={() => toggleFilter(filter)}
                  >
                    {filter === "শাখা" && <span className="branch-gender mixed">মিশ্র</span>}
                    {filter}
                    {activeFilters.includes(filter) && (
                      <small>
                        ·{" "}
                        {filter === "শাখা"
                          ? "প্রধান"
                          : filter === "ক্লাস"
                            ? "হিফজ"
                            : filter === "সেকশন"
                              ? "ক"
                              : filter === "হালাকা"
                                ? "সালমান"
                                : filter === "স্ট্যাটাস"
                                  ? "সক্রিয়"
                                  : filter === "লিঙ্গ"
                                    ? "বালক"
                                    : "হ্যাঁ"}
                      </small>
                    )}
                    <ChevronDown size={13} />
                  </button>
                ))}
                <button
                  className={activeFilters.includes("বকেয়া আছে") ? "active danger-filter" : ""}
                  onClick={() => toggleFilter("বকেয়া আছে")}
                >
                  <WalletCards size={14} />
                  বকেয়া আছে
                </button>
                {activeFilters.length > 0 && (
                  <button className="clear-button" onClick={clearFilters}>
                    <X size={14} />
                    মুছুন
                  </button>
                )}
              </div>
            </section>

            {filtered.length === 0 ? (
              <EmptyState state="no-results" clear={clearFilters} setState={setState} />
            ) : (
              <>
                <div className="table-meta">
                  <span>
                    <b>{bn(filtered.length)}</b> জন দেখানো হচ্ছে
                  </span>
                  <div>
                    <div className="column-control">
                      <button onClick={() => setColumnMenu(!columnMenu)}>
                        <Columns3 size={16} />
                        কলাম
                        <ChevronDown size={13} />
                      </button>
                      {columnMenu && (
                        <div className="column-menu">
                          <b>দৃশ্যমান কলাম</b>
                          {columns.map((column) => (
                            <label key={column}>
                              <input
                                type="checkbox"
                                checked={showCol(column)}
                                onChange={() =>
                                  setShownColumns((old) =>
                                    old.includes(column)
                                      ? old.filter((c) => c !== column)
                                      : [...old, column],
                                  )
                                }
                              />
                              <span>
                                <Check size={12} />
                              </span>
                              {column}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="density-toggle" aria-label="সারি ঘনত্ব">
                      <button
                        className={density === "comfortable" ? "active" : ""}
                        onClick={() => setDensity("comfortable")}
                        title="স্বাভাবিক"
                      >
                        <Menu size={15} />
                      </button>
                      <button
                        className={density === "compact" ? "active" : ""}
                        onClick={() => setDensity("compact")}
                        title="সংক্ষিপ্ত"
                      >
                        <SlidersHorizontal size={15} />
                      </button>
                    </div>
                    <button className="export-button">
                      <Download size={15} />
                      Export
                    </button>
                  </div>
                </div>
                <section className={`student-table-wrap ${density}`}>
                  <table>
                    <thead>
                      <tr>
                        <th className="check-cell">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={() =>
                              setSelected(allSelected ? [] : filtered.map((s) => s.id))
                            }
                            aria-label="সব নির্বাচন"
                          />
                        </th>
                        <th>শিক্ষার্থী</th>
                        <th>ID</th>
                        <th>ক্লাস / সেকশন</th>
                        {showCol("হালাকা") && <th>হালাকা</th>}
                        {showCol("রোল") && <th className="num-col">রোল</th>}
                        {showCol("স্ট্যাটাস") && <th>স্ট্যাটাস</th>}
                        {showCol("উপস্থিতি") && <th>এই মাসে হাজিরা</th>}
                        {showCol("বকেয়া") && <th className="num-col">বকেয়া</th>}
                        {showCol("ফ্ল্যাগ") && <th>ফ্ল্যাগ</th>}
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((student) => (
                        <tr
                          key={student.id}
                          className={selected.includes(student.id) ? "selected" : ""}
                          onClick={() => onOpenStudent(student)}
                        >
                          <td className="check-cell">
                            <input
                              type="checkbox"
                              checked={selected.includes(student.id)}
                              onClick={(event) => event.stopPropagation()}
                              onChange={() =>
                                setSelected((old) =>
                                  old.includes(student.id)
                                    ? old.filter((id) => id !== student.id)
                                    : [...old, student.id],
                                )
                              }
                              aria-label={`${student.nameBn} নির্বাচন`}
                            />
                          </td>
                          <td>
                            <div className="student-identity">
                              <span className={`student-avatar ${student.avatarTone}`}>
                                {student.initials}
                                {(student.restricted ||
                                  resolveStudentPermission(student, permissionContext).list ===
                                    "masked") && <ShieldAlert size={10} />}
                              </span>
                              <div>
                                <b>{student.nameBn}</b>
                                <small>{student.nameEn}</small>
                                {query.replace(/\D/g, "").length >= 3 &&
                                  !student.restricted &&
                                  student.guardianPhone
                                    .replace(/\D/g, "")
                                    .includes(query.replace(/\D/g, "")) && (
                                    <small className="phone-match">
                                      অভিভাবক · {maskPhone(student.guardianPhone)}
                                    </small>
                                  )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <code>{student.id}</code>
                          </td>
                          <td>
                            <b className="class-name">{student.className}</b>
                            <small className="section-name">
                              সেকশন {student.section} · {student.gender}
                            </small>
                          </td>
                          {showCol("হালাকা") && (
                            <td>
                              <span className="halaqa-name">{student.halaqa}</span>
                            </td>
                          )}
                          {showCol("রোল") && (
                            <td>
                              <span className="roll">{bn(student.roll)}</span>
                            </td>
                          )}
                          {showCol("স্ট্যাটাস") && (
                            <td>
                              <StatusBadge status={student.status} />
                            </td>
                          )}
                          {showCol("উপস্থিতি") && (
                            <td>
                              <div className={`attendance ${student.attendance < 80 ? "low" : ""}`}>
                                <span>
                                  <i style={{ width: `${student.attendance}%` }} />
                                </span>
                                <b>{bn(student.attendance)}%</b>
                              </div>
                            </td>
                          )}
                          {showCol("বকেয়া") && (
                            <td>
                              <b className={student.dues ? "dues has-dues" : "dues"}>
                                {student.dues ? `৳ ${formatMoney(student.dues)}` : "—"}
                              </b>
                            </td>
                          )}
                          {showCol("ফ্ল্যাগ") && (
                            <td>
                              <div className="flags">
                                {student.sponsored && (
                                  <span title="স্পন্সরড">
                                    <Sparkles size={14} />
                                  </span>
                                )}
                                {student.medical &&
                                  resolveStudentPermission(student, permissionContext).fields
                                    .health === "visible" && (
                                    <span className="medical" title="মেডিকেল অ্যালার্ট">
                                      <HeartPulse size={15} />
                                    </span>
                                  )}
                              </div>
                            </td>
                          )}
                          <td>
                            <button className="row-menu" aria-label="আরও অপশন">
                              <MoreHorizontal size={17} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
                <section className="mobile-cards">
                  {filtered.map((student) => (
                    <article
                      key={student.id}
                      className={selected.includes(student.id) ? "selected" : ""}
                      onClick={() => onOpenStudent(student)}
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(student.id)}
                        onClick={(event) => event.stopPropagation()}
                        onChange={() =>
                          setSelected((old) =>
                            old.includes(student.id)
                              ? old.filter((id) => id !== student.id)
                              : [...old, student.id],
                          )
                        }
                      />
                      <span className={`student-avatar ${student.avatarTone}`}>
                        {student.initials}
                        {(student.restricted ||
                          resolveStudentPermission(student, permissionContext).list ===
                            "masked") && <ShieldAlert size={10} />}
                      </span>
                      <div className="mobile-card-info">
                        <h3>{student.nameBn}</h3>
                        <p>
                          {student.className} · সেকশন {student.section} <i /> রোল {bn(student.roll)}
                        </p>
                        <StatusBadge status={student.status} />
                      </div>
                      <div className="mobile-dues">
                        <small>বকেয়া</small>
                        <b className={student.dues ? "has-dues" : ""}>
                          {student.dues ? `৳ ${formatMoney(student.dues)}` : "—"}
                        </b>
                        <ChevronLeft size={16} />
                      </div>
                    </article>
                  ))}
                </section>
                <div className="pagination">
                  <span>
                    {bn(1)}–{bn(filtered.length)} দেখানো হচ্ছে
                  </span>
                  <div>
                    <button disabled>
                      <ChevronRight size={15} />
                    </button>
                    <b>১</b>
                    <button>
                      <ChevronLeft size={15} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <EmptyState state={state} clear={clearFilters} setState={setState} />
        )}
      </main>

      {selected.length > 0 && (
        <div className="bulk-bar">
          <div>
            <span>{bn(selected.length)}</span>
            <b>{bn(selected.length)} জন নির্বাচিত</b>
            <button onClick={() => setSelected([])}>নির্বাচন বাতিল</button>
          </div>
          <i />
          <button onClick={() => setBulkAction("SMS")}>
            <MessageSquareText size={17} />
            SMS
          </button>
          <button onClick={() => setBulkAction("ID card print")}>
            <Printer size={17} />
            ID কার্ড প্রিন্ট
          </button>
          <button onClick={() => setBulkAction("section change")}>
            <ChevronsUpDown size={17} />
            সেকশন পরিবর্তন
          </button>
        </div>
      )}
      {filterSheet && (
        <div className="sheet-backdrop" onClick={() => setFilterSheet(false)}>
          <section className="filter-sheet" onClick={(e) => e.stopPropagation()}>
            <header>
              <div>
                <h2>ফিল্টার</h2>
                <p>তালিকার শিক্ষার্থী সংকুচিত করুন</p>
              </div>
              <button onClick={() => setFilterSheet(false)}>
                <X size={20} />
              </button>
            </header>
            <div className="sheet-body">
              <h3>সংরক্ষিত ভিউ</h3>
              <div className="sheet-saved">
                <button onClick={() => setActiveFilters(["হিফজ"])}>আমার হিফজ বিভাগ</button>
                <button onClick={() => setActiveFilters(["বকেয়া আছে"])}>বকেয়াদার</button>
              </div>
              <h3>ফিল্টার করুন</h3>
              {filters.map((filter) => (
                <button
                  key={filter}
                  className={activeFilters.includes(filter) ? "active" : ""}
                  onClick={() => toggleFilter(filter)}
                >
                  <span>
                    {filter}
                    {filter === "শাখা" && <em>মিশ্র</em>}
                  </span>
                  {activeFilters.includes(filter) ? <Check size={17} /> : <ChevronLeft size={17} />}
                </button>
              ))}
              <button
                className={activeFilters.includes("বকেয়া আছে") ? "active" : ""}
                onClick={() => toggleFilter("বকেয়া আছে")}
              >
                <span>বকেয়া আছে</span>
                {activeFilters.includes("বকেয়া আছে") ? (
                  <Check size={17} />
                ) : (
                  <ChevronLeft size={17} />
                )}
              </button>
            </div>
            <footer>
              <button className="ds-button secondary" onClick={clearFilters}>
                সব মুছুন
              </button>
              <button className="ds-button primary" onClick={() => setFilterSheet(false)}>
                {bn(filtered.length)} জন দেখুন
              </button>
            </footer>
          </section>
        </div>
      )}
      {bulkAction && (
        <BulkPreview
          action={bulkAction}
          selected={selectedStudents}
          role={role}
          onClose={() => setBulkAction(null)}
          onDone={() => setSelected([])}
        />
      )}
    </AppShell>
  );
}

function Application() {
  const { pathname: route } = useLocation();
  const [role, setRole] = useState<PrototypeRole>(
    () =>
      loadStoredRole(browserSessionStorage()) ??
      (isSectionPath(route, "dashboard")
        ? "muhtamim"
        : isSectionPath(route, "examPapers")
          ? "exam-controller"
          : isSectionPath(route, "guardian") || isSectionPath(route, "results")
            ? "guardian"
            : isSectionPath(route, "homework") || isSectionPath(route, "attendance")
              ? "class-teacher"
              : "finance-lead"),
  );
  useEffect(() => storeRole(browserSessionStorage(), role), [role]);
  const navigate = useNavigate();
  const navigateToSection = (section: AppSection) => {
    if (
      section === "homework" &&
      !["class-teacher", "guardian", "admin", "academic-admin"].includes(role)
    ) {
      setRole("class-teacher");
    }
    if (section === "guardian") setRole("guardian");
    if (section === "examPapers" && !["admin", "exam-controller", "class-teacher"].includes(role))
      setRole("exam-controller");
    navigate(sectionPath(section));
  };
  const staffId = staffIdFromPath(route);
  const openStaff: StaffRecord | undefined = staffRecords.find((staff) => staff.id === staffId);
  const resultStudentId = resultStudentIdFromPath(route);
  const studentId = studentIdFromPath(route) || resultStudentId;
  const openStudent: Student | undefined = studentId
    ? (students.find((student) => student.id === studentId) ?? newlyEnrolled[studentId])
    : undefined;
  const notFound =
    !isKnownRoute(route) ||
    (studentId !== "" && openStudent === undefined) ||
    (staffId !== "" && openStaff === undefined);
  const staffSection = isSectionPath(route, "staff");
  const admissionSection = isSectionPath(route, "admissions");
  const feeSection = isSectionPath(route, "fees");
  const sponsorshipSection = isSectionPath(route, "sponsorships");
  const homeworkSection = isSectionPath(route, "homework");
  const guardianSection = isSectionPath(route, "guardian");
  const systemStatesSection = isSectionPath(route, "systemStates");
  const examPapersSection = isSectionPath(route, "examPapers");
  const settingsSection = isSectionPath(route, "settings");
  const loginSection = isSectionPath(route, "login");
  const designSystemSection = isSectionPath(route, "designSystem");
  const dashboardSection = isSectionPath(route, "dashboard");
  const attendanceSection = isSectionPath(route, "attendance");

  return (
    <>
      {!loginSection && <SubscriptionChrome />}
      {loginSection ? (
        <Login
          onSignedIn={(membership) => {
            setRole(membership.role);
            storeRole(browserSessionStorage(), membership.role);
            try {
              browserSessionStorage()?.setItem("madrasa.institution", membership.institutionId);
            } catch {
              // storage blocked: institution falls back to the default
            }
            navigate(sectionPath(homeSectionForRole(membership.role)), { replace: true });
          }}
        />
      ) : notFound ? (
        <AppShell role={role} setRole={setRole} onNavigate={navigateToSection}>
          <SystemState
            kind="not-found"
            onAction={() =>
              navigate(isSectionPath(route, "staff") ? appRoutes.staff : appRoutes.students)
            }
          />
        </AppShell>
      ) : designSystemSection ? (
        resolveWorkspacePermission(prototypeRoles[role].context).designSystem ? (
          <DesignSystemPage onClose={() => navigate(sectionPath(homeSectionForRole(role)))} />
        ) : (
          <AppShell role={role} setRole={setRole} onNavigate={navigateToSection}>
            <SystemState kind="no-permission" />
          </AppShell>
        )
      ) : dashboardSection ? (
        <AppShell
          role={role}
          setRole={setRole}
          activeSection="dashboard"
          onNavigate={navigateToSection}
        >
          <Dashboard role={role} />
        </AppShell>
      ) : attendanceSection ? (
        <AppShell
          role={role}
          setRole={setRole}
          activeSection="attendance"
          onNavigate={navigateToSection}
        >
          <TeacherToday role={role} />
        </AppShell>
      ) : settingsSection ? (
        <AppShell
          role={role}
          setRole={setRole}
          activeSection="settings"
          onNavigate={navigateToSection}
        >
          <InstitutionSettings role={role} />
        </AppShell>
      ) : examPapersSection ? (
        <AppShell
          role={role}
          setRole={setRole}
          activeSection="examPapers"
          onNavigate={navigateToSection}
        >
          <ExamPaperBuilder role={role} />
        </AppShell>
      ) : systemStatesSection ? (
        <AppShell
          role={role}
          setRole={setRole}
          activeSection="systemStates"
          onNavigate={navigateToSection}
        >
          <SystemStatesReview />
        </AppShell>
      ) : guardianSection ? (
        <GuardianHome role={role} setRole={setRole} />
      ) : homeworkSection ? (
        role === "guardian" ? (
          <Homework role={role} setRole={setRole} />
        ) : (
          <AppShell
            role={role}
            setRole={setRole}
            activeSection="homework"
            onNavigate={navigateToSection}
          >
            <Homework role={role} setRole={setRole} />
          </AppShell>
        )
      ) : sponsorshipSection ? (
        <AppShell
          role={role}
          setRole={setRole}
          activeSection="sponsorships"
          onNavigate={navigateToSection}
        >
          <SponsorshipFunds role={role} />
        </AppShell>
      ) : feeSection ? (
        <AppShell role={role} setRole={setRole} activeSection="fees" onNavigate={navigateToSection}>
          <FeeCollection role={role} />
        </AppShell>
      ) : admissionSection ? (
        <AppShell
          role={role}
          setRole={setRole}
          activeSection="admissions"
          onNavigate={(section) => {
            if (section === "staff" && !staffRoleKeys.includes(role)) setRole("admin");
            if (section === "admissions" && role !== "admin" && role !== "admission-officer")
              setRole("admin");
            navigateToSection(section);
          }}
        >
          <AdmissionPipeline
            role={role}
            onOpenStudent={(studentId) => navigate(studentPath(studentId))}
          />
        </AppShell>
      ) : staffSection ? (
        <AppShell
          role={role}
          setRole={setRole}
          activeSection="staff"
          onNavigate={(section) => {
            if (section === "staff" && !staffRoleKeys.includes(role)) setRole("admin");
            navigateToSection(section);
          }}
        >
          {openStaff ? (
            <StaffProfile staff={openStaff} role={role} onBack={() => navigate(appRoutes.staff)} />
          ) : (
            <StaffDirectory role={role} onOpenStaff={(staff) => navigate(staffPath(staff.id))} />
          )}
        </AppShell>
      ) : (
        <>
          <div hidden={openStudent !== undefined}>
            <StudentList
              role={role}
              setRole={setRole}
              onOpenStudent={(student) => navigate(studentPath(student.id))}
              onNavigate={(section) => {
                if (section === "staff" && !staffRoleKeys.includes(role)) setRole("admin");
                navigateToSection(section);
              }}
            />
          </div>
          {openStudent && (
            <AppShell
              role={role}
              setRole={setRole}
              activeSection="students"
              onNavigate={(section) => {
                if (section === "staff" && !staffRoleKeys.includes(role)) setRole("admin");
                navigateToSection(section);
              }}
            >
              <StudentProfile
                student={openStudent}
                role={role}
                initialTab={resultStudentId ? "পরীক্ষা ও ফলাফল" : undefined}
                onBack={() =>
                  navigate(resultStudentId ? guardianHomePath(resultStudentId) : appRoutes.students)
                }
              />
            </AppShell>
          )}
        </>
      )}
    </>
  );
}

const router = createHashRouter([
  {
    path: "/",
    loader: () => redirect(appRoutes.login),
  },
  {
    path: "*",
    Component: Application,
  },
]);

export default function App() {
  return (
    <InstitutionSettingsProvider>
      <SubscriptionProvider>
        <RouterProvider router={router} />
      </SubscriptionProvider>
    </InstitutionSettingsProvider>
  );
}
