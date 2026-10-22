"use client";

import useSWR from "swr";
import { useState } from "react";
import type { PaginationState } from "@tanstack/react-table";
import { useAuth } from "@/components/auth-provider";
import { RequireAuth } from "@/components/require-auth";
import { gqlFetch } from "@/lib/graphql-client";
import { PRODUCTS_QUERY } from "./query";
import type { ProductConnection } from "./type";
import { getProductColumns } from "./columns";
import { ProductDataTable } from "./data-table";

export default function ProductsPage() {
  return (
    <RequireAuth>
      <ProductsPageContent />
    </RequireAuth>
  );
}

function ProductsPageContent() {
  const { hasPermission } = useAuth();
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const isActive = statusFilter === "all" ? undefined : statusFilter === "active";

  const canView = hasPermission("products.view_product");
  const canSelect = hasPermission("products.change_product") || hasPermission("products.delete_product");

  const { data, error, isLoading, mutate } = useSWR<{ products: ProductConnection }>(
    canView ? ["products", isActive, search, pagination.pageIndex, pagination.pageSize] : null,
    () =>
      gqlFetch<{ products: ProductConnection }>(PRODUCTS_QUERY, {
        isActive,
        search: search || undefined,
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
      }),
    { revalidateOnFocus: false, keepPreviousData: true },
  );

  if (!canView) {
    return (
      <div className="p-8 text-sm text-muted-foreground">
        You don't have permission to view products.
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-sm text-red-600">
        Failed to load products. {error instanceof Error ? error.message : ""}
      </div>
    );
  }

  const columns = getProductColumns(() => mutate(), canSelect);

  return (
    <div>
      <div className="mb-6">
  <h1 className="text-xl font-semibold">Products</h1>
  <p className="text-sm text-muted-foreground">
    Manage your company's product catalog. Actions are limited to your assigned permissions.
  </p>
</div>
      <ProductDataTable
        columns={columns}
        data={data?.products.items ?? []}
        totalCount={data?.products.totalCount ?? 0}
        isLoading={isLoading}
        statusFilter={statusFilter}
        onStatusFilterChange={(v) => {
          setStatusFilter(v);
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
        pagination={pagination}
        onPaginationChange={setPagination}
        onChanged={() => mutate()}
      />
    </div>
  );
}