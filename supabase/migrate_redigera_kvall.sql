-- ============================================================
-- SVEPET – Bara skaparen får redigera en kväll
-- Körs EN GÅNG i Supabase Dashboard -> SQL Editor -> New query -> Run
-- (schema.sql är redan uppdaterad så en helt ny databas blir rätt
-- direkt, den här filen synkar den befintliga databasen.)
--
-- GRANT-satserna är redan koll: "update" ingår sedan tidigare i
-- grant select, insert, update, delete on public.kvallar to authenticated;
-- inget att lägga till där, bara policyn nedan behöver bytas.
-- ============================================================

drop policy "kvallar_update_inloggad" on public.kvallar;
create policy "kvallar_update_egen"
  on public.kvallar for update
  using (skapad_av = auth.uid())
  with check (skapad_av = auth.uid());
