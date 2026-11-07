import { describe, expect, it } from "vitest";
import {
  attemptPrintAction,
  lockPaper,
  visibleQuestions,
  type ExamPaper,
  type PrintAttempt,
  type Question,
} from "./exam-paper-domain";

const questions: Question[] = [
  { id: "Q-1", authorId: "T-1", status: "খসড়া", marks: 10, component: "ক" },
  { id: "Q-2", authorId: "T-2", status: "খসড়া", marks: 10, component: "খ" },
  { id: "Q-3", authorId: "T-2", status: "অনুমোদিত", marks: 10, component: "গ" },
];
const paper: ExamPaper = {
  id: "P-1",
  version: 1,
  status: "খসড়া",
  requiredMarks: 50,
  questions: questions.slice(0, 2),
};
const policy = {
  opensAt: "2026-11-10T08:00:00.000Z",
  closesAt: "2026-11-10T10:00:00.000Z",
};

describe("question paper workflow", () => {
  it("blocks lock when the required total does not match", () => {
    expect(() => lockPaper(paper)).toThrow("মোট নম্বর মিলছে না");
  });

  it("does not print an unapproved paper", () => {
    const attempt = attemptPrintAction(paper, {
      actorId: "EC-1",
      action: "print",
      attemptedAt: "2026-11-10T09:00:00.000Z",
      canPrint: true,
      policy,
    });
    expect(attempt).toMatchObject({ allowed: false, reason: "paper-not-locked" });
  });

  it("blocks preview outside the configured print window", () => {
    const attempt = attemptPrintAction(
      { ...paper, status: "অনুমোদিত/লক" },
      {
        actorId: "EC-1",
        action: "preview",
        attemptedAt: "2026-11-10T11:00:00.000Z",
        canPrint: true,
        policy,
      },
    );
    expect(attempt).toMatchObject({ allowed: false, reason: "outside-print-window" });
  });

  it("returns an audit record for every allowed and blocked print attempt", () => {
    const log: PrintAttempt[] = [];
    log.push(
      attemptPrintAction(paper, {
        actorId: "EC-1",
        action: "download",
        attemptedAt: "2026-11-10T09:00:00.000Z",
        canPrint: true,
        policy,
      }),
      attemptPrintAction(
        { ...paper, status: "অনুমোদিত/লক" },
        {
          actorId: "EC-1",
          action: "print",
          attemptedAt: "2026-11-10T09:00:00.000Z",
          copies: 3,
          canPrint: true,
          policy,
        },
      ),
    );
    expect(log).toHaveLength(2);
    expect(log[0]).toMatchObject({ action: "download", allowed: false });
    expect(log[1]).toMatchObject({ action: "print", copies: 3, allowed: true });
  });

  it("keeps another teacher's drafts out of a teacher's bank", () => {
    expect(
      visibleQuestions(questions, { role: "class-teacher", actorId: "T-1" }).map((q) => q.id),
    ).toEqual(["Q-1", "Q-3"]);
    expect(visibleQuestions(questions, { role: "exam-controller", actorId: "EC-1" })).toHaveLength(
      3,
    );
  });
});
