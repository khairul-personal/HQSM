export const appRoutes = {
  dashboard: "/dashboard",
  sponsorships: "/sponsorships",
  fees: "/fees",
  admissions: "/admissions",
  staff: "/staff",
  students: "/students",
  homework: "/homework",
  guardian: "/guardian",
  systemStates: "/system-states",
  results: "/results",
  examPapers: "/exam-papers",
  settings: "/settings",
  login: "/login",
  designSystem: "/design-system",
} as const;

export type AppSection = keyof typeof appRoutes;

export function sectionPath(section: AppSection): string {
  return appRoutes[section];
}

export function staffPath(staffId: string): string {
  return `${appRoutes.staff}/${encodeURIComponent(staffId)}`;
}

export function studentPath(studentId: string): string {
  return `${appRoutes.students}/${encodeURIComponent(studentId)}`;
}

export function homeworkCheckPath(homeworkId: string): string {
  return `${appRoutes.homework}/check/${encodeURIComponent(homeworkId)}`;
}

export function homeworkChildPath(studentId: string, homeworkId?: string): string {
  const childPath = `${appRoutes.homework}/${encodeURIComponent(studentId)}`;
  return homeworkId ? `${childPath}/${encodeURIComponent(homeworkId)}` : childPath;
}

export function guardianHomePath(studentId: string): string {
  return `${appRoutes.guardian}/${encodeURIComponent(studentId)}`;
}

export function resultPath(studentId: string): string {
  return `${appRoutes.results}/${encodeURIComponent(studentId)}`;
}

/** True when the pathname belongs to a known section (or is the root redirect). */
export function isKnownRoute(pathname: string): boolean {
  if (pathname === "/" || pathname === "") return true;
  return (Object.keys(appRoutes) as AppSection[]).some((section) =>
    isSectionPath(pathname, section),
  );
}

export function isSectionPath(pathname: string, section: AppSection): boolean {
  const base = sectionPath(section);
  return pathname === base || pathname.startsWith(`${base}/`);
}

function detailId(pathname: string, section: "staff" | "students" | "results"): string {
  const base = sectionPath(section);
  if (!pathname.startsWith(`${base}/`)) return "";
  const encodedId = pathname.slice(base.length + 1).split("/")[0] ?? "";
  try {
    return decodeURIComponent(encodedId);
  } catch {
    return "";
  }
}

export const staffIdFromPath = (pathname: string): string => detailId(pathname, "staff");

export const studentIdFromPath = (pathname: string): string => detailId(pathname, "students");

export const resultStudentIdFromPath = (pathname: string): string => detailId(pathname, "results");
