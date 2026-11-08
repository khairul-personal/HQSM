import { describe, expect, it } from "vitest";
import {
  appRoutes,
  homeworkCheckPath,
  homeworkChildPath,
  guardianHomePath,
  isKnownRoute,
  isSectionPath,
  staffIdFromPath,
  staffPath,
  studentIdFromPath,
  studentPath,
  resultPath,
} from "./app-routes";

describe("hash route paths", () => {
  it("recognises known sections and rejects unknown routes", () => {
    expect(isKnownRoute("/")).toBe(true);
    expect(isKnownRoute("/staff/EMP-024")).toBe(true);
    expect(isKnownRoute("/homework/check/HW-041")).toBe(true);
    expect(isKnownRoute("/studentsx")).toBe(false);
    expect(isKnownRoute("/no-such-page")).toBe(false);
  });

  it("builds encoded staff and student detail paths", () => {
    expect(staffPath("EMP-024")).toBe("/staff/EMP-024");
    expect(studentPath("STU 10241")).toBe("/students/STU%2010241");
    expect(homeworkCheckPath("HW 041")).toBe("/homework/check/HW%20041");
    expect(homeworkChildPath("STU 10241", "HW 041")).toBe("/homework/STU%2010241/HW%20041");
    expect(guardianHomePath("STU 10241")).toBe("/guardian/STU%2010241");
    expect(resultPath("STU 10241")).toBe("/results/STU%2010241");
  });

  it("restores detail IDs from deep-link pathnames", () => {
    expect(staffIdFromPath("/staff/EMP-024")).toBe("EMP-024");
    expect(studentIdFromPath("/students/STU%2010241")).toBe("STU 10241");
  });

  it("keeps every app section in the same path scheme", () => {
    expect(Object.values(appRoutes)).toEqual([
      "/sponsorships",
      "/fees",
      "/admissions",
      "/staff",
      "/students",
      "/homework",
      "/guardian",
      "/system-states",
      "/results",
      "/exam-papers",
      "/settings",
      "/login",
      "/design-system",
    ]);
    expect(isSectionPath("/students/STU-10241", "students")).toBe(true);
    expect(isSectionPath("/student-settings", "students")).toBe(false);
  });
});
