-- Utökade smakkategorier för rött och vitt vin (Systembolagets
-- egna smakkategorier), istället för de fyra gamla grova
-- kategorierna "vitt lätt", "vitt fylligt", "rött lätt", "rött fylligt".

-- 1. Mappa om befintliga viner till närmaste nya kategori innan den
--    nya, striktare CHECK-regeln läggs på (annars skulle migreringen
--    misslyckas om det redan finns viner med de gamla värdena).
update public.viner set kategori = 'fruktig & frisk' where kategori = 'vitt lätt';
update public.viner set kategori = 'rund & fruktig' where kategori = 'vitt fylligt';
update public.viner set kategori = 'fruktig' where kategori = 'rött lätt';
update public.viner set kategori = 'fyllig & mustig' where kategori = 'rött fylligt';

-- 2. Byt ut CHECK-regeln mot den utökade listan.
alter table public.viner drop constraint viner_kategori_check;
alter table public.viner add constraint viner_kategori_check check (kategori in (
  'mousserande',
  'fruktig & frisk', 'torr & fruktig', 'rund & fruktig',
  'rosé',
  'fruktig', 'mjukt & bärigt', 'fruktig & mustig',
  'strävt & fruktig', 'kryddig & mustig', 'fyllig & mustig',
  'sött', 'starkvin'
));
