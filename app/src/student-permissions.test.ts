import { describe, expect, it } from "vitest";
import {
  homeSectionForRole,
  prototypeRoles,
  resolveWorkspacePermission,
  resolveAdmissionPermission,
  resolveFeePermission,
  resolveRestrictedModulePermission,
  resolveHomeworkPermission,
  resolveStaffAccountActions,
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

describe("staff account actions", () => {
  const admin = prototypeRoles.admin.context;
  const self = { id: "EMP-024", status: "সক্রিয়", isCurrentUser: true };
  const soleAdmin = { id: "EMP-019", status: "সক্রিয়", institutionAdmin: true };
  const teacher = { id: "EMP-042", status: "সক্রিয়" };
  const staff = [self, soleAdmin, teacher];

  it("hides Access বন্ধ / অব্যাহতি শুরু on your own profile", () => {
    expect(resolveStaffAccountActions(self, staff, admin).show).toBe(false);
  });

  it("never lets the last active Institution Admin be removed", () => {
    const decision = resolveStaffAccountActions(soleAdmin, staff, admin);
    expect(decision).toMatchObject({ show: true, allowed: false });
    expect(decision.reason).toContain("Institution Admin");
  });

  it("allows removing an admin when another active admin remains", () => {
    const second = { id: "EMP-050", status: "সক্রিয়", institutionAdmin: true };
    expect(resolveStaffAccountActions(soleAdmin, [...staff, second], admin).allowed).toBe(true);
  });

  it("does not count a suspended admin as the remaining admin", () => {
    const suspended = { id: "EMP-050", status: "স্থগিত", institutionAdmin: true };
    expect(resolveStaffAccountActions(soleAdmin, [...staff, suspended], admin).allowed).toBe(false);
  });

  it("allows an ordinary staff member to be restricted by a manager", () => {
    expect(resolveStaffAccountActions(teacher, staff, admin)).toEqual({
      show: true,
      allowed: true,
    });
  });

  it("shows no account actions to roles that do not manage staff", () => {
    const officer = prototypeRoles["admission-officer"].context;
    expect(resolveStaffAccountActions(teacher, staff, officer).show).toBe(false);
  });
});

describe("workspace access and sign-in landing (Phase 0c)", () => {
  it("hides the design system page from guardians only", () => {
    expect(resolveWorkspacePermission(prototypeRoles.guardian.context).designSystem).toBe(false);
    expect(resolveWorkspacePermission(prototypeRoles.muhtamim.context).designSystem).toBe(true);
  });
  it("sends each role to its own home after sign-in", () => {
    expect(homeSectionForRole("guardian")).toBe("guardian");
    expect(homeSectionForRole("class-teacher")).toBe("attendance");
    expect(homeSectionForRole("cashier")).toBe("fees");
  });
});
