
export type ChartPoint = { date: string; value: number };

export type ProductStats = {
  total: number; active: number; inactive: number;
  createdLast30Days: ChartPoint[];
};

export type UserStats = {
  total: number; active: number; locked: number; pendingInvitations: number;
  signupsLast30Days: ChartPoint[];
};

export type OrderStats = {
  total: number; totalRevenue: number;
  ordersLast30Days: ChartPoint[];
  revenueLast30Days: ChartPoint[];
};

export type DashboardData = {
  products: ProductStats | null;
  users: UserStats | null;
  orders: OrderStats | null;
};
