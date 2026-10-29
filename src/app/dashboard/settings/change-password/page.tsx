// app/dashboard/settings/change-password/page.tsx
"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { gqlFetch, GraphQLError } from "@/lib/graphql-client";
import { CHANGE_PASSWORD_MUTATION } from "./mutation";
import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await gqlFetch<{
        changePassword: { success: boolean; errors: any[] };
      }>(CHANGE_PASSWORD_MUTATION, { currentPassword, newPassword });

      if (data.changePassword.success) {
        toast.success("Password updated.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(
          data.changePassword.errors?.[0]?.message ??
            "Could not change password.",
          { autoClose: 8000 }, // validation rules can be long to read
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
    <div className="mx-auto max-w-sm py-16 px-4">
      <h1 className="text-2xl font-semibold mb-6">Change password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Current password</Label>
          <Input
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <Label>New password</Label>
          <Input
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <Label>Confirm new password</Label>
          <Input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Saving…" : "Save new password"}
        </Button>
      </form>
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <RequireAuth>
      <ChangePasswordForm />
    </RequireAuth>
  );
}