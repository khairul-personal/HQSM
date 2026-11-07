import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Building2,
  Check,
  ChevronRight,
  ClipboardList,
  Download,
  FileText,
  Filter,
  Globe2,
  GraduationCap,
  Library,
  MessageSquareText,
  Package,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
  X,
} from "lucide-react";

export type MadrasaModule = {
  id: string;
  title: string;
  category: string;
  priority: "P0" | "P1" | "P2";
  owner: string;
  description: string;
  action: string;
  workflow: string[];
  features: string[];
  records: [string, string, string][];
};

export const modules: MadrasaModule[] = [
  {
    id: "M01",
    title: "প্রতিষ্ঠান ও একাডেমিক সেটআপ",
    category: "প্রতিষ্ঠান",
    priority: "P0",
    owner: "Institution Admin",
    description: "শাখা, সেশন, বিভাগ, জামাত, বিষয় ও প্রতিষ্ঠানের নীতিমালা পরিচালনা করুন।",
    action: "নতুন সেটআপ",
    workflow: ["প্রোফাইল", "সেশন", "ক্লাস", "ফি ও গ্রেড"],
    features: ["শাখা ও ক্যাম্পাস", "সেশন ও টার্ম", "গ্রেডিং নীতিমালা"],
    records: [
      ["প্রধান শাখা", "ঢাকা · ২০২৬ সেশন", "সক্রিয়"],
      ["মিরপুর শাখা", "ঢাকা · ২০২৬ সেশন", "সক্রিয়"],
      ["হিফজ বিভাগ", "৮টি হালাকা", "সক্রিয়"],
    ],
  },
  {
    id: "M02",
    title: "ভর্তি ব্যবস্থাপনা",
    category: "প্রতিষ্ঠান",
    priority: "P0",
    owner: "Admission Officer",
    description: "অনলাইন ও অফিস আবেদন যাচাই করে অনুমোদিত শিক্ষার্থী হিসেবে অন্তর্ভুক্ত করুন।",
    action: "নতুন আবেদন",
    workflow: ["খসড়া", "জমা", "পর্যালোচনা", "ভর্তি সম্পন্ন"],
    features: ["আবেদন যাচাই", "ডকুমেন্ট চেকলিস্ট", "আসন সক্ষমতা"],
    records: [
      ["আয়েশা সিদ্দিকা", "APP-2026-0142 · নূরানী", "পর্যালোচনায়"],
      ["মুহাম্মদ ইয়াসিন", "APP-2026-0141 · হিফজ", "অনুমোদিত"],
      ["মারইয়াম বিনতে আলী", "APP-2026-0139 · প্রথম শ্রেণি", "অপেক্ষমাণ"],
    ],
  },
  {
    id: "M03",
    title: "শিক্ষার্থী ও অভিভাবক",
    category: "একাডেমিক",
    priority: "P0",
    owner: "Academic Admin",
    description: "শিক্ষার্থী, অভিভাবক সম্পর্ক, ভর্তি ইতিহাস ও সহায়তার তথ্য এক প্রোফাইলে রাখুন।",
    action: "শিক্ষার্থী যোগ করুন",
    workflow: ["প্রোফাইল", "অভিভাবক", "এনরোলমেন্ট", "যাচাই"],
    features: ["শিক্ষার্থী প্রোফাইল", "Guardian link", "Bulk import"],
    records: [
      ["মুহাম্মদ আবদুল্লাহ", "STU-10241 · হিফজ", "সক্রিয়"],
      ["ফাতিমা তুয যাহরা", "STU-10240 · নূরানী", "সক্রিয়"],
      ["আহমাদ বিন হাসান", "STU-10239 · মিশকাত", "ছুটিতে"],
    ],
  },
  {
    id: "M04",
    title: "শিক্ষক ও কর্মচারী",
    category: "একাডেমিক",
    priority: "P0",
    owner: "HR / Admin",
    description: "কর্মী পরিচয়, দায়িত্ব, ক্লাস বরাদ্দ ও module permission পরিচালনা করুন।",
    action: "কর্মী যোগ করুন",
    workflow: ["প্রোফাইল", "দায়িত্ব", "অনুমতি", "সক্রিয়"],
    features: ["কর্মী প্রোফাইল", "শিক্ষক বরাদ্দ", "কাজের প্রতিবেদন"],
    records: [
      ["উস্তাদ আবদুর রহমান", "EMP-024 · হিফজ শিক্ষক", "সক্রিয়"],
      ["মাওলানা নাঈম", "EMP-019 · মুহাদ্দিস", "সক্রিয়"],
      ["মোঃ সালেহ", "EMP-031 · হিসাবরক্ষক", "সক্রিয়"],
    ],
  },
  {
    id: "M05",
    title: "উপস্থিতি ও চলাচল",
    category: "একাডেমিক",
    priority: "P0",
    owner: "শিক্ষক / HR",
    description: "শিক্ষার্থী ও কর্মীদের হাজিরা, ছুটি, gate movement এবং correction পরিচালনা করুন।",
    action: "হাজিরা নিন",
    workflow: ["রেজিস্টার খোলা", "খসড়া সংরক্ষণ", "জমা", "চূড়ান্ত"],
    features: ["Bulk attendance", "Gate log", "Correction request"],
    records: [
      ["হিফজ—হালাকা ১", "আজ · ২৮/৩০ চিহ্নিত", "খসড়া"],
      ["মিশকাত জামাত", "আজ · ৩৮/৩৮ চিহ্নিত", "চূড়ান্ত"],
      ["নূরানী—ক", "আজ · ২৪/২৬ চিহ্নিত", "অসম্পূর্ণ"],
    ],
  },
  {
    id: "M06",
    title: "হিফজ ও পড়াশোনার ডায়েরি",
    category: "একাডেমিক",
    priority: "P0",
    owner: "Assigned Teacher",
    description: "সবক, সবকিয়া, আমুক্তা, homework এবং ব্যক্তিগত অগ্রগতি অনুসরণ করুন।",
    action: "ডায়েরি লিখুন",
    workflow: ["লক্ষ্য", "দৈনিক এন্ট্রি", "শিক্ষক যাচাই", "অভিভাবক সারাংশ"],
    features: ["সবক ও revision", "Study diary", "অগ্রগতি chart"],
    records: [
      ["মুহাম্মদ আবদুল্লাহ", "পারা ১২ · সূরা হুদ", "লক্ষ্যে"],
      ["ইয়াসিন আরাফাত", "পারা ৮ · সূরা আনআম", "ফলো-আপ"],
      ["সাদ ইবনে আমিন", "পারা ১৫ · সূরা ইসরা", "লক্ষ্যে"],
    ],
  },
  {
    id: "M07",
    title: "পরীক্ষা ও ফলাফল",
    category: "একাডেমিক",
    priority: "P0",
    owner: "Exam Controller",
    description: "পরীক্ষার নিয়ম, নম্বর, review, lock ও versioned ফলাফল প্রকাশ করুন।",
    action: "পরীক্ষা তৈরি",
    workflow: ["খসড়া", "নম্বর এন্ট্রি", "Review", "প্রকাশিত"],
    features: ["Marks entry", "Result version", "Tabulation"],
    records: [
      ["অর্ধবার্ষিক পরীক্ষা", "মিশকাত · ৮/১০ বিষয়", "নম্বর এন্ট্রি"],
      ["হিফজ মাসিক মূল্যায়ন", "সকল হালাকা", "Review"],
      ["প্রথম সাময়িক পরীক্ষা", "নূরানী", "প্রকাশিত"],
    ],
  },
  {
    id: "M08",
    title: "কার্ড, সনদ ও আসন পরিকল্পনা",
    category: "একাডেমিক",
    priority: "P0",
    owner: "Academic Admin",
    description: "ID, admit, certificate, QR verification ও পরীক্ষার seat plan তৈরি করুন।",
    action: "নথি তৈরি",
    workflow: ["Template", "Preview", "Issue", "Verify"],
    features: ["ID ও Admit card", "Certificate QR", "Seat allocation"],
    records: [
      ["অর্ধবার্ষিক Admit Card", "মিশকাত · ৩৮ জন", "খসড়া"],
      ["শিক্ষার্থী ID Batch", "নতুন ভর্তি · ৪২ জন", "প্রস্তুত"],
      ["Transfer Certificate", "TC-2026-018", "ইস্যু করা"],
    ],
  },
  {
    id: "M09",
    title: "বেফাক ও অন্য বোর্ডের প্রস্তুতি",
    category: "একাডেমিক",
    priority: "P1",
    owner: "Board Coordinator",
    description: "বোর্ড আবেদন, eligibility, নথি, deadline ও external submission track করুন।",
    action: "Board batch তৈরি",
    workflow: ["প্রস্তুত", "বাহিরে জমা", "স্বীকৃত", "সম্পন্ন"],
    features: ["Eligibility checklist", "Candidate export", "Result import"],
    records: [
      ["বেফাক ৪৭তম পরীক্ষা", "ফযীলত · ২৮ পরীক্ষার্থী", "প্রস্তুত"],
      ["হাইআতুল উলয়া", "দাওরায়ে হাদিস · ১৮ জন", "বাহিরে জমা"],
      ["বোর্ড ফলাফল ২০২৫", "Source verified", "সম্পন্ন"],
    ],
  },
  {
    id: "M10",
    title: "ফি, ইনভয়েস ও পেমেন্ট",
    category: "অর্থ",
    priority: "P0",
    owner: "Accountant",
    description: "ফি rule, invoice, partial payment, বকেয়া, receipt ও refund পরিচালনা করুন।",
    action: "পেমেন্ট নিন",
    workflow: ["Invoice", "Pending / Partial", "Paid", "Reconcile"],
    features: ["Recurring invoice", "Partial payment", "Receipt ও refund"],
    records: [
      ["INV-2026-1842", "মুহাম্মদ আবদুল্লাহ · ৳ ৩,০০০", "আংশিক"],
      ["INV-2026-1841", "ফাতিমা তুয যাহরা · ৳ ২,৫০০", "পরিশোধিত"],
      ["INV-2026-1838", "আহমাদ বিন হাসান · ৳ ৪,০০০", "বকেয়া"],
    ],
  },
  {
    id: "M11",
    title: "হিসাব, ফান্ড ও দান",
    category: "অর্থ",
    priority: "P0",
    owner: "Finance Lead",
    description: "Cashbook, balanced ledger, expense, donation ও restricted fund পরিচালনা করুন।",
    action: "লেনদেন যোগ করুন",
    workflow: ["খসড়া voucher", "Review", "Posted", "Period close"],
    features: ["Chart of accounts", "ফান্ড ledger", "Donor receipt"],
    records: [
      ["DON-2026-0084", "সদকা ফান্ড · ৳ ২৫,০০০", "Posted"],
      ["EXP-2026-0241", "লাইব্রেরি বই · ৳ ৮,২০০", "অনুমোদন বাকি"],
      ["JV-2026-1102", "Cash to Bank · ৳ ৫০,০০০", "Balanced"],
    ],
  },
  {
    id: "M12",
    title: "রুটিন, নোটিশ ও ক্যালেন্ডার",
    category: "যোগাযোগ",
    priority: "P0",
    owner: "Academic Admin",
    description: "Teacher-room conflict ছাড়া routine, targeted notice ও calendar প্রকাশ করুন।",
    action: "নোটিশ তৈরি",
    workflow: ["খসড়া", "Conflict check", "অনুমোদন", "প্রকাশ"],
    features: ["Class routine", "Targeted notice", "Event calendar"],
    records: [
      ["শীতকালীন রুটিন", "প্রধান শাখা · সকল জামাত", "প্রকাশিত"],
      ["অর্ধবার্ষিক পরীক্ষার নোটিশ", "অভিভাবক ও শিক্ষার্থী", "Scheduled"],
      ["শুক্রবারের বিশেষ অনুষ্ঠান", "৭ নভেম্বর · হল রুম", "খসড়া"],
    ],
  },
  {
    id: "M13",
    title: "HR, পে-রোল ও ছুটি",
    category: "প্রশাসন",
    priority: "P1",
    owner: "HR / Finance",
    description: "ছুটি, salary structure, payroll batch, payslip ও offboarding পরিচালনা করুন।",
    action: "Payroll batch",
    workflow: ["Cutoff", "খসড়া", "অনুমোদন", "Paid"],
    features: ["Leave calendar", "Salary structure", "Payslip"],
    records: [
      ["Payroll—অক্টোবর ২০২৬", "৮৭ কর্মী · ৳ ১৮,৪০,০০০", "অনুমোদন বাকি"],
      ["মাওলানা নাঈম", "ছুটি · ৮–১০ নভেম্বর", "অনুমোদিত"],
      ["Salary adjustment", "EMP-031 · ৳ ২,০০০", "খসড়া"],
    ],
  },
  {
    id: "M14",
    title: "ক্রয়, মজুত, ক্যান্টিন ও সম্পদ",
    category: "প্রশাসন",
    priority: "P1",
    owner: "Storekeeper / Finance",
    description: "Requisition থেকে purchase, stock movement, POS ও asset register পরিচালনা করুন।",
    action: "Requisition তৈরি",
    workflow: ["Requisition", "PO", "Goods received", "Payment"],
    features: ["Purchase order", "Stock ledger", "Asset register"],
    records: [
      ["PO-2026-0048", "খাতা ও স্টেশনারি · ৳ ২৪,৫০০", "আংশিক প্রাপ্ত"],
      ["চাল—৫০ কেজি", "কেন্দ্রীয় স্টোর · ১২ বস্তা", "মজুত আছে"],
      ["প্রজেক্টর EP-04", "হল রুম · EMP-019", "বরাদ্দ"],
    ],
  },
  {
    id: "M15",
    title: "হোস্টেল, মেস ও গেট পাস",
    category: "প্রশাসন",
    priority: "P1",
    owner: "Hostel Supervisor",
    description: "Room-bed allocation, meal count, leave pass ও visitor movement পরিচালনা করুন।",
    action: "বরাদ্দ দিন",
    workflow: ["আবেদন", "যাচাই", "অনুমোদন", "Check-in"],
    features: ["Bed allocation", "Mess register", "Gate pass"],
    records: [
      ["রুম ২০৪ · বেড B", "মুহাম্মদ ইয়াসিন · হিফজ", "বরাদ্দ"],
      ["GP-2026-0184", "আহমাদ · বাড়ি যাওয়ার ছুটি", "অনুমোদিত"],
      ["নভেম্বর Mess count", "১২৮ আবাসিক", "চলমান"],
    ],
  },
  {
    id: "M16",
    title: "লাইব্রেরি ব্যবস্থাপনা",
    category: "প্রশাসন",
    priority: "P1",
    owner: "Librarian",
    description: "Catalogue, physical copy, issue-return, reservation ও overdue track করুন।",
    action: "বই Issue করুন",
    workflow: ["Catalogue", "Issue", "Renew", "Return"],
    features: ["Book catalogue", "Issue ও return", "Stock verification"],
    records: [
      ["সহীহ আল-বুখারী—কপি ০৪", "ACC-00184 · Shelf H-02", "Issue করা"],
      ["তাফসীরে ইবনে কাসীর—০২", "ACC-00312 · Shelf T-01", "Available"],
      ["আর-রাহীকুল মাখতুম—০৮", "Due ৪ নভেম্বর", "Overdue"],
    ],
  },
  {
    id: "M17",
    title: "SMS, ইমেইল ও বার্তা",
    category: "যোগাযোগ",
    priority: "P0",
    owner: "Authorised Operator",
    description: "Template, audience, cost preview, delivery status ও retry সহ বার্তা পাঠান।",
    action: "বার্তা লিখুন",
    workflow: ["খসড়া", "Preview", "Queued", "Delivered"],
    features: ["SMS template", "Recipient scope", "Delivery log"],
    records: [
      ["ফি পরিশোধের রসিদ", "৮৬ recipient · SMS", "Delivered"],
      ["অনুপস্থিতি সতর্কতা", "৫৮ recipient · SMS", "Queued"],
      ["পরীক্ষার নোটিশ", "১,২৪৮ recipient · In-app", "খসড়া"],
    ],
  },
  {
    id: "M18",
    title: "অভিভাবক ও শিক্ষার্থী পোর্টাল",
    category: "পোর্টাল",
    priority: "P0",
    owner: "Guardian / Student",
    description: "Verified account থেকে সন্তানভিত্তিক হাজিরা, ফলাফল, ফি ও notice দেখুন।",
    action: "Portal preview",
    workflow: ["Account verify", "Child link", "Access", "Self-service"],
    features: ["Child switch", "Fee ও result", "Service request"],
    records: [
      ["আব্দুল করিম", "২ সন্তান linked", "Verified"],
      ["সালমা আক্তার", "১ সন্তান linked", "Verified"],
      ["Guardian request #018", "Phone change request", "Review"],
    ],
  },
  {
    id: "M19",
    title: "শৃঙ্খলা, অভিযোগ ও সহায়তা",
    category: "প্রশাসন",
    priority: "P0",
    owner: "Designated Staff",
    description: "Restricted incident, complaint, wellbeing support ও ন্যায্য follow-up রাখুন।",
    action: "Case তৈরি",
    workflow: ["Reported", "Review", "Follow-up", "Closed"],
    features: ["Incident case", "Helpdesk ticket", "Restricted note"],
    records: [
      ["CASE-2026-0041", "শিক্ষার্থী সহায়তা · Priority medium", "Follow-up"],
      ["TKT-2026-0098", "অভিভাবকের অভিযোগ", "Review"],
      ["CASE-2026-0039", "Counselling referral", "Closed"],
    ],
  },
  {
    id: "M20",
    title: "সমন্বিত ওয়েবসাইট",
    category: "পোর্টাল",
    priority: "P1",
    owner: "Website Editor",
    description:
      "Public page, admission, notice, gallery, domain ও publishing workflow পরিচালনা করুন।",
    action: "পৃষ্ঠা তৈরি",
    workflow: ["খসড়া", "Preview", "অনুমোদন", "Published"],
    features: ["Page editor", "Admission form", "SEO ও domain"],
    records: [
      ["ভর্তি তথ্য ২০২৭", "/admission-2027", "খসড়া"],
      ["প্রতিষ্ঠান পরিচিতি", "/about", "Published"],
      ["বার্ষিক মাহফিল", "/events/mahfil", "Scheduled"],
    ],
  },
  {
    id: "M21",
    title: "মোবাইল, PWA ও ভাষা",
    category: "সিস্টেম",
    priority: "P0",
    owner: "Product Team",
    description: "Responsive PWA, offline draft, BN/EN ভাষা ও mobile session পরিচালনা করুন।",
    action: "PWA সেটিংস",
    workflow: ["Configure", "Install", "Sync", "Monitor"],
    features: ["PWA install", "Offline draft", "BN / EN locale"],
    records: [
      ["PWA release 1.4.0", "Installable · Web", "সক্রিয়"],
      ["বাংলা ভাষা", "১০০% core UI", "সক্রিয়"],
      ["Offline attendance", "Draft-only policy", "সক্রিয়"],
    ],
  },
  {
    id: "M22",
    title: "স্মার্ট AI ও প্রশ্নের খসড়া",
    category: "সিস্টেম",
    priority: "P2",
    owner: "Academic Lead",
    description:
      "Approved knowledge থেকে source-aware উত্তর ও teacher-reviewed প্রশ্নের draft তৈরি করুন।",
    action: "AI draft তৈরি",
    workflow: ["Source নির্বাচন", "Draft", "শিক্ষক Review", "অনুমোদন"],
    features: ["Knowledge assistant", "Question draft", "Usage audit"],
    records: [
      ["হাদিস প্রশ্নপত্র Draft", "মিশকাত · ৫০ নম্বর", "Teacher review"],
      ["ভর্তি FAQ assistant", "১২ approved source", "সক্রিয়"],
      ["তাফসীর MCQ batch", "সূরা বাকারা · ২০ প্রশ্ন", "খসড়া"],
    ],
  },
  {
    id: "M23",
    title: "রিপোর্ট, এক্সপোর্ট ও ডাটা স্থানান্তর",
    category: "রিপোর্ট",
    priority: "P0",
    owner: "Authorised Role",
    description:
      "Filtered report, secure export, bulk import, dry run ও migration reconciliation করুন।",
    action: "রিপোর্ট তৈরি",
    workflow: ["Filter", "Preview", "Generate", "Download"],
    features: ["Core reports", "Secure export", "Import dry run"],
    records: [
      ["Fee collection report", "১–৭ নভেম্বর · PDF", "প্রস্তুত"],
      ["Student import batch #14", "৪২ accepted · ৩ error", "Review"],
      ["Attendance export", "অক্টোবর · XLSX", "মেয়াদ শেষ"],
    ],
  },
  {
    id: "M24",
    title: "SaaS প্রশাসন ও সাপোর্ট",
    category: "সিস্টেম",
    priority: "P0",
    owner: "SaaS Admin",
    description: "Tenant, plan, quota, service health, support access ও offboarding পরিচালনা করুন।",
    action: "Tenant তৈরি",
    workflow: ["Trial", "Active", "Grace", "Closed"],
    features: ["Tenant ও plan", "Service health", "Support audit"],
    records: [
      ["Holy Quran School", "Standard · ১,২৪৮ students", "Active"],
      ["Backup job—Nov 07", "Database + Media", "সফল"],
      ["Support ticket #481", "SMS delivery delay", "Investigating"],
    ],
  },
];

const iconByCategory = {
  প্রতিষ্ঠান: Building2,
  একাডেমিক: GraduationCap,
  অর্থ: WalletCards,
  যোগাযোগ: MessageSquareText,
  প্রশাসন: ClipboardList,
  পোর্টাল: Globe2,
  সিস্টেম: ShieldCheck,
  রিপোর্ট: FileText,
};

const statusTone = (status: string) => {
  if (
    /সক্রিয়|প্রকাশিত|পরিশোধিত|সম্পন্ন|Delivered|Posted|সফল|Available|Verified|Active|Balanced/.test(
      status,
    )
  )
    return "success";
  if (/বকেয়া|Overdue|অসম্পূর্ণ|মেয়াদ/.test(status)) return "danger";
  if (/Review|পর্যালোচনা|অপেক্ষ|খসড়া|অনুমোদন|Scheduled|Queued|Follow-up|Investigating/.test(status))
    return "warning";
  return "neutral";
};

type PrototypeRecord = {
  id: string;
  name: string;
  detail: string;
  status: string;
  updated: string;
};

const formFields: Record<string, [string, string, string]> = {
  প্রতিষ্ঠান: ["নাম বা শিরোনাম", "শাখা / সেশন", "প্রয়োজনীয় বিবরণ"],
  একাডেমিক: ["শিক্ষার্থী / কার্যক্রম", "জামাত / বিভাগ", "একাডেমিক বিবরণ"],
  অর্থ: ["লেনদেন / রেফারেন্স", "পরিমাণ ও খাত", "পেমেন্ট বিবরণ"],
  যোগাযোগ: ["নোটিশ / বার্তার নাম", "প্রাপক বা audience", "বার্তার সারাংশ"],
  প্রশাসন: ["আবেদন / সম্পদের নাম", "বিভাগ বা দায়িত্বপ্রাপ্ত", "প্রশাসনিক বিবরণ"],
  পোর্টাল: ["পৃষ্ঠা / ব্যবহারকারী", "URL বা account reference", "প্রকাশনার বিবরণ"],
  সিস্টেম: ["সেটিং / সেবার নাম", "Version বা scope", "Configuration detail"],
  রিপোর্ট: ["রিপোর্টের নাম", "সময় ও format", "Filter ও scope"],
};

export function ModuleHub({ onSelect }: { onSelect: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("সব");
  const categories = ["সব", ...Array.from(new Set(modules.map((item) => item.category)))];
  const filtered = modules.filter(
    (item) =>
      (category === "সব" || item.category === category) &&
      `${item.id} ${item.title} ${item.description}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <main className="mx-auto max-w-[1580px] p-4 md:p-7 xl:p-9">
      <div className="module-hero">
        <div>
          <span className="eyebrow">সম্পূর্ণ পরিচালনা ব্যবস্থা</span>
          <h1>সকল মডিউল</h1>
          <p>PRD অনুযায়ী ২৪টি কার্যকর workspace—প্রতিটি মডিউল আলাদাভাবে খুলে কাজ করুন।</p>
        </div>
        <div className="module-count">
          <b>২৪</b>
          <span>মডিউল</span>
        </div>
      </div>
      <div className="module-toolbar">
        <label>
          <Search size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="মডিউল খুঁজুন..."
          />
        </label>
        <div className="category-pills">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={category === item ? "active" : ""}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="module-grid">
        {filtered.map((item) => {
          const Icon = iconByCategory[item.category as keyof typeof iconByCategory] || BookOpen;
          return (
            <button key={item.id} onClick={() => onSelect(item.id)} className="module-card">
              <div className="module-card-top">
                <span className="module-card-icon">
                  <Icon size={20} />
                </span>
                <span className={`priority ${item.priority.toLowerCase()}`}>{item.priority}</span>
              </div>
              <p className="module-id">
                {item.id} · {item.category}
              </p>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <div className="module-card-footer">
                <span>{item.owner}</span>
                <span className="open-arrow">
                  <ArrowUpRight size={15} />
                </span>
              </div>
            </button>
          );
        })}
      </div>
      {!filtered.length && (
        <div className="empty-state">কোনো মডিউল পাওয়া যায়নি। অন্য শব্দ দিয়ে খুঁজুন।</div>
      )}
    </main>
  );
}

export function ModuleWorkspace({ module, onBack }: { module: MadrasaModule; onBack: () => void }) {
  const [tab, setTab] = useState("সকল রেকর্ড");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [featureOpen, setFeatureOpen] = useState<string | null>(null);
  const [recordsData, setRecordsData] = useState<PrototypeRecord[]>(() => {
    const stored = localStorage.getItem(`madrasa-prototype-${module.id}`);
    if (stored) {
      try {
        return JSON.parse(stored) as PrototypeRecord[];
      } catch {
        localStorage.removeItem(`madrasa-prototype-${module.id}`);
      }
    }
    return module.records.map(([name, detail, status], index) => ({
      id: `${module.id}-${index + 1}`,
      name,
      detail,
      status,
      updated: index === 0 ? "এইমাত্র" : `${index + 1} ঘণ্টা আগে`,
    }));
  });
  const records = useMemo(() => {
    let result = recordsData.filter((record) =>
      `${record.name} ${record.detail} ${record.status}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
    if (tab === "আমার কাজ") result = result.slice(0, 2);
    if (tab === "অনুমোদন বাকি") {
      const pending = result.filter((record) => statusTone(record.status) === "warning");
      result = pending.length ? pending : result.slice(0, 1);
    }
    if (activeOnly) result = result.filter((record) => statusTone(record.status) !== "success");
    return result;
  }, [activeOnly, query, recordsData, tab]);
  const Icon = iconByCategory[module.category as keyof typeof iconByCategory] || BookOpen;
  const selectedRecord = recordsData.find((record) => record.id === selectedId);
  const labels = formFields[module.category] || formFields.একাডেমিক;

  useEffect(() => {
    localStorage.setItem(`madrasa-prototype-${module.id}`, JSON.stringify(recordsData));
  }, [module.id, recordsData]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const submitRecord = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "নতুন রেকর্ড");
    const scope = String(form.get("scope") || module.category);
    const detail = String(form.get("detail") || `${module.id} · নতুন এন্ট্রি`);
    setRecordsData([
      {
        id: `${module.id}-${Date.now()}`,
        name,
        detail: `${scope} · ${detail}`,
        status: "খসড়া",
        updated: "এইমাত্র",
      },
      ...recordsData,
    ]);
    setModalOpen(false);
    notify("নতুন রেকর্ডটি খসড়া হিসেবে যোগ হয়েছে");
  };

  const exportRecords = () => {
    const rows = [
      ["ID", "Name", "Detail", "Status", "Updated"],
      ...recordsData.map((record) => [
        record.id,
        record.name,
        record.detail,
        record.status,
        record.updated,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${module.id}-records.csv`;
    link.click();
    URL.revokeObjectURL(url);
    notify("CSV export ডাউনলোড হয়েছে");
  };

  const updateSelectedStatus = (status: string) => {
    if (!selectedRecord) return;
    setRecordsData(
      recordsData.map((record) =>
        record.id === selectedRecord.id ? { ...record, status, updated: "এইমাত্র" } : record,
      ),
    );
    notify(`অবস্থা “${status}” করা হয়েছে`);
  };

  const deleteSelected = () => {
    if (!selectedRecord) return;
    setRecordsData(recordsData.filter((record) => record.id !== selectedRecord.id));
    setSelectedId(null);
    notify("রেকর্ডটি মুছে ফেলা হয়েছে");
  };

  return (
    <main className="mx-auto max-w-[1580px] p-4 md:p-7 xl:p-9">
      <button onClick={onBack} className="back-button">
        <ArrowLeft size={15} /> সকল মডিউল
      </button>
      <section className="workspace-header">
        <div className="workspace-title">
          <span>
            <Icon size={24} />
          </span>
          <div>
            <p>
              {module.id} · {module.category}
            </p>
            <h1>{module.title}</h1>
            <small>{module.description}</small>
          </div>
        </div>
        <div className="workspace-actions">
          <button onClick={exportRecords} className="secondary-action">
            <Download size={16} /> এক্সপোর্ট
          </button>
          <button onClick={() => setModalOpen(true)} className="primary-action">
            <Plus size={17} /> {module.action}
          </button>
        </div>
      </section>

      <section className="workspace-stats">
        {[
          ["মোট রেকর্ড", String(recordsData.length), "এই browser-এ সংরক্ষিত"],
          ["চলমান", String(12 + Number(module.id.slice(1))), "সক্রিয় workflow"],
          ["অনুমোদন বাকি", String((Number(module.id.slice(1)) % 7) + 2), "আপনার action প্রয়োজন"],
          ["সম্পন্ন", `${82 + (Number(module.id.slice(1)) % 15)}%`, "সামগ্রিক অগ্রগতি"],
        ].map(([label, value, meta], i) => (
          <div className="workspace-stat" key={label}>
            <span className={`stat-dot dot-${i}`} />
            <div>
              <p>{label}</p>
              <b>{value}</b>
              <small>{meta}</small>
            </div>
          </div>
        ))}
      </section>

      <section className="workspace-layout">
        <div className="workspace-main">
          <article className="workflow-card">
            <div className="section-heading">
              <div>
                <h2>Workflow</h2>
                <p>বর্তমান কাজের অনুমোদিত ধাপ</p>
              </div>
              <span className={`priority ${module.priority.toLowerCase()}`}>
                {module.priority} অগ্রাধিকার
              </span>
            </div>
            <div className="workflow-steps">
              {module.workflow.map((step, index) => (
                <div key={step} className="workflow-step">
                  <span>{index < 2 ? <Check size={14} /> : index + 1}</span>
                  <p>{step}</p>
                  {index < module.workflow.length - 1 && <i />}
                </div>
              ))}
            </div>
          </article>

          <article className="records-card">
            <div className="records-tabs">
              {["সকল রেকর্ড", "আমার কাজ", "অনুমোদন বাকি"].map((item) => (
                <button
                  key={item}
                  onClick={() => setTab(item)}
                  className={tab === item ? "active" : ""}
                >
                  {item}
                  {item === "অনুমোদন বাকি" && <span>৩</span>}
                </button>
              ))}
            </div>
            <div className="records-toolbar">
              <label>
                <Search size={16} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="রেকর্ড খুঁজুন..."
                />
              </label>
              <button
                onClick={() => setActiveOnly(!activeOnly)}
                className={activeOnly ? "!border-emerald-300 !bg-emerald-50 !text-emerald-700" : ""}
              >
                <Filter size={15} /> ফিল্টার
              </button>
            </div>
            <div className="records-table">
              <div className="table-head">
                <span>নাম / রেফারেন্স</span>
                <span>বিস্তারিত</span>
                <span>অবস্থা</span>
                <span>আপডেট</span>
              </div>
              {records.map((record) => (
                <button
                  className="table-row"
                  key={record.id}
                  onClick={() => setSelectedId(record.id)}
                >
                  <span>
                    <i>{record.name.slice(0, 1)}</i>
                    <b>{record.name}</b>
                  </span>
                  <span>{record.detail}</span>
                  <span>
                    <em className={statusTone(record.status)}>{record.status}</em>
                  </span>
                  <span>
                    {record.updated}
                    <ChevronRight size={14} />
                  </span>
                </button>
              ))}
            </div>
            <div className="records-footer">
              <span>{records.length}টি demo record দেখানো হচ্ছে</span>
              <button
                onClick={() => {
                  setTab("সকল রেকর্ড");
                  setActiveOnly(false);
                  setQuery("");
                }}
              >
                সব রেকর্ড দেখুন <ChevronRight size={13} />
              </button>
            </div>
          </article>
        </div>

        <aside className="workspace-side">
          <article className="feature-card">
            <div className="section-heading">
              <div>
                <h2>প্রধান সুবিধা</h2>
                <p>এই মডিউলে অন্তর্ভুক্ত</p>
              </div>
            </div>
            <div className="feature-list">
              {module.features.map((feature, index) => (
                <button key={feature} onClick={() => setFeatureOpen(feature)}>
                  <span>{index + 1}</span>
                  <div>
                    <b>{feature}</b>
                    <small>সেটআপ ও পরিচালনা করুন</small>
                  </div>
                  <ChevronRight size={15} />
                </button>
              ))}
            </div>
          </article>
          <article className="owner-card">
            <span>
              <Users size={18} />
            </span>
            <div>
              <small>দায়িত্বপ্রাপ্ত ভূমিকা</small>
              <b>{module.owner}</b>
            </div>
          </article>
          <article className="prototype-note">
            <Sparkles size={17} />
            <div>
              <b>Interactive prototype</b>
              <p>তথ্য এই browser-এ সংরক্ষিত থাকবে। Backend সংযুক্ত হলে multi-user sync চালু হবে।</p>
            </div>
          </article>
        </aside>
      </section>

      {modalOpen && (
        <div className="modal-shell">
          <button
            aria-label="বন্ধ করুন"
            className="modal-backdrop"
            onClick={() => setModalOpen(false)}
          />
          <form className="record-modal" onSubmit={submitRecord}>
            <div className="modal-title">
              <div>
                <span>{module.id}</span>
                <h2>{module.action}</h2>
              </div>
              <button type="button" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <label>
              {labels[0]}
              <input required name="name" placeholder="নাম বা শিরোনাম লিখুন" autoFocus />
            </label>
            <label>
              {labels[1]}
              <input required name="scope" placeholder={labels[1]} />
            </label>
            <label>
              {labels[2]}
              <textarea required name="detail" placeholder="প্রয়োজনীয় সংক্ষিপ্ত তথ্য লিখুন" rows={3} />
            </label>
            <label>
              শাখা
              <select name="branch">
                <option>প্রধান শাখা</option>
                <option>মিরপুর শাখা</option>
              </select>
            </label>
            <div className="modal-actions">
              <button type="button" onClick={() => setModalOpen(false)}>
                বাতিল
              </button>
              <button type="submit">খসড়া সংরক্ষণ</button>
            </div>
          </form>
        </div>
      )}
      {selectedRecord && (
        <div className="record-drawer-shell">
          <button
            aria-label="বিস্তারিত বন্ধ করুন"
            className="drawer-backdrop"
            onClick={() => setSelectedId(null)}
          />
          <aside className="record-drawer">
            <div className="drawer-header">
              <div>
                <span>{module.id} · RECORD DETAILS</span>
                <h2>{selectedRecord.name}</h2>
              </div>
              <button onClick={() => setSelectedId(null)}>
                <X size={19} />
              </button>
            </div>
            <div className="drawer-body">
              <div className="detail-status">
                <small>বর্তমান অবস্থা</small>
                <em className={statusTone(selectedRecord.status)}>{selectedRecord.status}</em>
              </div>
              <div className="detail-block">
                <small>বিস্তারিত</small>
                <p>{selectedRecord.detail}</p>
              </div>
              <div className="detail-grid">
                <div>
                  <small>শাখা</small>
                  <b>প্রধান শাখা</b>
                </div>
                <div>
                  <small>শিক্ষাবর্ষ</small>
                  <b>২০২৬</b>
                </div>
                <div>
                  <small>দায়িত্বপ্রাপ্ত</small>
                  <b>{module.owner}</b>
                </div>
                <div>
                  <small>সর্বশেষ আপডেট</small>
                  <b>{selectedRecord.updated}</b>
                </div>
              </div>
              <div className="detail-block">
                <small>Workflow পরিবর্তন</small>
                <div className="status-actions">
                  {["খসড়া", "পর্যালোচনায়", "অনুমোদিত", "সম্পন্ন"].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateSelectedStatus(status)}
                      className={selectedRecord.status === status ? "active" : ""}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              <div className="audit-card">
                <ShieldCheck size={17} />
                <div>
                  <b>Prototype audit trail</b>
                  <p>Saifullah এই রেকর্ডটি সর্বশেষ পরিবর্তন করেছেন।</p>
                </div>
              </div>
            </div>
            <div className="drawer-actions">
              <button onClick={deleteSelected}>মুছে ফেলুন</button>
              <button onClick={() => updateSelectedStatus("সম্পন্ন")}>
                <Check size={15} /> কাজ সম্পন্ন করুন
              </button>
            </div>
          </aside>
        </div>
      )}
      {featureOpen && (
        <div className="modal-shell">
          <button
            aria-label="সেটিংস বন্ধ করুন"
            className="modal-backdrop"
            onClick={() => setFeatureOpen(null)}
          />
          <form
            className="record-modal"
            onSubmit={(event) => {
              event.preventDefault();
              notify(`${featureOpen} সেটিংস সংরক্ষিত হয়েছে`);
              setFeatureOpen(null);
            }}
          >
            <div className="modal-title">
              <div>
                <span>{module.id} · FEATURE SETUP</span>
                <h2>{featureOpen}</h2>
              </div>
              <button type="button" onClick={() => setFeatureOpen(null)}>
                <X size={18} />
              </button>
            </div>
            <label>
              প্রদর্শিত নাম
              <input name="label" defaultValue={featureOpen} required />
            </label>
            <label>
              দায়িত্বপ্রাপ্ত ভূমিকা
              <select name="owner" defaultValue={module.owner}>
                <option>{module.owner}</option>
                <option>Institution Admin</option>
                <option>Academic Admin</option>
                <option>Authorised Operator</option>
              </select>
            </label>
            <label className="feature-toggle">
              <input type="checkbox" defaultChecked />
              <span>
                <b>এই সুবিধা সক্রিয় রাখুন</b>
                <small>সংশ্লিষ্ট role-গুলো workspace-এ এটি ব্যবহার করতে পারবে।</small>
              </span>
            </label>
            <div className="modal-actions">
              <button type="button" onClick={() => setFeatureOpen(null)}>
                বাতিল
              </button>
              <button type="submit">সেটিংস সংরক্ষণ</button>
            </div>
          </form>
        </div>
      )}
      {toast && (
        <div className="app-toast">
          <Check size={16} /> {toast}
        </div>
      )}
    </main>
  );
}
