import { describe, expect, it } from "vitest";
import {
  canOpenSettings,
  defaultInstitutionSettings,
  isFundUseEligible,
  isPhotoVisible,
  recordSettingsChange,
  resolveConfiguredPermission,
} from "./settings-domain";

describe("institution settings", () => {
  it("blocks every non-admin from the settings URL", () => {
    expect(canOpenSettings("admin")).toBe(true);
    expect(canOpenSettings("academic-admin")).toBe(false);
    expect(canOpenSettings("class-teacher")).toBe(false);
  });

  it("hides photos in every surface when a branch stores no photos", () => {
    const settings = {
      ...defaultInstitutionSettings,
      branches: defaultInstitutionSettings.branches.map((branch) =>
        branch.id === "main" ? { ...branch, photoPolicy: "সংরক্ষণ নয়" as const } : branch,
      ),
    };
    expect(isPhotoVisible(settings, "main")).toBe(false);
    expect(["list", "profile", "attendance"].map(() => isPhotoVisible(settings, "main"))).toEqual([
      false,
      false,
      false,
    ]);
  });

  it("changes B10 eligibility as soon as the fund rule is edited", () => {
    expect(isFundUseEligible(defaultInstitutionSettings, "যাকাত", "চিকিৎসা")).toBe(false);
    const edited = {
      ...defaultInstitutionSettings,
      fundRules: {
        ...defaultInstitutionSettings.fundRules,
        যাকাত: [...defaultInstitutionSettings.fundRules.যাকাত, "চিকিৎসা"],
      },
    };
    expect(isFundUseEligible(edited, "যাকাত", "চিকিৎসা")).toBe(true);
  });

  it("makes permission matrix edits drive the shared resolver", () => {
    expect(
      resolveConfiguredPermission(
        defaultInstitutionSettings,
        "class-teacher",
        "examPapers",
        "print",
      ),
    ).toBe(false);
    const edited = structuredClone(defaultInstitutionSettings);
    edited.rolePermissions["class-teacher"].examPapers?.push("print");
    expect(resolveConfiguredPermission(edited, "class-teacher", "examPapers", "print")).toBe(true);
  });

  it("creates an audit entry with before/after and requires a sensitive-change reason", () => {
    const change = { area: "fundRules" as const, before: ["টিউশন"], after: ["টিউশন", "চিকিৎসা"] };
    expect(() => recordSettingsChange(change, { actorId: "ADM-1" })).toThrow("কারণ আবশ্যক");
    expect(
      recordSettingsChange(change, {
        actorId: "ADM-1",
        reason: "নীতি কমিটি অনুমোদন করেছে",
        changedAt: "2026-06-01T10:00:00.000Z",
      }),
    ).toMatchObject({
      actorId: "ADM-1",
      before: ["টিউশন"],
      after: ["টিউশন", "চিকিৎসা"],
      reason: "নীতি কমিটি অনুমোদন করেছে",
    });
  });
});
