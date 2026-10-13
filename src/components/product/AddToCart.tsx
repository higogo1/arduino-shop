"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@/types/database";
import { won } from "@/lib/format";

export default function AddToCart({ product }: { product: Product }) {
  const { add } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;

  function addToCart() {
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        imageUrl: product.image_url,
        stock: product.stock,
      },
      qty,
    );
  }

  if (soldOut) {
    return <button className="btn-primary w-full" disabled>품절</button>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">수량</span>
        <div className="flex items-center rounded-lg border border-line">
          <button className="px-3 py-1.5" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="수량 줄이기">
            −
          </button>
          <span className="w-10 text-center text-sm">{qty}</span>
          <button
            className="px-3 py-1.5"
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            aria-label="수량 늘리기"
          >
            +
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-line pt-4">
        <span className="text-sm text-muted">총 상품금액</span>
        <span className="text-xl font-bold">{won(product.price * qty)}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          className="btn-outline"
          onClick={() => {
            addToCart();
            setAdded(true);
          }}
        >
          장바구니 담기
        </button>
        <button
          className="btn-primary"
          onClick={() => {
            addToCart();
            router.push("/cart");
          }}
        >
          바로 구매
        </button>
      </div>
      {added && (
        <p className="text-center text-sm text-brand-dark">
          장바구니에 담았습니다.{" "}
          <button className="underline" onClick={() => router.push("/cart")}>
            장바구니 보기
          </button>
        </p>
      )}
    </div>
  );
}
