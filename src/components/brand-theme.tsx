"use client";

import { useEffect } from "react";
import { useCompany } from "@/components/company-provider";
import { applyTheme } from "@/lib/theme-engine";

/** Mount once inside <CompanyProvider>. Renders nothing; keeps the page colors in sync. */
export function BrandTheme() {
  const { settings } = useCompany();
  const loaded = settings !== null;
  const brandColor = settings?.brandColor ?? null;
  const appearanceKey = JSON.stringify(settings?.appearance ?? {});

  useEffect(() => {
    if (!loaded) return; // don't clear the cached theme while settings are still loading
    applyTheme(brandColor, JSON.parse(appearanceKey));
  }, [loaded, brandColor, appearanceKey]);

  return null;
}