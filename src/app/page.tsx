import Image from "next/image";
import Link from "next/link";
import { getCategories, getProducts } from "@/lib/products";
import ProductCard from "@/components/product/ProductCard";

export default async function Home() {
  const [featured, categories] = await Promise.all([getProducts({ featured: true }), getCategories()]);

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-foreground">
        <Image
          src="/images/products/hero-1.jpg"
          alt="책상 위의 아두이노 보드"
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover opacity-45"
        />
        <div className="mx-auto max-w-6xl px-4 py-20 text-white sm:py-28">
          <p className="text-sm font-medium tracking-wide text-brand-soft">정품 보드부터 센서까지</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-5xl">
            만들고 싶은 것이 있다면,
            <br />
            아두이노 마켓에서 시작하세요
          </h1>
          <p className="mt-4 max-w-lg text-white/80">
            UNO R4, Nano ESP32 같은 정품 보드와 입문용 센서·모듈을 합리적인 가격에 준비했습니다.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/products" className="btn-primary">전체 상품 보기</Link>
            <Link href="/products?category=kits" className="btn-outline !border-white/40 !bg-transparent !text-white">
              입문 키트
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}`}
              className="card px-4 py-5 text-center font-medium hover:border-brand hover:text-brand"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-12">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-bold">추천 상품</h2>
          <Link href="/products" className="text-sm text-muted hover:text-brand">전체보기 →</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-12">
        <div className="relative isolate overflow-hidden rounded-2xl bg-brand-dark">
          <Image
            src="/images/products/hero-2.jpg"
            alt="브레드보드 위의 전자 부품"
            fill
            sizes="(max-width: 1152px) 100vw, 1152px"
            className="-z-10 object-cover opacity-30"
          />
          <div className="px-6 py-10 text-white sm:px-10">
            <h2 className="text-2xl font-bold">5만원 이상 구매 시 무료배송</h2>
            <p className="mt-2 text-white/80">보드와 센서를 한 번에 담아 배송비를 아끼세요.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
