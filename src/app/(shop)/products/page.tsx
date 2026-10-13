import Link from "next/link";
import type { Metadata } from "next";
import { getCategories, getProducts, PRODUCT_SORTS } from "@/lib/products";
import ProductCard from "@/components/product/ProductCard";

export const metadata: Metadata = { title: "상품 목록" };

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const sp = await searchParams;
  const category = one(sp.category);
  const q = one(sp.q);
  const sort = one(sp.sort) ?? "new";

  const [products, categories] = await Promise.all([getProducts({ category, q, sort }), getCategories()]);
  const current = categories.find((c) => c.slug === category);

  const href = (next: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { category, q, sort, ...next };
    Object.entries(merged).forEach(([k, v]) => v && params.set(k, v));
    return `/products?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">
        {q ? `'${q}' 검색 결과` : current ? current.name : "전체상품"}
      </h1>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={href({ category: undefined })}
          className={`rounded-full border px-4 py-1.5 text-sm ${!category ? "border-brand bg-brand text-white" : "border-line bg-surface hover:border-brand"}`}
        >
          전체
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={href({ category: c.slug })}
            className={`rounded-full border px-4 py-1.5 text-sm ${category === c.slug ? "border-brand bg-brand text-white" : "border-line bg-surface hover:border-brand"}`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-b border-line pb-3 text-sm">
        <p className="text-muted">총 {products.length}개</p>
        <div className="flex gap-3">
          {Object.entries(PRODUCT_SORTS).map(([key, s]) => (
            <Link
              key={key}
              href={href({ sort: key })}
              className={sort === key ? "font-bold text-brand" : "text-muted hover:text-foreground"}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <p className="py-20 text-center text-muted">조건에 맞는 상품이 없습니다.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
