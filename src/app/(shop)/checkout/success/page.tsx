import type { Metadata } from "next";
import { Suspense } from "react";
import ConfirmPayment from "./ConfirmPayment";

export const metadata: Metadata = { title: "결제 확인" };

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <Suspense>
        <ConfirmPayment />
      </Suspense>
    </div>
  );
}
