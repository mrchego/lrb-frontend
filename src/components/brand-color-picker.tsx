"use client";

import { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Button } from "@/components/ui/button";
import { hexToRgb, isHexColor, rgbToHex } from "@/lib/brand-color";

const FALLBACK = "#2563EB"; // what the picker shows while no brand color is set
const PRESETS = [
  "#2563EB",
  "#7C3AED",
  "#DB2777",
  "#DC2626",
  "#EA580C",
  "#16A34A",
  "#0D9488",
  "#0F172A",
];

const fieldClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30";

type Props = {
  /** "#RRGGBB", or "" when the company uses the default colors. */
  value: string;
  onChange: (hex: string) => void;
};

export function BrandColorPicker({ value, onChange }: Props) {
  const isSet = isHexColor(value);
  const current = isSet ? value.toUpperCase() : FALLBACK;
  const [r, g, b] = hexToRgb(current);

  // The hex box keeps its own text so half-typed values don't snap back.
  const [hexText, setHexText] = useState(current);
  useEffect(() => setHexText(current), [current]);

  const setChannel = (index: 0 | 1 | 2, raw: string) => {
    const rgb: [number, number, number] = [r, g, b];
    rgb[index] = Math.min(255, Math.max(0, Math.round(Number(raw) || 0)));
    onChange(rgbToHex(rgb));
  };

  const onHexText = (raw: string) => {
    setHexText(raw);
    const withHash = raw.startsWith("#") ? raw : `#${raw}`;
    if (isHexColor(withHash)) onChange(withHash.toUpperCase());
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">Brand color</p>
        <p className="text-xs text-muted-foreground">
          Sets the color of buttons, highlights, focus rings and the sidebar for
          everyone in your company. Text colors adjust automatically so it stays
          readable.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <HexColorPicker color={current} onChange={(c) => onChange(c.toUpperCase())} />

        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {(["R", "G", "B"] as const).map((label, i) => (
              <label key={label} className="space-y-1 text-xs text-muted-foreground">
                {label}
                <input
                  type="number"
                  min={0}
                  max={255}
                  inputMode="numeric"
                  value={[r, g, b][i]}
                  onChange={(e) => setChannel(i as 0 | 1 | 2, e.target.value)}
                  className={fieldClass}
                  aria-label={`${label} (0 to 255)`}
                />
              </label>
            ))}
          </div>

          <label className="block space-y-1 text-xs text-muted-foreground">
            Hex
            <input
              type="text"
              value={hexText}
              onChange={(e) => onHexText(e.target.value)}
              onBlur={() => setHexText(current)}
              maxLength={7}
              spellCheck={false}
              className={`${fieldClass} font-mono`}
              aria-label="Hex color"
            />
          </label>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Preset colors">
            {PRESETS.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => onChange(hex)}
                aria-label={`Use ${hex}`}
                aria-pressed={isSet && current === hex}
                className="h-7 w-7 rounded-full border border-border outline-none ring-offset-2 ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring aria-pressed:ring-2 aria-pressed:ring-ring"
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" size="sm" tabIndex={-1}>
              Preview
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!isSet}
              onClick={() => onChange("")}
            >
              Reset to default
            </Button>
            {!isSet && (
              <span className="text-xs text-muted-foreground">Using default colors</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}