// components/company-clock.tsx
"use client";

import { useEffect, useState } from "react";
import { useNow } from "@/components/clock-provider";
import { useCompanyTime } from "@/lib/use-company-time";
import { zoneLabel } from "@/lib/time";

export function CompanyClock() {
  // 1) Every hook first, unconditionally, in the same order on every render.
  const t = useCompanyTime();
  const current = useNow(1000);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // 2) Only after all hooks may we return early.
  if (!mounted) return null; // avoids a server/client text mismatch

  const healthy = t.online && t.source === "server";
  const title = healthy
    ? `Synced with the server · ${t.timeZone}`
    : t.source === "server"
      ? `Offline: running from the last server sync · ${t.timeZone}`
      : `Not synced yet: showing this device's clock · ${t.timeZone}`;

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground" title={title}>
      <span
        aria-hidden
        className={`h-2 w-2 rounded-full ${healthy ? "bg-green-500" : "bg-amber-500"}`}
      />
      <span className="tabular-nums text-foreground">
        {t.formatDate(current)} {t.formatTime(current, true)}
      </span>
      <span className="hidden sm:inline">{zoneLabel(t.timeZone, current)}</span>
    </div>
  );
}