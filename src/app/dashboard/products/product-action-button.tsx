"use client";

import { useState } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { gqlFetch, GraphQLError } from "@/lib/graphql-client";
import {
  ACTIVATE_PRODUCT_MUTATION,
  DEACTIVATE_PRODUCT_MUTATION,
  DELETE_PRODUCT_MUTATION,
} from "./mutation";
import type { LucideIcon } from "lucide-react";

type Action = "activate" | "deactivate" | "delete";

const ACTION_MAP: Record<Action, { query: string; field: string }> = {
  activate: { query: ACTIVATE_PRODUCT_MUTATION, field: "activateProduct" },
  deactivate: { query: DEACTIVATE_PRODUCT_MUTATION, field: "deactivateProduct" },
  delete: { query: DELETE_PRODUCT_MUTATION, field: "deleteProduct" },
};

export function ProductActionButton({
  productId,
  action,
  icon: Icon,
  label,
  confirmMessage,
  onDone,
  destructive,
}: {
  productId: string;
  action: Action;
  icon: LucideIcon;
  label: string;
  confirmMessage: string;
  onDone: () => void;
  destructive?: boolean;
}) {
  const [submitting, setSubmitting] = useState(false);

  const handleClick = async () => {
    if (submitting) return;
    if (!window.confirm(confirmMessage)) return;

    setSubmitting(true);
    try {
      const { query, field } = ACTION_MAP[action];
      const data = await gqlFetch<Record<string, { success: boolean; errors?: any[] }>>(query, {
        productId,
      });
      if (data[field].success) {
        onDone();
      } else {
        alert(data[field].errors?.[0]?.message ?? "Action failed.");
      }
    } catch (err) {
      alert(err instanceof GraphQLError ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DropdownMenuItem
      onClick={handleClick}
      disabled={submitting}
      className={destructive ? "text-red-600 focus:text-red-600" : undefined}
    >
      <Icon className="h-4 w-4 mr-2" />
      {label}
    </DropdownMenuItem>
  );
}