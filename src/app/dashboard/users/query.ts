export const USERS_QUERY = `
  query Users($isActive: Boolean, $canLogin: Boolean, $search: String, $created: DateRangeInput, $limit: Int, $offset: Int) {
    users(isActive: $isActive, canLogin: $canLogin, search: $search, created: $created, limit: $limit, offset: $offset) {
      totalCount
      items {
        id email firstName lastName fullName phone
        isFounder isCofounder hasFounderAccess roles { id name } hasCustomPermissions canLogin isActive isLocked
        passwordResetRequired failedLoginAttempts lockedUntil
        lastLogin createdAt
        company { id name }
      }
    }
  }
`;

