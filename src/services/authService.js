import { supabase } from '../supabaseClient';

// Registreren
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

// Inloggen
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// Uitloggen
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Huidige gebruiker
export function getUser() {
  return supabase.auth.getUser();
}
