import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  Columns3,
  Filter,
  Import,
  ListFilter,
  LoaderCircle,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  ShieldAlert,
  UserRound,
  Users,
  WifiOff,
  X,
  type LucideIcon,
} from "lucide-react";
import { prototypeRoles, resolveStaffPermission, type PrototypeRole } from "./student-permissions";
import {
  maskStaffPhone,
  staffRecords,
  type EmploymentType,
  type StaffRecord,
  type StaffStatus,
} from "./staff-data";
import { SystemState } from "./SystemStates";
import "./staff.css";

type ViewState = "ready" | "loading" | "empty" | "offline" | "denied";

const bn = (value: number | string) =>
  String(value).replace(/\d/g, (digit) => "০১২৩৪৫৬৭৮৯"[Number(digit)]);

const filters = ["শাখা", "বিভাগ", "পদবি", "স্ট্যাটাস", "লিঙ্গ"];
const employmentTypes: EmploymentType[] = ["পূর্ণকালীন", "খণ্ডকালীন", "অতিথি", "স্বেচ্ছাসেবী"];
const optionalColumns = ["শাখা", "ক্লাস লোড", "হাজিরা", "স্ট্যাটাস", "অসম্পূর্ণ কাজ"];

function StaffStatusBadge({ status }: { status: StaffStatus }) {
  const tone =
    status === "সক্রিয়"
      ? "success"
      : status === "ছুটিতে"
        ? "info"
        : status === "স্থগিত"
          ? "warning"
          : "neutral";
  return (
    <span className={`ds-badge ${tone}`}>
      <i className="status-dot" />
      {status}
    </span>
  );
}

function StaffState({
  state,
  clear,
  setState,
}: {
  state: Exclude<ViewState, "ready"> | "no-results";
  clear: () => void;
  setState: (state: ViewState) => void;
}) {
  if (state !== "no-results") {
    return (
      <SystemState
        kind={state === "denied" ? "no-permission" : state}
        title={state === "empty" ? "এখনও কোনো কর্মী নেই" : undefined}
        message={
          state === "empty" ? "প্রথম কর্মী যোগ করুন অথবা আগে থেকে থাকা তালিকা Import করুন।" : undefined
        }
        actionLabel={state === "offline" ? "আবার চেষ্টা করুন" : ""}
        onAction={state === "offline" ? () => setState("ready") : undefined}
      />
    );
  }
  return (
    <div className="student-state">
      <div className="state-icon">
        <ListFilter size={28} />
      </div>
      <h2>এই ফিল্টারে কোনো ফল নেই</h2>
      <p>সার্চ বা সক্রিয় ফিল্টারগুলো মুছে আবার চেষ্টা করুন।</p>
      <button className="ds-button secondary" onClick={clear}>
        <RotateCcw size={15} /> ফিল্টার মুছুন
      </button>
    </div>
  );
}

export default function StaffDirectory({
  role,
  onOpenStaff,
}: {
  role: PrototypeRole;
  onOpenStaff: (staff: StaffRecord) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [employmentType, setEmploymentType] = useState<EmploymentType | "">("");
  const [shownColumns, setShownColumns] = useState(optionalColumns);
  const [columnMenu, setColumnMenu] = useState(false);
  const [filterSheet, setFilterSheet] = useState(false);
  const [state, setState] = useState<ViewState>("ready");
  const context = prototypeRoles[role].context;

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    const digits = query.replace(/\D/g, "");
    return staffRecords.filter((staff) => {
      if (resolveStaffPermission(staff, context).record === "hidden") return false;
      const text = [staff.nameBn, staff.nameEn, staff.id].join(" ").toLowerCase();
      if (
        normalized &&
        !text.includes(normalized) &&
        !(digits.length >= 3 && staff.phone.replace(/\D/g, "").includes(digits))
      )
        return false;
      if (activeFilters.includes("শাখা") && staff.branch !== "প্রধান শাখা") return false;
      if (activeFilters.includes("বিভাগ") && staff.department !== "হিফজ বিভাগ") return false;
      if (activeFilters.includes("পদবি") && !staff.designation.includes("শিক্ষক")) return false;
      if (employmentType && staff.employmentType !== employmentType) return false;
      if (activeFilters.includes("স্ট্যাটাস") && staff.status !== "সক্রিয়") return false;
      if (activeFilters.includes("লিঙ্গ") && staff.gender !== "নারী") return false;
      if (activeFilters.includes("অসম্পূর্ণ কাজ") && staff.pendingTasks === 0) return false;
      return true;
    });
  }, [activeFilters, context, employmentType, query]);

  const clear = () => {
    setQuery("");
    setActiveFilters([]);
    setEmploymentType("");
  };
  const toggleFilter = (filter: string) =>
    setActiveFilters((current) =>
      current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter],
    );
  const show = (column: string) => shownColumns.includes(column);

  return (
    <main className="student-main staff-main">
      <div className="page-heading">
        <div>
          <p>
            <span>পরিচালনা</span>
            <ChevronLeft size={13} />
            শিক্ষক ও কর্মচারী
          </p>
          <h1>
            শিক্ষক ও কর্মচারী <small>{state === "empty" ? "০" : bn(filtered.length)} জন</small>
          </h1>
          <span>সকল শাখার শিক্ষক, কর্মকর্তা ও সহায়ক কর্মী</span>
        </div>
        <div className="page-actions">
          <label className="state-switcher" title="ডেমো স্টেট">
            <span>দৃশ্য</span>
            <select value={state} onChange={(event) => setState(event.target.value as ViewState)}>
              <option value="ready">স্বাভাবিক</option>
              <option value="loading">লোডিং</option>
              <option value="empty">খালি প্রতিষ্ঠান</option>
              <option value="offline">অফলাইন</option>
              <option value="denied">অনুমতি নেই</option>
            </select>
          </label>
          <button className="ds-button primary">
            <Plus size={16} /> কর্মী যোগ করুন
          </button>
        </div>
      </div>

      {state === "ready" ? (
        <>
          <section className="list-toolbar">
            <div className="search-and-mobile-filter">
              <label className="student-search">
                <Search size={18} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="নাম, Staff ID বা ফোন"
                />
                {query && (
                  <button onClick={() => setQuery("")} aria-label="সার্চ মুছুন">
                    <X size={15} />
                  </button>
                )}
              </label>
              <button className="mobile-filter-button" onClick={() => setFilterSheet(true)}>
                <Filter size={17} /> ফিল্টার
                {activeFilters.length + (employmentType ? 1 : 0) > 0 && (
                  <b>{bn(activeFilters.length + (employmentType ? 1 : 0))}</b>
                )}
              </button>
            </div>
            <div className="saved-views">
              <span>সংরক্ষিত ভিউ</span>
              <button onClick={() => setActiveFilters(["পদবি", "স্ট্যাটাস"])}>সক্রিয় শিক্ষক</button>
              <button onClick={() => setActiveFilters(["অসম্পূর্ণ কাজ"])}>কাজ বাকি</button>
              <button onClick={() => setEmploymentType("পূর্ণকালীন")}>পূর্ণকালীন</button>
            </div>
            <div className="filter-chips">
              {filters.map((filter) => (
                <button
                  key={filter}
                  className={activeFilters.includes(filter) ? "active" : ""}
                  onClick={() => toggleFilter(filter)}
                >
                  {filter}
                  {activeFilters.includes(filter) && (
                    <small>
                      ·{" "}
                      {filter === "শাখা"
                        ? "প্রধান"
                        : filter === "বিভাগ"
                          ? "হিফজ"
                          : filter === "পদবি"
                            ? "শিক্ষক"
                            : filter === "স্ট্যাটাস"
                              ? "সক্রিয়"
                              : "নারী"}
                    </small>
                  )}
                  <ChevronDown size={13} />
                </button>
              ))}
              <label className={employmentType ? "staff-type-filter active" : "staff-type-filter"}>
                <span>চাকরির ধরন</span>
                <select
                  value={employmentType}
                  onChange={(event) => setEmploymentType(event.target.value as EmploymentType | "")}
                >
                  <option value="">সব ধরন</option>
                  {employmentTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </label>
              {(activeFilters.length > 0 || employmentType) && (
                <button className="clear-button" onClick={clear}>
                  <X size={14} /> মুছুন
                </button>
              )}
            </div>
          </section>

          {filtered.length === 0 ? (
            <StaffState state="no-results" clear={clear} setState={setState} />
          ) : (
            <>
              <div className="table-meta">
                <span>
                  <b>{bn(filtered.length)}</b> জন দেখানো হচ্ছে
                </span>
                <div className="column-control">
                  <button onClick={() => setColumnMenu(!columnMenu)}>
                    <Columns3 size={16} /> কলাম <ChevronDown size={13} />
                  </button>
                  {columnMenu && (
                    <div className="column-menu">
                      <b>দৃশ্যমান কলাম</b>
                      {optionalColumns.map((column) => (
                        <label key={column}>
                          <input
                            type="checkbox"
                            checked={show(column)}
                            onChange={() =>
                              setShownColumns((current) =>
                                current.includes(column)
                                  ? current.filter((item) => item !== column)
                                  : [...current, column],
                              )
                            }
                          />
                          <span>
                            <Check size={12} />
                          </span>
                          {column}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <section className="student-table-wrap staff-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>কর্মী</th>
                      <th>Staff ID</th>
                      <th>পদবি</th>
                      {show("শাখা") && <th>শাখা</th>}
                      {show("ক্লাস লোড") && <th>সাপ্তাহিক ক্লাস</th>}
                      {show("হাজিরা") && <th>এই মাসে হাজিরা</th>}
                      {show("স্ট্যাটাস") && <th>স্ট্যাটাস</th>}
                      {show("অসম্পূর্ণ কাজ") && <th>অসম্পূর্ণ কাজ</th>}
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((staff) => (
                      <tr key={staff.id} onClick={() => onOpenStaff(staff)}>
                        <td>
                          <div className="student-identity">
                            <span className={`student-avatar ${staff.avatarTone}`}>
                              {staff.gender === "নারী" && !staff.photoConsent
                                ? staff.initials
                                : staff.initials}
                            </span>
                            <div>
                              <b>{staff.nameBn}</b>
                              <small>{staff.nameEn}</small>
                              {query.replace(/\D/g, "").length >= 3 && (
                                <small className="phone-match">{maskStaffPhone(staff.phone)}</small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <code>{staff.id}</code>
                        </td>
                        <td>
                          <b className="class-name">{staff.designation}</b>
                          <small className="section-name">{staff.department}</small>
                        </td>
                        {show("শাখা") && <td className="nowrap">{staff.branch}</td>}
                        {show("ক্লাস লোড") && (
                          <td>
                            <b>{bn(staff.weeklyLoad)}</b> <small>পিরিয়ড</small>
                          </td>
                        )}
                        {show("হাজিরা") && (
                          <td>
                            <div className={`attendance ${staff.attendance < 80 ? "low" : ""}`}>
                              <span>
                                <i style={{ width: `${staff.attendance}%` }} />
                              </span>
                              <b>{bn(staff.attendance)}%</b>
                            </div>
                          </td>
                        )}
                        {show("স্ট্যাটাস") && (
                          <td>
                            <StaffStatusBadge status={staff.status} />
                          </td>
                        )}
                        {show("অসম্পূর্ণ কাজ") && (
                          <td>
                            <span className={staff.pendingTasks ? "task-count due" : "task-count"}>
                              {bn(staff.pendingTasks)}
                            </span>
                          </td>
                        )}
                        <td>
                          <button className="row-menu" aria-label="আরও অপশন">
                            <MoreHorizontal size={17} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
              <section className="mobile-cards staff-mobile-cards">
                {filtered.map((staff) => (
                  <article key={staff.id} onClick={() => onOpenStaff(staff)}>
                    <span className={`student-avatar ${staff.avatarTone}`}>{staff.initials}</span>
                    <div className="mobile-card-info">
                      <h3>{staff.nameBn}</h3>
                      <p>
                        {staff.designation} · {staff.id}
                      </p>
                      <StaffStatusBadge status={staff.status} />
                    </div>
                    <div className="staff-card-stats">
                      <b>{bn(staff.weeklyLoad)}</b>
                      <small>ক্লাস</small>
                      <ChevronLeft size={16} />
                    </div>
                  </article>
                ))}
              </section>
            </>
          )}
        </>
      ) : (
        <StaffState state={state} clear={clear} setState={setState} />
      )}

      {filterSheet && (
        <div className="sheet-backdrop" onClick={() => setFilterSheet(false)}>
          <section className="filter-sheet" onClick={(event) => event.stopPropagation()}>
            <header>
              <div>
                <h2>কর্মী ফিল্টার</h2>
                <p>শাখা, বিভাগ ও চাকরির ধরন অনুযায়ী দেখুন</p>
              </div>
              <button onClick={() => setFilterSheet(false)}>
                <X size={20} />
              </button>
            </header>
            <div className="sheet-body">
              <h3>সংরক্ষিত ভিউ</h3>
              <div className="sheet-saved">
                <button onClick={() => setActiveFilters(["পদবি", "স্ট্যাটাস"])}>সক্রিয় শিক্ষক</button>
                <button onClick={() => setEmploymentType("পূর্ণকালীন")}>পূর্ণকালীন</button>
              </div>
              <h3>ফিল্টার করুন</h3>
              {filters.map((filter) => (
                <button
                  key={filter}
                  className={activeFilters.includes(filter) ? "active" : ""}
                  onClick={() => toggleFilter(filter)}
                >
                  <span>{filter}</span>
                  {activeFilters.includes(filter) ? <Check size={17} /> : <ChevronLeft size={17} />}
                </button>
              ))}
              <h3>চাকরির ধরন</h3>
              <div className="staff-sheet-types">
                {employmentTypes.map((type) => (
                  <button
                    key={type}
                    className={employmentType === type ? "active" : ""}
                    onClick={() => setEmploymentType(employmentType === type ? "" : type)}
                  >
                    {type}
                    {employmentType === type && <Check size={15} />}
                  </button>
                ))}
              </div>
            </div>
            <footer>
              <button className="ds-button secondary" onClick={clear}>
                সব মুছুন
              </button>
              <button className="ds-button primary" onClick={() => setFilterSheet(false)}>
                {bn(filtered.length)} জন দেখুন
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}
