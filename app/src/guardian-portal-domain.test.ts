import { describe, expect, it } from "vitest";
import {
  guardianChildData,
  submitPaymentProof,
  type GuardianChildData,
} from "./guardian-portal-domain";
import { prototypeRoles } from "./student-permissions";

const records: GuardianChildData[] = [
  {
    studentId: "STU-10241",
    name: "আব্দুল্লাহ",
    attachments: ["abdullah-result.pdf"],
    attendance: { status: "present", time: "08:02" },
    sabak: "সূরা আল-মুলক ১–১০",
    homeworkDue: 2,
    publishedResult: { exam: "মাসিক মূল্যায়ন", grade: "A" },
    dueAmount: 2500,
  },
  {
    studentId: "STU-10240",
    name: "ফাতিমা",
    attachments: ["fatima-homework.pdf"],
    attendance: { status: "unmarked" },
    sabak: "কায়দা ১৮ পৃষ্ঠা",
    homeworkDue: 1,
    publishedResult: { exam: "মাসিক মূল্যায়ন", grade: "A+" },
    dueAmount: 1200,
  },
];

const guardian = prototypeRoles.guardian.context;

describe("guardian portal boundaries", () => {
  it("switching child never returns the other child's data", () => {
    expect(guardianChildData(guardian, "STU-10241", records)?.name).toBe("আব্দুল্লাহ");
    expect(guardianChildData(guardian, "STU-10240", records)?.name).toBe("ফাতিমা");
  });

  it("does not open another student's data by URL", () => {
    expect(guardianChildData(guardian, "STU-99999", records)).toBeNull();
  });

  it("sets uploaded payment proof to pending, never paid", () => {
    const record = submitPaymentProof({
      method: "bKash",
      reference: "8NX42Q",
      screenshotName: "payment.jpg",
    });
    expect(record.status).toBe("pending-verification");
    expect(record).not.toHaveProperty("status", "paid");
  });

  it("revoked link immediately removes child data and attachments", () => {
    const result = guardianChildData(guardian, "STU-10241", records, true);
    expect(result).toBeNull();
    expect(result?.attachments).toBeUndefined();
  });
});
