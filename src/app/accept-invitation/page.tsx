"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { gqlFetch } from "@/lib/graphql-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ACCEPT_INVITATION_MUTATION } from "./mutation";


export default function AcceptInvitationPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("This invitation link is missing its token.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await gqlFetch<{
        acceptInvitation: { success: boolean; user: { email: string } | null; errors: any[] };
      }>(ACCEPT_INVITATION_MUTATION, { token, newPassword: password });

      if (data.acceptInvitation.success) {
        setDone(true);
        setTimeout(() => router.push("/login"), 1500);
      } else {
        setError(data.acceptInvitation.errors?.[0]?.message ?? "Could not accept invitation.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-sm py-16 px-4">
        <h1 className="text-2xl font-semibold mb-2">Invalid invitation link</h1>
        <p className="text-sm text-muted-foreground">
          This link is missing its token. Please use the link from your invitation email.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-sm py-16 px-4">
        <h1 className="text-2xl font-semibold mb-2">All set!</h1>
        <p className="text-sm text-muted-foreground">
          Your account is active. Redirecting you to log in…
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm py-16 px-4">
      <h1 className="text-2xl font-semibold mb-2">Set your password</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Choose a password to activate your account.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <Label>Confirm password</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Setting password…" : "Activate account"}
        </Button>
      </form>
    </div>
  );
}