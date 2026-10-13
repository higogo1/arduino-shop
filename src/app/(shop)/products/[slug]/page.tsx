import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct } from "@/lib/products";
import { won, FREE_SHIPPING_MIN, SHIPPING_FEE } from "@/lib/format";
import AddToCart from "@/components/product/AddToCart";

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  return { title: product?.name ?? "상품 없음", description: product?.summary };
}

export default async function ProductDetailPage({ params }: PageProps<"/products/[slug]">) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();

  const specs = Object.entries((product.specs ?? {}) as Record<string, string>);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="text-sm text-muted">
        <Link href="/products" className="hover:text-brand">전체상품</Link>
        {product.categories && (
          <>
            {" › "}
            <Link href={`/products?category=${product.categories.slug}`} className="hover:text-brand">
              {product.categories.name}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div className="card relative aspect-square overflow-hidden bg-white">
          {product.image_url && (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-8"
            />
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="mt-2 text-muted">{product.summary}</p>
          </div>
          <p className="text-3xl font-bold">{won(product.price)}</p>

          <dl className="grid grid-cols-[6rem_1fr] gap-y-2 border-y border-line py-4 text-sm">
            <dt className="text-muted">배송비</dt>
            <dd>
              {won(SHIPPING_FEE)} ({won(FREE_SHIPPING_MIN)} 이상 무료)
            </dd>
            <dt className="text-muted">재고</dt>
            <dd>{product.stock > 0 ? `${product.stock}개` : "품절"}</dd>
          </dl>

          <AddToCart product={product} />
        </div>
      </div>

      <section className="mt-12 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-bold">상품 설명</h2>
          <p className="mt-3 leading-relaxed text-muted">{product.description}</p>
          {product.devicemart_no && (
            <p className="mt-3 text-xs text-muted">
              참고:{" "}
              <a
                href={`https://www.devicemart.co.kr/goods/view?no=${product.devicemart_no}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                디바이스마트 상품 정보
              </a>
            </p>
          )}
        </div>
        {specs.length > 0 && (
          <div>
            <h2 className="text-lg font-bold">주요 사양</h2>
            <table className="mt-3 w-full overflow-hidden rounded-lg text-sm">
              <tbody>
                {specs.map(([k, v]) => (
                  <tr key={k} className="border-b border-line last:border-0">
                    <th className="w-32 bg-brand-soft px-3 py-2 text-left font-medium">{k}</th>
                    <td className="bg-surface px-3 py-2">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
