/**
 * S03 · Director dashboard (redesign 2026-11-10, see .interface-design/system.md).
 * Every number comes from dashboard-domain (tested); this file only loads, lays out and displays.
 * Scope (branch + session) comes from the shell's single scope control.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  CalendarOff,
  ChevronRight,
  CircleCheck,
  CircleDashed,
  CircleX,
  Clock3,
  EllipsisVertical,
  Printer,
  RefreshCw,
  TriangleAlert,
  WifiOff,
  X,
  type LucideIcon,
} from "lucide-react";
import type { AppSection } from "./app-routes";
import {
  activeStudentSummary,
  approvalHighPriorityPaisa,
  approvalQueue,
  attendanceSummary,
  collectionCash,
  duesWithAgeing,
  fundBalances,
  hifzBehindPercent,
  hifzProgress,
  homeworkStatus,
  registerCoverage,
  resolveDashboardPermission,
  todayTasks,
  upcomingEvents,
  type ApprovalKind,
  type ApprovalRow,
  type DashboardCard,
  type DashboardEvent,
  type DashboardScope,
  type DashboardTask,
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
} from "./dashboard-data";
import { bn, clock, dateParts, gregorianDate, hijriDate, takaFromPaisa } from "./bn-format";
import { prototypeRoles, type PrototypeRole } from "./student-permissions";
import { SystemState } from "./SystemStates";
import { Popover } from "./shell/Popover";
import { branchLabel, effectiveBranch, useOffline, useShellState } from "./shell/ShellState";
import "./dashboard.css";

// ---------- Labels ----------

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

/** Where the full review of an approval kind lives, when that screen exists in the prototype. */
const approvalModule: Partial<Record<ApprovalKind, { section: AppSection; label: string }>> = {
  admission: { section: "admissions", label: "ভর্তি ব্যবস্থাপনা" },
  concession: { section: "sponsorships", label: "স্পন্সরশিপ ও ফান্ড" },
  sponsorship: { section: "sponsorships", label: "স্পন্সরশিপ ও ফান্ড" },
  refund: { section: "fees", label: "ফি ও পেমেন্ট" },
  "question-paper": { section: "examPapers", label: "প্রশ্নপত্র" },
};

const eventKind: Record<DashboardEvent["kind"], { label: string; tone: string }> = {
  exam: { label: "পরীক্ষা", tone: "warning" },
  notice: { label: "নোটিশ", tone: "info" },
  event: { label: "অনুষ্ঠান", tone: "neutral" },
  holiday: { label: "ছুটি", tone: "neutral" },
  "routine-conflict": { label: "রুটিন সংঘাত", tone: "danger" },
};

const ageLabel = (days: number) => (days === 0 ? "আজ" : `${bn(days)} দিন আগে`);
const inDaysLabel = (days: number) =>
  days === 0 ? "আজ" : days === 1 ? "আগামীকাল" : `${bn(days)} দিন পর`;
const percent = (part: number, whole: number) =>
  whole <= 0 ? 0 : Math.round((part / whole) * 100);

// ---------- Data source (the seam for the real API) ----------

function computeDashboard(scope: DashboardScope, viewerId: string | undefined, empty: boolean) {
  const pick = <T,>(rows: T[]): T[] => (empty ? [] : rows);
  const attendance = attendanceSummary(
    pick(registers),
    scope,
    demoNowMinutes,
    attendanceCutoffMinutes,
  );
  const approvals = approvalQueue(pick(pendingApprovals), scope, demoToday, viewerId);
  const homework = homeworkStatus(pick(homeworkLines), scope, demoToday);
  return {
    students: activeStudentSummary(pick(enrollments), scope),
    attendance,
    coverage: registerCoverage(pick(registers), scope),
    cash: collectionCash(pick(moneyEntries), scope, demoToday),
    dues: duesWithAgeing(pick(invoices), scope, demoToday),
    funds: fundBalances(pick(funds)),
    hifz: hifzProgress(pick(hifzStudents), scope),
    homework,
    approvals,
    events: upcomingEvents(pick(events), scope, demoToday),
  };
}
type DashData = ReturnType<typeof computeDashboard>;

type LoadState = {
  key: string;
  status: "loading" | "ready" | "error";
  data?: DashData;
  refreshing: boolean;
};

/**
 * Loads one scope. A scope change drops the old numbers at once (old-scope data is never shown as new);
 * a refresh of the same scope keeps them on screen; a late answer for an older request is ignored.
 */
function useDashboardData(scope: DashboardScope, viewerId: string | undefined) {
  const { fixture } = useShellState();
  const key = `${scope.branch}|${scope.session}`;
  const [state, setState] = useState<LoadState>({ key, status: "loading", refreshing: false });
  const [tick, setTick] = useState(0);
  const request = useRef(0);
  useEffect(() => {
    const id = ++request.current;
    setState((prev) =>
      prev.key === key && prev.status === "ready" && fixture !== "loading"
        ? { ...prev, refreshing: true }
        : { key, status: "loading", refreshing: false },
    );
    if (fixture === "loading") return;
    const timer = window.setTimeout(() => {
      if (id !== request.current) return;
      setState(
        fixture === "error"
          ? { key, status: "error", refreshing: false }
          : {
              key,
              status: "ready",
              refreshing: false,
              data: computeDashboard(
                { branch: scope.branch, session: scope.session },
                viewerId,
                fixture === "empty",
              ),
            },
      );
    }, 280);
    return () => window.clearTimeout(timer);
  }, [key, tick, fixture, viewerId, scope.branch, scope.session]);
  const current: LoadState =
    state.key === key ? state : { key, status: "loading", refreshing: false };
  return { ...current, reload: () => setTick((value) => value + 1) };
}

// ---------- Page ----------

type Drawer = { kind: "card"; card: DashboardCard } | { kind: "approval"; row: ApprovalRow };
type TaskFilter = "all" | DashboardTask["type"];

export default function Dashboard({
  role,
  onNavigate,
}: {
  role: PrototypeRole;
  onNavigate?: (section: AppSection) => void;
}) {
  const context = prototypeRoles[role].context;
  const permission = resolveDashboardPermission(context);
  const shell = useShellState();
  const offline = useOffline();
  const scope: DashboardScope = {
    branch: effectiveBranch(shell.branch, permission.branches),
    session: shell.session,
  };
  const { status, data, refreshing, reload } = useDashboardData(scope, context.actorId);
  const [drawer, setDrawer] = useState<Drawer | null>(null);
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("all");
  const [tasksExpanded, setTasksExpanded] = useState(false);
  const tasksHeading = useRef<HTMLHeadingElement>(null);

  if (!permission.open) {
    return (
      <SystemState
        kind="no-permission"
        message="এই ড্যাশবোর্ড পরিচালক, Admin, Academic Admin ও Finance Lead এর জন্য। আপনার নিজের কাজের পাতা মেনুতে আছে।"
      />
    );
  }

  const has = (card: DashboardCard) => permission.cards.includes(card);
  const scopeText = `${branchLabel[scope.branch]} · সেশন ${bn(scope.session)}`;
  const focusTasks = (filter: TaskFilter) => {
    setTaskFilter(filter);
    setTasksExpanded(true);
    tasksHeading.current?.scrollIntoView({ block: "start", behavior: "auto" });
    tasksHeading.current?.focus({ preventScroll: true });
  };
  const kpis = (["students", "attendance", "collection", "dues"] as const).filter(has);
  const hasTasks = has("attendance") || has("approvals") || has("homework");
  const hasAcademic = has("hifz") || has("homework");

  return (
    <main className="dash" aria-busy={status === "loading" || refreshing}>
      <header className="dash-head">
        <div className="dash-head-text">
          <h1>পরিচালকের ড্যাশবোর্ড</h1>
          <p>
            <span>{gregorianDate(demoToday)}</span>
            <span aria-hidden="true"> · </span>
            <span>{hijriDate(demoToday)}</span>
            <span aria-hidden="true"> · </span>
            <span>{scopeText}</span>
          </p>
        </div>
        <div className="dash-head-actions">
          <span className="dash-refreshing" role="status">
            {refreshing ? "হালনাগাদ হচ্ছে…" : ""}
          </span>
          {has("approvals") && (
            <button
              type="button"
              className="ds-button primary"
              disabled={status !== "ready"}
              onClick={() => focusTasks("approval")}
            >
              অনুমোদন পর্যালোচনা
              {data && data.approvals.length > 0 && (
                <span className="dash-count">{bn(data.approvals.length)}</span>
              )}
            </button>
          )}
          <Popover
            label="আরও কাজ"
            role="menu"
            align="end"
            trigger={(props) => (
              <button {...props} className="sh-icon-button dash-more" aria-label="আরও কাজ">
                <EllipsisVertical size={20} strokeWidth={1.75} />
              </button>
            )}
          >
            {(close) => (
              <div className="sh-menu">
                <button
                  type="button"
                  role="menuitem"
                  className="sh-option"
                  aria-disabled={offline || status === "loading"}
                  onClick={() => {
                    if (offline || status === "loading") return;
                    close();
                    reload();
                  }}
                >
                  <RefreshCw size={18} aria-hidden="true" />
                  তথ্য হালনাগাদ করুন
                  {offline && <small>· অফলাইনে সম্ভব নয়</small>}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="sh-option"
                  onClick={() => {
                    close();
                    window.print();
                  }}
                >
                  <Printer size={18} aria-hidden="true" />
                  এই পাতা ছাপুন
                </button>
              </div>
            )}
          </Popover>
        </div>
      </header>

      <p className="dash-demo">ডেমো তথ্য — এই সংখ্যাগুলো কাল্পনিক, প্রতিষ্ঠানের আসল রেকর্ড নয়।</p>

      {offline && (
        <p className="dash-banner" role="status">
          <WifiOff size={20} aria-hidden="true" />
          <span>
            <b>ইন্টারনেট সংযোগ নেই।</b> নিচে সর্বশেষ পাওয়া তথ্য দেখানো হচ্ছে; সংযোগ ফিরলে হালনাগাদ করুন।
          </span>
        </p>
      )}

      {status === "error" ? (
        <section className="dash-panel dash-error" role="alert">
          <TriangleAlert size={24} aria-hidden="true" />
          <h2>ড্যাশবোর্ডের তথ্য পাওয়া যায়নি</h2>
          <p>{scopeText} এর তথ্য আনা যায়নি। আপনার কোনো তথ্য হারায়নি; কিছুক্ষণ পর আবার চেষ্টা করুন।</p>
          <button type="button" className="ds-button secondary" onClick={reload}>
            <RefreshCw size={18} aria-hidden="true" />
            আবার চেষ্টা করুন
          </button>
        </section>
      ) : status === "loading" || !data ? (
        <LoadingLayout kpis={kpis.length} scopeText={scopeText} />
      ) : (
        <>
          <section className="dash-kpis" data-count={kpis.length} aria-label="সারসংক্ষেপ">
            {has("students") && (
              <Kpi
                title="সক্রিয় শিক্ষার্থী"
                period={`সেশন ${bn(scope.session)}`}
                value={bn(data.students.total)}
                unit="জন"
                updated={lastUpdated.students}
                action={{ label: "শিক্ষার্থী তালিকা", onClick: () => onNavigate?.("students") }}
              >
                <dl className="dash-lines">
                  <div>
                    <dt>শাখা অনুযায়ী</dt>
                    <dd>
                      বালক {bn(data.students.boys)} · বালিকা {bn(data.students.girls)}
                    </dd>
                  </div>
                  <div>
                    <dt>আবাসন অনুযায়ী</dt>
                    <dd>
                      আবাসিক {bn(data.students.residential)} · অনাবাসিক {bn(data.students.dayScholar)}
                    </dd>
                  </div>
                </dl>
              </Kpi>
            )}
            {has("attendance") && (
              <Kpi
                title="আজকের হাজিরা"
                period={`${bn(data.coverage.registers)}টি রেজিস্টার · ${bn(data.attendance.total)} জন`}
                value={bn(data.attendance.present)}
                unit="জন উপস্থিত"
                updated={lastUpdated.attendance}
                action={{
                  label: "বাকি রেজিস্টার",
                  onClick: () => setDrawer({ kind: "card", card: "attendance" }),
                }}
              >
                <ul className="dash-states">
                  <State icon={Clock3} tone="warning" label="দেরি" value={data.attendance.late} />
                  <State
                    icon={CircleX}
                    tone="danger"
                    label="অনুপস্থিত"
                    value={data.attendance.absent}
                  />
                  <State icon={CalendarOff} tone="info" label="ছুটি" value={data.attendance.leave} />
                  <State
                    icon={CircleDashed}
                    tone="muted"
                    label="নেওয়া হয়নি"
                    value={data.attendance.unmarked}
                  />
                </ul>
                {data.attendance.pendingRegisters.length > 0 && (
                  <button
                    type="button"
                    className="dash-exception"
                    onClick={() => focusTasks("register")}
                  >
                    <TriangleAlert size={18} aria-hidden="true" />
                    <span>
                      {bn(data.attendance.pendingRegisters.length)}টি রেজিস্টার সকাল{" "}
                      {clock(attendanceCutoffMinutes)}-এর পরও জমা হয়নি
                    </span>
                  </button>
                )}
              </Kpi>
            )}
            {has("collection") && (
              <Kpi
                title="আজকের আদায়"
                period={`আজ · রসিদ ${bn(data.cash.receiptCount)}টি · ফেরত ${bn(data.cash.refundCount)}টি`}
                value={takaFromPaisa(data.cash.cashPaisa)}
                updated={lastUpdated.collection}
                action={{
                  label: "আদায়ের হিসাব",
                  onClick: () => setDrawer({ kind: "card", card: "collection" }),
                }}
              >
                <dl className="dash-lines money">
                  <div>
                    <dt>ফি (ফেরত বাদে)</dt>
                    <dd>{takaFromPaisa(data.cash.feeNetPaisa)}</dd>
                  </div>
                  <div>
                    <dt>অনুদান</dt>
                    <dd>{takaFromPaisa(data.cash.donationPaisa)}</dd>
                  </div>
                  <div className="apart">
                    <dt>ফান্ড বরাদ্দ (নগদ নয়)</dt>
                    <dd>{takaFromPaisa(data.cash.fundAllocationPaisa)}</dd>
                  </div>
                </dl>
              </Kpi>
            )}
            {has("dues") && (
              <Kpi
                title="বকেয়া"
                period={`আজ পর্যন্ত · ${bn(data.dues.rows.length)}টি ইনভয়েস`}
                value={takaFromPaisa(data.dues.totalPaisa)}
                updated={lastUpdated.dues}
                action={{
                  label: "বকেয়া তালিকা",
                  onClick: () => setDrawer({ kind: "card", card: "dues" }),
                }}
              >
                <dl className="dash-lines money">
                  <div>
                    <dt>০–৩০ দিন</dt>
                    <dd>{takaFromPaisa(data.dues.buckets["0-30"])}</dd>
                  </div>
                  <div>
                    <dt>৩১–৬০ দিন</dt>
                    <dd>{takaFromPaisa(data.dues.buckets["31-60"])}</dd>
                  </div>
                  <div>
                    <dt>৬০ দিনের বেশি</dt>
                    <dd>{takaFromPaisa(data.dues.buckets["60+"])}</dd>
                  </div>
                </dl>
              </Kpi>
            )}
          </section>

          <div className="dash-work">
            {hasTasks && (
              <TasksPanel
                data={data}
                has={has}
                filter={taskFilter}
                setFilter={setTaskFilter}
                expanded={tasksExpanded}
                setExpanded={setTasksExpanded}
                headingRef={tasksHeading}
                onNavigate={onNavigate}
                onReview={(row) => setDrawer({ kind: "approval", row })}
              />
            )}

            {has("funds") && (
              <section className="dash-panel rail" aria-labelledby="dash-funds">
                <PanelHead id="dash-funds" title="ফান্ডের অবস্থা" note="ব্যবহারযোগ্য ব্যালেন্স" />
                {data.funds.rows.length === 0 ? (
                  <Empty>কোনো ফান্ড তৈরি হয়নি।</Empty>
                ) : (
                  <ul className="dash-funds">
                    {data.funds.rows.map((fund) => (
                      <li key={fund.id}>
                        <b>{fund.name}</b>
                        <span className="amount">{takaFromPaisa(fund.availablePaisa)}</span>
                        <small>
                          {fund.allocatedThisMonthPaisa > 0
                            ? `এই মাসে বরাদ্দ ${takaFromPaisa(fund.allocatedThisMonthPaisa)}`
                            : "এই মাসে বরাদ্দ হয়নি"}
                        </small>
                      </li>
                    ))}
                    <li className="total">
                      <b>মোট ব্যবহারযোগ্য</b>
                      <span className="amount">
                        {takaFromPaisa(data.funds.totalAvailablePaisa)}
                      </span>
                      <small>অপরিশোধিত প্রতিশ্রুতি ব্যালেন্সে ধরা হয়নি</small>
                    </li>
                  </ul>
                )}
                <PanelFoot
                  updated={lastUpdated.funds}
                  action={{
                    label: "ফান্ডের বিস্তারিত",
                    onClick: () => setDrawer({ kind: "card", card: "funds" }),
                  }}
                />
              </section>
            )}

            {hasAcademic && (
              <section className="dash-panel" aria-labelledby="dash-academic">
                <PanelHead id="dash-academic" title="একাডেমিক অগ্রগতি" />
                <div className="dash-academic">
                  {has("hifz") && (
                    <div className="dash-sub">
                      <h3>হিফজ ও সবক অগ্রগতি</h3>
                      <p className="dash-meta">এই মাস · অনুমোদিত সবক বনাম লক্ষ্য</p>
                      <Bar
                        label="অনুমোদিত সবক"
                        value={`${bn(data.hifz.approvedPages)} / ${bn(data.hifz.targetPages)} পৃষ্ঠা`}
                        percent={data.hifz.percent}
                      />
                      <h4>
                        পিছিয়ে থাকা শিক্ষার্থী ({bn(hifzBehindPercent)}%-এর নিচে) ·{" "}
                        {bn(data.hifz.behind.length)} জন
                      </h4>
                      {data.hifz.behind.length === 0 ? (
                        <Empty>কেউ পিছিয়ে নেই।</Empty>
                      ) : (
                        <ul className="dash-rows">
                          {data.hifz.behind.slice(0, 3).map((student) => (
                            <li key={student.studentId}>
                              <span>
                                {student.name}
                                <small>{student.halaqa}</small>
                              </span>
                              <span className="amount">লক্ষ্যের {bn(student.percent)}%</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <PanelFoot
                        updated={lastUpdated.hifz}
                        action={{
                          label: "ফলো-আপ তালিকা",
                          onClick: () => setDrawer({ kind: "card", card: "hifz" }),
                        }}
                      />
                    </div>
                  )}
                  {has("homework") && (
                    <div className="dash-sub">
                      <h3>হোমওয়ার্ক</h3>
                      <p className="dash-meta">
                        চলমান হোমওয়ার্ক · দেওয়া {bn(data.homework.assigned)}টি
                      </p>
                      <Bar
                        label="জমা / অফলাইনে দেখা"
                        value={`${bn(data.homework.submitted)} / ${bn(data.homework.assigned)}`}
                        percent={percent(data.homework.submitted, data.homework.assigned)}
                      />
                      <Bar
                        label="শিক্ষক দেখেছেন"
                        value={`${bn(data.homework.checked)} / ${bn(data.homework.assigned)}`}
                        percent={percent(data.homework.checked, data.homework.assigned)}
                      />
                      <h4>সময় পেরোনো ক্লাস · {bn(data.homework.overdue.length)}টি</h4>
                      {data.homework.overdue.length === 0 ? (
                        <Empty>কোনো ক্লাসে সময় পেরোয়নি।</Empty>
                      ) : (
                        <ul className="dash-rows">
                          {data.homework.overdue.slice(0, 3).map((line) => (
                            <li key={line.id}>
                              <span>
                                {line.classLabel}
                                <small>{bn(line.daysLate)} দিন দেরি</small>
                              </span>
                              <span className="amount">{bn(line.missing)} জন বাকি</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <PanelFoot
                        updated={lastUpdated.homework}
                        action={{ label: "হোমওয়ার্ক পাতা", onClick: () => onNavigate?.("homework") }}
                      />
                    </div>
                  )}
                </div>
              </section>
            )}

            {has("events") && (
              <section className="dash-panel rail" aria-labelledby="dash-events">
                <PanelHead id="dash-events" title="আসন্ন কার্যক্রম" note="আগামী ১৪ দিন" />
                {data.events.length === 0 ? (
                  <Empty>আগামী ১৪ দিনে কোনো কার্যক্রম নেই।</Empty>
                ) : (
                  <ul className="dash-events">
                    {data.events.slice(0, 4).map((event) => (
                      <EventRow key={event.id} event={event} />
                    ))}
                  </ul>
                )}
                <PanelFoot
                  updated={lastUpdated.events}
                  action={{
                    label: `সব কার্যক্রম (${bn(data.events.length)})`,
                    onClick: () => setDrawer({ kind: "card", card: "events" }),
                  }}
                />
              </section>
            )}
          </div>
        </>
      )}

      {drawer && data && (
        <DetailDrawer
          drawer={drawer}
          data={data}
          scopeText={scopeText}
          onNavigate={onNavigate}
          onClose={() => setDrawer(null)}
        />
      )}
    </main>
  );
}

// ---------- Reusable pieces ----------

type Action = { label: string; onClick: () => void };

function LinkButton({ action }: { action: Action }) {
  return (
    <button type="button" className="dash-link" onClick={action.onClick}>
      {action.label}
      <ChevronRight size={18} aria-hidden="true" />
    </button>
  );
}

function Kpi({
  title,
  period,
  value,
  unit,
  updated,
  action,
  children,
}: {
  title: string;
  period: string;
  value: string;
  unit?: string;
  updated: number;
  action: Action;
  children: ReactNode;
}) {
  return (
    <article className="dash-kpi">
      <h2>{title}</h2>
      <p className="dash-meta">{period}</p>
      <p className="dash-value">
        {value}
        {unit && <small> {unit}</small>}
      </p>
      <div className="dash-kpi-body">{children}</div>
      <PanelFoot updated={updated} action={action} />
    </article>
  );
}

function State({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: LucideIcon;
  tone: string;
  label: string;
  value: number;
}) {
  return (
    <li className={tone}>
      <Icon size={18} aria-hidden="true" />
      <span>{label}</span>
      <b>{bn(value)}</b>
    </li>
  );
}

function PanelHead({ id, title, note }: { id: string; title: string; note?: string }) {
  return (
    <header className="dash-panel-head">
      <h2 id={id}>{title}</h2>
      {note && <span className="dash-meta">{note}</span>}
    </header>
  );
}

function PanelFoot({ updated, action }: { updated: number; action?: Action }) {
  return (
    <footer className="dash-foot">
      <span>হালনাগাদ {clock(updated)}</span>
      {action && <LinkButton action={action} />}
    </footer>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="dash-empty">{children}</p>;
}

function Bar({ label, value, percent: p }: { label: string; value: string; percent: number }) {
  return (
    <div className="dash-bar">
      <div>
        <span>{label}</span>
        <b>
          {value} · {bn(p)}%
        </b>
      </div>
      <div role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={p}>
        <i style={{ width: `${p}%` }} />
      </div>
    </div>
  );
}

function EventRow({ event }: { event: DashboardEvent & { inDays: number } }) {
  const date = dateParts(event.date);
  const kind = eventKind[event.kind];
  return (
    <li>
      <time dateTime={event.date}>
        <b>{date.day}</b>
        <span>{date.month}</span>
      </time>
      <div>
        <b>{event.title}</b>
        <p>
          <span className={`ds-badge ${kind.tone}`}>
            {event.kind === "routine-conflict" && <TriangleAlert size={14} aria-hidden="true" />}
            {kind.label}
          </span>
          <small>
            {date.weekday} · {inDaysLabel(event.inDays)}
          </small>
        </p>
      </div>
    </li>
  );
}

const taskFilterLabel: Record<TaskFilter, string> = {
  all: "সব",
  register: "হাজিরা",
  approval: "অনুমোদন",
  homework: "হোমওয়ার্ক",
};

function TasksPanel({
  data,
  has,
  filter,
  setFilter,
  expanded,
  setExpanded,
  headingRef,
  onNavigate,
  onReview,
}: {
  data: DashData;
  has: (card: DashboardCard) => boolean;
  filter: TaskFilter;
  setFilter: (filter: TaskFilter) => void;
  expanded: boolean;
  setExpanded: (value: boolean) => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onNavigate?: (section: AppSection) => void;
  onReview: (row: ApprovalRow) => void;
}) {
  const tasks = todayTasks({
    pendingRegisters: has("attendance") ? data.attendance.pendingRegisters : [],
    approvals: has("approvals") ? data.approvals : [],
    homeworkOverdue: has("homework") ? data.homework.overdue : [],
  });
  const types = (["register", "approval", "homework"] as const).filter((type) =>
    has(type === "register" ? "attendance" : type === "approval" ? "approvals" : "homework"),
  );
  const count = (type: TaskFilter) =>
    type === "all" ? tasks.length : tasks.filter((task) => task.type === type).length;
  const shown = tasks.filter((task) => filter === "all" || task.type === filter);
  const limit = 4;
  const visible = expanded ? shown : shown.slice(0, limit);
  const oldest = data.approvals.reduce((max, row) => Math.max(max, row.ageDays), 0);

  return (
    <section className="dash-panel dash-tasks" aria-labelledby="dash-tasks">
      <header className="dash-panel-head">
        <h2 id="dash-tasks" ref={headingRef} tabIndex={-1}>
          আজকের কাজ
        </h2>
        <span className="dash-meta">
          {bn(tasks.length)}টি বাকি
          {has("approvals") && data.approvals.length > 0 && (
            <>
              {" "}
              · অনুমোদন {bn(data.approvals.length)}টি, সবচেয়ে পুরোনো {bn(oldest)} দিন
            </>
          )}
        </span>
      </header>
      <div className="dash-filters" role="group" aria-label="কাজের ধরন">
        {(["all", ...types] as TaskFilter[]).map((type) => (
          <button
            key={type}
            type="button"
            aria-pressed={filter === type}
            onClick={() => setFilter(type)}
          >
            {taskFilterLabel[type]} <span>{bn(count(type))}</span>
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="dash-empty done">
          <CircleCheck size={20} aria-hidden="true" />
          {filter === "all" ? "আজ কোনো কাজ বাকি নেই।" : "এই ধরনের কোনো কাজ বাকি নেই।"}
        </p>
      ) : (
        <ul className="dash-task-list">
          {visible.map((task) => (
            <TaskRow key={task.id} task={task} onNavigate={onNavigate} onReview={onReview} />
          ))}
        </ul>
      )}
      <footer className="dash-foot">
        <span>হালনাগাদ {clock(Math.max(lastUpdated.attendance, lastUpdated.approvals))}</span>
        {shown.length > limit && (
          <button
            type="button"
            className="dash-link"
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "কম দেখুন" : `সব দেখুন (${bn(shown.length)}টি)`}
          </button>
        )}
      </footer>
    </section>
  );
}

function TaskRow({
  task,
  onNavigate,
  onReview,
}: {
  task: DashboardTask;
  onNavigate?: (section: AppSection) => void;
  onReview: (row: ApprovalRow) => void;
}) {
  let kind: string;
  let title: string;
  let meta: ReactNode;
  let amount: string | undefined;
  let action: ReactNode;
  if (task.type === "register") {
    kind = "হাজিরা";
    title = task.register.label;
    meta = `${task.register.teacher} · ${bn(task.register.unmarked)} জনের হাজিরা নেওয়া হয়নি · সময়সীমা ${clock(attendanceCutoffMinutes)} পেরিয়েছে`;
    action = (
      <button
        type="button"
        className="ds-button secondary"
        onClick={() => onNavigate?.("attendance")}
      >
        হাজিরা খুলুন
      </button>
    );
  } else if (task.type === "approval") {
    const row = task.approval;
    kind = `অনুমোদন · ${approvalKindLabel[row.kind]}`;
    title = row.title;
    meta = (
      <>
        {branchLabel[row.branch]} · অনুরোধকারী <span className="latin">{row.creatorId}</span> ·{" "}
        {ageLabel(row.ageDays)}
        {row.ownRequest && " · আপনার নিজের অনুরোধ"}
      </>
    );
    amount = row.amountPaisa !== undefined ? takaFromPaisa(row.amountPaisa) : undefined;
    action = (
      <button type="button" className="ds-button secondary" onClick={() => onReview(row)}>
        পর্যালোচনা
      </button>
    );
  } else {
    kind = "হোমওয়ার্ক";
    title = task.homework.classLabel;
    meta = `${bn(task.homework.missing)} জন জমা দেয়নি · ${bn(task.homework.daysLate)} দিন দেরি`;
    action = (
      <button
        type="button"
        className="ds-button secondary"
        onClick={() => onNavigate?.("homework")}
      >
        হোমওয়ার্ক খুলুন
      </button>
    );
  }
  return (
    <li className="dash-task">
      <div className="dash-task-main">
        <p className="dash-task-kind">
          {kind}
          {task.priority === "high" && (
            <span className="ds-badge danger">
              <TriangleAlert size={14} aria-hidden="true" />
              জরুরি
            </span>
          )}
        </p>
        <b>{title}</b>
        <p className="dash-meta">{meta}</p>
      </div>
      {amount && <span className="dash-task-amount amount">{amount}</span>}
      {action}
    </li>
  );
}

function LoadingLayout({ kpis, scopeText }: { kpis: number; scopeText: string }) {
  return (
    <div role="status" aria-label={`${scopeText} এর তথ্য লোড হচ্ছে`}>
      <div className="dash-kpis" data-count={kpis}>
        {Array.from({ length: kpis }, (_, i) => (
          <div key={i} className="dash-kpi dash-skeleton" aria-hidden="true">
            <i style={{ width: "45%" }} />
            <i style={{ width: "60%", height: 34, marginTop: 20 }} />
            <i style={{ marginTop: 20 }} />
            <i style={{ width: "80%" }} />
            <i style={{ width: "40%", marginTop: 20 }} />
          </div>
        ))}
      </div>
      <div className="dash-work" aria-hidden="true">
        {[380, 380, 300, 300].map((height, i) => (
          <div
            key={i}
            className={`dash-panel dash-skeleton ${i % 2 ? "rail" : ""}`}
            style={{ minHeight: height }}
          >
            <i style={{ width: "35%", height: 22 }} />
            {Array.from({ length: i < 2 ? 4 : 3 }, (_, row) => (
              <i key={row} style={{ marginTop: 28, width: `${88 - row * 9}%` }} />
            ))}
          </div>
        ))}
      </div>
      <p className="dash-loading-note">{scopeText} এর তথ্য লোড হচ্ছে…</p>
    </div>
  );
}

// ---------- Drawer: drill-down lists and approval review ----------

const drawerTitle: Record<DashboardCard, string> = {
  students: "সক্রিয় শিক্ষার্থী",
  attendance: "সময় পেরোনো হাজিরা রেজিস্টার",
  collection: "আজকের আদায়ের হিসাব",
  dues: "বকেয়া ইনভয়েস",
  funds: "ফান্ডের বিস্তারিত",
  hifz: "হিফজ ফলো-আপ তালিকা",
  homework: "সময় পেরোনো হোমওয়ার্ক",
  approvals: "অনুমোদন বাকি",
  events: "আসন্ন কার্যক্রম",
};

function DetailDrawer({
  drawer,
  data,
  scopeText,
  onNavigate,
  onClose,
}: {
  drawer: Drawer;
  data: DashData;
  scopeText: string;
  onNavigate?: (section: AppSection) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = dialog.current;
    if (el && !el.open) el.showModal();
  }, []);
  const title = drawer.kind === "card" ? drawerTitle[drawer.card] : "অনুমোদন পর্যালোচনা";
  return (
    <dialog
      ref={dialog}
      className="dash-drawer"
      aria-labelledby="dash-drawer-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialog.current) dialog.current?.close();
      }}
    >
      <div className="dash-drawer-box">
        <header>
          <div>
            <h2 id="dash-drawer-title">{title}</h2>
            <p className="dash-meta">{scopeText}</p>
          </div>
          <button
            type="button"
            className="sh-icon-button"
            aria-label="বন্ধ করুন"
            onClick={() => dialog.current?.close()}
          >
            <X size={20} />
          </button>
        </header>
        <div className="dash-drawer-body">
          {drawer.kind === "card" ? (
            <CardDetail card={drawer.card} data={data} />
          ) : (
            <ApprovalReview
              row={drawer.row}
              onOpenModule={(section) => {
                dialog.current?.close();
                onNavigate?.(section);
              }}
            />
          )}
        </div>
      </div>
    </dialog>
  );
}

function ApprovalReview({
  row,
  onOpenModule,
}: {
  row: ApprovalRow;
  onOpenModule: (section: AppSection) => void;
}) {
  const reasons = [
    row.exception && "নিয়মের ব্যতিক্রম",
    (row.amountPaisa ?? 0) > approvalHighPriorityPaisa &&
      `টাকার পরিমাণ ${takaFromPaisa(approvalHighPriorityPaisa)}-এর বেশি`,
    row.ageDays >= 3 && `${bn(row.ageDays)} দিন ধরে অপেক্ষায়`,
  ].filter(Boolean) as string[];
  const module = approvalModule[row.kind];
  return (
    <>
      <dl className="dash-review">
        <div>
          <dt>বিষয়</dt>
          <dd>{row.title}</dd>
        </div>
        <div>
          <dt>ধরন</dt>
          <dd>{approvalKindLabel[row.kind]}</dd>
        </div>
        <div>
          <dt>শাখা</dt>
          <dd>{branchLabel[row.branch]}</dd>
        </div>
        <div>
          <dt>অনুরোধকারী</dt>
          <dd className="latin">{row.creatorId}</dd>
        </div>
        <div>
          <dt>অনুরোধ নম্বর</dt>
          <dd className="latin">{row.id}</dd>
        </div>
        <div>
          <dt>অপেক্ষার সময়</dt>
          <dd>{ageLabel(row.ageDays)}</dd>
        </div>
        <div>
          <dt>আর্থিক প্রভাব</dt>
          <dd>{row.amountPaisa !== undefined ? takaFromPaisa(row.amountPaisa) : "টাকার প্রভাব নেই"}</dd>
        </div>
        <div>
          <dt>অগ্রাধিকার</dt>
          <dd>
            {row.priority === "high" ? (
              <>
                <span className="ds-badge danger">
                  <TriangleAlert size={14} aria-hidden="true" />
                  জরুরি
                </span>{" "}
                {reasons.join(" · ")}
              </>
            ) : (
              "সাধারণ"
            )}
          </dd>
        </div>
      </dl>
      <p className="dash-banner">
        <TriangleAlert size={20} aria-hidden="true" />
        <span>
          {row.ownRequest
            ? "এটি আপনার নিজের অনুরোধ। নিয়ম অনুযায়ী অন্য একজন অনুমোদনকারী এটি দেখবেন।"
            : "ড্যাশবোর্ড থেকে সরাসরি অনুমোদন দেওয়া যায় না। সংযুক্তি ও পূর্ণ বিবরণ দেখে সংশ্লিষ্ট পাতায় সিদ্ধান্ত দিন। এই প্রোটোটাইপে সিদ্ধান্ত জমা নেওয়ার সার্ভার যুক্ত নেই।"}
        </span>
      </p>
      <div className="dash-review-actions">
        {module ? (
          <button
            type="button"
            className="ds-button primary"
            onClick={() => onOpenModule(module.section)}
          >
            {module.label} পাতায় খুলুন
          </button>
        ) : (
          <p className="dash-meta">এই ধরনের অনুমোদনের পাতা এখনো তৈরি হয়নি।</p>
        )}
        <button type="button" className="ds-button secondary" disabled>
          অনুমোদন
        </button>
        <button type="button" className="ds-button secondary" disabled>
          কারণসহ ফেরত
        </button>
      </div>
    </>
  );
}

function Table({
  head,
  rows,
  empty,
  numeric = [],
}: {
  head: string[];
  rows: ReactNode[][];
  empty: string;
  numeric?: number[];
}) {
  if (rows.length === 0) return <Empty>{empty}</Empty>;
  return (
    <div className="dash-table-wrap">
      <table className="dash-table">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={h} scope="col" className={numeric.includes(i) ? "amount" : undefined}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, i) => (
            <tr key={i}>
              {cells.map((c, j) => (
                <td key={j} className={numeric.includes(j) ? "amount" : undefined}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CardDetail({ card, data: d }: { card: DashboardCard; data: DashData }) {
  switch (card) {
    case "students":
      return (
        <Table
          head={["ভাগ", "শিক্ষার্থী"]}
          numeric={[1]}
          rows={[
            ["বালক", bn(d.students.boys)],
            ["বালিকা", bn(d.students.girls)],
            ["আবাসিক", bn(d.students.residential)],
            ["অনাবাসিক", bn(d.students.dayScholar)],
          ]}
          empty="কোনো সক্রিয় শিক্ষার্থী নেই।"
        />
      );
    case "attendance":
      return (
        <Table
          head={["রেজিস্টার", "শিক্ষক", "নেওয়া হয়নি"]}
          numeric={[2]}
          rows={d.attendance.pendingRegisters.map((r) => [
            r.label,
            r.teacher,
            `${bn(r.unmarked)} জন`,
          ])}
          empty="সব রেজিস্টার সময়মতো জমা হয়েছে।"
        />
      );
    case "collection":
      return (
        <>
          <Table
            head={["খাত", "আজ (পোস্ট করা)"]}
            numeric={[1]}
            rows={[
              ["ফি রসিদ", takaFromPaisa(d.cash.feeReceiptsPaisa)],
              ["ফি ফেরত", `− ${takaFromPaisa(d.cash.feeRefundsPaisa)}`],
              ["অনুদান", takaFromPaisa(d.cash.donationPaisa)],
              [<b key="t">নগদ আদায় (মোট)</b>, <b key="v">{takaFromPaisa(d.cash.cashPaisa)}</b>],
            ]}
            empty="আজ কোনো আদায় নেই।"
          />
          <p className="dash-meta dash-drawer-note">
            ফান্ড থেকে বরাদ্দ {takaFromPaisa(d.cash.fundAllocationPaisa)} — এটি ভেতরের সমন্বয়, নতুন নগদ
            নয়, তাই উপরের মোটে ধরা হয়নি। খসড়া ও বাতিল রসিদ বাদ।
          </p>
        </>
      );
    case "dues":
      return (
        <Table
          head={["ইনভয়েস", "শিক্ষার্থী", "বকেয়া", "দেরি"]}
          numeric={[2, 3]}
          rows={d.dues.rows.map((r) => [
            <span className="latin" key="id">
              {r.id}
            </span>,
            r.studentName,
            takaFromPaisa(r.outstandingPaisa),
            `${bn(r.daysOverdue)} দিন`,
          ])}
          empty="কোনো বকেয়া নেই।"
        />
      );
    case "funds":
      return (
        <Table
          head={["ফান্ড", "ব্যবহারযোগ্য", "অপরিশোধিত প্রতিশ্রুতি", "এই মাসে বরাদ্দ"]}
          numeric={[1, 2, 3]}
          rows={d.funds.rows.map((f) => [
            f.name,
            takaFromPaisa(f.availablePaisa),
            takaFromPaisa(f.pledgedPaisa),
            takaFromPaisa(f.allocatedThisMonthPaisa),
          ])}
          empty="কোনো ফান্ড নেই।"
        />
      );
    case "hifz":
      return (
        <Table
          head={["শিক্ষার্থী", "হালাকা", "লক্ষ্যের %"]}
          numeric={[2]}
          rows={d.hifz.behind.map((s) => [s.name, s.halaqa, `${bn(s.percent)}%`])}
          empty={`কেউ ${bn(hifzBehindPercent)}%-এর নিচে নেই।`}
        />
      );
    case "homework":
      return (
        <Table
          head={["ক্লাস", "জমা হয়নি", "দেরি"]}
          numeric={[1, 2]}
          rows={d.homework.overdue.map((h) => [
            h.classLabel,
            `${bn(h.missing)} জন`,
            `${bn(h.daysLate)} দিন`,
          ])}
          empty="কোনো ক্লাসে সময় পেরোয়নি।"
        />
      );
    case "approvals":
      return (
        <Table
          head={["ধরন", "বিষয়", "অপেক্ষা"]}
          rows={d.approvals.map((a) => [approvalKindLabel[a.kind], a.title, ageLabel(a.ageDays)])}
          empty="কোনো অনুমোদন বাকি নেই।"
        />
      );
    case "events":
      return d.events.length === 0 ? (
        <Empty>আগামী ১৪ দিনে কোনো কার্যক্রম নেই।</Empty>
      ) : (
        <ul className="dash-events">
          {d.events.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </ul>
      );
  }
}
