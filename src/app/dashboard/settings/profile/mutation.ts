export const UPDATE_PROFILE_MUTATION = `
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      success
      user {
        id email firstName lastName fullName phone
        avatar { url name }
        isSuperuser
        company { id name }
      }
      errors { message code field }
    }
  }
`;