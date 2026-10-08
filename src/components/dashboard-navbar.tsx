// components/dashboard-navbar.tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { useCompany } from "@/components/company-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ModeToggle } from "./mode-toggle";
import { resolveMediaUrl } from "@/lib/media";
import { SidebarTrigger } from "@/components/ui/sidebar";
export function DashboardNavbar() {
  const { user, logout } = useAuth();
  const { company } = useCompany();

  return (
    <header className="border-b flex items-center justify-between px-6 h-14">
      <div className="flex items-center gap-2">
    <SidebarTrigger />
    <Link href="/dashboard" className="font-semibold text-sm">
      {company?.name ?? "Dashboard"}
    </Link>
  </div>
      <div className="flex items-center gap-2">
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={resolveMediaUrl(user?.avatar?.url)}
                alt={user?.fullName || user?.email || "User"}
              />
              <AvatarFallback>
                {(user?.firstName || user?.email || "U")
                  .slice(0, 1)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 font-medium">
              {user?.fullName || "Your account"}
            </div>
            <div className="px-2 pb-2 text-xs text-muted-foreground">
              {user?.email}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              render={<Link href="/dashboard/settings/profile" />}
            >
              Profile settings
            </DropdownMenuItem>
            <DropdownMenuItem
              render={<Link href="/dashboard/settings/change-password" />}
            >
              Change password
            </DropdownMenuItem>
            {user?.isSuperuser && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={<Link href="/dashboard/settings/company" />}
                >
                  Company settings
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
