// lib/theme-engine.ts
//
// Level 2 theming: presets + guided controls + advanced color overrides, with guardrails.
//
// WHY IT CAN'T LOOK UGLY
//   1. Owners never pick a whole palette. They pick a brand color and a few *styles*;
//      the engine builds every other color from a fixed lightness ladder (OKLCH), so
//      surfaces are always near-white / near-black with at most a whisper of tint.
//   2. Every text/background pair is checked (WCAG contrast) and corrected before it
//      is written to the page, whatever the owner chose.
//   3. Anything the owner overrides by hand goes through the same checks, and the
//      colors derived from it (muted, borders, hover states, sidebar) are re-derived
//      so the rest of the UI keeps matching.
//
// With the default look and no brand color, nothing is emitted at all.
// With only a brand color, the output is identical to Level 1 (lib/brand-color.ts).

import {
  BRAND_CACHE_KEY,
  BRAND_STYLE_ID,
  contrast,
  hexToRgb,
  isHexColor,
  rgbToHex,
} from "@/lib/brand-color";

type RGB = [number, number, number];

/* ----------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------- */

export type Mode = "light" | "dark";

export const SURFACES = ["neutral", "warm", "cool", "brand"] as const;
export const INTENSITIES = ["subtle", "soft", "rich"] as const;
export const SIDEBARS = ["match", "tinted", "dark", "brand"] as const;
export const RADII = ["sharp", "default", "soft", "round"] as const;
export const COLOR_SLOTS = ["background", "card", "sidebar", "foreground", "border"] as const;

export type Surface = (typeof SURFACES)[number];
export type Intensity = (typeof INTENSITIES)[number];
export type SidebarStyle = (typeof SIDEBARS)[number];
export type Radius = (typeof RADII)[number];
export type ColorSlot = (typeof COLOR_SLOTS)[number];
export type Overrides = Partial<Record<ColorSlot, string>>;

export type Appearance = {
  surface: Surface; // where page/card/border tint comes from
  intensity: Intensity; // how strong that tint is
  sidebar: SidebarStyle;
  radius: Radius;
  overrides: Record<Mode, Overrides>; // advanced, per mode
};

export const DEFAULT_APPEARANCE: Appearance = {
  surface: "neutral",
  intensity: "soft",
  sidebar: "match",
  radius: "default",
  overrides: { light: {}, dark: {} },
};

export type Check = { id: string; label: string; ratio: number; min: number; ok: boolean };

export type ModeResult = {
  /** Only the CSS variables that differ from the defaults in global.css. */
  tokens: Record<string, string>;
  /** The colors actually in effect for the five adjustable slots. */
  palette: Record<ColorSlot, string>;
  checks: Check[];
  /** Slots whose owner-picked color had to be changed to stay readable. */
  adjusted: ColorSlot[];
};

export type ThemeResult = {
  css: string; // "" when nothing differs from the defaults
  light: ModeResult;
  dark: ModeResult;
  radius: string | null;
};

/* ----------------------------------------------------------------------------
 * Parsing / comparing stored values
 * ------------------------------------------------------------------------- */

const pick = <T extends readonly string[]>(list: T, v: unknown, fallback: T[number]): T[number] =>
  (list as readonly string[]).includes(v as string) ? (v as T[number]) : fallback;

/** Accepts whatever the API returned (including `{}` or null) and returns a full Appearance. */
export function normalizeAppearance(raw: unknown): Appearance {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, any>;
  const overrides = (mode: Mode): Overrides => {
    const src = r.overrides?.[mode];
    const out: Overrides = {};
    if (src && typeof src === "object") {
      for (const slot of COLOR_SLOTS) {
        if (isHexColor(src[slot])) out[slot] = (src[slot] as string).toUpperCase();
      }
    }
    return out;
  };
  return {
    surface: pick(SURFACES, r.surface, "neutral"),
    intensity: pick(INTENSITIES, r.intensity, "soft"),
    sidebar: pick(SIDEBARS, r.sidebar, "match"),
    radius: pick(RADII, r.radius, "default"),
    overrides: { light: overrides("light"), dark: overrides("dark") },
  };
}

export const hasOverrides = (a: Appearance) =>
  Object.keys(a.overrides.light).length + Object.keys(a.overrides.dark).length > 0;

/** True when the appearance changes nothing (so we store `{}` and emit no CSS). */
export const isDefaultAppearance = (a: Appearance) =>
  a.surface === "neutral" && a.sidebar === "match" && a.radius === "default" && !hasOverrides(a);

/* ----------------------------------------------------------------------------
 * Color math
 * ------------------------------------------------------------------------- */

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export function rgbToOklch([r, g, b]: RGB): [number, number, number] {
  const R = toLinear(r / 255);
  const G = toLinear(g / 255);
  const B = toLinear(b / 255);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.hypot(a, bb), ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360];
}

function oklchToLinear(L: number, C: number, H: number): RGB {
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const inGamut = (rgb: RGB) => rgb.every((v) => v >= -0.0005 && v <= 1.0005);

/** OKLCH -> sRGB (0-255). Out-of-gamut colors lose chroma, never lightness. */
export function oklchToRgb(L: number, C: number, H: number): RGB {
  let lin = oklchToLinear(L, C, H);
  if (!inGamut(lin)) {
    let lo = 0;
    let hi = C;
    for (let i = 0; i < 14; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinear(L, mid, H))) lo = mid;
      else hi = mid;
    }
    lin = oklchToLinear(L, lo, H);
  }
  return lin.map((v) => clamp(fromLinear(clamp(v, 0, 1)), 0, 1) * 255) as RGB;
}

const ok = oklchToRgb;
const WHITE: RGB = [255, 255, 255];
const BLACK: RGB = [0, 0, 0];

const mix = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
const snap = (c: RGB): RGB => [Math.round(c[0]), Math.round(c[1]), Math.round(c[2])];
const cr = (a: RGB, b: RGB) => contrast(snap(a), snap(b)); // contrast of what is really painted
const lum = (c: RGB) => {
  const f = (v: number) => toLinear(v / 255);
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
};
const towardFor = (bg: RGB): RGB => (cr(WHITE, bg) >= cr(BLACK, bg) ? WHITE : BLACK);

/** Move `c` toward `toward` until it reaches `min` contrast on every color in `bgs`. */
function ensureContrast(c: RGB, bgs: RGB[], toward: RGB, min: number): RGB {
  for (let step = 0; step <= 20; step++) {
    const candidate = mix(c, toward, step / 20);
    if (bgs.every((bg) => cr(candidate, bg) >= min)) return candidate;
  }
  return toward;
}

/** Near-black or near-white text (lightly tinted), whichever reads best on `bg`. */
function textOn(bg: RGB, hue = 0, chroma = 0): RGB {
  const dark = ok(0.17, chroma, hue);
  const light = ok(0.975, chroma * 0.4, hue);
  const best = cr(dark, bg) >= cr(light, bg) ? dark : light;
  if (cr(best, bg) >= 4.5) return best;
  // mid-tone backgrounds: only pure black or white can reach 4.5:1
  return cr(BLACK, bg) >= cr(WHITE, bg) ? BLACK : WHITE;
}

/** Label color for a filled button: near-black or white, pure black on mid-tones that need it. */
const onColor = (c: RGB): string => {
  const white = cr(c, WHITE);
  const ink = cr(c, [10, 10, 10]);
  if (Math.max(white, ink) >= 4.5) return white >= ink ? "#FFFFFF" : "#0A0A0A";
  return cr(c, BLACK) >= white ? "#000000" : "#FFFFFF";
};
const hx = (c: RGB) => rgbToHex(c);

/* ----------------------------------------------------------------------------
 * Palettes: the shadcn defaults, and the tinted "ladders"
 * ------------------------------------------------------------------------- */

type Palette = {
  background: RGB;
  foreground: RGB;
  card: RGB;
  cardForeground: RGB;
  muted: RGB;
  mutedForeground: RGB;
  border: RGB;
  input: RGB;
  sidebar: RGB;
};

const px = (L: number): RGB => snap(ok(L, 0, 0));
const DEFAULT_PALETTE: Record<Mode, Palette> = {
  light: {
    background: px(1),
    foreground: px(0.145),
    card: px(1),
    cardForeground: px(0.145),
    muted: px(0.97),
    mutedForeground: px(0.556),
    border: px(0.922),
    input: px(0.922),
    sidebar: px(0.985),
  },
  dark: {
    background: px(0.145),
    foreground: px(0.985),
    card: px(0.205),
    cardForeground: px(0.985),
    muted: px(0.269),
    mutedForeground: px(0.708),
    border: mix(px(0.145), WHITE, 0.1), // global.css uses 10% white
    input: mix(px(0.145), WHITE, 0.15),
    sidebar: px(0.205),
  },
};

const TINT: Record<Intensity, number> = { subtle: 0.005, soft: 0.01, rich: 0.02 };
const SURFACE_HUE: Record<Exclude<Surface, "brand" | "neutral">, number> = { warm: 75, cool: 255 };

/**
 * The lightness ladder. Lightness steps are FIXED (that is what guarantees hierarchy and
 * contrast); only hue and a tiny chroma change. Chroma is capped at 0.03.
 */
function ladder(mode: Mode, hue: number | null, u: number): Palette {
  const H = hue ?? 0;
  const c = (k: number) => (hue === null ? 0 : Math.min(u * k, 0.03));
  if (mode === "light") {
    const fg = ok(0.175, c(1), H);
    return {
      background: ok(0.985, c(0.8), H),
      foreground: fg,
      card: ok(1, 0, 0), // pure white cards lift off the tinted page
      cardForeground: fg,
      muted: ok(0.955, c(1.2), H),
      mutedForeground: ok(0.5, c(0.8), H),
      border: ok(0.91, c(1.4), H),
      input: ok(0.91, c(1.4), H),
      sidebar: ok(0.972, c(1), H),
    };
  }
  const card = ok(0.2, c(1.2), H);
  const fg = ok(0.975, c(0.4), H);
  return {
    background: ok(0.15, c(1.2), H),
    foreground: fg,
    card,
    cardForeground: fg,
    muted: ok(0.265, c(1.3), H),
    mutedForeground: ok(0.72, c(0.8), H),
    border: ok(0.3, c(1.4), H),
    input: ok(0.33, c(1.4), H),
    sidebar: card,
  };
}

/** A border that is too faint to see is strengthened toward the text color. */
function visibleBorder(border: RGB, bg: RGB, text: RGB, min = 1.12): RGB {
  for (let t = 0; t <= 1; t += 0.05) {
    const candidate = mix(border, text, t);
    if (cr(candidate, bg) >= min) return candidate;
  }
  return text;
}

/**
 * Apply hand-picked colors. Everything that depends on them is re-derived by mixing the
 * page color toward the text color, so the whole UI stays one family.
 */
function withOverrides(mode: Mode, P: Palette, o: Overrides, adjusted: ColorSlot[]): Palette {
  const light = mode === "light";
  const baseChanged = !!(o.background || o.foreground);

  const B = o.background ? hexToRgb(o.background) : P.background;

  // Text: keep the ladder's if it still reads well, else pick the best polarity for B.
  let F = P.foreground;
  if (o.foreground) {
    F = hexToRgb(o.foreground);
    if (cr(F, B) < 4.5) {
      F = ensureContrast(F, [B], towardFor(B), 4.5);
      adjusted.push("foreground");
    }
  } else if (cr(F, B) < 7) {
    F = textOn(B);
  }

  const C = o.card ? hexToRgb(o.card) : o.background ? (light ? mix(B, WHITE, 0.7) : mix(B, WHITE, 0.04)) : P.card;
  const CF = cr(F, C) >= 4.5 ? F : textOn(C);
  const M = baseChanged ? mix(B, F, light ? 0.045 : 0.11) : P.muted;

  let MF = baseChanged ? mix(F, B, 0.35) : P.mutedForeground;
  if (![B, M, C].every((bg) => cr(MF, bg) >= 4.5)) {
    MF = F;
    for (let t = 0.35; t >= 0; t -= 0.05) {
      const candidate = mix(F, B, t);
      if ([B, M, C].every((bg) => cr(candidate, bg) >= 4.5)) {
        MF = candidate;
        break;
      }
    }
  }

  let BD = baseChanged ? visibleBorder(mix(B, F, light ? 0.1 : 0.13), B, F) : P.border;
  let IN = baseChanged ? visibleBorder(mix(B, F, light ? 0.1 : 0.17), B, F) : P.input;
  if (o.border) {
    const picked = hexToRgb(o.border);
    BD = visibleBorder(picked, B, F);
    if (cr(BD, B) !== cr(picked, B)) adjusted.push("border");
    IN = BD;
  }

  const surfaceChanged = baseChanged || !!o.card;
  const sidebar = surfaceChanged ? (light ? mix(B, F, 0.025) : C) : P.sidebar;
  return { background: B, foreground: F, card: C, cardForeground: CF, muted: M, mutedForeground: MF, border: BD, input: IN, sidebar };
}

/* ----------------------------------------------------------------------------
 * Radius
 * ------------------------------------------------------------------------- */

const RADIUS_VALUE: Record<Radius, string | null> = {
  sharp: "0.25rem",
  default: null, // keep global.css (0.625rem)
  soft: "0.875rem",
  round: "1.25rem",
};

/* ----------------------------------------------------------------------------
 * Building one mode
 * ------------------------------------------------------------------------- */

type Brand = { rgb: RGB; L: number; C: number; H: number };

function modeTokens(mode: Mode, brand: Brand | null, a: Appearance): ModeResult {
  const light = mode === "light";
  const o = a.overrides[mode];
  const adjusted: ColorSlot[] = [];
  const tokens: Record<string, string> = {};

  // 1. Surfaces ---------------------------------------------------------------
  const tinted = a.surface !== "neutral";
  const hue = !tinted ? null : a.surface === "brand" ? (brand?.H ?? 255) : SURFACE_HUE[a.surface as "warm" | "cool"];
  const u = TINT[a.intensity];
  let P = tinted ? ladder(mode, hue, u) : DEFAULT_PALETTE[mode];
  const surfaceOverridden = !!(o.background || o.foreground || o.card || o.border);
  if (surfaceOverridden) P = withOverrides(mode, P, o, adjusted);
  const surfaceActive = tinted || surfaceOverridden;

  // 2. Brand (identical to Level 1 when nothing else is customized) ------------
  let primary: RGB | null = null;
  let primaryFg = "";
  let accent: RGB | null = null;
  if (brand) {
    primary = ensureContrast(brand.rgb, [P.background, P.card], towardFor(P.background), 3);
    primaryFg = onColor(primary);
    const accentBase = lum(P.background) > 0.5 ? P.background : P.muted;
    accent = mix(accentBase, primary, light ? 0.12 : 0.18);
    tokens["primary"] = hx(primary);
    tokens["primary-foreground"] = primaryFg;
    tokens["ring"] = hx(primary);
    tokens["sidebar-primary"] = hx(primary);
    tokens["sidebar-primary-foreground"] = primaryFg;
    tokens["sidebar-ring"] = hx(primary);
    tokens["accent"] = hx(accent);
    tokens["sidebar-accent"] = hx(accent);
  }

  if (surfaceActive) {
    tokens["background"] = hx(P.background);
    tokens["foreground"] = hx(P.foreground);
    tokens["card"] = hx(P.card);
    tokens["card-foreground"] = hx(P.cardForeground);
    tokens["popover"] = hx(P.card);
    tokens["popover-foreground"] = hx(P.cardForeground);
    tokens["muted"] = hx(P.muted);
    tokens["muted-foreground"] = hx(P.mutedForeground);
    tokens["secondary"] = hx(P.muted);
    tokens["secondary-foreground"] = hx(P.foreground);
    tokens["border"] = hx(P.border);
    tokens["input"] = hx(P.input);
    tokens["accent-foreground"] = hx(P.foreground);
    if (!accent) tokens["accent"] = hx(P.muted);
    if (!brand) tokens["sidebar-accent"] = hx(P.muted);
  }

  // 3. Sidebar -----------------------------------------------------------------
  const sidebarActive = a.sidebar !== "match" || !!o.sidebar || surfaceActive;
  let S = P.sidebar;
  let SF = P.foreground;
  if (sidebarActive) {
    const bc = brand && brand.C >= 0.03 ? Math.min(Math.max(brand.C * 0.75, 0.04), 0.1) : 0;
    const bh = brand?.H ?? 0;
    const sh = hue ?? (brand && a.sidebar === "tinted" ? brand.H : null); // tint source
    const sc = sh === null ? 0 : Math.min(u * 2.2, 0.03);
    let darkSidebar = false;

    if (o.sidebar) {
      S = hexToRgb(o.sidebar);
      darkSidebar = lum(S) < 0.18;
    } else if (a.sidebar === "dark") {
      S = ok(light ? 0.215 : 0.19, sh === null ? 0 : Math.min(u * 2, 0.03), sh ?? 0);
      darkSidebar = true;
    } else if (a.sidebar === "brand") {
      S = ok(light ? 0.3 : 0.26, bc, bh);
      darkSidebar = true;
    } else if (a.sidebar === "tinted") {
      S = light ? ok(0.955, sc, sh ?? 0) : ok(0.18, sc, sh ?? 0);
    }

    const sh2 = a.sidebar === "brand" ? bh : (sh ?? 0);
    SF = darkSidebar && !o.sidebar ? ok(0.975, a.sidebar === "brand" ? 0.006 : 0, sh2) : textOn(S, sh2, 0.01);
    if (cr(SF, S) < 4.5) SF = textOn(S);

    const SA = darkSidebar
      ? mix(S, SF, 0.1)
      : accent && !o.sidebar
        ? mix(S, primary as RGB, light ? 0.12 : 0.18)
        : mix(S, SF, 0.06);
    const SB = mix(S, SF, darkSidebar ? 0.14 : 0.12);

    let SP: RGB;
    let SPF: RGB;
    if (darkSidebar) {
      SP = brand ? ok(0.86, Math.min(Math.max(brand.C, 0.03) * 0.8, 0.12), bh) : SF;
      SPF = brand ? ok(0.2, 0.02, bh) : S;
    } else if (primary) {
      SP = ensureContrast(primary, [S], towardFor(S), 3);
      SPF = hexToRgb(onColor(SP));
    } else {
      SP = SF;
      SPF = S;
    }

    tokens["sidebar"] = hx(S);
    tokens["sidebar-foreground"] = hx(SF);
    tokens["sidebar-accent"] = hx(SA);
    tokens["sidebar-accent-foreground"] = hx(SF);
    tokens["sidebar-border"] = hx(SB);
    tokens["sidebar-primary"] = hx(SP);
    tokens["sidebar-primary-foreground"] = hx(SPF);
  }

  // 4. Checks ------------------------------------------------------------------
  const checks: Check[] = [];
  const add = (id: string, label: string, a: RGB, b: RGB, min: number) => {
    const ratio = Math.round(cr(a, b) * 10) / 10;
    checks.push({ id, label, ratio, min, ok: cr(a, b) >= min - 0.001 });
  };
  add("text", "Text on page", P.foreground, P.background, 4.5);
  add("card-text", "Text on cards", P.cardForeground, P.card, 4.5);
  add("muted", "Secondary text", P.mutedForeground, P.background, 4.5);
  add("sidebar-text", "Sidebar text", SF, S, 4.5);
  add("border", "Borders visible", P.border, P.background, 1.1);
  if (primary) {
    add("button", "Button text", hexToRgb(primaryFg), primary, 4.5);
    add("brand", "Brand color on page", primary, P.background, 3);
  }

  return {
    tokens,
    palette: {
      background: hx(P.background),
      card: hx(P.card),
      sidebar: hx(S),
      foreground: hx(P.foreground),
      border: hx(P.border),
    },
    checks,
    adjusted,
  };
}

/* ----------------------------------------------------------------------------
 * Public API
 * ------------------------------------------------------------------------- */

const block = (selector: string, tokens: Record<string, string>) => {
  const body = Object.entries(tokens).map(([k, v]) => `--${k}:${v}`).join(";");
  return body ? `${selector}{${body}}` : "";
};

export function buildTheme(brandColor: string | null | undefined, appearanceRaw?: unknown): ThemeResult {
  const a = normalizeAppearance(appearanceRaw);
  let brand: Brand | null = null;
  if (isHexColor(brandColor)) {
    const rgb = hexToRgb(brandColor);
    const [L, C, H] = rgbToOklch(rgb);
    brand = { rgb, L, C, H };
  }

  const light = modeTokens("light", brand, a);
  const dark = modeTokens("dark", brand, a);
  const radius = RADIUS_VALUE[a.radius];
  const lightTokens = radius ? { ...light.tokens, radius } : light.tokens;

  const css = [block("html:root", lightTokens), block("html.dark", dark.tokens)].filter(Boolean).join("\n");
  return { css, light, dark, radius };
}

/** Apply (or clear) the theme on the whole document. `persist: false` is for live previews. */
export function applyTheme(
  brandColor: string | null | undefined,
  appearance?: unknown,
  { persist = true }: { persist?: boolean } = {},
) {
  if (typeof document === "undefined") return;
  const { css } = buildTheme(brandColor, appearance);
  let el = document.getElementById(BRAND_STYLE_ID) as HTMLStyleElement | null;

  if (!css) {
    el?.remove();
    if (persist) {
      try {
        localStorage.removeItem(BRAND_CACHE_KEY);
      } catch {}
    }
    return;
  }
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

/* ----------------------------------------------------------------------------
 * Guidance: what matches a brand color
 * ------------------------------------------------------------------------- */

export type Recommendation = { surface: Surface; sidebar: SidebarStyle; reason: string };

export function recommendFor(hex: string | null | undefined): Recommendation {
  if (!isHexColor(hex)) {
    return { surface: "neutral", sidebar: "match", reason: "Pick a brand color and we will suggest what goes with it." };
  }
  const [L, C, H] = rgbToOklch(hexToRgb(hex));
  if (C < 0.03) {
    return {
      surface: "neutral",
      sidebar: "dark",
      reason: "A neutral brand color looks sharpest on neutral surfaces with a dark sidebar.",
    };
  }
  const warmHue = H < 165 || H >= 335; // reds, oranges, yellows, greens, pinks
  const surface: Surface = warmHue ? "warm" : "cool";
  const strongAndDeep = C > 0.12 && L < 0.62;
  return {
    surface,
    sidebar: strongAndDeep ? "brand" : "tinted",
    reason: `${warmHue ? "Warm" : "Cool"} surfaces sit best next to this color. ${
      strongAndDeep
        ? "It is deep enough to work as a sidebar color."
        : "It is better kept for buttons and highlights, with a softly tinted sidebar."
    }`,
  };
}

/* ----------------------------------------------------------------------------
 * Curated presets
 * ------------------------------------------------------------------------- */

export type Preset = { id: string; name: string; note: string; brand: string; appearance: Appearance };

const look = (p: Partial<Omit<Appearance, "overrides">>): Appearance => ({ ...DEFAULT_APPEARANCE, ...p });

export const PRESETS: Preset[] = [
  { id: "classic", name: "Classic", note: "Clean black and white", brand: "", appearance: look({}) },
  { id: "ocean", name: "Ocean", note: "Cool and calm", brand: "#2563EB", appearance: look({ surface: "cool", intensity: "soft", sidebar: "tinted" }) },
  { id: "forest", name: "Forest", note: "Natural and warm", brand: "#15803D", appearance: look({ surface: "warm", intensity: "soft", sidebar: "tinted" }) },
  { id: "sunset", name: "Sunset", note: "Friendly and bright", brand: "#EA580C", appearance: look({ surface: "warm", intensity: "soft", sidebar: "match", radius: "soft" }) },
  { id: "rose", name: "Rose", note: "Soft and rounded", brand: "#E11D48", appearance: look({ surface: "brand", intensity: "subtle", sidebar: "match", radius: "round" }) },
  { id: "midnight", name: "Midnight", note: "Dark sidebar, indigo accents", brand: "#6366F1", appearance: look({ surface: "cool", intensity: "subtle", sidebar: "dark" }) },
  { id: "violet", name: "Violet", note: "Bold brand sidebar", brand: "#7C3AED", appearance: look({ surface: "brand", intensity: "subtle", sidebar: "brand", radius: "soft" }) },
  { id: "graphite", name: "Graphite", note: "Sharp and professional", brand: "#27272A", appearance: look({ surface: "neutral", sidebar: "dark", radius: "sharp" }) },
];

/* ----------------------------------------------------------------------------
 * Scoped previews (settings page): full token set for one mode
 * ------------------------------------------------------------------------- */

const DEFAULT_CSS: Record<Mode, Record<string, string>> = {
  light: {
    background: "oklch(1 0 0)", foreground: "oklch(0.145 0 0)", card: "oklch(1 0 0)", "card-foreground": "oklch(0.145 0 0)",
    popover: "oklch(1 0 0)", "popover-foreground": "oklch(0.145 0 0)", primary: "oklch(0.205 0 0)", "primary-foreground": "oklch(0.985 0 0)",
    secondary: "oklch(0.97 0 0)", "secondary-foreground": "oklch(0.205 0 0)", muted: "oklch(0.97 0 0)", "muted-foreground": "oklch(0.556 0 0)",
    accent: "oklch(0.97 0 0)", "accent-foreground": "oklch(0.205 0 0)", border: "oklch(0.922 0 0)", input: "oklch(0.922 0 0)", ring: "oklch(0.708 0 0)",
    sidebar: "oklch(0.985 0 0)", "sidebar-foreground": "oklch(0.145 0 0)", "sidebar-primary": "oklch(0.205 0 0)", "sidebar-primary-foreground": "oklch(0.985 0 0)",
    "sidebar-accent": "oklch(0.97 0 0)", "sidebar-accent-foreground": "oklch(0.205 0 0)", "sidebar-border": "oklch(0.922 0 0)", "sidebar-ring": "oklch(0.708 0 0)",
  },
  dark: {
    background: "oklch(0.145 0 0)", foreground: "oklch(0.985 0 0)", card: "oklch(0.205 0 0)", "card-foreground": "oklch(0.985 0 0)",
    popover: "oklch(0.205 0 0)", "popover-foreground": "oklch(0.985 0 0)", primary: "oklch(0.922 0 0)", "primary-foreground": "oklch(0.205 0 0)",
    secondary: "oklch(0.269 0 0)", "secondary-foreground": "oklch(0.985 0 0)", muted: "oklch(0.269 0 0)", "muted-foreground": "oklch(0.708 0 0)",
    accent: "oklch(0.269 0 0)", "accent-foreground": "oklch(0.985 0 0)", border: "oklch(1 0 0 / 10%)", input: "oklch(1 0 0 / 15%)", ring: "oklch(0.556 0 0)",
    sidebar: "oklch(0.205 0 0)", "sidebar-foreground": "oklch(0.985 0 0)", "sidebar-primary": "oklch(0.488 0.243 264.376)", "sidebar-primary-foreground": "oklch(0.985 0 0)",
    "sidebar-accent": "oklch(0.269 0 0)", "sidebar-accent-foreground": "oklch(0.985 0 0)", "sidebar-border": "oklch(1 0 0 / 10%)", "sidebar-ring": "oklch(0.556 0 0)",
  },
};

/** Every CSS variable for one mode, as inline-style keys ("--background": "..."). */
export function previewVars(mode: Mode, theme: ThemeResult): Record<string, string> {
  const merged = { ...DEFAULT_CSS[mode], ...(mode === "light" ? theme.light.tokens : theme.dark.tokens) };
  const vars: Record<string, string> = {};
  for (const [k, v] of Object.entries(merged)) vars[`--${k}`] = v;
  vars["--radius"] = theme.radius ?? "0.625rem";
  return vars;
}