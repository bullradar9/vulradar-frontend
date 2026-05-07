// Helpers de formato i18n-aware. El caller pasa el locale activo
// (en server: getLocale() de next-intl/server; en client: useLocale() de next-intl).
// Cacheamos los formatters por locale para no recrearlos en cada render.

const RTF_CACHE = new Map<string, Intl.RelativeTimeFormat>();
function getRTF(locale: string): Intl.RelativeTimeFormat {
  let rtf = RTF_CACHE.get(locale);
  if (!rtf) {
    rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    RTF_CACHE.set(locale, rtf);
  }
  return rtf;
}

const NUMBER_FORMAT_CACHE = new Map<string, Intl.NumberFormat>();
function getNumberFormat(locale: string): Intl.NumberFormat {
  let nf = NUMBER_FORMAT_CACHE.get(locale);
  if (!nf) {
    nf = new Intl.NumberFormat(locale);
    NUMBER_FORMAT_CACHE.set(locale, nf);
  }
  return nf;
}

const DIVISIONS: Array<readonly [number, Intl.RelativeTimeFormatUnit]> = [
  [60, "second"],
  [60, "minute"],
  [24, "hour"],
  [7, "day"],
  [4.345, "week"],
  [12, "month"],
  [Number.POSITIVE_INFINITY, "year"],
];

export function formatRelativeTime(
  date: string | Date | null | undefined,
  locale: string = "en",
): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";

  let duration = (d.getTime() - Date.now()) / 1000;
  for (const [divisor, unit] of DIVISIONS) {
    if (Math.abs(duration) < divisor) {
      return getRTF(locale).format(Math.round(duration), unit);
    }
    duration /= divisor;
  }
  return "—";
}

export function formatNumber(
  n: number | null | undefined,
  locale: string = "en",
): string {
  if (n === null || n === undefined) return "0";
  return getNumberFormat(locale).format(n);
}
