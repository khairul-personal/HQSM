import { describe, expect, it } from "vitest";
import {
  prototypeRoles,
  resolveAdmissionPermission,
  resolveFeePermission,
  resolveRestrictedModulePermission,
  resolveHomeworkPermission,
  resolveStaffPermission,
  resolveStudentPermission,
} from "./student-permissions";

const admissionOfficer = prototypeRoles["admission-officer"].context;

describe("Admission Officer permissions", () => {
  it("does not inherit Admin access", () => {
    expect(resolveAdmissionPermission(admissionOfficer)).toEqual({
      access: "manage",
      canCreate: true,
      canEdit: true,
      canSubmit: true,
      canApprove: true,
      canEnroll: true,
      canViewSponsorship: false,
    });
    expect(resolveFeePermission(admissionOfficer)).toEqual({
      feeDesk: "hidden",
      admissionFeeInvoices: "view",
      otherInvoices: "hidden",
      receipts: "hidden",
      sponsorships: "hidden",
      funds: "hidden",
      canPostFundAllocation: false,
    });
    expect(resolveRestrictedModulePermission(admissionOfficer)).toEqual({
      healthAndWelfare: false,
      audit: false,
      staffRecords: false,
      payroll: false,
      settings: false,
    });
    expect(resolveStaffPermission({ id: "EMP-1" }, admissionOfficer).record).toBe("hidden");
  });

  it("only exposes the five approved student profile tabs", () => {
    const permission = resolveStudentPermission(
      {
        className: "হিফজ",
        section: "ক",
        halaqa: "১",
        gender: "বালক",
        enrolledBy: admissionOfficer.actorId,
      },
      admissionOfficer,
    );

    expect(permission.tabs).toEqual([
      "সারসংক্ষেপ",
      "ব্যক্তিগত তথ্য",
      "অভিভাবক ও যোগাযোগ",
      "ভর্তি ও শিক্ষা ইতিহাস",
      "নথি ও সনদ",
    ]);
    expect(permission.fields.health).toBe("hidden");
  });

  it("cannot open the fee collection desk", () => {
    expect(resolveFeePermission(admissionOfficer).feeDesk).toBe("hidden");
  });
});

describe("cross-role permission boundaries", () => {
  it("does not let a Cashier post a fund allocation", () => {
    expect(resolveFeePermission(prototypeRoles.cashier.context).canPostFundAllocation).toBe(false);
  });

  it("does not let male staff without girls' access open a girls' profile by URL", () => {
    const permission = resolveStudentPermission(
      {
        className: "হিফজ",
        section: "ক",
        halaqa: "১",
        gender: "বালিকা",
      },
      prototypeRoles["male-staff"].context,
    );

    expect(permission.list).not.toBe("visible");
  });

  it("only lets a guardian open their linked children", () => {
    const permission = resolveHomeworkPermission(prototypeRoles.guardian.context);
    expect(permission.access).toBe("guardian");
    expect(permission.canOpenStudent("STU-10241")).toBe(true);
    expect(permission.canOpenStudent("STU-99999")).toBe(false);
  });
});
