"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { gqlFetch, GraphQLError } from "@/lib/graphql-client";
import { Loading } from "@/components/loading";
import { AccessPicker, EMPTY_ACCESS, type AccessValue } from "./access-picker";
import {
  UPDATE_STAFF_ACCESS_MUTATION,
} from "./mutation";
import type { Permission } from "../roles/type";
import type { StaffMember } from "./type";
import { EFFECTIVE_PERMISSIONS_QUERY } from "@/lib/queries";

type RoleLite = { id: string; name: string; permissions: { codename: string }[] };

// Render as a SIBLING of the row-actions dropdown (controlled open state),
// same pattern as RoleFormDialog.
export function EditStaffAccessDialog({
  target,
  roles,
  permissions,
  open,
  onOpenChange,
  onSaved,
}: {
  target: StaffMember;
  roles: RoleLite[];
  permissions: Permission[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [value, setValue] = useState<AccessValue>(EMPTY_ACCESS);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    gqlFetch<{ effectivePermissions: { codenames: string[] } }>(
      EFFECTIVE_PERMISSIONS_QUERY,
      { userId: target.id },
    )
      .then((res) => {
        if (cancelled) return;
        setValue({
          roleId: target.roles[0]?.id ?? null,
          codenames: new Set(res.effectivePermissions.codenames),
        });
      })
      .catch((err) =>
        toast.error(
          err instanceof GraphQLError ? err.message : "Could not load permissions.",
        ),
      )
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [open, target.id, target.roles]);

  const handleSave = async () => {
    if (!value.roleId || submitting) return;
    setSubmitting(true);
    try {
      const data = await gqlFetch<{
        updateStaffAccess: { success: boolean; errors: any[] };
      }>(UPDATE_STAFF_ACCESS_MUTATION, {
        input: {
          userId: target.id,
          roleId: value.roleId,
          permissionCodenames: Array.from(value.codenames),
        },
      });
      if (!data.updateStaffAccess.success) {
        toast.error(
          data.updateStaffAccess.errors?.[0]?.message ?? "Could not update access.",
        );
        return;
      }
      toast.success("Role and permissions updated.");
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast.error(
        err instanceof GraphQLError ? err.message : "Something went wrong.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Role &amp; permissions — {target.fullName || target.email}</DialogTitle>
        </DialogHeader>
        {loading ? (
          <Loading variant="inline" size="sm" className="py-12" />
        ) : (
          <AccessPicker
            roles={roles}
            permissions={permissions}
            value={value}
            onChange={setValue}
            disabled={submitting}
          />
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={submitting || loading || !value.roleId}>
            {submitting ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
