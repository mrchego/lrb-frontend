// lib/use-company-time.ts
"use client";

import { useMemo } from "react";
import { useCompany } from "@/components/company-provider";
import { useClock } from "@/components/clock-provider";
import {
  formatDate,
  formatDateTime,
  formatShortDate,
  formatTime,
  type TimeInput,
} from "@/lib/time";

/** The one hook every screen uses to show dates and times. */
export function useCompanyTime() {
  const { settings } = useCompany();
  const { now, source, online } = useClock();
  const timeZone = settings?.timezone || "UTC";
  const dateFormat = settings?.dateFormat || "YYYY-MM-DD";

  return useMemo(() => {
    const o = { timeZone, dateFormat };
    return {
      timeZone,
      dateFormat,
      source,
      online,
      now,
      formatDate: (v: TimeInput) => formatDate(v, o),
      formatTime: (v: TimeInput, withSeconds = false) => formatTime(v, o, withSeconds),
      formatDateTime: (v: TimeInput) => formatDateTime(v, o),
      formatShortDate: (v: TimeInput) => formatShortDate(v, o),
    };
  }, [timeZone, dateFormat, now, source, online]);
}
