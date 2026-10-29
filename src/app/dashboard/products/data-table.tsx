"use client";

import {
  useTable,
  type ColumnDef,
  type PaginationState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { DataTablePagination } from "@/components/data-table-pagination";
import { useAuth } from "@/components/auth-provider";
import { ManagedProduct } from "./type";
import { ProductBulkActionsBar } from "./bulk-actions-bar";
import { CreateProductSheet } from "./create-product-sheet";
import { Plus } from "lucide-react";
import { features, type DataTableFeatures } from "./data-table-features";
import { LoadingOverlay } from "@/components/loading";

interface Props {
  columns: ColumnDef<DataTableFeatures, ManagedProduct>[];
  data: ManagedProduct[];
  totalCount: number;
  isLoading?: boolean;
  statusFilter: "all" | "active" | "inactive";
  onStatusFilterChange: (v: "all" | "active" | "inactive") => void;
  search: string;
  onSearchChange: (v: string) => void;
  pagination: PaginationState;
  onPaginationChange: (p: PaginationState) => void;
  onChanged: () => void;
}

export function ProductDataTable({
  columns,
  data,
  totalCount,
  isLoading = false,
  statusFilter,
  onStatusFilterChange,
  search,
  onSearchChange,
  pagination,
  onPaginationChange,
  onChanged,
}: Props) {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission("products.add_product");
  const canBulk =
    hasPermission("products.change_product") || hasPermission("products.delete_product");

  // Only state something outside the table needs stays here.
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [createOpen, setCreateOpen] = useState(false);

  const [searchInput, setSearchInput] = useState(search);
  useEffect(() => {
    const id = setTimeout(() => onSearchChange(searchInput), 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const pageCount = Math.max(1, Math.ceil(totalCount / pagination.pageSize));

  const table = useTable({
    features,
    data,
    columns,
    getRowId: (row) => row.id,
    manualPagination: true, // GraphQL limit/offset does the paging
    pageCount,
    state: { rowSelection, pagination },
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater(pagination) : updater;
      onPaginationChange(next);
    },
  });

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id]);

  useEffect(() => {
    setRowSelection({});
  }, [data]);

  return (
    <div className="overflow-hidden rounded-md border">
      {/* stacks on mobile: search full-width, filters + New product wrap onto their own row */}
      <div className="flex flex-col gap-2 py-4 px-4 sm:flex-row sm:items-center">
        <Input
          placeholder="Search products..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full sm:max-w-sm"
          disabled={isLoading}
        />
        <div className="flex flex-wrap gap-1 items-center sm:ml-auto">
          {(["all", "active", "inactive"] as const).map((v) => (
            <Button
              key={v}
              size="sm"
              variant={statusFilter === v ? "default" : "outline"}
              onClick={() => onStatusFilterChange(v)}
            >
              {v[0].toUpperCase() + v.slice(1)}
            </Button>
          ))}
          {canCreate && (
            <Sheet open={createOpen} onOpenChange={setCreateOpen}>
              <SheetTrigger render={<Button size="sm" className="sm:ml-2" />}>
                <>
                  <Plus className="h-4 w-4 mr-1.5" />
                  New product
                </>
              </SheetTrigger>
              <CreateProductSheet
                onCreated={() => {
                  setCreateOpen(false);
                  onChanged();
                }}
              />
            </Sheet>
          )}
        </div>
      </div>

      {canBulk && (
        <ProductBulkActionsBar
          selectedIds={selectedIds}
          onDone={() => {
            setRowSelection({});
            onChanged();
          }}
        />
      )}

      <div className="relative overflow-x-auto" aria-busy={isLoading}>
  {isLoading && <LoadingOverlay />}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={header.column.columnDef.meta?.className}
                  >
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.className}
                    >
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {isLoading ? null : "No products found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        table={table}
        summary={
          canBulk
            ? `${selectedIds.length} of ${data.length} row(s) selected.`
            : undefined
        }
      />
    </div>
  );
}