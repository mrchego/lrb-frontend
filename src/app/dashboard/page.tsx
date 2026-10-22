"use client";

import useSWR from "swr";
import { useAuth } from "@/components/auth-provider";
import { gqlFetch } from "@/lib/graphql-client";
import { DASHBOARD_QUERY } from "./query";
import { DashboardData } from "./type";
import { SummaryAreaChart } from "./summary-area-chart";
import { SummaryCard } from "./summary-cards";
import { Loading } from "@/components/loading";

export default function DashboardHome() {
  const { user, hasPermission, loading: authLoading } = useAuth();

  const { data, isLoading, error } = useSWR<{ dashboard: DashboardData }>(
    user ? "dashboard" : null,
    () => gqlFetch<{ dashboard: DashboardData }>(DASHBOARD_QUERY),
    { revalidateOnFocus: false },
  );

  if (authLoading || isLoading) {
    return <Loading/>;
  }
  if (error) {
    return <div className="p-8 text-sm text-red-600">Failed to load dashboard.</div>;
  }

  const dashboard = data?.dashboard;
  const canViewProducts = hasPermission("products.view_product");
  const canViewOrders = hasPermission("orders.view_order");
  const canViewUsers = !!user?.isSuperuser;

  const nothingVisible = !canViewProducts && !canViewOrders && !canViewUsers;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Welcome, {user?.firstName || user?.email}</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening in your company.</p>
      </div>

      {nothingVisible && (
        <p className="text-sm text-muted-foreground">
          You don't have permission to view any dashboard data yet.
        </p>
      )}

      {canViewProducts && dashboard?.products && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard label="Total products" value={dashboard.products.total} />
            <SummaryCard label="Active" value={dashboard.products.active} />
            <SummaryCard label="Inactive" value={dashboard.products.inactive} />
          </div>
          <SummaryAreaChart
            title="New products"
            description="Last 30 days"
            data={dashboard.products.createdLast30Days}
            dataKey="products"
            color="var(--chart-1)"
          />
        </section>
      )}

      {canViewOrders && dashboard?.orders && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Orders</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SummaryCard label="Total orders" value={dashboard.orders.total} />
            <SummaryCard
              label="Total revenue"
              value={`$${dashboard.orders.totalRevenue.toFixed(2)}`}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SummaryAreaChart
              title="Orders"
              description="Last 30 days"
              data={dashboard.orders.ordersLast30Days}
              dataKey="orders"
              color="var(--chart-2)"
            />
            <SummaryAreaChart
              title="Revenue"
              description="Last 30 days"
              data={dashboard.orders.revenueLast30Days}
              dataKey="revenue"
              color="var(--chart-3)"
            />
          </div>
        </section>
      )}

      {canViewUsers && dashboard?.users && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <SummaryCard label="Total users" value={dashboard.users.total} />
            <SummaryCard label="Active" value={dashboard.users.active} />
            <SummaryCard label="Locked" value={dashboard.users.locked} />
            <SummaryCard label="Pending invitations" value={dashboard.users.pendingInvitations} />
          </div>
          <SummaryAreaChart
            title="Signups"
            description="Last 30 days"
            data={dashboard.users.signupsLast30Days}
            dataKey="signups"
            color="var(--chart-4)"
          />
        </section>
      )}
    </div>
  );
}