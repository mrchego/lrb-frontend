"use client";

import { useState } from "react";
import { SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { gqlFetch, GraphQLError } from "@/lib/graphql-client";
import { UPDATE_PRODUCT_MUTATION } from "./mutation";
import { ManagedProduct } from "./type";

export function EditProductSheet({
  product,
  onSaved,
}: {
  product: ManagedProduct;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({ name: product.name, sku: product.sku, price: product.price });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const data = await gqlFetch<{ updateProduct: { success: boolean; errors: any[] } }>(
        UPDATE_PRODUCT_MUTATION,
        { input: { productId: product.id, ...form } },
      );
      if (data.updateProduct.success) {
        onSaved();
      } else {
        setError(data.updateProduct.errors?.[0]?.message ?? "Could not update product.");
      }
    } catch (err) {
      setError(err instanceof GraphQLError ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SheetContent className="w-full sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Edit {product.name}</SheetTitle>
      </SheetHeader>
      <form onSubmit={handleSubmit} className="space-y-4 px-4">
        <div>
          <Label>Name</Label>
          <Input value={form.name} onChange={update("name")} />
        </div>
        <div>
          <Label>SKU</Label>
          <Input value={form.sku} onChange={update("sku")} />
        </div>
        <div>
          <Label>Price</Label>
          <Input type="number" step="0.01" value={form.price} onChange={update("price")} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <SheetFooter>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Save"}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  );
}