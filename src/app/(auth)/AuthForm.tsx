"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup, type AuthState } from "./actions";

export default function AuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(mode === "login" ? login : signup, {});
  const isLogin = mode === "login";

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-center text-2xl font-bold">{isLogin ? "로그인" : "회원가입"}</h1>
      <form action={action} className="card mt-8 space-y-4 p-6">
        <input type="hidden" name="next" value={next ?? "/"} />
        {!isLogin && (
          <label className="block text-sm">
            이름
            <input name="name" required className="input mt-1" autoComplete="name" />
          </label>
        )}
        <label className="block text-sm">
          이메일
          <input name="email" type="email" required className="input mt-1" autoComplete="email" />
        </label>
        <label className="block text-sm">
          비밀번호
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="input mt-1"
            autoComplete={isLogin ? "current-password" : "new-password"}
          />
        </label>
        {state.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
        {state.message && <p className="rounded-lg bg-brand-soft p-3 text-sm text-brand-dark">{state.message}</p>}
        <button className="btn-primary w-full" disabled={pending}>
          {pending ? "처리 중…" : isLogin ? "로그인" : "가입하기"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        {isLogin ? (
          <>
            아직 회원이 아니신가요?{" "}
            <Link href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-brand underline">
              회원가입
            </Link>
          </>
        ) : (
          <>
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-brand underline">로그인</Link>
          </>
        )}
      </p>
    </div>
  );
}
