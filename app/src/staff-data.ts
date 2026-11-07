export type StaffStatus = "সক্রিয়" | "ছুটিতে" | "স্থগিত" | "অব্যাহতিপ্রাপ্ত";
export type EmploymentType = "পূর্ণকালীন" | "খণ্ডকালীন" | "অতিথি" | "স্বেচ্ছাসেবী";

export type StaffRecord = {
  id: string;
  nameBn: string;
  nameEn: string;
  nameAr: string;
  initials: string;
  gender: "পুরুষ" | "নারী";
  photoConsent: boolean;
  designation: string;
  department: string;
  branch: "প্রধান শাখা" | "মিরপুর শাখা";
  employmentType: EmploymentType;
  status: StaffStatus;
  weeklyLoad: number;
  attendance: number;
  pendingTasks: number;
  leaveBalance: number;
  phone: string;
  avatarTone: string;
  isCurrentUser?: boolean;
  institutionAdmin?: boolean;
};

export const staffRecords: StaffRecord[] = [
  {
    id: "EMP-024",
    nameBn: "উস্তাদ আবদুর রহমান",
    nameEn: "Abdur Rahman",
    nameAr: "عبد الرحمن",
    initials: "আর",
    gender: "পুরুষ",
    photoConsent: true,
    designation: "সিনিয়র হিফজ শিক্ষক",
    department: "হিফজ বিভাগ",
    branch: "প্রধান শাখা",
    employmentType: "পূর্ণকালীন",
    status: "সক্রিয়",
    weeklyLoad: 24,
    attendance: 96,
    pendingTasks: 3,
    leaveBalance: 12,
    phone: "01712-345678",
    avatarTone: "sage",
    isCurrentUser: true,
  },
  {
    id: "EMP-019",
    nameBn: "মাওলানা নাঈমুল হাসান",
    nameEn: "Naimul Hasan",
    nameAr: "نعيم الحسن",
    initials: "নহ",
    gender: "পুরুষ",
    photoConsent: true,
    designation: "মুহাদ্দিস",
    department: "কিতাব বিভাগ",
    branch: "প্রধান শাখা",
    employmentType: "পূর্ণকালীন",
    status: "সক্রিয়",
    weeklyLoad: 18,
    attendance: 92,
    pendingTasks: 1,
    leaveBalance: 8,
    phone: "01819-774512",
    avatarTone: "blue",
    institutionAdmin: true,
  },
  {
    id: "EMP-031",
    nameBn: "মো. সালেহ আহমেদ",
    nameEn: "Saleh Ahmed",
    nameAr: "صالح أحمد",
    initials: "সা",
    gender: "পুরুষ",
    photoConsent: false,
    designation: "হিসাবরক্ষক",
    department: "অর্থ ও হিসাব",
    branch: "প্রধান শাখা",
    employmentType: "পূর্ণকালীন",
    status: "ছুটিতে",
    weeklyLoad: 0,
    attendance: 84,
    pendingTasks: 5,
    leaveBalance: 4,
    phone: "01922-684930",
    avatarTone: "sand",
  },
  {
    id: "EMP-042",
    nameBn: "উস্তাযা মরিয়ম আক্তার",
    nameEn: "Maryam Akter",
    nameAr: "مريم أختر",
    initials: "মআ",
    gender: "নারী",
    photoConsent: false,
    designation: "নাজেরা শিক্ষক",
    department: "নাজেরা বিভাগ",
    branch: "মিরপুর শাখা",
    employmentType: "খণ্ডকালীন",
    status: "সক্রিয়",
    weeklyLoad: 16,
    attendance: 98,
    pendingTasks: 2,
    leaveBalance: 6,
    phone: "01638-442108",
    avatarTone: "rose",
  },
  {
    id: "EMP-053",
    nameBn: "কারী আবু তাহের",
    nameEn: "Qari Abu Taher",
    nameAr: "القارئ أبو طاهر",
    initials: "আত",
    gender: "পুরুষ",
    photoConsent: true,
    designation: "অতিথি কারী",
    department: "কিরাআত বিভাগ",
    branch: "মিরপুর শাখা",
    employmentType: "অতিথি",
    status: "স্থগিত",
    weeklyLoad: 6,
    attendance: 76,
    pendingTasks: 0,
    leaveBalance: 0,
    phone: "01308-112745",
    avatarTone: "violet",
  },
  {
    id: "EMP-061",
    nameBn: "সালমা বিনতে কবির",
    nameEn: "Salma Binte Kabir",
    nameAr: "سلمى بنت كبير",
    initials: "সক",
    gender: "নারী",
    photoConsent: true,
    designation: "একাডেমিক সহায়ক",
    department: "একাডেমিক প্রশাসন",
    branch: "প্রধান শাখা",
    employmentType: "স্বেচ্ছাসেবী",
    status: "অব্যাহতিপ্রাপ্ত",
    weeklyLoad: 4,
    attendance: 88,
    pendingTasks: 0,
    leaveBalance: 0,
    phone: "01511-907231",
    avatarTone: "peach",
  },
];

export const maskStaffPhone = (phone: string) => `${phone.slice(0, 3)}•••${phone.slice(-4)}`;
