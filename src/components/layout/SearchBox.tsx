"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchBox() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(q.trim() ? `/products?q=${encodeURIComponent(q.trim())}` : "/products");
      }}
      className="flex w-full max-w-md overflow-hidden rounded-lg border border-line bg-background focus-within:border-brand"
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="상품 검색 (예: 우노, 센서)"
        aria-label="상품 검색"
        className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none"
      />
      <button className="px-4 text-sm font-medium text-brand">검색</button>
    </form>
  );
}
