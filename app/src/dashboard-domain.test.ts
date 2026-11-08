import { describe, expect, it } from "vitest";
import {
  activeStudentSummary,
  ageingBucket,
  approvalQueue,
  attendanceSummary,
  collectionSummary,
  duesWithAgeing,
  fundBalances,
  hifzProgress,
  homeworkStatus,
  resolveDashboardPermission,
  upcomingEvents,
  type DashboardScope,
} from "./dashboard-domain";
import { homeSectionForRole, prototypeRoles } from "./student-permissions";

const all: DashboardScope = { branch: "all", session: "2026" };
const girls: DashboardScope = { branch: "girls", session: "2026" };
const today = "2026-11-08";

describe("dashboard permission", () => {
  it("principal and admin see every card; finance never sees hifz; teachers cannot open it", () => {
    expect(resolveDashboardPermission(prototypeRoles.muhtamim.context).cards).toHaveLength(9);
    expect(resolveDashboardPermission(prototypeRoles.admin.context).open).toBe(true);
    const finance = resolveDashboardPermission(prototypeRoles["finance-lead"].context).cards;
    expect(finance).toContain("funds");
    expect(finance).not.toContain("hifz");
    expect(
      resolveDashboardPermission(prototypeRoles["academic-admin"].context).cards,
    ).not.toContain("collection");
    expect(resolveDashboardPermission(prototypeRoles["class-teacher"].context).open).toBe(false);
    expect(resolveDashboardPermission(prototypeRoles.guardian.context).open).toBe(false);
  });

  it("offers the girls' branch filter only with girls'-section access", () => {
    const muhtamim = prototypeRoles.muhtamim.context;
    expect(resolveDashboardPermission(muhtamim).branches).toContain("girls");
    expect(resolveDashboardPermission({ ...muhtamim, girlsSectionAccess: false }).branches).toEqual(
      ["boys"],
    );
  });

  it("principal and admin land on the dashboard after sign-in", () => {
    expect(homeSectionForRole("muhtamim")).toBe("dashboard");
    expect(homeSectionForRole("admin")).toBe("dashboard");
  });
});

describe("active students", () => {
  it("counts only active enrollments in scope, split by branch and residence", () => {
    const summary = activeStudentSummary(
      [
        { studentId: "1", branch: "boys", session: "2026", status: "active", residential: true },
        { studentId: "2", branch: "girls", session: "2026", status: "active", residential: false },
        { studentId: "3", branch: "girls", session: "2026", status: "left", residential: true },
        { studentId: "4", branch: "boys", session: "2025", status: "active", residential: true },
      ],
      all,
    );
    expect(summary).toEqual({ total: 2, boys: 1, girls: 1, residential: 1, dayScholar: 1 });
  });
});

describe("attendance", () => {
  const register = {
    id: "R1",
    label: "হিফজ ক",
    branch: "boys" as const,
    teacher: "উস্তাদ সালমান",
    studentIds: ["a", "b", "c", "d"],
    marks: { a: "present" as const, b: "late" as const },
    submitted: false,
  };

  it("keeps unmarked apart from absent", () => {
    const summary = attendanceSummary([register], all, 8 * 60, 9 * 60);
    expect(summary.absent).toBe(0);
    expect(summary.unmarked).toBe(2);
    expect(summary.pendingRegisters).toHaveLength(0);
  });

  it("lists unsubmitted registers only after the cutoff", () => {
    const summary = attendanceSummary([register], all, 9 * 60 + 15, 9 * 60);
    expect(summary.pendingRegisters).toEqual([
      { id: "R1", label: "হিফজ ক", teacher: "উস্তাদ সালমান", unmarked: 2 },
    ]);
    expect(attendanceSummary([register], girls, 10 * 60, 9 * 60).total).toBe(0);
  });
});

describe("collection", () => {
  it("is posted receipts minus posted refunds, by kind, in paisa", () => {
    const base = { status: "posted" as const, date: today, branch: "boys" as const };
    const summary = collectionSummary(
      [
        { ...base, id: "1", kind: "fee", type: "receipt", amountPaisa: 150_000 },
        { ...base, id: "2", kind: "fee", type: "refund", amountPaisa: 20_000 },
        { ...base, id: "3", kind: "donation", type: "receipt", amountPaisa: 500_000 },
        { ...base, id: "4", kind: "fee", type: "receipt", amountPaisa: 99_999, status: "draft" },
        { ...base, id: "5", kind: "fee", type: "receipt", amountPaisa: 77_700, date: "2026-11-07" },
      ],
      all,
      today,
    );
    expect(summary).toEqual({
      fee: 130_000,
      "fund-allocation": 0,
      donation: 500_000,
      netPaisa: 630_000,
    });
  });

  it("rejects non-integer money", () => {
    expect(() =>
      collectionSummary(
        [
          {
            id: "x",
            kind: "fee",
            type: "receipt",
            status: "posted",
            date: today,
            branch: "boys",
            amountPaisa: 10.5,
          },
        ],
        all,
        today,
      ),
    ).toThrow(RangeError);
  });
});

describe("dues ageing", () => {
  it("buckets 0–30, 31–60, 60+ and ignores not-yet-due or paid invoices", () => {
    expect([ageingBucket(30), ageingBucket(31), ageingBucket(60), ageingBucket(61)]).toEqual([
      "0-30",
      "31-60",
      "31-60",
      "60+",
    ]);
    const inv = {
      studentId: "s",
      studentName: "নাম",
      branch: "boys" as const,
      session: "2026",
      paidPaisa: 0,
    };
    const dues = duesWithAgeing(
      [
        { ...inv, id: "A", dueDate: "2026-10-30", netPaisa: 100_000 },
        { ...inv, id: "B", dueDate: "2026-08-01", netPaisa: 250_000, paidPaisa: 50_000 },
        { ...inv, id: "C", dueDate: "2026-11-20", netPaisa: 300_000 },
        { ...inv, id: "D", dueDate: "2026-09-01", netPaisa: 80_000, paidPaisa: 80_000 },
      ],
      all,
      today,
    );
    expect(dues.totalPaisa).toBe(300_000);
    expect(dues.buckets).toEqual({ "0-30": 100_000, "31-60": 0, "60+": 200_000 });
    expect(dues.rows.map((r) => r.id)).toEqual(["B", "A"]);
  });
});

describe("fund balances", () => {
  it("never counts unpaid pledges as available", () => {
    const { rows, totalAvailablePaisa } = fundBalances([
      {
        id: "zakat",
        name: "যাকাত",
        balancePaisa: 1_000_000,
        unpaidPledgesPaisa: 500_000,
        eligibleFeeHeads: [],
        allocatedThisMonthPaisa: 0,
      },
      {
        id: "lillah",
        name: "লিল্লাহ",
        balancePaisa: 200_000,
        unpaidPledgesPaisa: 0,
        eligibleFeeHeads: [],
        allocatedThisMonthPaisa: 50_000,
      },
    ]);
    expect(totalAvailablePaisa).toBe(1_200_000);
    expect(rows[0]).toMatchObject({ availablePaisa: 1_000_000, pledgedPaisa: 500_000 });
  });
});

describe("hifz progress", () => {
  it("sums approved pages against target and lists students below 75%", () => {
    const h = { halaqa: "ক", branch: "boys" as const };
    const summary = hifzProgress(
      [
        { ...h, studentId: "1", name: "আবদুল্লাহ", approvedPages: 20, targetPages: 20 },
        { ...h, studentId: "2", name: "হাসান", approvedPages: 10, targetPages: 20 },
        { ...h, studentId: "3", name: "ইউসুফ", approvedPages: 15, targetPages: 20 },
      ],
      all,
    );
    expect(summary.percent).toBe(75);
    expect(summary.behind.map((s) => s.name)).toEqual(["হাসান"]);
  });
});

describe("homework status", () => {
  it("counts assigned / submitted / checked and lists overdue classes", () => {
    const status = homeworkStatus(
      [
        {
          id: "H1",
          classLabel: "৫ম ক",
          branch: "boys",
          dueDate: "2026-11-06",
          assigned: 30,
          submitted: 24,
          checked: 20,
        },
        {
          id: "H2",
          classLabel: "৬ষ্ঠ খ",
          branch: "girls",
          dueDate: "2026-11-10",
          assigned: 25,
          submitted: 5,
          checked: 0,
        },
      ],
      all,
      today,
    );
    expect(status).toMatchObject({ assigned: 55, submitted: 29, checked: 20 });
    expect(status.overdue).toEqual([{ id: "H1", classLabel: "৫ম ক", missing: 6, daysLate: 2 }]);
  });
});

describe("approvals", () => {
  it("puts high priority first, then oldest, and flags the viewer's own requests", () => {
    const a = { branch: "boys" as const, creatorId: "X" };
    const queue = approvalQueue(
      [
        { ...a, id: "1", kind: "leave", title: "ছুটি", createdAt: "2026-11-07" },
        {
          ...a,
          id: "2",
          kind: "refund",
          title: "ফেরত",
          createdAt: "2026-11-08",
          amountPaisa: 500_000,
        },
        {
          ...a,
          id: "3",
          kind: "admission",
          title: "ভর্তি",
          createdAt: "2026-11-01",
          creatorId: "ME",
        },
        {
          ...a,
          id: "4",
          kind: "concession",
          title: "ছাড়",
          createdAt: "2026-11-08",
          exception: true,
        },
      ],
      all,
      today,
      "ME",
    );
    expect(queue.map((q) => q.id)).toEqual(["3", "2", "4", "1"]);
    expect(queue[0]).toMatchObject({ ageDays: 7, priority: "high", ownRequest: true });
    expect(queue[3].priority).toBe("normal");
  });
});

describe("upcoming events", () => {
  it("keeps the next 14 days in date order, including all-branch items", () => {
    const events = upcomingEvents(
      [
        { id: "1", kind: "exam", title: "পরীক্ষা", date: "2026-11-15", branch: "girls" },
        { id: "2", kind: "holiday", title: "ছুটি", date: "2026-11-09", branch: "all" },
        { id: "3", kind: "notice", title: "পুরোনো", date: "2026-11-01", branch: "all" },
        { id: "4", kind: "event", title: "দূরে", date: "2026-12-30", branch: "all" },
        { id: "5", kind: "exam", title: "বালক", date: "2026-11-10", branch: "boys" },
      ],
      girls,
      today,
    );
    expect(events.map((e) => [e.id, e.inDays])).toEqual([
      ["2", 1],
      ["1", 7],
    ]);
  });
});
