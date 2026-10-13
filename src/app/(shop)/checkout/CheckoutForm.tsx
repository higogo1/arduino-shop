"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { loadTossPayments, type TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import { useCart } from "@/hooks/useCart";
import { createClient } from "@/lib/supabase/client";
import { won, shippingFee } from "@/lib/format";

type Props = {
  userId: string;
  email: string;
  defaults: { name: string; phone: string; address: string };
};

export default function CheckoutForm({ userId, email, defaults }: Props) {
  const { items, ready, itemsAmount } = useCart();
  const [form, setForm] = useState(defaults);
  const [widgetReady, setWidgetReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);
  const renderedRef = useRef(false);

  const fee = shippingFee(itemsAmount);
  const total = itemsAmount + fee;

  // 토스 결제위젯 렌더링 (최초 1회), 이후 금액만 갱신
  useEffect(() => {
    if (!ready || items.length === 0) return;
    let cancelled = false;

    (async () => {
      if (!widgetsRef.current) {
        const toss = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!);
        widgetsRef.current = toss.widgets({ customerKey: userId });
      }
      const widgets = widgetsRef.current;
      await widgets.setAmount({ currency: "KRW", value: total });
      if (cancelled || renderedRef.current) return;
      renderedRef.current = true;
      await Promise.all([
        widgets.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" }),
        widgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" }),
      ]);
      if (!cancelled) setWidgetReady(true);
    })().catch((e) => setError(e instanceof Error ? e.message : "결제 모듈을 불러오지 못했습니다"));

    return () => {
      cancelled = true;
    };
  }, [ready, items.length, total, userId]);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!widgetsRef.current) return;
    setSubmitting(true);
    setError("");

    try {
      const supabase = createClient();
      // 주문 생성: 금액은 DB 가격으로 다시 계산됨
      const { data: order, error: rpcError } = await supabase.rpc("create_order", {
        items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
        recipient_name: form.name,
        recipient_phone: form.phone,
        shipping_address: form.address,
      });
      if (rpcError || !order) throw new Error(rpcError?.message ?? "주문 생성에 실패했습니다");

      // 배송지를 다음 주문 때 쓰도록 저장
      await supabase.from("profiles").update({ name: form.name, phone: form.phone, address: form.address }).eq("id", userId);

      await widgetsRef.current.setAmount({ currency: "KRW", value: order.total_amount });
      await widgetsRef.current.requestPayment({
        orderId: order.order_no,
        orderName: items.length > 1 ? `${items[0].name} 외 ${items.length - 1}건` : items[0].name,
        successUrl: `${window.location.origin}/checkout/success`,
        failUrl: `${window.location.origin}/checkout/fail`,
        customerEmail: email || undefined,
        customerName: form.name,
        customerMobilePhone: form.phone.replace(/\D/g, "") || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "결제 요청 중 오류가 발생했습니다");
      setSubmitting(false);
    }
  }

  if (!ready) return <p className="py-20 text-center text-muted">불러오는 중…</p>;
  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted">주문할 상품이 없습니다.</p>
        <Link href="/products" className="btn-primary mt-6">쇼핑하러 가기</Link>
      </div>
    );
  }

  return (
    <form onSubmit={pay} className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-6">
        <section className="card space-y-4 p-5">
          <h2 className="font-bold">배송 정보</h2>
          <label className="block text-sm">
            받는 분
            <input className="input mt-1" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="block text-sm">
            연락처
            <input
              className="input mt-1"
              required
              type="tel"
              placeholder="010-1234-5678"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            주소
            <input className="input mt-1" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </label>
        </section>

        <section className="card overflow-hidden">
          <h2 className="px-5 pt-5 font-bold">결제 수단</h2>
          <div id="payment-method" />
          <div id="agreement" />
        </section>
      </div>

      <aside className="card h-fit space-y-3 p-5 text-sm">
        <h2 className="font-bold">주문 상품</h2>
        <ul className="space-y-2 border-b border-line pb-3">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-2">
              <span className="line-clamp-1 text-muted">
                {i.name} × {i.quantity}
              </span>
              <span className="shrink-0">{won(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between">
          <span className="text-muted">상품금액</span>
          <span>{won(itemsAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">배송비</span>
          <span>{fee === 0 ? "무료" : won(fee)}</span>
        </div>
        <div className="flex justify-between border-t border-line pt-3 text-base font-bold">
          <span>최종 결제금액</span>
          <span>{won(total)}</span>
        </div>
        {error && <p className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
        <button className="btn-primary w-full" disabled={!widgetReady || submitting}>
          {submitting ? "결제 진행 중…" : `${won(total)} 결제하기`}
        </button>
        <p className="text-center text-xs text-muted">테스트 결제입니다. 실제로 청구되지 않습니다.</p>
      </aside>
    </form>
  );
}
