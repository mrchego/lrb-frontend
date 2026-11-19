// lib/brand-color.ts
//
// Company-wide brand color. The owner picks ONE color; this file turns it into the
// CSS variables the whole UI already reads (shadcn tokens in app/global.css), so every
// button, focus ring, link-ish highlight and the sidebar accent follows it.
//
// Two safety nets so a "bad" pick can't make the app unreadable:
//   - the color is nudged lighter/darker per mode until it has enough contrast against
//     that mode's page background (WCAG 3:1 for UI components);
//   - the text drawn ON the color (button labels) is white or near-black, whichever
//     reads better.
//
// The color is validated as #RRGGBB before it ever reaches a <style> tag, so nothing
// else can be injected.

export const BRAND_STYLE_ID = "brand-theme";
export const BRAND_CACHE_KEY = "lrb.brandCss";

type RGB = [number, number, number];

const HEX = /^#[0-9a-f]{6}$/i;

export const isHexColor = (v: unknown): v is string =>
  typeof v === "string" && HEX.test(v);

export const hexToRgb = (hex: string): RGB => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

export const rgbToHex = ([r, g, b]: RGB): string =>
  "#" +
  [r, g, b]
    .map((c) => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

/** t = 0 gives `a`, t = 1 gives `b`. */
const mix = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

function luminance([r, g, b]: RGB): number {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrast(a: RGB, b: RGB): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const WHITE: RGB = [255, 255, 255];
const BLACK: RGB = [0, 0, 0];
const INK: RGB = [10, 10, 10]; // text colour used on light brand colors

// Approximate backgrounds of the two modes (see :root / .dark in app/global.css).
const LIGHT_PAGE: RGB = [255, 255, 255];
const DARK_PAGE: RGB = [23, 23, 23];
const DARK_ACCENT_BASE: RGB = [38, 38, 38]; // the existing dark --accent

/** Move `c` toward `toward` until it reaches `min` contrast on `bg`. */
function ensureContrast(c: RGB, bg: RGB, toward: RGB, min = 3): RGB {
  for (let step = 0; step <= 20; step++) {
    const candidate = mix(c, toward, step / 20);
    if (contrast(candidate, bg) >= min) return candidate;
  }
  return toward;
}

const onColor = (c: RGB): string =>
  contrast(c, WHITE) >= contrast(c, INK) ? "#FFFFFF" : "#0A0A0A";

function tokens(primary: RGB, accent: RGB): string {
  const p = rgbToHex(primary);
  const fg = onColor(primary);
  const a = rgbToHex(accent);
  return [
    `--primary:${p}`,
    `--primary-foreground:${fg}`,
    `--ring:${p}`,
    `--sidebar-primary:${p}`,
    `--sidebar-primary-foreground:${fg}`,
    `--sidebar-ring:${p}`,
    `--accent:${a}`,
    `--sidebar-accent:${a}`,
  ].join(";");
}

/** CSS for both modes. `html:root` / `html.dark` outrank the defaults in global.css. */
export function buildBrandCss(hex: string): string {
  const base = hexToRgb(hex);
  const light = ensureContrast(base, LIGHT_PAGE, BLACK);
  const dark = ensureContrast(base, DARK_PAGE, WHITE);
  return (
    `html:root{${tokens(light, mix(WHITE, light, 0.12))}}\n` +
    `html.dark{${tokens(dark, mix(DARK_ACCENT_BASE, dark, 0.18))}}`
  );
}

/**
 * Apply (or clear, with null/"") the brand color on the whole document.
 * `persist: false` is for live previews: it skips the localStorage copy that
 * `BRAND_EARLY_SCRIPT` uses to paint the right color before React loads.
 */
export function applyBrandColor(
  hex: string | null | undefined,
  { persist = true }: { persist?: boolean } = {},
) {
  if (typeof document === "undefined") return;
  let el = document.getElementById(BRAND_STYLE_ID) as HTMLStyleElement | null;

  if (!isHexColor(hex)) {
    el?.remove();
    if (persist) {
      try {
        localStorage.removeItem(BRAND_CACHE_KEY);
      } catch {}
    }
    return;
  }

  const css = buildBrandCss(hex);
  if (!el) {
    el = document.createElement("style");
    el.id = BRAND_STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = css;
  if (persist) {
    try {
      localStorage.setItem(BRAND_CACHE_KEY, css);
    } catch {}
  }
}

/** Optional: put in <head> of app/layout.tsx so there's no flash of the default color. */
export const BRAND_EARLY_SCRIPT = `try{var c=localStorage.getItem("${BRAND_CACHE_KEY}");if(c){var s=document.createElement("style");s.id="${BRAND_STYLE_ID}";s.textContent=c;document.head.appendChild(s)}}catch(e){}`;