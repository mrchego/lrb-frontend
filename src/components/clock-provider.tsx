// components/clock-provider.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { gqlFetch } from "@/lib/graphql-client";

const SERVER_TIME_QUERY = `query ServerTime { serverTime { epochMs } }`;
const RESYNC_MS = 5 * 60 * 1000;

type ClockContextValue = {
  /** Best available "now": server-corrected, ticking on a monotonic clock. */
  now: () => Date;
  /** "server" once we have synced at least once, otherwise the device clock. */
  source: "server" | "device";
  online: boolean;
  lastSyncedAt: Date | null;
  resync: () => Promise<void>;
};

const ClockContext = createContext<ClockContextValue | null>(null);

export function ClockProvider({ children }: { children: ReactNode }) {
  // serverMs = server epoch at the moment perfMs was read.
  const anchor = useRef<{ serverMs: number; perfMs: number } | null>(null);
  const [source, setSource] = useState<"server" | "device">("device");
  const [online, setOnline] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // performance.now() is monotonic: if someone changes the PC clock mid-session,
  // or the clock drifts, our time doesn't jump. Date.now() would.
  const now = useCallback(
    () =>
      new Date(
        anchor.current
          ? anchor.current.serverMs + (performance.now() - anchor.current.perfMs)
          : Date.now(),
      ),
    [],
  );

  const resync = useCallback(async () => {
    const t0 = performance.now();
    try {
      const { serverTime } = await gqlFetch<{ serverTime: { epochMs: number } }>(
        SERVER_TIME_QUERY,
      );
      const t1 = performance.now();
      // The server stamped the time about halfway through the round trip.
      anchor.current = { serverMs: serverTime.epochMs + (t1 - t0) / 2, perfMs: t1 };
      setSource("server");
      setOnline(true);
      setLastSyncedAt(new Date(anchor.current.serverMs));
    } catch {
      // Keep ticking from the last good anchor; just report we're not connected.
      setOnline(false);
    }
  }, []);

  useEffect(() => {
    void resync();
    const interval = window.setInterval(() => void resync(), RESYNC_MS);
    const onOnline = () => void resync();
    const onOffline = () => setOnline(false);
    const onVisible = () => {
      if (document.visibilityState === "visible") void resync();
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [resync]);

  const value = useMemo(
    () => ({ now, source, online, lastSyncedAt, resync }),
    [now, source, online, lastSyncedAt, resync],
  );
  return <ClockContext.Provider value={value}>{children}</ClockContext.Provider>;
}

export function useClock() {
  const ctx = useContext(ClockContext);
  if (!ctx) throw new Error("useClock must be used within ClockProvider");
  return ctx;
}

/** Re-renders the calling component every `ms`. Keeps the 1s tick out of the provider. */
export function useTicker(ms = 1000) {
  const [, setN] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setN((n) => n + 1), ms);
    return () => window.clearInterval(id);
  }, [ms]);
}

/** Server-corrected "now", as React state so the UI is forced to update every `ms`. */
export function useNow(ms = 1000): Date {
  const { now } = useClock();
  const [current, setCurrent] = useState<Date>(() => now());
  useEffect(() => {
    setCurrent(now());
    const id = window.setInterval(() => setCurrent(now()), ms);
    return () => window.clearInterval(id);
  }, [now, ms]);
  return current;
}
