export const RESET_PASSWORD_MUTATION = `
  mutation ResetPassword($email: String!, $code: String!, $newPassword: String!) {
    resetPassword(input: { email: $email, code: $code, newPassword: $newPassword }) {
      success
      errors { message code field }
    }
  }
`;