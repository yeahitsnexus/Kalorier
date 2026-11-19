create extension if not exists pg_trgm;
create table profiles(id uuid primary key references auth.users on delete cascade,
 sex text, age int, height_cm int, weight_kg numeric, target_kg numeric,
 activity numeric default 1.4, goal text default 'maintain',
 kcal_goal int, protein_pct int default 25, carb_pct int default 45, fat_pct int default 30, lang text default 'nb');
create table foods(id bigserial primary key, owner uuid references auth.users, name text not null, category text, barcode text,
 kcal numeric, protein numeric, carbs numeric, fat numeric, fiber numeric, sugar numeric, sat_fat numeric, sodium_mg numeric,
 source text default 'custom', portions jsonb default '[{"label":"1 stk","grams":100}]');
create index on foods using gin (name gin_trgm_ops);
create table meals(id bigserial primary key, user_id uuid not null references auth.users default auth.uid(), name text not null, sort int default 0, hidden bool default false);
create table entries(id bigserial primary key, user_id uuid not null references auth.users default auth.uid(),
 day date not null, meal_id bigint, food_id bigint references foods, grams numeric not null, created_at timestamptz default now());
create table exercise(id bigserial primary key, user_id uuid not null default auth.uid(), day date not null, kcal int not null, note text);
create table favorites(user_id uuid default auth.uid(), food_id bigint references foods, primary key(user_id,food_id));
create table recipes(id bigserial primary key, user_id uuid default auth.uid(), name text, servings numeric default 1, items jsonb);
alter table profiles enable row level security; alter table foods enable row level security;
alter table meals enable row level security; alter table entries enable row level security;
alter table exercise enable row level security; alter table favorites enable row level security; alter table recipes enable row level security;
create policy own_profile on profiles for all using (id=auth.uid()) with check (id=auth.uid());
create policy read_foods on foods for select using (owner is null or owner=auth.uid());
create policy write_foods on foods for all using (owner=auth.uid()) with check (owner=auth.uid());
create policy own_meals on meals for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy own_entries on entries for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy own_ex on exercise for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy own_fav on favorites for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy own_rec on recipes for all using (user_id=auth.uid()) with check (user_id=auth.uid());
-- Appen bruker faste måltids-ID 1–4 (Frokost, Lunsj, Middag, Mellommåltid) i MVP; meals-tabellen er klar for egendefinerte måltider.
