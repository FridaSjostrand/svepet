// Ordningen viner bör provas i, från lättast/mildast till kraftigast,
// så att ett vin inte överröstar smaklökarna för nästa. Motiveringen
// visas som en kort förklaring per steg på kväll-sidan.
export const PROVNINGSORDNING = [
  {
    kategori: 'mousserande - torrt',
    label: 'Mousserande – Torrt',
    motivering: 'Det torraste och friskaste bubblet — en skarp, ren start på provningen.',
    pillClass: 'pill-mousserande-torrt',
  },
  {
    kategori: 'mousserande - halvtorrt',
    label: 'Mousserande – Halvtorrt',
    motivering: 'Lite mer sötma än det torra, men fortfarande lätt — en mjuk fortsättning.',
    pillClass: 'pill-mousserande-halvtorrt',
  },
  {
    kategori: 'mousserande - smaksatt',
    label: 'Mousserande – Smaksatt',
    motivering: 'Smaksatt bubbel har mer fyllighet och tydligare arom — sista steget bland de vita bubblen.',
    pillClass: 'pill-mousserande-smaksatt',
  },
  {
    kategori: 'mousserande - rött',
    label: 'Mousserande – Rött',
    motivering: 'Fruktigt och lättanninhaltigt trots att det är rött — bubblet gör det till en naturlig avslutning på den mousserande gruppen innan vi går vidare till still vin.',
    pillClass: 'pill-mousserande-rott',
  },
  {
    kategori: 'vitt - friskt & fruktigt',
    label: 'Vitt – Friskt & fruktigt',
    motivering: 'Det friskaste och lättaste stilla vita vinet — en skarp start efter bubblet.',
    pillClass: 'pill-vitt-friskt-fruktigt',
  },
  {
    kategori: 'vitt - lätt & avrundat',
    label: 'Vitt – Lätt & avrundat',
    motivering: 'Lika lätt som det friska, men mjukare och rundare i känslan.',
    pillClass: 'pill-vitt-latt-avrundat',
  },
  {
    kategori: 'vitt - druvigt & blommigt',
    label: 'Vitt – Druvigt & blommigt',
    motivering: 'Mer arom och karaktär — ett steg upp i intensitet från de rundare vita vinerna.',
    pillClass: 'pill-vitt-druvigt-blommigt',
  },
  {
    kategori: 'vitt - fylligt & smakrikt',
    label: 'Vitt – Fylligt & smakrikt',
    motivering: 'Det mest smakrika vita vinet — en naturlig topp innan vi går vidare till rosé.',
    pillClass: 'pill-vitt-fylligt-smakrikt',
  },
  {
    kategori: 'rosé - friskt & bärigt',
    label: 'Rosé – Friskt & bärigt',
    motivering: 'Lätt och friskt, en skonsam övergång från vitt.',
    pillClass: 'pill-rose-friskt-barigt',
  },
  {
    kategori: 'rosé - fruktigt & smakrikt',
    label: 'Rosé – Fruktigt & smakrikt',
    motivering: 'Mer fruktkoncentration än det friska — bryggan vidare mot de röda vinerna.',
    pillClass: 'pill-rose-fruktigt-smakrikt',
  },
  {
    kategori: 'rött - mjukt & bärigt',
    label: 'Rött – Mjukt & bärigt',
    motivering: 'Mjuka tanniner och bärig fruktighet — en skonsam start bland de röda vinerna.',
    pillClass: 'pill-rott-mjukt-barigt',
  },
  {
    kategori: 'rött - stramt & nyanserat',
    label: 'Rött – Stramt & nyanserat',
    motivering: 'Mer struktur och komplexitet, men fortfarande balanserat.',
    pillClass: 'pill-rott-stramt-nyanserat',
  },
  {
    kategori: 'rött - fruktigt & smakrikt',
    label: 'Rött – Fruktigt & smakrikt',
    motivering: 'Mer koncentration och kropp — bygger vidare mot de kraftigaste röda vinerna.',
    pillClass: 'pill-rott-fruktigt-smakrikt',
  },
  {
    kategori: 'rött - kryddigt & mustigt',
    label: 'Rött – Kryddigt & mustigt',
    motivering: 'Det kraftfullaste röda vinet — kryddigt och mustigt, sista steget innan sötman.',
    pillClass: 'pill-rott-kryddigt-mustigt',
  },
  {
    kategori: 'mousserande - sött',
    label: 'Mousserande – Sött',
    motivering: 'Lättast av sötvinerna, med bubblets friskhet som balans — börjar den söta avslutningen.',
    pillClass: 'pill-mousserande-sott',
  },
  {
    kategori: 'vitt - sött',
    label: 'Vitt – Sött',
    motivering: 'Klassiskt sött dessertvin — mer koncentrerat än det söta bubblet.',
    pillClass: 'pill-vitt-sott',
  },
  {
    kategori: 'rött - sött',
    label: 'Rött – Sött',
    motivering: 'Det mest kraftfulla och söta vinet — den allra sista smaken i provningen.',
    pillClass: 'pill-rott-sott',
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
