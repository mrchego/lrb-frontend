// app/dashboard/layout.tsx
import { RequireAuth } from "@/components/require-auth";
import { CompanyProvider } from "@/components/company-provider";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardNavbar } from "@/components/dashboard-navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <CompanyProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <DashboardNavbar />
            <main className="flex-1 overflow-auto p-6">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </CompanyProvider>
    </RequireAuth>
  );
}