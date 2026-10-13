"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/hooks/useCart";
import { won } from "@/lib/format";

type State =
  | { status: "loading" }
  | { status: "done"; orderNo: string; amount: number }
  | { status: "error"; message: string };

export default function ConfirmPayment() {
  const params = useSearchParams();
  const { clear } = useCart();
  const [state, setState] = useState<State>({ status: "loading" });
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const paymentKey = params.get("paymentKey");
    const orderId = params.get("orderId");
    const amount = Number(params.get("amount"));

    (async () => {
      if (!paymentKey || !orderId || !amount) {
        setState({ status: "error", message: "결제 정보가 올바르지 않습니다." });
        return;
      }
      // 결제 승인은 Supabase Edge Function 에서 시크릿 키로 처리
      const supabase = createClient();
      const { data, error } = await supabase.functions.invoke("payments-confirm", {
        body: { paymentKey, orderId, amount },
      });
      if (error) {
        let message = "결제 승인에 실패했습니다.";
        try {
          const body = await (error as { context?: Response }).context?.json();
          if (body?.message) message = body.message;
        } catch {}
        setState({ status: "error", message });
        return;
      }
      clear();
      setState({ status: "done", orderNo: data.order?.order_no ?? orderId, amount });
    })();
  }, [params, clear]);

  if (state.status === "loading") {
    return <p className="text-center text-muted">결제를 확인하고 있습니다…</p>;
  }

  if (state.status === "error") {
    return (
      <div className="card p-8 text-center">
        <h1 className="text-xl font-bold">결제를 완료하지 못했습니다</h1>
        <p className="mt-3 text-muted">{state.message}</p>
        <Link href="/cart" className="btn-primary mt-6">장바구니로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div className="card p-8 text-center">
      <h1 className="text-2xl font-bold text-brand-dark">주문이 완료되었습니다</h1>
      <dl className="mx-auto mt-6 grid max-w-xs grid-cols-2 gap-y-2 text-sm">
        <dt className="text-left text-muted">주문번호</dt>
        <dd className="text-right">{state.orderNo}</dd>
        <dt className="text-left text-muted">결제금액</dt>
        <dd className="text-right font-bold">{won(state.amount)}</dd>
      </dl>
      <div className="mt-8 flex justify-center gap-2">
        <Link href="/mypage/orders" className="btn-primary">주문 내역 보기</Link>
        <Link href="/products" className="btn-outline">쇼핑 계속하기</Link>
      </div>
    </div>
  );
}
