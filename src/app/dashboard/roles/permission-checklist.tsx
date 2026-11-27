"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Permission } from "./type";

/**
 * One tab per app (Permission.category). Adding a new app's permissions to the
 * registry adds a tab automatically. When the tabs don't fit, left/right
 * arrows appear to scroll the tab strip.
 */
export function PermissionChecklist({
  permissions,
  selected,
  onToggle,
  onSetMany,
  disabled,
}: {
  permissions: Permission[];
  selected: Set<string>;
  onToggle: (codename: string) => void;
  /** Tick/untick several at once (powers "Select all" per app). */
  onSetMany?: (codenames: string[], checked: boolean) => void;
  disabled?: boolean;
}) {
  const groups = useMemo(() => {
    const map = new Map<string, Permission[]>();
    for (const p of permissions) {
      const app = p.category || "General";
      const list = map.get(app);
      if (list) list.push(p);
      else map.set(app, [p]);
    }
    return Array.from(map, ([app, perms]) => ({ app, perms }));
  }, [permissions]);

  const [active, setActive] = useState<string | null>(null);
  const current = groups.find((g) => g.app === active) ?? groups[0];

  const stripRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = stripRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = stripRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => ro.disconnect();
  }, [groups, updateArrows]);

  const scrollStrip = (dir: -1 | 1) =>
    stripRef.current?.scrollBy({ left: dir * 200, behavior: "smooth" });

  if (!current) {
    return <p className="text-sm text-muted-foreground">No permissions available.</p>;
  }

  const currentCodenames = current.perms.map((p) => p.codename);
  const pickedHere = currentCodenames.filter((c) => selected.has(c)).length;
  const allHere = pickedHere === currentCodenames.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 border-b">
        {(canLeft || canRight) && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            onClick={() => scrollStrip(-1)}
            disabled={!canLeft}
          >
            <span className="sr-only">Previous apps</span>
            <ChevronLeft />
          </Button>
        )}

        <div
          ref={stripRef}
          onScroll={updateArrows}
          role="tablist"
          className="flex flex-1 gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {groups.map(({ app, perms }) => {
            const n = perms.filter((p) => selected.has(p.codename)).length;
            const isActive = app === current.app;
            return (
              <button
                key={app}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={(e) => {
                  setActive(app);
                  e.currentTarget.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                    inline: "nearest",
                  });
                }}
                className={cn(
                  "-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {app}
                {n > 0 && (
                  <span className="rounded-full bg-primary/10 px-1.5 text-xs text-primary">
                    {n}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {(canLeft || canRight) && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            onClick={() => scrollStrip(1)}
            disabled={!canRight}
          >
            <span className="sr-only">More apps</span>
            <ChevronRight />
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {pickedHere} of {currentCodenames.length} selected in {current.app}
        </p>
        {onSetMany && (
          <label className="flex cursor-pointer items-center gap-2 text-xs font-medium">
            <Checkbox
              checked={allHere}
              onCheckedChange={(v) => onSetMany(currentCodenames, !!v)}
              disabled={disabled}
            />
            Select all
          </label>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {current.perms.map((p) => (
          <label
            key={p.codename}
            className="flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 text-sm hover:bg-muted/40"
          >
            <Checkbox
              checked={selected.has(p.codename)}
              onCheckedChange={() => onToggle(p.codename)}
              disabled={disabled}
            />
            {p.label}
          </label>
        ))}
      </div>
    </div>
  );
}