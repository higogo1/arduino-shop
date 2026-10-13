import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import CheckoutForm from "./CheckoutForm";

export const metadata: Metadata = { title: "주문/결제" };

export default async function CheckoutPage() {
  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/login?next=/checkout");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">주문/결제</h1>
      <CheckoutForm
        userId={user.id}
        email={user.email ?? ""}
        defaults={{
          name: profile?.name ?? "",
          phone: profile?.phone ?? "",
          address: profile?.address ?? "",
        }}
      />
    </div>
  );
}
