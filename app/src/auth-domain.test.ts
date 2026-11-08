import { describe, expect, it } from "vitest";
import {
  canResendOtp,
  chooseInstitution,
  demoAccounts,
  demoOtp,
  demoTwoFactorCode,
  freshAttempts,
  isLocked,
  lockSecondsLeft,
  normalizeBdPhone,
  recordFailure,
  requiresTwoFactor,
  verifyOtp,
  verifyPassword,
  verifyTwoFactor,
  type AttemptState,
} from "./auth-domain";

const [muhtamim, teacher, guardian] = demoAccounts;
const now = 1_700_000_000_000;

describe("phone normalisation", () => {
  it("accepts local, +880 and Bengali-digit forms", () => {
    expect(normalizeBdPhone("01711-000001")).toBe("01711000001");
    expect(normalizeBdPhone("+880 1711 000001")).toBe("01711000001");
    expect(normalizeBdPhone("০১৮১১০০০০০২")).toBe("01811000002");
  });
  it("rejects short or non-mobile numbers", () => {
    expect(normalizeBdPhone("0171100000")).toBeNull();
    expect(normalizeBdPhone("01211000001")).toBeNull();
    expect(normalizeBdPhone("abc")).toBeNull();
  });
});

describe("phone OTP", () => {
  it("signs a teacher straight in with one madrasa", () => {
    const step = verifyOtp({ phone: teacher.phone, sentAt: now }, demoOtp, freshAttempts, now);
    expect(step).toMatchObject({ kind: "signed-in", membership: { role: "class-teacher" } });
  });
  it("rejects a wrong or expired code", () => {
    expect(verifyOtp({ phone: guardian.phone, sentAt: now }, "000000", freshAttempts, now)).toEqual(
      { kind: "error", reason: "wrong-code" },
    );
    const late = now + 6 * 60 * 1000;
    expect(verifyOtp({ phone: guardian.phone, sentAt: now }, demoOtp, freshAttempts, late)).toEqual(
      { kind: "error", reason: "expired" },
    );
  });
  it("allows resend only after 60 seconds", () => {
    expect(canResendOtp({ phone: teacher.phone, sentAt: now }, now + 59_000)).toBe(false);
    expect(canResendOtp({ phone: teacher.phone, sentAt: now }, now + 60_000)).toBe(true);
  });
});

describe("privileged roles need 2FA", () => {
  it("marks the muhtamim account as privileged, the guardian not", () => {
    expect(requiresTwoFactor(muhtamim)).toBe(true);
    expect(requiresTwoFactor(guardian)).toBe(false);
  });
  it("asks for 2FA even after a correct OTP", () => {
    const step = verifyOtp({ phone: muhtamim.phone, sentAt: now }, demoOtp, freshAttempts, now);
    expect(step.kind).toBe("need-2fa");
  });
  it("asks for 2FA after a correct password, then the institution picker", () => {
    expect(verifyPassword("01711000001", muhtamim.password, freshAttempts, now).kind).toBe(
      "need-2fa",
    );
    const step = verifyTwoFactor(muhtamim, demoTwoFactorCode, freshAttempts, now);
    expect(step.kind).toBe("pick-institution");
    expect(chooseInstitution(muhtamim, "INST-DUS")).toMatchObject({
      kind: "signed-in",
      membership: { role: "academic-admin" },
    });
  });
  it("cannot pick a madrasa the account does not belong to", () => {
    expect(chooseInstitution(teacher, "INST-DUS").kind).toBe("error");
  });
});

describe("rate limit", () => {
  it("locks after five failures and unlocks after fifteen minutes", () => {
    let state: AttemptState = freshAttempts;
    for (let i = 0; i < 4; i += 1) state = recordFailure(state, now);
    expect(isLocked(state, now)).toBe(false);
    state = recordFailure(state, now);
    expect(isLocked(state, now)).toBe(true);
    expect(lockSecondsLeft(state, now)).toBe(900);
    expect(verifyPassword(teacher.phone, teacher.password, state, now)).toEqual({
      kind: "error",
      reason: "locked",
    });
    expect(isLocked(state, now + 900_000)).toBe(false);
  });
  it("gives the same error for an unknown phone and a wrong password", () => {
    expect(verifyPassword("01700000000", "x", freshAttempts, now)).toEqual(
      verifyPassword(teacher.phone, "x", freshAttempts, now),
    );
  });
});
