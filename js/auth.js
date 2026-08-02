import { supabase } from './supabaseClient.js';

// Kollar att man är inloggad. Om inte, skickas man tillbaka till login.
// Returnerar den inloggade användaren om allt är ok.
export async function requireSession() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    window.location.href = 'index.html';
    return null;
  }
  return data.session.user;
}

export async function logout() {
  await supabase.auth.signOut();
  window.location.href = 'index.html';
}

export function wireLogoutButton(buttonEl) {
  buttonEl.addEventListener('click', logout);
}
