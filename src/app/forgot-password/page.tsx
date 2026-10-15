// app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { gqlFetch } from "@/lib/graphql-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FORGOT_PASSWORD_MUTATION } from "./mutation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await gqlFetch(FORGOT_PASSWORD_MUTATION, { email });
    } finally {
      // Always show the same state — backend never reveals if the email exists.
      setSent(true);
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="mx-auto max-w-sm py-16 px-4">
        <h1 className="text-2xl font-semibold mb-2">Check your email</h1>
        <p className="text-sm text-muted-foreground mb-6">
          If an account exists for {email}, we&apos;ve sent a password reset
          code to it.
        </p>
        <Link href={`/reset-password?email=${encodeURIComponent(email)}`}>
          <Button className="w-full">I have a code</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm py-16 px-4">
      <h1 className="text-2xl font-semibold mb-2">Forgot your password?</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Enter your email and we&apos;ll send you a reset code.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Sending…" : "Send reset code"}
        </Button>
      </form>
      <p className="text-sm text-muted-foreground mt-4">
        <Link href="/login" className="underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
