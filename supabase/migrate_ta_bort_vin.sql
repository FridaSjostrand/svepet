-- ============================================================
-- SVEPET – Alla 8 får ta bort vilket vin som helst
-- Körs EN GÅNG i Supabase Dashboard -> SQL Editor -> New query -> Run
-- (schema.sql är redan uppdaterad så en helt ny databas blir rätt
-- direkt, den här filen synkar den befintliga databasen.)
--
-- GRANT-satserna är redan koll: "delete" ingår sedan tidigare i
-- grant select, insert, update, delete on public.viner to authenticated;
-- inget att lägga till där.
--
-- Främmande nyckeln betyg.vin_id är redan "on delete cascade" sedan
-- schemat skapades (betyg försvinner automatiskt med vinet) — den
-- behöver ingen ändring, bara policyn nedan.
-- ============================================================

drop policy "viner_delete_egen" on public.viner;
create policy "viner_delete_inloggad"
  on public.viner for delete
  using (auth.uid() is not null);
