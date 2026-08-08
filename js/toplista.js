import { supabase } from './supabaseClient.js';
import { requireSession, wireLogoutButton } from './auth.js';
import { pillClassFor } from './provningsordning.js';

const user = await requireSession();

let allaViner = [];
let aktivVy = 'svepet'; // 'svepet' | 'min'
let aktivtFargfilter = 'alla';

if (user) {
  wireLogoutButton(document.getElementById('logout-btn'));
  await laddaViner();
}

document.getElementById('vy-svepet').addEventListener('click', () => bytVy('svepet'));
document.getElementById('vy-min').addEventListener('click', () => bytVy('min'));

document.querySelectorAll('#farg-filter .filter-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    aktivtFargfilter = chip.dataset.farg;
    document.querySelectorAll('#farg-filter .filter-chip').forEach((c) => {
      c.classList.toggle('active', c === chip);
    });
    renderaTopplista();
  });
});

function bytVy(vy) {
  aktivVy = vy;
  document.getElementById('vy-svepet').classList.toggle('active', vy === 'svepet');
  document.getElementById('vy-min').classList.toggle('active', vy === 'min');
  renderaTopplista();
}

async function laddaViner() {
  const { data, error } = await supabase.from('viner').select('*, betyg (poang, medlem_id)');

  allaViner = error ? [] : data ?? [];
  renderaTopplista();
}

function huvudfarg(kategori) {
  return kategori.split(' - ')[0];
}

function renderaTopplista() {
  const listEl = document.getElementById('toplista-list');
  listEl.innerHTML = '';

  let rader;
  if (aktivVy === 'svepet') {
    rader = allaViner
      .map((vin) => {
        const betyg = vin.betyg ?? [];
        if (betyg.length === 0) return null;
        const snitt = betyg.reduce((sum, b) => sum + Number(b.poang), 0) / betyg.length;
        return { vin, snitt, antal: betyg.length };
      })
      .filter(Boolean);
  } else {
    rader = allaViner
      .map((vin) => {
        const mittBetyg = (vin.betyg ?? []).find((b) => b.medlem_id === user.id);
        if (!mittBetyg) return null;
        return { vin, snitt: Number(mittBetyg.poang), antal: 1 };
      })
      .filter(Boolean);
  }

  if (aktivtFargfilter !== 'alla') {
    rader = rader.filter((rad) => huvudfarg(rad.vin.kategori) === aktivtFargfilter);
  }

  rader.sort((a, b) => b.snitt - a.snitt);

  if (rader.length === 0) {
    const p = document.createElement('div');
    p.className = 'empty-state';
    p.textContent =
      aktivVy === 'svepet'
        ? 'Inga viner har fått betyg än.'
        : 'Du har inte betygsatt några viner än.';
    listEl.appendChild(p);
    return;
  }

  const visaAntal = aktivVy === 'svepet';
  rader.forEach((rad, index) => {
    listEl.appendChild(renderToplistaRad(rad, index + 1, visaAntal));
  });
}

function renderToplistaRad({ vin, snitt, antal }, plats, visaAntal) {
  const wrap = document.createElement('div');
  wrap.className = 'toplista-rad';

  const badge = document.createElement('div');
  badge.className = 'step-number';
  badge.textContent = plats;
  wrap.appendChild(badge);

  const link = document.createElement('a');
  link.className = 'card wine-card toplista-card';
  link.href = `kvall.html?id=${encodeURIComponent(vin.kvall_id)}`;

  const harBild = vin.bild_url && isSafeHttpUrl(vin.bild_url);

  if (harBild) {
    const media = document.createElement('div');
    media.className = 'wine-media';

    const img = document.createElement('img');
    img.className = 'wine-image';
    img.src = vin.bild_url;
    img.alt = vin.namn;

    media.appendChild(img);
    media.appendChild(renderKategoriPill(vin.kategori, true));
    link.appendChild(media);
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
    headRight.appendChild(renderKategoriPill(vin.kategori, false));
  }

  const rating = document.createElement('div');
  rating.className = 'rating-summary';
  rating.textContent = visaAntal
    ? `★ ${snitt.toFixed(1)} (${antal} ${antal === 1 ? 'röst' : 'röster'})`
    : `★ ${snitt.toFixed(1)}`;
  headRight.appendChild(rating);

  head.appendChild(titleWrap);
  head.appendChild(headRight);
  body.appendChild(head);

  const facts = document.createElement('div');
  facts.className = 'wine-facts';
  const factList = [vin.druva, vin.land].filter(Boolean);
  for (const fact of factList) {
    const span = document.createElement('span');
    span.textContent = fact;
    facts.appendChild(span);
  }
  body.appendChild(facts);

  link.appendChild(body);
  wrap.appendChild(link);

  return wrap;
}

function renderKategoriPill(kategori, flytande) {
  const pill = document.createElement('span');

  if (flytande) {
    pill.className = 'pill pill-onimage';
    const dot = document.createElement('span');
    dot.className = `pill-dot ${pillClassFor(kategori)}`;
    pill.appendChild(dot);
    const text = document.createElement('span');
    text.textContent = kategori;
    pill.appendChild(text);
    return pill;
  }

  pill.className = `pill ${pillClassFor(kategori)}`;
  pill.textContent = kategori;
  return pill;
}

function isSafeHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
