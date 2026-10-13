import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { won } from "@/lib/format";

export const metadata: Metadata = { title: "상품 관리" };

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">상품 관리 ({products?.length ?? 0})</h1>
        <Link href="/admin/products/new" className="btn-primary">상품 등록</Link>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-line bg-brand-soft text-left">
            <tr>
              <th className="px-3 py-2">상품</th>
              <th className="px-3 py-2">카테고리</th>
              <th className="px-3 py-2 text-right">가격</th>
              <th className="px-3 py-2 text-right">재고</th>
              <th className="px-3 py-2">상태</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {products?.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="relative size-10 shrink-0 overflow-hidden rounded border border-line bg-white">
                      {p.image_url && <Image src={p.image_url} alt="" fill sizes="40px" className="object-contain" />}
                    </div>
                    <span className="line-clamp-1">{p.name}</span>
                  </div>
                </td>
                <td className="px-3 py-2">{p.categories?.name}</td>
                <td className="px-3 py-2 text-right">{won(p.price)}</td>
                <td className={`px-3 py-2 text-right ${p.stock < 10 ? "font-bold text-red-600" : ""}`}>{p.stock}</td>
                <td className="px-3 py-2">
                  {p.is_active ? "판매중" : <span className="text-muted">숨김</span>}
                  {p.is_featured && <span className="ml-1 text-brand">· 추천</span>}
                </td>
                <td className="px-3 py-2 text-right">
                  <Link href={`/admin/products/${p.id}`} className="text-brand hover:underline">수정</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
