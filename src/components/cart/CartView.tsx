"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { won, shippingFee, FREE_SHIPPING_MIN } from "@/lib/format";

export default function CartView() {
  const { items, ready, itemsAmount, setQuantity, remove } = useCart();

  if (!ready) return <p className="py-20 text-center text-muted">불러오는 중…</p>;

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted">장바구니가 비어 있습니다.</p>
        <Link href="/products" className="btn-primary mt-6">쇼핑 계속하기</Link>
      </div>
    );
  }

  const fee = shippingFee(itemsAmount);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <ul className="card divide-y divide-line">
        {items.map((item) => (
          <li key={item.productId} className="flex gap-4 p-4">
            <Link href={`/products/${item.slug}`} className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-line bg-white">
              {item.imageUrl && <Image src={item.imageUrl} alt={item.name} fill sizes="80px" className="object-contain p-1" />}
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <Link href={`/products/${item.slug}`} className="line-clamp-2 text-sm font-medium hover:text-brand">
                  {item.name}
                </Link>
                <p className="text-sm text-muted">{won(item.price)}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-lg border border-line">
                  <button className="px-2.5 py-1" onClick={() => setQuantity(item.productId, item.quantity - 1)} aria-label="수량 줄이기">−</button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button className="px-2.5 py-1" onClick={() => setQuantity(item.productId, item.quantity + 1)} aria-label="수량 늘리기">+</button>
                </div>
                <p className="w-24 text-right font-bold">{won(item.price * item.quantity)}</p>
                <button onClick={() => remove(item.productId)} className="text-sm text-muted hover:text-red-600" aria-label={`${item.name} 삭제`}>
                  삭제
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="card h-fit space-y-3 p-5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">상품금액</span>
          <span>{won(itemsAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">배송비</span>
          <span>{fee === 0 ? "무료" : won(fee)}</span>
        </div>
        {fee > 0 && (
          <p className="text-xs text-brand-dark">{won(FREE_SHIPPING_MIN - itemsAmount)} 더 담으면 무료배송</p>
        )}
        <div className="flex justify-between border-t border-line pt-3 text-base font-bold">
          <span>결제예정금액</span>
          <span>{won(itemsAmount + fee)}</span>
        </div>
        <Link href="/checkout" className="btn-primary w-full">주문하기</Link>
      </aside>
    </div>
  );
}
