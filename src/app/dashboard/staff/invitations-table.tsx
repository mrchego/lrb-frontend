"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Ban } from "lucide-react";
import { gqlFetch, GraphQLError } from "@/lib/graphql-client";
import { BULK_REVOKE_INVITATIONS_MUTATION } from "./mutation";

import type { Invitation, BulkInvitationActionResult } from "./type";
import { InvitationRowActions } from "./invitation-row-actions";
import { notifyBulkResult } from "../users/bulk-result-summary";
import { useConfirm } from "@/components/confirm-provider";
import { toast } from "react-toastify";
import { Loading } from "@/components/loading";

function statusBadge(inv: Invitation) {
  if (inv.used) {
    return (
      <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
        Accepted
      </Badge>
    );
  }
  if (inv.isExpired) {
    return (
      <Badge className="bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
        Expired
      </Badge>
    );
  }
  return (
    <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
      Pending
    </Badge>
  );
}

export function InvitationsTable({
  invitations,
  isLoading,
  onRefresh,
}: {
  invitations: Invitation[];
  isLoading: boolean;
  onRefresh: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  useEffect(() => setSelected(new Set()), [invitations]);

  const revocable = invitations.filter((i) => !i.used);
  const allRevocableSelected =
    revocable.length > 0 && revocable.every((i) => selected.has(i.id));

  const toggleAll = () => {
    if (allRevocableSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(revocable.map((i) => i.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const confirm = useConfirm();

  const handleBulkRevoke = async () => {
    if (selected.size === 0 || bulkSubmitting) return;
    const count = selected.size;
    const ok = await confirm({
      description: `Revoke ${count} invitation${count === 1 ? "" : "s"}?`,
      confirmLabel: "Revoke",
      destructive: true,
    });
    if (!ok) return;
    setBulkSubmitting(true);
    try {
      const data = await gqlFetch<{
        bulkRevokeInvitations: BulkInvitationActionResult;
      }>(BULK_REVOKE_INVITATIONS_MUTATION, {
        invitationIds: Array.from(selected),
      });
      notifyBulkResult(data.bulkRevokeInvitations, "Revoke", "invitation");
      onRefresh();
    } catch (err) {
      toast.error(
        err instanceof GraphQLError ? err.message : "Something went wrong.",
      );
    } finally {
      setBulkSubmitting(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-md border">
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b bg-muted/40">
          <span className="text-sm text-muted-foreground mr-2">
            {selected.size} selected
          </span>
          <Button
            size="sm"
            variant="destructive"
            disabled={bulkSubmitting}
            onClick={handleBulkRevoke}
          >
            <Ban className="h-4 w-4 mr-1.5" />
            Revoke selected
          </Button>
        </div>
      )}

      {/* horizontal scroll is the safety net; column hiding below is the
          primary fix so a phone doesn't need to scroll at all in the common case */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/20">
            <tr>
              <th className="w-10 p-3">
                <Checkbox
                  checked={allRevocableSelected}
                  onCheckedChange={toggleAll}
                  disabled={revocable.length === 0}
                />
              </th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="hidden sm:table-cell text-left p-3 font-medium">
                Role
              </th>
              <th className="hidden md:table-cell text-left p-3 font-medium">
                Invited by
              </th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="hidden sm:table-cell text-left p-3 font-medium">
                Expires
              </th>
              <th className="w-10 p-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="h-24">
                  <Loading variant="inline" size="sm" />
                </td>
              </tr>
            ) : invitations.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-6 text-center text-muted-foreground"
                >
                  No invitations found.
                </td>
              </tr>
            ) : (
              invitations.map((inv) => (
                <tr key={inv.id} className="border-b last:border-0">
                  <td className="p-3">
                    {!inv.used && (
                      <Checkbox
                        checked={selected.has(inv.id)}
                        onCheckedChange={() => toggleOne(inv.id)}
                      />
                    )}
                  </td>
                  <td className="p-3">
                    <div>{inv.email}</div>
                    {/* Role/Expires collapse into the Email cell below sm so
                        nothing disappears — it just moves */}
                    <div className="sm:hidden text-xs text-muted-foreground mt-0.5 space-x-2">
                      {inv.roleName && <span>{inv.roleName}</span>}
                      <span>
                        · expires {new Date(inv.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell p-3">
                    {inv.roleName || "—"}
                  </td>
                  <td className="hidden md:table-cell p-3">
                    {inv.invitedByEmail || "—"}
                  </td>
                  <td className="p-3">{statusBadge(inv)}</td>
                  <td className="hidden sm:table-cell p-3 text-muted-foreground">
                    {new Date(inv.expiresAt).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <InvitationRowActions invitation={inv} onDone={onRefresh} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
