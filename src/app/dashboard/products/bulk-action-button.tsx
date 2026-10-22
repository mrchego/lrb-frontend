"use client";

import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import { BulkProductAction, useBulkProductAction } from "./use-bulk-product-action";

export function BulkProductActionButton({
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
    <Button
      size="sm"
      variant={destructive ? "destructive" : "secondary"}
      disabled={submitting || productIds.length === 0}
      onClick={() => run(action, productIds, confirmMessage)}
      className="shrink-0"
    >
      <Icon className="h-4 w-4 mr-1.5" />
      {label}
    </Button>
  );
}