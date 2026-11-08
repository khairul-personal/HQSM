import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  Download,
  FileCheck2,
  Filter,
  HandCoins,
  History,
  LoaderCircle,
  LockKeyhole,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  WalletCards,
  WifiOff,
  X,
} from "lucide-react";
import {
  prototypeRoles,
  resolveSponsorshipPermission,
  type PrototypeRole,
} from "./student-permissions";
import { canBulkApprove, checkAllocation, type AllocationRequest } from "./sponsorship-domain";
import { SystemState } from "./SystemStates";
import "./sponsorship-funds.css";
import { useInstitutionSettings } from "./InstitutionSettingsContext";

type Tab = "overview" | "sponsorships" | "approvals" | "statement";
type DemoState = "ready" | "loading" | "empty" | "offline" | "denied";

const money = (value: number) => `৳${new Intl.NumberFormat("bn-BD").format(value)}`;
const taka = (value: number) => value * 100;

const funds = [
  {
    id: "zakat",
    name: "যাকাত",
    balance: 184500,
    income: 92000,
    allocations: 47000,
    expenses: 12500,
    pledge: 35000,
    rule: "শুধু অনুমোদিত যোগ্য শিক্ষার্থীর টিউশন ও খাবার ফি",
  },
  {
    id: "boarding",
    name: "লিল্লাহ বোর্ডিং",
    balance: 128200,
    income: 58000,
    allocations: 31500,
    expenses: 18300,
    pledge: 12000,
    rule: "আবাসিক শিক্ষার্থীর খাবার, বিছানা ও বোর্ডিং ব্যয়",
  },
  {
    id: "orphan",
    name: "এতিম",
    balance: 96300,
    income: 42000,
    allocations: 28000,
    expenses: 8400,
    pledge: 18000,
    rule: "যাচাইকৃত এতিম শিক্ষার্থীর শিক্ষা ও জীবনযাপন ব্যয়",
  },
  {
    id: "general",
    name: "সাধারণ",
    balance: 224800,
    income: 76000,
    allocations: 19500,
    expenses: 32600,
    pledge: 25000,
    rule: "প্রতিষ্ঠানের অনুমোদিত সাধারণ শিক্ষা ও পরিচালন ব্যয়",
  },
  {
    id: "construction",
    name: "নির্মাণ",
    balance: 412000,
    income: 145000,
    allocations: 0,
    expenses: 84000,
    pledge: 90000,
    rule: "শুধু ভবন নির্মাণ, মেরামত ও স্থায়ী অবকাঠামো",
  },
];

const sponsorships = [
  {
    id: "SP-2026-018",
    student: "মুহাম্মদ আব্দুল্লাহ",
    initials: "মআ",
    source: "যাকাত ফান্ড",
    heads: "টিউশন, খাবার",
    coverage: "৭৫%",
    dates: "০১ জানু — ৩১ ডিসে ২০২৬",
    status: "সক্রিয়",
    approver: "সাদিয়া রহমান",
    category: "ফকির / মিসকিন",
    proof: "অভিভাবকের আয় সনদ · যাচাইকৃত",
  },
  {
    id: "SP-2026-017",
    student: "মারইয়াম বিনতে আলী",
    initials: "মা",
    source: "রহমান পরিবার",
    heads: "টিউশন",
    coverage: "সম্পূর্ণ",
    dates: "০১ জানু — ১৮ জুন ২০২৬",
    status: "মেয়াদ শেষের পথে",
    approver: "সাদিয়া রহমান",
    category: "এতিম",
    proof: "মৃত্যু সনদ · যাচাইকৃত",
  },
  {
    id: "SP-2025-044",
    student: "উমর ফারুক",
    initials: "উফ",
    source: "এতিম ফান্ড",
    heads: "টিউশন, বই",
    coverage: money(1500),
    dates: "০১ জুলাই ২০২৫ — ৩১ মে ২০২৬",
    status: "মেয়াদোত্তীর্ণ",
    approver: "মো. আজিজুল",
    category: "এতিম",
    proof: "মৃত্যু সনদ · যাচাইকৃত",
  },
  {
    id: "SP-2026-011",
    student: "ফাতিমা তুয যাহরা",
    initials: "ফয",
    source: "লিল্লাহ বোর্ডিং",
    heads: "খাবার",
    coverage: "৫০%",
    dates: "০১ জানু — ৩১ ডিসে ২০২৬",
    status: "স্থগিত",
    approver: "সাদিয়া রহমান",
    category: "আর্থিক অসচ্ছল",
    proof: "স্থানীয় প্রত্যয়ন · পর্যালোচনাধীন",
  },
];

const fundForDomain = (id: string, balance: number, eligible: string[]) => ({
  id,
  balancePaisa: taka(balance),
  unpaidPledgesPaisa: 0,
  eligibleFeeHeads: eligible,
});

const initialAllocations: Array<
  AllocationRequest & { student: string; initials: string; result: string }
> = [
  {
    id: "ALC-1048",
    creatorId: "EMP-17",
    studentId: "STU-10241",
    student: "মুহাম্মদ আব্দুল্লাহ",
    initials: "মআ",
    invoiceId: "INV-2026-1842",
    feeHead: "টিউশন",
    amountPaisa: taka(900),
    fund: fundForDomain("যাকাত", 184500, ["টিউশন", "খাবার"]),
    sponsorship: { id: "SP-2026-018", endDate: "2026-12-31", status: "active" },
    result: "যোগ্যতা যাচাই হয়েছে",
  },
  {
    id: "ALC-1047",
    creatorId: "EMP-12",
    studentId: "STU-10240",
    student: "ফাতিমা তুয যাহরা",
    initials: "ফয",
    invoiceId: "INV-2026-1841",
    feeHead: "খাবার",
    amountPaisa: taka(1200),
    fund: fundForDomain("লিল্লাহ বোর্ডিং", 128200, ["খাবার", "বোর্ডিং"]),
    sponsorship: { id: "SP-2026-011", endDate: "2026-12-31", status: "active" },
    result: "যোগ্যতা যাচাই হয়েছে",
  },
  {
    id: "ALC-1046",
    creatorId: "EMP-14",
    studentId: "STU-10239",
    student: "আহমাদ বিন হাসান",
    initials: "আহ",
    invoiceId: "INV-2026-1838",
    feeHead: "টিউশন",
    amountPaisa: taka(900),
    fund: fundForDomain("যাকাত", 500, ["টিউশন", "খাবার"]),
    sponsorship: { id: "SP-2026-020", endDate: "2026-12-31", status: "active" },
    result: "অপর্যাপ্ত ফান্ড",
  },
  {
    id: "ALC-1045",
    creatorId: "EMP-11",
    studentId: "STU-10238",
    student: "মারইয়াম বিনতে আলী",
    initials: "মা",
    invoiceId: "INV-2026-1837",
    feeHead: "চিকিৎসা",
    amountPaisa: taka(2400),
    fund: fundForDomain("যাকাত", 184500, ["টিউশন", "খাবার"]),
    sponsorship: { id: "SP-2026-017", endDate: "2026-06-18", status: "active" },
    result: "ফান্ডের নিয়মের বাইরে",
  },
];

function StateScreen({
  state,
  onBack,
}: {
  state: Exclude<DemoState, "ready" | "offline">;
  onBack: () => void;
}) {
  return (
    <main className="sf-state">
      <SystemState
        kind={state === "denied" ? "no-permission" : state}
        title={
          state === "empty"
            ? "এখনও কোনো sponsorship নেই"
            : state === "loading"
              ? "ফান্ডের তথ্য লোড হচ্ছে"
              : "এই স্ক্রিনে প্রবেশের অনুমতি নেই"
        }
        message={
          state === "empty"
            ? "প্রথম sponsorship তৈরি করলে সেটি এখানে দেখা যাবে।"
            : state === "denied"
              ? "আপনার ভূমিকার জন্য sponsorship ও fund allocation বন্ধ রাখা হয়েছে।"
              : undefined
        }
        actionLabel={state === "denied" || state === "loading" ? "" : "ডেমোতে ফিরুন"}
        onAction={state === "empty" ? onBack : undefined}
      />
    </main>
  );
}

export default function SponsorshipFunds({ role }: { role: PrototypeRole }) {
  const { settings } = useInstitutionSettings();
  const permission = resolveSponsorshipPermission(prototypeRoles[role].context);
  const [tab, setTab] = useState<Tab>("overview");
  const [state, setState] = useState<DemoState>("ready");
  const [query, setQuery] = useState("");
  const [expiring, setExpiring] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<(typeof sponsorships)[number] | null>(
    null,
  );
  const [editing, setEditing] = useState(false);
  const [allocations, setAllocations] = useState(initialAllocations);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkPreview, setBulkPreview] = useState(false);
  const [sendBack, setSendBack] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState("");
  const actorRole = role;
  const actorId = role === "finance-lead" ? "EMP-FINANCE-1" : "EMP-MUHTAMIM-1";
  const options = { actorId, actorRole, today: "2026-06-05" };
  const effectiveAllocations = allocations.map((item) => ({
    ...item,
    fund: {
      ...item.fund,
      eligibleFeeHeads: settings.fundRules[item.fund.id] ?? [],
    },
  }));
  const bulkAllowed = canBulkApprove(
    selected.map((id) => effectiveAllocations.find((item) => item.id === id)!),
    options,
  );

  const visibleSponsors = useMemo(
    () =>
      sponsorships.filter((item) => {
        const matches = `${item.student} ${item.id} ${item.source} ${item.heads}`
          .toLowerCase()
          .includes(query.toLowerCase());
        return matches && (!expiring || item.status === "মেয়াদ শেষের পথে");
      }),
    [query, expiring],
  );

  if (permission.access === "hidden" || state === "denied")
    return <StateScreen state="denied" onBack={() => setState("ready")} />;
  if (state === "loading" || state === "empty")
    return <StateScreen state={state} onBack={() => setState("ready")} />;

  const approve = (item: (typeof allocations)[number], exceptionReason?: string) => {
    const result = checkAllocation(item, { ...options, exceptionReason });
    if (!result.ok) {
      setNotice(result.message);
      return;
    }
    setAllocations((current) => current.filter((allocation) => allocation.id !== item.id));
    setSelected((current) => current.filter((id) => id !== item.id));
    setNotice(
      result.exception
        ? "ব্যতিক্রম কারণসহ অনুমোদিত ও balanced journal posted হয়েছে"
        : "Allocation অনুমোদিত ও balanced journal posted হয়েছে",
    );
  };

  return (
    <main className="sf-main">
      <section className="sf-head">
        <div>
          <p>
            অর্থ ও হিসাব <ChevronLeft size={13} /> S21 · S22
          </p>
          <h1>স্পন্সরশিপ ও ফান্ড বরাদ্দ</h1>
          <span>Restricted fund-এর সঠিক ব্যবহার, approval ও student coverage</span>
        </div>
        <div className="sf-head-actions">
          <label>
            ডেমো{" "}
            <select value={state} onChange={(e) => setState(e.target.value as DemoState)}>
              <option value="ready">Ready</option>
              <option value="loading">Loading</option>
              <option value="empty">Empty</option>
              <option value="offline">Offline</option>
              <option value="denied">No permission</option>
            </select>
          </label>
          {permission.canManageSponsorships && (
            <button className="ds-button primary" onClick={() => setEditing(true)}>
              <Plus size={15} /> নতুন sponsorship
            </button>
          )}
        </div>
      </section>

      {state === "offline" && (
        <div className="sf-offline">
          <WifiOff size={18} />
          <div>
            <b>আপনি অফলাইনে আছেন</b>
            <span>ব্যালেন্স দেখা যাবে, কিন্তু কোনো approval বা পরিবর্তন করা যাবে না।</span>
          </div>
        </div>
      )}
      {notice && (
        <div className="sf-notice">
          <CheckCircle2 size={16} />
          {notice}
          <button onClick={() => setNotice("")}>
            <X size={14} />
          </button>
        </div>
      )}

      {permission.access !== "balances" && (
        <nav className="sf-tabs">
          {(
            [
              ["overview", "ফান্ড ওভারভিউ"],
              ["sponsorships", "Sponsorship তালিকা"],
              ["approvals", `Approval inbox · ${allocations.length}`],
              ["statement", "ফান্ড স্টেটমেন্ট"],
            ] as [Tab, string][]
          )
            .filter(([key]) => key !== "statement" || permission.canViewStatement)
            .map(([key, label]) => (
              <button key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}>
                {label}
              </button>
            ))}
        </nav>
      )}

      {(tab === "overview" || permission.access === "balances") && (
        <section>
          <div className="sf-section-title">
            <div>
              <h2>ফান্ডের সারসংক্ষেপ</h2>
              <p>প্রতিশ্রুত অনুদান বাদ দিয়ে ব্যবহারযোগ্য ব্যালেন্স</p>
            </div>
            <span className="sf-live">
              <i /> সর্বশেষ আপডেট ১০:৩২
            </span>
          </div>
          <div className="sf-fund-grid">
            {funds.map((fund, index) => (
              <article className="sf-fund-card" key={fund.id}>
                <header>
                  <span className={`sf-fund-icon tone-${index}`}>
                    <WalletCards size={17} />
                  </span>
                  <div>
                    <small>{fund.name} ফান্ড</small>
                    <strong>{money(fund.balance)}</strong>
                    <em>ব্যবহারযোগ্য ব্যালেন্স</em>
                  </div>
                </header>
                {permission.access !== "balances" && (
                  <div className="sf-fund-metrics">
                    <span>
                      এই মাসে আয় <b>+{money(fund.income)}</b>
                    </span>
                    <span>
                      বরাদ্দ <b>−{money(fund.allocations)}</b>
                    </span>
                    <span>
                      ব্যয় <b>−{money(fund.expenses)}</b>
                    </span>
                  </div>
                )}
                {permission.access !== "balances" && (
                  <>
                    <p>
                      <LockKeyhole size={12} /> {fund.rule}
                    </p>
                    <footer>
                      <span>অপরিশোধিত pledge</span>
                      <b>{money(fund.pledge)}</b>
                      <small>ব্যালেন্সে গণনা হয়নি</small>
                    </footer>
                  </>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {tab === "sponsorships" && permission.access !== "balances" && (
        <section>
          <div className="sf-toolbar">
            <label>
              <Search size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="শিক্ষার্থী, donor বা ID খুঁজুন"
              />
            </label>
            <button className={expiring ? "active" : ""} onClick={() => setExpiring(!expiring)}>
              <CalendarDays size={15} /> ১৫ দিনের মধ্যে মেয়াদ শেষ
            </button>
            <button>
              <Filter size={15} /> আরও ফিল্টার
            </button>
          </div>
          <div className="sf-table-wrap">
            <table className="sf-table">
              <thead>
                <tr>
                  <th>শিক্ষার্থী</th>
                  <th>উৎস</th>
                  <th>কভারেজ</th>
                  <th>মেয়াদ</th>
                  <th>স্ট্যাটাস</th>
                  <th>অনুমোদন</th>
                </tr>
              </thead>
              <tbody>
                {visibleSponsors.map((item) => (
                  <tr key={item.id} onClick={() => setSelectedSponsor(item)}>
                    <td>
                      <span className="ds-avatar small">{item.initials}</span>
                      <div>
                        <b>{item.student}</b>
                        <small>{item.id}</small>
                      </div>
                    </td>
                    <td>
                      <b>{item.source}</b>
                      <small>{item.heads}</small>
                    </td>
                    <td>
                      <b>{item.coverage}</b>
                      <small>Invoice fee head</small>
                    </td>
                    <td>{item.dates}</td>
                    <td>
                      <i
                        className={`sf-status ${item.status === "সক্রিয়" ? "ok" : item.status === "মেয়াদ শেষের পথে" ? "warn" : "muted"}`}
                      >
                        {item.status}
                      </i>
                    </td>
                    <td>
                      <b>{item.approver}</b>
                      <small>Finance approval</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "approvals" && permission.access !== "balances" && (
        <section>
          <div className="sf-section-title">
            <div>
              <h2>Allocation approval inbox</h2>
              <p>Invoice থেকে স্বয়ংক্রিয়ভাবে তৈরি pending request</p>
            </div>
            {selected.length > 0 && (
              <button
                className="ds-button secondary"
                disabled={!bulkAllowed || state === "offline"}
                onClick={() => setBulkPreview(true)}
              >
                <FileCheck2 size={15} /> {selected.length}টি Bulk preview
              </button>
            )}
          </div>
          <div className="sf-approval-list">
            {effectiveAllocations.map((item) => {
              const check = checkAllocation(item, options);
              const isException = !item.fund.eligibleFeeHeads.includes(item.feeHead);
              const before = item.fund.balancePaisa / 100;
              const after = Math.max(0, before - item.amountPaisa / 100);
              return (
                <article className={`sf-approval ${!check.ok ? "has-issue" : ""}`} key={item.id}>
                  <label className="sf-check">
                    <input
                      type="checkbox"
                      checked={selected.includes(item.id)}
                      disabled={!check.ok}
                      onChange={(e) =>
                        setSelected((current) =>
                          e.target.checked
                            ? [...current, item.id]
                            : current.filter((id) => id !== item.id),
                        )
                      }
                    />
                    <span />
                  </label>
                  <span className="ds-avatar small">{item.initials}</span>
                  <div className="sf-approval-main">
                    <header>
                      <div>
                        <h3>{item.student}</h3>
                        <p>
                          {item.invoiceId} · {item.feeHead}
                        </p>
                      </div>
                      <strong>{money(item.amountPaisa / 100)}</strong>
                    </header>
                    <div className="sf-impact">
                      <span>
                        ফান্ড <b>{item.fund.id}</b>
                      </span>
                      <span>
                        ব্যালেন্স <b>{money(before)}</b>
                        <ArrowRight size={13} />
                        <b className={(!check.ok && "danger") || ""}>{money(after)}</b>
                      </span>
                      <span className={check.ok ? "pass" : "fail"}>
                        {check.ok ? <Check size={13} /> : <AlertTriangle size={13} />}
                        {check.ok ? item.result : check.message}
                      </span>
                      {isException && <i>ব্যতিক্রম প্রয়োজন</i>}
                    </div>
                    {sendBack === item.id && (
                      <div className="sf-reason">
                        <textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="ফেরত পাঠানোর কারণ লিখুন (আবশ্যক)"
                        />
                        <button
                          className="ds-button primary"
                          disabled={!reason.trim()}
                          onClick={() => {
                            setAllocations((current) => current.filter((a) => a.id !== item.id));
                            setSendBack(null);
                            setReason("");
                            setNotice("কারণসহ অনুরোধটি ফেরত পাঠানো হয়েছে");
                          }}
                        >
                          নিশ্চিত করুন
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="sf-approval-actions">
                    {check.ok && permission.canApproveAllocations ? (
                      <button
                        disabled={state === "offline"}
                        className="ds-button primary approve"
                        onClick={() => approve(item)}
                      >
                        <Check size={14} /> অনুমোদন
                      </button>
                    ) : isException && permission.canApproveExceptions ? (
                      <button
                        disabled={state === "offline"}
                        className="ds-button secondary exception"
                        onClick={() => {
                          const value = window.prompt("ব্যতিক্রমের কারণ লিখুন");
                          if (value) approve(item, value);
                        }}
                      >
                        <ShieldAlert size={14} /> ব্যতিক্রম অনুমোদন
                      </button>
                    ) : (
                      <button
                        className="ds-button secondary"
                        disabled
                        title={!check.ok ? check.message : "অনুমতি নেই"}
                      >
                        অনুমোদন
                      </button>
                    )}
                    <button
                      className="ds-button secondary"
                      disabled={state === "offline" || !permission.canApproveAllocations}
                      onClick={() => setSendBack(item.id)}
                    >
                      ফেরত পাঠান
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {tab === "statement" && permission.canViewStatement && (
        <section className="sf-statement">
          <div className="sf-statement-head">
            <div>
              <h2>যাকাত ফান্ড স্টেটমেন্ট</h2>
              <p>০১ জুন — ৩০ জুন ২০২৬</p>
            </div>
            <div>
              <label>
                তারিখ <input type="date" defaultValue="2026-06-01" />
                <span>—</span>
                <input type="date" defaultValue="2026-06-30" />
              </label>
              <button
                className="ds-button secondary"
                onClick={() => setNotice("Export prototype প্রস্তুত — production-এ CSV/PDF তৈরি হবে")}
              >
                <Download size={15} /> Export
              </button>
            </div>
          </div>
          <div className="sf-statement-summary">
            <span>
              Opening balance <b>{money(143400)}</b>
            </span>
            <span>
              মোট আয় <b className="green">+{money(92000)}</b>
            </span>
            <span>
              Allocation ও ব্যয় <b className="red">−{money(50900)}</b>
            </span>
            <span>
              Closing balance <strong>{money(184500)}</strong>
            </span>
          </div>
          <div className="sf-table-wrap">
            <table className="sf-table statement">
              <thead>
                <tr>
                  <th>তারিখ</th>
                  <th>বিবরণ</th>
                  <th>রেফারেন্স</th>
                  <th>আয়</th>
                  <th>বরাদ্দ / ব্যয়</th>
                  <th>ব্যালেন্স</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>০১ জুন</td>
                  <td>
                    <b>Opening balance</b>
                  </td>
                  <td>—</td>
                  <td>—</td>
                  <td>—</td>
                  <td>
                    <b>{money(143400)}</b>
                  </td>
                </tr>
                <tr>
                  <td>০৩ জুন</td>
                  <td>
                    <b>অনুদান · মো. আরিফ</b>
                    <small>Posted income</small>
                  </td>
                  <td>DON-0084</td>
                  <td className="green">+{money(50000)}</td>
                  <td>—</td>
                  <td>{money(193400)}</td>
                </tr>
                <tr>
                  <td>০৫ জুন</td>
                  <td>
                    <b>মুহাম্মদ আব্দুল্লাহ</b>
                    <small>টিউশন · ৭৫% coverage</small>
                  </td>
                  <td>ALC-1048</td>
                  <td>—</td>
                  <td className="red">−{money(900)}</td>
                  <td>{money(192500)}</td>
                </tr>
                <tr>
                  <td>০৬ জুন</td>
                  <td>
                    <b>খাদ্য সহায়তা ক্রয়</b>
                    <small>অনুমোদিত ব্যয়</small>
                  </td>
                  <td>EXP-0244</td>
                  <td>—</td>
                  <td className="red">−{money(8000)}</td>
                  <td>{money(184500)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {selectedSponsor && (
        <div className="sf-drawer-backdrop" onClick={() => setSelectedSponsor(null)}>
          <aside className="sf-drawer" onClick={(e) => e.stopPropagation()}>
            <header>
              <div>
                <small>{selectedSponsor.id}</small>
                <h2>Sponsorship detail</h2>
              </div>
              <button onClick={() => setSelectedSponsor(null)}>
                <X size={18} />
              </button>
            </header>
            <div className="sf-person">
              <span className="ds-avatar">{selectedSponsor.initials}</span>
              <div>
                <h3>{selectedSponsor.student}</h3>
                <p>
                  {selectedSponsor.source} · {selectedSponsor.status}
                </p>
              </div>
            </div>
            <section>
              <h4>কভারেজ</h4>
              <dl>
                <div>
                  <dt>Fee heads</dt>
                  <dd>{selectedSponsor.heads}</dd>
                </div>
                <div>
                  <dt>পরিমাণ</dt>
                  <dd>{selectedSponsor.coverage}</dd>
                </div>
                <div>
                  <dt>সময়কাল</dt>
                  <dd>{selectedSponsor.dates}</dd>
                </div>
              </dl>
            </section>
            <section className="sf-restricted">
              <h4>
                <LockKeyhole size={14} /> Eligibility ও প্রমাণ
              </h4>
              {permission.canViewRestrictedEligibility ? (
                <dl>
                  <div>
                    <dt>যোগ্যতার ধরন</dt>
                    <dd>{selectedSponsor.category}</dd>
                  </div>
                  <div>
                    <dt>প্রমাণ</dt>
                    <dd>{selectedSponsor.proof}</dd>
                  </div>
                </dl>
              ) : (
                <div className="sf-limited">
                  <ShieldAlert size={17} />
                  <b>সীমিত তথ্য</b>
                  <span>Finance Lead, মুহতামিম ও Welfare Officer দেখতে পারবেন</span>
                </div>
              )}
            </section>
            <section>
              <h4>
                <History size={14} /> Approval history
              </h4>
              <div className="sf-history">
                <i />
                <div>
                  <b>{selectedSponsor.approver}</b>
                  <p>অনুমোদন করেছেন · ০২ জানু ২০২৬, ১০:২৪</p>
                </div>
              </div>
            </section>
            <footer>
              {permission.canManageSponsorships && (
                <button className="ds-button secondary" onClick={() => setEditing(true)}>
                  সম্পাদনা
                </button>
              )}
              <button
                className="ds-button primary"
                disabled={!permission.canManageSponsorships}
                onClick={() => setNotice("Renewal draft তৈরি হয়েছে")}
              >
                <RefreshCw size={14} /> নবায়ন করুন
              </button>
            </footer>
          </aside>
        </div>
      )}

      {editing && (
        <div className="sf-modal-backdrop">
          <form
            className="sf-modal"
            onSubmit={(e) => {
              e.preventDefault();
              setEditing(false);
              setNotice("Sponsorship draft সংরক্ষিত হয়েছে");
            }}
          >
            <header>
              <div>
                <small>নতুন রেকর্ড</small>
                <h2>Sponsorship তৈরি করুন</h2>
              </div>
              <button type="button" onClick={() => setEditing(false)}>
                <X size={18} />
              </button>
            </header>
            <div className="sf-form-grid">
              <label>
                শিক্ষার্থী
                <select>
                  <option>মুহাম্মদ আব্দুল্লাহ · STU-10241</option>
                </select>
              </label>
              <label>
                উৎস ফান্ড
                <select>
                  <option>যাকাত ফান্ড</option>
                  <option>এতিম ফান্ড</option>
                  <option>Named donor</option>
                </select>
              </label>
              <label>
                Coverage ধরন
                <select>
                  <option>শতকরা</option>
                  <option>সম্পূর্ণ</option>
                  <option>নির্দিষ্ট পরিমাণ</option>
                </select>
              </label>
              <label>
                Coverage
                <input defaultValue="75%" />
              </label>
              <label>
                শুরুর তারিখ
                <input type="date" defaultValue="2026-06-01" />
              </label>
              <label>
                শেষের তারিখ
                <input type="date" defaultValue="2026-12-31" />
              </label>
              <label>
                Eligibility category
                <select>
                  <option>ফকির / মিসকিন</option>
                  <option>এতিম</option>
                </select>
              </label>
              <label>
                প্রমাণ
                <input type="file" />
              </label>
            </div>
            <label className="sf-wide">
              Fee heads
              <div className="sf-chips">
                <button type="button" className="active">
                  টিউশন <Check size={12} />
                </button>
                <button type="button">খাবার</button>
                <button type="button">বই</button>
              </div>
            </label>
            <footer>
              <button
                type="button"
                className="ds-button secondary"
                onClick={() => setEditing(false)}
              >
                বাতিল
              </button>
              <button className="ds-button primary">খসড়া সংরক্ষণ</button>
            </footer>
          </form>
        </div>
      )}

      {bulkPreview && (
        <div className="sf-modal-backdrop">
          <section className="sf-modal sf-bulk">
            <header>
              <div>
                <small>BULK APPROVAL</small>
                <h2>Impact preview</h2>
              </div>
              <button onClick={() => setBulkPreview(false)}>
                <X size={18} />
              </button>
            </header>
            <div className="sf-bulk-total">
              <span>{selected.length}টি allocation</span>
              <strong>
                {money(
                  selected.reduce(
                    (sum, id) =>
                      sum + (allocations.find((a) => a.id === id)?.amountPaisa ?? 0) / 100,
                    0,
                  ),
                )}
              </strong>
              <small>সবগুলো eligibility ও balance check পাস করেছে</small>
            </div>
            {selected.map((id) => {
              const item = allocations.find((a) => a.id === id)!;
              return (
                <p key={id}>
                  <CheckCircle2 size={15} />
                  <span>
                    {item.student}
                    <small>
                      {item.invoiceId} · {item.fund.id}
                    </small>
                  </span>
                  <b>{money(item.amountPaisa / 100)}</b>
                </p>
              );
            })}
            <footer>
              <button className="ds-button secondary" onClick={() => setBulkPreview(false)}>
                ফিরে যান
              </button>
              <button
                className="ds-button primary"
                disabled={!bulkAllowed}
                onClick={() => {
                  setAllocations((current) => current.filter((a) => !selected.includes(a.id)));
                  setSelected([]);
                  setBulkPreview(false);
                  setNotice("সব allocation আলাদা balanced journal হিসেবে posted হয়েছে");
                }}
              >
                সব অনুমোদন করুন
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}
