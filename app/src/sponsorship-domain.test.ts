import { describe, expect, it } from "vitest";
import {
  availableFundBalance,
  canBulkApprove,
  checkAllocation,
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
