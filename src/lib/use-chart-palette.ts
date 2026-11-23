"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import { useCompany } from "@/components/company-provider";
import { chartPalette } from "@/lib/theme-engine";

/**
 * The five chart colors as plain hex strings, for the current company theme and the
 * current light/dark mode. Only needed for libraries that cannot read CSS variables
 * (canvas charts, maps, exported images). Everything else should use chartColor(i).
 */
export function useChartPalette(): string[] {
  const { settings } = useCompany();
  const { resolvedTheme } = useTheme();
  const mode = resolvedTheme === "dark" ? "dark" : "light";
  const brandColor = settings?.brandColor ?? null;
  const appearanceKey = JSON.stringify(settings?.appearance ?? {});

  return useMemo(
    () => chartPalette(mode, brandColor, JSON.parse(appearanceKey)),
    [mode, brandColor, appearanceKey],
  );
}