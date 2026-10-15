export const ACCEPT_INVITATION_MUTATION = `
  mutation AcceptInvitation($token: String!, $newPassword: String!) {
    acceptInvitation(input: { token: $token, newPassword: $newPassword }) {
      success
      user { id email }
      errors { message code field }
    }
  }
`;