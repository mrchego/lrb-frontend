export const VERIFY_EMAIL_CODE_MUTATION = `
  mutation VerifyEmailCode($email: String!, $code: String!) {
    verifyEmailCode(input: { email: $email, code: $code }) {
      success
      errors { message code field }
    }
  }
`;

export const REQUEST_EMAIL_VERIFICATION_MUTATION = `
  mutation RequestEmailVerification($email: String!) {
    requestEmailVerification(input: { email: $email }) {
      success
    }
  }
`;