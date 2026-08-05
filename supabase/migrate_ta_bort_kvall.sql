-- ============================================================
-- SVEPET – Bara skaparen får ta bort en kväll, och bara om den är tom
-- Körs EN GÅNG i Supabase Dashboard -> SQL Editor -> New query -> Run
-- (schema.sql är redan uppdaterad så en helt ny databas blir rätt
-- direkt, den här filen synkar den befintliga databasen.)
-- ============================================================

-- 1. Byt DELETE-policyn: från "alla 8" till "bara skaparen"
drop policy "kvallar_delete_inloggad" on public.kvallar;
create policy "kvallar_delete_egen"
  on public.kvallar for delete
  using (skapad_av = auth.uid());

-- 2. Blockera borttagning av en kväll som fortfarande har viner kopplade.
-- Om denna rad ger felet "constraint does not exist", säg till mig så
-- kollar vi det exakta namnet i Table Editor -> viner -> kvall_id.
alter table public.viner drop constraint viner_kvall_id_fkey;
alter table public.viner
  add constraint viner_kvall_id_fkey
  foreign key (kvall_id) references public.kvallar (id) on delete restrict;
