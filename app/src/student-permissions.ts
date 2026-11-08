export type PrototypeRole =
  | "admin"
  | "cashier"
  | "finance-lead"
  | "muhtamim"
  | "welfare-officer"
  | "admission-officer"
  | "class-teacher"
  | "male-staff"
  | "hr-officer"
  | "academic-admin"
  | "exam-controller"
  | "guardian"
  | "self";
export type FieldAccess = "visible" | "masked" | "hidden";
export type StudentTab =
  | "সারসংক্ষেপ"
  | "ব্যক্তিগত তথ্য"
  | "অভিভাবক ও যোগাযোগ"
  | "ভর্তি ও শিক্ষা ইতিহাস"
  | "হাজিরা"
  | "কুরআন ও হিফজ"
  | "পড়াশোনা ও হোমওয়ার্ক"
  | "পরীক্ষা ও ফলাফল"
  | "ফি ও পেমেন্ট"
  | "আবাসন"
  | "স্বাস্থ্য ও কল্যাণ"
  | "আমল ও মুহাসাবা"
  | "নথি ও সনদ"
  | "যোগাযোগ লগ"
  | "অডিট";

export type PermissionStudent = {
  id?: string;
  className: string;
  section: string;
  halaqa: string;
  gender: "বালক" | "বালিকা";
  restricted?: boolean;
  enrolledBy?: string;
};

export type PermissionContext = {
  role: PrototypeRole;
  actorId?: string;
  scope: {
    classNames?: string[];
    sections?: string[];
    halaqas?: string[];
    studentIds?: string[];
  };
  girlsSectionAccess: boolean;
};

export type StudentPermission = {
  list: "visible" | "masked" | "hidden";
  actions: "edit" | "view" | "none";
  fields: {
    photo: FieldAccess;
    identity: FieldAccess;
    phone: FieldAccess;
    address: FieldAccess;
    health: FieldAccess;
  };
  tabs: StudentTab[];
};

export const allStudentTabs: StudentTab[] = [
  "সারসংক্ষেপ",
  "ব্যক্তিগত তথ্য",
  "অভিভাবক ও যোগাযোগ",
  "ভর্তি ও শিক্ষা ইতিহাস",
  "হাজিরা",
  "কুরআন ও হিফজ",
  "পড়াশোনা ও হোমওয়ার্ক",
  "পরীক্ষা ও ফলাফল",
  "ফি ও পেমেন্ট",
  "আবাসন",
  "স্বাস্থ্য ও কল্যাণ",
  "আমল ও মুহাসাবা",
  "নথি ও সনদ",
  "যোগাযোগ লগ",
  "অডিট",
];

export const prototypeRoles: Record<PrototypeRole, { label: string; context: PermissionContext }> =
  {
    admin: {
      label: "Admin",
      context: { role: "admin", scope: {}, girlsSectionAccess: true },
    },
    cashier: {
      label: "হিসাবরক্ষক · Cashier",
      context: { role: "cashier", scope: {}, girlsSectionAccess: true },
    },
    "finance-lead": {
      label: "Finance Lead",
      context: { role: "finance-lead", scope: {}, girlsSectionAccess: true },
    },
    muhtamim: {
      label: "মুহতামিম",
      context: { role: "muhtamim", scope: {}, girlsSectionAccess: true },
    },
    "welfare-officer": {
      label: "Welfare Officer",
      context: { role: "welfare-officer", scope: {}, girlsSectionAccess: true },
    },
    "admission-officer": {
      label: "ভর্তি কর্মকর্তা · Admission Officer",
      context: {
        role: "admission-officer",
        actorId: "EMP-ADMISSION-001",
        scope: {},
        girlsSectionAccess: true,
      },
    },
    "class-teacher": {
      label: "Class teacher",
      context: {
        role: "class-teacher",
        scope: {
          classNames: ["হিফজ"],
          sections: ["ক"],
          halaqas: ["উস্তাদ সালমান"],
        },
        girlsSectionAccess: true,
      },
    },
    "male-staff": {
      label: "Male staff · girls access নেই",
      context: { role: "male-staff", scope: {}, girlsSectionAccess: false },
    },
    "hr-officer": {
      label: "HR Officer",
      context: { role: "hr-officer", scope: {}, girlsSectionAccess: true },
    },
    "academic-admin": {
      label: "Academic Admin",
      context: { role: "academic-admin", scope: {}, girlsSectionAccess: true },
    },
    "exam-controller": {
      label: "Exam Controller",
      context: { role: "exam-controller", actorId: "EC-001", scope: {}, girlsSectionAccess: true },
    },
    guardian: {
      label: "অভিভাবক · Guardian",
      context: {
        role: "guardian",
        actorId: "GRD-018",
        scope: { studentIds: ["STU-10241", "STU-10240"] },
        girlsSectionAccess: true,
      },
    },
    self: {
      label: "Self · Teacher",
      context: { role: "self", scope: {}, girlsSectionAccess: false },
    },
  };

export const staffRoleKeys: PrototypeRole[] = [
  "admin",
  "admission-officer",
  "hr-officer",
  "academic-admin",
  "self",
];

export type AdmissionPermission = {
  access: "manage" | "hidden";
  canCreate: boolean;
  canEdit: boolean;
  canSubmit: boolean;
  canApprove: boolean;
  canEnroll: boolean;
  canViewSponsorship: boolean;
};

export function resolveAdmissionPermission(context: PermissionContext): AdmissionPermission {
  const canManage = context.role === "admin" || context.role === "admission-officer";
  return {
    access: canManage ? "manage" : "hidden",
    canCreate: canManage,
    canEdit: canManage,
    canSubmit: canManage,
    canApprove: canManage,
    canEnroll: canManage,
    canViewSponsorship: context.role === "admin",
  };
}

export type FeePermission = {
  feeDesk: "manage" | "hidden";
  admissionFeeInvoices: "manage" | "view" | "hidden";
  otherInvoices: "manage" | "hidden";
  receipts: "manage" | "hidden";
  sponsorships: "manage" | "hidden";
  funds: "manage" | "hidden";
  canPostFundAllocation: boolean;
};

export function resolveFeePermission(context: PermissionContext): FeePermission {
  if (context.role === "admin" || context.role === "finance-lead") {
    return {
      feeDesk: "manage",
      admissionFeeInvoices: "manage",
      otherInvoices: "manage",
      receipts: "manage",
      sponsorships: "manage",
      funds: "manage",
      canPostFundAllocation: true,
    };
  }
  if (context.role === "cashier") {
    return {
      feeDesk: "manage",
      admissionFeeInvoices: "view",
      otherInvoices: "manage",
      receipts: "manage",
      sponsorships: "hidden",
      funds: "hidden",
      canPostFundAllocation: false,
    };
  }
  if (context.role === "admission-officer") {
    return {
      feeDesk: "hidden",
      admissionFeeInvoices: "view",
      otherInvoices: "hidden",
      receipts: "hidden",
      sponsorships: "hidden",
      funds: "hidden",
      canPostFundAllocation: false,
    };
  }
  return {
    feeDesk: "hidden",
    admissionFeeInvoices: "hidden",
    otherInvoices: "hidden",
    receipts: "hidden",
    sponsorships: "hidden",
    funds: "hidden",
    canPostFundAllocation: false,
  };
}

export type SponsorshipPermission = {
  access: "manage" | "balances" | "review" | "hidden";
  canManageSponsorships: boolean;
  canApproveAllocations: boolean;
  canApproveExceptions: boolean;
  canViewRestrictedEligibility: boolean;
  canViewStatement: boolean;
};

export function resolveSponsorshipPermission(context: PermissionContext): SponsorshipPermission {
  if (context.role === "admin" || context.role === "finance-lead") {
    return {
      access: "manage",
      canManageSponsorships: true,
      canApproveAllocations: true,
      canApproveExceptions: false,
      canViewRestrictedEligibility: true,
      canViewStatement: true,
    };
  }
  if (context.role === "muhtamim") {
    return {
      access: "review",
      canManageSponsorships: false,
      canApproveAllocations: true,
      canApproveExceptions: true,
      canViewRestrictedEligibility: true,
      canViewStatement: true,
    };
  }
  if (context.role === "welfare-officer") {
    return {
      access: "review",
      canManageSponsorships: false,
      canApproveAllocations: false,
      canApproveExceptions: false,
      canViewRestrictedEligibility: true,
      canViewStatement: false,
    };
  }
  if (context.role === "cashier") {
    return {
      access: "balances",
      canManageSponsorships: false,
      canApproveAllocations: false,
      canApproveExceptions: false,
      canViewRestrictedEligibility: false,
      canViewStatement: false,
    };
  }
  return {
    access: "hidden",
    canManageSponsorships: false,
    canApproveAllocations: false,
    canApproveExceptions: false,
    canViewRestrictedEligibility: false,
    canViewStatement: false,
  };
}

export type RestrictedModulePermission = {
  healthAndWelfare: boolean;
  audit: boolean;
  staffRecords: boolean;
  payroll: boolean;
  settings: boolean;
};

export function resolveRestrictedModulePermission(
  context: PermissionContext,
): RestrictedModulePermission {
  if (context.role === "admin") {
    return {
      healthAndWelfare: true,
      audit: true,
      staffRecords: true,
      payroll: false,
      settings: true,
    };
  }
  if (context.role === "admission-officer") {
    return {
      healthAndWelfare: false,
      audit: false,
      staffRecords: false,
      payroll: false,
      settings: false,
    };
  }
  return {
    healthAndWelfare: false,
    audit: false,
    staffRecords: false,
    payroll: false,
    settings: false,
  };
}

export type HomeworkPermission = {
  access: "teacher" | "guardian" | "hidden";
  canCreate: boolean;
  canCheck: boolean;
  canOpenStudent: (studentId: string) => boolean;
};

export function resolveHomeworkPermission(context: PermissionContext): HomeworkPermission {
  if (
    context.role === "class-teacher" ||
    context.role === "admin" ||
    context.role === "academic-admin"
  ) {
    return {
      access: "teacher",
      canCreate: true,
      canCheck: true,
      canOpenStudent: () => true,
    };
  }
  if (context.role === "guardian") {
    return {
      access: "guardian",
      canCreate: false,
      canCheck: false,
      canOpenStudent: (studentId) => Boolean(context.scope.studentIds?.includes(studentId)),
    };
  }
  return {
    access: "hidden",
    canCreate: false,
    canCheck: false,
    canOpenStudent: () => false,
  };
}

const isInScope = (student: PermissionStudent, context: PermissionContext) => {
  const { classNames, sections, halaqas } = context.scope;
  return (
    (!classNames?.length || classNames.includes(student.className)) &&
    (!sections?.length || sections.includes(student.section)) &&
    (!halaqas?.length || halaqas.includes(student.halaqa))
  );
};

export function resolveStudentPermission(
  student: PermissionStudent,
  context: PermissionContext,
): StudentPermission {
  if (
    context.role === "guardian" &&
    (!student.id || !resolveHomeworkPermission(context).canOpenStudent(student.id))
  ) {
    return {
      list: "hidden",
      actions: "none",
      fields: {
        photo: "hidden",
        identity: "hidden",
        phone: "hidden",
        address: "hidden",
        health: "hidden",
      },
      tabs: [],
    };
  }
  if (context.role === "guardian") {
    return {
      list: "visible",
      actions: "view",
      fields: {
        photo: "visible",
        identity: "visible",
        phone: "masked",
        address: "masked",
        health: "hidden",
      },
      tabs: ["সারসংক্ষেপ", "হাজিরা", "পড়াশোনা ও হোমওয়ার্ক", "পরীক্ষা ও ফলাফল", "ফি ও পেমেন্ট"],
    };
  }
  if (!isInScope(student, context)) {
    return {
      list: "hidden",
      actions: "none",
      fields: {
        photo: "hidden",
        identity: "hidden",
        phone: "hidden",
        address: "hidden",
        health: "hidden",
      },
      tabs: [],
    };
  }

  const girlsRestricted = student.gender === "বালিকা" && !context.girlsSectionAccess;
  const isAdmissionOfficer = context.role === "admission-officer";
  const enrolledByOfficer =
    isAdmissionOfficer && Boolean(context.actorId) && student.enrolledBy === context.actorId;
  if (isAdmissionOfficer && !enrolledByOfficer) {
    return {
      list: "hidden",
      actions: "none",
      fields: {
        photo: "hidden",
        identity: "hidden",
        phone: "hidden",
        address: "hidden",
        health: "hidden",
      },
      tabs: [],
    };
  }
  const isTeacher = context.role === "class-teacher";
  const restrictedTabs = new Set<StudentTab>(["ফি ও পেমেন্ট", "স্বাস্থ্য ও কল্যাণ", "অডিট"]);
  const admissionOfficerTabs: StudentTab[] = [
    "সারসংক্ষেপ",
    "ব্যক্তিগত তথ্য",
    "অভিভাবক ও যোগাযোগ",
    "ভর্তি ও শিক্ষা ইতিহাস",
    "নথি ও সনদ",
  ];

  return {
    list: girlsRestricted ? "masked" : "visible",
    actions: girlsRestricted ? "view" : "edit",
    fields: {
      photo: girlsRestricted ? "masked" : "visible",
      identity: "visible",
      phone: student.restricted || girlsRestricted ? "masked" : "visible",
      address: isTeacher || girlsRestricted ? "masked" : "visible",
      health: isAdmissionOfficer ? "hidden" : girlsRestricted ? "masked" : "visible",
    },
    tabs: isAdmissionOfficer
      ? admissionOfficerTabs
      : isTeacher || context.role === "male-staff"
        ? allStudentTabs.filter((tab) => !restrictedTabs.has(tab))
        : allStudentTabs,
  };
}

export type StaffTab =
  | "সারসংক্ষেপ"
  | "ব্যক্তিগত তথ্য"
  | "যোগ্যতা ও সনদ"
  | "চাকরি তথ্য"
  | "শিক্ষাদান দায়িত্ব"
  | "হাজিরা ও ছুটি"
  | "বেতন ও পে রোল"
  | "কাজ ও মূল্যায়ন"
  | "নথি"
  | "সিস্টেম অ্যাক্সেস"
  | "অডিট";

export type PermissionStaff = {
  id: string;
};

export type StaffPermission = {
  record: "visible" | "hidden";
  tabs: StaffTab[];
  payroll: "full" | "payslips-only" | "hidden";
  observationNotes: "visible" | "hidden";
  actions: "manage" | "self";
};

export const allStaffTabs: StaffTab[] = [
  "সারসংক্ষেপ",
  "ব্যক্তিগত তথ্য",
  "যোগ্যতা ও সনদ",
  "চাকরি তথ্য",
  "শিক্ষাদান দায়িত্ব",
  "হাজিরা ও ছুটি",
  "বেতন ও পে রোল",
  "কাজ ও মূল্যায়ন",
  "নথি",
  "সিস্টেম অ্যাক্সেস",
  "অডিট",
];

export function resolveStaffPermission(
  staff: PermissionStaff,
  context: PermissionContext,
): StaffPermission {
  if (context.role === "admission-officer") {
    return {
      record: "hidden",
      tabs: [],
      payroll: "hidden",
      observationNotes: "hidden",
      actions: "self",
    };
  }

  if (context.role === "self") {
    if (staff.id !== "EMP-024") {
      return {
        record: "hidden",
        tabs: [],
        payroll: "hidden",
        observationNotes: "hidden",
        actions: "self",
      };
    }
    return {
      record: "visible",
      tabs: allStaffTabs.filter((tab) => tab !== "অডিট"),
      payroll: "payslips-only",
      observationNotes: "hidden",
      actions: "self",
    };
  }

  if (context.role === "academic-admin") {
    return {
      record: "visible",
      tabs: allStaffTabs.filter((tab) => tab !== "বেতন ও পে রোল" && tab !== "সিস্টেম অ্যাক্সেস"),
      payroll: "hidden",
      observationNotes: "visible",
      actions: "manage",
    };
  }

  if (context.role === "hr-officer") {
    return {
      record: "visible",
      tabs: allStaffTabs,
      payroll: "full",
      observationNotes: "visible",
      actions: "manage",
    };
  }

  return {
    record: "visible",
    tabs: allStaffTabs.filter((tab) => tab !== "বেতন ও পে রোল"),
    payroll: "hidden",
    observationNotes: "visible",
    actions: "manage",
  };
}

export type AccountActionStaff = {
  id: string;
  status: string;
  isCurrentUser?: boolean;
  institutionAdmin?: boolean;
};

export type AccountActionDecision = {
  /** "Access বন্ধ" / "অব্যাহতি শুরু" buttons appear at all. */
  show: boolean;
  /** The action may run now. */
  allowed: boolean;
  reason?: string;
};

const inactiveStaffStatuses = ["স্থগিত", "অব্যাহতিপ্রাপ্ত"];

/**
 * Restricting access or starting separation for a staff member.
 * - Only roles that manage staff see the actions, and never on their own profile.
 * - The last active Institution Admin can never be restricted or removed.
 */
export function resolveStaffAccountActions(
  staff: AccountActionStaff,
  allStaff: AccountActionStaff[],
  context: PermissionContext,
): AccountActionDecision {
  const manage = resolveStaffPermission(staff, context).actions === "manage";
  if (!manage || staff.isCurrentUser === true) return { show: false, allowed: false };
  if (inactiveStaffStatuses.includes(staff.status)) {
    return { show: true, allowed: false, reason: "এই কর্মীর অ্যাক্সেস আগেই বন্ধ আছে" };
  }
  const activeAdmins = allStaff.filter(
    (record) => record.institutionAdmin === true && !inactiveStaffStatuses.includes(record.status),
  );
  if (staff.institutionAdmin === true && activeAdmins.length <= 1) {
    return {
      show: true,
      allowed: false,
      reason: "প্রতিষ্ঠানে অন্তত একজন Institution Admin থাকতে হবে",
    };
  }
  return { show: true, allowed: true };
}
