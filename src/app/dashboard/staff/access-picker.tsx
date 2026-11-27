"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Permission } from "../roles/type";
import { PermissionChecklist } from "../roles/permission-checklist";

type RoleLite = {
  id: string;
  name: string;
  permissions: { codename: string }[];
};

export type AccessValue = { roleId: string | null; codenames: Set<string> };

// A person can be saved when they have a role OR at least one direct permission.
export const hasAccess = (v: AccessValue) => v.roleId !== null || v.codenames.size > 0;

export const EMPTY_ACCESS: AccessValue = { roleId: null, codenames: new Set() };

const NO_ROLE = "__none__"; // Select can't hold null, so a sentinel stands for "no role"

const permsOfRole = (roles: RoleLite[], roleId: string | null) =>
  new Set(
    roles.find((r) => r.id === roleId)?.permissions.map((p) => p.codename) ?? [],
  );

const sameSet = (a: Set<string>, b: Set<string>) =>
  a.size === b.size && [...a].every((x) => b.has(x));

/**
 * Role dropdown + permission checklist.
 * - Picking a role ticks exactly that role's permissions (the "old way").
 * - The founder can then tick/untick individual permissions.
 * - Whatever is ticked when they save is sent to the backend as the final set.
 */
export function AccessPicker({
  roles,
  permissions,
  value,
  onChange,
  disabled,
}: {
  roles: RoleLite[];
  permissions: Permission[];
  value: AccessValue;
  onChange: (v: AccessValue) => void;
  disabled?: boolean;
}) {
  const baseline = useMemo(
    () => permsOfRole(roles, value.roleId),
    [roles, value.roleId],
  );
  const customised = value.roleId !== null && !sameSet(baseline, value.codenames);

  // Switching to "No role" keeps what is already ticked; switching to a real
  // role replaces the ticks with that role's permissions.
  const pickRole = (roleId: string | null) =>
    onChange({
      roleId,
      codenames: roleId === null ? value.codenames : permsOfRole(roles, roleId),
    });

  const toggle = (codename: string) => {
    const next = new Set(value.codenames);
    if (next.has(codename)) next.delete(codename);
    else next.add(codename);
    onChange({ ...value, codenames: next });
  };

  const setMany = (codenames: string[], checked: boolean) => {
    const next = new Set(value.codenames);
    for (const c of codenames) {
      if (checked) next.add(c);
      else next.delete(c);
    }
    onChange({ ...value, codenames: next });
  };

  return (
    <div className="space-y-5">
      <div>
        <Label>Role</Label>
        <Select
          value={value.roleId ?? NO_ROLE}
          onValueChange={(v) => pickRole(!v || v === NO_ROLE ? null : v)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="No role — custom permissions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_ROLE}>No role — custom permissions</SelectItem>
            {roles.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="mt-1 text-xs text-muted-foreground">
          Choosing a role ticks its permissions below. Or skip the role and tick permissions directly.
        </p>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">Permissions</p>
            <p className="text-xs text-muted-foreground">
              {value.codenames.size} selected
              {customised && " · differs from the role"}
            </p>
          </div>
          {customised && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => pickRole(value.roleId)}
              disabled={disabled}
            >
              Reset to role
            </Button>
          )}
        </div>
        <PermissionChecklist
          permissions={permissions}
          selected={value.codenames}
          onToggle={toggle}
          onSetMany={setMany}
          disabled={disabled}
        />
      </div>
    </div>
  );
}