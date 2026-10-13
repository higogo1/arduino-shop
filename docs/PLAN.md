# 아두이노 쇼핑몰 — 개발 계획

> **진행 현황 (2026-10-13)**: MVP 1~7단계 완료, 배포(8단계)만 남음.
> 계획과 달라진 점
> - 장바구니는 DB 대신 브라우저 localStorage에 저장 (cart_items 테이블 없음)
> - 결제 승인은 Next.js API 대신 Supabase Edge Function `payments-confirm`에서 처리
> - Next.js 16의 Cache Components는 끄고 기존 방식으로 렌더링

## 1. 목표
아두이노 보드, 센서, 모듈, 키트, 부품을 판매하는 온라인 쇼핑몰.
기본 흐름은 상품 탐색 → 장바구니 → 결제 → 주문 확인이고, 관리자 페이지에서 상품과 주문을 관리한다.

## 2. 기술 스택
| 영역 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | Next.js (App Router) + TypeScript | 페이지와 API를 한 프로젝트에서 관리하고, SEO에 유리함 |
| 스타일 | Tailwind CSS | 빠르게 UI를 만들 수 있음 |
| DB / 인증 / 파일 | Supabase (Postgres, Auth, Storage) | 이미 MCP가 연결되어 있음 |
| 결제 | 토스페이먼츠 (테스트 키로 시작) | 국내 결제 표준 |
| 배포 | Vercel | Next.js와 궁합이 좋음 |

## 3. 기능 범위

### MVP (1차)
- 상품 목록: 카테고리 필터, 검색, 정렬
- 상품 상세: 이미지, 가격, 재고, 스펙(핀 수, 전압 등), 설명
- 장바구니: 비로그인은 localStorage, 로그인 시 DB와 동기화
- 회원가입 / 로그인 (Supabase Auth, 이메일 방식)
- 주문 및 결제 (토스페이먼츠 테스트 모드)
- 마이페이지: 주문 내역
- 관리자: 상품 CRUD, 이미지 업로드, 주문 상태 변경

### 2차
- 리뷰와 별점, 위시리스트
- 쿠폰, 배송비 정책
- 호환 부품 추천 (예: Uno에 맞는 쉴드)
- 프로젝트 키트 묶음 상품
- 카카오 / 네이버 소셜 로그인

## 4. 데이터 모델 (초안)
```
categories   (id, name, slug, parent_id)
products     (id, category_id, name, slug, description, price, stock,
              specs jsonb, images text[], is_active, created_at)
profiles     (id → auth.users, name, phone, address, role: 'user'|'admin')
cart_items   (id, user_id, product_id, quantity)
orders       (id, user_id, status: pending|paid|shipping|delivered|cancelled,
              total_amount, shipping_address jsonb, payment_key, created_at)
order_items  (id, order_id, product_id, quantity, unit_price)
```
- RLS(행 수준 보안): products와 categories는 누구나 읽을 수 있고, 수정은 admin만 가능
- cart, orders, profiles는 본인 데이터만 접근 가능

## 5. 페이지 구조
```
/                         메인 (배너, 추천/신상품)
/products                 상품 목록 (?category=&q=&sort=)
/products/[slug]          상품 상세
/cart                     장바구니
/checkout                 주문서 + 결제
/checkout/success|fail    결제 결과
/login, /signup           인증
/mypage, /mypage/orders   마이페이지
/admin/products|orders    관리자
/api/payments/confirm     결제 승인 (서버에서 금액 검증)
```

## 6. 진행 단계
1. **세팅**: Next.js + Tailwind 설치, Supabase 프로젝트 연결, 환경변수 설정
2. **DB**: 마이그레이션 작성(테이블과 RLS), 샘플 상품 시드
3. **상품**: 목록 페이지와 상세 페이지, 레이아웃(헤더, 푸터)
4. **장바구니**: 상태 관리와 장바구니 UI
5. **인증**: 로그인, 회원가입, 프로필
6. **주문/결제**: 주문 생성 → 토스 결제 → 서버 승인 → 재고 차감
7. **관리자**: 상품과 주문 관리
8. **배포**: Vercel 배포, 도메인 연결

## 7. 폴더 구조
```
electric/
├─ docs/                    기획 문서
├─ public/images/products/  정적 이미지
├─ supabase/migrations/     DB 스키마 SQL
└─ src/
   ├─ app/
   │  ├─ (shop)/            쇼핑 영역 (products, cart, checkout)
   │  ├─ (auth)/            login, signup
   │  ├─ mypage/            주문 내역
   │  ├─ admin/             관리자 (products, orders)
   │  └─ api/payments/      결제 승인 API
   ├─ components/
   │  ├─ ui/                버튼, 인풋 등 공통 컴포넌트
   │  ├─ layout/            Header, Footer
   │  ├─ product/           ProductCard, ProductGrid
   │  └─ cart/              CartItem, CartSummary
   ├─ lib/supabase/         client.ts / server.ts
   ├─ hooks/                useCart 등
   └─ types/                DB 타입
```
※ `(shop)`, `(auth)`처럼 괄호로 감싼 폴더는 Next.js 라우트 그룹이라 URL에 나타나지 않는다.
