import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import {
  canResendOtp,
  chooseInstitution,
  demoAccounts,
  demoOtp,
  demoTwoFactorCode,
  findAccount,
  formatPhone,
  freshAttempts,
  institutionById,
  isLocked,
  lockSecondsLeft,
  normalizeBdPhone,
  otpLength,
  recordFailure,
  resendSecondsLeft,
  verifyOtp,
  verifyPassword,
  verifyTwoFactor,
  type AttemptState,
  type DemoAccount,
  type LoginMethod,
  type LoginStep,
  type Membership,
  type OtpChallenge,
} from "./auth-domain";
import { bn } from "./bn-format";
import "./login.css";

type Stage =
  | { kind: "start" }
  | { kind: "otp"; challenge: OtpChallenge }
  | { kind: "2fa"; account: DemoAccount }
  | { kind: "pick"; account: DemoAccount; memberships: Membership[] };

const errorText: Record<string, string> = {
  locked: "অনেকবার ভুল হয়েছে। নিরাপত্তার জন্য কিছুক্ষণ পর আবার চেষ্টা করুন।",
  "unknown-phone": "এই নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অফিসে যোগাযোগ করুন।",
  "wrong-code": "কোডটি মেলেনি। আবার দেখে লিখুন।",
  expired: "কোডের মেয়াদ শেষ। নতুন কোড পাঠান।",
  "wrong-password": "ফোন নম্বর বা পাসওয়ার্ড মেলেনি।",
};

function Pattern() {
  // Subtle geometric star lattice (PRD ch.12: 3–5% opacity, login/empty/print only).
  return (
    <svg className="login-pattern" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="login-star" width="72" height="72" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="21" y="21" width="30" height="30" />
            <rect x="21" y="21" width="30" height="30" transform="rotate(45 36 36)" />
            <circle cx="36" cy="36" r="6" />
            <path d="M0 0 L15 15 M72 0 L57 15 M0 72 L15 57 M72 72 L57 57" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#login-star)" />
    </svg>
  );
}

export default function Login({
  onSignedIn,
}: {
  onSignedIn: (membership: Membership, account: DemoAccount) => void;
}) {
  const [method, setMethod] = useState<LoginMethod>("otp");
  const [stage, setStage] = useState<Stage>({ kind: "start" });
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [attempts, setAttempts] = useState<AttemptState>(freshAttempts);
  const [now, setNow] = useState(() => Date.now());
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const locked = isLocked(attempts, now);

  const apply = (step: LoginStep) => {
    setBusy(false);
    setCode("");
    if (step.kind === "error") {
      if (step.reason !== "locked" && step.reason !== "expired")
        setAttempts((current) => recordFailure(current, Date.now()));
      setError(errorText[step.reason]);
      window.setTimeout(() => codeRef.current?.focus(), 0);
      return;
    }
    setError("");
    setAttempts(freshAttempts);
    if (step.kind === "need-2fa") setStage({ kind: "2fa", account: step.account });
    else if (step.kind === "pick-institution")
      setStage({ kind: "pick", account: step.account, memberships: step.memberships });
    else onSignedIn(step.membership, step.account);
  };

  const sendOtp = () => {
    const normalised = normalizeBdPhone(phone);
    if (!normalised) {
      setError("১১ সংখ্যার মোবাইল নম্বর লিখুন, যেমন 01711-000001");
      return;
    }
    if (!findAccount(normalised)) {
      setError(errorText["unknown-phone"]);
      return;
    }
    setError("");
    setCode("");
    setStage({ kind: "otp", challenge: { phone: normalised, sentAt: Date.now() } });
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (locked) return;
    const at = Date.now();
    if (stage.kind === "start" && method === "otp") return sendOtp();
    setBusy(true);
    // Short delay so the "যাচাই হচ্ছে…" state is visible, as with a real network call.
    window.setTimeout(() => {
      if (stage.kind === "start") apply(verifyPassword(phone, password, attempts, at));
      else if (stage.kind === "otp") apply(verifyOtp(stage.challenge, code, attempts, at));
      else if (stage.kind === "2fa") apply(verifyTwoFactor(stage.account, code, attempts, at));
    }, 350);
  };

  const back = () => {
    setStage({ kind: "start" });
    setCode("");
    setError("");
  };

  const lockNote = locked ? (
    <p className="login-alert" role="alert">
      <LockKeyhole size={16} aria-hidden="true" />
      সাইন ইন সাময়িক বন্ধ। {bn(Math.ceil(lockSecondsLeft(attempts, now) / 60))} মিনিট পর আবার চেষ্টা করুন।
    </p>
  ) : error ? (
    <p className="login-alert" role="alert">
      {error}
    </p>
  ) : null;

  return (
    <div className="login-page">
      <Pattern />
      <aside className="login-brand">
        <div className="login-mark">HQ</div>
        <div>
          <h1>হলি কুরআন স্কুল এন্ড মাদরাসা</h1>
          <p>মাদরাসা ব্যবস্থাপনা — হাজিরা, সবক, ফি ও ফলাফল এক জায়গায়।</p>
        </div>
        <p className="login-brand-foot">
          <ShieldCheck size={16} aria-hidden="true" /> পরিচালনা পদের জন্য দুই ধাপের যাচাই বাধ্যতামূলক
        </p>
      </aside>

      <main className="login-main">
        <section className="login-card" aria-labelledby="login-title">
          {stage.kind === "pick" ? (
            <>
              <h2 id="login-title">প্রতিষ্ঠান বাছাই করুন</h2>
              <p className="login-sub">
                আসসালামু আলাইকুম, {stage.account.name}। আপনি একাধিক মাদরাসায় যুক্ত আছেন।
              </p>
              <ul className="institution-list">
                {stage.memberships.map((membership) => {
                  const institution = institutionById(membership.institutionId);
                  if (!institution) return null;
                  return (
                    <li key={membership.institutionId}>
                      <button
                        type="button"
                        onClick={() =>
                          apply(chooseInstitution(stage.account, membership.institutionId))
                        }
                      >
                        <span className="institution-icon">
                          <Building2 size={20} aria-hidden="true" />
                        </span>
                        <span className="institution-text">
                          <b>{institution.name}</b>
                          <small>
                            {institution.place} · {membership.title}
                          </small>
                        </span>
                        <em className="ds-badge neutral">{institution.branchKind}</em>
                        <ChevronRight size={18} aria-hidden="true" />
                      </button>
                    </li>
                  );
                })}
              </ul>
              <button type="button" className="login-link" onClick={back}>
                <ArrowLeft size={16} aria-hidden="true" /> অন্য অ্যাকাউন্টে সাইন ইন
              </button>
            </>
          ) : (
            <form onSubmit={submit} noValidate>
              {stage.kind === "start" ? (
                <>
                  <h2 id="login-title">সাইন ইন</h2>
                  <p className="login-sub">আপনার নিবন্ধিত মোবাইল নম্বর দিয়ে প্রবেশ করুন।</p>
                  <div className="login-tabs" role="tablist" aria-label="সাইন ইনের পদ্ধতি">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={method === "otp"}
                      className={method === "otp" ? "active" : ""}
                      onClick={() => {
                        setMethod("otp");
                        setError("");
                      }}
                    >
                      <Smartphone size={16} aria-hidden="true" /> ফোন OTP
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={method === "password"}
                      className={method === "password" ? "active" : ""}
                      onClick={() => {
                        setMethod("password");
                        setError("");
                      }}
                    >
                      <KeyRound size={16} aria-hidden="true" /> পাসওয়ার্ড
                    </button>
                  </div>
                  <label className="login-field">
                    <span>মোবাইল নম্বর</span>
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="01XXX-XXXXXX"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      aria-invalid={Boolean(error) || undefined}
                    />
                  </label>
                  {method === "password" && (
                    <label className="login-field">
                      <span>পাসওয়ার্ড</span>
                      <input
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                      />
                    </label>
                  )}
                </>
              ) : (
                <>
                  <button type="button" className="login-link" onClick={back}>
                    <ArrowLeft size={16} aria-hidden="true" /> নম্বর বদলান
                  </button>
                  <h2 id="login-title">{stage.kind === "otp" ? "কোড লিখুন" : "দুই ধাপের যাচাই"}</h2>
                  <p className="login-sub">
                    {stage.kind === "otp" ? (
                      <>
                        <span className="latin">{formatPhone(stage.challenge.phone)}</span> নম্বরে{" "}
                        {bn(otpLength)} সংখ্যার কোড পাঠানো হয়েছে। মেয়াদ ৫ মিনিট।
                      </>
                    ) : (
                      "Authenticator অ্যাপে দেখানো ৬ সংখ্যার কোডটি লিখুন।"
                    )}
                  </p>
                  <label className="login-field">
                    <span>{stage.kind === "otp" ? "OTP কোড" : "যাচাই কোড"}</span>
                    <input
                      ref={codeRef}
                      key={stage.kind}
                      className="code-input"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={otpLength}
                      value={code}
                      autoFocus
                      onChange={(event) => setCode(event.target.value)}
                    />
                  </label>
                  {stage.kind === "otp" &&
                    (canResendOtp(stage.challenge, now) ? (
                      <button type="button" className="login-link" onClick={sendOtp}>
                        নতুন কোড পাঠান
                      </button>
                    ) : (
                      <p className="login-hint">
                        নতুন কোড পাঠানো যাবে {bn(resendSecondsLeft(stage.challenge, now))} সেকেন্ড পরে
                      </p>
                    ))}
                </>
              )}
              {lockNote}
              <button
                type="submit"
                className="ds-button primary login-submit"
                disabled={busy || locked}
              >
                {busy ? (
                  <>
                    <LoaderCircle className="spin" size={18} aria-hidden="true" /> যাচাই হচ্ছে…
                  </>
                ) : stage.kind === "start" && method === "otp" ? (
                  "কোড পাঠান"
                ) : stage.kind === "start" ? (
                  "সাইন ইন"
                ) : (
                  "যাচাই করুন"
                )}
              </button>
            </form>
          )}
        </section>

        <aside className="login-prototype" aria-label="Prototype demo accounts">
          <b>Prototype · ডেমো অ্যাকাউন্ট</b>
          <ul>
            {demoAccounts.map((account) => (
              <li key={account.phone}>
                <button
                  type="button"
                  onClick={() => {
                    setPhone(formatPhone(account.phone));
                    setPassword(account.password);
                    setError("");
                  }}
                >
                  <span className="latin">{formatPhone(account.phone)}</span>
                  <small>{account.memberships.map((m) => m.title).join(" · ")}</small>
                </button>
              </li>
            ))}
          </ul>
          <small>
            OTP <span className="latin">{demoOtp}</span> · 2FA{" "}
            <span className="latin">{demoTwoFactorCode}</span>
          </small>
        </aside>
      </main>
    </div>
  );
}
