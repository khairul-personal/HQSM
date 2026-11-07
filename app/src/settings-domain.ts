import type { PrototypeRole } from "./student-permissions";

export type PhotoPolicy = "বাধ্যতামূলক" | "ঐচ্ছিক" | "সংরক্ষণ নয়";
export type PermissionAction = "view" | "create" | "edit" | "approve" | "print";
export type PermissionModule = "students" | "attendance" | "funds" | "examPapers" | "settings";

export type InstitutionSettings = {
  institution: { nameBn: string; nameEn: string; code: string };
  branches: Array<{
    id: string;
    name: string;
    type: "বালক" | "বালিকা" | "মিশ্র";
    photoPolicy: PhotoPolicy;
  }>;
  attendanceCutoff: Record<string, string>;
  idFormats: { student: string; staff: string };
  fundRules: Record<string, string[]>;
  rolePermissions: Record<string, Partial<Record<PermissionModule, PermissionAction[]>>>;
  girlsAccess: Record<string, boolean>;
};

export type SettingsChange = {
  area:
    | "profile"
    | "branch"
    | "photoPolicy"
    | "attendance"
    | "idFormat"
    | "fundRules"
    | "permissions"
    | "girlsAccess";
  before: unknown;
  after: unknown;
};

export type SettingsAudit = SettingsChange & {
  id: string;
  actorId: string;
  reason?: string;
  changedAt: string;
};

export const defaultInstitutionSettings: InstitutionSettings = {
  institution: {
    nameBn: "হলি কুরআন স্কুল এন্ড মাদরাসা",
    nameEn: "Holy Quran School & Madrasa",
    code: "HQS",
  },
  branches: [
    { id: "main", name: "প্রধান শাখা", type: "মিশ্র", photoPolicy: "ঐচ্ছিক" },
    { id: "mirpur", name: "মিরপুর শাখা", type: "বালক", photoPolicy: "বাধ্যতামূলক" },
    { id: "girls", name: "বালিকা শাখা", type: "বালিকা", photoPolicy: "সংরক্ষণ নয়" },
  ],
  attendanceCutoff: { সকাল: "08:15", দুপুর: "13:30" },
  idFormats: { student: "HQS-{YEAR}-{####}", staff: "EMP-{###}" },
  fundRules: {
    যাকাত: ["টিউশন", "খাবার"],
    "লিল্লাহ বোর্ডিং": ["খাবার", "বোর্ডিং"],
  },
  rolePermissions: {
    admin: {
      students: ["view", "create", "edit", "approve"],
      attendance: ["view", "create", "edit", "approve"],
      funds: ["view", "create", "edit", "approve"],
      examPapers: ["view", "create", "edit", "approve", "print"],
      settings: ["view", "edit"],
    },
    "class-teacher": {
      students: ["view"],
      attendance: ["view", "create", "edit"],
      examPapers: ["view", "create", "edit"],
    },
    "exam-controller": {
      students: ["view"],
      examPapers: ["view", "create", "edit", "approve", "print"],
    },
  },
  girlsAccess: { "USR-001": true, "USR-014": false },
};

const reasonRequired = new Set<SettingsChange["area"]>([
  "photoPolicy",
  "fundRules",
  "permissions",
  "girlsAccess",
]);

export function canOpenSettings(role: PrototypeRole): boolean {
  return role === "admin";
}

export function resolveConfiguredPermission(
  settings: InstitutionSettings,
  role: PrototypeRole,
  module: PermissionModule,
  action: PermissionAction,
): boolean {
  return settings.rolePermissions[role]?.[module]?.includes(action) ?? false;
}

export function isPhotoVisible(settings: InstitutionSettings, branchId: string): boolean {
  return settings.branches.find((branch) => branch.id === branchId)?.photoPolicy !== "সংরক্ষণ নয়";
}

export function isFundUseEligible(
  settings: InstitutionSettings,
  fundId: string,
  feeHead: string,
): boolean {
  return settings.fundRules[fundId]?.includes(feeHead) ?? false;
}

export function recordSettingsChange(
  change: SettingsChange,
  options: { actorId: string; reason?: string; changedAt?: string },
): SettingsAudit {
  if (reasonRequired.has(change.area) && !options.reason?.trim()) {
    throw new Error("Privacy, money বা permission পরিবর্তনের কারণ আবশ্যক");
  }
  return {
    ...change,
    id: `AUD-${options.changedAt ?? new Date().toISOString()}-${change.area}`,
    actorId: options.actorId,
    reason: options.reason?.trim() || undefined,
    changedAt: options.changedAt ?? new Date().toISOString(),
  };
}
