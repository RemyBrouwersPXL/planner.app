
import { supabase } from '../supabaseClient';


// Helper om huidige gebruiker op te halen
function getCurrentUserId() {
  const user = supabase.auth.getUser();
  return user?.data?.user?.id;
}


// Week Goals
export async function getWeekGoals(weekKey) {
  const user = await supabase.auth.getUser();
  const userId = user?.data?.user?.id;
  if (!userId) return [];

  const { data, error } = await supabase
    .from('week_goals')
    .select('*')
    .eq('week_key', weekKey)
    .eq('user_id', userId) // alleen van deze gebruiker
    .order('id');
  if (error) throw error;
  return data;
}


export async function addWeekGoal(goal) {
  const user = await supabase.auth.getUser();
  const userId = user?.data?.user?.id;
  if (!userId) throw new Error("Geen ingelogde gebruiker");

  const toInsert = { ...goal, user_id: userId };
  const { data, error } = await supabase.from('week_goals').insert([toInsert]);
  if (error) throw error;
  return data;
}

export async function deleteWeekGoal(id) {
  const { data, error } = await supabase
    .from('week_goals')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return data;
}

export async function updateWeekGoal(id, updates) {
  const { data, error } = await supabase.from('week_goals').update(updates).eq('id', id);
  if (error) throw error;
  return data;
}

// Verwijder een dagdoel
export async function deleteDayGoal(id) {
  const { data, error } = await supabase
    .from('day_goals')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return data;
}
// Day Goals
export async function getDayGoals(date) {
  const user = await supabase.auth.getUser();
  const userId = user?.data?.user?.id;
  if (!userId) return [];

  const { data, error } = await supabase
    .from('day_goals')
    .select('*')
    .eq('date', date)
    .eq('user_id', userId) // alleen van deze gebruiker
    .order('id');
  if (error) throw error;
  return data;
}

export async function addDayGoal(goal) {
  const user = await supabase.auth.getUser();
  const userId = user?.data?.user?.id;
  if (!userId) throw new Error("Geen ingelogde gebruiker");

  const toInsert = { ...goal, user_id: userId };
  const { data, error } = await supabase.from('day_goals').insert([toInsert]);
  if (error) throw error;
  return data;
}


export async function updateDayGoal(id, updates) {
  const { data, error } = await supabase.from('day_goals').update(updates).eq('id', id);
  if (error) throw error;
  return data;
}

