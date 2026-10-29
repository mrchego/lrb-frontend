export type ManagedProduct = {
  id: string;
  name: string;
  sku: string;
  price: string;
  isActive: boolean;
  createdAt: string;
};

export type ProductConnection = { items: ManagedProduct[]; totalCount: number };

export type BulkProductActionFailure = { itemId: string; reason: string };


export type BulkProductActionResult = {
  success: boolean;
  succeededIds: string[];
  failed: BulkProductActionFailure[];
};
