import { describe, expect, it } from "vitest";
import {
  approvalQueue,
  attendanceSummary,
  collectionCash,
  collectionSummary,
  homeworkStatus,
  registerCoverage,
  resolveDashboardPermission,
  resolveScopeBranches,
  todayTasks,
  type DashboardScope,
  type MoneyEntry,
} from "./dashboard-domain";
import {
  attendanceCutoffMinutes,
  demoNowMinutes,
  demoToday,
  homeworkLines,
  moneyEntries,
  pendingApprovals,
  registers,
} from "./dashboard-data";
import {
  homeSectionForRole,
  prototypeRoles,
  resolveBottomNavigation,
  resolveNavigation,
  type PrototypeRole,
} from "./student-permissions";

const all: DashboardScope = { branch: "all", session: "2026" };
const boys: DashboardScope = { branch: "boys", session: "2026" };

describe("collection as cash", () => {
  it("counts fee and donation as cash and keeps fund allocation apart", () => {
    const cash = collectionCash(moneyEntries, all, demoToday);
    expect(cash.feeReceiptsPaisa).toBe(6_970_000);
    expect(cash.feeRefundsPaisa).toBe(150_000);
    expect(cash.feeNetPaisa).toBe(6_820_000);
    expect(cash.donationPaisa).toBe(2_500_000);
    expect(cash.cashPaisa).toBe(cash.feeNetPaisa + cash.donationPaisa);
    expect(cash.fundAllocationPaisa).toBe(1_800_000);
    expect([cash.receiptCount, cash.refundCount]).toEqual([3, 1]);
  });

  it("reconciles with the per-kind summary: cash + fund allocation = old net", () => {
    for (const scope of [all, boys]) {
      const cash = collectionCash(moneyEntries, scope, demoToday);
      const summary = collectionSummary(moneyEntries, scope, demoToday);
      expect(cash.cashPaisa + cash.fundAllocationPaisa).toBe(summary.netPaisa);
      expect(cash.feeNetPaisa).toBe(summary.fee);
    }
  });

  it("ignores drafts, voids and other days; zero entries give real zeros", () => {
    const entries: MoneyEntry[] = [
      {
        id: "1",
        kind: "fee",
        type: "receipt",
        status: "draft",
        date: demoToday,
        branch: "boys",
        amountPaisa: 500,
      },
      {
        id: "2",
        kind: "fee",
        type: "receipt",
        status: "void",
        date: demoToday,
        branch: "boys",
        amountPaisa: 500,
      },
      {
        id: "3",
        kind: "fee",
        type: "receipt",
        status: "posted",
        date: "2026-11-07",
        branch: "boys",
        amountPaisa: 500,
      },
    ];
    expect(collectionCash(entries, all, demoToday).cashPaisa).toBe(0);
    expect(collectionCash([], all, demoToday).receiptCount).toBe(0);
  });
});

describe("register coverage", () => {
  it("gives the denominator for the attendance card in scope", () => {
    expect(registerCoverage(registers, all)).toEqual({ registers: 5, submitted: 3 });
    expect(registerCoverage(registers, boys)).toEqual({ registers: 3, submitted: 2 });
  });
});

describe("today's work queue", () => {
  const attendance = attendanceSummary(registers, all, demoNowMinutes, attendanceCutoffMinutes);
  const approvals = approvalQueue(pendingApprovals, all, demoToday, "EC-001");
  const homework = homeworkStatus(homeworkLines, all, demoToday);
  const tasks = todayTasks({
    pendingRegisters: attendance.pendingRegisters,
    approvals,
    homeworkOverdue: homework.overdue,
  });

  it("holds every pending register, approval and overdue homework exactly once", () => {
    expect(tasks).toHaveLength(
      attendance.pendingRegisters.length + approvals.length + homework.overdue.length,
    );
    expect(new Set(tasks.map((t) => t.id)).size).toBe(tasks.length);
  });

  it("puts high priority first and registers past the cutoff at the very top", () => {
    const firstNormal = tasks.findIndex((t) => t.priority === "normal");
    expect(tasks.slice(firstNormal).every((t) => t.priority === "normal")).toBe(true);
    expect(tasks[0].type).toBe("register");
    expect(tasks.filter((t) => t.type === "register").every((t) => t.priority === "high")).toBe(
      true,
    );
  });

  it("keeps the approval queue order and the own-request flag", () => {
    const fromTasks = tasks.flatMap((t) =>
      t.type === "approval" && t.priority === "high" ? [t.approval.id] : [],
    );
    expect(fromTasks).toEqual(approvals.filter((a) => a.priority === "high").map((a) => a.id));
    expect(tasks.some((t) => t.type === "approval" && t.approval.ownRequest)).toBe(true);
  });

  it("is empty when nothing is pending (zero is a real value)", () => {
    expect(todayTasks({})).toEqual([]);
  });
});

describe("shell navigation", () => {
  const nav = (role: PrototypeRole) => resolveNavigation(prototypeRoles[role].context);

  it("follows the PRD role table: no money menus for Academic Admin, no academics for cashier", () => {
    expect(nav("academic-admin")).not.toContain("fees");
    expect(nav("academic-admin")).not.toContain("sponsorships");
    expect(nav("cashier")).toEqual(["students", "fees"]);
    expect(nav("hr-officer")).toEqual(["staff"]);
    expect(nav("exam-controller")).not.toContain("attendance");
  });

  it("only shows the dashboard to roles that may open it", () => {
    for (const role of Object.keys(prototypeRoles) as PrototypeRole[]) {
      const open = resolveDashboardPermission(prototypeRoles[role].context).open;
      expect(nav(role).includes("dashboard")).toBe(open);
    }
  });

  it("always contains the role's landing page (staff roles)", () => {
    for (const role of Object.keys(prototypeRoles) as PrototypeRole[]) {
      if (role === "guardian") continue;
      expect(nav(role)).toContain(homeSectionForRole(role));
    }
  });

  it("offers at most four bottom destinations and hides the girls' branch without access", () => {
    expect(resolveBottomNavigation(prototypeRoles.admin.context)).toHaveLength(4);
    expect(resolveScopeBranches(prototypeRoles["male-staff"].context)).toEqual(["boys"]);
    expect(resolveScopeBranches(prototypeRoles.muhtamim.context)).toContain("girls");
  });
});
