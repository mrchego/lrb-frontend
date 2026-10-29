export const USERS_FOR_ROLE_ASSIGNMENT_QUERY = `
  query UsersForRoleAssignment($limit: Int, $offset: Int) {
    users(limit: $limit, offset: $offset) {
      items { id email fullName isSuperuser }
      totalCount
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

export const PERMISSIONS_QUERY = `
  query Permissions {
    permissions { codename label category }
  }
`;

export const ROLES_QUERY = `
  query Roles {
    roles { id name isDefault permissions { codename } staffCount }
  }
`;