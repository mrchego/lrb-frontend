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
    }
  }
`;