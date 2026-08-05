import { supabase } from './supabaseClient.js';
import { requireSession, wireLogoutButton } from './auth.js';
import { PROVNINGSORDNING } from './provningsordning.js';

const KATEGORI_LABEL = new Map(PROVNINGSORDNING.map((steg) => [steg.kategori, steg.label]));

const user = await requireSession();
if (user) {
  wireLogoutButton(document.getElementById('logout-btn'));
  await loadSmakprofil();
}

async function loadSmakprofil() {
  const rootEl = document.getElementById('smakprofil-root');

  const { data, error } = await supabase
    .from('betyg')
    .select('poang, viner (druva, land, kategori)')
    .eq('medlem_id', user.id);

  rootEl.innerHTML = '';

  if (error) {
    rootEl.appendChild(emptyState('Kunde inte hämta din smakprofil just nu.'));
    return;
  }

  if (!data || data.length === 0) {
    rootEl.appendChild(
      emptyState('Du har inte betygsatt några viner än — sätt några betyg så dyker din smakprofil upp här.')
    );
    return;
  }

  rootEl.appendChild(renderChartCard('Druvor du gillar bäst', grupperaEfterVarde(data, (r) => r.viner?.druva)));
  rootEl.appendChild(renderChartCard('Länder du gillar bäst', grupperaEfterVarde(data, (r) => r.viner?.land)));
  rootEl.appendChild(
    renderChartCard(
      'Vin-stilar du gillar bäst',
      grupperaEfterVarde(data, (r) => r.viner?.kategori, (v) => KATEGORI_LABEL.get(v) ?? capitalize(v))
    )
  );
}

function grupperaEfterVarde(rows, getRawValue, formatLabel = (v) => v) {
  const grupper = new Map();

  for (const row of rows) {
    const raw = getRawValue(row);
    if (!raw) continue;
    if (!grupper.has(raw)) {
      grupper.set(raw, []);
    }
    grupper.get(raw).push(Number(row.poang));
  }

  return [...grupper.entries()]
    .map(([raw, poangLista]) => ({
      label: formatLabel(raw),
      snitt: poangLista.reduce((sum, p) => sum + p, 0) / poangLista.length,
      antal: poangLista.length,
    }))
    .sort((a, b) => b.snitt - a.snitt || b.antal - a.antal)
    .slice(0, 8);
}

function renderChartCard(titel, rader) {
  const card = document.createElement('div');
  card.className = 'card chart-card';

  const h3 = document.createElement('h3');
  h3.textContent = titel;
  card.appendChild(h3);

  if (rader.length === 0) {
    const p = document.createElement('p');
    p.className = 'meta';
    p.textContent = 'Inte tillräckligt med data än.';
    card.appendChild(p);
    return card;
  }

  const chart = document.createElement('div');
  chart.className = 'bar-chart';

  for (const rad of rader) {
    chart.appendChild(renderBarRow(rad));
  }

  card.appendChild(chart);
  return card;
}

function renderBarRow(rad) {
  const row = document.createElement('div');
  row.className = 'bar-row';
  row.title = `${rad.label} — ${rad.snitt.toFixed(1)} / 5 (${rad.antal} betyg)`;

  const label = document.createElement('div');
  label.className = 'bar-label';
  label.textContent = rad.label;

  const track = document.createElement('div');
  track.className = 'bar-track';

  const fill = document.createElement('div');
  fill.className = 'bar-fill';
  fill.style.width = `${(rad.snitt / 5) * 100}%`;
  track.appendChild(fill);

  const value = document.createElement('div');
  value.className = 'bar-value';
  value.textContent = rad.snitt.toFixed(1);

  row.appendChild(label);
  row.appendChild(track);
  row.appendChild(value);

  return row;
}

function emptyState(text) {
  const div = document.createElement('div');
  div.className = 'empty-state';
  div.textContent = text;
  return div;
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
