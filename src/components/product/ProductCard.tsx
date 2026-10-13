import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/database";
import { won } from "@/lib/format";

export default function ProductCard({ product }: { product: Product }) {
  const soldOut = product.stock <= 0;
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group card flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-square bg-white">
        {product.image_url && (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-4 transition group-hover:scale-105"
          />
        )}
        {soldOut && (
          <span className="absolute left-2 top-2 rounded bg-foreground/80 px-2 py-0.5 text-xs text-white">품절</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 border-t border-line p-3">
        <p className="line-clamp-2 text-sm font-medium">{product.name}</p>
        <p className="line-clamp-1 text-xs text-muted">{product.summary}</p>
        <p className="mt-auto pt-1 font-bold">{won(product.price)}</p>
      </div>
    </Link>
  );
}
