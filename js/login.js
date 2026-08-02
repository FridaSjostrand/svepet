import { supabase } from './supabaseClient.js';

// Om man redan är inloggad, hoppa direkt vidare till kvällslistan.
const { data: existing } = await supabase.auth.getSession();
if (existing.session) {
  window.location.href = 'kvallar.html';
}

const form = document.getElementById('login-form');
const errorEl = document.getElementById('login-error');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorEl.textContent = '';

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    errorEl.textContent = 'Fel e-post eller lösenord.';
    return;
  }

  window.location.href = 'kvallar.html';
});
