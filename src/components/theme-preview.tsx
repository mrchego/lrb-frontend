"use client";

import type { CSSProperties } from "react";
import { previewVars, type Mode, type ThemeResult } from "@/lib/theme-engine";

/**
 * A small, self-contained mock of the app drawn with ONE mode's colors.
 * The CSS variables are set on the wrapper, so it shows light and dark side by side
 * whatever mode the owner is currently viewing.
 */
export function ThemeFrame({
  theme,
  mode,
  compact = false,
}: {
  theme: ThemeResult;
  mode: Mode;
  compact?: boolean;
}) {
  const style = previewVars(mode, theme) as CSSProperties;

  if (compact) {
    return (
      <div
        aria-hidden
        style={style}
        className="flex h-16 overflow-hidden rounded-lg border bg-background text-foreground"
      >
        <div className="w-1/4 space-y-1 border-r border-sidebar-border bg-sidebar p-1.5">
          <div className="h-2 rounded-sm bg-sidebar-primary" />
          <div className="h-2 rounded-sm bg-sidebar-accent" />
        </div>
        <div className="flex-1 space-y-1.5 p-2">
          <div className="h-1.5 w-2/3 rounded-sm bg-foreground" />
          <div className="h-1.5 w-1/2 rounded-sm bg-muted-foreground" />
          <div className="h-3.5 w-1/3 rounded-md bg-primary" />
        </div>
      </div>
    );
  }

  return (
    <div
      aria-hidden
      style={style}
      className="flex overflow-hidden rounded-lg border bg-background text-foreground"
    >
      <aside className="w-28 shrink-0 space-y-1 border-r border-sidebar-border bg-sidebar p-2 text-sidebar-foreground">
        <div className="rounded-md bg-sidebar-primary px-2 py-1 text-xs text-sidebar-primary-foreground">
          Dashboard
        </div>
        <div className="rounded-md bg-sidebar-accent px-2 py-1 text-xs text-sidebar-accent-foreground">
          Customers
        </div>
        <div className="px-2 py-1 text-xs">Reports</div>
      </aside>

      <div className="min-w-0 flex-1 space-y-2 p-3">
        <p className="text-sm font-semibold">Overview</p>
        <p className="text-xs text-muted-foreground">Secondary text looks like this.</p>

        <div className="space-y-2 rounded-lg border bg-card p-2.5 text-card-foreground">
          <p className="text-xs font-medium">Monthly sales</p>
          <div className="flex gap-2">
            <span className="rounded-md bg-primary px-2.5 py-1 text-xs text-primary-foreground">
              Save
            </span>
            <span className="rounded-md border bg-muted px-2.5 py-1 text-xs text-foreground">
              Cancel
            </span>
          </div>
          <div className="flex h-8 items-end gap-1">
            {[55, 85, 40, 100, 70].map((h, i) => (
              <span
                key={i}
                className="w-3 rounded-sm"
                style={{ height: `${h}%`, backgroundColor: `var(--chart-${i + 1})` }}
              />
            ))}
          </div>
        </div>

        <div className="rounded-md border border-input px-2 py-1 text-xs text-muted-foreground">
          Search…
        </div>
      </div>
    </div>
  );
}