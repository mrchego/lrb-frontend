export const UPDATE_COMPANY_MUTATION = `
  mutation UpdateCompany($input: UpdateCompanyInput!) {
    updateCompany(input: $input) {
      success
      company {
        id name email phone country city address
        logoLight { url name }
        logoDark { url name }
        isActive
      }
      errors { message code field }
    }
  }
`;

export const UPDATE_COMPANY_SETTINGS_MUTATION = `
  mutation UpdateCompanySettings($input: UpdateCompanySettingsInput!) {
    updateCompanySettings(input: $input) {
      success
      settings { id timezone currency language dateFormat theme }
      errors { message code field }
    }
  }
`;