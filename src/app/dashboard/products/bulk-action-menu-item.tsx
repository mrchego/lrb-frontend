"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { LucideIcon } from "lucide-react";
import { BulkProductAction, useBulkProductAction } from "./use-bulk-product-action";

export function BulkProductActionMenuItem({
  action,
  productIds,
  icon: Icon,
  label,
  confirmMessage,
  onDone,
  destructive,
}: {
  action: BulkProductAction;
  productIds: string[];
  icon: LucideIcon;
  label: string;
  confirmMessage: string;
  onDone: () => void;
  destructive?: boolean;
}) {
  const { run, submitting } = useBulkProductAction(onDone);

  return (
    <DropdownMenuItem
      disabled={submitting || productIds.length === 0}
      onClick={() => run({ action, productIds, confirmMessage, destructive })}
      className={destructive ? "text-red-600 focus:text-red-600" : undefined}
    >
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </DropdownMenuItem>
  );
}