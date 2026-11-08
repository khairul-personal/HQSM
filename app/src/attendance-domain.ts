/** B4 · Teacher "Today" + attendance register (S04, S12). Pure, tested rules — the UI only displays. */
import type { AttendanceMark, BranchId } from "./dashboard-domain";
import { resolveConfiguredPermission, type InstitutionSettings } from "./settings-domain";
import { resolveStudentPermission, type PermissionContext } from "./student-permissions";

export type { AttendanceMark };

/** Residential Hifz students can have several registers a day (PRD M05). */
export type AttendanceShift = "ফজর" | "সকাল" | "দুপুর" | "মাগরিব";

export type RegisterStudent = {
  id: string;
  name: string;
  initials: string;
  roll: number;
  gender: "বালক" | "বালিকা";
  /** Approved leave for today: "সবাই উপস্থিত" marks them Leave, never Present or Absent. */
  approvedLeave?: boolean;
};

export type CorrectionEntry = {
  version: number;
  studentId: string;
  from: AttendanceMark | null;
  to: AttendanceMark;
  reason: string;
  atMinutes: number;
};

export type TeacherRegister = {
  id: string;
  title: string;
  kind: "class" | "halaqa";
  shift: AttendanceShift;
  branch: BranchId;
  className: string;
  section: string;
  halaqa: string;
  teacher: string;
  room: string;
  startMinutes: number;
  /** Used only when the institution has no cutoff for this shift. */
  fallbackCutoffMinutes: number;
  students: RegisterStudent[];
  /** A missing entry is Unmarked — never Absent. */
  marks: Record<string, AttendanceMark>;
  status: "open" | "submitted";
  submissionId?: string;
  submittedAtMinutes?: number;
  version: number;
  history: CorrectionEntry[];
};

// ---------- Permission (shared resolver style; settings matrix decides) ----------

export type AttendancePermission = {
  open: boolean;
  /** Can mark and submit the registers returned by `visibleRegisters`. */
  canMark: boolean;
  visibleRegisters: <R extends TeacherRegister>(registers: R[]) => R[];
};

const inTeacherScope = (register: TeacherRegister, context: PermissionContext) => {
  const { classNames, sections, halaqas } = context.scope;
  const classMatch =
    !!classNames?.includes(register.className) &&
    (!sections?.length || sections.includes(register.section));
  return classMatch || !!halaqas?.includes(register.halaqa);
};

export function resolveAttendancePermission(
  context: PermissionContext,
  settings: InstitutionSettings,
): AttendancePermission {
  const canView = resolveConfiguredPermission(settings, context.role, "attendance", "view");
  if (!canView) return { open: false, canMark: false, visibleRegisters: () => [] };
  const canMark = resolveConfiguredPermission(settings, context.role, "attendance", "create");
  const ownOnly = context.role === "class-teacher";
  return {
    open: true,
    canMark,
    visibleRegisters: (registers) =>
      registers.filter(
        (r) =>
          // girls' registers are absent (not disabled) without girls'-section access
          (r.branch !== "girls" || context.girlsSectionAccess) &&
          (!ownOnly || inTeacherScope(r, context)),
      ),
  };
}

/** Photo or initials for one row — girls' privacy (resolver) and the branch photo policy both apply. */
export function registerAvatar(
  register: TeacherRegister,
  student: RegisterStudent,
  context: PermissionContext,
  photoPolicyAllows: boolean,
): "photo" | "initials" {
  const access = resolveStudentPermission(
    {
      id: student.id,
      className: register.className,
      section: register.section,
      halaqa: register.halaqa,
      gender: student.gender,
    },
    context,
  ).fields.photo;
  return access === "visible" && photoPolicyAllows ? "photo" : "initials";
}

// ---------- Cutoff ----------

export const dueSoonMinutes = 15;

const parseClock = (value: string | undefined): number | undefined => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value ?? "");
  if (!match) return undefined;
  const minutes = Number(match[1]) * 60 + Number(match[2]);
  return minutes < 24 * 60 ? minutes : undefined;
};

/** Institution setting for the shift wins (B15 drives B4); otherwise the register's own fallback. */
export function registerCutoff(register: TeacherRegister, settings: InstitutionSettings): number {
  return parseClock(settings.attendanceCutoff[register.shift]) ?? register.fallbackCutoffMinutes;
}

export type CutoffState =
  | { kind: "submitted" }
  | { kind: "upcoming"; minutesToStart: number }
  | { kind: "open" | "due-soon"; minutesLeft: number }
  | { kind: "overdue"; minutesOver: number };

export function cutoffState(
  register: TeacherRegister,
  nowMinutes: number,
  cutoffMinutes: number,
): CutoffState {
  if (register.status === "submitted") return { kind: "submitted" };
  if (nowMinutes < register.startMinutes)
    return { kind: "upcoming", minutesToStart: register.startMinutes - nowMinutes };
  if (nowMinutes > cutoffMinutes)
    return { kind: "overdue", minutesOver: nowMinutes - cutoffMinutes };
  const minutesLeft = cutoffMinutes - nowMinutes;
  return { kind: minutesLeft <= dueSoonMinutes ? "due-soon" : "open", minutesLeft };
}

// ---------- Counting and marking ----------

export type RegisterCounts = Record<AttendanceMark | "unmarked", number> & { total: number };

export function registerCounts(
  register: Pick<TeacherRegister, "students" | "marks">,
): RegisterCounts {
  const counts: RegisterCounts = {
    present: 0,
    late: 0,
    absent: 0,
    leave: 0,
    unmarked: 0,
    total: 0,
  };
  for (const student of register.students) {
    const mark = register.marks[student.id];
    counts[mark ?? "unmarked"] += 1;
    counts.total += 1;
  }
  return counts;
}

export const unmarkedStudents = (register: Pick<TeacherRegister, "students" | "marks">) =>
  register.students.filter((s) => !register.marks[s.id]);

export class RegisterClosedError extends Error {
  constructor() {
    super("register is already submitted; use a correction");
  }
}

export function setMark(
  register: TeacherRegister,
  studentId: string,
  mark: AttendanceMark | null,
): TeacherRegister {
  if (register.status !== "open") throw new RegisterClosedError();
  if (!register.students.some((s) => s.id === studentId)) throw new RangeError("unknown student");
  const marks = { ...register.marks };
  if (mark) marks[studentId] = mark;
  else delete marks[studentId];
  return { ...register, marks };
}

/** "সবাই উপস্থিত": fills only unmarked rows (never overwrites an exception); approved leave → Leave. */
export function markAllPresent(register: TeacherRegister): TeacherRegister {
  if (register.status !== "open") throw new RegisterClosedError();
  const marks = { ...register.marks };
  for (const s of register.students) marks[s.id] ??= s.approvedLeave ? "leave" : "present";
  return { ...register, marks };
}

// ---------- Submit (finalize) ----------

export type GuardianMessage = {
  /** Deterministic: one message per student per register version — retries never send twice. */
  key: string;
  studentId: string;
  kind: "absent" | "correction";
  text: string;
};

export type SubmitResult =
  | {
      ok: true;
      register: TeacherRegister;
      messages: GuardianMessage[];
      /** Stays Unmarked and goes to the Branch Admin pending list — never Absent, no message. */
      pendingUnmarked: string[];
      duplicate: boolean;
    }
  | { ok: false; reason: "no-permission" | "unmarked-not-confirmed" | "already-submitted" };

const absentText = (name: string, title: string) =>
  `আসসালামু আলাইকুম। ${name} আজ ${title}-এ উপস্থিত ছিল না। কোনো কারণ থাকলে মাদরাসাকে জানাবেন।`;

export function submitRegister(
  register: TeacherRegister,
  input: {
    submissionId: string;
    nowMinutes: number;
    confirmUnmarked: boolean;
    permission: AttendancePermission;
  },
): SubmitResult {
  if (!input.permission.canMark) return { ok: false, reason: "no-permission" };
  if (register.status === "submitted") {
    if (register.submissionId !== input.submissionId)
      return { ok: false, reason: "already-submitted" };
    // Idempotent retry: same record, no second message batch.
    return {
      ok: true,
      register,
      messages: [],
      pendingUnmarked: unmarkedStudents(register).map((s) => s.id),
      duplicate: true,
    };
  }
  const pending = unmarkedStudents(register);
  if (pending.length > 0 && !input.confirmUnmarked)
    return { ok: false, reason: "unmarked-not-confirmed" };
  const finalized: TeacherRegister = {
    ...register,
    status: "submitted",
    submissionId: input.submissionId,
    submittedAtMinutes: input.nowMinutes,
  };
  const messages = register.students
    .filter((s) => register.marks[s.id] === "absent")
    .map((s) => ({
      key: `${register.id}:v${register.version}:${s.id}`,
      studentId: s.id,
      kind: "absent" as const,
      text: absentText(s.name, register.title),
    }));
  return {
    ok: true,
    register: finalized,
    messages,
    pendingUnmarked: pending.map((s) => s.id),
    duplicate: false,
  };
}

// ---------- Correction after submit (new version, reason required) ----------

export const lockAtMinutes = 20 * 60; // দিনের শেষের lock ২০:০০
export const minReasonLength = 5;

export type CorrectionResult =
  | { ok: true; register: TeacherRegister; message?: GuardianMessage }
  | { ok: false; reason: "not-submitted" | "reason-required" | "locked" | "no-change" };

export function correctMark(
  register: TeacherRegister,
  input: { studentId: string; to: AttendanceMark; reason: string; nowMinutes: number },
): CorrectionResult {
  if (register.status !== "submitted") return { ok: false, reason: "not-submitted" };
  if (input.nowMinutes >= lockAtMinutes) return { ok: false, reason: "locked" };
  if (input.reason.trim().length < minReasonLength) return { ok: false, reason: "reason-required" };
  const from = register.marks[input.studentId] ?? null;
  if (from === input.to) return { ok: false, reason: "no-change" };
  const student = register.students.find((s) => s.id === input.studentId);
  if (!student) throw new RangeError("unknown student");
  const version = register.version + 1;
  const next: TeacherRegister = {
    ...register,
    version,
    marks: { ...register.marks, [input.studentId]: input.to },
    history: [
      ...register.history,
      {
        version,
        studentId: input.studentId,
        from,
        to: input.to,
        reason: input.reason.trim(),
        atMinutes: input.nowMinutes,
      },
    ],
  };
  // The guardian only hears about a correction when an Absent was involved.
  const message: GuardianMessage | undefined =
    from === "absent" || input.to === "absent"
      ? {
          key: `${register.id}:v${version}:${student.id}`,
          studentId: student.id,
          kind: input.to === "absent" ? "absent" : "correction",
          text:
            input.to === "absent"
              ? absentText(student.name, register.title)
              : `সংশোধনী: ${student.name} আজ ${register.title}-এ অনুপস্থিত নয়। আগের বার্তার জন্য দুঃখিত।`,
        }
      : undefined;
  return { ok: true, register: next, message };
}

// ---------- Offline draft (event ID, capture time, sync status) ----------

export type DraftStatus = "draft" | "queued" | "synced" | "conflict";

export type AttendanceDraft = {
  registerId: string;
  eventId: string;
  capturedAtMinutes: number;
  marks: Record<string, AttendanceMark>;
  status: DraftStatus;
  /** Set when the teacher pressed submit while offline; reused on sync so it stays idempotent. */
  submissionId?: string;
};

export type DraftStorage = Pick<Storage, "getItem" | "setItem">;
export const draftStorageKey = "madrasa.attendance-drafts";

export function loadDrafts(storage: DraftStorage | undefined): AttendanceDraft[] {
  try {
    const raw = storage?.getItem(draftStorageKey);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as AttendanceDraft[]) : [];
  } catch {
    return [];
  }
}

export function saveDrafts(storage: DraftStorage | undefined, drafts: AttendanceDraft[]): void {
  try {
    storage?.setItem(draftStorageKey, JSON.stringify(drafts));
  } catch {
    // storage full or blocked: the draft stays in memory for this visit
  }
}

export function upsertDraft(drafts: AttendanceDraft[], draft: AttendanceDraft): AttendanceDraft[] {
  return [...drafts.filter((d) => d.registerId !== draft.registerId), draft];
}

/**
 * Sync one queued draft against the server copy. A finalized register is never overwritten:
 * same submission → synced (retry), different submission → conflict for review.
 */
export function syncDraft(
  draft: AttendanceDraft,
  server: TeacherRegister,
  nowMinutes: number,
  permission: AttendancePermission,
): { draft: AttendanceDraft; result?: SubmitResult } {
  if (draft.status !== "queued" || !draft.submissionId) return { draft };
  if (server.status === "submitted" && server.submissionId !== draft.submissionId)
    return { draft: { ...draft, status: "conflict" } };
  const result = submitRegister(
    { ...server, marks: server.status === "open" ? draft.marks : server.marks },
    { submissionId: draft.submissionId, nowMinutes, confirmUnmarked: true, permission },
  );
  return { draft: { ...draft, status: result.ok ? "synced" : "conflict" }, result };
}
