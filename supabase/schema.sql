-- =========================================================
-- ESQUEMA: Tienda de componentes de computadora
-- Ejecutar en Supabase Dashboard > SQL Editor
-- =========================================================

-- 1. CATEGORÍAS -------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

insert into public.categories (name, slug) values
  ('Procesadores', 'procesadores'),
  ('Tarjetas gráficas', 'tarjetas-graficas'),
  ('Placas madre', 'placas-madre'),
  ('Memoria RAM', 'memoria-ram'),
  ('Almacenamiento', 'almacenamiento'),
  ('Fuentes de poder', 'fuentes-de-poder'),
  ('Gabinetes', 'gabinetes'),
  ('Refrigeración', 'refrigeracion')
on conflict (slug) do nothing;

-- 2. PRODUCTOS ----------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  sku text unique not null,
  name text not null,
  brand text,
  description text,
  specs jsonb not null default '{}'::jsonb, -- ej: {"socket":"AM5","tdp":"105W"}
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'PEN',
  stock integer not null default 0 check (stock >= 0),
  image_path text, -- ruta dentro del bucket 'product-images'
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_search_idx on public.products
  using gin (to_tsvector('spanish', name || ' ' || coalesce(brand, '') || ' ' || coalesce(description, '')));

-- 3. PERFILES DE USUARIO (extiende auth.users) --------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  address text,
  created_at timestamptz not null default now()
);

-- Crea el perfil automáticamente cuando alguien se registra (email o Google)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. PEDIDOS --------------------------------------------------------
create type public.order_status as enum (
  'pendiente_pago',
  'pagado',
  'preparando',
  'enviado',
  'entregado',
  'cancelado'
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status public.order_status not null default 'pendiente_pago',
  total_cents integer not null check (total_cents >= 0),
  currency text not null default 'PEN',
  mp_preference_id text,
  mp_payment_id text,
  shipping_address text,
  tracking_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null, -- snapshot por si el producto cambia luego
  unit_price_cents integer not null,
  quantity integer not null check (quantity > 0)
);

create index if not exists orders_user_idx on public.orders(user_id);
create index if not exists order_items_order_idx on public.order_items(order_id);

-- 5. ROW LEVEL SECURITY ---------------------------------------------
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Catálogo: lectura pública
create policy "categorias visibles para todos" on public.categories
  for select using (true);

create policy "productos activos visibles para todos" on public.products
  for select using (is_active = true);

-- Perfiles: cada usuario ve y edita solo el suyo
create policy "usuario ve su propio perfil" on public.profiles
  for select using (auth.uid() = id);

create policy "usuario edita su propio perfil" on public.profiles
  for update using (auth.uid() = id);

-- Pedidos: cada usuario ve y crea solo los suyos
create policy "usuario ve sus propios pedidos" on public.orders
  for select using (auth.uid() = user_id);

create policy "usuario crea sus propios pedidos" on public.orders
  for insert with check (auth.uid() = user_id);

-- Items de pedido: visibles si el pedido es del usuario
create policy "usuario ve items de sus pedidos" on public.order_items
  for select using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

create policy "usuario crea items de sus pedidos" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

-- Nota: las actualizaciones de estado del pedido (pagado/enviado/etc.)
-- las hace el webhook de Mercado Pago usando la Service Role Key,
-- que se salta RLS. Por eso no hay policy de "update" para usuarios normales.

-- 6. FUNCIÓN: descuenta stock de forma atómica (usada por el webhook) --
create or replace function public.decrement_stock(p_product_id uuid, p_quantity integer)
returns void as $$
begin
  update public.products
  set stock = greatest(stock - p_quantity, 0)
  where id = p_product_id;
end;
$$ language plpgsql security definer;

-- 7. STORAGE: bucket de imágenes de productos ------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "lectura publica de imagenes de productos"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Solo permite subir/editar imágenes a usuarios autenticados
-- (ajusta esto si quieres restringirlo solo a un rol "admin")
create policy "usuarios autenticados suben imagenes"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');
