import { useMemo, useState } from "react";
import {
  Building2,
  Camera,
  Check,
  ChevronRight,
  Clock3,
  FileKey2,
  Fingerprint,
  HandCoins,
  History,
  Info,
  LockKeyhole,
  Save,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import { useInstitutionSettings } from "./InstitutionSettingsContext";
import {
  canOpenSettings,
  resolveConfiguredPermission,
  type InstitutionSettings as SettingsModel,
  type PermissionAction,
  type PermissionModule,
  type PhotoPolicy,
} from "./settings-domain";
import type { PrototypeRole } from "./student-permissions";
import { SystemState } from "./SystemStates";
import "./institution-settings.css";

const sections = [
  ["profile", "প্রতিষ্ঠান প্রোফাইল", Building2],
  ["branches", "শাখা ও ছবি নীতি", Camera],
  ["attendance", "হাজিরা ও ID format", Clock3],
  ["funds", "Fund eligible-use", HandCoins],
  ["permissions", "Role ও permissions", FileKey2],
  ["users", "ব্যবহারকারী access", UserCog],
  ["audit", "পরিবর্তনের audit", History],
] as const;
type Section = (typeof sections)[number][0];
const modules: Array<[PermissionModule, string]> = [
  ["students", "শিক্ষার্থী"],
  ["attendance", "হাজিরা"],
  ["funds", "ফান্ড (B10)"],
  ["examPapers", "প্রশ্নপত্র (B14)"],
  ["settings", "সেটিংস"],
];
const actions: PermissionAction[] = ["view", "create", "edit", "approve", "print"];

export default function InstitutionSettings({ role }: { role: PrototypeRole }) {
  const { settings, audit, save } = useInstitutionSettings();
  const [section, setSection] = useState<Section>("profile");
  const [draft, setDraft] = useState<SettingsModel>(() => structuredClone(settings));
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState("");
  const [dirtyArea, setDirtyArea] = useState<
    | "profile"
    | "branch"
    | "photoPolicy"
    | "attendance"
    | "idFormat"
    | "fundRules"
    | "permissions"
    | "girlsAccess"
  >("profile");
  const before = useMemo(() => JSON.stringify(settings), [settings]);

  if (!canOpenSettings(role)) {
    return (
      <main className="settings-denied">
        <SystemState
          kind="no-permission"
          title="সেটিংসে প্রবেশের অনুমতি নেই"
          message="শুধু Institution Admin এই URL খুলতে ও পরিবর্তন করতে পারেন।"
        />
      </main>
    );
  }

  const mark = (next: SettingsModel, area: typeof dirtyArea) => {
    setDraft(next);
    setDirtyArea(area);
    setNotice("");
  };
  const saveChanges = () => {
    try {
      save(
        draft,
        { area: dirtyArea, before: JSON.parse(before), after: structuredClone(draft) },
        reason,
      );
      setReason("");
      setNotice("সেটিংস সংরক্ষিত হয়েছে এবং audit log-এ যোগ হয়েছে");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "সংরক্ষণ করা যায়নি");
    }
  };
  const togglePermission = (
    targetRole: string,
    module: PermissionModule,
    action: PermissionAction,
  ) => {
    const next = structuredClone(draft);
    const current = next.rolePermissions[targetRole][module] ?? [];
    next.rolePermissions[targetRole][module] = current.includes(action)
      ? current.filter((item) => item !== action)
      : [...current, action];
    mark(next, "permissions");
  };

  return (
    <main className="settings-page">
      <header className="settings-heading">
        <div>
          <span className="ds-kicker">S30 · SYSTEM CONFIGURATION</span>
          <h1>সেটিংস ও অনুমতি</h1>
          <p>প্রতিষ্ঠানের নীতি, privacy, অর্থ ও role access এক জায়গা থেকে পরিচালনা করুন।</p>
        </div>
        <div className="admin-only">
          <LockKeyhole size={14} />
          <span>
            <b>Admin only</b>
            <small>প্রতিটি change audited</small>
          </span>
        </div>
      </header>
      <div className="settings-layout">
        <aside className="settings-nav">
          {sections.map(([id, label, Icon]) => (
            <button
              className={section === id ? "active" : ""}
              key={id}
              onClick={() => setSection(id)}
            >
              <Icon size={16} />
              <span>{label}</span>
              <ChevronRight size={13} />
            </button>
          ))}
        </aside>
        <section className="settings-content">
          {section === "profile" && (
            <article className="settings-card">
              <header>
                <div className="settings-icon">
                  <Building2 />
                </div>
                <div>
                  <h2>প্রতিষ্ঠান প্রোফাইল</h2>
                  <p>Official paper, ID ও যোগাযোগে ব্যবহৃত পরিচয়</p>
                </div>
              </header>
              <div className="settings-form-grid">
                <label>
                  প্রতিষ্ঠানের নাম (বাংলা)
                  <input
                    value={draft.institution.nameBn}
                    onChange={(e) =>
                      mark(
                        { ...draft, institution: { ...draft.institution, nameBn: e.target.value } },
                        "profile",
                      )
                    }
                  />
                </label>
                <label>
                  Institution name (English)
                  <input
                    value={draft.institution.nameEn}
                    onChange={(e) =>
                      mark(
                        { ...draft, institution: { ...draft.institution, nameEn: e.target.value } },
                        "profile",
                      )
                    }
                  />
                </label>
                <label>
                  প্রতিষ্ঠান code
                  <input
                    value={draft.institution.code}
                    onChange={(e) =>
                      mark(
                        { ...draft, institution: { ...draft.institution, code: e.target.value } },
                        "profile",
                      )
                    }
                  />
                </label>
              </div>
            </article>
          )}
          {section === "branches" && (
            <article className="settings-card">
              <header>
                <div className="settings-icon">
                  <Camera />
                </div>
                <div>
                  <h2>শাখা ও ছবি নীতি</h2>
                  <p>প্রতি শাখায় ছবি নেওয়া ও সংরক্ষণের নিয়ম</p>
                </div>
              </header>
              <div className="branch-list">
                {draft.branches.map((branch, index) => (
                  <div key={branch.id}>
                    <span className="branch-mark">{branch.name.slice(0, 1)}</span>
                    <div>
                      <b>{branch.name}</b>
                      <small>{branch.id}</small>
                    </div>
                    <label>
                      শাখার ধরন
                      <select
                        value={branch.type}
                        onChange={(e) => {
                          const next = structuredClone(draft);
                          next.branches[index].type = e.target.value as typeof branch.type;
                          mark(next, "branch");
                        }}
                      >
                        <option>বালক</option>
                        <option>বালিকা</option>
                        <option>মিশ্র</option>
                      </select>
                    </label>
                    <label>
                      ছবি নীতি
                      <select
                        value={branch.photoPolicy}
                        onChange={(e) => {
                          const next = structuredClone(draft);
                          next.branches[index].photoPolicy = e.target.value as PhotoPolicy;
                          mark(next, "photoPolicy");
                        }}
                      >
                        <option>বাধ্যতামূলক</option>
                        <option>ঐচ্ছিক</option>
                        <option>সংরক্ষণ নয়</option>
                      </select>
                    </label>
                  </div>
                ))}
              </div>
              <div className="privacy-note">
                <ShieldCheck size={17} />
                <p>
                  <b>“সংরক্ষণ নয়” বাছলে</b> তালিকা, profile ও attendance—সব জায়গায় ছবি সঙ্গে সঙ্গে লুকানো হবে
                  এবং নতুন ছবি রাখা হবে না।
                </p>
              </div>
            </article>
          )}
          {section === "attendance" && (
            <article className="settings-card">
              <header>
                <div className="settings-icon">
                  <Clock3 />
                </div>
                <div>
                  <h2>হাজিরা cutoff ও ID format</h2>
                  <p>Shift অনুযায়ী late cutoff এবং নতুন record-এর ID pattern</p>
                </div>
              </header>
              <div className="settings-form-grid">
                <label>
                  সকাল shift cutoff
                  <input
                    type="time"
                    value={draft.attendanceCutoff.সকাল}
                    onChange={(e) =>
                      mark(
                        {
                          ...draft,
                          attendanceCutoff: { ...draft.attendanceCutoff, সকাল: e.target.value },
                        },
                        "attendance",
                      )
                    }
                  />
                </label>
                <label>
                  দুপুর shift cutoff
                  <input
                    type="time"
                    value={draft.attendanceCutoff.দুপুর}
                    onChange={(e) =>
                      mark(
                        {
                          ...draft,
                          attendanceCutoff: { ...draft.attendanceCutoff, দুপুর: e.target.value },
                        },
                        "attendance",
                      )
                    }
                  />
                </label>
                <label>
                  Student ID format
                  <input
                    value={draft.idFormats.student}
                    onChange={(e) =>
                      mark(
                        { ...draft, idFormats: { ...draft.idFormats, student: e.target.value } },
                        "idFormat",
                      )
                    }
                  />
                  <small>Preview: HQS-2026-0042</small>
                </label>
                <label>
                  Staff ID format
                  <input
                    value={draft.idFormats.staff}
                    onChange={(e) =>
                      mark(
                        { ...draft, idFormats: { ...draft.idFormats, staff: e.target.value } },
                        "idFormat",
                      )
                    }
                  />
                  <small>Preview: EMP-042</small>
                </label>
              </div>
            </article>
          )}
          {section === "funds" && (
            <article className="settings-card">
              <header>
                <div className="settings-icon">
                  <HandCoins />
                </div>
                <div>
                  <h2>Fund eligible-use rules</h2>
                  <p>এই rules B10 allocation check-এ সরাসরি ব্যবহৃত হয়</p>
                </div>
              </header>
              <div className="fund-rule-list">
                {Object.entries(draft.fundRules).map(([fund, heads]) => (
                  <div key={fund}>
                    <div>
                      <span>৳</span>
                      <b>{fund}</b>
                    </div>
                    <label>
                      অনুমোদিত fee head
                      <input
                        value={heads.join(", ")}
                        onChange={(e) =>
                          mark(
                            {
                              ...draft,
                              fundRules: {
                                ...draft.fundRules,
                                [fund]: e.target.value
                                  .split(",")
                                  .map((x) => x.trim())
                                  .filter(Boolean),
                              },
                            },
                            "fundRules",
                          )
                        }
                      />
                    </label>
                    <span className="live-rule ds-badge success">
                      <Check size={12} /> B10 live
                    </span>
                  </div>
                ))}
              </div>
            </article>
          )}
          {section === "permissions" && (
            <article className="settings-card wide">
              <header>
                <div className="settings-icon">
                  <FileKey2 />
                </div>
                <div>
                  <h2>Role templates ও permission matrix</h2>
                  <p>Shared resolver এই module × action matrix থেকেই access দেয়</p>
                </div>
                <select className="role-template">
                  <option value="class-teacher">Class teacher</option>
                </select>
              </header>
              <div className="permission-table">
                <div className="permission-row head">
                  <b>Module</b>
                  {actions.map((a) => (
                    <span key={a}>{a}</span>
                  ))}
                </div>
                {modules.map(([module, label]) => (
                  <div className="permission-row" key={module}>
                    <b>{label}</b>
                    {actions.map((action) => {
                      const allowed = resolveConfiguredPermission(
                        draft,
                        "class-teacher",
                        module,
                        action,
                      );
                      return (
                        <button
                          aria-label={`${label} ${action}`}
                          className={allowed ? "on" : ""}
                          onClick={() => togglePermission("class-teacher", module, action)}
                          key={action}
                        >
                          {allowed && <Check size={13} />}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="resolver-note">
                <Fingerprint size={17} />
                <span>
                  <b>Shared resolver preview</b>
                  <small>
                    Class teacher বর্তমানে প্রশ্নপত্র print{" "}
                    {resolveConfiguredPermission(draft, "class-teacher", "examPapers", "print")
                      ? "করতে পারবেন"
                      : "করতে পারবেন না"}
                    ।
                  </small>
                </span>
              </div>
            </article>
          )}
          {section === "users" && (
            <article className="settings-card">
              <header>
                <div className="settings-icon">
                  <Users />
                </div>
                <div>
                  <h2>ব্যবহারকারী access</h2>
                  <p>ব্যক্তিভিত্তিক সংবেদনশীল section visibility</p>
                </div>
              </header>
              <div className="user-access">
                <div>
                  <span className="ds-avatar small">রা</span>
                  <div>
                    <b>রাশেদ আহমেদ</b>
                    <small>Academic Admin · USR-001</small>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={draft.girlsAccess["USR-001"]}
                      onChange={(e) =>
                        mark(
                          {
                            ...draft,
                            girlsAccess: { ...draft.girlsAccess, "USR-001": e.target.checked },
                          },
                          "girlsAccess",
                        )
                      }
                    />
                    <span />
                  </label>
                </div>
              </div>
              <div className="girls-explanation">
                <Info size={17} />
                <p>
                  <b>বালিকা section access চালু থাকলে কী দেখা যাবে?</b> এই ব্যবহারকারী বালিকা শাখার শিক্ষার্থীর নাম,
                  ছবি (শাখার ছবি নীতি অনুমতি দিলে), guardian contact, class/attendance ও academic
                  profile দেখতে পারবেন। Health, finance বা audit আলাদা permission ছাড়া দেখা যাবে না।
                </p>
              </div>
            </article>
          )}
          {section === "audit" && (
            <article className="settings-card">
              <header>
                <div className="settings-icon">
                  <History />
                </div>
                <div>
                  <h2>Settings audit log</h2>
                  <p>কে, কখন, কেন এবং before/after snapshot</p>
                </div>
              </header>
              <div className="settings-audit">
                {audit.length === 0 ? (
                  <p>এখনও কোনো পরিবর্তন সংরক্ষিত হয়নি।</p>
                ) : (
                  audit.map((item) => (
                    <div key={item.id}>
                      <span>
                        <History size={14} />
                      </span>
                      <div>
                        <b>{item.area} পরিবর্তন</b>
                        <small>
                          {item.actorId} · {new Date(item.changedAt).toLocaleString("bn-BD")}
                        </small>
                        <p>{item.reason || "সাধারণ configuration update"}</p>
                      </div>
                      <code>before → after</code>
                    </div>
                  ))
                )}
              </div>
            </article>
          )}
          {section !== "audit" && (
            <footer className="settings-save">
              <div>
                <label>
                  পরিবর্তনের কারণ{" "}
                  {["photoPolicy", "fundRules", "permissions", "girlsAccess"].includes(
                    dirtyArea,
                  ) && <b>· আবশ্যক</b>}
                  <input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="কেন পরিবর্তন করছেন লিখুন…"
                  />
                </label>
                {notice && <p>{notice}</p>}
              </div>
              <button className="ds-button primary" onClick={saveChanges}>
                <Save size={15} /> পরিবর্তন সংরক্ষণ
              </button>
            </footer>
          )}
        </section>
      </div>
    </main>
  );
}
