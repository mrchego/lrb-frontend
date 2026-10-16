export const USERS_FOR_ROLE_ASSIGNMENT_QUERY = `
  query UsersForRoleAssignment {
    users {
      id email fullName isSuperuser
    }
  }
`;

export const ROLE_QUERY = `
  query Role($roleId: ID!) {
    role(roleId: $roleId) {
      id name isDefault staffCount
      permissions { codename label category }
    }
  }
`;

