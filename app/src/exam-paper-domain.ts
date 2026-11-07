import type { PrototypeRole } from "./student-permissions";

export type QuestionStatus = "খসড়া" | "অনুমোদিত";
export type PaperStatus = "খসড়া" | "পর্যালোচনা" | "অনুমোদিত/লক" | "আর্কাইভ";
export type PrintAction = "preview" | "print" | "download";

export type Question = {
  id: string;
  authorId: string;
  status: QuestionStatus;
  marks: number;
  component?: string;
};

export type ExamPaper = {
  id: string;
  version: number;
  status: PaperStatus;
  requiredMarks: number;
  questions: Question[];
};

export type PrintPolicy = {
  opensAt: string;
  closesAt: string;
};

export type PrintAttempt = {
  paperId: string;
  actorId: string;
  action: PrintAction;
  attemptedAt: string;
  copies: number;
  allowed: boolean;
  reason?: "paper-not-locked" | "outside-print-window" | "permission-denied";
};

export function visibleQuestions(
  questions: Question[],
  viewer: { role: PrototypeRole; actorId: string },
): Question[] {
  if (viewer.role === "exam-controller" || viewer.role === "admin") return questions;
  return questions.filter(
    (question) => question.status === "অনুমোদিত" || question.authorId === viewer.actorId,
  );
}

export function paperTotal(paper: ExamPaper): number {
  return paper.questions.reduce((sum, question) => sum + question.marks, 0);
}

export function lockPaper(paper: ExamPaper): ExamPaper {
  if (paperTotal(paper) !== paper.requiredMarks) {
    throw new Error("প্রয়োজনীয় মোট নম্বরের সঙ্গে প্রশ্নপত্রের মোট নম্বর মিলছে না");
  }
  if (paper.questions.some((question) => !question.component)) {
    throw new Error("সব প্রশ্নের component mapping সম্পন্ন করুন");
  }
  return { ...paper, status: "অনুমোদিত/লক" };
}

export function editLockedPaper(paper: ExamPaper): {
  archived: ExamPaper;
  draft: ExamPaper;
} {
  if (paper.status !== "অনুমোদিত/লক") throw new Error("শুধু লক করা প্রশ্নপত্র version করা যায়");
  return {
    archived: { ...paper, status: "আর্কাইভ" },
    draft: {
      ...paper,
      id: `${paper.id}-V${paper.version + 1}`,
      version: paper.version + 1,
      status: "খসড়া",
    },
  };
}

export function attemptPrintAction(
  paper: ExamPaper,
  options: {
    actorId: string;
    action: PrintAction;
    attemptedAt: string;
    copies?: number;
    canPrint: boolean;
    policy: PrintPolicy;
  },
): PrintAttempt {
  let reason: PrintAttempt["reason"];
  if (paper.status !== "অনুমোদিত/লক") reason = "paper-not-locked";
  else if (!options.canPrint) reason = "permission-denied";
  else if (
    options.attemptedAt < options.policy.opensAt ||
    options.attemptedAt > options.policy.closesAt
  )
    reason = "outside-print-window";

  return {
    paperId: paper.id,
    actorId: options.actorId,
    action: options.action,
    attemptedAt: options.attemptedAt,
    copies: options.copies ?? 1,
    allowed: !reason,
    ...(reason ? { reason } : {}),
  };
}
