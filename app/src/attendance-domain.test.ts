import { describe, expect, it } from "vitest";
import {
  correctMark,
  cutoffState,
  loadDrafts,
  lockAtMinutes,
  markAllPresent,
  registerAvatar,
  registerCounts,
  registerCutoff,
  resolveAttendancePermission,
  saveDrafts,
  setMark,
  submitRegister,
  syncDraft,
  RegisterClosedError,
  type AttendanceDraft,
  type TeacherRegister,
} from "./attendance-domain";
import { initialRegisters } from "./attendance-data";
import { defaultInstitutionSettings, type InstitutionSettings } from "./settings-domain";
import { homeSectionForRole, prototypeRoles } from "./student-permissions";

const settings = defaultInstitutionSettings;
const teacher = prototypeRoles["class-teacher"].context;
const admin = prototypeRoles.admin.context;
const teacherPerm = resolveAttendancePermission(teacher, settings);
const morning = () => structuredClone(initialRegisters.find((r) => r.id === "REG-HK-MORNING")!);
const ids = (rs: TeacherRegister[]) => rs.map((r) => r.id);

describe("attendance permission (resolver + settings matrix)", () => {
  it("class teacher sees only own class/halaqa registers and can mark", () => {
    expect(teacherPerm.open).toBe(true);
    expect(teacherPerm.canMark).toBe(true);
    expect(ids(teacherPerm.visibleRegisters(initialRegisters))).toEqual([
      "REG-HK-FAJR",
      "REG-HK-MORNING",
      "REG-HK-NOON",
      "REG-HK-MAGHRIB",
    ]);
  });

  it("admin sees all; without girls' access the girls' register is absent", () => {
    expect(
      resolveAttendancePermission(admin, settings).visibleRegisters(initialRegisters),
    ).toHaveLength(6);
    const noGirls = resolveAttendancePermission({ ...admin, girlsSectionAccess: false }, settings);
    expect(ids(noGirls.visibleRegisters(initialRegisters))).not.toContain("REG-GK-MORNING");
  });

  it("roles without attendance in the matrix cannot open; editing the matrix changes that", () => {
    const cashier = prototypeRoles.cashier.context;
    expect(resolveAttendancePermission(cashier, settings).open).toBe(false);
    const edited: InstitutionSettings = {
      ...settings,
      rolePermissions: { ...settings.rolePermissions, "class-teacher": { attendance: ["view"] } },
    };
    const viewOnly = resolveAttendancePermission(teacher, edited);
    expect(viewOnly.open).toBe(true);
    expect(viewOnly.canMark).toBe(false);
  });

  it("teachers land on Today after sign-in", () => {
    expect(homeSectionForRole("class-teacher")).toBe("attendance");
  });

  it("photo only when the resolver and the branch photo policy both allow", () => {
    const reg = morning();
    const s = reg.students[0];
    expect(registerAvatar(reg, s, teacher, true)).toBe("photo");
    expect(registerAvatar(reg, s, teacher, false)).toBe("initials");
    const girls = initialRegisters.find((r) => r.id === "REG-GK-MORNING")!;
    const male = prototypeRoles["male-staff"].context;
    expect(registerAvatar(girls, girls.students[0], male, true)).toBe("initials");
  });
});

describe("cutoff countdown", () => {
  it("takes the shift cutoff from institution settings, else the register fallback", () => {
    expect(registerCutoff(morning(), settings)).toBe(8 * 60 + 15);
    const moved = { ...settings, attendanceCutoff: { ...settings.attendanceCutoff, সকাল: "08:45" } };
    expect(registerCutoff(morning(), moved)).toBe(8 * 60 + 45);
    const maghrib = initialRegisters.find((r) => r.id === "REG-HK-MAGHRIB")!;
    expect(registerCutoff(maghrib, settings)).toBe(19 * 60);
  });

  it("upcoming → open → due soon → overdue; submitted wins", () => {
    const reg = morning();
    const cut = 8 * 60 + 15;
    expect(cutoffState(reg, 7 * 60, cut)).toEqual({ kind: "upcoming", minutesToStart: 30 });
    expect(cutoffState(reg, 7 * 60 + 55, cut)).toEqual({ kind: "open", minutesLeft: 20 });
    expect(cutoffState(reg, 8 * 60 + 5, cut)).toEqual({ kind: "due-soon", minutesLeft: 10 });
    expect(cutoffState(reg, 8 * 60 + 40, cut)).toEqual({ kind: "overdue", minutesOver: 25 });
    expect(cutoffState({ ...reg, status: "submitted" }, 9 * 60, cut)).toEqual({
      kind: "submitted",
    });
  });
});

describe("marking", () => {
  it("unmarked is its own state, never counted as absent", () => {
    expect(registerCounts(morning())).toEqual({
      present: 2,
      late: 1,
      absent: 0,
      leave: 0,
      unmarked: 9,
      total: 12,
    });
  });

  it("সবাই উপস্থিত fills only unmarked rows and gives approved leave as Leave", () => {
    const reg = markAllPresent(setMark(morning(), "STU-20415", "absent"));
    expect(reg.marks["STU-20414"]).toBe("late");
    expect(reg.marks["STU-20415"]).toBe("absent");
    expect(reg.marks["STU-20418"]).toBe("leave");
    expect(registerCounts(reg)).toMatchObject({
      present: 9,
      late: 1,
      absent: 1,
      leave: 1,
      unmarked: 0,
    });
  });

  it("clearing a mark returns the row to unmarked; a submitted register cannot be edited", () => {
    expect(setMark(morning(), "STU-20411", null).marks["STU-20411"]).toBeUndefined();
    const fajr = initialRegisters[0];
    expect(() => setMark(fajr, "STU-20411", "absent")).toThrow(RegisterClosedError);
  });
});

describe("submit", () => {
  const input = {
    submissionId: "SUB-1",
    nowMinutes: 8 * 60,
    confirmUnmarked: false,
    permission: teacherPerm,
  };

  it("asks for confirmation while rows are unmarked; unmarked stay pending with no message", () => {
    const reg = setMark(morning(), "STU-20415", "absent");
    expect(submitRegister(reg, input)).toEqual({ ok: false, reason: "unmarked-not-confirmed" });
    const result = submitRegister(reg, { ...input, confirmUnmarked: true });
    if (!result.ok) throw new Error("expected ok");
    expect(result.register.status).toBe("submitted");
    expect(result.register.marks["STU-20413"]).toBeUndefined();
    expect(result.pendingUnmarked).toHaveLength(8);
    expect(result.messages.map((m) => m.studentId)).toEqual(["STU-20415"]);
  });

  it("one message per finalized absent; leave and late never message", () => {
    const reg = setMark(
      markAllPresent(setMark(morning(), "STU-20420", "absent")),
      "STU-20421",
      "late",
    );
    const result = submitRegister(reg, input);
    if (!result.ok) throw new Error("expected ok");
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0]).toMatchObject({ kind: "absent", studentId: "STU-20420" });
  });

  it("retrying the same submission returns the same record and sends nothing again", () => {
    const first = submitRegister(markAllPresent(morning()), input);
    if (!first.ok) throw new Error("expected ok");
    const retry = submitRegister(first.register, input);
    expect(retry).toMatchObject({ ok: true, duplicate: true, messages: [] });
    expect(submitRegister(first.register, { ...input, submissionId: "SUB-2" })).toEqual({
      ok: false,
      reason: "already-submitted",
    });
  });

  it("view-only permission cannot submit", () => {
    const viewOnly = { ...teacherPerm, canMark: false };
    expect(submitRegister(markAllPresent(morning()), { ...input, permission: viewOnly })).toEqual({
      ok: false,
      reason: "no-permission",
    });
  });
});

describe("correction after submit", () => {
  const submitted = () => {
    const r = submitRegister(setMark(markAllPresent(morning()), "STU-20415", "absent"), {
      submissionId: "SUB-1",
      nowMinutes: 8 * 60,
      confirmUnmarked: false,
      permission: teacherPerm,
    });
    if (!r.ok) throw new Error("expected ok");
    return r.register;
  };

  it("needs a reason, makes a new version and keeps history", () => {
    const reg = submitted();
    const base = { studentId: "STU-20415", to: "late" as const, nowMinutes: 9 * 60 };
    expect(correctMark(reg, { ...base, reason: "" })).toEqual({
      ok: false,
      reason: "reason-required",
    });
    const fixed = correctMark(reg, { ...base, reason: "দেরিতে এসে হাজির হয়েছে" });
    if (!fixed.ok) throw new Error("expected ok");
    expect(fixed.register.version).toBe(2);
    expect(fixed.register.history[0]).toMatchObject({ from: "absent", to: "late", version: 2 });
    expect(fixed.message?.kind).toBe("correction");
    expect(reg.marks["STU-20415"]).toBe("absent"); // original version unchanged
  });

  it("no guardian message when Absent is not involved; locked after the day ends", () => {
    const reg = submitted();
    const r = correctMark(reg, {
      studentId: "STU-20411",
      to: "late",
      reason: "ভুলে উপস্থিত দিয়েছিলাম",
      nowMinutes: 9 * 60,
    });
    expect(r.ok && r.message).toBeFalsy();
    expect(
      correctMark(reg, {
        studentId: "STU-20411",
        to: "late",
        reason: "ভুল সংশোধন",
        nowMinutes: lockAtMinutes,
      }),
    ).toEqual({ ok: false, reason: "locked" });
  });
});

describe("offline draft", () => {
  const draft = (over: Partial<AttendanceDraft> = {}): AttendanceDraft => ({
    registerId: "REG-HK-MORNING",
    eventId: "EVT-1",
    capturedAtMinutes: 7 * 60 + 50,
    marks: markAllPresent(morning()).marks,
    status: "queued",
    submissionId: "SUB-OFF-1",
    ...over,
  });

  it("survives a reload through storage", () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    };
    saveDrafts(storage, [draft()]);
    expect(loadDrafts(storage)).toEqual([draft()]);
    expect(loadDrafts({ getItem: () => "{broken", setItem: () => {} })).toEqual([]);
  });

  it("syncs a queued submit once; syncing again is a no-op", () => {
    const first = syncDraft(draft(), morning(), 8 * 60, teacherPerm);
    expect(first.draft.status).toBe("synced");
    expect(first.result).toMatchObject({ ok: true, duplicate: false });
    expect(syncDraft(first.draft, morning(), 8 * 60, teacherPerm).result).toBeUndefined();
  });

  it("never overwrites a register finalized by another submission — conflict for review", () => {
    const server = { ...morning(), status: "submitted" as const, submissionId: "SUB-OTHER" };
    expect(syncDraft(draft(), server, 8 * 60, teacherPerm).draft.status).toBe("conflict");
  });
});
