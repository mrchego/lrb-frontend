"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet } from "@/components/ui/sheet";
import { useAuth } from "@/components/auth-provider";
import { ManagedProduct } from "./type";
import { Edit, MoreHorizontal, PackageCheck, PackageX, Trash2 } from "lucide-react";
import { EditProductSheet } from "./edit-product-sheet";
import { ProductActionButton } from "./product-action-button";

export function ProductRowActions({
  target,
  mutateProducts,
}: {
  target: ManagedProduct;
  mutateProducts: () => void;
}) {
  const { hasPermission } = useAuth();
  const [editOpen, setEditOpen] = useState(false);

  const canChange = hasPermission("products.change_product");
  const canDelete = hasPermission("products.delete_product");

  if (!canChange && !canDelete) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
          <>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <div className="px-2 py-1.5 text-sm font-semibold">Actions</div>
          <DropdownMenuSeparator />

          {canChange && (
            <>
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <ProductActionButton
                productId={target.id}
                action={target.isActive ? "deactivate" : "activate"}
                icon={target.isActive ? PackageX : PackageCheck}
                label={target.isActive ? "Deactivate" : "Activate"}
                confirmMessage={
                  target.isActive
                    ? `Deactivate ${target.name}? It will stop showing as available immediately.`
                    : `Reactivate ${target.name}?`
                }
                onDone={mutateProducts}
              />
            </>
          )}

          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <ProductActionButton
                productId={target.id}
                action="delete"
                icon={Trash2}
                label="Delete"
                destructive
                confirmMessage={`Permanently delete ${target.name}? This cannot be undone and may remove related order history.`}
                onDone={mutateProducts}
              />
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {canChange && (
        <Sheet open={editOpen} onOpenChange={setEditOpen}>
          <EditProductSheet
            product={target}
            onSaved={() => {
              mutateProducts();
              setEditOpen(false);
            }}
          />
        </Sheet>
      )}
    </>
  );
}