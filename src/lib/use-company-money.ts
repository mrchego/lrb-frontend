"use client";

import { useMemo } from "react";
import { useCompany } from "@/components/company-provider";
import { formatMoney, moneyStep, type MoneyInput } from "@/lib/money";

export function useCompanyMoney() {
  const { settings, currency: info } = useCompany();
  const code = info?.code ?? settings?.currency ?? ""; // "" = not loaded yet
  const decimals = info?.decimals;
  const locale = settings?.language || "en";

  return useMemo(
    () => ({
      currency: code,
      decimals,
      step: moneyStep(decimals ?? 2),
      formatMoney: (v: MoneyInput) => {
        if (!code) {
          const n = Number(v);
          return v === null || v === undefined || v === "" || !Number.isFinite(n)
            ? "—"
            : n.toLocaleString(locale);
        }
        return formatMoney(v, { currency: code, decimals, locale });
      },
    }),
    [code, decimals, locale],
  );
}