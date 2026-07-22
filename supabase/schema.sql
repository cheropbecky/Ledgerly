-- =========================================================
-- LEDGERLY — Supabase schema
-- =========================================================
-- NOTE ON AUTH: the original blueprint stored passwords as
-- plain TEXT in a custom `customers` table and checked them
-- by hand. That means anyone with read access to the table
-- (or a leaked DB dump) has every user's real password.
-- This version uses Supabase's built-in `auth.users` for
-- credential storage (hashed, sessions, password reset etc.
-- all handled for you) and a `profiles` table that just
-- extends it with app-specific fields (name, phone, role).
-- The UX (one Login screen, admin vs customer role) is the
-- same as the blueprint — just wired to the safe primitive.
-- =========================================================

-- 1. PROFILES (extends auth.users)
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    first_name text not null,
    last_name text not null,
    email text unique not null,
    phone text,
    role text not null default 'customer' check (role in ('customer', 'admin')),
    created_at timestamptz not null default timezone('utc', now())
);

-- Auto-create a profile row whenever someone signs up via Supabase Auth
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, email, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    new.email,
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. CREDIT ITEMS (STORE INVENTORY)
create table public.credit_items (
    item_id uuid default gen_random_uuid() primary key,
    name text not null,
    price numeric(10, 2) not null,
    stock_quantity int not null default 0,
    created_at timestamptz not null default timezone('utc', now())
);

-- 3. LOANS (ACTIVE RETAIL CREDITS)
create table public.loans (
    loan_id uuid default gen_random_uuid() primary key,
    customer_id uuid references public.profiles(id) on delete cascade,
    item_name text not null,
    principal_amount numeric(10, 2) not null,
    balance_remaining numeric(10, 2) not null,
    status text not null default 'Active' check (status in ('Active', 'Overdue', 'Paid')),
    issue_date timestamptz not null default timezone('utc', now()),
    due_date timestamptz not null
);

-- 4. REPAYMENTS
create table public.repayments (
    repayment_id uuid default gen_random_uuid() primary key,
    loan_id uuid references public.loans(loan_id) on delete cascade,
    amount_paid numeric(10, 2) not null,
    payment_date timestamptz not null default timezone('utc', now())
);

-- 5. CREDIT REQUESTS (CUSTOMER PORTAL QUEUE)
create table public.credit_requests (
    request_id uuid default gen_random_uuid() primary key,
    customer_id uuid references public.profiles(id) on delete cascade,
    customer_name text not null,
    item_name text not null,
    amount numeric(10, 2) not null,
    status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
    created_at timestamptz not null default timezone('utc', now())
);

-- =========================================================
-- Row Level Security
-- =========================================================
alter table public.profiles enable row level security;
alter table public.credit_items enable row level security;
alter table public.loans enable row level security;
alter table public.repayments enable row level security;
alter table public.credit_requests enable row level security;

-- helper: is the current user an admin?
create function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- profiles: user sees/edits own row; admins see all
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- credit_items: everyone can read (needed for the shop catalog); only admins write
create policy "items_select_all" on public.credit_items
  for select using (true);
create policy "items_write_admin" on public.credit_items
  for all using (public.is_admin()) with check (public.is_admin());

-- loans: customers see their own; admins see/manage all
create policy "loans_select_own_or_admin" on public.loans
  for select using (customer_id = auth.uid() or public.is_admin());
create policy "loans_write_admin" on public.loans
  for insert with check (public.is_admin());
create policy "loans_update_admin" on public.loans
  for update using (public.is_admin());

-- repayments: readable by the owning customer (via loan) or admin; written by admin
create policy "repayments_select_own_or_admin" on public.repayments
  for select using (
    public.is_admin() or
    exists (select 1 from public.loans l where l.loan_id = repayments.loan_id and l.customer_id = auth.uid())
  );
create policy "repayments_write_admin" on public.repayments
  for insert with check (public.is_admin());

-- credit_requests: customers create + read their own; admins read/update all
create policy "requests_select_own_or_admin" on public.credit_requests
  for select using (customer_id = auth.uid() or public.is_admin());
create policy "requests_insert_own" on public.credit_requests
  for insert with check (customer_id = auth.uid());
create policy "requests_update_admin" on public.credit_requests
  for update using (public.is_admin());