import type { PrototypeRole } from "./student-permissions";

/**
 * B2 login (S01) — pure rules for phone OTP and password + 2FA sign-in.
 * Prototype only: accounts and codes are mock data; a real backend verifies them.
 */

export type LoginMethod = "otp" | "password";

export type Institution = {
  id: string;
  name: string;
  place: string;
  branchKind: "বালক" | "বালিকা" | "মিশ্র";
};

export type Membership = { institutionId: string; role: PrototypeRole; title: string };

export type DemoAccount = {
  phone: string; // normalised 01XXXXXXXXX
  name: string;
  password: string;
  memberships: Membership[];
};

export const institutions: Institution[] = [
  {
    id: "INST-HQSM",
    name: "হলি কুরআন স্কুল এন্ড মাদরাসা",
    place: "মিরপুর, ঢাকা",
    branchKind: "মিশ্র",
  },
  {
    id: "INST-DUS",
    name: "দারুল উলুম মাদরাসা",
    place: "জিন্দাবাজার, সিলেট",
    branchKind: "বালক",
  },
];

/** Prototype demo accounts. The OTP and 2FA codes are shown in the labelled Prototype panel. */
export const demoAccounts: DemoAccount[] = [
  {
    phone: "01711000001",
    name: "মাওলানা আব্দুর রহিম",
    password: "demo-muhtamim",
    memberships: [
      { institutionId: "INST-HQSM", role: "muhtamim", title: "মুহতামিম" },
      { institutionId: "INST-DUS", role: "academic-admin", title: "একাডেমিক উপদেষ্টা" },
    ],
  },
  {
    phone: "01811000002",
    name: "উস্তাদ সালমান",
    password: "demo-teacher",
    memberships: [{ institutionId: "INST-HQSM", role: "class-teacher", title: "হিফজ শিক্ষক" }],
  },
  {
    phone: "01911000003",
    name: "মোঃ কামরুল হাসান",
    password: "demo-guardian",
    memberships: [{ institutionId: "INST-HQSM", role: "guardian", title: "অভিভাবক" }],
  },
];

export const demoOtp = "482915";
export const demoTwoFactorCode = "730416";

export const otpLength = 6;
export const otpValidSeconds = 5 * 60;
export const otpResendSeconds = 60;
export const maxFailedAttempts = 5;
export const lockoutSeconds = 15 * 60;

/** Accepts 01XXXXXXXXX, +8801XXXXXXXXX, 8801…, with spaces/dashes and Bengali digits. */
export function toLatinDigits(input: string): string {
  return input.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));
}

export function normalizeBdPhone(input: string): string | null {
  let digits = toLatinDigits(input).replace(/[\s-]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (digits.startsWith("880")) digits = digits.slice(2);
  return /^01[3-9]\d{8}$/.test(digits) ? digits : null;
}

/** 2FA is mandatory for privileged roles (PRD ch.1 note, ch.17). */
const privilegedRoles: PrototypeRole[] = [
  "admin",
  "muhtamim",
  "academic-admin",
  "exam-controller",
  "finance-lead",
  "cashier",
  "hr-officer",
];

export function requiresTwoFactor(account: DemoAccount): boolean {
  return account.memberships.some((m) => privilegedRoles.includes(m.role));
}

export type AttemptState = { failed: number; lockedUntil: number | null };

export const freshAttempts: AttemptState = { failed: 0, lockedUntil: null };

export function isLocked(state: AttemptState, now: number): boolean {
  return state.lockedUntil !== null && now < state.lockedUntil;
}

export function lockSecondsLeft(state: AttemptState, now: number): number {
  return isLocked(state, now) ? Math.ceil(((state.lockedUntil ?? now) - now) / 1000) : 0;
}

/** Records one wrong code/password; the 5th failure locks sign-in for 15 minutes. */
export function recordFailure(state: AttemptState, now: number): AttemptState {
  const base = state.lockedUntil !== null && now >= state.lockedUntil ? freshAttempts : state;
  const failed = base.failed + 1;
  return failed >= maxFailedAttempts
    ? { failed, lockedUntil: now + lockoutSeconds * 1000 }
    : { failed, lockedUntil: null };
}

export type OtpChallenge = { phone: string; sentAt: number };

export function canResendOtp(challenge: OtpChallenge, now: number): boolean {
  return now - challenge.sentAt >= otpResendSeconds * 1000;
}

export function resendSecondsLeft(challenge: OtpChallenge, now: number): number {
  return Math.max(0, Math.ceil((challenge.sentAt + otpResendSeconds * 1000 - now) / 1000));
}

export function isOtpExpired(challenge: OtpChallenge, now: number): boolean {
  return now - challenge.sentAt > otpValidSeconds * 1000;
}

export type LoginStep =
  | {
      kind: "error";
      reason: "locked" | "unknown-phone" | "wrong-code" | "expired" | "wrong-password";
    }
  | { kind: "need-2fa"; account: DemoAccount }
  | { kind: "pick-institution"; account: DemoAccount; memberships: Membership[] }
  | { kind: "signed-in"; account: DemoAccount; membership: Membership };

export function findAccount(phoneInput: string): DemoAccount | undefined {
  const phone = normalizeBdPhone(phoneInput);
  return phone ? demoAccounts.find((a) => a.phone === phone) : undefined;
}

/** After the first factor succeeds: ask for 2FA, ask which madrasa, or sign straight in. */
export function afterFirstFactor(account: DemoAccount, twoFactorDone: boolean): LoginStep {
  if (requiresTwoFactor(account) && !twoFactorDone) return { kind: "need-2fa", account };
  if (account.memberships.length > 1)
    return { kind: "pick-institution", account, memberships: account.memberships };
  return { kind: "signed-in", account, membership: account.memberships[0] };
}

export function verifyOtp(
  challenge: OtpChallenge,
  code: string,
  attempts: AttemptState,
  now: number,
): LoginStep {
  if (isLocked(attempts, now)) return { kind: "error", reason: "locked" };
  if (isOtpExpired(challenge, now)) return { kind: "error", reason: "expired" };
  const account = demoAccounts.find((a) => a.phone === challenge.phone);
  if (!account) return { kind: "error", reason: "unknown-phone" };
  if (toLatinDigits(code).trim() !== demoOtp) return { kind: "error", reason: "wrong-code" };
  return afterFirstFactor(account, false);
}

export function verifyPassword(
  phoneInput: string,
  password: string,
  attempts: AttemptState,
  now: number,
): LoginStep {
  if (isLocked(attempts, now)) return { kind: "error", reason: "locked" };
  const account = findAccount(phoneInput);
  // Same message for unknown phone and wrong password, so the form never reveals who has an account.
  if (!account || account.password !== password) return { kind: "error", reason: "wrong-password" };
  return afterFirstFactor(account, false);
}

export function verifyTwoFactor(
  account: DemoAccount,
  code: string,
  attempts: AttemptState,
  now: number,
): LoginStep {
  if (isLocked(attempts, now)) return { kind: "error", reason: "locked" };
  if (toLatinDigits(code).trim() !== demoTwoFactorCode)
    return { kind: "error", reason: "wrong-code" };
  return afterFirstFactor(account, true);
}

export function chooseInstitution(account: DemoAccount, institutionId: string): LoginStep {
  const membership = account.memberships.find((m) => m.institutionId === institutionId);
  if (!membership) return { kind: "error", reason: "unknown-phone" };
  return { kind: "signed-in", account, membership };
}

export function institutionById(id: string): Institution | undefined {
  return institutions.find((i) => i.id === id);
}

/** "01711000001" → "01711-000001" for display (Latin digits). */
export function formatPhone(phone: string): string {
  return phone.length === 11 ? `${phone.slice(0, 5)}-${phone.slice(5)}` : phone;
}
