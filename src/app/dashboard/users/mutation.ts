export const ACTIVATE_USER_MUTATION = `
  mutation ActivateUser($userId: ID!) {
    activateUser(input: { userId: $userId }) { success errors { message code field } }
  }
`;

export const DEACTIVATE_USER_MUTATION = `
  mutation DeactivateUser($userId: ID!) {
    deactivateUser(input: { userId: $userId }) { success errors { message code field } }
  }
`;

export const DELETE_USER_MUTATION = `
  mutation DeleteUser($userId: ID!) {
    deleteUser(input: { userId: $userId }) { success errors { message code field } }
  }
`;

export const LOCK_USER_MUTATION = `
  mutation LockUser($userId: ID!, $durationMinutes: Int!) {
    lockUser(input: { userId: $userId, durationMinutes: $durationMinutes }) {
      success errors { message code field }
    }
  }
`;

export const UNLOCK_USER_MUTATION = `
  mutation UnlockUser($userId: ID!) {
    unlockUser(input: { userId: $userId }) { success errors { message code field } }
  }
`;

export const FORCE_PASSWORD_RESET_MUTATION = `
  mutation ForcePasswordReset($userId: ID!) {
    forcePasswordReset(input: { userId: $userId }) { success errors { message code field } }
  }
`;

export const RESTORE_USER_MUTATION = `
  mutation RestoreUser($userId: ID!) {
    restoreUser(input: { userId: $userId }) { success errors { message code field } }
  }
`;

export const PROMOTE_TO_OWNER_MUTATION = `
  mutation PromoteToOwner($userId: ID!) {
    promoteToOwner(input: { userId: $userId }) {
      success
      errors { message code field }
    }
  }
`;

export const DEMOTE_OWNER_MUTATION = `
  mutation DemoteOwner($userId: ID!) {
    demoteOwner(input: { userId: $userId }) {
      success
      errors { message code field }
    }
  }
`;

export const ADMIN_UPDATE_USER_MUTATION = `
  mutation AdminUpdateUser($input: AdminUpdateUserInput!) {
    adminUpdateUser(input: $input) {
      success
      user { id firstName lastName phone }
      errors { message code field }
    }
  }
`;

export const BULK_ACTIVATE_USERS_MUTATION = `
  mutation BulkActivateUsers($userIds: [ID!]!) {
    bulkActivateUsers(input: { userIds: $userIds }) {
      success succeededIds failed { itemId reason }
    }
  }
`;

export const BULK_DEACTIVATE_USERS_MUTATION = `
  mutation BulkDeactivateUsers($userIds: [ID!]!) {
    bulkDeactivateUsers(input: { userIds: $userIds }) {
      success succeededIds failed { itemId reason }
    }
  }
`;

export const BULK_DELETE_USERS_MUTATION = `
  mutation BulkDeleteUsers($userIds: [ID!]!) {
    bulkDeleteUsers(input: { userIds: $userIds }) {
      success succeededIds failed { itemId reason }
    }
  }
`;

export const BULK_LOCK_USERS_MUTATION = `
  mutation BulkLockUsers($userIds: [ID!]!, $durationMinutes: Int!) {
    bulkLockUsers(input: { userIds: $userIds, durationMinutes: $durationMinutes }) {
      success succeededIds failed { itemId reason }
    }
  }
`;

export const BULK_UNLOCK_USERS_MUTATION = `
  mutation BulkUnlockUsers($userIds: [ID!]!) {
    bulkUnlockUsers(input: { userIds: $userIds }) {
      success succeededIds failed { itemId reason }
    }
  }
`;

export const BULK_FORCE_PASSWORD_RESET_MUTATION = `
  mutation BulkForcePasswordReset($userIds: [ID!]!) {
    bulkForcePasswordReset(input: { userIds: $userIds }) {
      success succeededIds failed { itemId reason }
    }
  }
`;

export const BULK_RESTORE_USERS_MUTATION = `
  mutation BulkRestoreUsers($userIds: [ID!]!) {
    bulkRestoreUsers(input: { userIds: $userIds }) {
      success succeededIds failed { itemId reason }
    }
  }
`;
