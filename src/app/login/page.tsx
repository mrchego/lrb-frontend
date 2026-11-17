"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);

  useEffect(() => {
    if (retryAfter <= 0) return;

    const timer = setTimeout(() => {
      setRetryAfter((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [retryAfter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submitting || retryAfter > 0) return;

    setSubmitting(true);
    setError(null);

    try {
      const result = await login(email, password);

      if (result.success) {
        router.push("/dashboard");
      } else {
        const err = result.errors?.[0];

        if (err?.code === "RATE_LIMITED") {
          setRetryAfter(err.retryAfter);
          setError(null);
        } else {
          setError(err?.message ?? "Login failed.");
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm py-16 px-4">
      <h1 className="text-2xl font-semibold mb-6">Log in</h1>
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
        <div>
          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button
          type="submit"
          disabled={submitting || retryAfter > 0}
          className="w-full"
        >
          {submitting
            ? "Logging in…"
            : retryAfter > 0
              ? `Try again in ${retryAfter}s`
              : "Log in"}
        </Button>
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-muted-foreground underline"
          >
            Forgot password?
          </Link>
        </div>
      </form>
    </div>
  );
}
