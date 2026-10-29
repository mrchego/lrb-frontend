"use client";
import { useState } from "react";
import { gqlFetch, GraphQLError } from "@/lib/graphql-client";
import { CLONE_ROLE_MUTATION } from "./mutation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";

export function CloneRoleDialog({
  roleId,
  roleName,
  open,
  onOpenChange,
  onCloned,
}: {
  roleId: string;
  roleName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloned: () => void;
}) {
  const [newName, setNewName] = useState(`${roleName} (copy)`);
  const [submitting, setSubmitting] = useState(false);

const handleClone = async () => {
  const name = newName.trim();
  if (!name || submitting) return;

  setSubmitting(true);
  try {
    const data = await gqlFetch<{
      cloneRole: { success: boolean; errors: any[] };
    }>(CLONE_ROLE_MUTATION, { roleId, newName: name });

    if (data.cloneRole.success) {
      toast.success(`Role "${name}" created from ${roleName}.`);
      onOpenChange(false);
      onCloned();
    } else {
      toast.error(data.cloneRole.errors?.[0]?.message ?? "Failed to clone role.");
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clone {roleName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label>New role name</Label>
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleClone} disabled={submitting || !newName.trim()}>
            {submitting ? "Cloning…" : "Clone"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}