"use client";

import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import type { Permission } from "./type";

// Shared by the invite dialog, the edit-access dialog and (optionally) RoleFormDialog.
export function PermissionChecklist({
  permissions,
  selected,
  onToggle,
  disabled,
}: {
  permissions: Permission[];
  selected: Set<string>;
  onToggle: (codename: string) => void;
  disabled?: boolean;
}) {
  const grouped = useMemo(
    () =>
      permissions.reduce<Record<string, Permission[]>>((acc, p) => {
        (acc[p.category || "General"] ??= []).push(p);
        return acc;
      }, {}),
    [permissions],
  );

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([category, perms]) => (
        <div key={category}>
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
            {category}
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {perms.map((p) => (
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
      ))}
    </div>
  );
}
