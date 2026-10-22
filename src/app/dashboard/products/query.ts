export const PRODUCTS_QUERY = `
  query Products($isActive: Boolean, $search: String, $limit: Int, $offset: Int) {
    products(isActive: $isActive, search: $search, limit: $limit, offset: $offset) {
      totalCount
      items { id name sku price isActive createdAt }
    }
  }
`;