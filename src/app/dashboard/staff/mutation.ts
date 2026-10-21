export const PROMOTE_STAFF_TO_LOGIN_MUTATION = `
  mutation PromoteStaffToLogin($userId: ID!, $roleId: ID!) {
    promoteStaffToLogin(input: { userId: $userId, roleId: $roleId }) {
      success
      invitation { id email roleName }
      errors { message code field }
    }
  }
`;


export const RESEND_INVITATION_MUTATION = `
  mutation ResendInvitation($invitationId: ID!) {
    resendInvitation(input: { invitationId: $invitationId }) {
      success
      invitation { id expiresAt }
      errors { message code field }
    }
  }
`;

export const REVOKE_INVITATION_MUTATION = `
  mutation RevokeInvitation($invitationId: ID!) {
    revokeInvitation(input: { invitationId: $invitationId }) {
      success
      errors { message code field }
    }
  }
`;

export const DEMOTE_STAFF_FROM_LOGIN_MUTATION = `
  mutation DemoteStaffFromLogin($userId: ID!) {
    demoteStaffFromLogin(input: { userId: $userId }) {
      success
      errors { message code field }
    }
  }
`;

export const INVITE_STAFF_MUTATION = `
  mutation InviteStaff($email: String!, $firstName: String!, $lastName: String!, $canLogin: Boolean!, $roleId: ID) {
    inviteStaff(input: { email: $email, firstName: $firstName, lastName: $lastName, canLogin: $canLogin, roleId: $roleId }) {
      success
      invitation { id email roleName }
      errors { message code field }
    }
  }
`;

export const BULK_REVOKE_INVITATIONS_MUTATION = `
  mutation BulkRevokeInvitations($invitationIds: [ID!]!) {
    bulkRevokeInvitations(input: { invitationIds: $invitationIds }) {
      success succeededIds failed { userId reason }
    }
  }
`;