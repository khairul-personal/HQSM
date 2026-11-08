import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeftRight,
  Banknote,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  CreditCard,
  FileCheck2,
  History,
  LoaderCircle,
  LockKeyhole,
  Printer,
  QrCode,
  ReceiptText,
  RotateCcw,
  Search,
  ShieldAlert,
  UserRound,
  WalletCards,
  WifiOff,
  X,
} from "lucide-react";
import { prototypeRoles, resolveFeePermission, type PrototypeRole } from "./student-permissions";
import { BlockedActionNotice, SystemState, useSubscription } from "./SystemStates";
import "./fee-collection.css";

const bn = (value: number | string) =>
  String(value).replace(/\d/g, (digit) => "০১২৩৪৫৬৭৮৯"[Number(digit)]);
const money = (value: number) => new Intl.NumberFormat("bn-BD").format(value);

type Method = "cash" | "wallet" | "bank" | "fund";
type DeskState = "ready" | "loading" | "offline";
type Invoice = {
  id: string;
  period: string;
  age: "০–৩০ দিন" | "৩১–৬০ দিন" | "৬০+ দিন";
  overdue?: boolean;
  lines: {
    head: string;
    charge: number;
    waiver: number;
    fund: number;
    paid: number;
    due: number;
  }[];
};

const invoices: Invoice[] = [
  {
    id: "INV-2026-0318",
    period: "জানুয়ারি ২০২৬",
    age: "৬০+ দিন",
    overdue: true,
    lines: [
      {
        head: "মাসিক ফি",
        charge: 1000,
        waiver: 100,
        fund: 0,
        paid: 600,
        due: 300,
      },
    ],
  },
  {
    id: "INV-2026-0412",
    period: "ফেব্রুয়ারি ২০২৬",
    age: "৩১–৬০ দিন",
    overdue: true,
    lines: [
      {
        head: "মাসিক ফি",
        charge: 1200,
        waiver: 0,
        fund: 900,
        paid: 0,
        due: 300,
      },
    ],
  },
];

const recentStudents = [
  {
    id: "STU-10241",
    name: "মুহাম্মদ আব্দুল্লাহ",
    meta: "হিফজ · ক · রোল ৪",
    initials: "মআ",
    due: 600,
  },
  {
    id: "STU-10240",
    name: "ফাতিমা তুয যাহরা",
    meta: "নূরানী · খ · রোল ১২",
    initials: "ফয",
    due: 0,
  },
  {
    id: "STU-10239",
    name: "আহমাদ বিন হাসান",
    meta: "মিশকাত · ক · রোল ৭",
    initials: "আহ",
    due: 4000,
  },
];

function InvoiceCard({
  invoice,
  allocation,
  manual,
  onAllocation,
}: {
  invoice: Invoice;
  allocation: number;
  manual: boolean;
  onAllocation: (value: number) => void;
}) {
  const due = invoice.lines.reduce((sum, line) => sum + line.due, 0);
  return (
    <article className="fee-invoice">
      <header>
        <div>
          <code>{invoice.id}</code>
          <b>{invoice.period}</b>
        </div>
        <span className={`ds-badge fee-age ${invoice.overdue ? "danger overdue" : "neutral"}`}>
          {invoice.overdue && <AlertCircle size={13} />} {invoice.age}
        </span>
      </header>
      <div className="fee-line-head">
        <span>ফি হেড</span>
        <span>চার্জ</span>
        <span>ছাড়</span>
        <span>ফান্ড</span>
        <span>আদায়</span>
        <span>বকেয়া</span>
      </div>
      {invoice.lines.map((line) => (
        <div className="fee-line" key={line.head}>
          <b>{line.head}</b>
          <span>৳ {money(line.charge)}</span>
          <span>− ৳ {money(line.waiver)}</span>
          <span className={line.fund ? "fund" : ""}>৳ {money(line.fund)}</span>
          <span>৳ {money(line.paid)}</span>
          <strong>৳ {money(line.due)}</strong>
        </div>
      ))}
      <footer>
        <span>এই ইনভয়েসে পরিশোধ</span>
        <label>
          <span>৳</span>
          <input
            aria-label={`${invoice.id} বরাদ্দ`}
            type="number"
            min={0}
            max={due}
            value={allocation}
            onChange={(event) =>
              onAllocation(Math.min(due, Math.max(0, Number(event.target.value))))
            }
          />
        </label>
        {manual && <em className="ds-badge info">ম্যানুয়াল</em>}
      </footer>
    </article>
  );
}

function Receipt({
  thermal,
  reprint,
  onClose,
  onThermal,
  onReprint,
}: {
  thermal: boolean;
  reprint: boolean;
  onClose: () => void;
  onThermal: (value: boolean) => void;
  onReprint: () => void;
}) {
  return (
    <div className="fee-modal-backdrop">
      <section
        className="receipt-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-title"
      >
        <header className="receipt-toolbar">
          <div>
            <span className="fee-icon">
              <ReceiptText size={18} />
            </span>
            <div>
              <small>রসিদ তৈরি হয়েছে</small>
              <b id="receipt-title">RCPT-2026-004821</b>
            </div>
          </div>
          <div className="receipt-formats" aria-label="রসিদের ফরম্যাট">
            <button className={!thermal ? "active" : ""} onClick={() => onThermal(false)}>
              A4
            </button>
            <button className={thermal ? "active" : ""} onClick={() => onThermal(true)}>
              80mm
            </button>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="বন্ধ করুন">
            <X size={20} />
          </button>
        </header>
        <div className="receipt-stage">
          <article className={`receipt-paper ${thermal ? "thermal" : ""}`}>
            {reprint && <div className="reprint-watermark">পুনর্মুদ্রণ</div>}
            <header>
              <span className="receipt-logo">HQ</span>
              <div>
                <h2>হলি কুরআন স্কুল এন্ড মাদরাসা</h2>
                <p>প্রধান শাখা · ঢাকা, বাংলাদেশ</p>
              </div>
            </header>
            <div className="receipt-title">
              <h3>অর্থ গ্রহণের রসিদ</h3>
              <span>প্রতিষ্ঠান কপি</span>
            </div>
            <dl className="receipt-meta">
              <div>
                <dt>রসিদ নম্বর</dt>
                <dd>RCPT-2026-004821</dd>
              </div>
              <div>
                <dt>তারিখ</dt>
                <dd>১৪৪৭ শাওয়াল ০৮ · ২৬ মার্চ ২০২৬</dd>
              </div>
              <div>
                <dt>শিক্ষার্থী</dt>
                <dd>মুহাম্মদ আব্দুল্লাহ · STU-10241</dd>
              </div>
              <div>
                <dt>শ্রেণি</dt>
                <dd>হিফজ · ক · রোল ৪</dd>
              </div>
            </dl>
            <div className="receipt-lines">
              <div className="receipt-line header">
                <span>বিবরণ</span>
                <span>পরিমাণ</span>
              </div>
              <div className="receipt-line">
                <span>
                  জানুয়ারি ২০২৬ · মাসিক ফি<small>INV-2026-0318</small>
                </span>
                <b>৳ ৩০০</b>
              </div>
              <div className="receipt-line">
                <span>
                  ফেব্রুয়ারি ২০২৬ · মাসিক ফি
                  <small>
                    INV-2026-0412 · <em>ফান্ড থেকে পরিশোধিত ৳ ৯০০</em>
                  </small>
                </span>
                <b>৳ ৩০০</b>
              </div>
            </div>
            <div className="receipt-total">
              <span>মোট গ্রহণ</span>
              <strong>৳ ৬০০</strong>
              <small>কথায়: ছয় শত টাকা মাত্র</small>
            </div>
            <dl className="receipt-summary">
              <div>
                <dt>পদ্ধতি</dt>
                <dd>নগদ</dd>
              </div>
              <div>
                <dt>অবশিষ্ট বকেয়া</dt>
                <dd>৳ ০</dd>
              </div>
              <div>
                <dt>হিসাবরক্ষক</dt>
                <dd>রাশেদ আহমেদ</dd>
              </div>
            </dl>
            <footer>
              <div className="receipt-qr">
                <QrCode size={thermal ? 54 : 64} />
              </div>
              <p>
                রসিদটি যাচাই করতে QR কোড স্ক্যান করুন
                <br />
                <span>verify.hqschool.edu/r/004821</span>
              </p>
            </footer>
          </article>
        </div>
        <footer className="receipt-actions">
          <button className="ds-button secondary" onClick={onReprint}>
            <History size={16} /> পুনর্মুদ্রণ
          </button>
          <button className="ds-button primary" onClick={() => window.print()}>
            <Printer size={16} /> প্রিন্ট করুন
          </button>
        </footer>
      </section>
    </div>
  );
}

export default function FeeCollection({ role }: { role: PrototypeRole }) {
  const { decision: subscriptionAccess } = useSubscription();
  const collectAccess = subscriptionAccess("collect-existing-invoice");
  const permission = resolveFeePermission(prototypeRoles[role].context);
  const [deskState, setDeskState] = useState<DeskState>("ready");
  const [studentIndex, setStudentIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [amount, setAmount] = useState(600);
  const [manual, setManual] = useState<Record<string, number>>({});
  const [method, setMethod] = useState<Method>("cash");
  const [reference, setReference] = useState("");
  const [tendered, setTendered] = useState(1000);
  const [review, setReview] = useState(false);
  const [receipt, setReceipt] = useState(false);
  const [thermal, setThermal] = useState(false);
  const [reprint, setReprint] = useState(false);
  const [posted, setPosted] = useState(false);
  const [pending, setPending] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [counted, setCounted] = useState(600);
  const [closeSubmitted, setCloseSubmitted] = useState(false);
  const [reverseOpen, setReverseOpen] = useState(false);
  const [reverseReason, setReverseReason] = useState("");
  const [reversed, setReversed] = useState(false);

  const selected = recentStudents[studentIndex];
  const allocations = useMemo(() => {
    let remaining = amount;
    const auto: Record<string, number> = {};
    invoices.forEach((invoice) => {
      const due = invoice.lines.reduce((sum, line) => sum + line.due, 0);
      auto[invoice.id] = Math.min(due, remaining);
      remaining -= auto[invoice.id];
    });
    return { ...auto, ...manual };
  }, [amount, manual]);
  const allocated = Object.values(allocations).reduce((sum, value) => sum + value, 0);
  const advance = Math.max(0, amount - allocated);
  const needsReference = method === "wallet" || method === "bank";
  const canPost =
    collectAccess.allowed &&
    deskState === "ready" &&
    amount > 0 &&
    (!needsReference || reference.trim().length > 0);
  const financeLead = permission.canPostFundAllocation;
  const fundAllowed = permission.canPostFundAllocation && studentIndex === 0;
  const matches = recentStudents.filter((student) =>
    `${student.name} ${student.id} ${student.meta} RCPT-2026-004821`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  if (permission.feeDesk === "hidden") {
    return (
      <main className="fee-main">
        <SystemState
          kind="no-permission"
          title="ফি সংগ্রহের অনুমতি নেই"
          message="এই ডেস্ক ব্যবহার করতে হিসাবরক্ষক বা Finance Lead ভূমিকা প্রয়োজন।"
        />
      </main>
    );
  }

  if (deskState === "loading") {
    return (
      <main className="fee-main">
        <SystemState
          kind="loading"
          title="ফি তথ্য লোড হচ্ছে"
          message="ইনভয়েস ও সর্বশেষ পেমেন্ট মিলিয়ে দেখা হচ্ছে…"
        />
      </main>
    );
  }

  return (
    <main className="fee-main">
      <section className="fee-page-head">
        <div>
          <p>
            অর্থ ও হিসাব <ChevronLeft size={13} /> S20
          </p>
          <h1>ফি সংগ্রহ ডেস্ক</h1>
          <span>বকেয়া পর্যালোচনা, পেমেন্ট গ্রহণ ও রসিদ</span>
        </div>
        <div className="fee-head-actions">
          <label className="state-switcher fee-demo-state">
            ডেমো
            <select
              value={deskState}
              onChange={(event) => setDeskState(event.target.value as DeskState)}
            >
              <option value="ready">অনলাইন</option>
              <option value="loading">Loading</option>
              <option value="offline">Offline</option>
            </select>
          </label>
          <button className="ds-button secondary" onClick={() => setCloseOpen(true)}>
            <LockKeyhole size={15} /> ক্যাশিয়ার ক্লোজ
          </button>
        </div>
      </section>
      {!collectAccess.allowed && <BlockedActionNotice action="collect-existing-invoice" compact />}

      {deskState === "offline" && (
        <div className="fee-offline" role="alert">
          <WifiOff size={18} />
          <div>
            <b>আপনি অফলাইনে আছেন — পেমেন্ট পোস্ট করা যাবে না</b>
            <span>পেমেন্ট অফলাইনে সারিতে রাখা হয় না। সংযোগ ফিরলে আবার চেষ্টা করুন।</span>
          </div>
        </div>
      )}

      <section className="fee-search-zone">
        <label className="fee-search">
          <Search size={20} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="নাম, শিক্ষার্থী ID, রোল বা রসিদ নম্বর"
          />
          <kbd>⌘ K</kbd>
        </label>
        <div className="fee-recents">
          <span>সাম্প্রতিক</span>
          {matches.map((student, index) => (
            <button
              key={student.id}
              className={selected.id === student.id ? "active" : ""}
              onClick={() => {
                const nextIndex = recentStudents.indexOf(student);
                setStudentIndex(nextIndex);
                if (nextIndex !== 0 && method === "fund") setMethod("cash");
                setQuery("");
              }}
            >
              <i>{student.initials}</i>
              <span>
                <b>{student.name}</b>
                <small>{student.id}</small>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="fee-student-head">
        <div className="fee-avatar">{selected.initials}</div>
        <div>
          <h2>{selected.name}</h2>
          <p>
            {selected.id} <i /> {selected.meta}
          </p>
        </div>
        {studentIndex === 0 && (
          <span className="sponsor-badge">
            <CheckCircle2 size={14} /> অনুমোদিত যাকাত স্পন্সরশিপ · ৭৫%
          </span>
        )}
        <button
          className="ds-button secondary student-receipt-link"
          onClick={() => setReceipt(true)}
        >
          <ReceiptText size={14} /> সর্বশেষ রসিদ
        </button>
        <div className="student-due">
          <small>মোট বকেয়া</small>
          <strong>৳ {money(selected.due)}</strong>
        </div>
      </section>

      {selected.due === 0 ? (
        <section className="fee-no-dues">
          <CheckCircle2 size={28} />
          <h2>কোনো বকেয়া নেই</h2>
          <p>
            এই শিক্ষার্থীর অগ্রিম ব্যালেন্স: <b>৳ ২০০</b>
          </p>
        </section>
      ) : (
        <div className="fee-work-grid">
          <section className="fee-invoices-panel">
            <header className="fee-section-title">
              <div>
                <h2>বকেয়া ইনভয়েস</h2>
                <p>পুরোনো ইনভয়েস আগে স্বয়ংক্রিয়ভাবে বরাদ্দ হবে</p>
              </div>
              <span>{bn(invoices.length)}টি</span>
            </header>
            {invoices.map((invoice) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                allocation={allocations[invoice.id] ?? 0}
                manual={invoice.id in manual}
                onAllocation={(value) => setManual((old) => ({ ...old, [invoice.id]: value }))}
              />
            ))}
          </section>

          <aside className="payment-card">
            <header>
              <span className="fee-icon">
                <WalletCards size={19} />
              </span>
              <div>
                <h2>পেমেন্ট এন্ট্রি</h2>
                <p>প্রাপ্ত অর্থ ও পদ্ধতি</p>
              </div>
            </header>
            <label className="amount-field">
              <span>প্রাপ্ত পরিমাণ</span>
              <div>
                <b>৳</b>
                <input
                  type="number"
                  min={0}
                  value={amount}
                  onChange={(event) => setAmount(Math.max(0, Number(event.target.value)))}
                />
              </div>
            </label>
            <div className="allocation-note">
              <ArrowLeftRight size={15} />
              <span>
                <b>৳ {money(allocated)}</b> ইনভয়েসে বরাদ্দ
              </span>
            </div>
            {advance > 0 && (
              <div className="advance-note">
                <CreditCard size={16} />
                <span>
                  <b>৳ {money(advance)} অগ্রিম ক্রেডিট</b>
                  <small>শুধু {selected.name}-এর হিসাবে থাকবে; ভাই/বোনের হিসাবে নয়</small>
                </span>
              </div>
            )}
            <fieldset className="method-options">
              <legend>পেমেন্ট পদ্ধতি</legend>
              <label className={method === "cash" ? "active" : ""}>
                <input
                  type="radio"
                  name="method"
                  checked={method === "cash"}
                  onChange={() => setMethod("cash")}
                />
                <Banknote size={17} />
                <span>নগদ</span>
              </label>
              <label className={method === "wallet" ? "active" : ""}>
                <input
                  type="radio"
                  name="method"
                  checked={method === "wallet"}
                  onChange={() => setMethod("wallet")}
                />
                <CreditCard size={17} />
                <span>
                  bKash / Nagad / Rocket<small>যাচাই বাকি থাকবে</small>
                </span>
              </label>
              <label className={method === "bank" ? "active" : ""}>
                <input
                  type="radio"
                  name="method"
                  checked={method === "bank"}
                  onChange={() => setMethod("bank")}
                />
                <FileCheck2 size={17} />
                <span>ব্যাংক</span>
              </label>
              <label
                className={`${method === "fund" ? "active" : ""} ${!fundAllowed ? "disabled" : ""}`}
              >
                <input
                  type="radio"
                  name="method"
                  disabled={!fundAllowed}
                  checked={method === "fund"}
                  onChange={() => setMethod("fund")}
                />
                <ShieldAlert size={17} />
                <span>
                  ফান্ড বরাদ্দ
                  <small>
                    {!financeLead
                      ? "শুধু Finance Lead"
                      : fundAllowed
                        ? "অনুমোদিত স্পন্সরশিপ"
                        : "অনুমোদিত স্পন্সরশিপ নেই"}
                  </small>
                </span>
              </label>
            </fieldset>
            {needsReference && (
              <label className="reference-field">
                <span>
                  লেনদেন রেফারেন্স <b>*</b>
                </span>
                <input
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  placeholder={method === "wallet" ? "যেমন: 9F7A2K1" : "ব্যাংক রেফারেন্স"}
                />
              </label>
            )}
            {method === "wallet" && (
              <div className="pending-note">
                <Clock3 size={15} /> যাচাই না হওয়া পর্যন্ত এটি পরিশোধিত হিসেবে গণ্য হবে না
              </div>
            )}
            {method === "cash" && (
              <div className="cash-grid">
                <label>
                  <span>প্রদত্ত নগদ</span>
                  <input
                    type="number"
                    value={tendered}
                    onChange={(event) => setTendered(Number(event.target.value))}
                  />
                </label>
                <div>
                  <span>ফেরত</span>
                  <b>৳ {money(Math.max(0, tendered - amount))}</b>
                </div>
              </div>
            )}
            <button
              className="ds-button primary fee-review-button desktop-posting"
              disabled={!canPost}
              onClick={() => setReview(true)}
            >
              পর্যালোচনা ও পোস্ট <ChevronLeft size={16} />
            </button>
            <div className="mobile-readonly">
              <LockKeyhole size={15} /> মোবাইলে পেমেন্ট পোস্ট করা যায় না
            </div>
          </aside>
        </div>
      )}

      <section className="pending-payments">
        <header>
          <div>
            <h2>যাচাই বাকি পেমেন্ট</h2>
            <p>যাচাই না হওয়া পর্যন্ত ইনভয়েসে আদায় দেখাবে না</p>
          </div>
          <span>{pending ? "২" : "১"}</span>
        </header>
        <div>
          <span className="ds-badge info pending-method">bKash</span>
          <b>TRX-8K29P4</b>
          <span>ফাতিমা তুয যাহরা</span>
          <strong>৳ ২,৫০০</strong>
          <em className="ds-badge warning">
            <Clock3 size={13} /> যাচাই বাকি
          </em>
        </div>
        {pending && (
          <div>
            <span className="ds-badge info pending-method">Wallet</span>
            <b>{reference}</b>
            <span>{selected.name}</span>
            <strong>৳ {money(amount)}</strong>
            <em className="ds-badge warning">
              <Clock3 size={13} /> যাচাই বাকি
            </em>
          </div>
        )}
      </section>

      {review && (
        <div className="fee-modal-backdrop">
          <section
            className="review-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-title"
          >
            <header>
              <span className="fee-icon">
                <FileCheck2 size={19} />
              </span>
              <div>
                <small>পোস্ট করার আগে</small>
                <h2 id="review-title">পেমেন্ট পর্যালোচনা</h2>
              </div>
              <button className="icon-button" onClick={() => setReview(false)} aria-label="বন্ধ করুন">
                <X size={20} />
              </button>
            </header>
            <div className="review-student">
              <UserRound size={17} />
              <span>
                <b>{selected.name}</b>
                <small>{selected.id}</small>
              </span>
            </div>
            <div className="review-lines">
              {invoices.map((invoice) => (
                <div key={invoice.id}>
                  <span>
                    {invoice.period}
                    <small>{invoice.id}</small>
                  </span>
                  <b>৳ {money(allocations[invoice.id] ?? 0)}</b>
                </div>
              ))}
              {advance > 0 && (
                <div className="advance">
                  <span>
                    অগ্রিম ক্রেডিট<small>শুধু এই শিক্ষার্থী</small>
                  </span>
                  <b>৳ {money(advance)}</b>
                </div>
              )}
            </div>
            <dl>
              <div>
                <dt>মোট প্রাপ্তি</dt>
                <dd>৳ {money(amount)}</dd>
              </div>
              <div>
                <dt>পদ্ধতি</dt>
                <dd>
                  {method === "cash"
                    ? "নগদ"
                    : method === "wallet"
                      ? "মোবাইল ওয়ালেট"
                      : method === "bank"
                        ? "ব্যাংক"
                        : "ফান্ড বরাদ্দ"}
                </dd>
              </div>
            </dl>
            {posted && (
              <div className="existing-receipt">
                <CheckCircle2 size={16} /> এই পেমেন্ট ইতিমধ্যে পোস্ট হয়েছে। বিদ্যমান রসিদ
                RCPT-2026-004821 দেখানো হচ্ছে।
              </div>
            )}
            <footer>
              <button className="ds-button secondary" onClick={() => setReview(false)}>
                ফিরে যান
              </button>
              <button
                className="ds-button primary"
                disabled={deskState === "offline"}
                onClick={() => {
                  if (posted) {
                    setReview(false);
                    setReceipt(true);
                    return;
                  }
                  if (method === "wallet") {
                    setPending(true);
                    setReview(false);
                    return;
                  }
                  setPosted(true);
                  setReview(false);
                  setReceipt(true);
                }}
              >
                <Check size={16} />{" "}
                {posted
                  ? "বিদ্যমান রসিদ দেখুন"
                  : method === "wallet"
                    ? "যাচাইয়ের জন্য পাঠান"
                    : "পোস্ট ও রসিদ তৈরি"}
              </button>
            </footer>
          </section>
        </div>
      )}

      {receipt && (
        <Receipt
          thermal={thermal}
          reprint={reprint}
          onClose={() => setReceipt(false)}
          onThermal={setThermal}
          onReprint={() => setReprint(true)}
        />
      )}

      {posted && !receipt && (
        <section className="posted-actions">
          <div>
            <CheckCircle2 size={18} />
            <span>
              <b>RCPT-2026-004821 পোস্ট হয়েছে</b>
              <small>একটি পেমেন্ট ও একটি রসিদ তৈরি হয়েছে</small>
            </span>
          </div>
          <button className="ds-button secondary" onClick={() => setReceipt(true)}>
            <ReceiptText size={15} /> রসিদ দেখুন
          </button>
          <button className="ds-button danger" onClick={() => setReverseOpen(true)}>
            <RotateCcw size={15} /> Reverse
          </button>
        </section>
      )}

      {reverseOpen && (
        <div className="fee-modal-backdrop">
          <section className="reverse-modal" role="dialog" aria-modal="true">
            <header>
              <span className="fee-icon danger">
                <RotateCcw size={18} />
              </span>
              <div>
                <small>রসিদ মোছা যাবে না</small>
                <h2>পেমেন্ট Reverse</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setReverseOpen(false)}
                aria-label="বন্ধ করুন"
              >
                <X size={20} />
              </button>
            </header>
            <div className="before-after">
              <div>
                <span>আগে</span>
                <b>বকেয়া ৳ ০</b>
              </div>
              <ArrowLeftRight size={18} />
              <div>
                <span>পরে</span>
                <b>বকেয়া ৳ ৬০০</b>
              </div>
            </div>
            <label>
              <span>Reverse করার কারণ *</span>
              <textarea
                value={reverseReason}
                onChange={(event) => setReverseReason(event.target.value)}
                placeholder="কারণ বিস্তারিত লিখুন"
              />
            </label>
            <div className="approval-note">
              <ShieldAlert size={15} /> Finance Lead অনুমোদনের পর বকেয়া পুনরায় খুলবে
            </div>
            {reversed && (
              <div className="existing-receipt">
                অনুমোদনের জন্য পাঠানো হয়েছে। মূল রসিদ অডিট ট্রেইলে থাকবে।
              </div>
            )}
            <footer>
              <button className="ds-button secondary" onClick={() => setReverseOpen(false)}>
                বাতিল
              </button>
              <button
                className="ds-button danger"
                disabled={!reverseReason.trim()}
                onClick={() => setReversed(true)}
              >
                অনুমোদনের জন্য পাঠান
              </button>
            </footer>
          </section>
        </div>
      )}

      {closeOpen && (
        <div className="fee-modal-backdrop">
          <section className="close-modal" role="dialog" aria-modal="true">
            <header>
              <span className="fee-icon">
                <LockKeyhole size={18} />
              </span>
              <div>
                <small>২৬ মার্চ ২০২৬ · Day shift</small>
                <h2>ক্যাশিয়ার ক্লোজ</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setCloseOpen(false)}
                aria-label="বন্ধ করুন"
              >
                <X size={20} />
              </button>
            </header>
            <div className="close-methods">
              <div>
                <span>নগদ প্রত্যাশিত</span>
                <b>৳ ৬০০</b>
              </div>
              <div>
                <span>ডিজিটাল · যাচাইকৃত</span>
                <b>৳ ০</b>
              </div>
              <div>
                <span>ব্যাংক</span>
                <b>৳ ০</b>
              </div>
            </div>
            <label className="amount-field">
              <span>গণনাকৃত নগদ</span>
              <div>
                <b>৳</b>
                <input
                  type="number"
                  value={counted}
                  onChange={(event) => setCounted(Number(event.target.value))}
                />
              </div>
            </label>
            <div className={`variance ${counted !== 600 ? "warning" : ""}`}>
              <span>পার্থক্য</span>
              <b>
                {counted - 600 >= 0 ? "+" : "−"} ৳ {money(Math.abs(counted - 600))}
              </b>
            </div>
            {closeSubmitted && (
              <div className="existing-receipt">
                <CheckCircle2 size={15} /> Finance Lead-এর পর্যালোচনার জন্য জমা হয়েছে
              </div>
            )}
            <footer>
              <button className="ds-button secondary" onClick={() => setCloseOpen(false)}>
                বন্ধ করুন
              </button>
              <button className="ds-button primary" onClick={() => setCloseSubmitted(true)}>
                পর্যালোচনার জন্য জমা দিন
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}
