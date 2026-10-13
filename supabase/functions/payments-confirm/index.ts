// 토스페이먼츠 결제 승인
// 1) 로그인 사용자의 주문인지, 금액이 DB와 같은지 확인
// 2) 토스 결제 승인 API 호출
// 3) service_role 로 주문을 paid 처리하고 재고 차감
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// 실제 운영 시 대시보드 Edge Function Secrets 에 TOSS_SECRET_KEY 를 등록하세요.
// 기본값은 토스페이먼츠 공식 문서용 테스트 키입니다. (실제 결제 안 됨)
const TOSS_SECRET_KEY = Deno.env.get("TOSS_SECRET_KEY") ?? "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ message: "POST only" }, 405);

  const { paymentKey, orderId, amount } = await req.json().catch(() => ({}));
  if (!paymentKey || !orderId || typeof amount !== "number") {
    return json({ message: "잘못된 요청입니다" }, 400);
  }

  const url = Deno.env.get("SUPABASE_URL")!;
  const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return json({ message: "로그인이 필요합니다" }, 401);

  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: order } = await admin
    .from("orders")
    .select("id, user_id, status, total_amount")
    .eq("order_no", orderId)
    .single();

  if (!order || order.user_id !== user.id) return json({ message: "주문을 찾을 수 없습니다" }, 404);
  if (order.status !== "pending") return json({ message: "이미 처리된 주문입니다", order });
  if (order.total_amount !== amount) return json({ message: "결제 금액이 일치하지 않습니다" }, 400);

  const tossRes = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: "Basic " + btoa(TOSS_SECRET_KEY + ":"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });
  const tossBody = await tossRes.json();
  if (!tossRes.ok) {
    return json({ message: tossBody.message ?? "결제 승인에 실패했습니다", code: tossBody.code }, 400);
  }

  const { data: paid, error } = await admin.rpc("mark_order_paid", {
    p_order_id: order.id,
    p_payment_key: paymentKey,
    p_amount: amount,
  });
  if (error) return json({ message: error.message }, 500);

  return json({ message: "결제가 완료되었습니다", order: paid });
});
