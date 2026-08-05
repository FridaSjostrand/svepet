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
    argang: numVal('argang'),
    kategori: document.getElementById('kategori').value,
    druva: textVal('druva'),
    land: textVal('land'),
    region: textVal('region'),
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

let editingVinId = null;

function openEditVinForm(vin) {
  editingVinId = vin.id;
  document.getElementById('edit-namn').value = vin.namn;
  document.getElementById('edit-argang').value = vin.argang ?? '';
  document.getElementById('edit-kategori').value = vin.kategori;
  document.getElementById('edit-druva').value = vin.druva || '';
  document.getElementById('edit-land').value = vin.land || '';
  document.getElementById('edit-region').value = vin.region || '';
  document.getElementById('edit-pris').value = vin.pris ?? '';
  document.getElementById('edit-alkohol_procent').value = vin.alkohol_procent ?? '';
  document.getElementById('edit-volym_ml').value = vin.volym_ml ?? '';
  document.getElementById('edit-bild_url').value = vin.bild_url || '';
  document.getElementById('edit-systembolaget_lank').value = vin.systembolaget_lank || '';
  document.getElementById('edit-vin-beskrivning').value = vin.beskrivning || '';
  document.getElementById('edit-vin-error').textContent = '';

  const card = document.getElementById('edit-vin-card');
  card.style.display = 'block';
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

document.getElementById('cancel-edit-vin').addEventListener('click', () => {
  document.getElementById('edit-vin-card').style.display = 'none';
  editingVinId = null;
});

document.getElementById('edit-vin-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const errorEl = document.getElementById('edit-vin-error');
  errorEl.textContent = '';

  const textVal = (id) => document.getElementById(id).value.trim() || null;
  const numVal = (id) => {
    const raw = document.getElementById(id).value;
    return raw === '' ? null : Number(raw);
  };

  const payload = {
    namn: document.getElementById('edit-namn').value.trim(),
    argang: numVal('edit-argang'),
    kategori: document.getElementById('edit-kategori').value,
    druva: textVal('edit-druva'),
    land: textVal('edit-land'),
    region: textVal('edit-region'),
    pris: numVal('edit-pris'),
    alkohol_procent: numVal('edit-alkohol_procent'),
    volym_ml: numVal('edit-volym_ml'),
    bild_url: textVal('edit-bild_url'),
    systembolaget_lank: textVal('edit-systembolaget_lank'),
    beskrivning: textVal('edit-vin-beskrivning'),
  };

  const { error } = await supabase.from('viner').update(payload).eq('id', editingVinId);

  if (error) {
    errorEl.textContent = 'Kunde inte spara ändringarna. Försök igen.';
    return;
  }

  document.getElementById('edit-vin-card').style.display = 'none';
  editingVinId = null;
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

  const actionsEl = document.getElementById('kvall-actions');
  actionsEl.innerHTML = '';
  if (data.skapad_av === user.id) {
    const row = document.createElement('div');
    row.className = 'action-row';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-ghost';
    editBtn.textContent = 'Redigera';
    editBtn.addEventListener('click', () => openEditKvallForm(data));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger';
    deleteBtn.textContent = 'Ta bort kväll';
    deleteBtn.addEventListener('click', () => handleTaBortKvall(data.tema));

    row.appendChild(editBtn);
    row.appendChild(deleteBtn);
    actionsEl.appendChild(row);
  }
}

function openEditKvallForm(data) {
  document.getElementById('edit-tema').value = data.tema;
  document.getElementById('edit-datum').value = data.datum;
  document.getElementById('edit-beskrivning').value = data.beskrivning || '';
  document.getElementById('edit-kvall-error').textContent = '';
  document.getElementById('edit-kvall-card').style.display = 'block';
}

document.getElementById('cancel-edit-kvall').addEventListener('click', () => {
  document.getElementById('edit-kvall-card').style.display = 'none';
});

document.getElementById('edit-kvall-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const errorEl = document.getElementById('edit-kvall-error');
  errorEl.textContent = '';

  const tema = document.getElementById('edit-tema').value.trim();
  const datum = document.getElementById('edit-datum').value;
  const beskrivning = document.getElementById('edit-beskrivning').value.trim();

  const { error } = await supabase
    .from('kvallar')
    .update({ tema, datum, beskrivning: beskrivning || null })
    .eq('id', kvallId);

  if (error) {
    errorEl.textContent = 'Kunde inte spara ändringarna. Försök igen.';
    return;
  }

  document.getElementById('edit-kvall-card').style.display = 'none';
  await loadKvall();
});

async function handleTaBortKvall(tema) {
  const { count, error: countError } = await supabase
    .from('viner')
    .select('id', { count: 'exact', head: true })
    .eq('kvall_id', kvallId);

  if (countError) {
    alert('Kunde inte kontrollera vinerna just nu. Försök igen.');
    return;
  }

  if (count > 0) {
    alert(
      `Den här kvällen har ${count} ${count === 1 ? 'vin' : 'viner'} kopplade och kan inte tas bort. ` +
        'Ta bort vinerna först om du vill radera hela kvällen.'
    );
    return;
  }

  if (!confirm(`Ta bort kvällen "${tema}"? Det går inte att ångra.`)) {
    return;
  }

  const { error } = await supabase.from('kvallar').delete().eq('id', kvallId);

  if (error) {
    alert('Kunde inte ta bort kvällen. Försök igen.');
    return;
  }

  window.location.href = 'kvallar.html';
}

async function handleTaBortVin(vin) {
  if (!confirm(`Ta bort vinet "${vin.namn}"? Betyg kopplade till det tas bort samtidigt. Det går inte att ångra.`)) {
    return;
  }

  const { error } = await supabase.from('viner').delete().eq('id', vin.id);

  if (error) {
    alert('Kunde inte ta bort vinet. Försök igen.');
    return;
  }

  await loadViner();
}

async function loadViner() {
  const listEl = document.getElementById('vin-list');
  const countEl = document.getElementById('vin-count');
  const { data, error } = await supabase
    .from('viner')
    .select('*, medlemmar (namn)')
    .eq('kvall_id', kvallId)
    .order('created_at', { ascending: true });

  listEl.innerHTML = '';

  if (error) {
    countEl.textContent = '';
    const p = document.createElement('div');
    p.className = 'empty-state';
    p.textContent = 'Kunde inte hämta vinerna just nu.';
    listEl.appendChild(p);
    return;
  }

  if (!data || data.length === 0) {
    countEl.textContent = '';
    const p = document.createElement('div');
    p.className = 'empty-state';
    p.textContent = 'Inga viner tillagda än — bli först!';
    listEl.appendChild(p);
    return;
  }

  countEl.textContent = data.length === 1 ? '1 vin' : `${data.length} viner`;

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

  const harBild = vin.bild_url && isSafeHttpUrl(vin.bild_url);

  if (harBild) {
    const media = document.createElement('div');
    media.className = 'wine-media';

    const img = document.createElement('img');
    img.className = 'wine-image';
    img.src = vin.bild_url;
    img.alt = vin.namn;

    media.appendChild(img);
    media.appendChild(renderKategoriPill(vin.kategori, { flytande: true }));
    card.appendChild(media);
  }

  const body = document.createElement('div');
  body.className = 'wine-body';

  const head = document.createElement('div');
  head.className = 'wine-head';

  const titleWrap = document.createElement('div');
  const title = document.createElement('h3');
  title.textContent = vin.argang ? `${vin.namn} (${vin.argang})` : vin.namn;
  titleWrap.appendChild(title);

  const headRight = document.createElement('div');
  headRight.className = 'wine-head-right';
  if (!harBild) {
    headRight.appendChild(renderKategoriPill(vin.kategori, { flytande: false }));
  }
  headRight.appendChild(renderBetygSammanfattning(betygLista));

  head.appendChild(titleWrap);
  head.appendChild(headRight);
  body.appendChild(head);

  const facts = document.createElement('div');
  facts.className = 'wine-facts';
  const factList = [
    vin.druva,
    [vin.land, vin.region].filter(Boolean).join(', '),
    vin.volym_ml ? `${vin.volym_ml} ml` : null,
    vin.alkohol_procent != null ? `${vin.alkohol_procent}%` : null,
    vin.pris != null ? `${vin.pris} kr` : null,
  ].filter(Boolean);

  for (const fact of factList) {
    const span = document.createElement('span');
    span.textContent = fact;
    facts.appendChild(span);
  }
  body.appendChild(facts);

  if (vin.beskrivning) {
    const desc = document.createElement('p');
    desc.className = 'wine-desc';
    desc.textContent = vin.beskrivning;
    body.appendChild(desc);
  }

  if (vin.systembolaget_lank && isSafeHttpUrl(vin.systembolaget_lank)) {
    const link = document.createElement('a');
    link.href = vin.systembolaget_lank;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Visa på Systembolaget';
    body.appendChild(link);
  }

  const footer = document.createElement('div');
  footer.className = 'wine-footer';
  footer.textContent = `Tillagd av ${vin.medlemmar?.namn ?? 'okänd'}`;
  body.appendChild(footer);

  const editRow = document.createElement('div');
  editRow.className = 'action-row';
  editRow.style.marginTop = '10px';

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'btn btn-ghost';
  editBtn.textContent = 'Redigera';
  editBtn.addEventListener('click', () => openEditVinForm(vin));

  const deleteVinBtn = document.createElement('button');
  deleteVinBtn.type = 'button';
  deleteVinBtn.className = 'btn btn-danger';
  deleteVinBtn.textContent = 'Ta bort vin';
  deleteVinBtn.addEventListener('click', () => handleTaBortVin(vin));

  editRow.appendChild(editBtn);
  editRow.appendChild(deleteVinBtn);
  body.appendChild(editRow);

  body.appendChild(renderBetygSektion(vin, betygLista));
  card.appendChild(body);

  return card;
}

function renderKategoriPill(kategori, { flytande }) {
  if (flytande) {
    const pill = document.createElement('span');
    pill.className = 'pill pill-onimage';

    const dot = document.createElement('span');
    dot.className = `pill-dot ${pillClassFor(kategori)}`;
    pill.appendChild(dot);

    const text = document.createElement('span');
    text.textContent = kategori;
    pill.appendChild(text);

    return pill;
  }

  const pill = document.createElement('span');
  pill.className = `pill ${pillClassFor(kategori)}`;
  pill.textContent = kategori;
  return pill;
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
