-- ============================================================
-- SVEPET – Databastabeller + säkerhet (Row Level Security)
-- Klistras in i Supabase Dashboard -> SQL Editor -> New query -> Run
-- ============================================================

-- ----------------------------------------------------------------
-- 1. MEDLEMMAR
-- En rad per inloggat konto. id är samma id som Supabase Auth ger kontot.
-- ----------------------------------------------------------------
create table public.medlemmar (
  id uuid primary key references auth.users (id) on delete cascade,
  namn text not null,
  created_at timestamptz not null default now()
);

alter table public.medlemmar enable row level security;

-- Alla inloggade får se allas namn (behövs för att visa t.ex. "tillagd av Frida")
create policy "medlemmar_select_inloggad"
  on public.medlemmar for select
  using (auth.uid() is not null);

-- Man får bara ändra sin egen rad (t.ex. byta visningsnamn)
create policy "medlemmar_update_egen"
  on public.medlemmar for update
  using (id = auth.uid())
  with check (id = auth.uid());


-- ----------------------------------------------------------------
-- 2. KVÄLLAR
-- ----------------------------------------------------------------
create table public.kvallar (
  id uuid primary key default gen_random_uuid(),
  tema text not null,
  datum date not null,
  beskrivning text,
  skapad_av uuid references public.medlemmar (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.kvallar enable row level security;

create policy "kvallar_select_inloggad"
  on public.kvallar for select
  using (auth.uid() is not null);

create policy "kvallar_insert_inloggad"
  on public.kvallar for insert
  with check (auth.uid() is not null and skapad_av = auth.uid());

-- Bara den som skapade kvällen får redigera den (samma modell som delete)
create policy "kvallar_update_egen"
  on public.kvallar for update
  using (skapad_av = auth.uid())
  with check (skapad_av = auth.uid());

-- Bara den som skapade kvällen får ta bort den (till skillnad från
-- update ovan, som är öppen för alla 8 — borttagning är oåterkalleligt)
create policy "kvallar_delete_egen"
  on public.kvallar for delete
  using (skapad_av = auth.uid());


-- ----------------------------------------------------------------
-- 3. VINER
-- ----------------------------------------------------------------
create table public.viner (
  id uuid primary key default gen_random_uuid(),
  kvall_id uuid not null references public.kvallar (id) on delete restrict,
  tillagd_av uuid references public.medlemmar (id) on delete set null,
  namn text not null,
  producent text,
  argang integer,
  kategori text not null check (kategori in (
    'mousserande - torrt', 'mousserande - halvtorrt', 'mousserande - smaksatt',
    'mousserande - rött', 'mousserande - sött',
    'vitt - friskt & fruktigt', 'vitt - lätt & avrundat',
    'vitt - druvigt & blommigt', 'vitt - fylligt & smakrikt', 'vitt - sött',
    'rosé - friskt & bärigt', 'rosé - fruktigt & smakrikt',
    'rött - mjukt & bärigt', 'rött - stramt & nyanserat',
    'rött - fruktigt & smakrikt', 'rött - kryddigt & mustigt', 'rött - sött'
  )),
  druva text,
  land text,
  region text,
  lagring text check (lagring in ('stål', 'delvis fat', 'fatlagrat')),
  pris numeric(7,2),
  alkohol_procent numeric(4,1),
  volym_ml integer,
  bild_url text,
  systembolaget_lank text,
  beskrivning text,
  created_at timestamptz not null default now()
);

alter table public.viner enable row level security;

create policy "viner_select_inloggad"
  on public.viner for select
  using (auth.uid() is not null);

-- Man registrerar bara vin i sitt eget namn (kan inte låtsas vara någon annan)
create policy "viner_insert_egen"
  on public.viner for insert
  with check (auth.uid() is not null and tillagd_av = auth.uid());

create policy "viner_update_inloggad"
  on public.viner for update
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- Alla 8 kan ta bort vilket vin som helst (samma öppna modell som update)
create policy "viner_delete_inloggad"
  on public.viner for delete
  using (auth.uid() is not null);


-- ----------------------------------------------------------------
-- 4. BETYG
-- ----------------------------------------------------------------
create table public.betyg (
  id uuid primary key default gen_random_uuid(),
  vin_id uuid not null references public.viner (id) on delete cascade,
  medlem_id uuid not null references public.medlemmar (id) on delete cascade,
  poang numeric(2,1) not null check (poang in (1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5)),
  kommentar text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (vin_id, medlem_id)
);

alter table public.betyg enable row level security;

-- Alla ser allas betyg och kommentarer (annars går det inte att jämföra vin)
create policy "betyg_select_inloggad"
  on public.betyg for select
  using (auth.uid() is not null);

-- Man kan bara betygsätta i sitt eget namn
create policy "betyg_insert_egen"
  on public.betyg for insert
  with check (medlem_id = auth.uid());

-- Alla 8 kan ändra vilket betyg som helst (samma öppna redigeringsmodell
-- som kvällar/viner — t.ex. för att rätta till ett fel åt någon annan)
create policy "betyg_update_inloggad"
  on public.betyg for update
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- Alla 8 kan ta bort vilket betyg som helst
create policy "betyg_delete_inloggad"
  on public.betyg for delete
  using (auth.uid() is not null);


-- ----------------------------------------------------------------
-- 5. RÄTTIGHETER (GRANTS)
-- RLS-policyerna ovan styr VILKA RADER man får se/ändra, men Postgres
-- kräver separat att rollen "authenticated" (inloggade användare) ens
-- får försöka läsa/skriva i tabellen överhuvudtaget. Det brukar Supabase
-- sköta automatiskt via "Automatically expose new tables" — men det är
-- avstängt i det här projektet, så vi måste ge rättigheterna explicit.
-- Utan dessa GRANT-satser ger Supabase 403 även om RLS-policyn ovanför
-- borde släppa igenom.
-- ----------------------------------------------------------------
grant usage on schema public to authenticated;

grant select, insert, update, delete on public.medlemmar to authenticated;
grant select, insert, update, delete on public.kvallar to authenticated;
grant select, insert, update, delete on public.viner to authenticated;
grant select, insert, update, delete on public.betyg to authenticated;
