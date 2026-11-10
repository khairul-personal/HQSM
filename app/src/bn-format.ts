/** Shared display helpers for the Phase 0c screens. Display only — no maths here. */

export const bn = (value: number | string): string =>
  String(value).replace(/\d/g, (digit) => "০১২৩৪৫৬৭৮৯"[Number(digit)]);

/** Integer paisa → "৳ ১২,৩৪,৫৬৭" (PRD 12.2: sign, no-break space, South Asian grouping; paisa only if present). */
export function takaFromPaisa(paisa: number): string {
  const taka = Math.trunc(paisa / 100);
  const rest = Math.abs(paisa % 100);
  const grouped = new Intl.NumberFormat("bn-BD").format(taka);
  return rest ? `৳ ${grouped}.${bn(String(rest).padStart(2, "0"))}` : `৳ ${grouped}`;
}

/** "০৯:০৫" style clock time from minutes after midnight. */
export const clock = (minutes: number): string =>
  bn(
    `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`,
  );

/** Gregorian date in Bengali, e.g. "রবিবার, ৮ নভেম্বর ২০২৬". */
export const gregorianDate = (iso: string): string =>
  new Intl.DateTimeFormat("bn-BD", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));

/** Hijri (Umm al-Qura) date in Bengali. */
export function hijriDate(iso: string): string {
  const parts = new Intl.DateTimeFormat("bn-BD-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).formatToParts(new Date(`${iso}T00:00:00Z`));
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${part("day")} ${part("month")} ${part("year")} হিজরি`;
}

/** Parts of a date for date-led lists: "১৩", "নভে", "শুক্রবার". */
export function dateParts(iso: string): { day: string; month: string; weekday: string } {
  const date = new Date(`${iso}T00:00:00Z`);
  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("bn-BD", { ...options, timeZone: "UTC" }).format(date);
  return {
    day: part({ day: "numeric" }),
    month: part({ month: "short" }),
    weekday: part({ weekday: "long" }),
  };
}
