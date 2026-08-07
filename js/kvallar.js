import { supabase } from './supabaseClient.js';
import { requireSession, wireLogoutButton } from './auth.js';

const user = await requireSession();
if (user) {
  wireLogoutButton(document.getElementById('logout-btn'));
  await loadKvallar();
}

document.getElementById('toggle-new-kvall').addEventListener('click', () => {
  const card = document.getElementById('new-kvall-card');
  card.style.display = card.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('new-kvall-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const errorEl = document.getElementById('new-kvall-error');
  errorEl.textContent = '';

  const tema = document.getElementById('tema').value.trim();
  const datum = document.getElementById('datum').value;
  const beskrivning = document.getElementById('beskrivning').value.trim();

  const { error } = await supabase.from('kvallar').insert({
    tema,
    datum,
    beskrivning: beskrivning || null,
    skapad_av: user.id,
  });

  if (error) {
    errorEl.textContent = 'Kunde inte spara kvällen. Försök igen.';
    return;
  }

  document.getElementById('new-kvall-form').reset();
  document.getElementById('new-kvall-card').style.display = 'none';
  await loadKvallar();
});

async function loadKvallar() {
  const listEl = document.getElementById('kvall-list');
  const countEl = document.getElementById('kvall-count');
  const { data, error } = await supabase
    .from('kvallar')
    .select('*');

  listEl.innerHTML = '';

  if (error) {
    listEl.innerHTML = '';
    countEl.textContent = '';
    const p = document.createElement('div');
    p.className = 'empty-state';
    p.textContent = 'Kunde inte hämta kvällar just nu.';
    listEl.appendChild(p);
    return;
  }

  if (!data || data.length === 0) {
    countEl.textContent = '';
    const p = document.createElement('div');
    p.className = 'empty-state';
    p.textContent = 'Inga kvällar än — lägg till den första!';
    listEl.appendChild(p);
    return;
  }

  countEl.textContent = data.length === 1 ? '1 kväll' : `${data.length} kvällar`;

  const idag = new Date().toISOString().slice(0, 10);
  data.sort((a, b) => {
    const aKommande = a.datum >= idag;
    const bKommande = b.datum >= idag;
    if (aKommande !== bKommande) {
      return aKommande ? -1 : 1;
    }
    return aKommande ? a.datum.localeCompare(b.datum) : b.datum.localeCompare(a.datum);
  });

  for (const kvall of data) {
    const link = document.createElement('a');
    link.className = 'item-card';
    link.href = `kvall.html?id=${encodeURIComponent(kvall.id)}`;

    const title = document.createElement('h3');
    title.textContent = kvall.tema;

    const meta = document.createElement('div');
    meta.className = 'meta';
    const datumText = new Date(kvall.datum).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    meta.textContent = kvall.beskrivning ? `${datumText} · ${kvall.beskrivning}` : datumText;

    link.appendChild(title);
    link.appendChild(meta);
    listEl.appendChild(link);
  }
}
