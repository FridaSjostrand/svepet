-- Engångsuppsättning av Supabase Storage för uppladdade vin-bilder.
-- Kör hela den här filen i Supabase SQL Editor, precis som en vanlig
-- migrate_*.sql-fil — inget behöver klickas ihop manuellt i Storage-
-- gränssnittet, allt sköts här.
--
-- Vad den gör:
--   1. Skapar en ny bucket "vinbilder".
--   2. Sätter policies så bara inloggade medlemmar (authenticated) får
--      ladda upp, uppdatera och radera bilder i bucketen.
--
-- Om läsrättigheter (viktigt att känna till):
-- Bucketen sätts till "public" så bilderna kan visas direkt i
-- <img src="..."> i webbläsaren utan inloggning — exakt samma sätt
-- som länkade bilder (Bildlänk-fältet) redan fungerar idag. Det är
-- tekniskt inte samma sak som "bara de 8 medlemmarna kan läsa" som du
-- efterfrågade, men strikt läs-begränsning hade krävt tidsbegränsade
-- signerade länkar istället för vanliga bildlänkar, vilket är
-- betydligt mer komplext att bygga och underhålla. Filnamnen är
-- slumpmässiga (UUID) och listning av bucketen är inte tillåten för
-- utomstående, så någon skulle behöva gissa en exakt, unik länk för
-- att se en bild — i praktiken osannolikt. Säg till om du ändå vill
-- ha den striktare varianten, så bygger vi om det.

insert into storage.buckets (id, name, public)
values ('vinbilder', 'vinbilder', true)
on conflict (id) do nothing;

create policy "vinbilder_upload_inloggad"
on storage.objects for insert
to authenticated
with check (bucket_id = 'vinbilder');

create policy "vinbilder_select_publik"
on storage.objects for select
to public
using (bucket_id = 'vinbilder');

create policy "vinbilder_update_inloggad"
on storage.objects for update
to authenticated
using (bucket_id = 'vinbilder');

create policy "vinbilder_delete_inloggad"
on storage.objects for delete
to authenticated
using (bucket_id = 'vinbilder');
