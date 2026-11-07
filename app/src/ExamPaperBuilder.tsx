import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Archive,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  KeyRound,
  Languages,
  LockKeyhole,
  Plus,
  Printer,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  attemptPrintAction,
  editLockedPaper,
  lockPaper,
  paperTotal,
  visibleQuestions,
  type ExamPaper,
  type PrintAction,
  type PrintAttempt,
  type Question,
} from "./exam-paper-domain";
import type { PrototypeRole } from "./student-permissions";
import { useInstitutionSettings } from "./InstitutionSettingsContext";
import { resolveConfiguredPermission } from "./settings-domain";
import "./exam-paper.css";

type BankQuestion = Question & {
  className: string;
  subject: string;
  topic: string;
  type: string;
  difficulty: "সহজ" | "মধ্যম" | "কঠিন";
  language: "BN" | "EN" | "AR";
  duplicate?: boolean;
  text: string;
};

const bank: BankQuestion[] = [
  {
    id: "QB-184",
    authorId: "T-001",
    status: "অনুমোদিত",
    marks: 10,
    component: "রচনামূলক",
    className: "মিশকাত",
    subject: "তাফসীর",
    topic: "সূরা আল-বাকারা",
    type: "রচনামূলক",
    difficulty: "মধ্যম",
    language: "BN",
    text: "তাকওয়ার পরিচয় ও মুত্তাকীদের গুণাবলি ব্যাখ্যা কর।",
  },
  {
    id: "QB-183",
    authorId: "T-001",
    status: "খসড়া",
    marks: 5,
    component: "তরজমা",
    className: "মিশকাত",
    subject: "আরবি",
    topic: "কিতাবুত তাহারাহ",
    type: "তরজমা",
    difficulty: "সহজ",
    language: "AR",
    text: "اِقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ",
  },
  {
    id: "QB-182",
    authorId: "T-009",
    status: "খসড়া",
    marks: 5,
    className: "মিশকাত",
    subject: "হাদিস",
    topic: "কিতাবুল ঈমান",
    type: "সংক্ষিপ্ত",
    difficulty: "মধ্যম",
    language: "BN",
    text: "ঈমানের শাখাসমূহ সংক্ষেপে লেখ।",
  },
  {
    id: "QB-181",
    authorId: "T-009",
    status: "অনুমোদিত",
    marks: 10,
    component: "কুরআন পাঠ",
    className: "মিশকাত",
    subject: "কুরআন",
    topic: "সূরা আল-মুলক",
    type: "কুরআন/আরবি পাঠ",
    difficulty: "কঠিন",
    language: "AR",
    duplicate: true,
    text: "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
  },
  {
    id: "QB-180",
    authorId: "T-004",
    status: "অনুমোদিত",
    marks: 10,
    component: "MCQ",
    className: "মিশকাত",
    subject: "ফিকহ",
    topic: "সালাত",
    type: "MCQ",
    difficulty: "সহজ",
    language: "BN",
    text: "সালাতের ফরজ কয়টি?",
  },
  {
    id: "QB-179",
    authorId: "T-004",
    status: "অনুমোদিত",
    marks: 10,
    component: "মিলকরণ",
    className: "মিশকাত",
    subject: "আরবি",
    topic: "নাহু",
    type: "মিলকরণ",
    difficulty: "মধ্যম",
    language: "BN",
    text: "শব্দের সঙ্গে সঠিক ই‘রাব মিল কর।",
  },
];

const printPolicy = {
  opensAt: "2026-11-10T08:00:00.000Z",
  closesAt: "2026-11-10T10:00:00.000Z",
};
const bn = (value: string | number) =>
  String(value).replace(/\d/g, (digit) => "০১২৩৪৫৬৭৮৯"[Number(digit)]);

export default function ExamPaperBuilder({ role }: { role: PrototypeRole }) {
  const { settings } = useInstitutionSettings();
  const actorId = role === "class-teacher" ? "T-001" : "EC-001";
  const [tab, setTab] = useState<"bank" | "builder" | "print">("bank");
  const [setName, setSetName] = useState<"A" | "B">("A");
  const [selected, setSelected] = useState(["QB-184", "QB-183", "QB-181", "QB-180", "QB-179"]);
  const [status, setStatus] = useState<ExamPaper["status"]>("খসড়া");
  const [version, setVersion] = useState(2);
  const [logs, setLogs] = useState<PrintAttempt[]>([]);
  const [notice, setNotice] = useState("");
  const [outsideWindow, setOutsideWindow] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const visible = useMemo(
    () => visibleQuestions(bank, { role, actorId }) as BankQuestion[],
    [actorId, role],
  );
  const picked = bank.filter((question) => selected.includes(question.id));
  const paper: ExamPaper = {
    id: `HQS-MIS-26-A-${setName}`,
    version,
    status,
    requiredMarks: 50,
    questions: picked,
  };
  const total = paperTotal(paper);
  const unmapped = picked.filter((question) => !question.component).length;
  const canPrint = resolveConfiguredPermission(settings, role, "examPapers", "print");

  const toggleQuestion = (id: string) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };
  const tryLock = () => {
    try {
      setStatus(lockPaper({ ...paper, status: "পর্যালোচনা" }).status);
      setNotice("প্রশ্নপত্র অনুমোদিত ও লক হয়েছে");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "লক করা যায়নি");
    }
  };
  const printAttempt = (action: PrintAction) => {
    const attempt = attemptPrintAction(paper, {
      actorId,
      action,
      attemptedAt: outsideWindow ? "2026-11-10T11:30:00.000Z" : "2026-11-10T09:15:00.000Z",
      copies: action === "print" ? 2 : 1,
      canPrint,
      policy: printPolicy,
    });
    setLogs((current) => [attempt, ...current]);
    if (action === "preview") setPreviewOpen(attempt.allowed);
    setNotice(
      attempt.allowed
        ? `${action === "preview" ? "Preview" : action === "print" ? "Print" : "Download"} অনুমোদিত`
        : attempt.reason === "paper-not-locked"
          ? "শুধু লক করা প্রশ্নপত্র print করা যায়"
          : attempt.reason === "outside-print-window"
            ? "নির্ধারিত print window-এর বাইরে"
            : "আপনার print permission নেই",
    );
  };
  const editLocked = () => {
    const next = editLockedPaper(paper);
    setVersion(next.draft.version);
    setStatus(next.draft.status);
    setNotice(`পুরোনো v${version} আর্কাইভ হয়েছে; v${next.draft.version} খসড়া তৈরি হয়েছে`);
  };

  return (
    <main className="exam-page">
      <header className="exam-heading">
        <div>
          <span className="ds-kicker">S33 · পরীক্ষা ও ফলাফল</span>
          <h1>প্রশ্ন ব্যাংক ও প্রশ্নপত্র</h1>
          <p>অনুমোদিত প্রশ্ন থেকে নিরাপদে bilingual paper তৈরি, যাচাই ও print করুন।</p>
        </div>
        <div className="exam-heading-actions">
          <span className="exam-session">
            <Clock3 size={15} /> অর্ধবার্ষিক · ২০২৬
          </span>
          <button className="ds-button primary" onClick={() => setTab("builder")}>
            <Plus size={16} /> নতুন প্রশ্নপত্র
          </button>
        </div>
      </header>

      <nav className="exam-tabs">
        <button className={tab === "bank" ? "active" : ""} onClick={() => setTab("bank")}>
          <BookOpenCheck size={17} /> প্রশ্ন ব্যাংক <span>{bn(visible.length)}</span>
        </button>
        <button className={tab === "builder" ? "active" : ""} onClick={() => setTab("builder")}>
          <FileText size={17} /> Paper builder
        </button>
        <button className={tab === "print" ? "active" : ""} onClick={() => setTab("print")}>
          <Printer size={17} /> Print ও audit
        </button>
      </nav>

      {tab === "bank" && (
        <section className="exam-bank-layout">
          <div className="ds-table-card exam-table">
            <div className="ds-table-top">
              <div>
                <h3>প্রশ্ন ব্যাংক</h3>
                <p>
                  {role === "class-teacher"
                    ? "আপনার খসড়া ও সকল অনুমোদিত প্রশ্ন"
                    : "সকল শিক্ষক ও সকল status"}
                </p>
              </div>
              <button className="ds-button primary">
                <Plus size={15} /> প্রশ্ন যোগ করুন
              </button>
            </div>
            <div className="ds-table-tools">
              <label>
                <Search size={16} />
                <input placeholder="প্রশ্ন, বিষয় বা topic খুঁজুন…" />
              </label>
              <button>
                <Filter size={15} /> মিশকাত
              </button>
              <button>সকল ধরন</button>
              <button>BN / EN / AR</button>
            </div>
            <div className="exam-question-list">
              {visible.map((question) => (
                <article
                  key={question.id}
                  className={selected.includes(question.id) ? "selected" : ""}
                >
                  <button
                    className="exam-check"
                    onClick={() => toggleQuestion(question.id)}
                    aria-label="প্রশ্ন নির্বাচন"
                  >
                    {selected.includes(question.id) && <Check size={14} />}
                  </button>
                  <div className="exam-question-copy">
                    <div className="exam-question-meta">
                      <code>{question.id}</code>
                      <span>{question.className}</span>
                      <span>{question.subject}</span>
                      <span>{question.topic}</span>
                    </div>
                    <p
                      dir={question.language === "AR" ? "rtl" : "ltr"}
                      className={question.language === "AR" ? "arabic" : ""}
                    >
                      {question.text}
                    </p>
                    <div className="exam-question-tags">
                      <span>{question.type}</span>
                      <span>{bn(question.marks)} নম্বর</span>
                      <span className={`difficulty ${question.difficulty}`}>
                        {question.difficulty}
                      </span>
                      <span>
                        <Languages size={12} /> {question.language}
                      </span>
                      {question.duplicate && (
                        <span className="duplicate">
                          <AlertTriangle size={12} /> সম্ভাব্য duplicate
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`ds-badge ${question.status === "অনুমোদিত" ? "success" : "warning"}`}
                  >
                    {question.status}
                  </span>
                </article>
              ))}
            </div>
          </div>
          <aside className="exam-side-card">
            <div className="exam-side-icon">
              <Sparkles size={19} />
            </div>
            <span className="ds-kicker">বর্তমান নির্বাচন</span>
            <strong>{bn(selected.length)}টি প্রশ্ন</strong>
            <p>Set {setName}–এর জন্য নির্বাচিত। Paper builder-এ component ও নম্বর যাচাই করুন।</p>
            <button className="ds-button primary" onClick={() => setTab("builder")}>
              Builder খুলুন <ChevronRight size={15} />
            </button>
          </aside>
        </section>
      )}

      {tab === "builder" && (
        <section className="builder-layout">
          <div className="builder-main">
            <article className="paper-summary-card">
              <div>
                <span className="ds-kicker">B12 EXAM VERSION · MIS-HY-2026-V3</span>
                <h2>মিশকাত · তাফসীর ও আরবি</h2>
                <p>অর্ধবার্ষিক পরীক্ষা · ২ ঘণ্টা ৩০ মিনিট</p>
              </div>
              <div className="set-switch">
                <button className={setName === "A" ? "active" : ""} onClick={() => setSetName("A")}>
                  Set A
                </button>
                <button className={setName === "B" ? "active" : ""} onClick={() => setSetName("B")}>
                  Set B
                </button>
              </div>
            </article>
            <article className="workflow-strip">
              {(["খসড়া", "পর্যালোচনা", "অনুমোদিত/লক", "প্রিন্ট"] as const).map((step, index) => {
                const current = status === "অনুমোদিত/লক" ? 2 : status === "পর্যালোচনা" ? 1 : 0;
                return (
                  <div className={index <= current ? "done" : ""} key={step}>
                    <span>{index < current ? <Check size={13} /> : index + 1}</span>
                    <b>{step}</b>
                    {index < 3 && <i />}
                  </div>
                );
              })}
            </article>
            <article className="builder-card">
              <header>
                <div>
                  <h3>নির্বাচিত প্রশ্ন</h3>
                  <p>Drag ordering-এর আগে marks ও component নিশ্চিত করুন</p>
                </div>
                <button className="ds-button secondary" onClick={() => setTab("bank")}>
                  <Plus size={14} /> প্রশ্ন যোগ করুন
                </button>
              </header>
              <div className="builder-questions">
                {picked.map((question, index) => (
                  <div key={question.id}>
                    <span className="question-order">{bn(index + 1)}</span>
                    <div>
                      <p
                        dir={question.language === "AR" ? "rtl" : "ltr"}
                        className={question.language === "AR" ? "arabic" : ""}
                      >
                        {question.text}
                      </p>
                      <small>
                        {question.id} · {question.subject} · {question.type}
                      </small>
                    </div>
                    <label>
                      <span>Component</span>
                      <select defaultValue={question.component ?? ""}>
                        <option value="">Mapping নেই</option>
                        <option>{question.component ?? "ক"}</option>
                        <option>রচনামূলক</option>
                        <option>সংক্ষিপ্ত</option>
                      </select>
                    </label>
                    <b>{bn(question.marks)}</b>
                    <button onClick={() => toggleQuestion(question.id)}>×</button>
                  </div>
                ))}
              </div>
            </article>
          </div>
          <aside className="builder-aside">
            <article className={`total-card ${total === 50 ? "valid" : "invalid"}`}>
              <span>মোট নম্বর</span>
              <div>
                <strong>{bn(total)}</strong>
                <em>/ {bn(50)}</em>
              </div>
              <div className="total-track">
                <i style={{ width: `${Math.min(total * 2, 100)}%` }} />
              </div>
              <p>
                {total === 50 ? (
                  <>
                    <CheckCircle2 size={14} /> B12 version-এর সঙ্গে মিলেছে
                  </>
                ) : (
                  <>
                    <AlertTriangle size={14} /> আরও {bn(50 - total)} নম্বর প্রয়োজন
                  </>
                )}
              </p>
            </article>
            <article className="check-card">
              <h3>Lock readiness</h3>
              <p className={total === 50 ? "ok" : "bad"}>
                {total === 50 ? <CheckCircle2 /> : <AlertTriangle />} Marks total{" "}
                <b>
                  {bn(total)}/{bn(50)}
                </b>
              </p>
              <p className={unmapped === 0 ? "ok" : "bad"}>
                {unmapped === 0 ? <CheckCircle2 /> : <AlertTriangle />} Component mapping{" "}
                <b>{unmapped ? `${bn(unmapped)} বাকি` : "সম্পন্ন"}</b>
              </p>
              <p className="ok">
                <CheckCircle2 /> Bilingual layout <b>প্রস্তুত</b>
              </p>
              {status === "খসড়া" && (
                <button className="ds-button secondary" onClick={() => setStatus("পর্যালোচনা")}>
                  <FileCheck2 size={15} /> পর্যালোচনায় পাঠান
                </button>
              )}
              {status !== "অনুমোদিত/লক" && (
                <button className="ds-button primary" onClick={tryLock}>
                  <LockKeyhole size={15} /> অনুমোদন ও লক
                </button>
              )}
              {status === "অনুমোদিত/লক" && (
                <button className="ds-button secondary" onClick={editLocked}>
                  <Archive size={15} /> সম্পাদনার নতুন version
                </button>
              )}
            </article>
          </aside>
        </section>
      )}

      {tab === "print" && (
        <section className="print-layout">
          <div className="print-preview">
            <div className="print-toolbar">
              <div>
                <span className={`ds-badge ${status === "অনুমোদিত/লক" ? "success" : "warning"}`}>
                  <LockKeyhole size={12} /> {status}
                </span>
                <b>
                  Version {bn(version)} · Set {setName}
                </b>
              </div>
              <div>
                <button className="ds-button secondary" onClick={() => printAttempt("preview")}>
                  <Eye size={15} /> Preview
                </button>
                <button className="ds-button secondary" onClick={() => printAttempt("download")}>
                  <Download size={15} /> PDF
                </button>
                <button className="ds-button primary" onClick={() => printAttempt("print")}>
                  <Printer size={15} /> Print ২ কপি
                </button>
              </div>
            </div>
            {previewOpen && status === "অনুমোদিত/লক" && canPrint && !outsideWindow ? (
              <article className="a4-paper">
                <header>
                  <div className="paper-mark">HQ</div>
                  <div>
                    <h2>হলি কুরআন স্কুল এন্ড মাদরাসা</h2>
                    <p>HOLY QURAN SCHOOL & MADRASA</p>
                    <b>অর্ধবার্ষিক পরীক্ষা · ২০২৬</b>
                  </div>
                  <span>Set {setName}</span>
                </header>
                <div className="paper-info">
                  <span>শ্রেণি: মিশকাত</span>
                  <span>বিষয়: তাফসীর ও আরবি</span>
                  <span>সময়: ২:৩০ ঘণ্টা</span>
                  <span>পূর্ণমান: ৫০</span>
                </div>
                <p className="paper-instruction">
                  যেকোনো পাঁচটি প্রশ্নের উত্তর দাও · أَجِبْ عَنِ الأَسْئِلَةِ الآتِيَةِ
                </p>
                {picked.slice(0, 5).map((question, index) => (
                  <div className="paper-question" key={question.id}>
                    <b>{bn(index + 1)}.</b>
                    <p
                      dir={question.language === "AR" ? "rtl" : "ltr"}
                      className={question.language === "AR" ? "arabic" : ""}
                    >
                      {question.text}
                    </p>
                    <span>[{bn(question.marks)}]</span>
                  </div>
                ))}
                <footer>
                  Paper ID: {paper.id} · v{version} · উত্তরপত্র আলাদা শিটে লিখতে হবে
                </footer>
              </article>
            ) : (
              <div className="secure-preview">
                <ShieldCheck size={30} />
                <h3>নিরাপদ paper preview</h3>
                <p>লক করা paper শুধু print permission ও সক্রিয় print window যাচাইয়ের পর দেখা যাবে।</p>
                <button className="ds-button primary" onClick={() => printAttempt("preview")}>
                  <Eye size={15} /> Access যাচাই করে preview
                </button>
              </div>
            )}
          </div>
          <aside className="print-side">
            <article className="window-card">
              <div>
                <Clock3 size={18} />
                <span>
                  <b>Print window</b>
                  <small>১০ নভেম্বর · ২:০০–৪:০০ PM</small>
                </span>
              </div>
              <label>
                <input
                  type="checkbox"
                  checked={outsideWindow}
                  onChange={(event) => setOutsideWindow(event.target.checked)}
                />{" "}
                বাইরে সময় simulate করুন
              </label>
            </article>
            <article className="answer-key">
              <header>
                <KeyRound size={17} />
                <div>
                  <b>উত্তরসূচি</b>
                  <small>Separate answer-key sheet</small>
                </div>
              </header>
              {picked.slice(0, 4).map((question, index) => (
                <p key={question.id}>
                  <span>{bn(index + 1)}</span>
                  <b>{question.component ?? "Mapping বাকি"}</b>
                  <em>{bn(question.marks)}</em>
                </p>
              ))}
            </article>
            <article className="audit-log">
              <header>
                <ShieldCheck size={17} />
                <div>
                  <b>Print audit</b>
                  <small>Preview, print ও download</small>
                </div>
              </header>
              {logs.length === 0 ? (
                <p className="empty-log">এখনও কোনো attempt নেই</p>
              ) : (
                logs.map((log, index) => (
                  <div key={`${log.action}-${index}`}>
                    <span className={log.allowed ? "allowed" : "blocked"}>
                      {log.allowed ? <Check size={12} /> : "×"}
                    </span>
                    <p>
                      <b>{log.action}</b>
                      <small>
                        {log.actorId} · {log.copies} কপি · ৩:১৫ PM
                      </small>
                    </p>
                  </div>
                ))
              )}
            </article>
          </aside>
        </section>
      )}
      {notice && (
        <button className="exam-toast" onClick={() => setNotice("")}>
          <CheckCircle2 size={16} /> {notice}
        </button>
      )}
    </main>
  );
}
