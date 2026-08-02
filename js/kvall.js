import { supabase } from './supabaseClient.js';
import { requireSession, wireLogoutButton } from './auth.js';
import { grupperaEfterProvningsordning, pillClassFor } from './provningsordning.js';

const params = new URLSearchParams(window.location.search);
const kvallId = params.get('id');

if (!kvallId) {
  window.location.href = 'kvallar.html';
}

const user = await requireSession();
if (user) {
  wireLogoutButton(document.getElementById('logout-btn'));
  await loadKvall();
  await loadViner();
}

document.getElementById('toggle-new-vin').addEventListener('click', () => {
  const card = document.getElementById('new-vin-card');
  card.style.display = card.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('new-vin-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const errorEl = document.getElementById('new-vin-error');
  errorEl.textContent = '';

  const textVal = (id) => document.getElementById(id).value.trim() || null;
  const numVal = (id) => {
    const raw = document.getElementById(id).value;
    return raw === '' ? null : Number(raw);
  };

  const payload = {
    kvall_id: kvallId,
    tillagd_av: user.id,
    namn: document.getElementById('namn').value.trim(),
    producent: textVal('producent'),
    argang: numVal('argang'),
    kategori: document.getElementById('kategori').value,
    druva: textVal('druva'),
    land: textVal('land'),
    region: textVal('region'),
    lagring: textVal('lagring'),
    pris: numVal('pris'),
    alkohol_procent: numVal('alkohol_procent'),
    volym_ml: numVal('volym_ml'),
    bild_url: textVal('bild_url'),
    systembolaget_lank: textVal('systembolaget_lank'),
    beskrivning: textVal('vin-beskrivning'),
  };

  const { error } = await supabase.from('viner').insert(payload);

  if (error) {
    errorEl.textContent = 'Kunde inte spara vinet. Kontrollera fälten och försök igen.';
    return;
  }

  document.getElementById('new-vin-form').reset();
  document.getElementById('new-vin-card').style.display = 'none';
  await loadViner();
});

async function loadKvall() {
  const { data, error } = await supabase
    .from('kvallar')
    .select('*')
    .eq('id', kvallId)
    .single();

  if (error || !data) {
    document.getElementById('kvall-tema').textContent = 'Kvällen kunde inte hittas';
    return;
  }

  document.getElementById('kvall-tema').textContent = data.tema;
  document.getElementById('kvall-datum').textContent = new Date(data.datum).toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  document.getElementById('kvall-beskrivning').textContent = data.beskrivning || '';
}

async function loadViner() {
  const listEl = document.getElementById('vin-list');
  const { data, error } = await supabase
    .from('viner')
    .select('*, medlemmar (namn)')
    .eq('kvall_id', kvallId)
    .order('created_at', { ascending: true });

  listEl.innerHTML = '';

  if (error) {
    const p = document.createElement('div');
    p.className = 'empty-state';
    p.textContent = 'Kunde inte hämta vinerna just nu.';
    listEl.appendChild(p);
    return;
  }

  if (!data || data.length === 0) {
    const p = document.createElement('div');
    p.className = 'empty-state';
    p.textContent = 'Inga viner tillagda än — bli först!';
    listEl.appendChild(p);
    return;
  }

  const vinIds = data.map((vin) => vin.id);
  const { data: betygData } = await supabase
    .from('betyg')
    .select('*, medlemmar (namn)')
    .in('vin_id', vinIds);

  const betygPerVin = new Map();
  for (const b of betygData ?? []) {
    if (!betygPerVin.has(b.vin_id)) {
      betygPerVin.set(b.vin_id, []);
    }
    betygPerVin.get(b.vin_id).push(b);
  }

  const steg = grupperaEfterProvningsordning(data);
  steg.forEach((s, index) => {
    listEl.appendChild(renderStegHeader(s, index + 1));
    for (const vin of s.viner) {
      listEl.appendChild(renderVinCard(vin, betygPerVin.get(vin.id) ?? []));
    }
  });
}

function renderStegHeader(steg, stegnummer) {
  const wrap = document.createElement('div');
  wrap.className = 'tasting-step';

  const badge = document.createElement('div');
  badge.className = 'step-number';
  badge.textContent = stegnummer;

  const text = document.createElement('div');
  text.className = 'step-text';

  const title = document.createElement('h3');
  title.textContent = steg.label;

  const motivering = document.createElement('p');
  motivering.textContent = steg.motivering;

  text.appendChild(title);
  text.appendChild(motivering);
  wrap.appendChild(badge);
  wrap.appendChild(text);

  return wrap;
}

function renderVinCard(vin, betygLista) {
  const card = document.createElement('div');
  card.className = 'card wine-card';

  const head = document.createElement('div');
  head.className = 'wine-head';

  const titleWrap = document.createElement('div');
  const title = document.createElement('h3');
  title.textContent = vin.argang ? `${vin.namn} (${vin.argang})` : vin.namn;
  titleWrap.appendChild(title);

  if (vin.producent) {
    const producent = document.createElement('div');
    producent.className = 'meta';
    producent.textContent = vin.producent;
    titleWrap.appendChild(producent);
  }

  const pill = document.createElement('span');
  pill.className = `pill ${pillClassFor(vin.kategori)}`;
  pill.textContent = vin.kategori;

  const headRight = document.createElement('div');
  headRight.className = 'wine-head-right';
  headRight.appendChild(pill);
  headRight.appendChild(renderBetygSammanfattning(betygLista));

  head.appendChild(titleWrap);
  head.appendChild(headRight);
  card.appendChild(head);

  if (vin.bild_url && isSafeHttpUrl(vin.bild_url)) {
    const img = document.createElement('img');
    img.className = 'wine-image';
    img.src = vin.bild_url;
    img.alt = vin.namn;
    card.appendChild(img);
  }

  const facts = document.createElement('div');
  facts.className = 'wine-facts';
  const factList = [
    vin.druva,
    [vin.land, vin.region].filter(Boolean).join(', '),
    vin.lagring,
    vin.volym_ml ? `${vin.volym_ml} ml` : null,
    vin.alkohol_procent != null ? `${vin.alkohol_procent}%` : null,
    vin.pris != null ? `${vin.pris} kr` : null,
  ].filter(Boolean);

  for (const fact of factList) {
    const span = document.createElement('span');
    span.textContent = fact;
    facts.appendChild(span);
  }
  card.appendChild(facts);

  if (vin.beskrivning) {
    const desc = document.createElement('p');
    desc.className = 'wine-desc';
    desc.textContent = vin.beskrivning;
    card.appendChild(desc);
  }

  if (vin.systembolaget_lank && isSafeHttpUrl(vin.systembolaget_lank)) {
    const link = document.createElement('a');
    link.href = vin.systembolaget_lank;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Visa på Systembolaget';
    card.appendChild(link);
  }

  const footer = document.createElement('div');
  footer.className = 'wine-footer';
  footer.textContent = `Tillagd av ${vin.medlemmar?.namn ?? 'okänd'}`;
  card.appendChild(footer);

  card.appendChild(renderBetygSektion(vin, betygLista));

  return card;
}

function renderBetygSektion(vin, betygLista) {
  const wrap = document.createElement('div');
  wrap.className = 'betyg-sektion';

  const mittBetyg = betygLista.find((b) => b.medlem_id === user.id);

  const rubrik = document.createElement('h4');
  rubrik.textContent = 'Ditt betyg';
  wrap.appendChild(rubrik);

  const form = document.createElement('form');
  form.className = 'betyg-form';

  const sliderRow = document.createElement('div');
  sliderRow.className = 'betyg-slider-row';

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '1';
  slider.max = '5';
  slider.step = '0.5';
  slider.value = mittBetyg ? mittBetyg.poang : '3';

  const sliderValue = document.createElement('span');
  sliderValue.className = 'betyg-slider-value';
  sliderValue.textContent = `${Number(slider.value).toFixed(1)} / 5`;

  slider.addEventListener('input', () => {
    sliderValue.textContent = `${Number(slider.value).toFixed(1)} / 5`;
  });

  sliderRow.appendChild(slider);
  sliderRow.appendChild(sliderValue);
  form.appendChild(sliderRow);

  const kommentar = document.createElement('textarea');
  kommentar.placeholder = 'Vad tyckte du om vinet?';
  kommentar.value = mittBetyg?.kommentar ?? '';
  form.appendChild(kommentar);

  const errorEl = document.createElement('div');
  errorEl.className = 'error-text';
  form.appendChild(errorEl);

  const saveBtn = document.createElement('button');
  saveBtn.type = 'submit';
  saveBtn.className = 'btn btn-primary';
  saveBtn.textContent = mittBetyg ? 'Uppdatera betyg' : 'Spara betyg';
  form.appendChild(saveBtn);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorEl.textContent = '';

    const { error } = await supabase.from('betyg').upsert(
      {
        vin_id: vin.id,
        medlem_id: user.id,
        poang: Number(slider.value),
        kommentar: kommentar.value.trim() || null,
      },
      { onConflict: 'vin_id,medlem_id' }
    );

    if (error) {
      errorEl.textContent = 'Kunde inte spara betyget. Försök igen.';
      return;
    }

    await loadViner();
  });

  wrap.appendChild(form);

  return wrap;
}

function renderBetygSammanfattning(betygLista) {
  const el = document.createElement('div');
  el.className = 'rating-summary';

  if (betygLista.length === 0) {
    el.textContent = 'Inga betyg än';
    return el;
  }

  const snitt = betygLista.reduce((sum, b) => sum + Number(b.poang), 0) / betygLista.length;
  const rostText = betygLista.length === 1 ? 'röst' : 'röster';
  el.textContent = `★ ${snitt.toFixed(1)} (${betygLista.length} ${rostText})`;
  return el;
}

function isSafeHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
