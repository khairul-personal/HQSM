import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  FileAudio,
  FileText,
  Image,
  Link2,
  LoaderCircle,
  Mic,
  MoreHorizontal,
  Paperclip,
  Pause,
  Play,
  Plus,
  RefreshCcw,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  Smartphone,
  UploadCloud,
  UserRound,
  Users,
  WifiOff,
  X,
  type LucideIcon,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import {
  canAcceptLateAsOnTime,
  canAssignHomework,
  canGuardianOpenHomework,
  completionPercentage,
  validateSubmissionFile,
  type HomeworkAudience,
  type HomeworkSubmission,
} from "./homework-domain";
import { appRoutes, homeworkCheckPath, homeworkChildPath } from "./app-routes";
import {
  prototypeRoles,
  resolveHomeworkPermission,
  type PrototypeRole,
} from "./student-permissions";
import { SystemState, useSubscription } from "./SystemStates";
import {
  discardQueued,
  findOutboxItem,
  flushOutbox,
  loadOutbox,
  queueSubmission,
  saveOutbox,
  type OutboxItem,
  type OutboxStorage,
} from "./homework-outbox";
import "./homework.css";

type HomeworkKind = "লিখিত" | "ফাইল" | "অডিও" | "অফলাইন";
type DemoState = "ready" | "loading" | "empty" | "offline" | "upload-failed" | "denied";

type HomeworkItem = {
  id: string;
  title: string;
  subject: string;
  audience: string;
  kind: HomeworkKind;
  due: string;
  dueLabel: string;
  assigned: number;
  submitted: number;
  checked: number;
  overdue?: boolean;
  instructions: string;
  attachment?: string;
  syllabus?: string;
};

const homeworkItems: HomeworkItem[] = [
  {
    id: "HW-041",
    title: "সূরা আল-মুলক · আয়াত ১–১০",
    subject: "হিফজ ও তিলাওয়াত",
    audience: "হিফজ · ক · উস্তাদ সালমান",
    kind: "অডিও",
    due: "2026-11-14T20:00:00",
    dueLabel: "আজ, রাত ৮:০০",
    assigned: 28,
    submitted: 22,
    checked: 16,
    instructions: "তাজবিদ ও মাখরাজ ঠিক রেখে আয়াত ১–১০ একবারে রেকর্ড করো। শুরুতে নিজের নাম ও রোল বলবে।",
    attachment: "সূরা-মুলক-তাজবিদ-গাইড.pdf",
    syllabus: "হিফজ · দ্বিতীয় সাময়িক · সপ্তাহ ৭",
  },
  {
    id: "HW-039",
    title: "মাখরাজ অনুশীলন — ق، ك، خ",
    subject: "কুরআন শিক্ষা",
    audience: "হিফজ · ক",
    kind: "অফলাইন",
    due: "2026-11-13T10:00:00",
    dueLabel: "আগামীকাল, সকাল ১০:০০",
    assigned: 28,
    submitted: 24,
    checked: 24,
    instructions: "খাতায় প্রতিটি হরফের মাখরাজ লিখে ক্লাসে মুখে পড়ে শোনাবে।",
  },
  {
    id: "HW-036",
    title: "বাংলা রচনা — আমার মাদরাসা",
    subject: "বাংলা",
    audience: "হিফজ · ক",
    kind: "ফাইল",
    due: "2026-11-10T18:00:00",
    dueLabel: "১০ নভেম্বর, সন্ধ্যা ৬:০০",
    assigned: 28,
    submitted: 25,
    checked: 25,
    overdue: true,
    instructions: "কমপক্ষে ২০০ শব্দে পরিষ্কার হাতের লেখায় রচনা লিখে ছবি তুলে জমা দাও।",
  },
  {
    id: "HW-034",
    title: "দৈনিক দোয়া — ঘুমানোর আগে",
    subject: "দোয়া ও আদব",
    audience: "হিফজ · ক",
    kind: "অডিও",
    due: "2026-11-08T20:00:00",
    dueLabel: "৮ নভেম্বর, রাত ৮:০০",
    assigned: 28,
    submitted: 28,
    checked: 28,
    instructions: "দোয়াটি অর্থসহ পরিষ্কার উচ্চারণে রেকর্ড করে জমা দাও।",
  },
];

const children = [
  {
    id: "STU-10241",
    name: "মুহাম্মদ আব্দুল্লাহ",
    initials: "মআ",
    className: "হিফজ · ক",
    tone: "sage",
  },
  {
    id: "STU-10240",
    name: "ফাতিমা তুয যাহরা",
    initials: "ফয",
    className: "নূরানী · খ",
    tone: "rose",
  },
];

const studentRows = [
  {
    id: "STU-10241",
    name: "মুহাম্মদ আব্দুল্লাহ",
    initials: "মআ",
    state: "submitted",
    submittedAt: "আজ, ৭:১২ PM",
    audio: true,
  },
  {
    id: "STU-10239",
    name: "আহমাদ বিন হাসান",
    initials: "আহ",
    state: "late",
    submittedAt: "আজ, ৮:০৪ PM",
    audio: true,
  },
  {
    id: "STU-10237",
    name: "ইয়াসিন আরাফাত",
    initials: "ইআ",
    state: "missing",
    submittedAt: "এখনও জমা দেয়নি",
    audio: false,
  },
  {
    id: "STU-10235",
    name: "উমর ফারুক",
    initials: "উফ",
    state: "checked",
    submittedAt: "গতকাল, ৬:৪০ PM",
    audio: true,
  },
];

const bn = (value: number | string) =>
  String(value).replace(/\d/g, (digit) => "০১২৩৪৫৬৭৮৯"[Number(digit)]);

function StatePanel({
  state,
  onReset,
}: {
  state: Exclude<DemoState, "ready" | "upload-failed">;
  onReset: () => void;
}) {
  return (
    <SystemState
      kind={state === "denied" ? "no-permission" : state}
      title={
        state === "empty"
          ? "কোনো হোমওয়ার্ক নেই"
          : state === "loading"
            ? "হোমওয়ার্ক লোড হচ্ছে"
            : state === "denied"
              ? "এই হোমওয়ার্ক দেখার অনুমতি নেই"
              : undefined
      }
      message={
        state === "empty"
          ? "এই শিক্ষার্থী বা ক্লাসের জন্য এখনো কিছু দেওয়া হয়নি।"
          : state === "denied"
            ? "শুধু নির্ধারিত শিক্ষক বা সংযুক্ত অভিভাবক দেখতে পারবেন।"
            : undefined
      }
      actionLabel={state === "loading" ? "" : "স্বাভাবিক দৃশ্যে ফিরুন"}
      onAction={state === "loading" ? undefined : onReset}
      className="hw-state"
    />
  );
}

function HomeworkList({
  onCreate,
  onCheck,
}: {
  onCreate: () => void;
  onCheck: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<"ready" | "loading" | "empty" | "offline" | "denied">("ready");
  const completion = completionPercentage(
    homeworkItems[0].assigned,
    Array.from({ length: homeworkItems[0].checked }, (_, index) => ({
      studentId: `STU-${index}`,
      dueAt: homeworkItems[0].due,
      submittedAt: homeworkItems[0].due,
      checked: true,
    })),
  );
  const visible = homeworkItems.filter((item) =>
    `${item.title} ${item.subject} ${item.audience}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <main className="hw-main">
      <div className="hw-heading">
        <div>
          <span className="hw-kicker">B11 · HOMEWORK</span>
          <h1>হোমওয়ার্ক</h1>
          <p>ক্লাসের কাজ দিন, জমা দেখুন এবং দ্রুত ফিডব্যাক দিন।</p>
        </div>
        <div className="hw-heading-actions">
          <label>
            <span>দৃশ্য</span>
            <select
              value={state}
              onChange={(event) => setState(event.target.value as typeof state)}
            >
              <option value="ready">স্বাভাবিক</option>
              <option value="loading">Loading</option>
              <option value="empty">Empty</option>
              <option value="offline">Offline</option>
              <option value="denied">No permission</option>
            </select>
          </label>
          <button className="ds-button primary" onClick={onCreate}>
            <Plus size={17} /> নতুন হোমওয়ার্ক
          </button>
        </div>
      </div>
      {state !== "ready" ? (
        <div className="hw-list-panel">
          <StatePanel state={state} onReset={() => setState("ready")} />
        </div>
      ) : (
        <>
          <section className="hw-metrics">
            {[
              ["সক্রিয়", "৩", "এই সপ্তাহে"],
              ["জমা অপেক্ষমাণ", "৯", "২৮ শিক্ষার্থীর মধ্যে"],
              ["যাচাই বাকি", "৬", "অডিও ও ফাইল"],
              ["সম্পন্ন", `${completion}%`, "জমা ও যাচাইকৃত"],
            ].map(([label, value, note]) => (
              <article key={label}>
                <span>{label}</span>
                <b>{value}</b>
                <small>{note}</small>
              </article>
            ))}
          </section>
          <section className="hw-list-panel">
            <header>
              <div>
                <h2>সাম্প্রতিক হোমওয়ার্ক</h2>
                <p>নির্ধারিত ক্লাস · হিফজ, সেকশন ক, উস্তাদ সালমান</p>
              </div>
              <label className="hw-search">
                <Search size={16} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="শিরোনাম বা বিষয় খুঁজুন"
                />
              </label>
            </header>
            <div className="hw-list">
              {visible.map((item) => (
                <article key={item.id} className="hw-list-card">
                  <div className={`hw-kind ${item.kind === "অডিও" ? "audio" : ""}`}>
                    {item.kind === "অডিও" ? (
                      <Mic size={19} />
                    ) : item.kind === "অফলাইন" ? (
                      <CheckCircle2 size={19} />
                    ) : (
                      <FileText size={19} />
                    )}
                  </div>
                  <div className="hw-list-copy">
                    <div className="hw-title-row">
                      <div>
                        <span>{item.subject}</span>
                        <h3>{item.title}</h3>
                      </div>
                      {item.overdue && <em className="ds-badge danger">মেয়াদোত্তীর্ণ</em>}
                    </div>
                    <p>
                      <Users size={14} /> {item.audience}
                      <span />
                      <Clock3 size={14} /> {item.dueLabel}
                    </p>
                    <div className="hw-counts">
                      <span>
                        নির্ধারিত <b>{bn(item.assigned)}</b>
                      </span>
                      <span>
                        জমা <b>{bn(item.submitted)}</b>
                      </span>
                      <span>
                        যাচাই <b>{bn(item.checked)}</b>
                      </span>
                      <i>
                        <span style={{ width: `${(item.checked / item.assigned) * 100}%` }} />
                      </i>
                    </div>
                  </div>
                  <button className="ds-button secondary" onClick={() => onCheck(item.id)}>
                    যাচাই করুন
                  </button>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function CreateHomework({ onBack }: { onBack: () => void }) {
  const context = prototypeRoles["class-teacher"].context;
  const [audienceKind, setAudienceKind] = useState<HomeworkAudience["kind"]>("halaqa");
  const [className, setClassName] = useState("হিফজ");
  const [section, setSection] = useState("ক");
  const [halaqa, setHalaqa] = useState("উস্তাদ সালমান");
  const [kind, setKind] = useState<HomeworkKind>("অডিও");
  const [notice, setNotice] = useState("");
  const audience: HomeworkAudience =
    audienceKind === "class"
      ? { kind: "class", className }
      : audienceKind === "section"
        ? { kind: "section", className, section }
        : audienceKind === "halaqa"
          ? { kind: "halaqa", className, section, halaqa }
          : {
              kind: "students",
              studentIds: ["STU-10241", "STU-10237"],
              className,
              section,
              halaqa,
            };
  const allowed = canAssignHomework(context, audience);
  return (
    <main className="hw-main create">
      <button className="hw-back" onClick={onBack}>
        <ArrowLeft size={16} /> হোমওয়ার্ক তালিকা
      </button>
      <div className="hw-heading">
        <div>
          <span className="hw-kicker">CREATE</span>
          <h1>নতুন হোমওয়ার্ক</h1>
          <p>প্রয়োজনীয় নির্দেশনা দিন; syllabus item সবসময় ঐচ্ছিক।</p>
        </div>
      </div>
      <form
        className="hw-create-grid"
        onSubmit={(event) => {
          event.preventDefault();
          setNotice(
            allowed
              ? "হোমওয়ার্ক খসড়া হিসেবে সংরক্ষিত হয়েছে"
              : "আপনি শুধু নিজের নির্ধারিত ক্লাস, সেকশন ও হালাকায় কাজ দিতে পারবেন",
          );
        }}
      >
        <section className="hw-form-card">
          <header>
            <span>১</span>
            <div>
              <h2>কার জন্য</h2>
              <p>একটি audience বেছে নিন</p>
            </div>
          </header>
          <div className="hw-segments">
            {[
              ["class", "ক্লাস"],
              ["section", "সেকশন"],
              ["halaqa", "হালাকা"],
              ["students", "শিক্ষার্থী"],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={audienceKind === value ? "active" : ""}
                onClick={() => setAudienceKind(value as HomeworkAudience["kind"])}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="hw-field-grid">
            <label>
              ক্লাস
              <select value={className} onChange={(event) => setClassName(event.target.value)}>
                <option>হিফজ</option>
                <option>নূরানী</option>
              </select>
            </label>
            {audienceKind !== "class" && (
              <label>
                সেকশন
                <select value={section} onChange={(event) => setSection(event.target.value)}>
                  <option>ক</option>
                  <option>খ</option>
                </select>
              </label>
            )}
            {(audienceKind === "halaqa" || audienceKind === "students") && (
              <label>
                হালাকা
                <select value={halaqa} onChange={(event) => setHalaqa(event.target.value)}>
                  <option>উস্তাদ সালমান</option>
                  <option>উস্তাদ মাহমুদ</option>
                </select>
              </label>
            )}
          </div>
          {!allowed && (
            <p className="hw-field-error">
              <ShieldAlert size={15} /> এই audience আপনার teaching assignment-এর বাইরে।
            </p>
          )}
          {audienceKind === "students" && (
            <div className="hw-selected-students">
              <span className="ds-avatar small">মআ</span>
              <span className="ds-avatar small">ইআ</span>
              <b>২ জন নির্বাচিত</b>
              <button type="button">পরিবর্তন</button>
            </div>
          )}
        </section>
        <section className="hw-form-card">
          <header>
            <span>২</span>
            <div>
              <h2>কাজের বিবরণ</h2>
              <p>শিরোনাম, নির্দেশনা ও সময়</p>
            </div>
          </header>
          <label>
            শিরোনাম
            <input required defaultValue="সূরা আল-মুলক · আয়াত ১১–২০" />
          </label>
          <label>
            নির্দেশনা
            <textarea
              required
              rows={4}
              defaultValue="তাজবিদ ও মাখরাজ ঠিক রেখে একবারে রেকর্ড করবে। শুরুতে নিজের নাম ও রোল বলবে।"
            />
          </label>
          <div className="hw-field-grid">
            <label>
              জমার তারিখ
              <input type="date" defaultValue="2026-11-16" />
            </label>
            <label>
              সময়
              <input type="time" defaultValue="20:00" />
            </label>
          </div>
          <label>
            <span>
              সিলেবাস আইটেম <em>ঐচ্ছিক</em>
            </span>
            <select defaultValue="">
              <option value="">লিংক করবেন না</option>
              <option>হিফজ · দ্বিতীয় সাময়িক · সপ্তাহ ৮</option>
            </select>
          </label>
        </section>
        <section className="hw-form-card wide">
          <header>
            <span>৩</span>
            <div>
              <h2>জমার ধরন ও সংযুক্তি</h2>
              <p>শিক্ষার্থী কীভাবে কাজ জমা দেবে</p>
            </div>
          </header>
          <div className="hw-type-grid">
            {[
              ["লিখিত", FileText, "খাতায় লিখে ছবি"],
              ["ফাইল", UploadCloud, "ছবি বা PDF"],
              ["অডিও", Mic, "তিলাওয়াত / হিফজ"],
              ["অফলাইন", CheckCircle2, "ক্লাসে যাচাই"],
            ].map(([value, Icon, description]) => (
              <button
                type="button"
                key={value as string}
                className={kind === value ? "active" : ""}
                onClick={() => setKind(value as HomeworkKind)}
              >
                <Icon size={20} />
                <b>{value as string}</b>
                <small>{description as string}</small>
              </button>
            ))}
          </div>
          <label className="hw-dropzone">
            <Paperclip size={20} />
            <span>
              <b>PDF বা ছবি সংযুক্ত করুন</b>
              <small>ঐচ্ছিক · সর্বোচ্চ ১০ MB</small>
            </span>
            <input type="file" accept="image/*,.pdf" />
            <button type="button" className="ds-button secondary">
              ফাইল বাছুন
            </button>
          </label>
        </section>
        <footer className="hw-create-actions">
          <span>{notice}</span>
          <button type="button" className="ds-button secondary" onClick={onBack}>
            বাতিল
          </button>
          <button className="ds-button primary" disabled={!allowed}>
            <Send size={16} /> হোমওয়ার্ক দিন
          </button>
        </footer>
      </form>
    </main>
  );
}

function Waveform({ playing }: { playing: boolean }) {
  return (
    <span className={`hw-wave ${playing ? "playing" : ""}`} aria-label="অডিও waveform">
      {[8, 15, 22, 12, 26, 18, 10, 24, 16, 9, 20, 13, 25, 17, 8].map((height, index) => (
        <i key={`${height}-${index}`} style={{ height }} />
      ))}
    </span>
  );
}

function CheckHomework({ item, onBack }: { item: HomeworkItem; onBack: () => void }) {
  const offline = item.kind === "অফলাইন";
  const [filter, setFilter] = useState("সব");
  const [playingId, setPlayingId] = useState("");
  const [speed, setSpeed] = useState(1);
  const [audioFeedbackId, setAudioFeedbackId] = useState("");
  const [offlineChecked, setOfflineChecked] = useState<string[]>(["STU-10241"]);
  const [undoSnapshot, setUndoSnapshot] = useState<string[] | null>(null);
  const [overrideReason, setOverrideReason] = useState("");
  const [lateAccepted, setLateAccepted] = useState(false);
  const filteredRows = studentRows.filter((row) => {
    if (filter === "সব") return true;
    if (filter === "জমা হয়েছে") return row.state === "submitted";
    if (filter === "দেরিতে") return row.state === "late";
    if (filter === "জমা হয়নি") return row.state === "missing";
    return row.state === "checked";
  });
  const late: HomeworkSubmission = {
    studentId: "STU-10239",
    dueAt: "2026-11-14T20:00:00",
    submittedAt: "2026-11-14T20:04:00",
    checked: false,
  };
  return (
    <main className="hw-main check">
      <button className="hw-back" onClick={onBack}>
        <ArrowLeft size={16} /> হোমওয়ার্ক তালিকা
      </button>
      <div className="hw-check-head">
        <div>
          <span className="hw-kicker">{item.id}</span>
          <h1>{item.title}</h1>
          <p>
            {item.audience} · {item.dueLabel}
          </p>
        </div>
        <div className="hw-check-summary">
          <span>
            <b>{bn(item.submitted)}</b> / {bn(item.assigned)} জমা
          </span>
          <span>
            <b>{bn(item.checked)}</b> যাচাই
          </span>
        </div>
      </div>
      <section className="hw-check-panel">
        <header>
          <div className="hw-filter-row">
            {["সব", "জমা হয়েছে", "দেরিতে", "জমা হয়নি", "যাচাই হয়েছে"].map((value) => (
              <button
                key={value}
                className={filter === value ? "active" : ""}
                onClick={() => setFilter(value)}
              >
                {value}
              </button>
            ))}
          </div>
          {offline && (
            <div className="hw-everyone">
              {undoSnapshot ? (
                <button
                  className="ds-button secondary"
                  onClick={() => {
                    setOfflineChecked(undoSnapshot);
                    setUndoSnapshot(null);
                  }}
                >
                  <RotateCcw size={15} /> Undo
                </button>
              ) : (
                <button
                  className="ds-button primary"
                  onClick={() => {
                    setUndoSnapshot(offlineChecked);
                    setOfflineChecked(studentRows.map((row) => row.id));
                  }}
                >
                  <Check size={15} /> সবাই করেছে
                </button>
              )}
            </div>
          )}
        </header>
        <div className="hw-student-rows">
          {filteredRows.map((row) => {
            const isPlaying = playingId === row.id;
            const checked = offlineChecked.includes(row.id);
            return (
              <article key={row.id}>
                <div className="hw-student-id">
                  <span className="ds-avatar small">{row.initials}</span>
                  <div>
                    <b>{row.name}</b>
                    <small>{row.id}</small>
                  </div>
                </div>
                {offline ? (
                  <div className="hw-offline-actions">
                    <button
                      className={checked ? "done" : ""}
                      onClick={() =>
                        setOfflineChecked((current) =>
                          current.includes(row.id)
                            ? current.filter((id) => id !== row.id)
                            : [...current, row.id],
                        )
                      }
                    >
                      <Check size={15} /> যাচাই হয়েছে
                    </button>
                    <button
                      className={!checked ? "missed" : ""}
                      onClick={() =>
                        setOfflineChecked((current) => current.filter((id) => id !== row.id))
                      }
                    >
                      <X size={15} /> করেনি
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="hw-submission-state">
                      <span
                        className={`ds-badge ${
                          row.state === "late"
                            ? "warning"
                            : row.state === "missing"
                              ? "neutral"
                              : "success"
                        }`}
                      >
                        {row.state === "late"
                          ? "দেরিতে জমা"
                          : row.state === "missing"
                            ? "জমা হয়নি"
                            : row.state === "checked"
                              ? "যাচাই হয়েছে"
                              : "জমা হয়েছে"}
                      </span>
                      <small>{row.submittedAt}</small>
                    </div>
                    {row.audio ? (
                      <div className="hw-inline-audio">
                        <button
                          aria-label={isPlaying ? "থামান" : "চালান"}
                          onClick={() => setPlayingId(isPlaying ? "" : row.id)}
                        >
                          {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                        </button>
                        <Waveform playing={isPlaying} />
                        <small>১:৩৮</small>
                        <button onClick={() => setSpeed(speed === 2 ? 1 : speed + 0.5)}>
                          {speed}×
                        </button>
                      </div>
                    ) : (
                      <span className="hw-no-file">—</span>
                    )}
                    <div className="hw-feedback">
                      <input placeholder="সংক্ষিপ্ত ফিডব্যাক" />
                      <button
                        className={audioFeedbackId === row.id ? "recording" : ""}
                        aria-label={
                          audioFeedbackId === row.id
                            ? "অডিও ফিডব্যাক রেকর্ডিং বন্ধ করুন"
                            : "অডিও ফিডব্যাক রেকর্ড করুন"
                        }
                        title={
                          audioFeedbackId === row.id ? "রেকর্ডিং হচ্ছে · বন্ধ করতে চাপুন" : "অডিও ফিডব্যাক"
                        }
                        onClick={() =>
                          setAudioFeedbackId((current) => (current === row.id ? "" : row.id))
                        }
                      >
                        <Mic size={15} />
                      </button>
                      <input className="marks" placeholder="নম্বর" />
                    </div>
                    {row.state === "late" && (
                      <div className="hw-late-override">
                        {lateAccepted ? (
                          <span>
                            <CheckCircle2 size={14} /> সময়মতো হিসেবে গ্রহণ করা হয়েছে
                          </span>
                        ) : (
                          <>
                            <input
                              value={overrideReason}
                              onChange={(event) => setOverrideReason(event.target.value)}
                              placeholder="Override-এর কারণ (আবশ্যক)"
                            />
                            <button
                              disabled={!canAcceptLateAsOnTime(late, overrideReason)}
                              onClick={() => setLateAccepted(true)}
                            >
                              সময়মতো গ্রহণ
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function GuardianHeader({
  childId,
  onChild,
  role,
  setRole,
}: {
  childId: string;
  onChild: (id: string) => void;
  role: PrototypeRole;
  setRole: (role: PrototypeRole) => void;
}) {
  const active = children.find((child) => child.id === childId) ?? children[0];
  return (
    <header className="guardian-head">
      <div className="guardian-brand">
        <span>HQ</span>
        <div>
          <b>হলি কুরআন</b>
          <small>অভিভাবক পোর্টাল</small>
        </div>
        <button aria-label="আরও">
          <MoreHorizontal size={18} />
        </button>
      </div>
      <label className="guardian-role">
        <span>DEV ROLE</span>
        <select value={role} onChange={(event) => setRole(event.target.value as PrototypeRole)}>
          <option value="guardian">অভিভাবক · Guardian</option>
          <option value="class-teacher">Class teacher</option>
        </select>
      </label>
      <div className="child-switcher">
        <span className={`student-avatar ${active.tone}`}>{active.initials}</span>
        <div>
          <small>সন্তান</small>
          <b>{active.name}</b>
          <span>{active.className}</span>
        </div>
        <select value={childId} onChange={(event) => onChild(event.target.value)}>
          {children.map((child) => (
            <option key={child.id} value={child.id}>
              {child.name}
            </option>
          ))}
        </select>
        <ChevronDown size={16} />
      </div>
    </header>
  );
}

function browserLocalStorage(): OutboxStorage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

function useOnline() {
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online;
}

function UploadBox({
  studentId,
  homeworkId,
  demoState,
  setDemoState,
}: {
  studentId: string;
  homeworkId: string;
  demoState: DemoState;
  setDemoState: (state: DemoState) => void;
}) {
  const [outbox, setOutbox] = useState<OutboxItem[]>(() => loadOutbox(browserLocalStorage()));
  const savedItem = findOutboxItem(outbox, studentId, homeworkId);
  const queued = savedItem?.status === "queued";
  const online = useOnline();
  const offline = demoState === "offline" || !online;
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [recorded, setRecorded] = useState(queued);
  const [seconds, setSeconds] = useState(queued ? savedItem.durationSeconds : 0);
  const updateOutbox = (next: OutboxItem[]) => {
    setOutbox(next);
    saveOutbox(browserLocalStorage(), next);
  };
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!recording || paused) return;
    const timer = window.setInterval(
      () =>
        setSeconds((current) => {
          if (current >= 299) {
            setRecording(false);
            setRecorded(true);
            return 300;
          }
          return current + 1;
        }),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [paused, recording]);

  const performUpload = () => {
    setProgress(24);
    window.setTimeout(() => setProgress(68), 250);
    window.setTimeout(() => setProgress(100), 650);
  };

  // Connection back: send the queued recording once (flush skips anything already sent).
  useEffect(() => {
    if (offline || !queued) return;
    let cancelled = false;
    void flushOutbox(
      outbox,
      async () => {
        performUpload();
        return true;
      },
      () => new Date().toISOString(),
    ).then((next) => {
      if (!cancelled) updateOutbox(next);
    });
    return () => {
      cancelled = true;
    };
  }, [offline, queued]);

  const submit = () => {
    const validation = validateSubmissionFile({
      kind: "audio",
      sizeBytes: 1.8 * 1024 * 1024,
      durationSeconds: seconds,
    });
    if (!validation.ok) {
      setError(validation.message);
      return;
    }
    if (offline) {
      updateOutbox(
        queueSubmission(outbox, {
          studentId,
          homeworkId,
          durationSeconds: seconds || 98,
          sizeBytes: Math.round(1.8 * 1024 * 1024),
          recordedAt: new Date().toISOString(),
        }),
      );
      return;
    }
    if (demoState === "upload-failed") {
      setProgress(42);
      return;
    }
    performUpload();
  };

  const inspectFile = (file?: File) => {
    if (!file) return;
    const kind = file.type === "application/pdf" ? "pdf" : "image";
    const result = validateSubmissionFile({ kind, sizeBytes: file.size });
    setError(result.ok ? "" : result.message);
  };

  return (
    <section className="guardian-submit">
      <div className="guardian-submit-head">
        <div>
          <span>অডিও জমা</span>
          <h3>তিলাওয়াত রেকর্ড করুন</h3>
        </div>
        <em>সর্বোচ্চ ৫ মিনিট</em>
      </div>
      {!recorded ? (
        <div className={`recorder ${recording ? "active" : ""}`}>
          <button
            className="record-button"
            onClick={() => {
              setRecording(true);
              setPaused(false);
            }}
          >
            <Mic size={22} />
          </button>
          <b>
            {String(Math.floor(seconds / 60)).padStart(2, "0")}:
            {String(seconds % 60).padStart(2, "0")}
          </b>
          <Waveform playing={recording && !paused} />
          {recording && (
            <>
              <button className="round-control" onClick={() => setPaused(!paused)}>
                {paused ? <Play size={16} /> : <Pause size={16} />}
              </button>
              <button
                className="stop-control"
                onClick={() => {
                  setRecording(false);
                  setRecorded(true);
                }}
              >
                শেষ করুন
              </button>
            </>
          )}
          {!recording && <p>রেকর্ড শুরু করতে মাইক্রোফোন চাপুন</p>}
        </div>
      ) : (
        <div className="recorded-audio">
          <button onClick={() => setPlaying(!playing)}>
            {playing ? <Pause size={17} /> : <Play size={17} />}
          </button>
          <Waveform playing={playing} />
          <span>
            <b>{bn(seconds || 98)} সেকেন্ড</b>
            <small>Compressed · ১.৮ MB</small>
          </span>
          <button
            className="rerecord"
            onClick={() => {
              setRecorded(false);
              setSeconds(0);
              setProgress(0);
              updateOutbox(discardQueued(outbox, studentId, homeworkId));
            }}
          >
            <RefreshCcw size={14} /> আবার
          </button>
        </div>
      )}
      <div className="guardian-file-options">
        <label>
          <Camera size={18} />
          <span>
            <b>ক্যামেরা</b>
            <small>ছবি তুলে দিন</small>
          </span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(event) => inspectFile(event.target.files?.[0])}
          />
        </label>
        <label>
          <Image size={18} />
          <span>
            <b>গ্যালারি / PDF</b>
            <small>ছবি ৫ MB · PDF ১০ MB</small>
          </span>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(event) => inspectFile(event.target.files?.[0])}
          />
        </label>
      </div>
      <p className="resize-note">
        <Smartphone size={14} /> ছবি আপলোডের আগে স্বয়ংক্রিয়ভাবে ছোট করা হবে।
      </p>
      {error && (
        <p className="upload-error">
          <AlertCircle size={15} /> {error}
        </p>
      )}
      {queued && (
        <div className="queued-note" role="status">
          <WifiOff size={17} />
          <span>
            <b>এখনো পাঠানো হয়নি</b>
            <small>
              {offline
                ? "রেকর্ডিং এই ফোনে রাখা আছে। ইন্টারনেট ফিরলে নিজে থেকেই পাঠানো হবে।"
                : "পাঠানো হচ্ছে…"}
            </small>
          </span>
        </div>
      )}
      {demoState === "upload-failed" && progress > 0 && (
        <div className="failed-note">
          <AlertCircle size={17} />
          <span>
            <b>আপলোড ব্যর্থ হয়েছে · {bn(progress)}%</b>
            <small>রেকর্ডিং নিরাপদ আছে। আবার চেষ্টা করুন।</small>
          </span>
          <button
            onClick={() => {
              setDemoState("ready");
              performUpload();
            }}
          >
            Retry
          </button>
        </div>
      )}
      {progress > 0 && demoState !== "upload-failed" && (
        <div className="upload-progress">
          <span style={{ width: `${progress}%` }} />
          <b>{progress === 100 ? "জমা দেওয়া হয়েছে" : `আপলোড হচ্ছে · ${bn(progress)}%`}</b>
        </div>
      )}
      <button className="guardian-submit-button" disabled={!recorded} onClick={submit}>
        <UploadCloud size={17} /> জমা দিন
      </button>
    </section>
  );
}

function GuardianPortal({
  childId,
  homeworkId,
  role,
  setRole,
  onChild,
  onOpen,
  onBack,
}: {
  childId: string;
  homeworkId: string;
  role: PrototypeRole;
  setRole: (role: PrototypeRole) => void;
  onChild: (id: string) => void;
  onOpen: (id: string) => void;
  onBack: () => void;
}) {
  const [demoState, setDemoState] = useState<DemoState>("ready");
  const context = prototypeRoles[role].context;
  const allowed = canGuardianOpenHomework(context, childId);
  const item = homeworkItems.find((homework) => homework.id === homeworkId);
  const effectiveState = !allowed ? "denied" : demoState;
  return (
    <div className="guardian-page ds-page">
      <div className="guardian-phone">
        <GuardianHeader childId={childId} onChild={onChild} role={role} setRole={setRole} />
        <label className="guardian-state-switcher">
          <span>Prototype state</span>
          <select
            value={demoState}
            onChange={(event) => setDemoState(event.target.value as DemoState)}
          >
            <option value="ready">স্বাভাবিক</option>
            <option value="loading">Loading</option>
            <option value="empty">Empty</option>
            <option value="offline">Offline</option>
            <option value="upload-failed">Upload failed</option>
            <option value="denied">No permission</option>
          </select>
        </label>
        {effectiveState === "loading" ||
        effectiveState === "empty" ||
        effectiveState === "denied" ? (
          <StatePanel state={effectiveState} onReset={() => setDemoState("ready")} />
        ) : item ? (
          <main className="guardian-detail">
            <button className="guardian-back" onClick={onBack}>
              <ArrowLeft size={16} /> সব হোমওয়ার্ক
            </button>
            <div className="guardian-detail-title">
              <span className="hw-kind audio">
                <Mic size={19} />
              </span>
              <div>
                <small>{item.subject}</small>
                <h1>{item.title}</h1>
              </div>
            </div>
            <div className="due-countdown">
              <Clock3 size={18} />
              <span>
                <small>জমা দেওয়ার বাকি</small>
                <b>০৬ ঘণ্টা ২৪ মিনিট</b>
              </span>
              <em>আজ · ৮:০০ PM</em>
            </div>
            <section className="guardian-instructions">
              <span>শিক্ষকের নির্দেশনা</span>
              <p>{item.instructions}</p>
              {item.attachment && (
                <button>
                  <FileText size={18} />
                  <span>
                    <b>{item.attachment}</b>
                    <small>PDF · ২.৪ MB</small>
                  </span>
                  <Download size={16} />
                </button>
              )}
              {item.syllabus && (
                <p className="syllabus-link">
                  <Link2 size={14} /> {item.syllabus}
                </p>
              )}
            </section>
            <UploadBox
              studentId={childId}
              homeworkId={homeworkId ?? item?.id ?? ""}
              demoState={demoState}
              setDemoState={setDemoState}
            />
            <section className="guardian-feedback">
              <span>শিক্ষকের ফিডব্যাক · আগের জমা</span>
              <div>
                <span className="ds-avatar small">সা</span>
                <p>
                  <b>মাশাআল্লাহ, মাখরাজ পরিষ্কার হয়েছে।</b>
                  <small>আয়াত ৭-এর মাদ্দ আরেকবার শুনে নিও।</small>
                </p>
                <em>৮ / ১০</em>
              </div>
              <button>
                <Play size={15} /> অডিও ফিডব্যাক · ০:১৮
              </button>
            </section>
          </main>
        ) : (
          <main className="guardian-home">
            <div className="guardian-welcome">
              <span>আসসালামু আলাইকুম</span>
              <h1>আজকের হোমওয়ার্ক</h1>
              <p>আব্দুল্লাহর জন্য ২টি কাজ বাকি আছে।</p>
            </div>
            <div className="guardian-status-row">
              {[
                ["নতুন", "২", "info"],
                ["জমা দেওয়া হয়েছে", "১", "success"],
                ["যাচাই হয়েছে", "৬", "neutral"],
              ].map(([label, value, tone]) => (
                <div key={label}>
                  <b>{value}</b>
                  <span className={`ds-badge ${tone}`}>{label}</span>
                </div>
              ))}
            </div>
            <section className="guardian-list">
              <header>
                <h2>এই সপ্তাহ</h2>
                <span>৩টি কাজ</span>
              </header>
              {homeworkItems.map((homework, index) => {
                const status =
                  index === 0
                    ? { label: "নতুন", tone: "info" }
                    : index === 1
                      ? { label: "জমা দেওয়া হয়েছে", tone: "success" }
                      : index === 2
                        ? { label: "মেয়াদোত্তীর্ণ", tone: "danger" }
                        : { label: "যাচাই হয়েছে", tone: "neutral" };
                return (
                  <button key={homework.id} onClick={() => onOpen(homework.id)}>
                    <span className={`hw-kind ${homework.kind === "অডিও" ? "audio" : ""}`}>
                      {homework.kind === "অডিও" ? (
                        <Mic size={18} />
                      ) : homework.kind === "অফলাইন" ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <FileText size={18} />
                      )}
                    </span>
                    <span>
                      <small>{homework.subject}</small>
                      <b>{homework.title}</b>
                      <em>{homework.dueLabel}</em>
                    </span>
                    <span className={`ds-badge ${status.tone}`}>{status.label}</span>
                  </button>
                );
              })}
            </section>
          </main>
        )}
      </div>
    </div>
  );
}

export default function Homework({
  role,
  setRole,
}: {
  role: PrototypeRole;
  setRole: (role: PrototypeRole) => void;
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const permission = resolveHomeworkPermission(prototypeRoles[role].context);
  const { decision: subscriptionAccess } = useSubscription();
  const homeworkAccess = subscriptionAccess("homework");
  const segments = pathname.split("/").filter(Boolean);
  const isGuardian = role === "guardian";
  const childId =
    segments[1] && segments[1] !== "new" && segments[1] !== "check"
      ? decodeURIComponent(segments[1])
      : (prototypeRoles.guardian.context.scope.studentIds?.[0] ?? "");
  const homeworkId = segments[2] ? decodeURIComponent(segments[2]) : "";

  if (permission.access === "hidden") {
    return (
      <div className="hw-main">
        <StatePanel state="denied" onReset={() => setRole("class-teacher")} />
      </div>
    );
  }
  if (!homeworkAccess.allowed && (pathname.endsWith("/new") || segments[1] === "check")) {
    return (
      <div className="hw-main">
        <SystemState
          kind="no-permission"
          title="Suspended mode-এ পরিবর্তন বন্ধ"
          message="হোমওয়ার্ক দেখা যাবে, কিন্তু নতুন কাজ দেওয়া বা যাচাই করা যাবে না।"
          actionLabel="তালিকায় ফিরুন"
          onAction={() => navigate(appRoutes.homework)}
        />
      </div>
    );
  }
  if (isGuardian) {
    return (
      <GuardianPortal
        childId={childId}
        homeworkId={homeworkId}
        role={role}
        setRole={setRole}
        onChild={(id) => navigate(homeworkChildPath(id))}
        onOpen={(id) => navigate(homeworkChildPath(childId, id))}
        onBack={() => navigate(homeworkChildPath(childId))}
      />
    );
  }
  if (pathname === `${appRoutes.homework}/new`) {
    return <CreateHomework onBack={() => navigate(appRoutes.homework)} />;
  }
  if (segments[1] === "check") {
    const item = homeworkItems.find((homework) => homework.id === segments[2]) ?? homeworkItems[0];
    return <CheckHomework item={item} onBack={() => navigate(appRoutes.homework)} />;
  }
  return (
    <HomeworkList
      onCreate={() => navigate(`${appRoutes.homework}/new`)}
      onCheck={(id) => navigate(homeworkCheckPath(id))}
    />
  );
}
