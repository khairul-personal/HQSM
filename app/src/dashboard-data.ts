/** Demo data for the B3 principal dashboard. Browser-local mock, fixed "today" so numbers stay stable. */
import type {
  AttendanceRegister,
  DashboardEvent,
  DashboardFund,
  DashboardInvoice,
  Enrollment,
  HifzStudent,
  HomeworkLine,
  MoneyEntry,
  PendingApproval,
} from "./dashboard-domain";

export const demoToday = "2026-11-08";
export const demoNowMinutes = 9 * 60 + 40; // ০৯:৪০
export const attendanceCutoffMinutes = 9 * 60; // morning cutoff ০৯:০০
export const sessions = ["2026", "2025"];

/** Minutes after midnight when each card's data was last refreshed. */
export const lastUpdated = {
  students: 7 * 60 + 30,
  attendance: 9 * 60 + 38,
  collection: 9 * 60 + 35,
  dues: 6 * 60,
  funds: 9 * 60 + 10,
  hifz: 8 * 60 + 45,
  homework: 9 * 60 + 20,
  approvals: 9 * 60 + 39,
  events: 6 * 60,
} as const;

const make = (
  count: number,
  prefix: string,
  branch: Enrollment["branch"],
  residentialEvery: number,
  session = "2026",
): Enrollment[] =>
  Array.from({ length: count }, (_, i) => ({
    studentId: `${prefix}-${i + 1}`,
    branch,
    session,
    status: i % 41 === 40 ? "left" : "active",
    residential: i % residentialEvery === 0,
  }));

export const enrollments: Enrollment[] = [
  ...make(742, "B", "boys", 2),
  ...make(531, "G", "girls", 3),
  ...make(60, "OLD", "boys", 2, "2025"),
];

const ids = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => `${prefix}${i + 1}`);
const marks = (
  prefix: string,
  present: number,
  late: number,
  absent: number,
  leave: number,
): AttendanceRegister["marks"] => {
  const out: AttendanceRegister["marks"] = {};
  let n = 1;
  for (const [mark, count] of [
    ["present", present],
    ["late", late],
    ["absent", absent],
    ["leave", leave],
  ] as const)
    for (let i = 0; i < count; i += 1) out[`${prefix}${n++}`] = mark;
  return out;
};

export const registers: AttendanceRegister[] = [
  {
    id: "REG-H1",
    label: "হিফজ · হালাকা ক",
    branch: "boys",
    teacher: "উস্তাদ সালমান",
    studentIds: ids("h1-", 24),
    marks: marks("h1-", 21, 1, 1, 1),
    submitted: true,
  },
  {
    id: "REG-H2",
    label: "হিফজ · হালাকা খ",
    branch: "boys",
    teacher: "হাফেজ ইমরান",
    studentIds: ids("h2-", 22),
    marks: marks("h2-", 9, 0, 0, 0),
    submitted: false,
  },
  {
    id: "REG-K5",
    label: "কিতাব · ৫ম ক",
    branch: "boys",
    teacher: "মাওলানা রফিক",
    studentIds: ids("k5-", 38),
    marks: marks("k5-", 33, 2, 2, 1),
    submitted: true,
  },
  {
    id: "REG-G1",
    label: "বালিকা হিফজ · হালাকা ক",
    branch: "girls",
    teacher: "উস্তাযা মারইয়াম",
    studentIds: ids("g1-", 20),
    marks: marks("g1-", 18, 1, 0, 1),
    submitted: true,
  },
  {
    id: "REG-G6",
    label: "বালিকা · ৬ষ্ঠ খ",
    branch: "girls",
    teacher: "উস্তাযা খাদিজা",
    studentIds: ids("g6-", 31),
    marks: {},
    submitted: false,
  },
];

const posted = { status: "posted" as const, date: demoToday };
export const moneyEntries: MoneyEntry[] = [
  {
    ...posted,
    id: "RCP-26-0911",
    kind: "fee",
    type: "receipt",
    branch: "boys",
    amountPaisa: 4_850_000,
  },
  {
    ...posted,
    id: "RCP-26-0912",
    kind: "fee",
    type: "receipt",
    branch: "girls",
    amountPaisa: 2_120_000,
  },
  {
    ...posted,
    id: "RFD-26-0031",
    kind: "fee",
    type: "refund",
    branch: "boys",
    amountPaisa: 150_000,
  },
  {
    ...posted,
    id: "ALC-26-0207",
    kind: "fund-allocation",
    type: "receipt",
    branch: "boys",
    amountPaisa: 1_200_000,
  },
  {
    ...posted,
    id: "ALC-26-0208",
    kind: "fund-allocation",
    type: "receipt",
    branch: "girls",
    amountPaisa: 600_000,
  },
  {
    ...posted,
    id: "DON-26-0412",
    kind: "donation",
    type: "receipt",
    branch: "boys",
    amountPaisa: 2_500_000,
  },
  {
    id: "RCP-26-0913",
    kind: "fee",
    type: "receipt",
    status: "draft",
    date: demoToday,
    branch: "boys",
    amountPaisa: 300_000,
  },
];

const invoice = (
  id: string,
  studentName: string,
  branch: DashboardInvoice["branch"],
  dueDate: string,
  netPaisa: number,
  paidPaisa = 0,
): DashboardInvoice => ({
  id,
  studentId: id,
  studentName,
  branch,
  session: "2026",
  dueDate,
  netPaisa,
  paidPaisa,
});

export const invoices: DashboardInvoice[] = [
  invoice("INV-26-1104", "মুহাম্মদ আবদুল্লাহ", "boys", "2026-10-31", 250_000),
  invoice("INV-26-1088", "ফাতিমা আক্তার", "girls", "2026-10-15", 320_000, 120_000),
  invoice("INV-26-0977", "উমর ফারুক", "boys", "2026-09-30", 450_000),
  invoice("INV-26-0921", "যায়নাব বিনতে হাসান", "girls", "2026-09-10", 280_000),
  invoice("INV-26-0802", "ইউসুফ আলী", "boys", "2026-08-05", 600_000, 100_000),
  invoice("INV-26-1150", "আয়েশা সিদ্দিকা", "girls", "2026-11-20", 300_000),
];

export const funds: DashboardFund[] = [
  {
    id: "zakat",
    name: "যাকাত",
    balancePaisa: 48_500_000,
    unpaidPledgesPaisa: 12_000_000,
    eligibleFeeHeads: [],
    allocatedThisMonthPaisa: 6_400_000,
  },
  {
    id: "lillah",
    name: "লিল্লাহ",
    balancePaisa: 21_300_000,
    unpaidPledgesPaisa: 0,
    eligibleFeeHeads: [],
    allocatedThisMonthPaisa: 2_150_000,
  },
  {
    id: "orphan",
    name: "এতিম",
    balancePaisa: 9_800_000,
    unpaidPledgesPaisa: 3_000_000,
    eligibleFeeHeads: [],
    allocatedThisMonthPaisa: 1_800_000,
  },
  {
    id: "general",
    name: "সাধারণ",
    balancePaisa: 15_250_000,
    unpaidPledgesPaisa: 0,
    eligibleFeeHeads: [],
    allocatedThisMonthPaisa: 0,
  },
  {
    id: "construction",
    name: "নির্মাণ",
    balancePaisa: 62_000_000,
    unpaidPledgesPaisa: 25_000_000,
    eligibleFeeHeads: [],
    allocatedThisMonthPaisa: 0,
  },
];

export const hifzStudents: HifzStudent[] = [
  {
    studentId: "STU-10241",
    name: "আবদুর রহমান",
    halaqa: "হালাকা ক",
    branch: "boys",
    approvedPages: 38,
    targetPages: 40,
  },
  {
    studentId: "STU-10237",
    name: "হাসান মাহমুদ",
    halaqa: "হালাকা ক",
    branch: "boys",
    approvedPages: 22,
    targetPages: 40,
  },
  {
    studentId: "STU-10233",
    name: "তামিম ইকবাল",
    halaqa: "হালাকা খ",
    branch: "boys",
    approvedPages: 35,
    targetPages: 40,
  },
  {
    studentId: "STU-10229",
    name: "সাদ বিন ওয়াক্কাস",
    halaqa: "হালাকা খ",
    branch: "boys",
    approvedPages: 26,
    targetPages: 40,
  },
  {
    studentId: "STU-20114",
    name: "মারইয়াম জামান",
    halaqa: "বালিকা হালাকা ক",
    branch: "girls",
    approvedPages: 40,
    targetPages: 40,
  },
  {
    studentId: "STU-20118",
    name: "সুমাইয়া ইসলাম",
    halaqa: "বালিকা হালাকা ক",
    branch: "girls",
    approvedPages: 27,
    targetPages: 40,
  },
];

export const homeworkLines: HomeworkLine[] = [
  {
    id: "HW-501",
    classLabel: "৫ম ক · আরবি",
    branch: "boys",
    dueDate: "2026-11-05",
    assigned: 38,
    submitted: 31,
    checked: 28,
  },
  {
    id: "HW-502",
    classLabel: "৬ষ্ঠ খ · বাংলা",
    branch: "girls",
    dueDate: "2026-11-07",
    assigned: 31,
    submitted: 29,
    checked: 12,
  },
  {
    id: "HW-503",
    classLabel: "৭ম ক · গণিত",
    branch: "boys",
    dueDate: "2026-11-10",
    assigned: 35,
    submitted: 14,
    checked: 6,
  },
  {
    id: "HW-504",
    classLabel: "৮ম ক · ফিকহ",
    branch: "girls",
    dueDate: "2026-11-03",
    assigned: 27,
    submitted: 27,
    checked: 27,
  },
];

export const pendingApprovals: PendingApproval[] = [
  {
    id: "APR-3301",
    kind: "refund",
    title: "ভর্তি ফি ফেরত · উমর ফারুক",
    branch: "boys",
    createdAt: "2026-11-07",
    creatorId: "EMP-CASH-02",
    amountPaisa: 500_000,
  },
  {
    id: "APR-3298",
    kind: "concession",
    title: "এতিম ছাড় ব্যতিক্রম · যায়নাব",
    branch: "girls",
    createdAt: "2026-11-06",
    creatorId: "EMP-ACC-01",
    exception: true,
  },
  {
    id: "APR-3290",
    kind: "admission",
    title: "নতুন ভর্তি · ৩টি আবেদন",
    branch: "boys",
    createdAt: "2026-11-02",
    creatorId: "EMP-ADMISSION-001",
  },
  {
    id: "APR-3305",
    kind: "leave",
    title: "ছুটি · হাফেজ ইমরান (২ দিন)",
    branch: "boys",
    createdAt: "2026-11-08",
    creatorId: "EMP-031",
  },
  {
    id: "APR-3302",
    kind: "question-paper",
    title: "প্রশ্নপত্র · ৭ম গণিত অর্ধবার্ষিক",
    branch: "boys",
    createdAt: "2026-11-07",
    creatorId: "EC-001",
  },
  {
    id: "APR-3299",
    kind: "result",
    title: "ফলাফল প্রকাশ · বালিকা ৬ষ্ঠ",
    branch: "girls",
    createdAt: "2026-11-07",
    creatorId: "EC-001",
  },
];

export const events: DashboardEvent[] = [
  {
    id: "EV-1",
    kind: "holiday",
    title: "সাপ্তাহিক ছুটি পরিবর্তন (শুক্র)",
    date: "2026-11-13",
    branch: "all",
  },
  { id: "EV-2", kind: "exam", title: "অর্ধবার্ষিক পরীক্ষা শুরু", date: "2026-11-16", branch: "all" },
  { id: "EV-3", kind: "notice", title: "অভিভাবক সভা · বালিকা শাখা", date: "2026-11-11", branch: "girls" },
  {
    id: "EV-4",
    kind: "routine-conflict",
    title: "রুটিন সংঘাত · মাওলানা রফিক (৩য় ঘণ্টা)",
    date: "2026-11-09",
    branch: "boys",
  },
  { id: "EV-5", kind: "event", title: "খতমে কুরআন অনুষ্ঠান", date: "2026-11-21", branch: "boys" },
];
