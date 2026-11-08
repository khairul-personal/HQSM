/** B3 · Principal dashboard (S03). Pure, tested numbers for every card — the UI only displays them. */
import type { PermissionContext } from "./student-permissions";
import { availableFundBalance, type Fund } from "./sponsorship-domain";

export type Paisa = number;
export type BranchId = "boys" | "girls";
export type DashboardScope = { branch: BranchId | "all"; session: string };

const inScope = (scope: DashboardScope, item: { branch: BranchId; session?: string }) =>
  (scope.branch === "all" || item.branch === scope.branch) &&
  (item.session === undefined || item.session === scope.session);

const assertPaisa = (value: number) => {
  if (!Number.isSafeInteger(value) || value < 0)
    throw new RangeError("amount must be non-negative integer paisa");
};

/** Whole days from `from` to `to` (ISO dates, UTC so time zones never shift a day). */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

// ---------- Permission: which cards a role sees (shared resolver style, no inline checks) ----------

export type DashboardCard =
  | "students"
  | "attendance"
  | "collection"
  | "dues"
  | "funds"
  | "hifz"
  | "homework"
  | "approvals"
  | "events";

export const allDashboardCards: DashboardCard[] = [
  "students",
  "attendance",
  "collection",
  "dues",
  "funds",
  "hifz",
  "homework",
  "approvals",
  "events",
];

const academicCards: DashboardCard[] = [
  "students",
  "attendance",
  "hifz",
  "homework",
  "approvals",
  "events",
];
const financeCards: DashboardCard[] = ["collection", "dues", "funds", "approvals", "events"];

export type DashboardPermission = {
  open: boolean;
  cards: DashboardCard[];
  /** Branch filter options; without girls'-section access the girls' branch is absent, not disabled. */
  branches: DashboardScope["branch"][];
};

export function resolveDashboardPermission(context: PermissionContext): DashboardPermission {
  const branches: DashboardScope["branch"][] = context.girlsSectionAccess
    ? ["all", "boys", "girls"]
    : ["boys"];
  switch (context.role) {
    case "admin":
    case "muhtamim":
      return { open: true, cards: allDashboardCards, branches };
    case "academic-admin":
      return { open: true, cards: academicCards, branches };
    case "finance-lead":
      return { open: true, cards: financeCards, branches };
    default:
      return { open: false, cards: [], branches: [] };
  }
}

// ---------- Active students ----------

export type Enrollment = {
  studentId: string;
  branch: BranchId;
  session: string;
  status: "active" | "left" | "graduated";
  residential: boolean;
};

export type StudentSummary = {
  total: number;
  boys: number;
  girls: number;
  residential: number;
  dayScholar: number;
};

export function activeStudentSummary(
  enrollments: Enrollment[],
  scope: DashboardScope,
): StudentSummary {
  const active = enrollments.filter((e) => e.status === "active" && inScope(scope, e));
  const residential = active.filter((e) => e.residential).length;
  return {
    total: active.length,
    boys: active.filter((e) => e.branch === "boys").length,
    girls: active.filter((e) => e.branch === "girls").length,
    residential,
    dayScholar: active.length - residential,
  };
}

// ---------- Today's attendance ----------

export type AttendanceMark = "present" | "late" | "absent" | "leave";

export type AttendanceRegister = {
  id: string;
  label: string;
  branch: BranchId;
  teacher: string;
  /** Every enrolled student; a missing entry is Unmarked — never Absent. */
  studentIds: string[];
  marks: Record<string, AttendanceMark>;
  submitted: boolean;
};

export type AttendanceSummary = Record<AttendanceMark | "unmarked", number> & {
  total: number;
  /** Registers not submitted after the morning cutoff. */
  pendingRegisters: { id: string; label: string; teacher: string; unmarked: number }[];
};

export function attendanceSummary(
  registers: AttendanceRegister[],
  scope: DashboardScope,
  nowMinutes: number,
  cutoffMinutes: number,
): AttendanceSummary {
  const summary: AttendanceSummary = {
    present: 0,
    late: 0,
    absent: 0,
    leave: 0,
    unmarked: 0,
    total: 0,
    pendingRegisters: [],
  };
  for (const register of registers.filter((r) => inScope(scope, r))) {
    let unmarked = 0;
    for (const id of register.studentIds) {
      const mark = register.marks[id];
      if (mark) summary[mark] += 1;
      else unmarked += 1;
    }
    summary.unmarked += unmarked;
    summary.total += register.studentIds.length;
    if (!register.submitted && nowMinutes > cutoffMinutes) {
      summary.pendingRegisters.push({
        id: register.id,
        label: register.label,
        teacher: register.teacher,
        unmarked,
      });
    }
  }
  return summary;
}

// ---------- Today's collection ----------

export type CollectionKind = "fee" | "fund-allocation" | "donation";

export type MoneyEntry = {
  id: string;
  kind: CollectionKind;
  type: "receipt" | "refund";
  status: "posted" | "draft" | "void";
  date: string;
  branch: BranchId;
  amountPaisa: Paisa;
};

export type CollectionSummary = Record<CollectionKind, Paisa> & { netPaisa: Paisa };

/** Posted receipts minus posted refunds for the day, kept apart by kind. */
export function collectionSummary(
  entries: MoneyEntry[],
  scope: DashboardScope,
  today: string,
): CollectionSummary {
  const summary: CollectionSummary = { fee: 0, "fund-allocation": 0, donation: 0, netPaisa: 0 };
  for (const entry of entries) {
    assertPaisa(entry.amountPaisa);
    if (entry.status !== "posted" || entry.date !== today || !inScope(scope, entry)) continue;
    const signed = entry.type === "refund" ? -entry.amountPaisa : entry.amountPaisa;
    summary[entry.kind] += signed;
    summary.netPaisa += signed;
  }
  return summary;
}

// ---------- Dues with ageing ----------

export type DashboardInvoice = {
  id: string;
  studentId: string;
  studentName: string;
  branch: BranchId;
  session: string;
  dueDate: string;
  netPaisa: Paisa;
  paidPaisa: Paisa;
};

export type AgeingBucket = "0-30" | "31-60" | "60+";

export type DuesSummary = {
  totalPaisa: Paisa;
  buckets: Record<AgeingBucket, Paisa>;
  rows: {
    id: string;
    studentName: string;
    outstandingPaisa: Paisa;
    daysOverdue: number;
    bucket: AgeingBucket;
  }[];
};

export function ageingBucket(daysOverdue: number): AgeingBucket {
  if (daysOverdue <= 30) return "0-30";
  if (daysOverdue <= 60) return "31-60";
  return "60+";
}

/** Only invoices past their due date with an unpaid net balance count as dues. */
export function duesWithAgeing(
  invoices: DashboardInvoice[],
  scope: DashboardScope,
  today: string,
): DuesSummary {
  const summary: DuesSummary = {
    totalPaisa: 0,
    buckets: { "0-30": 0, "31-60": 0, "60+": 0 },
    rows: [],
  };
  for (const invoice of invoices) {
    assertPaisa(invoice.netPaisa);
    assertPaisa(invoice.paidPaisa);
    if (!inScope(scope, invoice)) continue;
    const outstanding = Math.max(0, invoice.netPaisa - invoice.paidPaisa);
    const daysOverdue = daysBetween(invoice.dueDate, today);
    if (outstanding === 0 || daysOverdue <= 0) continue;
    const bucket = ageingBucket(daysOverdue);
    summary.totalPaisa += outstanding;
    summary.buckets[bucket] += outstanding;
    summary.rows.push({
      id: invoice.id,
      studentName: invoice.studentName,
      outstandingPaisa: outstanding,
      daysOverdue,
      bucket,
    });
  }
  summary.rows.sort((a, b) => b.daysOverdue - a.daysOverdue);
  return summary;
}

// ---------- Fund balances ----------

export type DashboardFund = Fund & { name: string; allocatedThisMonthPaisa: Paisa };

export type FundRow = {
  id: string;
  name: string;
  availablePaisa: Paisa;
  pledgedPaisa: Paisa;
  allocatedThisMonthPaisa: Paisa;
};

/** Available balance excludes unpaid pledges (shown apart, never counted). */
export function fundBalances(funds: DashboardFund[]): {
  rows: FundRow[];
  totalAvailablePaisa: Paisa;
} {
  const rows = funds.map((fund) => {
    assertPaisa(fund.allocatedThisMonthPaisa);
    return {
      id: fund.id,
      name: fund.name,
      availablePaisa: availableFundBalance(fund),
      pledgedPaisa: fund.unpaidPledgesPaisa,
      allocatedThisMonthPaisa: fund.allocatedThisMonthPaisa,
    };
  });
  return { rows, totalAvailablePaisa: rows.reduce((sum, row) => sum + row.availablePaisa, 0) };
}

// ---------- Hifz progress ----------

export type HifzStudent = {
  studentId: string;
  name: string;
  halaqa: string;
  branch: BranchId;
  /** Approved sabak pages this month vs the halaqa target. */
  approvedPages: number;
  targetPages: number;
};

export type HifzSummary = {
  approvedPages: number;
  targetPages: number;
  percent: number;
  behind: { studentId: string; name: string; halaqa: string; percent: number }[];
};

/** A student is "behind" below 75% of target. */
export const hifzBehindPercent = 75;

const percentOf = (part: number, whole: number) =>
  whole <= 0 ? 0 : Math.min(100, Math.round((part / whole) * 100));

export function hifzProgress(students: HifzStudent[], scope: DashboardScope): HifzSummary {
  const scoped = students.filter((s) => inScope(scope, s));
  const approvedPages = scoped.reduce((sum, s) => sum + s.approvedPages, 0);
  const targetPages = scoped.reduce((sum, s) => sum + s.targetPages, 0);
  const behind = scoped
    .map((s) => ({
      studentId: s.studentId,
      name: s.name,
      halaqa: s.halaqa,
      percent: percentOf(s.approvedPages, s.targetPages),
    }))
    .filter((s) => s.percent < hifzBehindPercent)
    .sort((a, b) => a.percent - b.percent);
  return { approvedPages, targetPages, percent: percentOf(approvedPages, targetPages), behind };
}

// ---------- Homework status ----------

export type HomeworkLine = {
  id: string;
  classLabel: string;
  branch: BranchId;
  dueDate: string;
  assigned: number;
  /** Submitted online or checked offline (paper copy). */
  submitted: number;
  checked: number;
};

export type HomeworkStatus = {
  assigned: number;
  submitted: number;
  checked: number;
  overdue: { id: string; classLabel: string; missing: number; daysLate: number }[];
};

/** Overdue = due date passed and not everyone has submitted. */
export function homeworkStatus(
  lines: HomeworkLine[],
  scope: DashboardScope,
  today: string,
): HomeworkStatus {
  const status: HomeworkStatus = { assigned: 0, submitted: 0, checked: 0, overdue: [] };
  for (const line of lines.filter((l) => inScope(scope, l))) {
    if (line.checked > line.submitted || line.submitted > line.assigned)
      throw new RangeError("checked ≤ submitted ≤ assigned");
    status.assigned += line.assigned;
    status.submitted += line.submitted;
    status.checked += line.checked;
    const daysLate = daysBetween(line.dueDate, today);
    if (daysLate > 0 && line.submitted < line.assigned) {
      status.overdue.push({
        id: line.id,
        classLabel: line.classLabel,
        missing: line.assigned - line.submitted,
        daysLate,
      });
    }
  }
  status.overdue.sort((a, b) => b.daysLate - a.daysLate);
  return status;
}

// ---------- Approvals waiting ----------

export type ApprovalKind =
  | "admission"
  | "concession"
  | "sponsorship"
  | "refund"
  | "expense"
  | "leave"
  | "result"
  | "question-paper";

export type PendingApproval = {
  id: string;
  kind: ApprovalKind;
  title: string;
  branch: BranchId;
  createdAt: string;
  creatorId: string;
  amountPaisa?: Paisa;
  exception?: boolean;
};

export type Priority = "high" | "normal";
export type ApprovalRow = PendingApproval & {
  ageDays: number;
  priority: Priority;
  ownRequest: boolean;
};

/** Same limit as one-click approval elsewhere (৳২,০০০). */
export const approvalHighPriorityPaisa = 2_000_00;

export function approvalPriority(item: PendingApproval, ageDays: number): Priority {
  if (item.exception) return "high";
  if ((item.amountPaisa ?? 0) > approvalHighPriorityPaisa) return "high";
  if (ageDays >= 3) return "high";
  return "normal";
}

/** High priority first, then oldest first. The viewer's own requests are flagged (they cannot approve them). */
export function approvalQueue(
  items: PendingApproval[],
  scope: DashboardScope,
  today: string,
  viewerId?: string,
): ApprovalRow[] {
  return items
    .filter((item) => inScope(scope, item))
    .map((item) => {
      if (item.amountPaisa !== undefined) assertPaisa(item.amountPaisa);
      const ageDays = Math.max(0, daysBetween(item.createdAt, today));
      return {
        ...item,
        ageDays,
        priority: approvalPriority(item, ageDays),
        ownRequest: viewerId !== undefined && item.creatorId === viewerId,
      };
    })
    .sort((a, b) =>
      a.priority === b.priority ? b.ageDays - a.ageDays : a.priority === "high" ? -1 : 1,
    );
}

// ---------- Upcoming events ----------

export type DashboardEvent = {
  id: string;
  kind: "exam" | "notice" | "event" | "holiday" | "routine-conflict";
  title: string;
  date: string;
  branch: BranchId | "all";
};

export function upcomingEvents(
  events: DashboardEvent[],
  scope: DashboardScope,
  today: string,
  windowDays = 14,
): (DashboardEvent & { inDays: number })[] {
  return events
    .filter((e) => scope.branch === "all" || e.branch === "all" || e.branch === scope.branch)
    .map((e) => ({ ...e, inDays: daysBetween(today, e.date) }))
    .filter((e) => e.inDays >= 0 && e.inDays <= windowDays)
    .sort((a, b) => a.inDays - b.inDays);
}
