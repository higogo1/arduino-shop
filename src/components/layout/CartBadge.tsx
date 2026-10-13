"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";

export default function CartBadge() {
  const { count, ready } = useCart();
  return (
    <Link href="/cart" className="relative flex items-center gap-1 hover:text-brand">
      장바구니
      {ready && count > 0 && (
        <span className="rounded-full bg-brand px-1.5 py-0.5 text-xs font-bold text-white">{count}</span>
      )}
    </Link>
  );
}
