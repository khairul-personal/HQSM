import type { PrototypeRole } from "./student-permissions";

export type Fund = {
  id: string;
  balancePaisa: number;
  unpaidPledgesPaisa: number;
  eligibleFeeHeads: string[];
};

export type Sponsorship = {
  id: string;
  endDate: string;
  status: "active" | "suspended";
};

export type AllocationRequest = {
  id: string;
  creatorId: string;
  studentId: string;
  invoiceId: string;
  feeHead: string;
  amountPaisa: number;
  fund: Fund;
  sponsorship: Sponsorship;
};

export type AllocationCheck =
  | { ok: true; balanceAfterPaisa: number; exception: boolean }
  | {
      ok: false;
      code: "expired" | "ineligible" | "insufficient" | "self-approval" | "exception-reason";
      message: string;
    };

export function createAllocation(
  request: AllocationRequest,
  today: string,
): AllocationRequest | null {
  if (request.sponsorship.status !== "active" || request.sponsorship.endDate < today) {
    return null;
  }
  return request;
}

const assertMoney = (value: number) => {
  if (!Number.isSafeInteger(value) || value < 0)
    throw new RangeError("amount must be non-negative integer paisa");
};

export function availableFundBalance(fund: Fund): number {
  assertMoney(fund.balancePaisa);
  assertMoney(fund.unpaidPledgesPaisa);
  return fund.balancePaisa;
}

export function checkAllocation(
  request: AllocationRequest,
  options: {
    actorId: string;
    actorRole: PrototypeRole;
    today: string;
    exceptionReason?: string;
  },
): AllocationCheck {
  assertMoney(request.amountPaisa);
  const balance = availableFundBalance(request.fund);
  if (request.sponsorship.status !== "active" || request.sponsorship.endDate < options.today) {
    return {
      ok: false,
      code: "expired",
      message: "মেয়াদোত্তীর্ণ sponsorship থেকে allocation তৈরি হবে না",
    };
  }
  if (request.creatorId === options.actorId) {
    return { ok: false, code: "self-approval", message: "নিজের তৈরি অনুরোধ নিজে অনুমোদন করা যাবে না" };
  }
  const eligible = request.fund.eligibleFeeHeads.includes(request.feeHead);
  if (!eligible) {
    if (options.actorRole !== "muhtamim") {
      return { ok: false, code: "ineligible", message: "এই fee head ফান্ডটির অনুমোদিত ব্যবহারের বাইরে" };
    }
    if (!options.exceptionReason?.trim()) {
      return { ok: false, code: "exception-reason", message: "ব্যতিক্রম অনুমোদনে কারণ আবশ্যক" };
    }
  }
  if (request.amountPaisa > balance) {
    return { ok: false, code: "insufficient", message: "অপর্যাপ্ত ফান্ড" };
  }
  return {
    ok: true,
    balanceAfterPaisa: balance - request.amountPaisa,
    exception: !eligible,
  };
}

export type AllocationJournal = {
  id: string;
  allocationId: string;
  effects: {
    fundPaisa: number;
    studentReceivablePaisa: number;
  };
  entries: [
    { account: "sponsorship expense"; debitPaisa: number; creditPaisa: 0 },
    { account: "fund"; debitPaisa: 0; creditPaisa: number },
  ];
};

/** One-click / bulk approval is only for amounts up to this (৳২,০০০). */
export const oneClickLimitPaisa = 2_000_00;

export type ApprovalRisk = { level: "low" | "high"; reasons: string[] };

/**
 * Low risk = can be approved in one click (and in bulk).
 * High risk = needs a written review note: big amount, an eligible-use exception,
 * or the fund dropping below 10% of its current balance.
 */
export function approvalRisk(request: AllocationRequest): ApprovalRisk {
  assertMoney(request.amountPaisa);
  const reasons: string[] = [];
  if (!request.fund.eligibleFeeHeads.includes(request.feeHead)) {
    reasons.push("ফান্ডের অনুমোদিত ব্যবহারের বাইরে");
  }
  if (request.amountPaisa > oneClickLimitPaisa) {
    reasons.push("৳২,০০০-এর বেশি");
  }
  const balance = availableFundBalance(request.fund);
  if (request.amountPaisa <= balance && (balance - request.amountPaisa) * 10 < balance) {
    reasons.push("ফান্ডে ১০%-এর কম বাকি থাকবে");
  }
  return { level: reasons.length ? "high" : "low", reasons };
}

export type ApprovalCheck =
  | AllocationCheck
  | { ok: false; code: "review-required"; message: string; reasons: string[] };

/** Full approval gate: every hard rule, plus a review note for high-risk items. */
export function checkApproval(
  request: AllocationRequest,
  options: {
    actorId: string;
    actorRole: PrototypeRole;
    today: string;
    exceptionReason?: string;
    reviewNote?: string;
  },
): ApprovalCheck {
  const check = checkAllocation(request, options);
  if (!check.ok) return check;
  const risk = approvalRisk(request);
  const note = (options.reviewNote ?? options.exceptionReason ?? "").trim();
  if (risk.level === "high" && !note) {
    return {
      ok: false,
      code: "review-required",
      message: "বেশি ঝুঁকির অনুরোধ — যাচাই নোট লিখে অনুমোদন করুন",
      reasons: risk.reasons,
    };
  }
  return check;
}

export function postAllocation(
  request: AllocationRequest,
  options: {
    actorId: string;
    actorRole: PrototypeRole;
    today: string;
    exceptionReason?: string;
    reviewNote?: string;
  },
): { journal: AllocationJournal; balanceAfterPaisa: number; exception: boolean } {
  const check = checkApproval(request, options);
  if (!check.ok) throw new Error(check.message);
  const amount = request.amountPaisa;
  return {
    balanceAfterPaisa: check.balanceAfterPaisa,
    exception: check.exception,
    journal: {
      id: `JRN-${request.id}`,
      allocationId: request.id,
      effects: { fundPaisa: -amount, studentReceivablePaisa: -amount },
      entries: [
        { account: "sponsorship expense", debitPaisa: amount, creditPaisa: 0 },
        { account: "fund", debitPaisa: 0, creditPaisa: amount },
      ],
    },
  };
}

export function canBulkApprove(
  requests: AllocationRequest[],
  options: { actorId: string; actorRole: PrototypeRole; today: string },
): boolean {
  return (
    requests.length > 0 &&
    requests.every(
      (request) => checkAllocation(request, options).ok && approvalRisk(request).level === "low",
    )
  );
}
