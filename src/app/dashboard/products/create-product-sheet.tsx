"use client";

import { useState } from "react";
import { SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { gqlFetch, GraphQLError } from "@/lib/graphql-client";
import { CREATE_PRODUCT_MUTATION } from "./mutation";
import { toast } from "react-toastify";

export function CreateProductSheet({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({ name: "", sku: "", price: "" });
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await gqlFetch<{ createProduct: { success: boolean; errors: any[] } }>(
        CREATE_PRODUCT_MUTATION,
        { input: { name: form.name, sku: form.sku, price: form.price } },
      );
      if (data.createProduct.success) {
        toast.success("Product created.");
        setForm({ name: "", sku: "", price: "" });
        onCreated();
      } else {
        toast.error(data.createProduct.errors?.[0]?.message ?? "Could not create product.");
      }
    } catch (err) {
      toast.error(err instanceof GraphQLError ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SheetContent className="w-full sm:max-w-md">
      <SheetHeader>
        <SheetTitle>New product</SheetTitle>
      </SheetHeader>
      <form onSubmit={handleSubmit} className="space-y-4 px-4">
        <div>
          <Label>Name</Label>
          <Input value={form.name} onChange={update("name")} required />
        </div>
        <div>
          <Label>SKU</Label>
          <Input value={form.sku} onChange={update("sku")} required />
        </div>
        <div>
          <Label>Price</Label>
          <Input type="number" step="0.01" value={form.price} onChange={update("price")} required />
        </div>
        <SheetFooter>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Create"}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  );
}