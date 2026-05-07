const RTF = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

const DIVISIONS: Array<readonly [number, Intl.RelativeTimeFormatUnit]> = [
  [60, "second"],
  [60, "minute"],
  [24, "hour"],
  [7, "day"],
  [4.345, "week"],
  [12, "month"],
  [Number.POSITIVE_INFINITY, "year"],
];

export function formatRelativeTime(date: string | Date | null): string {
  if (!date) return "Nunca";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";

  let duration = (d.getTime() - Date.now()) / 1000;
  for (const [divisor, unit] of DIVISIONS) {
    if (Math.abs(duration) < divisor) {
      return RTF.format(Math.round(duration), unit);
    }
    duration /= divisor;
  }
  return "—";
}

const NUMBER_FORMAT = new Intl.NumberFormat("es");

export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined) return "0";
  return NUMBER_FORMAT.format(n);
}
