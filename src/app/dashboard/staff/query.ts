export const ROLES_QUERY = `
  query Roles {
    roles { id name isDefault permissions { codename } staffCount }
  }
`;

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

export const STAFF_MEMBERS_QUERY = `
  query StaffMembers($canLogin: Boolean, $limit: Int, $offset: Int) {
    staffMembers(canLogin: $canLogin, limit: $limit, offset: $offset) {
      totalCount
      items {
        id email firstName lastName fullName phone
        canLogin isActive isLocked lastLogin createdAt
        company { id name }
      }
    }
  }
`;

export const INVITATIONS_QUERY = `
  query Invitations($used: Boolean, $limit: Int, $offset: Int) {
    invitations(used: $used, limit: $limit, offset: $offset) {
      totalCount
      items {
        id email roleName invitedByEmail used acceptedAt expiresAt isExpired createdAt
      }
    }
  }
`;