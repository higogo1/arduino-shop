"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string };

function safeNext(next: FormDataEntryValue | null) {
  const v = typeof next === "string" ? next : "";
  return v.startsWith("/") && !v.startsWith("//") ? v : "/";
}

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });
  if (error) {
    return {
      error:
        error.message === "Email not confirmed"
          ? "이메일 인증이 필요합니다. 받은 메일함을 확인해 주세요."
          : "이메일 또는 비밀번호가 올바르지 않습니다.",
    };
  }
  redirect(safeNext(formData.get("next")));
}

export async function signup(_: AuthState, formData: FormData): Promise<AuthState> {
  const password = String(formData.get("password"));
  if (password.length < 6) return { error: "비밀번호는 6자 이상이어야 합니다." };

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "";
  const { data, error } = await supabase.auth.signUp({
    email: String(formData.get("email")),
    password,
    options: {
      data: { name: String(formData.get("name")) },
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });
  if (error) return { error: error.message };

  // 이메일 인증이 꺼져 있으면 바로 로그인됨
  if (data.session) redirect("/");
  return { message: "가입 확인 메일을 보냈습니다. 메일의 링크를 누르면 가입이 완료됩니다." };
}
