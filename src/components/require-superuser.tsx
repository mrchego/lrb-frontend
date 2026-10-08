"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import { useEffect } from "react";
import { Loading } from "./loading";

export function RequireSuperuser({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !user.isSuperuser)) router.replace("/dashboard");
  }, [loading, user, router]);

  if (loading)
    return (
      <div>
        <Loading />
      </div>
    );
  if (!user?.isSuperuser) return null;
  return <>{children}</>;
}
