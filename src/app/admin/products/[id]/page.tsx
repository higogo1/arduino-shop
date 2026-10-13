import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/products";
import ProductForm from "../ProductForm";

export const metadata: Metadata = { title: "상품 수정" };

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: product }, categories] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    getCategories(),
  ]);
  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">상품 수정</h1>
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
