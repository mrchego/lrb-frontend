export const CREATE_PRODUCT_MUTATION = `
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      success
      product { id name sku price isActive createdAt }
      errors { message code field }
    }
  }
`;

export const UPDATE_PRODUCT_MUTATION = `
  mutation UpdateProduct($input: UpdateProductInput!) {
    updateProduct(input: $input) {
      success
      product { id name sku price isActive createdAt }
      errors { message code field }
    }
  }
`;

export const DELETE_PRODUCT_MUTATION = `
  mutation DeleteProduct($productId: ID!) {
    deleteProduct(input: { productId: $productId }) { success errors { message code field } }
  }
`;

export const ACTIVATE_PRODUCT_MUTATION = `
  mutation ActivateProduct($productId: ID!) {
    activateProduct(input: { productId: $productId }) {
      success
      product { id isActive }
      errors { message code field }
    }
  }
`;

export const DEACTIVATE_PRODUCT_MUTATION = `
  mutation DeactivateProduct($productId: ID!) {
    deactivateProduct(input: { productId: $productId }) {
      success
      product { id isActive }
      errors { message code field }
    }
  }
`;

export const BULK_ACTIVATE_PRODUCTS_MUTATION = `
  mutation BulkActivateProducts($productIds: [ID!]!) {
    bulkActivateProducts(input: { productIds: $productIds }) {
      success succeededIds failed { productId reason }
    }
  }
`;

export const BULK_DEACTIVATE_PRODUCTS_MUTATION = `
  mutation BulkDeactivateProducts($productIds: [ID!]!) {
    bulkDeactivateProducts(input: { productIds: $productIds }) {
      success succeededIds failed { productId reason }
    }
  }
`;

export const BULK_DELETE_PRODUCTS_MUTATION = `
  mutation BulkDeleteProducts($productIds: [ID!]!) {
    bulkDeleteProducts(input: { productIds: $productIds }) {
      success succeededIds failed { productId reason }
    }
  }
`;