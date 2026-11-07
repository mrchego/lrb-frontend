export type DateFormat = "YYYY-MM-DD" | "DD/MM/YYYY" | "MM/DD/YYYY";
export type TimeInput = string | number | Date | null | undefined;

export type FormatOptions = {
  timeZone: string;
  dateFormat?: string;
};

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const EMPTY = "—";

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let f = formatterCache.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    formatterCache.set(timeZone, f);
  }
  return f;
}

type Parts = { y: string; m: string; d: string; hh: string; mm: string; ss: string };

function partsIn(date: Date, timeZone: string): Parts {
  const o: Record<string, string> = {};
  for (const p of formatterFor(timeZone).formatToParts(date)) o[p.type] = p.value;
  return { y: o.year, m: o.month, d: o.day, hh: o.hour, mm: o.minute, ss: o.second };
}

function toDate(value: TimeInput): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function layout(dateFormat: string | undefined, y: string, m: string, d: string): string {
  switch (dateFormat) {
    case "DD/MM/YYYY":
      return `${d}/${m}/${y}`;
    case "MM/DD/YYYY":
      return `${m}/${d}/${y}`;
    default:
      return `${y}-${m}-${d}`;
  }
}

/** A calendar date ("2026-11-05") or an instant, shown on the company's calendar. */
export function formatDate(value: TimeInput, { timeZone, dateFormat }: FormatOptions): string {
  // Date-only strings from the API are already company-local calendar days.
  // new Date("2026-11-05") would be UTC midnight and can render as the 4th in
  // zones behind UTC, so never convert them.
  if (typeof value === "string") {
    const m = DATE_ONLY.exec(value);
    if (m) return layout(dateFormat, m[1], m[2], m[3]);
  }
  const d = toDate(value);
  if (!d) return EMPTY;
  const p = partsIn(d, timeZone);
  return layout(dateFormat, p.y, p.m, p.d);
}

export function formatTime(
  value: TimeInput,
  { timeZone }: FormatOptions,
  withSeconds = false,
): string {
  const d = toDate(value);
  if (!d) return EMPTY;
  const p = partsIn(d, timeZone);
  return withSeconds ? `${p.hh}:${p.mm}:${p.ss}` : `${p.hh}:${p.mm}`;
}

export function formatDateTime(value: TimeInput, opts: FormatOptions): string {
  const d = toDate(value);
  if (!d) return EMPTY;
  return `${formatDate(d, opts)} ${formatTime(d, opts)}`;
}

/** "Nov 5" style label for chart axes. Handles date-only strings safely. */
export function formatShortDate(value: TimeInput, { timeZone }: FormatOptions): string {
  let d: Date | null;
  let zone = timeZone;
  if (typeof value === "string" && DATE_ONLY.test(value)) {
    d = new Date(`${value}T12:00:00Z`); // noon UTC: same calendar day in every zone
    zone = "UTC";
  } else {
    d = toDate(value);
  }
  if (!d) return EMPTY;
  return new Intl.DateTimeFormat("en-US", { timeZone: zone, month: "short", day: "numeric" }).format(d);
}

/** Short zone label such as "GMT+3". */
export function zoneLabel(timeZone: string, at: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone, timeZoneName: "short" }).formatToParts(at);
    return parts.find((p) => p.type === "timeZoneName")?.value ?? timeZone;
  } catch {
    return timeZone;
  }
}

/** The visitor's device timezone, used only as a suggestion for the owner. */
export function deviceTimeZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}
