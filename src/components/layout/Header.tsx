import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/supabase/server";
import { getCategories } from "@/lib/products";
import CartBadge from "./CartBadge";
import SearchBox from "./SearchBox";

export default async function Header() {
  const [{ user, profile }, categories] = await Promise.all([getCurrentUser(), getCategories()]);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="shrink-0 text-xl font-bold text-brand">
          아두이노 마켓
        </Link>
        <div className="hidden flex-1 sm:block">
          <Suspense>
            <SearchBox />
          </Suspense>
        </div>
        <nav className="ml-auto flex items-center gap-4 text-sm">
          {profile?.role === "admin" && (
            <Link href="/admin/products" className="font-medium text-brand-dark hover:underline">
              관리자
            </Link>
          )}
          {user ? (
            <>
              <Link href="/mypage" className="hover:text-brand">마이페이지</Link>
              <form action="/auth/logout" method="post">
                <button className="text-muted hover:text-brand">로그아웃</button>
              </form>
            </>
          ) : (
            <Link href="/login" className="hover:text-brand">로그인</Link>
          )}
          <CartBadge />
        </nav>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-3 sm:hidden">
        <Suspense>
          <SearchBox />
        </Suspense>
      </div>
      <nav className="border-t border-line">
        <ul className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 text-sm">
          <li>
            <Link href="/products" className="block px-3 py-2.5 whitespace-nowrap hover:text-brand">
              전체상품
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/products?category=${c.slug}`}
                className="block px-3 py-2.5 whitespace-nowrap hover:text-brand"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
