-- ============================================================
-- SVEPET – Medlemsrader
-- Körs EFTER att ett konto skapats manuellt i Authentication -> Users.
-- Ett insert per medlem, med det User UID Supabase gav kontot.
-- ============================================================

insert into public.medlemmar (id, namn) values
  ('6e548263-3db4-4410-b790-75efd42b0bb6', 'Frida');

-- När fler medlemmar bjuds in, lägg till fler rader här, t.ex.:
-- insert into public.medlemmar (id, namn) values
--   ('<uid>', '<namn>');
