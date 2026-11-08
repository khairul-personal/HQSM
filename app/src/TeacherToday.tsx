/** B4 · Teacher "Today" (S04) + attendance register (S12). Rules live in attendance-domain (tested). */
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpenCheck,
  CheckCheck,
  CircleCheck,
  Clock3,
  CloudOff,
  Filter,
  LockKeyhole,
  MapPin,
  PencilLine,
  Send,
  Users,
  X,
} from "lucide-react";
import {
  correctMark,
  cutoffState,
  loadDrafts,
  markAllPresent,
  registerAvatar,
  registerCounts,
  registerCutoff,
  resolveAttendancePermission,
  saveDrafts,
  setMark,
  submitRegister,
  syncDraft,
  unmarkedStudents,
  upsertDraft,
  type AttendanceDraft,
  type AttendanceMark,
  type CutoffState,
  type GuardianMessage,
  type RegisterStudent,
  type TeacherRegister,
} from "./attendance-domain";
import { demoAttendanceDay, demoClockChoices, initialRegisters } from "./attendance-data";
import { appRoutes, registerIdFromPath, registerPath, sectionPath } from "./app-routes";
import { bn, clock, gregorianDate, hijriDate } from "./bn-format";
import { useInstitutionSettings } from "./InstitutionSettingsContext";
import { isPhotoVisible } from "./settings-domain";
import { prototypeRoles, type PrototypeRole } from "./student-permissions";
import { SystemState } from "./SystemStates";
import "./attendance.css";

type DemoState = "data" | "loading" | "empty" | "error";

const markMeta: Record<AttendanceMark, { label: string; short: string; key: string }> = {
  present: { label: "উপস্থিত", short: "উ", key: "1" },
  late: { label: "দেরি", short: "দে", key: "2" },
  absent: { label: "অনুপস্থিত", short: "অ", key: "3" },
  leave: { label: "ছুটি", short: "ছু", key: "4" },
};
const markOrder: AttendanceMark[] = ["present", "late", "absent", "leave"];

const branchPhotoPolicy: Record<TeacherRegister["branch"], string> = {
  boys: "main",
  girls: "girls",
};
const REGISTERS_KEY = `madrasa.attendance-registers.${demoAttendanceDay}`;
const MESSAGES_KEY = `madrasa.attendance-messages.${demoAttendanceDay}`;

const storage = (): Storage | undefined => {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
};

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = storage()?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown) {
  try {
    storage()?.setItem(key, JSON.stringify(value));
  } catch {
    // storage blocked: state lives for this visit only
  }
}

const minutesText = (m: number) =>
  m >= 60
    ? `${bn(Math.floor(m / 60))} ঘণ্টা ${m % 60 ? `${bn(m % 60)} মিনিট` : ""}`
    : `${bn(m)} মিনিট`;

function cutoffLabel(state: CutoffState, cutoff: number): { text: string; tone: string } {
  switch (state.kind) {
    case "submitted":
      return { text: "জমা হয়েছে", tone: "success" };
    case "upcoming":
      return {
        text: `শুরু হবে ${minutesText(state.minutesToStart)} পর · cutoff ${clock(cutoff)}`,
        tone: "neutral",
      };
    case "open":
      return {
        text: `cutoff ${clock(cutoff)} · ${minutesText(state.minutesLeft)} বাকি`,
        tone: "info",
      };
    case "due-soon":
      return {
        text: `cutoff ${clock(cutoff)} · মাত্র ${minutesText(state.minutesLeft)} বাকি`,
        tone: "warning",
      };
    case "overdue":
      return {
        text: `cutoff ${clock(cutoff)} পেরিয়েছে ${minutesText(state.minutesOver)} আগে · শাখা প্রশাসককে জানানো হয়েছে`,
        tone: "danger",
      };
  }
}

export default function TeacherToday({ role }: { role: PrototypeRole }) {
  const { settings } = useInstitutionSettings();
  const context = prototypeRoles[role].context;
  const permission = useMemo(
    () => resolveAttendancePermission(context, settings),
    [context, settings],
  );
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const registerId = registerIdFromPath(pathname);

  const [registers, setRegisters] = useState<TeacherRegister[]>(() =>
    loadJson(REGISTERS_KEY, initialRegisters),
  );
  const [drafts, setDrafts] = useState<AttendanceDraft[]>(() => loadDrafts(storage()));
  const [messages, setMessages] = useState<GuardianMessage[]>(() => loadJson(MESSAGES_KEY, []));
  const [now, setNow] = useState<number>(demoClockChoices[0]);
  const [demoState, setDemoState] = useState<DemoState>("data");
  const [forcedOffline, setForcedOffline] = useState(false);
  const [browserOnline, setBrowserOnline] = useState(() => navigator.onLine);
  const offline = forcedOffline || !browserOnline;

  useEffect(() => saveJson(REGISTERS_KEY, registers), [registers]);
  useEffect(() => saveDrafts(storage(), drafts), [drafts]);
  useEffect(() => saveJson(MESSAGES_KEY, messages), [messages]);
  useEffect(() => {
    const on = () => setBrowserOnline(true);
    const off = () => setBrowserOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const addMessages = useCallback(
    (incoming: GuardianMessage[]) =>
      setMessages((prev) => [
        ...prev,
        ...incoming.filter((m) => !prev.some((p) => p.key === m.key)),
      ]),
    [],
  );

  // Back online: apply drafts, sync queued submits (idempotent, conflicts kept for review).
  useEffect(() => {
    if (offline || drafts.length === 0) return;
    let nextRegisters = registers;
    const nextDrafts: AttendanceDraft[] = [];
    const sent: GuardianMessage[] = [];
    for (const draft of drafts) {
      const server = nextRegisters.find((r) => r.id === draft.registerId);
      if (!server) continue;
      if (draft.status === "draft") {
        if (server.status === "open")
          nextRegisters = nextRegisters.map((r) =>
            r.id === server.id ? { ...r, marks: draft.marks } : r,
          );
        else nextDrafts.push({ ...draft, status: "conflict" });
      } else if (draft.status === "queued") {
        const { draft: synced, result } = syncDraft(draft, server, now, permission);
        if (result?.ok) {
          nextRegisters = nextRegisters.map((r) => (r.id === server.id ? result.register : r));
          sent.push(...result.messages);
        }
        if (synced.status === "conflict") nextDrafts.push(synced);
      } else if (draft.status === "conflict") nextDrafts.push(draft);
    }
    setRegisters(nextRegisters);
    setDrafts(nextDrafts);
    addMessages(sent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offline]);

  if (!permission.open) {
    return (
      <SystemState
        kind="no-permission"
        message="হাজিরা নেওয়া শিক্ষক ও শাখা প্রশাসকের কাজ। আপনার ভূমিকায় এই পাতা খোলা নেই।"
      />
    );
  }

  const visible = permission.visibleRegisters(registers);
  const effective = (r: TeacherRegister): TeacherRegister => {
    const d = drafts.find((x) => x.registerId === r.id && x.status !== "conflict");
    return d && r.status === "open" ? { ...r, marks: d.marks } : r;
  };

  const prototypeBar = (
    <div className="att-prototype" role="group" aria-label="Prototype controls">
      <b>Prototype</b>
      <label>
        <span>সময়</span>
        <select value={now} onChange={(e) => setNow(Number(e.target.value))}>
          {demoClockChoices.map((m) => (
            <option key={m} value={m}>
              {clock(m)}
            </option>
          ))}
        </select>
      </label>
      {(
        [
          ["data", "তথ্য"],
          ["loading", "লোড হচ্ছে"],
          ["empty", "আজ কোনো ক্লাস নেই"],
          ["error", "তথ্য পাওয়া যায়নি"],
        ] as [DemoState, string][]
      ).map(([value, label]) => (
        <button
          key={value}
          type="button"
          aria-pressed={demoState === value}
          className={demoState === value ? "active" : ""}
          onClick={() => setDemoState(value)}
        >
          {label}
        </button>
      ))}
      <button
        type="button"
        aria-pressed={forcedOffline}
        className={forcedOffline ? "active" : ""}
        onClick={() => setForcedOffline((v) => !v)}
      >
        অফলাইন
      </button>
      <button
        type="button"
        onClick={() => {
          setRegisters(initialRegisters);
          setDrafts([]);
          setMessages([]);
        }}
      >
        ডেমো রিসেট
      </button>
    </div>
  );

  const openRegister = registerId ? visible.find((r) => r.id === registerId) : undefined;
  if (registerId && !openRegister) {
    return (
      <div className="att">
        {prototypeBar}
        <SystemState
          kind="not-found"
          message="এই হাজিরা খাতাটি পাওয়া যায়নি, অথবা এটি আপনার দায়িত্বে নেই।"
          actionLabel="আজকের তালিকায় ফিরুন"
          onAction={() => navigate(sectionPath("attendance"))}
        />
      </div>
    );
  }

  return (
    <div className="att">
      {prototypeBar}
      {offline && (
        <p className="att-banner warning" role="status">
          <CloudOff size={18} aria-hidden="true" />
          <span>
            <b>ইন্টারনেট সংযোগ নেই।</b> হাজিরা এই ফোনে খসড়া হিসেবে থাকছে, সংযোগ ফিরলে নিজে থেকেই পাঠানো হবে।
          </span>
        </p>
      )}
      {demoState === "loading" ? (
        <SystemState kind="loading" />
      ) : demoState === "error" ? (
        <SystemState
          kind="error"
          message="আজকের রুটিন এই মুহূর্তে আনা যাচ্ছে না। আগে নেওয়া খসড়া হাজিরা ফোনে নিরাপদে আছে।"
        />
      ) : openRegister ? (
        <RegisterView
          key={openRegister.id}
          register={effective(openRegister)}
          server={openRegister}
          draft={drafts.find((d) => d.registerId === openRegister.id)}
          canMark={permission.canMark}
          now={now}
          cutoff={registerCutoff(openRegister, settings)}
          offline={offline}
          avatar={(s) =>
            registerAvatar(
              openRegister,
              s,
              context,
              isPhotoVisible(settings, branchPhotoPolicy[openRegister.branch]),
            )
          }
          messagesSent={messages.filter((m) => m.key.startsWith(`${openRegister.id}:`))}
          onBack={() => navigate(sectionPath("attendance"))}
          onChange={(next) => {
            if (offline) {
              setDrafts((d) =>
                upsertDraft(d, {
                  registerId: next.id,
                  eventId: `EVT-${next.id}-${Date.now()}`,
                  capturedAtMinutes: now,
                  marks: next.marks,
                  status: "draft",
                }),
              );
            } else setRegisters((rs) => rs.map((r) => (r.id === next.id ? next : r)));
          }}
          onSubmit={(submissionId) => {
            const current = effective(openRegister);
            if (offline) {
              setDrafts((d) =>
                upsertDraft(d, {
                  registerId: current.id,
                  eventId: `EVT-${current.id}-${Date.now()}`,
                  capturedAtMinutes: now,
                  marks: current.marks,
                  status: "queued",
                  submissionId,
                }),
              );
              return { queued: true as const };
            }
            const result = submitRegister(current, {
              submissionId,
              nowMinutes: now,
              confirmUnmarked: true,
              permission,
            });
            if (result.ok) {
              setRegisters((rs) => rs.map((r) => (r.id === current.id ? result.register : r)));
              addMessages(result.messages);
            }
            return result;
          }}
          onCorrect={(studentId, to, reason) => {
            const result = correctMark(openRegister, { studentId, to, reason, nowMinutes: now });
            if (result.ok) {
              setRegisters((rs) => rs.map((r) => (r.id === openRegister.id ? result.register : r)));
              if (result.message) addMessages([result.message]);
            }
            return result;
          }}
        />
      ) : (
        <TodayView
          registers={demoState === "empty" ? [] : visible.map(effective)}
          drafts={drafts}
          now={now}
          cutoffOf={(r) => registerCutoff(r, settings)}
          onOpen={(id) => navigate(registerPath(id))}
          onHomework={() => navigate(appRoutes.homework)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Today (S04)

function TodayView({
  registers,
  drafts,
  now,
  cutoffOf,
  onOpen,
  onHomework,
}: {
  registers: TeacherRegister[];
  drafts: AttendanceDraft[];
  now: number;
  cutoffOf: (r: TeacherRegister) => number;
  onOpen: (id: string) => void;
  onHomework: () => void;
}) {
  const rows = registers
    .map((r) => {
      const cutoff = cutoffOf(r);
      return { r, cutoff, state: cutoffState(r, now, cutoff), counts: registerCounts(r) };
    })
    .sort((a, b) => a.r.startMinutes - b.r.startMinutes);
  const needAction = rows.filter(
    (x) => x.state.kind === "open" || x.state.kind === "due-soon" || x.state.kind === "overdue",
  );
  const queued = drafts.filter((d) => d.status === "queued").length;
  const conflicts = drafts.filter((d) => d.status === "conflict").length;
  // One teacher's own day vs. a register overview (what the resolver returned decides, not the role).
  const teachers = [...new Set(registers.map((r) => r.teacher))];
  const isTeacher = teachers.length === 1;

  return (
    <>
      <header className="att-head">
        <div>
          <p className="att-greeting">আসসালামু আলাইকুম</p>
          <h1>{isTeacher ? `আজ · ${teachers[0]}` : "আজকের হাজিরা খাতা"}</h1>
          <p className="att-dates">
            <span>{gregorianDate(demoAttendanceDay)}</span>
            <span aria-hidden="true">·</span>
            <span>{hijriDate(demoAttendanceDay)}</span>
            <span aria-hidden="true">·</span>
            <span>এখন {clock(now)}</span>
          </p>
        </div>
      </header>

      <div className="att-tasks">
        <div className={needAction.length ? "warning" : "success"}>
          <Clock3 size={20} aria-hidden="true" />
          <span>
            <b>{bn(needAction.length)}টি</b> হাজিরা এখন নেওয়ার বাকি
          </span>
        </div>
        {queued > 0 && (
          <div className="info">
            <CloudOff size={20} aria-hidden="true" />
            <span>
              <b>{bn(queued)}টি</b> জমা এখনো পাঠানো হয়নি
            </span>
          </div>
        )}
        {conflicts > 0 && (
          <div className="danger">
            <AlertTriangle size={20} aria-hidden="true" />
            <span>
              <b>{bn(conflicts)}টি</b> খসড়া মেলেনি — শাখা প্রশাসক দেখবেন
            </span>
          </div>
        )}
        <button type="button" onClick={onHomework}>
          <BookOpenCheck size={20} aria-hidden="true" />
          <span>হোমওয়ার্ক দেখার তালিকা</span>
        </button>
      </div>

      <section aria-labelledby="att-schedule-title">
        <h2 id="att-schedule-title" className="att-section-title">
          আজকের ক্লাস ও হালাকা
        </h2>
        {rows.length === 0 ? (
          <SystemState
            kind="empty"
            title="আজ আপনার কোনো ক্লাস বা হালাকা নেই"
            message="রুটিনে নতুন ক্লাস যোগ হলে এখানে দেখা যাবে।"
          />
        ) : (
          <ol className="att-schedule">
            {rows.map(({ r, cutoff, state, counts }) => {
              const label = cutoffLabel(state, cutoff);
              const draft = drafts.find((d) => d.registerId === r.id);
              return (
                <li key={r.id} className={`att-card ${state.kind}`}>
                  <div className="att-time">
                    <b>{clock(r.startMinutes)}</b>
                    <small>{r.shift}</small>
                  </div>
                  <div className="att-card-body">
                    <h3>{r.title}</h3>
                    <p className="att-meta">
                      <span>
                        <MapPin size={15} aria-hidden="true" /> {r.room}
                      </span>
                      <span>
                        <Users size={15} aria-hidden="true" /> {bn(counts.total)} জন
                      </span>
                      {!isTeacher && <span>{r.teacher}</span>}
                    </p>
                    <p className="att-progress">
                      চিহ্নিত {bn(counts.total - counts.unmarked)}/{bn(counts.total)}
                      {counts.absent > 0 && ` · অনুপস্থিত ${bn(counts.absent)}`}
                      {draft?.status === "queued" && " · এখনো পাঠানো হয়নি"}
                      {draft?.status === "draft" && " · খসড়া এই ফোনে"}
                    </p>
                    <span className={`ds-badge ${label.tone}`}>
                      <i className="status-dot" />
                      {label.text}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={`ds-button ${state.kind === "submitted" || state.kind === "upcoming" ? "secondary" : "primary"}`}
                    onClick={() => onOpen(r.id)}
                  >
                    {state.kind === "submitted" ? "দেখুন" : "হাজিরা নিন"}
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </>
  );
}

// ---------------------------------------------------------------- Register (S12)

type SubmitOutcome = ReturnType<typeof submitRegister> | { queued: true };

function RegisterView({
  register,
  server,
  draft,
  canMark,
  now,
  cutoff,
  offline,
  avatar,
  messagesSent,
  onBack,
  onChange,
  onSubmit,
  onCorrect,
}: {
  register: TeacherRegister;
  server: TeacherRegister;
  draft?: AttendanceDraft;
  canMark: boolean;
  now: number;
  cutoff: number;
  offline: boolean;
  avatar: (s: RegisterStudent) => "photo" | "initials";
  messagesSent: GuardianMessage[];
  onBack: () => void;
  onChange: (next: TeacherRegister) => void;
  onSubmit: (submissionId: string) => SubmitOutcome;
  onCorrect: (
    studentId: string,
    to: AttendanceMark,
    reason: string,
  ) => ReturnType<typeof correctMark>;
}) {
  const [onlyUnmarked, setOnlyUnmarked] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmUnmarked, setConfirmUnmarked] = useState(false);
  const [correcting, setCorrecting] = useState<RegisterStudent | null>(null);
  const [notice, setNotice] = useState<string>("");
  const submissionId = useRef<string>("");
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);

  const queued = draft?.status === "queued";
  const editable = canMark && server.status === "open" && !queued;
  const counts = registerCounts(register);
  const unmarked = unmarkedStudents(register);
  const state = cutoffState(server, now, cutoff);
  const label = cutoffLabel(state, cutoff);
  const rows = onlyUnmarked
    ? register.students.filter((s) => !register.marks[s.id])
    : register.students;

  const mark = (studentId: string, m: AttendanceMark) => {
    if (!editable) return;
    const same = register.marks[studentId] === m;
    onChange(setMark(register, studentId, same ? null : m));
  };

  const onRowKey = (e: KeyboardEvent<HTMLLIElement>, index: number, s: RegisterStudent) => {
    const found = markOrder.find((m) => markMeta[m].key === e.key);
    if (found) {
      e.preventDefault();
      mark(s.id, found);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      rowRefs.current[index + (e.key === "ArrowDown" ? 1 : -1)]?.focus();
    }
  };

  const openSheet = () => {
    submissionId.current ||= `SUB-${register.id}-${Date.now()}`;
    setConfirmUnmarked(false);
    setSheetOpen(true);
  };

  const submit = () => {
    const result = onSubmit(submissionId.current);
    setSheetOpen(false);
    if ("queued" in result) {
      setNotice("সংযোগ নেই — জমা এই ফোনে রাখা হলো। সংযোগ ফিরলে একবারই পাঠানো হবে।");
    } else if (result.ok) {
      const absent = result.messages.length;
      setNotice(
        `হাজিরা জমা হয়েছে।${absent ? ` ${bn(absent)} জন অনুপস্থিতের অভিভাবককে বার্তা যাচ্ছে।` : ""}${
          result.pendingUnmarked.length
            ? ` ${bn(result.pendingUnmarked.length)} জন চিহ্নহীন — শাখা প্রশাসকের তালিকায় গেল, কোনো বার্তা যাবে না।`
            : ""
        }`,
      );
    } else if (result.reason === "already-submitted") {
      setNotice("এই খাতা আগেই অন্য কেউ জমা দিয়েছেন। পরিবর্তন লাগলে সংশোধন ব্যবহার করুন।");
    }
  };

  return (
    <div className="att-register">
      <header className="att-reg-head">
        <button
          type="button"
          className="ds-button secondary att-back"
          onClick={onBack}
          aria-label="আজকের তালিকায় ফিরুন"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1>{register.title}</h1>
          <p className="att-meta">
            <span>
              {clock(register.startMinutes)} · {register.room}
            </span>
            {server.version > 1 && <span>সংস্করণ {bn(server.version)}</span>}
          </p>
        </div>
        <span className={`ds-badge ${label.tone}`}>
          <i className="status-dot" />
          {label.text}
        </span>
      </header>

      <dl className="att-counts" aria-label="হাজিরার সারাংশ">
        {markOrder.map((m) => (
          <div key={m} className={m}>
            <dt>{markMeta[m].label}</dt>
            <dd>{bn(counts[m])}</dd>
          </div>
        ))}
        <div className="unmarked">
          <dt>চিহ্নহীন</dt>
          <dd>{bn(counts.unmarked)}</dd>
        </div>
      </dl>

      {notice && (
        <p className="att-banner success" role="status">
          <CircleCheck size={18} aria-hidden="true" />
          <span>{notice}</span>
        </p>
      )}
      {queued && (
        <p className="att-banner info" role="status">
          <CloudOff size={18} aria-hidden="true" />
          <span>
            <b>এখনো পাঠানো হয়নি।</b> জমা এই ফোনে আছে ({clock(draft.capturedAtMinutes)})। সংযোগ ফিরলে
            নিজে থেকেই যাবে।
          </span>
        </p>
      )}
      {draft?.status === "draft" && !queued && (
        <p className="att-banner info" role="status">
          <CloudOff size={18} aria-hidden="true" />
          <span>খসড়া এই ফোনে সংরক্ষিত · {clock(draft.capturedAtMinutes)}</span>
        </p>
      )}
      {draft?.status === "conflict" && (
        <p className="att-banner danger" role="alert">
          <AlertTriangle size={18} aria-hidden="true" />
          <span>
            এই ফোনের খসড়া জমা হওয়া খাতার সঙ্গে মেলেনি। জমা হওয়া তথ্য বদলানো হয়নি — শাখা প্রশাসক মিলিয়ে দেখবেন।
          </span>
        </p>
      )}
      {!canMark && (
        <p className="att-banner info">
          <LockKeyhole size={18} aria-hidden="true" />
          <span>আপনি এই খাতা শুধু দেখতে পারেন।</span>
        </p>
      )}

      {editable && (
        <div className="att-toolbar">
          <button
            type="button"
            className="ds-button primary"
            onClick={() => onChange(markAllPresent(register))}
            disabled={counts.unmarked === 0}
          >
            <CheckCheck size={18} aria-hidden="true" /> সবাই উপস্থিত
          </button>
          <button
            type="button"
            className={`ds-button secondary ${counts.unmarked ? "has-unmarked" : ""}`}
            aria-pressed={onlyUnmarked}
            onClick={() => setOnlyUnmarked((v) => !v)}
          >
            <Filter size={18} aria-hidden="true" /> শুধু চিহ্নহীন ({bn(counts.unmarked)})
          </button>
          <p className="att-hint latin-hint">
            কীবোর্ড: সারিতে গিয়ে <kbd>1</kbd> উপস্থিত · <kbd>2</kbd> দেরি · <kbd>3</kbd> অনুপস্থিত ·{" "}
            <kbd>4</kbd> ছুটি · <kbd>↑</kbd>
            <kbd>↓</kbd> সারি বদল
          </p>
        </div>
      )}

      <ul className="att-list" aria-label="শিক্ষার্থীর তালিকা">
        {rows.length === 0 && <li className="att-list-empty">সবার হাজিরা চিহ্নিত হয়েছে।</li>}
        {rows.map((s, index) => {
          const current = register.marks[s.id];
          const kind = avatar(s);
          return (
            <li
              key={s.id}
              ref={(el) => {
                rowRefs.current[index] = el;
              }}
              tabIndex={editable ? 0 : -1}
              className={`att-row ${current ? "" : "unmarked"}`}
              onKeyDown={(e) => onRowKey(e, index, s)}
              aria-label={`${s.name}, রোল ${bn(s.roll)}, ${current ? markMeta[current].label : "চিহ্নহীন"}`}
            >
              <span
                className={`ds-avatar att-avatar ${kind}`}
                title={kind === "initials" ? "ছবি সীমিত" : undefined}
                aria-hidden="true"
              >
                {s.initials}
              </span>
              <span className="att-name">
                <b>{s.name}</b>
                <small>
                  রোল {bn(s.roll)}
                  {s.approvedLeave && " · অনুমোদিত ছুটি"}
                  {!current && " · চিহ্নহীন"}
                </small>
              </span>
              {server.status === "submitted" ? (
                <span className="att-final">
                  <span className={`ds-badge ${current ? markTone[current] : "neutral"}`}>
                    {current ? markMeta[current].label : "চিহ্নহীন"}
                  </span>
                  {canMark && (
                    <button
                      type="button"
                      className="ds-button secondary"
                      onClick={() => setCorrecting(s)}
                      aria-label={`${s.name} এর হাজিরা সংশোধন`}
                    >
                      <PencilLine size={16} aria-hidden="true" />
                    </button>
                  )}
                </span>
              ) : (
                <span className="att-marks" role="group" aria-label={`${s.name} এর হাজিরা`}>
                  {markOrder.map((m) => (
                    <button
                      key={m}
                      type="button"
                      tabIndex={-1}
                      disabled={!editable}
                      aria-pressed={current === m}
                      className={`${m} ${current === m ? "active" : ""}`}
                      onClick={() => mark(s.id, m)}
                      title={markMeta[m].label}
                    >
                      <span className="att-mark-short" aria-hidden="true">
                        {markMeta[m].short}
                      </span>
                      <span className="att-mark-long">{markMeta[m].label}</span>
                    </button>
                  ))}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {server.status === "submitted" && messagesSent.length > 0 && (
        <section className="att-sent" aria-label="অভিভাবকের বার্তা">
          <h2>অভিভাবকের কাছে যাওয়া বার্তা</h2>
          <ul>
            {messagesSent.map((m) => (
              <li key={m.key}>
                <span className={`ds-badge ${m.kind === "absent" ? "danger" : "info"}`}>
                  {m.kind === "absent" ? "অনুপস্থিতি" : "সংশোধনী"}
                </span>
                {m.text}
              </li>
            ))}
          </ul>
        </section>
      )}

      {server.history.length > 0 && (
        <section className="att-sent" aria-label="সংশোধনের ইতিহাস">
          <h2>সংশোধনের ইতিহাস</h2>
          <ul>
            {server.history.map((h) => (
              <li key={`${h.version}-${h.studentId}`}>
                সংস্করণ {bn(h.version)} · {register.students.find((s) => s.id === h.studentId)?.name}
                : {h.from ? markMeta[h.from].label : "চিহ্নহীন"} → {markMeta[h.to].label} · কারণ:{" "}
                {h.reason} · {clock(h.atMinutes)}
              </li>
            ))}
          </ul>
        </section>
      )}

      {editable && (
        <div className="att-submitbar">
          <span>{counts.unmarked ? `${bn(counts.unmarked)} জন চিহ্নহীন` : "সবার হাজিরা চিহ্নিত"}</span>
          <button type="button" className="ds-button primary" onClick={openSheet}>
            <Send size={18} aria-hidden="true" /> সারাংশ দেখে জমা দিন
          </button>
        </div>
      )}

      {sheetOpen && (
        <SummarySheet
          register={register}
          unmarked={unmarked}
          offline={offline}
          confirmUnmarked={confirmUnmarked}
          setConfirmUnmarked={setConfirmUnmarked}
          onClose={() => setSheetOpen(false)}
          onSubmit={submit}
        />
      )}
      {correcting && (
        <CorrectionDialog
          student={correcting}
          current={server.marks[correcting.id]}
          onClose={() => setCorrecting(null)}
          onSave={(to, reason) => {
            const result = onCorrect(correcting.id, to, reason);
            if (result.ok) {
              setCorrecting(null);
              setNotice(
                `সংশোধন সংরক্ষিত (সংস্করণ ${bn(result.register.version)})।${
                  result.message ? " অভিভাবককে সংশোধনী বার্তা যাচ্ছে।" : ""
                }`,
              );
            }
            return result;
          }}
        />
      )}
    </div>
  );
}

const markTone: Record<AttendanceMark, string> = {
  present: "success",
  late: "warning",
  absent: "danger",
  leave: "info",
};

function Dialog({
  title,
  onClose,
  children,
  labelledBy,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  labelledBy: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>("button, input, textarea, select")?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="att-sheet-shell">
      <div className="att-sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        className="att-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        ref={ref}
      >
        <header>
          <h2 id={labelledBy}>{title}</h2>
          <button
            type="button"
            className="ds-button secondary"
            onClick={onClose}
            aria-label="বন্ধ করুন"
          >
            <X size={18} />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

function SummarySheet({
  register,
  unmarked,
  offline,
  confirmUnmarked,
  setConfirmUnmarked,
  onClose,
  onSubmit,
}: {
  register: TeacherRegister;
  unmarked: RegisterStudent[];
  offline: boolean;
  confirmUnmarked: boolean;
  setConfirmUnmarked: (v: boolean) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const counts = registerCounts(register);
  const absent = register.students.filter((s) => register.marks[s.id] === "absent");
  return (
    <Dialog title="জমা দেওয়ার আগে সারাংশ" onClose={onClose} labelledBy="att-summary-title">
      <dl className="att-counts compact">
        {markOrder.map((m) => (
          <div key={m} className={m}>
            <dt>{markMeta[m].label}</dt>
            <dd>{bn(counts[m])}</dd>
          </div>
        ))}
        <div className="unmarked">
          <dt>চিহ্নহীন</dt>
          <dd>{bn(counts.unmarked)}</dd>
        </div>
      </dl>
      {absent.length > 0 && (
        <div className="att-sheet-block">
          <b>অনুপস্থিত — জমা হলে অভিভাবক একবার বার্তা পাবেন</b>
          <ul>
            {absent.map((s) => (
              <li key={s.id}>{s.name}</li>
            ))}
          </ul>
        </div>
      )}
      {unmarked.length > 0 && (
        <div className="att-sheet-block warning">
          <b>{bn(unmarked.length)} জন এখনো চিহ্নহীন</b>
          <p>চিহ্নহীন মানে অনুপস্থিত নয়। এঁদের অভিভাবককে কোনো বার্তা যাবে না; নাম শাখা প্রশাসকের তালিকায় যাবে।</p>
          <ul>
            {unmarked.map((s) => (
              <li key={s.id}>{s.name}</li>
            ))}
          </ul>
          <label className="att-check">
            <input
              type="checkbox"
              checked={confirmUnmarked}
              onChange={(e) => setConfirmUnmarked(e.target.checked)}
            />
            <span>বুঝেছি, চিহ্নহীন রেখেই জমা দেব</span>
          </label>
        </div>
      )}
      <footer>
        <button type="button" className="ds-button secondary" onClick={onClose}>
          ফিরে গিয়ে চিহ্ন দিন
        </button>
        <button
          type="button"
          className="ds-button primary"
          disabled={unmarked.length > 0 && !confirmUnmarked}
          onClick={onSubmit}
        >
          <Send size={18} aria-hidden="true" /> {offline ? "ফোনে রেখে দিন" : "জমা দিন"}
        </button>
      </footer>
    </Dialog>
  );
}

function CorrectionDialog({
  student,
  current,
  onClose,
  onSave,
}: {
  student: RegisterStudent;
  current?: AttendanceMark;
  onClose: () => void;
  onSave: (to: AttendanceMark, reason: string) => ReturnType<typeof correctMark>;
}) {
  const [to, setTo] = useState<AttendanceMark>(current === "absent" ? "present" : "absent");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const errors: Record<string, string> = {
    "reason-required": "সংশোধনের কারণ লিখুন (কমপক্ষে ৫ অক্ষর)।",
    locked: "দিনের খাতা বন্ধ হয়ে গেছে। সংশোধনের জন্য শাখা প্রশাসকের অনুমোদন লাগবে।",
    "no-change": "আগের চিহ্নই বেছে নেওয়া হয়েছে।",
    "not-submitted": "খাতা এখনো জমা হয়নি।",
  };
  return (
    <Dialog
      title={`হাজিরা সংশোধন · ${student.name}`}
      onClose={onClose}
      labelledBy="att-correct-title"
    >
      <p className="att-sheet-note">
        এখন: {current ? markMeta[current].label : "চিহ্নহীন"}। সংশোধনে নতুন সংস্করণ তৈরি হবে, আগেরটি
        ইতিহাসে থাকবে।
      </p>
      <fieldset className="att-marks wide">
        <legend>নতুন চিহ্ন</legend>
        {markOrder.map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={to === m}
            className={`${m} ${to === m ? "active" : ""}`}
            onClick={() => setTo(m)}
          >
            <span className="att-mark-long">{markMeta[m].label}</span>
          </button>
        ))}
      </fieldset>
      <label className="att-reason">
        <span>কারণ (আবশ্যক)</span>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
      </label>
      {error && (
        <p className="att-error" role="alert">
          {error}
        </p>
      )}
      <footer>
        <button type="button" className="ds-button secondary" onClick={onClose}>
          বাতিল
        </button>
        <button
          type="button"
          className="ds-button primary"
          onClick={() => {
            const result = onSave(to, reason);
            if (!result.ok) setError(errors[result.reason]);
          }}
        >
          সংশোধন সংরক্ষণ
        </button>
      </footer>
    </Dialog>
  );
}
