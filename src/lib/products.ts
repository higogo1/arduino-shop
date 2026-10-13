import { createClient } from "@/lib/supabase/server";

export const PRODUCT_SORTS = {
  new: { label: "신상품순", column: "created_at", ascending: false },
  "price-asc": { label: "낮은 가격순", column: "price", ascending: true },
  "price-desc": { label: "높은 가격순", column: "price", ascending: false },
  name: { label: "이름순", column: "name", ascending: true },
} as const;
export type ProductSort = keyof typeof PRODUCT_SORTS;

export async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("sort_order");
  return data ?? [];
}

export async function getProducts(opts: { category?: string; q?: string; sort?: string; featured?: boolean } = {}) {
  const supabase = await createClient();
  const sort = PRODUCT_SORTS[(opts.sort as ProductSort) ?? "new"] ?? PRODUCT_SORTS.new;

  let query = supabase
    .from("products")
    .select("*, categories!inner(slug, name)")
    .eq("is_active", true)
    .order(sort.column, { ascending: sort.ascending });

  if (opts.category) query = query.eq("categories.slug", opts.category);
  if (opts.featured) query = query.eq("is_featured", true);
  if (opts.q) {
    const q = opts.q.replace(/[%_,()."\\]/g, "").trim();
    if (q) query = query.or(`name.ilike.%${q}%,summary.ilike.%${q}%`);
  }

  const { data } = await query;
  return data ?? [];
}

export async function getProduct(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, categories(slug, name)")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  return data;
}
