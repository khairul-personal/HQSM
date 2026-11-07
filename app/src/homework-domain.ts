import { resolveHomeworkPermission, type PermissionContext } from "./student-permissions";

export type HomeworkAudience =
  | { kind: "class"; className: string }
  | { kind: "section"; className: string; section: string }
  | { kind: "halaqa"; className: string; section: string; halaqa: string }
  | {
      kind: "students";
      studentIds: string[];
      className: string;
      section: string;
      halaqa: string;
    };

export type HomeworkSubmission = {
  studentId: string;
  submittedAt?: string;
  dueAt: string;
  checked: boolean;
  offlineChecked?: boolean;
};

export type SubmissionFile = {
  kind: "audio" | "image" | "pdf";
  sizeBytes: number;
  durationSeconds?: number;
};

const includesScope = (values: string[] | undefined, value: string) =>
  !values?.length || values.includes(value);

export function canAssignHomework(context: PermissionContext, audience: HomeworkAudience): boolean {
  if (context.role === "admin" || context.role === "academic-admin") return true;
  if (context.role !== "class-teacher") return false;
  if (audience.kind === "students") {
    return (
      audience.studentIds.length > 0 &&
      includesScope(context.scope.classNames, audience.className) &&
      includesScope(context.scope.sections, audience.section) &&
      includesScope(context.scope.halaqas, audience.halaqa)
    );
  }
  if (!includesScope(context.scope.classNames, audience.className)) return false;
  if (audience.kind === "class") {
    return !context.scope.sections?.length && !context.scope.halaqas?.length;
  }
  if (!includesScope(context.scope.sections, audience.section)) return false;
  if (audience.kind === "section") return !context.scope.halaqas?.length;
  return includesScope(context.scope.halaqas, audience.halaqa);
}

export function canGuardianOpenHomework(context: PermissionContext, studentId: string): boolean {
  return resolveHomeworkPermission(context).canOpenStudent(studentId);
}

export function isLateSubmission(submission: HomeworkSubmission): boolean {
  return Boolean(submission.submittedAt && submission.submittedAt > submission.dueAt);
}

export function canAcceptLateAsOnTime(
  submission: HomeworkSubmission,
  overrideReason?: string,
): boolean {
  return !isLateSubmission(submission) || Boolean(overrideReason?.trim());
}

export function completionPercentage(assigned: number, submissions: HomeworkSubmission[]): number {
  if (assigned <= 0) return 0;
  const completed = submissions.filter(
    (submission) =>
      submission.checked && (Boolean(submission.submittedAt) || submission.offlineChecked === true),
  ).length;
  return Math.round((completed / assigned) * 100);
}

export type SubmissionValidation =
  | { ok: true }
  | { ok: false; code: "audio-duration" | "image-size" | "pdf-size"; message: string };

export function validateSubmissionFile(file: SubmissionFile): SubmissionValidation {
  const megabyte = 1024 * 1024;
  if (file.kind === "audio" && (file.durationSeconds ?? 0) > 5 * 60) {
    return {
      ok: false,
      code: "audio-duration",
      message: "অডিও ৫ মিনিটের বেশি হতে পারবে না। কিছুই সংরক্ষণ করা হয়নি।",
    };
  }
  if (file.kind === "image" && file.sizeBytes > 5 * megabyte) {
    return {
      ok: false,
      code: "image-size",
      message: "ছবি সর্বোচ্চ ৫ MB হতে পারবে। কিছুই সংরক্ষণ করা হয়নি।",
    };
  }
  if (file.kind === "pdf" && file.sizeBytes > 10 * megabyte) {
    return {
      ok: false,
      code: "pdf-size",
      message: "PDF সর্বোচ্চ ১০ MB হতে পারবে। কিছুই সংরক্ষণ করা হয়নি।",
    };
  }
  return { ok: true };
}
