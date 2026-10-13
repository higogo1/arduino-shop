import type { Metadata } from "next";
import { getCategories } from "@/lib/products";
import ProductForm from "../ProductForm";

export const metadata: Metadata = { title: "상품 등록" };

export default async function NewProductPage() {
  const categories = await getCategories();
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">상품 등록</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
