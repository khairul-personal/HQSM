/** B3 · Principal dashboard (S03). Every number comes from dashboard-domain (tested); this file only displays. */
import { useMemo, useState, type ReactNode } from "react";
import {
  BookOpenCheck,
  CalendarDays,
  ClipboardCheck,
  Coins,
  HandCoins,
  Landmark,
  ReceiptText,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import {
  activeStudentSummary,
  approvalQueue,
  attendanceSummary,
  collectionSummary,
  duesWithAgeing,
  fundBalances,
  hifzBehindPercent,
  hifzProgress,
  homeworkStatus,
  resolveDashboardPermission,
  upcomingEvents,
  type ApprovalKind,
  type DashboardCard,
  type DashboardEvent,
  type DashboardScope,
} from "./dashboard-domain";
import {
  attendanceCutoffMinutes,
  demoNowMinutes,
  demoToday,
  enrollments,
  events,
  funds,
  hifzStudents,
  homeworkLines,
  invoices,
  lastUpdated,
  moneyEntries,
  pendingApprovals,
  registers,
  sessions,
} from "./dashboard-data";
import { bn, clock, gregorianDate, hijriDate, takaFromPaisa } from "./bn-format";
import { prototypeRoles, type PrototypeRole } from "./student-permissions";
import { SystemState } from "./SystemStates";
import "./dashboard.css";

type DemoState = "data" | "loading" | "empty" | "error";

const branchLabel: Record<DashboardScope["branch"], string> = {
  all: "সকল শাখা",
  boys: "বালক শাখা",
  girls: "বালিকা শাখা",
};

const approvalKindLabel: Record<ApprovalKind, string> = {
  admission: "ভর্তি",
  concession: "ছাড়",
  sponsorship: "স্পন্সরশিপ",
  refund: "ফেরত",
  expense: "খরচ",
  leave: "ছুটি",
  result: "ফলাফল",
  "question-paper": "প্রশ্নপত্র",
};

const eventKindLabel: Record<DashboardEvent["kind"], string> = {
  exam: "পরীক্ষা",
  notice: "নোটিশ",
  event: "অনুষ্ঠান",
  holiday: "ছুটি",
  "routine-conflict": "রুটিন সংঘাত",
};

const cardMeta: Record<DashboardCard, { title: string; icon: typeof Users }> = {
  students: { title: "সক্রিয় শিক্ষার্থী", icon: Users },
  attendance: { title: "আজকের হাজিরা", icon: UserCheck },
  collection: { title: "আজকের আদায়", icon: Coins },
  dues: { title: "বকেয়া", icon: ReceiptText },
  funds: { title: "ফান্ড ব্যালেন্স", icon: Landmark },
  hifz: { title: "হিফজ ও সবক অগ্রগতি", icon: BookOpenCheck },
  homework: { title: "হোমওয়ার্ক স্ট্যাটাস", icon: ClipboardCheck },
  approvals: { title: "অনুমোদন বাকি", icon: HandCoins },
  events: { title: "আসন্ন কার্যক্রম", icon: CalendarDays },
};

const inDaysLabel = (days: number) =>
  days === 0 ? "আজ" : days === 1 ? "আগামীকাল" : `${bn(days)} দিন পর`;

export default function Dashboard({ role }: { role: PrototypeRole }) {
  const context = prototypeRoles[role].context;
  const permission = resolveDashboardPermission(context);
  const [branch, setBranch] = useState<DashboardScope["branch"]>(permission.branches[0] ?? "all");
  const [session, setSession] = useState(sessions[0]);
  const [demoState, setDemoState] = useState<DemoState>("data");
  const [open, setOpen] = useState<DashboardCard | null>(null);
  const scope: DashboardScope = {
    branch: permission.branches.includes(branch) ? branch : (permission.branches[0] ?? "boys"),
    session,
  };

  const data = useMemo(() => {
    const s: DashboardScope = { branch: scope.branch, session: scope.session };
    return {
      students: activeStudentSummary(enrollments, s),
      attendance: attendanceSummary(registers, s, demoNowMinutes, attendanceCutoffMinutes),
      collection: collectionSummary(moneyEntries, s, demoToday),
      dues: duesWithAgeing(invoices, s, demoToday),
      funds: fundBalances(funds),
      hifz: hifzProgress(hifzStudents, s),
      homework: homeworkStatus(homeworkLines, s, demoToday),
      approvals: approvalQueue(pendingApprovals, s, demoToday, context.actorId),
      events: upcomingEvents(events, s, demoToday),
    };
  }, [scope.branch, scope.session, context.actorId]);

  if (!permission.open) {
    return (
      <SystemState
        kind="no-permission"
        message="এই ড্যাশবোর্ড পরিচালক, Admin, Academic Admin ও Finance Lead এর জন্য। আপনার নিজের কাজের পাতা বাঁ দিকের মেনুতে আছে।"
      />
    );
  }

  const cards = permission.cards;

  return (
    <div className="dash">
      <header className="dash-head">
        <div>
          <p className="dash-greeting">আসসালামু আলাইকুম</p>
          <h1>পরিচালকের ড্যাশবোর্ড</h1>
          <p className="dash-dates">
            <span>{gregorianDate(demoToday)}</span>
            <span aria-hidden="true">·</span>
            <span>{hijriDate(demoToday)}</span>
          </p>
        </div>
        <div className="dash-filters">
          <label>
            <span>শাখা</span>
            <select
              value={scope.branch}
              onChange={(e) => setBranch(e.target.value as DashboardScope["branch"])}
            >
              {permission.branches.map((b) => (
                <option key={b} value={b}>
                  {branchLabel[b]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>সেশন</span>
            <select value={session} onChange={(e) => setSession(e.target.value)}>
              {sessions.map((s) => (
                <option key={s} value={s}>
                  {bn(s)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <div className="dash-prototype" role="group" aria-label="Prototype state">
        <b>Prototype</b>
        {(
          [
            ["data", "তথ্য"],
            ["loading", "লোড হচ্ছে"],
            ["empty", "কোনো তথ্য নেই"],
            ["error", "তথ্য পাওয়া যায়নি"],
          ] as [DemoState, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={demoState === value}
            className={demoState === value ? "active" : ""}
            onClick={() => setDemoState(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="dash-grid">
        {cards.map((card) => (
          <Card
            key={card}
            card={card}
            state={demoState}
            selected={open === card}
            onOpen={() => setOpen(open === card ? null : card)}
          >
            {renderSummary(card, data)}
          </Card>
        ))}
      </div>

      {open && demoState === "data" && cards.includes(open) && (
        <section className="dash-detail" aria-labelledby="dash-detail-title">
          <header>
            <h2 id="dash-detail-title">{cardMeta[open].title} · বিস্তারিত তালিকা</h2>
            <span className="dash-scope">
              {branchLabel[scope.branch]} · সেশন {bn(session)}
            </span>
            <button
              type="button"
              className="ds-button secondary"
              onClick={() => setOpen(null)}
              aria-label="বিস্তারিত বন্ধ করুন"
            >
              <X size={16} />
            </button>
          </header>
          {renderDetail(open, data)}
        </section>
      )}
    </div>
  );
}

type DashData = {
  students: ReturnType<typeof activeStudentSummary>;
  attendance: ReturnType<typeof attendanceSummary>;
  collection: ReturnType<typeof collectionSummary>;
  dues: ReturnType<typeof duesWithAgeing>;
  funds: ReturnType<typeof fundBalances>;
  hifz: ReturnType<typeof hifzProgress>;
  homework: ReturnType<typeof homeworkStatus>;
  approvals: ReturnType<typeof approvalQueue>;
  events: ReturnType<typeof upcomingEvents>;
};

function Card({
  card,
  state,
  selected,
  onOpen,
  children,
}: {
  card: DashboardCard;
  state: DemoState;
  selected: boolean;
  onOpen: () => void;
  children: ReactNode;
}) {
  const { title, icon: Icon } = cardMeta[card];
  return (
    <article className={`dash-card ${selected ? "selected" : ""}`} aria-busy={state === "loading"}>
      <header>
        <span className="dash-icon">
          <Icon size={18} />
        </span>
        <h2>{title}</h2>
      </header>
      {state === "loading" ? (
        <div className="dash-skeleton" aria-label="লোড হচ্ছে">
          <i />
          <i />
          <i />
        </div>
      ) : state === "empty" ? (
        <p className="dash-state">এই শাখা ও সেশনে এখনো কোনো তথ্য নেই।</p>
      ) : state === "error" ? (
        <p className="dash-state error">তথ্য এই মুহূর্তে পাওয়া যাচ্ছে না। কিছুক্ষণ পর আবার দেখুন।</p>
      ) : (
        children
      )}
      <footer>
        <small>সর্বশেষ হালনাগাদ {state === "data" ? clock(lastUpdated[card]) : "—"}</small>
        {state === "data" && (
          <button type="button" className="dash-open" aria-expanded={selected} onClick={onOpen}>
            {selected ? "তালিকা বন্ধ" : "তালিকা দেখুন"}
          </button>
        )}
      </footer>
    </article>
  );
}

function Split({ items }: { items: [string, string, string?][] }) {
  return (
    <dl className="dash-split">
      {items.map(([label, value, tone]) => (
        <div key={label} className={tone}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Meter({ percent, label }: { percent: number; label: string }) {
  return (
    <div
      className="dash-meter"
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-label={label}
    >
      <i style={{ width: `${percent}%` }} />
    </div>
  );
}

function renderSummary(card: DashboardCard, d: DashData): ReactNode {
  switch (card) {
    case "students":
      return (
        <>
          <p className="dash-big">{bn(d.students.total)}</p>
          <Split
            items={[
              ["বালক", bn(d.students.boys)],
              ["বালিকা", bn(d.students.girls)],
              ["আবাসিক", bn(d.students.residential)],
              ["অনাবাসিক", bn(d.students.dayScholar)],
            ]}
          />
        </>
      );
    case "attendance": {
      const a = d.attendance;
      return (
        <>
          <Split
            items={[
              ["উপস্থিত", bn(a.present), "ok"],
              ["দেরি", bn(a.late), "warn"],
              ["অনুপস্থিত", bn(a.absent), "bad"],
              ["ছুটি", bn(a.leave), "info"],
              ["হাজিরা নেওয়া হয়নি", bn(a.unmarked), "muted"],
            ]}
          />
          {a.pendingRegisters.length > 0 && (
            <p className="dash-alert">
              সকাল {clock(attendanceCutoffMinutes)} পেরিয়েছে · {bn(a.pendingRegisters.length)}টি
              রেজিস্টার জমা হয়নি
            </p>
          )}
        </>
      );
    }
    case "collection":
      return (
        <>
          <p className="dash-big">{takaFromPaisa(d.collection.netPaisa)}</p>
          <Split
            items={[
              ["ফি", takaFromPaisa(d.collection.fee)],
              ["ফান্ড বরাদ্দ", takaFromPaisa(d.collection["fund-allocation"])],
              ["অনুদান", takaFromPaisa(d.collection.donation)],
            ]}
          />
        </>
      );
    case "dues":
      return (
        <>
          <p className="dash-big">{takaFromPaisa(d.dues.totalPaisa)}</p>
          <Split
            items={[
              ["০–৩০ দিন", takaFromPaisa(d.dues.buckets["0-30"])],
              ["৩১–৬০ দিন", takaFromPaisa(d.dues.buckets["31-60"]), "warn"],
              ["৬০+ দিন", takaFromPaisa(d.dues.buckets["60+"]), "bad"],
            ]}
          />
        </>
      );
    case "funds":
      return (
        <>
          <p className="dash-big">{takaFromPaisa(d.funds.totalAvailablePaisa)}</p>
          <Split
            items={d.funds.rows.map(
              (f) => [f.name, takaFromPaisa(f.availablePaisa)] as [string, string],
            )}
          />
          <p className="dash-note">অপরিশোধিত প্রতিশ্রুতি ব্যালেন্সে ধরা হয়নি</p>
        </>
      );
    case "hifz":
      return (
        <>
          <p className="dash-big">
            {bn(d.hifz.percent)}%<small> লক্ষ্যের</small>
          </p>
          <Meter percent={d.hifz.percent} label="হিফজ লক্ষ্য পূরণ" />
          <p className="dash-note">
            অনুমোদিত সবক {bn(d.hifz.approvedPages)} / {bn(d.hifz.targetPages)} পৃষ্ঠা · পিছিয়ে{" "}
            {bn(d.hifz.behind.length)} জন
          </p>
        </>
      );
    case "homework":
      return (
        <>
          <Split
            items={[
              ["দেওয়া হয়েছে", bn(d.homework.assigned)],
              ["জমা / অফলাইন", bn(d.homework.submitted)],
              ["দেখা হয়েছে", bn(d.homework.checked), "ok"],
            ]}
          />
          {d.homework.overdue.length > 0 && (
            <p className="dash-alert">{bn(d.homework.overdue.length)}টি ক্লাসে সময় পেরিয়েছে</p>
          )}
        </>
      );
    case "approvals": {
      const high = d.approvals.filter((a) => a.priority === "high").length;
      return (
        <>
          <p className="dash-big">{bn(d.approvals.length)}</p>
          <Split
            items={[
              ["জরুরি", bn(high), "bad"],
              ["সাধারণ", bn(d.approvals.length - high)],
              [
                "সবচেয়ে পুরোনো",
                d.approvals.length
                  ? `${bn(Math.max(...d.approvals.map((a) => a.ageDays)))} দিন`
                  : "—",
              ],
            ]}
          />
        </>
      );
    }
    case "events":
      return d.events.length ? (
        <ul className="dash-events">
          {d.events.slice(0, 3).map((e) => (
            <li key={e.id}>
              <span
                className={`ds-badge ${e.kind === "routine-conflict" ? "danger" : e.kind === "exam" ? "warning" : "info"}`}
              >
                {eventKindLabel[e.kind]}
              </span>
              <b>{e.title}</b>
              <small>{inDaysLabel(e.inDays)}</small>
            </li>
          ))}
        </ul>
      ) : (
        <p className="dash-state">আগামী ১৪ দিনে কিছু নেই</p>
      );
  }
}

function Table({ head, rows, empty }: { head: string[]; rows: ReactNode[][]; empty: string }) {
  if (rows.length === 0) return <p className="dash-state">{empty}</p>;
  return (
    <div className="dash-table-wrap">
      <table className="dash-table">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, i) => (
            <tr key={i}>
              {cells.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderDetail(card: DashboardCard, d: DashData): ReactNode {
  switch (card) {
    case "students":
      return (
        <Table
          head={["ভাগ", "শিক্ষার্থী"]}
          rows={[
            ["বালক", bn(d.students.boys)],
            ["বালিকা", bn(d.students.girls)],
            ["আবাসিক", bn(d.students.residential)],
            ["অনাবাসিক", bn(d.students.dayScholar)],
          ]}
          empty="কোনো সক্রিয় শিক্ষার্থী নেই"
        />
      );
    case "attendance":
      return (
        <Table
          head={["রেজিস্টার", "শিক্ষক", "হাজিরা নেওয়া হয়নি"]}
          rows={d.attendance.pendingRegisters.map((r) => [
            r.label,
            r.teacher,
            `${bn(r.unmarked)} জন`,
          ])}
          empty="সব রেজিস্টার সময়মতো জমা হয়েছে"
        />
      );
    case "collection":
      return (
        <Table
          head={["খাত", "আজ (পোস্ট করা)"]}
          rows={[
            ["ফি (রসিদ − ফেরত)", takaFromPaisa(d.collection.fee)],
            ["ফান্ড বরাদ্দ", takaFromPaisa(d.collection["fund-allocation"])],
            ["অনুদান", takaFromPaisa(d.collection.donation)],
            [<b key="t">মোট</b>, <b key="v">{takaFromPaisa(d.collection.netPaisa)}</b>],
          ]}
          empty="আজ কোনো আদায় নেই"
        />
      );
    case "dues":
      return (
        <Table
          head={["ইনভয়েস", "শিক্ষার্থী", "বকেয়া", "দেরি"]}
          rows={d.dues.rows.map((r) => [
            <span className="latin" key="id">
              {r.id}
            </span>,
            r.studentName,
            takaFromPaisa(r.outstandingPaisa),
            `${bn(r.daysOverdue)} দিন`,
          ])}
          empty="কোনো বকেয়া নেই"
        />
      );
    case "funds":
      return (
        <Table
          head={["ফান্ড", "ব্যবহারযোগ্য", "অপরিশোধিত প্রতিশ্রুতি", "এই মাসে বরাদ্দ"]}
          rows={d.funds.rows.map((f) => [
            f.name,
            takaFromPaisa(f.availablePaisa),
            takaFromPaisa(f.pledgedPaisa),
            takaFromPaisa(f.allocatedThisMonthPaisa),
          ])}
          empty="কোনো ফান্ড নেই"
        />
      );
    case "hifz":
      return (
        <Table
          head={["শিক্ষার্থী", "হালাকা", "লক্ষ্যের %"]}
          rows={d.hifz.behind.map((s) => [s.name, s.halaqa, `${bn(s.percent)}%`])}
          empty={`কেউ ${bn(hifzBehindPercent)}% এর নিচে নেই`}
        />
      );
    case "homework":
      return (
        <Table
          head={["ক্লাস", "জমা হয়নি", "সময় পেরিয়েছে"]}
          rows={d.homework.overdue.map((h) => [
            h.classLabel,
            `${bn(h.missing)} জন`,
            `${bn(h.daysLate)} দিন`,
          ])}
          empty="কোনো ক্লাসে সময় পেরোয়নি"
        />
      );
    case "approvals":
      return (
        <Table
          head={["ধরন", "বিষয়", "বয়স", "অগ্রাধিকার"]}
          rows={d.approvals.map((a) => [
            approvalKindLabel[a.kind],
            <span key="t">
              {a.title}
              {a.ownRequest && (
                <small className="dash-own"> · আপনার অনুরোধ, অন্য কেউ অনুমোদন করবেন</small>
              )}
            </span>,
            `${bn(a.ageDays)} দিন`,
            <span key="p" className={`ds-badge ${a.priority === "high" ? "danger" : "neutral"}`}>
              {a.priority === "high" ? "জরুরি" : "সাধারণ"}
            </span>,
          ])}
          empty="কোনো অনুমোদন বাকি নেই"
        />
      );
    case "events":
      return (
        <Table
          head={["ধরন", "বিষয়", "কবে"]}
          rows={d.events.map((e) => [eventKindLabel[e.kind], e.title, inDaysLabel(e.inDays)])}
          empty="আগামী ১৪ দিনে কিছু নেই"
        />
      );
  }
}
