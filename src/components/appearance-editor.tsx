"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { BrandColorPicker } from "@/components/brand-color-picker";
import { isHexColor } from "@/lib/brand-color";
import {
  COLOR_SLOTS,
  DEFAULT_APPEARANCE,
  PRESETS,
  buildTheme,
  hasOverrides,
  normalizeAppearance,
  recommendFor,
  type Appearance,
  type ColorSlot,
  type Intensity,
  type Mode,
  type Preset,
  type Radius,
  type SidebarStyle,
  type Surface,
} from "@/lib/theme-engine";
import { ThemeFrame } from "./theme-preview";

export type AppearanceValue = { brandColor: string; appearance: Appearance };

type Props = {
  brandColor: string;
  appearance: unknown; // whatever the API returned
  onChange: (value: AppearanceValue) => void;
};

const SURFACE_OPTIONS: { value: Surface; label: string }[] = [
  { value: "neutral", label: "Neutral" },
  { value: "warm", label: "Warm" },
  { value: "cool", label: "Cool" },
  { value: "brand", label: "Match brand" },
];
const INTENSITY_OPTIONS: { value: Intensity; label: string }[] = [
  { value: "subtle", label: "Subtle" },
  { value: "soft", label: "Soft" },
  { value: "rich", label: "Rich" },
];
const SIDEBAR_OPTIONS: { value: SidebarStyle; label: string }[] = [
  { value: "match", label: "Match page" },
  { value: "tinted", label: "Tinted" },
  { value: "dark", label: "Dark" },
  { value: "brand", label: "Brand" },
];
const RADIUS_OPTIONS: { value: Radius; label: string }[] = [
  { value: "sharp", label: "Sharp" },
  { value: "default", label: "Default" },
  { value: "soft", label: "Soft" },
  { value: "round", label: "Round" },
];
const SLOT_LABELS: Record<ColorSlot, string> = {
  background: "Page background",
  card: "Cards and menus",
  sidebar: "Sidebar",
  foreground: "Text",
  border: "Borders",
};

const fieldClass =
  "h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30";

function sameLook(a: Appearance, brand: string, p: Preset) {
  return (
    brand.toUpperCase() === p.brand.toUpperCase() &&
    a.surface === p.appearance.surface &&
    a.sidebar === p.appearance.sidebar &&
    a.radius === p.appearance.radius &&
    (a.surface === "neutral" || a.intensity === p.appearance.intensity) &&
    !hasOverrides(a)
  );
}

function Segmented<T extends string>({
  label,
  hint,
  value,
  options,
  onChange,
  suggested,
  disabled,
}: {
  label: string;
  hint?: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  suggested?: T;
  disabled?: boolean;
}) {
  return (
    <fieldset disabled={disabled} className="space-y-1.5 disabled:opacity-50">
      <legend className="text-sm font-medium">{label}</legend>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className="rounded-md border px-3 py-1.5 text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:border-primary aria-pressed:bg-accent aria-pressed:text-accent-foreground"
          >
            {o.label}
            {suggested === o.value && (
              <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                Suggested
              </span>
            )}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function ColorRow({
  label,
  value,
  overridden,
  adjusted,
  onChange,
  onClear,
}: {
  label: string;
  value: string; // the color in effect
  overridden: boolean;
  adjusted: boolean;
  onChange: (hex: string) => void;
  onClear: () => void;
}) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);

  const onText = (raw: string) => {
    setText(raw);
    const withHash = raw.startsWith("#") ? raw : `#${raw}`;
    if (isHexColor(withHash)) onChange(withHash.toUpperCase());
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="w-36 text-sm">{label}</span>
      <input
        type="color"
        value={value.toLowerCase()}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        aria-label={`${label} color`}
        className="h-9 w-12 cursor-pointer rounded-md border border-input bg-transparent p-1"
      />
      <input
        type="text"
        value={text}
        onChange={(e) => onText(e.target.value)}
        onBlur={() => setText(value)}
        maxLength={7}
        spellCheck={false}
        aria-label={`${label} hex`}
        className={`${fieldClass} w-28 font-mono`}
      />
      {overridden ? (
        <Button type="button" variant="outline" size="sm" onClick={onClear}>
          Use automatic
        </Button>
      ) : (
        <span className="text-xs text-muted-foreground">Automatic</span>
      )}
      {adjusted && (
        <span className="text-xs text-muted-foreground">Adjusted so it stays readable</span>
      )}
    </div>
  );
}

export function AppearanceEditor({ brandColor, appearance, onChange }: Props) {
  const a = useMemo(() => normalizeAppearance(appearance), [appearance]);
  const theme = useMemo(() => buildTheme(brandColor, a), [brandColor, a]);
  const rec = useMemo(() => recommendFor(brandColor), [brandColor]);
  const hasBrand = isHexColor(brandColor);
  const [mode, setMode] = useState<Mode>("light");

  const update = (patch: Partial<Appearance>) => onChange({ brandColor, appearance: { ...a, ...patch } });

  const setOverride = (slot: ColorSlot, hex: string | null) => {
    const next = { ...a.overrides[mode] };
    if (hex) next[slot] = hex;
    else delete next[slot];
    update({ overrides: { ...a.overrides, [mode]: next } });
  };

  const suggestionApplied = a.surface === rec.surface && a.sidebar === rec.sidebar;
  const result = mode === "light" ? theme.light : theme.dark;

  return (
    <section className="space-y-8">
      <div>
        <h3 className="text-base font-semibold">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Choose a look for everyone in your company. Colors are balanced for you, so text stays
          readable and the interface stays consistent.
        </p>
      </div>

      {/* 1. Presets ---------------------------------------------------------- */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Start with a look</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PRESETS.map((p) => {
            const t = buildTheme(p.brand, p.appearance);
            const active = sameLook(a, brandColor, p);
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ brandColor: p.brand, appearance: p.appearance })}
                className="space-y-2 rounded-lg border p-2 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:border-primary aria-pressed:ring-2 aria-pressed:ring-primary/30"
              >
                <ThemeFrame theme={t} mode="light" compact />
                <span className="block px-0.5">
                  <span className="block text-sm font-medium">{p.name}</span>
                  <span className="block text-xs text-muted-foreground">{p.note}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Live preview (both modes) ---------------------------------------- */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Preview</p>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Light mode</p>
            <ThemeFrame theme={theme} mode="light" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Dark mode</p>
            <ThemeFrame theme={theme} mode="dark" />
          </div>
        </div>
      </div>

      {/* 3. Guided controls ---------------------------------------------------- */}
      <div className="space-y-6">
        <BrandColorPicker
          value={brandColor}
          onChange={(hex) => onChange({ brandColor: hex, appearance: a })}
        />

        {hasBrand && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/50 p-3">
            <p className="max-w-prose text-sm">
              <span className="font-medium">What goes with this color: </span>
              {rec.reason}
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={suggestionApplied}
              onClick={() => update({ surface: rec.surface, sidebar: rec.sidebar })}
            >
              {suggestionApplied ? "Applied" : "Use suggestion"}
            </Button>
          </div>
        )}

        <Segmented
          label="Page and card tone"
          hint="A light tint on pages, cards and borders. Keep it quiet: the brand color is for buttons and highlights."
          value={a.surface}
          options={SURFACE_OPTIONS}
          onChange={(surface) => update({ surface })}
          suggested={hasBrand ? rec.surface : undefined}
        />
        <Segmented
          label="Tint strength"
          value={a.intensity}
          options={INTENSITY_OPTIONS}
          onChange={(intensity) => update({ intensity })}
          disabled={a.surface === "neutral" && a.sidebar !== "tinted"}
        />
        <Segmented
          label="Sidebar"
          hint="Dark and Brand sidebars suit strong brand colors. Tinted suits lighter ones."
          value={a.sidebar}
          options={SIDEBAR_OPTIONS}
          onChange={(sidebar) => update({ sidebar })}
          suggested={hasBrand ? rec.sidebar : undefined}
        />
        <Segmented
          label="Corners"
          value={a.radius}
          options={RADIUS_OPTIONS}
          onChange={(radius) => update({ radius })}
        />
      </div>

      {/* 4. Advanced ----------------------------------------------------------- */}
      <details className="rounded-lg border" open={hasOverrides(a) || undefined}>
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
          Advanced: fine-tune colors
        </summary>
        <div className="space-y-5 border-t p-4">
          <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
            <li>Keep pages and cards close to white (or near-black in dark mode).</li>
            <li>Cards should be a little lighter than the page so they stand out.</li>
            <li>Text must stay readable. Anything below 4.5:1 contrast is adjusted for you.</li>
            <li>One strong color is plenty. Use the brand color for actions, not backgrounds.</li>
          </ul>

          <div className="inline-flex rounded-md border p-0.5" role="group" aria-label="Mode to edit">
            {(["light", "dark"] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
                className="rounded px-3 py-1 text-sm capitalize outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:bg-accent aria-pressed:text-accent-foreground"
              >
                {m} mode
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {COLOR_SLOTS.map((slot) => (
              <ColorRow
                key={`${mode}-${slot}`}
                label={SLOT_LABELS[slot]}
                value={result.palette[slot]}
                overridden={!!a.overrides[mode][slot]}
                adjusted={result.adjusted.includes(slot)}
                onChange={(hex) => setOverride(slot, hex)}
                onClear={() => setOverride(slot, null)}
              />
            ))}
          </div>

          <ul className="grid gap-x-6 gap-y-1 text-xs sm:grid-cols-2" aria-label="Readability checks">
            {result.checks.map((c) => (
              <li key={c.id} className="flex justify-between gap-3">
                <span className="text-muted-foreground">{c.label}</span>
                <span>
                  {c.ratio}:1 {c.ok ? "✓" : "!"}
                </span>
              </li>
            ))}
          </ul>

          {hasOverrides(a) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => update({ overrides: { light: {}, dark: {} } })}
            >
              Reset all custom colors
            </Button>
          )}
        </div>
      </details>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange({ brandColor: "", appearance: DEFAULT_APPEARANCE })}
      >
        Reset to the default look
      </Button>
    </section>
  );
}