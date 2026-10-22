"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ManagedProduct } from "./type";
import { type ColumnDef } from "@tanstack/react-table"; // CHANGED: type-only import
import { ArrowUpDown } from "lucide-react";
import { ProductRowActions } from "./product-row-actions";
import { type DataTableFeatures } from "./data-table-features"; // NEW

// NEW: v9 ColumnDef takes the features type first, then the row type
type ProductColumn = ColumnDef<DataTableFeatures, ManagedProduct>;

export function getProductColumns(
  mutateProducts: () => void,
  canSelect: boolean,
): ProductColumn[] { // CHANGED
  const columns: ProductColumn[] = []; // CHANGED

  if (canSelect) {
    columns.push({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    });
  }

  columns.push(
    {
      accessorKey: "name",
      header: ({ column }) => (
        <div
          className="flex items-center cursor-pointer text-sm select-none"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name <ArrowUpDown className="ml-2 h-4 w-4 opacity-70" />
        </div>
      ),
      cell: ({ row }) => (
        <div>
          <div>{row.original.name}</div>
          {/* SKU folds in here below sm instead of disappearing */}
          <div className="sm:hidden text-xs text-muted-foreground mt-0.5">
            {row.original.sku}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "sku",
      header: "SKU",
      meta: { className: "hidden sm:table-cell" },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => `$${Number(row.original.price).toFixed(2)}`,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          className={
            row.original.isActive
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
          }
        >
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <ProductRowActions target={row.original} mutateProducts={mutateProducts} />
        </div>
      ),
      enableHiding: false,
    },
  );

  return columns;
}