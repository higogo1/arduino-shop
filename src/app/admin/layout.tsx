import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/products");
  if (profile?.role !== "admin") {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-xl font-bold">관리자만 접근할 수 있습니다</h1>
        <Link href="/" className="btn-primary mt-6">홈으로</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center gap-2 text-sm">
        <span className="mr-2 text-lg font-bold">관리자</span>
        <Link href="/admin/products" className="rounded-full border border-line bg-surface px-4 py-1.5 hover:border-brand">
          상품 관리
        </Link>
        <Link href="/admin/orders" className="rounded-full border border-line bg-surface px-4 py-1.5 hover:border-brand">
          주문 관리
        </Link>
      </div>
      {children}
    </div>
  );
}
