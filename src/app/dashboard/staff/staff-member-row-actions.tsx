"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ShieldOff } from "lucide-react";
import { gqlFetch, GraphQLError } from "@/lib/graphql-client";
import { DEMOTE_STAFF_FROM_LOGIN_MUTATION } from "./mutation";
import type { StaffMember } from "./type";

export function StaffMemberRowActions({
  target,
  currentUserId,
  onDone,
}: {
  target: StaffMember;
  currentUserId: string;
  onDone: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const isSelf = target.id === currentUserId;

  const handleDemote = async () => {
    if (submitting) return;
    if (
      !window.confirm(
        `Remove ${target.email}'s login access? Their role assignments will be cleared and any pending invitation cancelled.`,
      )
    )
      return;
    setSubmitting(true);
    try {
      const data = await gqlFetch<{
        demoteStaffFromLogin: { success: boolean; errors: any[] };
      }>(DEMOTE_STAFF_FROM_LOGIN_MUTATION, { userId: target.id });
      if (data.demoteStaffFromLogin.success) {
        onDone();
      } else {
        alert(data.demoteStaffFromLogin.errors?.[0]?.message ?? "Could not remove access.");
      }
    } catch (err) {
      alert(err instanceof GraphQLError ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
        <>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          disabled={submitting || isSelf}
          title={isSelf ? "You can't remove your own login access." : undefined}
          onClick={handleDemote}
          className="text-red-600 focus:text-red-600"
        >
          <ShieldOff className="mr-2 h-4 w-4" />
          Remove login access
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}