import { describe, expect, it } from "vitest";
import {
  availableFundBalance,
  canBulkApprove,
  approvalRisk,
  checkAllocation,
  checkApproval,
  createAllocation,
  postAllocation,
  type AllocationRequest,
} from "./sponsorship-domain";

const taka = (value: number) => value * 100;
const base: AllocationRequest = {
  id: "ALC-1",
  creatorId: "EMP-9",
  studentId: "STU-1",
  invoiceId: "INV-1",
  feeHead: "টিউশন",
  amountPaisa: taka(900),
  fund: {
    id: "zakat",
    balancePaisa: taka(1_000),
    unpaidPledgesPaisa: taka(5_000),
    eligibleFeeHeads: ["টিউশন", "খাবার"],
  },
  sponsorship: { id: "SP-1", endDate: "2026-12-31", status: "active" },
};
const finance = { actorId: "EMP-2", actorRole: "finance-lead" as const, today: "2026-06-01" };

describe("fund allocation rules", () => {
  it("blocks a fee head outside the fund rule", () => {
    const result = checkAllocation({ ...base, feeHead: "নির্মাণ" }, finance);
    expect(result).toMatchObject({ ok: false, code: "ineligible" });
  });

  it("allows only মুহতামিম to approve an exception with a required reason", () => {
    const request = { ...base, feeHead: "চিকিৎসা" };
    expect(checkAllocation(request, finance)).toMatchObject({ ok: false, code: "ineligible" });
    expect(checkAllocation(request, { ...finance, actorRole: "muhtamim" })).toMatchObject({
      ok: false,
      code: "exception-reason",
    });
    expect(
      postAllocation(request, {
        ...finance,
        actorRole: "muhtamim",
        exceptionReason: "জরুরি চিকিৎসা সহায়তা",
      }).exception,
    ).toBe(true);
  });

  it("keeps a ৳900 request pending when Zakat has ৳500 and never goes negative", () => {
    const request = { ...base, fund: { ...base.fund, balancePaisa: taka(500) } };
    expect(checkAllocation(request, finance)).toMatchObject({ ok: false, code: "insufficient" });
    expect(() => postAllocation(request, finance)).toThrow("অপর্যাপ্ত ফান্ড");
    expect(request.fund.id).toBe("zakat");
    expect(request.fund.balancePaisa).toBe(taka(500));
  });

  it("prevents a creator from approving their own request", () => {
    expect(checkAllocation(base, { ...finance, actorId: base.creatorId })).toMatchObject({
      ok: false,
      code: "self-approval",
    });
  });

  it("creates no allocation from expired or suspended sponsorships", () => {
    const expired = {
      ...base,
      sponsorship: { ...base.sponsorship, endDate: "2026-05-31" },
    };
    const suspended = {
      ...base,
      sponsorship: { ...base.sponsorship, status: "suspended" as const },
    };
    expect(createAllocation(expired, finance.today)).toBeNull();
    expect(createAllocation(suspended, finance.today)).toBeNull();
    expect(checkAllocation(expired, finance)).toMatchObject({ ok: false, code: "expired" });
    expect(checkAllocation(suspended, finance)).toMatchObject({ ok: false, code: "expired" });
  });

  it("bulk approves only when every item passes every check", () => {
    expect(canBulkApprove([base, { ...base, id: "ALC-2" }], finance)).toBe(true);
    expect(canBulkApprove([base, { ...base, id: "ALC-2", feeHead: "নির্মাণ" }], finance)).toBe(false);
  });

  it("does not increase available balance with an unpaid pledge", () => {
    expect(availableFundBalance(base.fund)).toBe(taka(1_000));
  });

  it("posts the PRD 75% of ৳1,200 example as ৳900", () => {
    expect(postAllocation(base, finance).journal.effects).toEqual({
      fundPaisa: -taka(900),
      studentReceivablePaisa: -taka(900),
    });
  });

  it("creates exactly one balanced journal for every posted allocation", () => {
    const { journal } = postAllocation(base, finance);
    const debit = journal.entries.reduce((sum, line) => sum + line.debitPaisa, 0);
    const credit = journal.entries.reduce((sum, line) => sum + line.creditPaisa, 0);
    expect(journal.allocationId).toBe(base.id);
    expect(debit).toBe(credit);
  });
});

describe("approval risk", () => {
  const roomy = { ...base.fund, balancePaisa: taka(50_000) };

  it("lets a small, eligible request be approved in one click", () => {
    const request = { ...base, fund: roomy };
    expect(approvalRisk(request).level).toBe("low");
    expect(checkApproval(request, finance).ok).toBe(true);
  });

  it("needs a review note above ৳2,000 and blocks one-click approval", () => {
    const request = { ...base, amountPaisa: taka(2_400), fund: roomy };
    const result = checkApproval(request, finance);
    expect(result).toMatchObject({ ok: false, code: "review-required" });
    expect(checkApproval(request, { ...finance, reviewNote: "রসিদ ও আবেদন যাচাই করা হয়েছে" }).ok).toBe(
      true,
    );
  });

  it("treats a request that leaves the fund below 10% as high risk", () => {
    const request = { ...base, amountPaisa: taka(950) };
    expect(approvalRisk(request).reasons).toContain("ফান্ডে ১০%-এর কম বাকি থাকবে");
  });

  it("never bulk-approves a high-risk item, even when every hard check passes", () => {
    const small = { ...base, fund: roomy };
    const big = { ...base, id: "ALC-2", amountPaisa: taka(2_400), fund: roomy };
    expect(checkAllocation(big, finance).ok).toBe(true);
    expect(canBulkApprove([small], finance)).toBe(true);
    expect(canBulkApprove([small, big], finance)).toBe(false);
  });

  it("refuses to post a high-risk allocation without a note", () => {
    const big = { ...base, amountPaisa: taka(2_400), fund: roomy };
    expect(() => postAllocation(big, finance)).toThrow();
  });

  it("still blocks self-approval even with a review note", () => {
    const own = { ...base, amountPaisa: taka(2_400), fund: roomy, creatorId: "EMP-2" };
    expect(checkApproval(own, { ...finance, reviewNote: "ঠিক আছে" })).toMatchObject({
      ok: false,
      code: "self-approval",
    });
  });
});
