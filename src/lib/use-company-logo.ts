// lib/use-company-logo.ts
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useCompany } from "@/components/company-provider";

export function useCompanyLogo() {
  const { company } = useCompany();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const activeLogo =
    mounted && resolvedTheme === "dark"
      ? (company?.logoDark ?? company?.logoLight)
      : (company?.logoLight ?? company?.logoDark);

  return { company, activeLogo, mounted };
}