-- Ersätter de 13 kategorierna från förra migreringen med 17 mer
-- detaljerade smakkategorier, grupperade efter färg (mousserande,
-- vitt, rosé, rött).
--
-- VIKTIGT — dubbelkolla manuellt efteråt: den nya listan är
-- strukturerad annorlunda (fler, mer specifika kategorier) än den
-- gamla, så flera av mappningarna nedan är bästa gissningar, inte
-- exakta motsvarigheter. Kör t.ex.
--   select namn, kategori from public.viner order by kategori;
-- efteråt och rätta manuellt vid behov, särskilt för viner som var:
--   - 'mousserande'   (gissning: 'mousserande - torrt' — vi vet inte
--                       om det faktiskt var torrt, halvtorrt osv.)
--   - 'rosé'          (gissning: 'rosé - friskt & bärigt')
--   - 'sött'          (gissning: 'vitt - sött' — vi vet inte om det
--                       ursprungligen var ett vitt, rött eller
--                       mousserande sött vin)
--   - 'starkvin'       (gissning: 'rött - sött' — OBS: "Starkvin" finns
--                       inte alls som kategori i den nya 17-listan,
--                       så det här är den svagaste mappningen av alla.
--                       Säg till om du vill ha en egen Starkvin-
--                       kategori tillbaka.)

-- 1. Droppa den gamla regeln FÖRST, annars stoppar den uppdateringen
--    nedan eftersom de nya kategorinamnen inte finns i den gamla
--    listan den tillåter.
alter table public.viner drop constraint viner_kategori_check;

-- 2. Mappa om befintliga viner till närmaste nya kategori. Nu när
--    ingen regel är aktiv kan värdena tillfälligt vara "vad som helst"
--    utan att uppdateringen stoppas.
update public.viner set kategori = 'mousserande - torrt' where kategori = 'mousserande';
update public.viner set kategori = 'vitt - friskt & fruktigt' where kategori = 'fruktig & frisk';
update public.viner set kategori = 'vitt - lätt & avrundat' where kategori = 'torr & fruktig';
update public.viner set kategori = 'vitt - fylligt & smakrikt' where kategori = 'rund & fruktig';
update public.viner set kategori = 'rosé - friskt & bärigt' where kategori = 'rosé';
update public.viner set kategori = 'rött - mjukt & bärigt' where kategori = 'fruktig';
update public.viner set kategori = 'rött - mjukt & bärigt' where kategori = 'mjukt & bärigt';
update public.viner set kategori = 'rött - fruktigt & smakrikt' where kategori = 'fruktig & mustig';
update public.viner set kategori = 'rött - stramt & nyanserat' where kategori = 'strävt & fruktig';
update public.viner set kategori = 'rött - kryddigt & mustigt' where kategori = 'kryddig & mustig';
update public.viner set kategori = 'rött - kryddigt & mustigt' where kategori = 'fyllig & mustig';
update public.viner set kategori = 'vitt - sött' where kategori = 'sött';
update public.viner set kategori = 'rött - sött' where kategori = 'starkvin';

-- 3. Lägg på den nya, striktare regeln — nu när all data redan
--    matchar den nya listan går det igenom utan problem.
alter table public.viner add constraint viner_kategori_check check (kategori in (
  'mousserande - torrt', 'mousserande - halvtorrt', 'mousserande - smaksatt',
  'mousserande - rött', 'mousserande - sött',
  'vitt - friskt & fruktigt', 'vitt - lätt & avrundat',
  'vitt - druvigt & blommigt', 'vitt - fylligt & smakrikt', 'vitt - sött',
  'rosé - friskt & bärigt', 'rosé - fruktigt & smakrikt',
  'rött - mjukt & bärigt', 'rött - stramt & nyanserat',
  'rött - fruktigt & smakrikt', 'rött - kryddigt & mustigt', 'rött - sött'
));
