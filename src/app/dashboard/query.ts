export const DASHBOARD_QUERY = `
  query Dashboard {
    dashboard {
      products {
        total active inactive
        createdLast30Days { date value }
      }
      users {
        total active locked pendingInvitations
        signupsLast30Days { date value }
      }
      orders {
        total totalRevenue
        ordersLast30Days { date value }
        revenueLast30Days { date value }
      }
    }
  }
`;