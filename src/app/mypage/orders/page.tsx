import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { won, formatDate, ORDER_STATUS } from "@/lib/format";

export const metadata: Metadata = { title: "주문 내역" };

export default async function MyOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/mypage/orders");

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", user.id)
    .neq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">마이페이지</h1>
      <div className="mt-6 flex gap-2 text-sm">
        <Link href="/mypage" className="rounded-full border border-line bg-surface px-4 py-1.5 hover:border-brand">
          회원 정보
        </Link>
        <span className="rounded-full bg-brand px-4 py-1.5 text-white">주문 내역</span>
      </div>

      {!orders?.length ? (
        <p className="py-20 text-center text-muted">주문 내역이 없습니다.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {orders.map((o) => (
            <li key={o.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3 text-sm">
                <span className="text-muted">
                  {formatDate(o.created_at)} · 주문번호 {o.order_no}
                </span>
                <span className="rounded-full bg-brand-soft px-3 py-0.5 font-medium text-brand-dark">
                  {ORDER_STATUS[o.status] ?? o.status}
                </span>
              </div>
              <ul className="space-y-1 py-3 text-sm">
                {o.order_items.map((it) => (
                  <li key={it.id} className="flex justify-between">
                    <span>
                      {it.product_name} × {it.quantity}
                    </span>
                    <span>{won(it.unit_price * it.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between border-t border-line pt-3 text-sm">
                <span className="text-muted">배송비 {o.shipping_fee === 0 ? "무료" : won(o.shipping_fee)}</span>
                <span className="font-bold">총 {won(o.total_amount)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
