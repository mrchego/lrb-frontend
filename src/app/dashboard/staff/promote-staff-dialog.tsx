// components/promote-staff-dialog.tsx
"use client";
import { useState } from "react";
import { gqlFetch, GraphQLError } from "@/lib/graphql-client";
import { PROMOTE_STAFF_TO_LOGIN_MUTATION } from "./mutation";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";

type Role = { id: string; name: string };

export function PromoteStaffDialog({
  userId, roles, onDone,
}: { userId: string; roles: Role[]; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [roleId, setRoleId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePromote = async () => {
    if (!roleId) return;
    setSubmitting(true);
    try {
    const data = await gqlFetch<{
      promoteStaffToLogin: { success: boolean; errors: any[] };
    }>(PROMOTE_STAFF_TO_LOGIN_MUTATION, { userId, roleId });

    if (data.promoteStaffToLogin.success) {
      toast.success("Invitation sent.");
      setOpen(false);
      onDone();
    } else {
      toast.error(
        data.promoteStaffToLogin.errors?.[0]?.message ??
          "Failed to send invitation.",
      );
    }
  } catch (err) {
    toast.error(
      err instanceof GraphQLError ? err.message : "Something went wrong.",
    );
  } finally {
    setSubmitting(false);
  }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        Give Login Access
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Give Login Access</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Select value={roleId ?? ""} onValueChange={setRoleId}>
            <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handlePromote} disabled={submitting || !roleId}>
            {submitting ? "Sending…" : "Send Invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}