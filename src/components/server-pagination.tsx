"use client";

import { type PaginationState } from "@tanstack/react-table";
import {
  DataTablePagination,
  type PaginatedTable,
} from "@/components/data-table-pagination";

/**
 * Footer for lists that are paged by the SERVER (GraphQL limit/offset) but are
 * not tanstack tables (plain <table>, card lists). It builds the small object
 * DataTablePagination expects, so the look matches the users table exactly.
 */
export function ServerPagination({
  pagination,
  totalCount,
  onPaginationChange,
  summary,
  pageSizeOptions = [10, 20, 50],
}: {
  pagination: PaginationState;
  totalCount: number;
  onPaginationChange: (p: PaginationState) => void;
  summary?: React.ReactNode;
  pageSizeOptions?: number[];
}) {
  const { pageIndex, pageSize } = pagination;
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const lastIndex = pageCount - 1;
  const go = (i: number) => onPaginationChange({ pageSize, pageIndex: i });

  const table: PaginatedTable = {
    state: { pagination },
    getPageCount: () => pageCount,
    getCanPreviousPage: () => pageIndex > 0,
    getCanNextPage: () => pageIndex < lastIndex,
    getCanLastPage: () => pageIndex < lastIndex,
    firstPage: () => go(0),
    previousPage: () => go(Math.max(0, pageIndex - 1)),
    nextPage: () => go(Math.min(lastIndex, pageIndex + 1)),
    lastPage: () => go(lastIndex),
    setPageSize: (size) => onPaginationChange({ pageIndex: 0, pageSize: size }),
  };

  return (
    <DataTablePagination
      table={table}
      pageSizeOptions={pageSizeOptions}
      summary={summary ?? `${totalCount} total`}
    />
  );
}