// lib/money.ts
// Pure money formatting. Decimals come from the backend's currency table, never
// from the browser's own (differing) ICU data, so display, validation and
// storage always agree.

export type CurrencyInfo = { code: string; name: string; decimals: number };
export type MoneyInput = string | number | null | undefined;

export type MoneyOptions = {
  currency: string;
  decimals?: number;
  locale?: string;
};

const EMPTY = "—";
const cache = new Map<string, Intl.NumberFormat>();

function formatterFor({ currency, decimals, locale = "en" }: MoneyOptions): Intl.NumberFormat {
  const key = `${locale}|${currency}|${decimals ?? "auto"}`;
  let f = cache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      ...(decimals === undefined
        ? {}
        : { minimumFractionDigits: decimals, maximumFractionDigits: decimals }),
    });
    cache.set(key, f);
  }
  return f;
}

/** "KES 1,234.50", "$1,234.50", "¥1,235". Null, empty or non-numeric -> "—". */
export function formatMoney(value: MoneyInput, opts: MoneyOptions): string {
  if (value === null || value === undefined || value === "") return EMPTY;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return EMPTY;
  try {
    return formatterFor(opts).format(n);
  } catch {
    return `${opts.currency} ${n}`; // malformed currency code: never crash a table
  }
}

/** Value for <input type="number" step=...>: 0 -> "1", 2 -> "0.01", 3 -> "0.001". */
export function moneyStep(decimals: number): string {
  return decimals <= 0 ? "1" : `0.${"0".repeat(decimals - 1)}1`;
}

/** Value for an <input type="number"> from an API decimal string ("10.500" -> "10.5"). */
export function moneyInputValue(value: MoneyInput): string {
  if (value === null || value === undefined || value === "") return "";
  const n = Number(value);
  return Number.isFinite(n) ? String(n) : "";
}
