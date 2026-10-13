# 아두이노 마켓

아두이노 보드·센서·모듈 쇼핑몰. Next.js 16 + Supabase + 토스페이먼츠(테스트 모드).

## 실행

```bash
npm install
npm run dev        # http://localhost:3000
```

`.env.example`을 `.env.local`로 복사하고 Supabase 공개 키를 넣으세요.

## 관리자 계정 만들기

1. 사이트에서 회원가입 (확인 메일의 링크 클릭)
2. Supabase 대시보드 SQL Editor에서 실행:
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = '내이메일@example.com');
   ```
3. 다시 로그인하면 상단에 **관리자** 메뉴가 보입니다.

## 구조

| 위치 | 내용 |
|---|---|
| `src/app/(shop)` | 상품 목록·상세, 장바구니, 주문/결제 |
| `src/app/(auth)` | 로그인, 회원가입 (Server Actions) |
| `src/app/mypage` | 회원 정보, 주문 내역 |
| `src/app/admin` | 상품 등록·수정(이미지 업로드), 주문 상태 변경 |
| `src/lib/supabase` | 브라우저/서버 클라이언트, 세션 갱신(proxy) |
| `src/hooks/useCart.tsx` | 장바구니 (브라우저 localStorage) |
| `supabase/migrations` | 테이블, RLS, 주문 함수 SQL |
| `supabase/functions/payments-confirm` | 결제 승인 Edge Function |
| `supabase/seed` | 디바이스마트 기준 상품 데이터 |
| `public/images/products` | 상품 사진 (Wikimedia Commons, `CREDITS.md`) |

## 결제 흐름

1. 결제 페이지에서 `create_order` 함수로 주문 생성 — 가격·재고·배송비는 DB가 다시 계산
2. 토스 결제위젯으로 결제 요청
3. `/checkout/success` → Edge Function `payments-confirm` 이 금액을 확인하고 토스 승인 API 호출
4. 승인되면 `mark_order_paid`(서버 전용)로 결제 완료 처리 + 재고 차감

토스 키는 공식 문서용 테스트 키라 실제 결제는 일어나지 않습니다.
실제 운영 시: 토스 계약 후 `.env.local`의 클라이언트 키 교체, Supabase 대시보드 Edge Function Secrets에 `TOSS_SECRET_KEY` 등록.
