import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { won, formatDate, ORDER_STATUS } from "@/lib/format";

export const metadata: Metadata = { title: "주문 관리" };

async function updateStatus(formData: FormData) {
  "use server";
  const status = String(formData.get("status"));
  if (!(status in ORDER_STATUS)) return;
  const supabase = await createClient();
  // RLS 로 관리자만 수정 가능
  await supabase.from("orders").update({ status }).eq("id", String(formData.get("id")));
  revalidatePath("/admin/orders");
}

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const { status } = await searchParams;
  const filter = typeof status === "string" && status in ORDER_STATUS ? status : undefined;

  const supabase = await createClient();
  let query = supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }).limit(100);
  if (filter) query = query.eq("status", filter);
  const { data: orders } = await query;

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">주문 관리</h1>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <a href="/admin/orders" className={`rounded-full border px-3 py-1 ${!filter ? "border-brand bg-brand text-white" : "border-line bg-surface"}`}>
          전체
        </a>
        {Object.entries(ORDER_STATUS).map(([key, label]) => (
          <a
            key={key}
            href={`/admin/orders?status=${key}`}
            className={`rounded-full border px-3 py-1 ${filter === key ? "border-brand bg-brand text-white" : "border-line bg-surface"}`}
          >
            {label}
          </a>
        ))}
      </div>

      {!orders?.length ? (
        <p className="py-20 text-center text-muted">주문이 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="card p-4 text-sm">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="font-medium">{o.order_no}</span>
                <span className="text-muted">{formatDate(o.created_at)}</span>
                <span className="font-bold">{won(o.total_amount)}</span>
                <form action={updateStatus} className="ml-auto flex items-center gap-2">
                  <input type="hidden" name="id" value={o.id} />
                  <select name="status" defaultValue={o.status} className="input !w-auto !py-1">
                    {Object.entries(ORDER_STATUS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <button className="btn-outline !py-1">변경</button>
                </form>
              </div>
              <p className="mt-2 text-muted">
                {o.recipient_name} · {o.recipient_phone} · {o.shipping_address}
              </p>
              <p className="mt-1">
                {o.order_items.map((it) => `${it.product_name} × ${it.quantity}`).join(", ")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
