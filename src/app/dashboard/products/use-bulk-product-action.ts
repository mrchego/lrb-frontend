// app/dashboard/products/use-bulk-product-action.ts
"use client";

import { useState } from "react";
import { gqlFetch, GraphQLError } from "@/lib/graphql-client";
import { BulkProductActionResult } from "./type";
import { summarizeBulkProductResult } from "./bulk-result-summary";
import {
  BULK_ACTIVATE_PRODUCTS_MUTATION,
  BULK_DEACTIVATE_PRODUCTS_MUTATION,
  BULK_DELETE_PRODUCTS_MUTATION,
} from "./mutation";

export type BulkProductAction = "activate" | "deactivate" | "delete";

export const BULK_PRODUCT_ACTION_MAP: Record<
  BulkProductAction,
  {
    query: string;
    field: string;
    verb: string;
  }
> = {
  activate: {
    query: BULK_ACTIVATE_PRODUCTS_MUTATION,
    field: "bulkActivateProducts",
    verb: "Activate",
  },
  deactivate: {
    query: BULK_DEACTIVATE_PRODUCTS_MUTATION,
    field: "bulkDeactivateProducts",
    verb: "Deactivate",
  },
  delete: {
    query: BULK_DELETE_PRODUCTS_MUTATION,
    field: "bulkDeleteProducts",
    verb: "Delete",
  },
};

export function useBulkProductAction(onDone: () => void) {
  const [submitting, setSubmitting] = useState(false);

  const run = async (action: BulkProductAction, productIds: string[], confirmMessage: string) => {
    if (submitting || productIds.length === 0) return;
    if (!window.confirm(confirmMessage)) return;

    setSubmitting(true);
    try {
      const { query, field, verb } = BULK_PRODUCT_ACTION_MAP[action];
      const data = await gqlFetch<Record<string, BulkProductActionResult>>(query, { productIds });
      alert(summarizeBulkProductResult(data[field], verb));
      onDone();
    } catch (err) {
      alert(err instanceof GraphQLError ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return { run, submitting };
}