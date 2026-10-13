"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Category, Product } from "@/types/database";

type Props = { categories: Category[]; product?: Product };

function specsToText(specs: Product["specs"] | undefined) {
  return Object.entries((specs ?? {}) as Record<string, string>)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}

function textToSpecs(text: string) {
  return Object.fromEntries(
    text
      .split("\n")
      .map((line) => line.split(":"))
      .filter(([k, ...v]) => k.trim() && v.join(":").trim())
      .map(([k, ...v]) => [k.trim(), v.join(":").trim()]),
  );
}

export default function ProductForm({ categories, product }: Props) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setBusy(true);
    setError("");
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type });
    if (error) setError(`이미지 업로드 실패: ${error.message}`);
    else setImageUrl(supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl);
    setBusy(false);
  }

  async function submit(formData: FormData) {
    setBusy(true);
    setError("");
    const values = {
      name: String(formData.get("name")),
      slug: String(formData.get("slug")).trim(),
      category_id: Number(formData.get("category_id")),
      price: Number(formData.get("price")),
      stock: Number(formData.get("stock")),
      summary: String(formData.get("summary")),
      description: String(formData.get("description")),
      specs: textToSpecs(String(formData.get("specs"))),
      image_url: imageUrl || null,
      is_active: formData.get("is_active") === "on",
      is_featured: formData.get("is_featured") === "on",
    };

    const supabase = createClient();
    const { error } = product
      ? await supabase.from("products").update(values).eq("id", product.id)
      : await supabase.from("products").insert(values);

    if (error) {
      setError(error.code === "23505" ? "이미 사용 중인 주소(slug)입니다." : error.message);
      setBusy(false);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  async function remove() {
    if (!product) return;
    setBusy(true);
    const { error } = await createClient().from("products").delete().eq("id", product.id);
    if (error) {
      setError("주문 이력이 있는 상품은 삭제 대신 '판매중' 체크를 해제해 숨기세요.");
      setBusy(false);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form action={submit} className="card grid gap-4 p-6 md:grid-cols-2">
      <label className="block text-sm md:col-span-2">
        상품명
        <input name="name" required defaultValue={product?.name} className="input mt-1" />
      </label>
      <label className="block text-sm">
        주소(slug, 영문)
        <input
          name="slug"
          required
          pattern="[a-z0-9\-]+"
          title="영문 소문자, 숫자, - 만 사용"
          defaultValue={product?.slug}
          className="input mt-1"
        />
      </label>
      <label className="block text-sm">
        카테고리
        <select name="category_id" defaultValue={product?.category_id} className="input mt-1">
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        가격(원)
        <input name="price" type="number" min={0} required defaultValue={product?.price} className="input mt-1" />
      </label>
      <label className="block text-sm">
        재고
        <input name="stock" type="number" min={0} required defaultValue={product?.stock ?? 0} className="input mt-1" />
      </label>
      <label className="block text-sm md:col-span-2">
        한 줄 요약
        <input name="summary" defaultValue={product?.summary} className="input mt-1" />
      </label>
      <label className="block text-sm md:col-span-2">
        상품 설명
        <textarea name="description" rows={4} defaultValue={product?.description} className="input mt-1" />
      </label>
      <label className="block text-sm md:col-span-2">
        주요 사양 (한 줄에 하나, &quot;항목: 값&quot;)
        <textarea name="specs" rows={4} defaultValue={specsToText(product?.specs)} className="input mt-1 font-mono" />
      </label>

      <div className="text-sm md:col-span-2">
        상품 이미지
        <div className="mt-1 flex items-center gap-4">
          <div className="relative size-24 overflow-hidden rounded-lg border border-line bg-white">
            {imageUrl && <Image src={imageUrl} alt="" fill sizes="96px" className="object-contain" />}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
            className="text-sm"
          />
        </div>
      </div>

      <div className="flex gap-6 text-sm md:col-span-2">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_active" defaultChecked={product?.is_active ?? true} /> 판매중
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_featured" defaultChecked={product?.is_featured ?? false} /> 메인 추천
        </label>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 md:col-span-2">{error}</p>}

      <div className="flex gap-2 md:col-span-2">
        <button className="btn-primary" disabled={busy}>{product ? "저장" : "등록"}</button>
        <button type="button" className="btn-outline" onClick={() => router.back()}>취소</button>
        {product && (
          <button type="button" className="btn-outline ml-auto !text-red-600" disabled={busy} onClick={remove}>
            삭제
          </button>
        )}
      </div>
    </form>
  );
}
