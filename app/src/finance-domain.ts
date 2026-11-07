export type Paisa = number;

function assertPaisa(value: Paisa, label: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${label} must be a non-negative integer paisa value`);
  }
}

export type InvoiceBalanceInput = {
  chargePaisa: Paisa;
  waiverPaisa?: Paisa;
  creditNotePaisa?: Paisa;
  paymentPaisa?: Paisa;
  refundPaisa?: Paisa;
  reversedPaymentPaisa?: Paisa;
  fundAllocationPaisa?: Paisa;
};

export type InvoiceBalance = {
  netInvoicePaisa: Paisa;
  netPaymentPaisa: Paisa;
  duePaisa: Paisa;
};

export function calculateInvoiceBalance(input: InvoiceBalanceInput): InvoiceBalance {
  const {
    chargePaisa,
    waiverPaisa = 0,
    creditNotePaisa = 0,
    paymentPaisa = 0,
    refundPaisa = 0,
    reversedPaymentPaisa = 0,
    fundAllocationPaisa = 0,
  } = input;

  Object.entries({
    chargePaisa,
    waiverPaisa,
    creditNotePaisa,
    paymentPaisa,
    refundPaisa,
    reversedPaymentPaisa,
    fundAllocationPaisa,
  }).forEach(([label, value]) => assertPaisa(value, label));

  const netInvoicePaisa = Math.max(0, chargePaisa - waiverPaisa - creditNotePaisa);
  const netPaymentPaisa = Math.max(
    0,
    paymentPaisa + fundAllocationPaisa - refundPaisa - reversedPaymentPaisa,
  );

  return {
    netInvoicePaisa,
    netPaymentPaisa,
    duePaisa: Math.max(0, netInvoicePaisa - netPaymentPaisa),
  };
}

export function calculateSponsorship(
  feePaisa: Paisa,
  sponsorshipBasisPoints: number,
): { fundAllocationPaisa: Paisa; guardianPaymentPaisa: Paisa } {
  assertPaisa(feePaisa, "feePaisa");
  if (
    !Number.isSafeInteger(sponsorshipBasisPoints) ||
    sponsorshipBasisPoints < 0 ||
    sponsorshipBasisPoints > 10_000
  ) {
    throw new RangeError("sponsorshipBasisPoints must be an integer from 0 to 10000");
  }

  const allocationNumerator = feePaisa * sponsorshipBasisPoints;
  if (!Number.isSafeInteger(allocationNumerator) || allocationNumerator % 10_000 !== 0) {
    throw new RangeError("sponsorship must resolve to whole paisa");
  }

  const fundAllocationPaisa = allocationNumerator / 10_000;
  return {
    fundAllocationPaisa,
    guardianPaymentPaisa: feePaisa - fundAllocationPaisa,
  };
}

export type DueInvoice = {
  id: string;
  studentId: string;
  duePaisa: Paisa;
  dueDate: string;
};

export function allocateOldestFirst(
  studentId: string,
  paymentPaisa: Paisa,
  invoices: DueInvoice[],
): {
  allocations: Array<{ invoiceId: string; amountPaisa: Paisa }>;
  advanceCredit: { studentId: string; amountPaisa: Paisa };
} {
  assertPaisa(paymentPaisa, "paymentPaisa");
  invoices.forEach((invoice) => {
    assertPaisa(invoice.duePaisa, `invoice ${invoice.id} duePaisa`);
    if (invoice.studentId !== studentId) {
      throw new Error(`invoice ${invoice.id} belongs to another student`);
    }
  });

  let remainingPaisa = paymentPaisa;
  const allocations = [...invoices]
    .sort(
      (left, right) => left.dueDate.localeCompare(right.dueDate) || left.id.localeCompare(right.id),
    )
    .map((invoice) => {
      const amountPaisa = Math.min(invoice.duePaisa, remainingPaisa);
      remainingPaisa -= amountPaisa;
      return { invoiceId: invoice.id, amountPaisa };
    });

  return {
    allocations,
    advanceCredit: { studentId, amountPaisa: remainingPaisa },
  };
}

export type PaymentRecord = {
  id: string;
  idempotencyKey: string;
  studentId: string;
  amountPaisa: Paisa;
};

export type ReceiptRecord = {
  id: string;
  paymentId: string;
};

export type PaymentLedger = {
  payments: PaymentRecord[];
  receipts: ReceiptRecord[];
};

export function submitPayment(
  ledger: PaymentLedger,
  request: { idempotencyKey: string; studentId: string; amountPaisa: Paisa },
): { ledger: PaymentLedger; payment: PaymentRecord; receipt: ReceiptRecord } {
  assertPaisa(request.amountPaisa, "amountPaisa");
  const existingPayment = ledger.payments.find(
    (payment) => payment.idempotencyKey === request.idempotencyKey,
  );
  if (existingPayment) {
    const existingReceipt = ledger.receipts.find(
      (receipt) => receipt.paymentId === existingPayment.id,
    );
    if (!existingReceipt) throw new Error("payment exists without its receipt");
    return { ledger, payment: existingPayment, receipt: existingReceipt };
  }

  const payment: PaymentRecord = {
    id: `PAY-${ledger.payments.length + 1}`,
    ...request,
  };
  const receipt: ReceiptRecord = {
    id: `RCPT-${ledger.receipts.length + 1}`,
    paymentId: payment.id,
  };
  return {
    ledger: {
      payments: [...ledger.payments, payment],
      receipts: [...ledger.receipts, receipt],
    },
    payment,
    receipt,
  };
}

const underHundred = [
  "শূন্য",
  "এক",
  "দুই",
  "তিন",
  "চার",
  "পাঁচ",
  "ছয়",
  "সাত",
  "আট",
  "নয়",
  "দশ",
  "এগারো",
  "বারো",
  "তেরো",
  "চৌদ্দ",
  "পনেরো",
  "ষোলো",
  "সতেরো",
  "আঠারো",
  "উনিশ",
  "বিশ",
  "একুশ",
  "বাইশ",
  "তেইশ",
  "চব্বিশ",
  "পঁচিশ",
  "ছাব্বিশ",
  "সাতাশ",
  "আটাশ",
  "উনত্রিশ",
  "ত্রিশ",
  "একত্রিশ",
  "বত্রিশ",
  "তেত্রিশ",
  "চৌত্রিশ",
  "পঁয়ত্রিশ",
  "ছত্রিশ",
  "সাঁইত্রিশ",
  "আটত্রিশ",
  "উনচল্লিশ",
  "চল্লিশ",
  "একচল্লিশ",
  "বিয়াল্লিশ",
  "তেতাল্লিশ",
  "চুয়াল্লিশ",
  "পঁয়তাল্লিশ",
  "ছেচল্লিশ",
  "সাতচল্লিশ",
  "আটচল্লিশ",
  "উনপঞ্চাশ",
  "পঞ্চাশ",
  "একান্ন",
  "বাহান্ন",
  "তিপ্পান্ন",
  "চুয়ান্ন",
  "পঞ্চান্ন",
  "ছাপ্পান্ন",
  "সাতান্ন",
  "আটান্ন",
  "উনষাট",
  "ষাট",
  "একষট্টি",
  "বাষট্টি",
  "তেষট্টি",
  "চৌষট্টি",
  "পঁয়ষট্টি",
  "ছেষট্টি",
  "সাতষট্টি",
  "আটষট্টি",
  "উনসত্তর",
  "সত্তর",
  "একাত্তর",
  "বাহাত্তর",
  "তিয়াত্তর",
  "চুয়াত্তর",
  "পঁচাত্তর",
  "ছিয়াত্তর",
  "সাতাত্তর",
  "আটাত্তর",
  "উনআশি",
  "আশি",
  "একাশি",
  "বিরাশি",
  "তিরাশি",
  "চুরাশি",
  "পঁচাশি",
  "ছিয়াশি",
  "সাতাশি",
  "আটাশি",
  "উননব্বই",
  "নব্বই",
  "একানব্বই",
  "বিরানব্বই",
  "তিরানব্বই",
  "চুরানব্বই",
  "পঁচানব্বই",
  "ছিয়ানব্বই",
  "সাতানব্বই",
  "আটানব্বই",
  "নিরানব্বই",
] as const;

function integerInBengaliWords(value: number): string {
  if (value < 100) return underHundred[value];
  if (value < 1_000) {
    const remainder = value % 100;
    return `${underHundred[Math.floor(value / 100)]}শত${remainder ? ` ${underHundred[remainder]}` : ""}`;
  }

  const scales = [
    { value: 10_000_000, label: "কোটি" },
    { value: 100_000, label: "লক্ষ" },
    { value: 1_000, label: "হাজার" },
  ];
  for (const scale of scales) {
    if (value >= scale.value) {
      const leading = Math.floor(value / scale.value);
      const remainder = value % scale.value;
      return `${integerInBengaliWords(leading)} ${scale.label}${remainder ? ` ${integerInBengaliWords(remainder)}` : ""}`;
    }
  }
  throw new RangeError("amount is outside the supported range");
}

export function bengaliAmountInWords(amountPaisa: Paisa): string {
  assertPaisa(amountPaisa, "amountPaisa");
  if (amountPaisa % 100 !== 0) {
    throw new RangeError("amountPaisa must represent a whole taka amount");
  }
  return `${integerInBengaliWords(amountPaisa / 100)} টাকা মাত্র`;
}
