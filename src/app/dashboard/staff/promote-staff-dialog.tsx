// components/promote-staff-dialog.tsx
"use client";
import { useState } from "react";
import { gqlFetch, GraphQLError } from "@/lib/graphql-client";
import { PROMOTE_STAFF_TO_LOGIN_MUTATION } from "./mutation";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { AccessPicker, EMPTY_ACCESS, hasAccess, type AccessValue } from "./access-picker";
import type { Permission } from "../roles/type";

type RoleLite = { id: string; name: string; permissions: { codename: string }[] };

export function PromoteStaffDialog({
  userId, roles, permissions, onDone,
}: {
  userId: string;
  roles: RoleLite[];
  permissions: Permission[];
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [access, setAccess] = useState<AccessValue>(EMPTY_ACCESS);
  const [submitting, setSubmitting] = useState(false);

  const handlePromote = async () => {
    if (!hasAccess(access) || submitting) return;
    setSubmitting(true);
    try {
      const data = await gqlFetch<{
        promoteStaffToLogin: { success: boolean; errors: any[] };
      }>(PROMOTE_STAFF_TO_LOGIN_MUTATION, {
        userId,
        roleId: access.roleId, // null = direct permissions only
        permissionCodenames: Array.from(access.codenames),
      });

      if (data.promoteStaffToLogin.success) {
        toast.success("Invitation sent.");
        setOpen(false);
        setAccess(EMPTY_ACCESS);
        onDone();
      } else {
        toast.error(
          data.promoteStaffToLogin.errors?.[0]?.message ?? "Failed to send invitation.",
        );
      }
    } catch (err) {
      toast.error(err instanceof GraphQLError ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        Give Login Access
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Give Login Access</DialogTitle>
        </DialogHeader>
        <AccessPicker
          roles={roles}
          permissions={permissions}
          value={access}
          onChange={setAccess}
          disabled={submitting}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handlePromote} disabled={submitting || !hasAccess(access)}>
            {submitting ? "Sending…" : "Send Invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}