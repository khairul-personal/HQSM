import { useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  BookOpen,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  FileImage,
  GraduationCap,
  LoaderCircle,
  LogOut,
  MessageSquareText,
  Phone,
  ReceiptText,
  RefreshCcw,
  ShieldAlert,
  Smartphone,
  UploadCloud,
  UserRoundX,
  WalletCards,
  WifiOff,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import {
  guardianChildData,
  submitPaymentProof,
  type GuardianChildData,
  type PaymentProofRecord,
} from "./guardian-portal-domain";
import { guardianHomePath, homeworkChildPath, resultPath } from "./app-routes";
import { prototypeRoles, type PrototypeRole } from "./student-permissions";
import { BlockedActionNotice, SystemState, useSubscription } from "./SystemStates";
import "./guardian-home.css";

type PortalState = "ready" | "loading" | "offline" | "no-children" | "revoked" | "denied";

const children = [
  {
    id: "STU-10241",
    name: "মুহাম্মদ আব্দুল্লাহ",
    initials: "মআ",
    className: "হিফজ · সেকশন ক",
    tone: "sage",
  },
  {
    id: "STU-10240",
    name: "ফাতিমা তুয যাহরা",
    initials: "ফয",
    className: "নূরানী · সেকশন খ",
    tone: "rose",
  },
];

const records: GuardianChildData[] = [
  {
    studentId: "STU-10241",
    name: "মুহাম্মদ আব্দুল্লাহ",
    attachments: ["monthly-result-abdullah.pdf", "homework-guide.pdf"],
    attendance: { status: "present", time: "সকাল ৮:০২" },
    sabak: "সূরা আল-মুলক · আয়াত ১–১০ · আজ শুনিয়েছে",
    homeworkDue: 2,
    publishedResult: { exam: "অক্টোবর মাসিক মূল্যায়ন", grade: "৮৭% · A" },
    dueAmount: 2500,
  },
  {
    studentId: "STU-10240",
    name: "ফাতিমা তুয যাহরা",
    attachments: ["monthly-result-fatima.pdf"],
    attendance: { status: "unmarked" },
    sabak: "নূরানী কায়দা · পৃষ্ঠা ১৮ · পরের পাঠ পৃষ্ঠা ১৯",
    homeworkDue: 1,
    publishedResult: { exam: "অক্টোবর মাসিক মূল্যায়ন", grade: "৯২% · A+" },
    dueAmount: 1200,
  },
];

const money = (amount: number) => new Intl.NumberFormat("bn-BD").format(amount);

function OtpLogin({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("01712 345678");
  const [digits, setDigits] = useState(["1", "2", "4", "8", "", ""]);
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  return (
    <main className="guardian-login ds-page">
      <section>
        <div className="guardian-login-mark">HQ</div>
        <span>{step === "phone" ? "অভিভাবক লগইন" : "ফোন যাচাই"}</span>
        <h1>{step === "phone" ? "আপনার ফোন নম্বর দিন" : "৬ সংখ্যার কোড লিখুন"}</h1>
        <p>
          {step === "phone"
            ? "প্রতিষ্ঠানে দেওয়া নম্বরে একটি নিরাপদ কোড পাঠানো হবে।"
            : `${phone} নম্বরে পাঠানো কোডটি লিখুন।`}
        </p>
        {step === "phone" ? (
          <label className="guardian-phone-input">
            <Phone size={18} />
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              inputMode="tel"
            />
          </label>
        ) : (
          <div className="otp-group">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(node) => {
                  refs.current[index] = node;
                }}
                value={digit}
                inputMode="numeric"
                maxLength={1}
                aria-label={`OTP digit ${index + 1}`}
                onChange={(event) => {
                  const next = [...digits];
                  next[index] = event.target.value.replace(/\D/g, "");
                  setDigits(next);
                  if (next[index]) refs.current[index + 1]?.focus();
                }}
              />
            ))}
          </div>
        )}
        <button
          className="guardian-login-submit"
          onClick={() => (step === "phone" ? setStep("otp") : onDone())}
        >
          {step === "phone" ? "কোড পাঠান" : "যাচাই করে প্রবেশ করুন"} <ArrowRight size={17} />
        </button>
        {step === "otp" && (
          <button className="guardian-login-back" onClick={() => setStep("phone")}>
            ফোন নম্বর পরিবর্তন করুন
          </button>
        )}
        <small>টেস্ট কোড: যেকোনো ৬ সংখ্যা</small>
      </section>
    </main>
  );
}

function PortalStatePanel({
  state,
  onReset,
}: {
  state: Exclude<PortalState, "ready" | "offline">;
  onReset: () => void;
}) {
  const content = {
    loading: ["তথ্য আসছে", "আপনার সন্তানের আজকের তথ্য প্রস্তুত করা হচ্ছে।", ""],
    "no-children": [
      "কোনো সন্তান যুক্ত নেই",
      "আপনার ফোন নম্বরের সঙ্গে কোনো শিক্ষার্থী পাওয়া যায়নি।",
      "অফিসে যোগাযোগ করুন",
    ],
    revoked: [
      "সন্তানের লিংক সরানো হয়েছে",
      "নিরাপত্তার জন্য সব তথ্য ও সংযুক্তির অ্যাক্সেস এখনই বন্ধ হয়েছে।",
      "অফিসে যোগাযোগ করুন",
    ],
    denied: ["এই পোর্টাল দেখার অনুমতি নেই", "Guardian অ্যাকাউন্ট দিয়ে আবার প্রবেশ করুন।", "আবার চেষ্টা করুন"],
  } as const;
  const [title, message, action] = content[state];
  return (
    <SystemState
      kind={state === "loading" ? "loading" : state === "no-children" ? "empty" : "no-permission"}
      title={title}
      message={message}
      actionLabel={action}
      onAction={action ? onReset : undefined}
      className="gp-state"
    />
  );
}

function PaymentSheet({
  onClose,
  onProof,
}: {
  onClose: () => void;
  onProof: (proof: PaymentProofRecord) => void;
}) {
  const [method, setMethod] = useState<"bKash" | "Nagad">("bKash");
  const [reference, setReference] = useState("");
  const [screenshot, setScreenshot] = useState("");
  const [error, setError] = useState("");
  return (
    <div className="gp-sheet-backdrop" onClick={onClose}>
      <section className="gp-sheet" onClick={(event) => event.stopPropagation()}>
        <header>
          <div>
            <span>পরিশোধের নিয়ম</span>
            <h2>বকেয়া পরিশোধ করুন</h2>
          </div>
          <button onClick={onClose} aria-label="বন্ধ করুন">
            <X size={20} />
          </button>
        </header>
        <div className="gp-payment-instructions">
          <article>
            <span>
              <WalletCards size={19} />
            </span>
            <div>
              <b>অফিসে নগদ</b>
              <p>রবি–বৃহস্পতি · সকাল ৮টা–দুপুর ২টা। রসিদ অবশ্যই নিন।</p>
            </div>
          </article>
          <article>
            <span>
              <Smartphone size={19} />
            </span>
            <div>
              <b>bKash / Nagad</b>
              <p>Merchant 01••• ••••88 · Reference-এ Student ID লিখুন।</p>
            </div>
          </article>
        </div>
        <div className="gp-methods">
          {(["bKash", "Nagad"] as const).map((value) => (
            <button
              key={value}
              className={method === value ? "active" : ""}
              onClick={() => setMethod(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <label>
          লেনদেনের reference
          <input
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            placeholder="যেমন: 8NX42Q"
          />
        </label>
        <label className="gp-proof-file">
          <FileImage size={18} />
          <span>
            <b>{screenshot || "স্ক্রিনশট দিন"}</b>
            <small>JPG বা PNG</small>
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setScreenshot(event.target.files?.[0]?.name ?? "")}
          />
          <UploadCloud size={17} />
        </label>
        {error && (
          <p className="gp-proof-error">
            <AlertCircle size={15} /> {error}
          </p>
        )}
        <button
          className="gp-primary"
          onClick={() => {
            try {
              onProof(submitPaymentProof({ method, reference, screenshotName: screenshot }));
              onClose();
            } catch (reason) {
              setError(reason instanceof Error ? reason.message : "তথ্য পূরণ করুন");
            }
          }}
        >
          প্রমাণ পাঠান
        </button>
        <p className="gp-pending-explain">
          পাঠানোর পর অবস্থা হবে “যাচাই বাকি”। Cashier যাচাই না করা পর্যন্ত “পরিশোধিত” দেখাবে না।
        </p>
      </section>
    </div>
  );
}

export default function GuardianHome({
  role,
  setRole,
}: {
  role: PrototypeRole;
  setRole: (role: PrototypeRole) => void;
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const requestedId = decodeURIComponent(pathname.split("/")[2] || children[0].id);
  const [authenticated, setAuthenticated] = useState(true);
  const [state, setState] = useState<PortalState>("ready");
  const [paymentSheet, setPaymentSheet] = useState(false);
  const [proofs, setProofs] = useState<Record<string, PaymentProofRecord>>({});
  const [readNotices, setReadNotices] = useState<string[]>([]);
  const { decision: subscriptionAccess } = useSubscription();
  const paymentAccess = subscriptionAccess("collect-existing-invoice");
  const context = prototypeRoles[role].context;
  const data = guardianChildData(context, requestedId, records, state === "revoked");
  const child = children.find((item) => item.id === requestedId);
  const proof = proofs[requestedId];
  const noticeRead = readNotices.includes(requestedId);

  if (!authenticated) return <OtpLogin onDone={() => setAuthenticated(true)} />;
  const effectiveState: PortalState =
    role !== "guardian"
      ? "denied"
      : state === "no-children"
        ? state
        : !data
          ? state === "revoked"
            ? "revoked"
            : "denied"
          : state;

  return (
    <div className="gp-page ds-page">
      <div className="gp-phone">
        <header className="gp-header">
          <div className="gp-brand">
            <span>HQ</span>
            <div>
              <b>অভিভাবক পোর্টাল</b>
              <small>ফোন OTP দিয়ে যাচাইকৃত</small>
            </div>
            <button onClick={() => setAuthenticated(false)} aria-label="লগআউট">
              <LogOut size={18} />
            </button>
          </div>
          <label className="gp-dev-switch">
            <span>PROTOTYPE</span>
            <select value={state} onChange={(event) => setState(event.target.value as PortalState)}>
              <option value="ready">স্বাভাবিক</option>
              <option value="loading">Loading</option>
              <option value="offline">Offline</option>
              <option value="no-children">No linked children</option>
              <option value="revoked">Link revoked</option>
              <option value="denied">No permission</option>
            </select>
            <select value={role} onChange={(event) => setRole(event.target.value as PrototypeRole)}>
              <option value="guardian">Guardian</option>
              <option value="class-teacher">No permission</option>
            </select>
          </label>
          {child &&
            effectiveState !== "no-children" &&
            effectiveState !== "revoked" &&
            effectiveState !== "denied" && (
              <div className="gp-child-switcher">
                <span className={`student-avatar ${child.tone}`}>{child.initials}</span>
                <div>
                  <small>সন্তান</small>
                  <b>{child.name}</b>
                  <em>{child.className}</em>
                </div>
                <select
                  value={requestedId}
                  onChange={(event) => navigate(guardianHomePath(event.target.value))}
                  aria-label="সন্তান পরিবর্তন"
                >
                  {children.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={17} />
              </div>
            )}
        </header>
        {effectiveState === "loading" ||
        effectiveState === "no-children" ||
        effectiveState === "revoked" ||
        effectiveState === "denied" ? (
          <PortalStatePanel state={effectiveState} onReset={() => setState("ready")} />
        ) : data ? (
          <main className="gp-content">
            {effectiveState === "offline" && (
              <div className="gp-offline">
                <WifiOff size={17} />
                <span>
                  <b>অফলাইনে শেষ সংরক্ষিত তথ্য</b>
                  <small>আজ, সকাল ৮:৩০-এ হালনাগাদ</small>
                </span>
              </div>
            )}
            <section className="gp-welcome">
              <span>আসসালামু আলাইকুম</span>
              <h1>{data.name.split(" ").slice(-1)[0]}র আজকের খবর</h1>
            </section>
            <article className="gp-card attendance">
              <header>
                <span>
                  <CheckCircle2 size={20} />
                </span>
                <div>
                  <small>আজকের হাজিরা</small>
                  <h2>{data.attendance.status === "unmarked" ? "এখনো দেওয়া হয়নি" : "উপস্থিত"}</h2>
                </div>
                {data.attendance.time && <em>{data.attendance.time}</em>}
              </header>
              <p>
                {data.attendance.status === "unmarked"
                  ? "শিক্ষক হাজিরা দিলে এখানে দেখা যাবে। অনুপস্থিত হিসেবে ধরা হয়নি।"
                  : "সময়মতো মাদরাসায় পৌঁছেছে।"}
              </p>
            </article>
            <article className="gp-card">
              <header>
                <span>
                  <BookOpen size={20} />
                </span>
                <div>
                  <small>আজকের সবক</small>
                  <h2>আজকের পাঠের সারাংশ</h2>
                </div>
              </header>
              <p>{data.sabak}</p>
              <div className="gp-safe-note">
                <ShieldAlert size={14} /> শুধু অভিভাবকের জন্য প্রকাশিত সারাংশ
              </div>
            </article>
            <article className="gp-card">
              <header>
                <span>
                  <ClipboardCheck size={20} />
                </span>
                <div>
                  <small>হোমওয়ার্ক</small>
                  <h2>{data.homeworkDue}টি কাজ শিগগির জমা দিতে হবে</h2>
                </div>
              </header>
              <p>সবচেয়ে কাছের সময়: আজ রাত ৮:০০</p>
              <button
                className="gp-card-action"
                onClick={() => navigate(homeworkChildPath(data.studentId))}
              >
                হোমওয়ার্ক দেখুন <ChevronRight size={17} />
              </button>
            </article>
            {data.publishedResult && (
              <article className="gp-card">
                <header>
                  <span>
                    <GraduationCap size={20} />
                  </span>
                  <div>
                    <small>সর্বশেষ প্রকাশিত ফলাফল</small>
                    <h2>{data.publishedResult.exam}</h2>
                  </div>
                  <em>{data.publishedResult.grade}</em>
                </header>
                <p>শুধু প্রকাশিত ফলাফল দেখানো হচ্ছে।</p>
                <button
                  className="gp-card-action"
                  onClick={() => navigate(resultPath(data.studentId))}
                >
                  ফলাফল দেখুন <ChevronRight size={17} />
                </button>
              </article>
            )}
            <article className="gp-card due">
              <header>
                <span>
                  <WalletCards size={20} />
                </span>
                <div>
                  <small>বকেয়া</small>
                  <h2>৳ {money(data.dueAmount)}</h2>
                </div>
                <em>২০ নভেম্বরের মধ্যে</em>
              </header>
              {proof ? (
                <div className="gp-proof-pending">
                  <Clock3 size={17} />
                  <span>
                    <b>যাচাই বাকি</b>
                    <small>
                      {proof.method} · Ref {proof.reference}
                    </small>
                  </span>
                </div>
              ) : (
                <>
                  <button
                    className="gp-card-action primary"
                    disabled={!paymentAccess.allowed}
                    onClick={() => setPaymentSheet(true)}
                  >
                    পরিশোধের নিয়ম <ChevronRight size={17} />
                  </button>
                  {!paymentAccess.allowed && (
                    <BlockedActionNotice action="collect-existing-invoice" compact />
                  )}
                </>
              )}
            </article>
            <article className="gp-card notice">
              <header>
                <span>
                  <Bell size={20} />
                </span>
                <div>
                  <small>নোটিশ · আজ</small>
                  <h2>শীতকালীন সময়সূচি শুরু</h2>
                </div>
              </header>
              <p>আগামী রবিবার থেকে ক্লাস সকাল ৮টার পরিবর্তে ৮:৩০-এ শুরু হবে।</p>
              <button
                className={`gp-card-action ${noticeRead ? "read" : ""}`}
                onClick={() =>
                  setReadNotices((current) =>
                    current.includes(requestedId) ? current : [...current, requestedId],
                  )
                }
              >
                {noticeRead ? (
                  <>
                    <Check size={17} /> পড়েছি
                  </>
                ) : (
                  <>
                    পড়েছি জানাই <ChevronRight size={17} />
                  </>
                )}
              </button>
            </article>
          </main>
        ) : null}
      </div>
      {paymentSheet && (
        <PaymentSheet
          onClose={() => setPaymentSheet(false)}
          onProof={(nextProof) =>
            setProofs((current) => ({ ...current, [requestedId]: nextProof }))
          }
        />
      )}
    </div>
  );
}
