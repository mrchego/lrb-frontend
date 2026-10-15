export const REGISTER_COMPANY_MUTATION = `
  mutation RegisterCompany($input: RegisterCompanyInput!) {
    registerCompany(input: $input) {
      success
      company { id name }
      errors { message code field }
    }
  }
`;