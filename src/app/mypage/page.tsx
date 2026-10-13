import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "마이페이지" };

async function saveProfile(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await supabase
    .from("profiles")
    .update({
      name: String(formData.get("name")),
      phone: String(formData.get("phone")),
      address: String(formData.get("address")),
    })
    .eq("id", user.id);
  revalidatePath("/mypage");
}

export default async function MyPage() {
  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/login?next=/mypage");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">마이페이지</h1>
      <div className="mt-6 flex gap-2 text-sm">
        <span className="rounded-full bg-brand px-4 py-1.5 text-white">회원 정보</span>
        <Link href="/mypage/orders" className="rounded-full border border-line bg-surface px-4 py-1.5 hover:border-brand">
          주문 내역
        </Link>
      </div>

      <form action={saveProfile} className="card mt-6 space-y-4 p-6">
        <p className="text-sm text-muted">이메일: {user.email}</p>
        <label className="block text-sm">
          이름
          <input name="name" defaultValue={profile?.name ?? ""} className="input mt-1" />
        </label>
        <label className="block text-sm">
          연락처
          <input name="phone" defaultValue={profile?.phone ?? ""} className="input mt-1" />
        </label>
        <label className="block text-sm">
          기본 배송지
          <input name="address" defaultValue={profile?.address ?? ""} className="input mt-1" />
        </label>
        <button className="btn-primary">저장</button>
      </form>
    </div>
  );
}
