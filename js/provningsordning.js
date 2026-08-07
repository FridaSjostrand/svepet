// Ordningen viner bör provas i, från lättast/mildast till kraftigast,
// så att ett vin inte överröstar smaklökarna för nästa. Motiveringen
// visas som en kort förklaring per steg på kväll-sidan.
export const PROVNINGSORDNING = [
  {
    kategori: 'mousserande',
    label: 'Mousserande',
    motivering: 'Bubbel öppnar smaklökarna och känns fräscht som start, utan att dominera det som kommer sen.',
    pillClass: 'pill-guld',
  },
  {
    kategori: 'fruktig & frisk',
    label: 'Fruktig & frisk',
    motivering: 'Det lättaste och friskaste vita vinet — perfekt fortsättning efter bubblet utan att ta över.',
    pillClass: 'pill-vitt-fruktig-frisk',
  },
  {
    kategori: 'torr & fruktig',
    label: 'Torr & fruktig',
    motivering: 'Lite mer kropp än det friska, fortfarande lätt nog att inte dominera de fylligare vita vinerna som kommer efter.',
    pillClass: 'pill-vitt-torr-fruktig',
  },
  {
    kategori: 'rund & fruktig',
    label: 'Rund & fruktig',
    motivering: 'Den rundaste, fylligaste vita stilen — ett naturligt sista steg innan rosén.',
    pillClass: 'pill-vitt-rund-fruktig',
  },
  {
    kategori: 'rosé',
    label: 'Rosé',
    motivering: 'Ligger mitt emellan vitt och rött i fyllighet, en bra brygga in i de röda vinerna.',
    pillClass: 'pill-rose',
  },
  {
    kategori: 'fruktig',
    label: 'Fruktig',
    motivering: 'Det lättaste röda vinet, utan mycket tanniner — en mjuk start efter rosén.',
    pillClass: 'pill-rott-fruktig',
  },
  {
    kategori: 'mjukt & bärigt',
    label: 'Mjukt & bärigt',
    motivering: 'Fortfarande mjukt, men med lite mer djup och bärighet än det enkelt fruktiga.',
    pillClass: 'pill-rott-mjukt-barigt',
  },
  {
    kategori: 'fruktig & mustig',
    label: 'Fruktig & mustig',
    motivering: 'Mer kropp och koncentration — börjar bygga upp mot de strävare, kraftigare röda vinerna.',
    pillClass: 'pill-rott-fruktig-mustig',
  },
  {
    kategori: 'strävt & fruktig',
    label: 'Strävt & fruktig',
    motivering: 'Tanninerna märks tydligare här — kommer efter de mjukare stilarna så de inte överröstas.',
    pillClass: 'pill-rott-stravt-fruktig',
  },
  {
    kategori: 'kryddig & mustig',
    label: 'Kryddig & mustig',
    motivering: 'Kryddigt och kraftfullt, nära toppen av skalan för röda viner.',
    pillClass: 'pill-rott-kryddig-mustig',
  },
  {
    kategori: 'fyllig & mustig',
    label: 'Fyllig & mustig',
    motivering: 'Det mest kraftfulla röda vinet — tar över smaklökarna om det kommer för tidigt, så det avslutar de röda.',
    pillClass: 'pill-rott-fyllig-mustig',
  },
  {
    kategori: 'sött',
    label: 'Sött',
    motivering: 'Sötman skulle överrösta allt som kom efter, så söta viner avslutar provningen.',
    pillClass: 'pill-amber',
  },
  {
    kategori: 'starkvin',
    label: 'Starkvin',
    motivering: 'Högst alkoholhalt och mest smak — det allra sista, som ett digestif.',
    pillClass: 'pill-amber-morkt',
  },
];

const ORDER_INDEX = new Map(PROVNINGSORDNING.map((steg, i) => [steg.kategori, i]));

export function pillClassFor(kategori) {
  return PROVNINGSORDNING.find((s) => s.kategori === kategori)?.pillClass ?? 'pill';
}

// Grupperar en lista viner i provningsordning. Returnerar bara de steg
// som faktiskt har viner den här kvällen.
export function grupperaEfterProvningsordning(viner) {
  const grupper = new Map();

  for (const vin of viner) {
    if (!grupper.has(vin.kategori)) {
      grupper.set(vin.kategori, []);
    }
    grupper.get(vin.kategori).push(vin);
  }

  return [...grupper.entries()]
    .sort(([a], [b]) => ORDER_INDEX.get(a) - ORDER_INDEX.get(b))
    .map(([kategori, viner]) => {
      const steg = PROVNINGSORDNING.find((s) => s.kategori === kategori);
      return { ...steg, viner };
    });
}
