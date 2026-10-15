export const FORGOT_PASSWORD_MUTATION = `
  mutation ForgotPassword($email: String!) {
    forgotPassword(input: { email: $email }) {
      success
    }
  }
`;