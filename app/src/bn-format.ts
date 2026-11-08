/** Shared display helpers for the Phase 0c screens. Display only — no maths here. */

export const bn = (value: number | string): string =>
  String(value).replace(/\d/g, (digit) => "০১২৩৪৫৬৭৮৯"[Number(digit)]);

/** Integer paisa → "৳১২,৩৪৫" with South Asian grouping (whole taka; paisa shown only if present). */
export function takaFromPaisa(paisa: number): string {
  const taka = Math.trunc(paisa / 100);
  const rest = Math.abs(paisa % 100);
  const grouped = new Intl.NumberFormat("bn-BD").format(taka);
  return rest ? `৳${grouped}.${bn(String(rest).padStart(2, "0"))}` : `৳${grouped}`;
}

/** "০৯:০৫" style clock time from minutes after midnight. */
export const clock = (minutes: number): string =>
  bn(
    `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`,
  );
