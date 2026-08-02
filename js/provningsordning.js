// Ordningen viner bör provas i, från lättast/mildast till kraftigast,
// så att ett vin inte överröstar smaklökarna för nästa. Motiveringen
// visas som en kort förklaring per steg på kväll-sidan.
export const PROVNINGSORDNING = [
  {
    kategori: 'mousserande',
    label: 'Mousserande',
    motivering: 'Bubbel öppnar smaklökarna och känns fräscht som start, utan att dominera det som kommer sen.',
  },
  {
    kategori: 'vitt lätt',
    label: 'Vitt lätt',
    motivering: 'Lätta, syrliga vita viner skulle drunkna om de kom efter något kraftigare.',
  },
  {
    kategori: 'vitt fylligt',
    label: 'Vitt fylligt',
    motivering: 'Mer kropp och smak än de lätta vita — ett naturligt steg uppåt.',
  },
  {
    kategori: 'rosé',
    label: 'Rosé',
    motivering: 'Ligger mitt emellan vitt och rött i fyllighet, en bra brygga in i de röda vinerna.',
  },
  {
    kategori: 'rött lätt',
    label: 'Rött lätt',
    motivering: 'Mindre tanniner och fortfarande fräscht efter rosén.',
  },
  {
    kategori: 'rött fylligt',
    label: 'Rött fylligt',
    motivering: 'Mer tanniner och kropp — de tar över smaklökarna om de kommer för tidigt.',
  },
  {
    kategori: 'sött',
    label: 'Sött',
    motivering: 'Sötman skulle överrösta allt som kom efter, så söta viner avslutar provningen.',
  },
  {
    kategori: 'starkvin',
    label: 'Starkvin',
    motivering: 'Högst alkoholhalt och mest smak — det allra sista, som ett digestif.',
  },
];

const ORDER_INDEX = new Map(PROVNINGSORDNING.map((steg, i) => [steg.kategori, i]));

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
