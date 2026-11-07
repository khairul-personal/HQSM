import { resolveHomeworkPermission, type PermissionContext } from "./student-permissions";

export type GuardianChildData = {
  studentId: string;
  name: string;
  attachments: string[];
  attendance: { status: "present" | "late" | "unmarked"; time?: string };
  sabak: string;
  homeworkDue: number;
  publishedResult?: { exam: string; grade: string };
  dueAmount: number;
};

export type PaymentProof = {
  method: "bKash" | "Nagad";
  reference: string;
  screenshotName: string;
};

export type PaymentProofRecord = PaymentProof & {
  status: "pending-verification";
};

export function guardianChildData(
  context: PermissionContext,
  requestedStudentId: string,
  records: GuardianChildData[],
  linkRevoked = false,
): GuardianChildData | null {
  if (linkRevoked) return null;
  const permission = resolveHomeworkPermission(context);
  if (permission.access !== "guardian" || !permission.canOpenStudent(requestedStudentId)) {
    return null;
  }
  return records.find((record) => record.studentId === requestedStudentId) ?? null;
}

export function submitPaymentProof(proof: PaymentProof): PaymentProofRecord {
  if (!proof.reference.trim() || !proof.screenshotName.trim()) {
    throw new Error("রেফারেন্স ও স্ক্রিনশট আবশ্যক");
  }
  return { ...proof, status: "pending-verification" };
}
