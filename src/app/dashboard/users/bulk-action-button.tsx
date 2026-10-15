"use client";

import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import { BulkAction, useBulkUserAction } from "./use-bulk-user-action";

export function BulkActionButton({
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
    <Button
      size="sm"
      variant={destructive ? "destructive" : "secondary"}
      disabled={submitting || userIds.length === 0}
      onClick={() => run(action, userIds, confirmMessage, lockDurationMinutes)}
      className="shrink-0"
    >
      <Icon className="h-4 w-4 mr-1.5" />
      {label}
    </Button>
  );
}
