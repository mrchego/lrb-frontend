// app/dashboard/users/use-bulk-user-action.ts
"use client";

import { useState } from "react";
import { gqlFetch, GraphQLError } from "@/lib/graphql-client";
import { BulkUserActionResult } from "./type";
import { notifyBulkResult } from "./bulk-result-summary";
import {
  BULK_ACTIVATE_USERS_MUTATION,
  BULK_DEACTIVATE_USERS_MUTATION,
  BULK_DELETE_USERS_MUTATION,
  BULK_LOCK_USERS_MUTATION,
  BULK_UNLOCK_USERS_MUTATION,
  BULK_FORCE_PASSWORD_RESET_MUTATION,
  BULK_RESTORE_USERS_MUTATION,
} from "./mutation";
import { toast } from "react-toastify";
import { useConfirm } from "@/components/confirm-provider";

export type BulkAction =
  | "activate"
  | "deactivate"
  | "lock"
  | "unlock"
  | "delete"
  | "forcePasswordReset"
  | "restore";

export const BULK_ACTION_MAP: Record<
  BulkAction,
  { query: string; field: string; verb: string }
> = {
  activate: {
    query: BULK_ACTIVATE_USERS_MUTATION,
    field: "bulkActivateUsers",
    verb: "Activate",
  },
  deactivate: {
    query: BULK_DEACTIVATE_USERS_MUTATION,
    field: "bulkDeactivateUsers",
    verb: "Deactivate",
  },
  lock: {
    query: BULK_LOCK_USERS_MUTATION,
    field: "bulkLockUsers",
    verb: "Lock",
  },
  unlock: {
    query: BULK_UNLOCK_USERS_MUTATION,
    field: "bulkUnlockUsers",
    verb: "Unlock",
  },
  delete: {
    query: BULK_DELETE_USERS_MUTATION,
    field: "bulkDeleteUsers",
    verb: "Delete",
  },
  forcePasswordReset: {
    query: BULK_FORCE_PASSWORD_RESET_MUTATION,
    field: "bulkForcePasswordReset",
    verb: "Force password reset",
  },
  restore: {
    query: BULK_RESTORE_USERS_MUTATION,
    field: "bulkRestoreUsers",
    verb: "Restore",
  },
};

type RunArgs = {
  action: BulkAction;
  userIds: string[];
  confirmMessage: string;
  destructive?: boolean;
  lockDurationMinutes?: number;
};

export function useBulkUserAction(onDone: () => void) {
  const [submitting, setSubmitting] = useState(false);
  const confirm = useConfirm();

  const run = async ({
    action,
    userIds,
    confirmMessage,
    destructive = false,
    lockDurationMinutes = 15,
  }: RunArgs) => {
    if (submitting || userIds.length === 0) return;
    const { query, field, verb } = BULK_ACTION_MAP[action];

    const ok = await confirm({
      description: confirmMessage,
      confirmLabel: verb,
      destructive,
    });
    if (!ok) return;

    setSubmitting(true);
    try {
      const variables =
        action === "lock"
          ? { userIds, durationMinutes: lockDurationMinutes }
          : { userIds };
      const data = await gqlFetch<Record<string, BulkUserActionResult>>(
        query,
        variables,
      );
      notifyBulkResult(data[field], verb);
      onDone();
    } catch (err) {
      toast.error(
        err instanceof GraphQLError ? err.message : "Something went wrong.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return { run, submitting };
}
