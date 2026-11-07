// app/dashboard/layout.tsx
import { RequireAuth } from "@/components/require-auth";
import { CompanyProvider } from "@/components/company-provider";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardNavbar } from "@/components/dashboard-navbar";
import { ClockProvider } from "@/components/clock-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <ClockProvider>
      <CompanyProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <DashboardNavbar />
            <main className="flex-1 overflow-auto p-6">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </CompanyProvider>
      </ClockProvider>
    </RequireAuth>
  );
}