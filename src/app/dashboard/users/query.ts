export const USERS_QUERY = `
  query Users($isActive: Boolean, $canLogin: Boolean, $search: String, $limit: Int, $offset: Int) {
    users(isActive: $isActive, canLogin: $canLogin, search: $search, limit: $limit, offset: $offset) {
      totalCount
      items {
        id email firstName lastName fullName phone
        isSuperuser isStaff isFounder canLogin isActive isLocked
        passwordResetRequired failedLoginAttempts lockedUntil
        lastLogin createdAt
        company { id name }
      }
    }
  }
`;
