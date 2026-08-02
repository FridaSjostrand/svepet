-- ============================================================
-- SVEPET – Öppna upp redigering/borttagning av betyg för alla 8
-- Körs EN GÅNG i Supabase Dashboard -> SQL Editor -> New query -> Run
-- (schema.sql är redan uppdaterad så en helt ny databas blir rätt
-- direkt, men den befintliga databasen behöver den här ändringen
-- separat eftersom policies inte uppdateras genom att bara ändra filen.)
-- ============================================================

drop policy "betyg_update_egen" on public.betyg;
create policy "betyg_update_inloggad"
  on public.betyg for update
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy "betyg_delete_egen" on public.betyg;
create policy "betyg_delete_inloggad"
  on public.betyg for delete
  using (auth.uid() is not null);
