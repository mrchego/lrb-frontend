"use client";

import {
  UserCheck,
  UserX,
  Lock,
  Unlock,
  KeyRound,
  Trash2,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BulkActionButton } from "./bulk-action-button";
import { BulkActionMenuItem } from "./bulk-action-menu-item";
import type { BulkAction } from "./use-bulk-user-action";

const ACTIONS: {
  action: BulkAction;
  icon: typeof UserCheck;
  label: string;
  destructive?: boolean;
  message: (count: number, plural: string) => string;
  separatorBefore?: boolean;
}[] = [
  {
    action: "activate",
    icon: UserCheck,
    label: "Activate",
    message: (c, p) => `Activate ${c} ${p}?`,
  },
  {
    action: "deactivate",
    icon: UserX,
    label: "Deactivate",
    message: (c, p) =>
      `Deactivate ${c} ${p}? They will lose access immediately.`,
  },
  {
    action: "lock",
    icon: Lock,
    label: "Lock (15 min)",
    message: (c, p) => `Lock ${c} ${p} out for 15 minutes?`,
  },
  {
    action: "unlock",
    icon: Unlock,
    label: "Unlock",
    message: (c, p) => `Unlock ${c} ${p}?`,
  },
  {
    action: "forcePasswordReset",
    icon: KeyRound,
    label: "Force password reset",
    message: (c, p) =>
      `Require ${c} ${p} to reset their password on next login?`,
  },
  {
    action: "delete",
    icon: Trash2,
    label: "Delete",
    destructive: true,
    separatorBefore: true,
    message: (c, p) =>
      `Delete ${c} ${p}? This disables their accounts and login access. Owner accounts and your own account will be skipped automatically.`,
  },
  {
    action: "restore",
    icon: RotateCcw,
    label: "Restore",
    message: (c, p) =>
      `Restore ${c} ${p}? This re-enables their account and login access.`,
  },
];

export function BulkActionsBar({
  selectedIds,
  onDone,
}: {
  selectedIds: string[];
  onDone: () => void;
}) {
  if (selectedIds.length === 0) return null;

  const count = selectedIds.length;
  const plural = count === 1 ? "user" : "users";

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/40">
      <span className="text-sm text-muted-foreground shrink-0">
        {count} {plural} selected
      </span>

      {/* Below sm: every action lives in one dropdown so the bar never overflows */}
      <div className="ml-auto sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button size="sm" variant="secondary" />}
          >
            <>
              Actions <ChevronDown className="h-4 w-4 ml-1.5" />
            </>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {ACTIONS.map((a) => (
              <span key={a.action}>
                {a.separatorBefore && <DropdownMenuSeparator />}
                <BulkActionMenuItem
                  action={a.action}
                  userIds={selectedIds}
                  icon={a.icon}
                  label={a.label}
                  destructive={a.destructive}
                  confirmMessage={a.message(count, plural)}
                  onDone={onDone}
                />
              </span>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* sm and up: full row, horizontally scrollable as a safety net rather
          than wrapping (wrapping would push the table down unpredictably) */}
      <div className="ml-auto hidden sm:flex gap-2 overflow-x-auto pb-0.5">
        {ACTIONS.map((a) => (
          <BulkActionButton
            key={a.action}
            action={a.action}
            userIds={selectedIds}
            icon={a.icon}
            label={a.label}
            destructive={a.destructive}
            confirmMessage={a.message(count, plural)}
            onDone={onDone}
          />
        ))}
      </div>
    </div>
  );
}
