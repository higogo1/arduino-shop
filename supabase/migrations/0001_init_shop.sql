-- 아두이노 쇼핑몰 기본 스키마

-- 카테고리
create table public.categories (
  id serial primary key,
  slug text not null unique,
  name text not null,
  sort_order int not null default 0
);

-- 상품
create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id int not null references public.categories(id),
  slug text not null unique,
  name text not null,
  summary text not null default '',
  description text not null default '',
  price int not null check (price >= 0),
  stock int not null default 0 check (stock >= 0),
  specs jsonb not null default '{}'::jsonb,
  image_url text,
  devicemart_no bigint,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);
create index products_category_id_idx on public.products(category_id);

-- 회원 프로필
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  address text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- 주문
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'shipping', 'delivered', 'cancelled')),
  items_amount int not null,
  shipping_fee int not null,
  total_amount int not null,
  recipient_name text not null,
  recipient_phone text not null,
  shipping_address text not null,
  payment_key text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
create index orders_user_id_idx on public.orders(user_id);

create table public.order_items (
  id bigserial primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price int not null,
  quantity int not null check (quantity > 0)
);
create index order_items_order_id_idx on public.order_items(order_id);
create index order_items_product_id_idx on public.order_items(product_id);

-- 관리자 여부
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- 회원가입 시 프로필 자동 생성
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data ->> 'name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 주문 생성: 가격과 재고는 DB 기준으로 계산 (클라이언트 가격을 믿지 않음)
-- items: [{"product_id": "...", "quantity": 2}, ...]
create function public.create_order(
  items jsonb,
  recipient_name text,
  recipient_phone text,
  shipping_address text
)
returns public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_order public.orders;
  v_item record;
  v_items_amount int := 0;
  v_shipping int;
begin
  if v_user is null then
    raise exception '로그인이 필요합니다';
  end if;
  if items is null or jsonb_array_length(items) = 0 then
    raise exception '주문할 상품이 없습니다';
  end if;

  for v_item in
    select p.id, p.name, p.price, p.stock, p.is_active, (i ->> 'quantity')::int as qty
    from jsonb_array_elements(items) i
    left join public.products p on p.id = (i ->> 'product_id')::uuid
  loop
    if v_item.id is null or not v_item.is_active then
      raise exception '판매하지 않는 상품이 포함되어 있습니다';
    end if;
    if v_item.qty is null or v_item.qty < 1 then
      raise exception '수량이 올바르지 않습니다';
    end if;
    if v_item.stock < v_item.qty then
      raise exception '재고가 부족합니다: %', v_item.name;
    end if;
    v_items_amount := v_items_amount + v_item.price * v_item.qty;
  end loop;

  -- 5만원 이상 무료배송, 미만 3,000원
  v_shipping := case when v_items_amount >= 50000 then 0 else 3000 end;

  insert into public.orders (
    order_no, user_id, items_amount, shipping_fee, total_amount,
    recipient_name, recipient_phone, shipping_address
  )
  values (
    to_char(now() at time zone 'Asia/Seoul', 'YYYYMMDDHH24MISS') || lpad(floor(random() * 10000)::text, 4, '0'),
    v_user, v_items_amount, v_shipping, v_items_amount + v_shipping,
    recipient_name, recipient_phone, shipping_address
  )
  returning * into v_order;

  insert into public.order_items (order_id, product_id, product_name, unit_price, quantity)
  select v_order.id, p.id, p.name, p.price, (i ->> 'quantity')::int
  from jsonb_array_elements(items) i
  join public.products p on p.id = (i ->> 'product_id')::uuid;

  return v_order;
end;
$$;

-- 결제 완료 처리: 결제 승인 Edge Function(service_role)만 호출
create function public.mark_order_paid(p_order_id uuid, p_payment_key text, p_amount int)
returns public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if v_order.id is null then
    raise exception '주문을 찾을 수 없습니다';
  end if;
  if v_order.status <> 'pending' then
    return v_order;
  end if;
  if v_order.total_amount <> p_amount then
    raise exception '결제 금액이 일치하지 않습니다';
  end if;

  update public.products p
  set stock = greatest(p.stock - oi.quantity, 0)
  from public.order_items oi
  where oi.order_id = p_order_id and oi.product_id = p.id;

  update public.orders
  set status = 'paid', payment_key = p_payment_key, paid_at = now()
  where id = p_order_id
  returning * into v_order;

  return v_order;
end;
$$;

revoke execute on function public.mark_order_paid(uuid, text, int) from public, anon, authenticated;
grant execute on function public.mark_order_paid(uuid, text, int) to service_role;
revoke execute on function public.create_order(jsonb, text, text, text) from public, anon;
grant execute on function public.create_order(jsonb, text, text, text) to authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- RLS
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "누구나 카테고리 조회" on public.categories
  for select to anon, authenticated using (true);
create policy "관리자 카테고리 관리" on public.categories
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "판매중 상품 조회" on public.products
  for select to anon, authenticated using (is_active or (select public.is_admin()));
create policy "관리자 상품 등록" on public.products
  for insert to authenticated with check ((select public.is_admin()));
create policy "관리자 상품 수정" on public.products
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "관리자 상품 삭제" on public.products
  for delete to authenticated using ((select public.is_admin()));

create policy "본인 프로필 조회" on public.profiles
  for select to authenticated using (id = (select auth.uid()) or (select public.is_admin()));
create policy "본인 프로필 수정" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
-- role 컬럼은 사용자가 직접 바꿀 수 없음
revoke update on public.profiles from authenticated;
grant update (name, phone, address) on public.profiles to authenticated;

create policy "본인 주문 조회" on public.orders
  for select to authenticated using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "관리자 주문 상태 변경" on public.orders
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "본인 주문상품 조회" on public.order_items
  for select to authenticated using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = (select auth.uid()) or (select public.is_admin()))
    )
  );

-- 상품 이미지 저장소
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "관리자 상품 이미지 업로드" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and (select public.is_admin()));
create policy "관리자 상품 이미지 수정" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));
create policy "관리자 상품 이미지 삭제" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));

-- 카테고리 기본값
insert into public.categories (slug, name, sort_order) values
  ('boards', '보드', 1),
  ('sensors', '센서', 2),
  ('modules', '모듈', 3),
  ('kits', '키트', 4),
  ('parts', '부품', 5);
