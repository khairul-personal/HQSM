import { describe, expect, it } from "vitest";
import {
  allocateOldestFirst,
  bengaliAmountInWords,
  calculateInvoiceBalance,
  calculateSponsorship,
  submitPayment,
  type PaymentLedger,
} from "./finance-domain";

const taka = (value: number) => value * 100;

describe("invoice money calculations", () => {
  it("calculates waiver and partial payment using integer paisa", () => {
    expect(
      calculateInvoiceBalance({
        chargePaisa: taka(1_000),
        waiverPaisa: taka(100),
        paymentPaisa: taka(600),
      }),
    ).toEqual({
      netInvoicePaisa: taka(900),
      netPaymentPaisa: taka(600),
      duePaisa: taka(300),
    });
  });

  it("applies a credit note and matching refund to a fully paid invoice", () => {
    expect(
      calculateInvoiceBalance({
        chargePaisa: taka(900),
        creditNotePaisa: taka(200),
        paymentPaisa: taka(900),
        refundPaisa: taka(200),
      }),
    ).toEqual({
      netInvoicePaisa: taka(700),
      netPaymentPaisa: taka(700),
      duePaisa: 0,
    });
  });

  it("excludes a reversed payment from valid payments", () => {
    expect(
      calculateInvoiceBalance({
        chargePaisa: taka(900),
        paymentPaisa: taka(900),
        reversedPaymentPaisa: taka(200),
      }),
    ).toEqual({
      netInvoicePaisa: taka(900),
      netPaymentPaisa: taka(700),
      duePaisa: taka(200),
    });
  });

  it("allocates a 75% Zakat sponsorship and leaves no due after guardian payment", () => {
    const sponsorship = calculateSponsorship(taka(1_200), 7_500);
    expect(sponsorship).toEqual({
      fundAllocationPaisa: taka(900),
      guardianPaymentPaisa: taka(300),
    });
    expect(
      calculateInvoiceBalance({
        chargePaisa: taka(1_200),
        fundAllocationPaisa: sponsorship.fundAllocationPaisa,
        paymentPaisa: sponsorship.guardianPaymentPaisa,
      }).duePaisa,
    ).toBe(0);
  });
});

describe("payment posting", () => {
  it("allocates oldest first and keeps overpayment as credit for the same student", () => {
    const result = allocateOldestFirst("STU-1", taka(1_100), [
      { id: "INV-3", studentId: "STU-1", duePaisa: taka(300), dueDate: "2026-03-01" },
      { id: "INV-1", studentId: "STU-1", duePaisa: taka(200), dueDate: "2026-01-01" },
      { id: "INV-2", studentId: "STU-1", duePaisa: taka(400), dueDate: "2026-02-01" },
    ]);

    expect(result.allocations).toEqual([
      { invoiceId: "INV-1", amountPaisa: taka(200) },
      { invoiceId: "INV-2", amountPaisa: taka(400) },
      { invoiceId: "INV-3", amountPaisa: taka(300) },
    ]);
    expect(result.advanceCredit).toEqual({
      studentId: "STU-1",
      amountPaisa: taka(200),
    });
  });

  it("rejects allocating one student's payment to another student's invoice", () => {
    expect(() =>
      allocateOldestFirst("STU-1", taka(100), [
        { id: "INV-2", studentId: "STU-2", duePaisa: taka(100), dueDate: "2026-01-01" },
      ]),
    ).toThrow("belongs to another student");
  });

  it("creates exactly one payment and one receipt for duplicate submits", () => {
    const emptyLedger: PaymentLedger = { payments: [], receipts: [] };
    const request = {
      idempotencyKey: "checkout-42",
      studentId: "STU-1",
      amountPaisa: taka(600),
    };
    const first = submitPayment(emptyLedger, request);
    const duplicate = submitPayment(first.ledger, request);

    expect(duplicate.ledger.payments).toHaveLength(1);
    expect(duplicate.ledger.receipts).toHaveLength(1);
    expect(duplicate.payment.id).toBe(first.payment.id);
    expect(duplicate.receipt.id).toBe(first.receipt.id);
  });
});

describe("Bengali amount in words", () => {
  it.each([
    [21, "একুশ টাকা মাত্র"],
    [39, "উনচল্লিশ টাকা মাত্র"],
    [99, "নিরানব্বই টাকা মাত্র"],
    [1_500, "এক হাজার পাঁচশত টাকা মাত্র"],
    [125_750, "এক লক্ষ পঁচিশ হাজার সাতশত পঞ্চাশ টাকা মাত্র"],
    [10_000_000, "এক কোটি টাকা মাত্র"],
  ])("writes %i taka", (amount, expected) => {
    const result = bengaliAmountInWords(taka(amount));
    expect(result).toBe(expected);
    expect(result.endsWith("টাকা মাত্র")).toBe(true);
  });
});
