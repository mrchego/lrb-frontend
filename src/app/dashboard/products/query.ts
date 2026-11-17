export const PRODUCTS_QUERY = `
  query Products($isActive: Boolean, $search: String, $created:  DateRangeInput, $limit: Int, $offset: Int) {
    products(isActive: $isActive, search: $search, created: $created ,limit: $limit, offset: $offset) {
      totalCount
      items { id name sku price isActive createdAt }
    }
  }
`;