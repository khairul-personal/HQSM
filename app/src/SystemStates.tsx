import { createContext, useContext, useState, type ReactNode } from "react";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  Download,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  RefreshCcw,
  SearchX,
  ShieldAlert,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import {
  subscriptionDecision,
  type SubscriptionAction,
  type SubscriptionMode,
} from "./subscription-domain";
import "./system-states.css";

export type SystemStateKind =
  | "empty"
  | "loading"
  | "error"
  | "offline"
  | "no-permission"
  | "not-found";

const defaults: Record<
  SystemStateKind,
  { icon: LucideIcon; title: string; message: string; action: string }
> = {
  empty: {
    icon: CircleDashed,
    title: "এখনো কোনো তথ্য নেই",
    message: "নতুন তথ্য যোগ হলে এখানে দেখা যাবে।",
    action: "নতুন যোগ করুন",
  },
  loading: {
    icon: LoaderCircle,
    title: "তথ্য লোড হচ্ছে",
    message: "একটু অপেক্ষা করুন।",
    action: "",
  },
  error: {
    icon: AlertCircle,
    title: "তথ্য আনা যায়নি",
    message: "সমস্যাটি সাময়িক। আবার চেষ্টা করুন।",
    action: "আবার চেষ্টা করুন",
  },
  offline: {
    icon: WifiOff,
    title: "আপনি অফলাইনে আছেন",
    message: "শেষ সংরক্ষিত তথ্য দেখানো হচ্ছে।",
    action: "আবার চেষ্টা করুন",
  },
  "no-permission": {
    icon: EyeOff,
    title: "এই তথ্য দেখার অনুমতি নেই",
    message: "প্রয়োজনে প্রতিষ্ঠানের Admin-এর সঙ্গে যোগাযোগ করুন।",
    action: "ফিরে যান",
  },
  "not-found": {
    icon: SearchX,
    title: "এই ঠিকানায় কিছু পাওয়া যায়নি",
    message: "লিংকটি পুরোনো বা ভুল হতে পারে। তালিকা থেকে আবার খুঁজুন।",
    action: "তালিকায় ফিরুন",
  },
};

export function SystemState({
  kind,
  title,
  message,
  actionLabel,
  onAction,
  className = "",
}: {
  kind: SystemStateKind;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  const fallback = defaults[kind];
  const Icon = fallback.icon;
  const action = actionLabel ?? fallback.action;
  return (
    <section className={`system-state ${className}`}>
      <span>
        <Icon size={27} className={kind === "loading" ? "spin" : ""} />
      </span>
      <h2>{title ?? fallback.title}</h2>
      <p>{message ?? fallback.message}</p>
      {kind === "loading" && <LoadingSkeleton rows={3} />}
      {action && onAction && (
        <button className="ds-button secondary" onClick={onAction}>
          {kind === "error" || kind === "offline" ? <RefreshCcw size={15} /> : null}
          {action}
        </button>
      )}
    </section>
  );
}

export function LoadingSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="system-skeleton" aria-label="লোড হচ্ছে">
      {Array.from({ length: rows }, (_, index) => (
        <i key={index} />
      ))}
    </div>
  );
}

type SubscriptionContextValue = {
  mode: SubscriptionMode;
  setMode: (mode: SubscriptionMode) => void;
  decision: (action: SubscriptionAction) => ReturnType<typeof subscriptionDecision>;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<SubscriptionMode>("active");
  return (
    <SubscriptionContext.Provider
      value={{
        mode,
        setMode,
        decision: (action) => subscriptionDecision(mode, action),
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const value = useContext(SubscriptionContext);
  if (!value) throw new Error("useSubscription must be used inside SubscriptionProvider");
  return value;
}

/** Floating subscription notice for screens outside the app shell. Test switch: development inspector. */
export function SubscriptionChrome() {
  const { mode } = useSubscription();
  return mode !== "active" ? <SubscriptionBanner mode={mode} /> : null;
}

export function SubscriptionBanner({ mode }: { mode: Exclude<SubscriptionMode, "active"> }) {
  const content = {
    grace: {
      icon: CalendarClock,
      title: "Grace period · আর ১৪ দিন",
      message: "সব কাজ স্বাভাবিকভাবে চলছে। ১৪ দিনের মধ্যে নবায়ন করুন।",
    },
    limited: {
      icon: ShieldAlert,
      title: "Limited mode · ৩০ দিন",
      message: "চলমান কাজ চালু আছে; নতুন ভর্তি, ব্যবহারকারী, শাখা ও প্রচারণামূলক SMS বন্ধ।",
    },
    suspended: {
      icon: LockKeyhole,
      title: "সাবস্ক্রিপশন স্থগিত",
      message: "এখন শুধু তথ্য দেখা ও Export করা যাবে।",
    },
  }[mode];
  const Icon = content.icon;
  return (
    <aside className={`subscription-banner ${mode}`} role="status">
      <Icon size={18} />
      <span>
        <b>{content.title}</b>
        <small>{content.message}</small>
      </span>
    </aside>
  );
}

export function BlockedActionNotice({
  action,
  compact = false,
}: {
  action: SubscriptionAction;
  compact?: boolean;
}) {
  const { decision } = useSubscription();
  const result = decision(action);
  if (result.allowed) return null;
  return (
    <div className={`blocked-action ${compact ? "compact" : ""}`}>
      <LockKeyhole size={16} />
      <span>
        <b>{result.reason}</b>
        <small>{result.contact}</small>
      </span>
    </div>
  );
}

export default function SystemStatesReview() {
  const { mode, setMode, decision } = useSubscription();
  const limitedActions: Array<[SubscriptionAction, string]> = [
    ["view", "তথ্য দেখা"],
    ["export", "Export"],
    ["attendance", "হাজিরা"],
    ["sabak", "সবক"],
    ["homework", "হোমওয়ার্ক"],
    ["monthly-invoice-existing", "বর্তমান শিক্ষার্থীর মাসিক invoice"],
    ["collect-existing-invoice", "বর্তমান invoice-এর পেমেন্ট"],
    ["receipt", "রসিদ"],
    ["transactional-message", "লেনদেনের বার্তা"],
    ["emergency-message", "জরুরি বার্তা"],
    ["new-enquiry", "নতুন enquiry"],
    ["new-admission", "নতুন ভর্তি"],
    ["new-user", "নতুন ব্যবহারকারী"],
    ["new-branch", "নতুন শাখা"],
    ["bulk-promotional-message", "প্রচারণামূলক bulk SMS"],
  ];
  return (
    <main className="states-review">
      <header>
        <div>
          <span>B16 · SYSTEM STATES PACK</span>
          <h1>সিস্টেম স্টেট ও সাবস্ক্রিপশন</h1>
          <p>সব স্ক্রিনে একই ভাষা, একই পরবর্তী পদক্ষেপ এবং বাস্তব permission enforcement।</p>
        </div>
        <label>
          Review mode
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value as SubscriptionMode)}
          >
            <option value="active">Active</option>
            <option value="grace">Grace</option>
            <option value="limited">Limited</option>
            <option value="suspended">Suspended</option>
          </select>
        </label>
      </header>
      <section className="states-section">
        <div className="states-title">
          <span>01</span>
          <div>
            <h2>Reusable states</h2>
            <p>সংক্ষিপ্ত বাংলা বার্তা ও একটি পরিষ্কার পরবর্তী কাজ।</p>
          </div>
        </div>
        <div className="states-grid">
          <SystemState kind="empty" onAction={() => {}} />
          <SystemState kind="loading" />
          <SystemState kind="error" onAction={() => {}} />
          <SystemState kind="offline" onAction={() => {}} />
          <SystemState kind="no-permission" onAction={() => {}} />
        </div>
      </section>
      <section className="states-section">
        <div className="states-title">
          <span>02</span>
          <div>
            <h2>Subscription banners</h2>
            <p>Grace, Limited ও Suspended-এর স্পষ্ট প্রভাব।</p>
          </div>
        </div>
        <div className="banner-review">
          <SubscriptionBanner mode="grace" />
          <SubscriptionBanner mode="limited" />
          <SubscriptionBanner mode="suspended" />
        </div>
      </section>
      <section className="states-section">
        <div className="states-title">
          <span>03</span>
          <div>
            <h2>Limited mode enforcement</h2>
            <p>অনুমোদিত কাজ সবুজ; বন্ধ কাজের সঙ্গে কারণ ও যোগাযোগ দেখানো হয়।</p>
          </div>
        </div>
        <div className="access-matrix">
          {limitedActions.map(([action, label]) => {
            const result = subscriptionDecision("limited", action);
            return (
              <article key={action} className={result.allowed ? "allowed" : "blocked"}>
                {result.allowed ? <CheckCircle2 size={17} /> : <LockKeyhole size={17} />}
                <span>
                  <b>{label}</b>
                  <small>{result.allowed ? "চালু থাকবে" : `${result.reason} ${result.contact}`}</small>
                </span>
              </article>
            );
          })}
        </div>
        {mode !== "active" && !decision("new-admission").allowed && (
          <BlockedActionNotice action="new-admission" />
        )}
      </section>
      <section className="suspended-summary">
        <Eye size={20} />
        <span>
          <b>Suspended mode</b>
          <small>View ও Export চালু; অন্য সব mutation বন্ধ।</small>
        </span>
        <button className="ds-button secondary">
          <Download size={15} /> Export
        </button>
      </section>
    </main>
  );
}
