"use client";

import { PackageCheck, PackageX, Trash2, ChevronDown } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BulkProductActionButton } from "./bulk-action-button";
import { BulkProductActionMenuItem } from "./bulk-action-menu-item";

export function ProductBulkActionsBar({
  selectedIds,
  onDone,
}: {
  selectedIds: string[];
  onDone: () => void;
}) {
  const { hasPermission } = useAuth();
  const canChange = hasPermission("products.change_product");
  const canDelete = hasPermission("products.delete_product");

  if (selectedIds.length === 0 || (!canChange && !canDelete)) return null;

  const count = selectedIds.length;
  const plural = count === 1 ? "product" : "products";

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/40">
      <span className="text-sm text-muted-foreground mr-2 shrink-0">
        {count} {plural} selected
      </span>

      {/* Below sm: one dropdown holds everything */}
      <div className="ml-auto sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button size="sm" variant="secondary" />}>
            <>
              Actions <ChevronDown className="h-4 w-4 ml-1.5" />
            </>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canChange && (
              <>
                <BulkProductActionMenuItem
                  action="activate"
                  productIds={selectedIds}
                  icon={PackageCheck}
                  label="Activate"
                  confirmMessage={`Activate ${count} ${plural}?`}
                  onDone={onDone}
                />
                <BulkProductActionMenuItem
                  action="deactivate"
                  productIds={selectedIds}
                  icon={PackageX}
                  label="Deactivate"
                  confirmMessage={`Deactivate ${count} ${plural}? They will stop showing as available immediately.`}
                  onDone={onDone}
                />
              </>
            )}
            {canDelete && (
              <>
                {canChange && <DropdownMenuSeparator />}
                <BulkProductActionMenuItem
                  action="delete"
                  productIds={selectedIds}
                  icon={Trash2}
                  label="Delete"
                  destructive
                  confirmMessage={`Permanently delete ${count} ${plural}? This cannot be undone and may remove related order history.`}
                  onDone={onDone}
                />
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* sm and up: full row */}
      <div className="ml-auto hidden sm:flex gap-2">
        {canChange && (
          <>
            <BulkProductActionButton
              action="activate"
              productIds={selectedIds}
              icon={PackageCheck}
              label="Activate"
              confirmMessage={`Activate ${count} ${plural}?`}
              onDone={onDone}
            />
            <BulkProductActionButton
              action="deactivate"
              productIds={selectedIds}
              icon={PackageX}
              label="Deactivate"
              confirmMessage={`Deactivate ${count} ${plural}? They will stop showing as available immediately.`}
              onDone={onDone}
            />
          </>
        )}
        {canDelete && (
          <BulkProductActionButton
            action="delete"
            productIds={selectedIds}
            icon={Trash2}
            label="Delete"
            destructive
            confirmMessage={`Permanently delete ${count} ${plural}? This cannot be undone and may remove related order history.`}
            onDone={onDone}
          />
        )}
      </div>
    </div>
  );
}