"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Send, Ban } from "lucide-react";
import { gqlFetch, GraphQLError } from "@/lib/graphql-client";
import { RESEND_INVITATION_MUTATION, REVOKE_INVITATION_MUTATION } from "./mutation";
import type { Invitation } from "./type";
import { useConfirm } from "@/components/confirm-provider";
import { toast } from "react-toastify";

export function InvitationRowActions({
  invitation,
  onDone,
}: {
  invitation: Invitation;
  onDone: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const confirm = useConfirm();

  const handleResend = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const data = await gqlFetch<{
        resendInvitation: { success: boolean; errors: any[] };
      }>(RESEND_INVITATION_MUTATION, { invitationId: invitation.id });
      if (data.resendInvitation.success) {
        toast.success(`Invitation resent to ${invitation.email}.`);
        onDone();
      } else {
        toast.error(data.resendInvitation.errors?.[0]?.message ?? "Could not resend invitation.");
      }
    } catch (err) {
      toast.error(err instanceof GraphQLError ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async () => {
    if (submitting) return;
    const ok = await confirm({
    description: `Revoke the invitation sent to ${invitation.email}?`,
    confirmLabel: "Revoke",
    destructive: true,
  });
  if (!ok) return;
    setSubmitting(true);
    try {
      const data = await gqlFetch<{
        revokeInvitation: { success: boolean; errors: any[] };
      }>(REVOKE_INVITATION_MUTATION, { invitationId: invitation.id });
      if (data.revokeInvitation.success) {
        toast.success("Invitation revoked.");
        onDone();
      } else {
        toast.error(data.revokeInvitation.errors?.[0]?.message ?? "Could not revoke invitation.");
      }
    } catch (err) {
      toast.error(err instanceof GraphQLError ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (invitation.used) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
        <>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled={submitting} onClick={handleResend}>
          <Send className="mr-2 h-4 w-4" />
          Resend invitation
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={submitting}
          onClick={handleRevoke}
          className="text-red-600 focus:text-red-600"
        >
          <Ban className="mr-2 h-4 w-4" />
          Revoke
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}