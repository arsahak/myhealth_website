// Dates are stored as "YYYY-MM-DD" keys so a day never shifts with time zones.

/** The app's home time zone. Decides what "today" is and how times are shown. */
export const TIME_ZONE = process.env.NEXT_PUBLIC_APP_TIME_ZONE || "Asia/Dhaka";

export const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

export function isDateKey(value: unknown): value is string {
  return typeof value === "string" && DATE_KEY.test(value) && toKey(fromKey(value)) === value;
}

/** Today's date key in the app's time zone. */
export function todayKey(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Picked day from a `?date=` value, or today. Days more than a year away fall back to today. */
export function pickDay(raw: string | string[] | null | undefined, today: string): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return isDateKey(value) && Math.abs(daysBetween(today, value)) <= 366 ? value : today;
}

/** 0 = Sunday ... 6 = Saturday. */
export function dayOfWeek(key: string): number {
  return fromKey(key).getDay();
}

export function toKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function utcDay(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function addDays(key: string, n: number): string {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

/** Whole days from a to b (b - a). */
export function daysBetween(a: string, b: string): number {
  return Math.round((utcDay(b) - utcDay(a)) / 86_400_000);
}

/** Every date key from `from` to `to`, inclusive. */
export function dateRange(from: string, to: string): string[] {
  const out: string[] = [];
  for (let k = from; k <= to; k = addDays(k, 1)) out.push(k);
  return out;
}

export function fmtMonthYear(key: string) {
  return fromKey(key).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function fmtWeekday(key: string) {
  return fromKey(key).toLocaleDateString("en-US", { weekday: "short" });
}

export function fmtMonthShort(key: string) {
  return fromKey(key).toLocaleDateString("en-US", { month: "short" });
}

export function fmtLong(key: string) {
  return fromKey(key).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function fmtShort(key: string) {
  return fromKey(key).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  });
}
