export const CREATE_ROLE_MUTATION = `
  mutation CreateRole($name: String!, $permissionCodenames: [String!]!) {
    createRole(input: { name: $name, permissionCodenames: $permissionCodenames }) {
      success
      role { id name }
      errors { message code field }
    }
  }
`;

export const UPDATE_ROLE_MUTATION = `
  mutation UpdateRole($input: UpdateRoleInput!) {
    updateRole(input: $input) {
      success
      role { id name isDefault permissions { codename } staffCount }
      errors { message code field }
    }
  }
`;

export const DELETE_ROLE_MUTATION = `
  mutation DeleteRole($roleId: ID!) {
    deleteRole(input: { roleId: $roleId }) {
      success
      errors { message code field }
    }
  }
`;


export const CLONE_ROLE_MUTATION = `
  mutation CloneRole($roleId: ID!, $newName: String!) {
    cloneRole(input: { roleId: $roleId, newName: $newName }) {
      success
      role { id name }
      errors { message code field }
    }
  }
`;

export const ASSIGN_ROLE_MUTATION = `
  mutation AssignRole($userId: ID!, $roleId: ID!) {
    assignRole(input: { userId: $userId, roleId: $roleId }) {
      success
      errors { message code field }
    }
  }
`;

export const REMOVE_ROLE_MUTATION = `
  mutation RemoveRole($userId: ID!, $roleId: ID!) {
    removeRole(input: { userId: $userId, roleId: $roleId }) {
      success
      errors { message code field }
    }
  }
`;


export const BULK_ASSIGN_ROLE_MUTATION = `
  mutation BulkAssignRole($userIds: [ID!]!, $roleId: ID!) {
    bulkAssignRole(input: { userIds: $userIds, roleId: $roleId }) {
      success succeededIds failed { itemId reason }
    }
  }
`;

export const BULK_REMOVE_ROLE_MUTATION = `
  mutation BulkRemoveRole($userIds: [ID!]!, $roleId: ID!) {
    bulkRemoveRole(input: { userIds: $userIds, roleId: $roleId }) {
      success succeededIds failed { userId reason }
    }
  }
`;