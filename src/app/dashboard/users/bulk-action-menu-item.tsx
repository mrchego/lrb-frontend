"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { LucideIcon } from "lucide-react";
import { BulkAction, useBulkUserAction } from "./use-bulk-user-action";

export function BulkActionMenuItem({
  action,
  userIds,
  icon: Icon,
  label,
  confirmMessage,
  onDone,
  destructive,
  lockDurationMinutes = 15,
}: {
  action: BulkAction;
  userIds: string[];
  icon: LucideIcon;
  label: string;
  confirmMessage: string;
  onDone: () => void;
  destructive?: boolean;
  lockDurationMinutes?: number;
}) {
  const { run, submitting } = useBulkUserAction(onDone);

  return (
    <DropdownMenuItem
      disabled={submitting || userIds.length === 0}
      onClick={() =>
        run({
          action,
          userIds,
          confirmMessage,
          destructive,
          lockDurationMinutes,
        })
      }
      className={destructive ? "text-red-600 focus:text-red-600" : undefined}
    >
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </DropdownMenuItem>
  );
}
