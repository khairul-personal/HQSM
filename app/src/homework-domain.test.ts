import { describe, expect, it } from "vitest";
import {
  canAcceptLateAsOnTime,
  canAssignHomework,
  canGuardianOpenHomework,
  completionPercentage,
  isLateSubmission,
  validateSubmissionFile,
  type HomeworkSubmission,
} from "./homework-domain";
import { prototypeRoles } from "./student-permissions";

const lateSubmission: HomeworkSubmission = {
  studentId: "STU-10241",
  dueAt: "2026-11-12T20:00:00",
  submittedAt: "2026-11-12T20:04:00",
  checked: false,
};

describe("homework permission boundaries", () => {
  it("does not let a teacher assign homework to an unassigned class", () => {
    expect(
      canAssignHomework(prototypeRoles["class-teacher"].context, {
        kind: "section",
        className: "নূরানী",
        section: "খ",
      }),
    ).toBe(false);
  });

  it("does not let a guardian open another child's homework by URL", () => {
    const guardian = prototypeRoles.guardian.context;
    expect(canGuardianOpenHomework(guardian, "STU-10241")).toBe(true);
    expect(canGuardianOpenHomework(guardian, "STU-99999")).toBe(false);
  });
});

describe("homework submission rules", () => {
  it("flags a late submission and requires a reason to override it", () => {
    expect(isLateSubmission(lateSubmission)).toBe(true);
    expect(canAcceptLateAsOnTime(lateSubmission, "")).toBe(false);
    expect(canAcceptLateAsOnTime(lateSubmission, "ইন্টারনেট সমস্যার প্রমাণ পাওয়া গেছে")).toBe(true);
  });

  it("counts an offline check toward completion", () => {
    expect(
      completionPercentage(2, [
        {
          studentId: "STU-1",
          dueAt: "2026-11-12T20:00:00",
          checked: true,
          offlineChecked: true,
        },
      ]),
    ).toBe(50);
  });

  it("rejects over-limit audio and files without accepting a partial submission", () => {
    expect(
      validateSubmissionFile({
        kind: "audio",
        sizeBytes: 2 * 1024 * 1024,
        durationSeconds: 301,
      }),
    ).toMatchObject({ ok: false, code: "audio-duration" });
    expect(validateSubmissionFile({ kind: "image", sizeBytes: 5 * 1024 * 1024 + 1 })).toMatchObject(
      { ok: false, code: "image-size" },
    );
    expect(validateSubmissionFile({ kind: "pdf", sizeBytes: 10 * 1024 * 1024 + 1 })).toMatchObject({
      ok: false,
      code: "pdf-size",
    });
  });

  it("calculates completion from submitted or offline-checked work that is checked", () => {
    expect(
      completionPercentage(4, [
        {
          studentId: "STU-1",
          dueAt: "2026-11-12T20:00:00",
          submittedAt: "2026-11-12T19:00:00",
          checked: true,
        },
        {
          studentId: "STU-2",
          dueAt: "2026-11-12T20:00:00",
          checked: true,
          offlineChecked: true,
        },
        {
          studentId: "STU-3",
          dueAt: "2026-11-12T20:00:00",
          submittedAt: "2026-11-12T19:30:00",
          checked: false,
        },
      ]),
    ).toBe(50);
  });
});
