import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "결제 실패" };

export default async function CheckoutFailPage({ searchParams }: PageProps<"/checkout/fail">) {
  const sp = await searchParams;
  const message = typeof sp.message === "string" ? sp.message : "결제가 취소되었거나 실패했습니다.";

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="card p-8 text-center">
        <h1 className="text-xl font-bold">결제에 실패했습니다</h1>
        <p className="mt-3 text-muted">{message}</p>
        <Link href="/checkout" className="btn-primary mt-6">다시 결제하기</Link>
      </div>
    </div>
  );
}
