import { supabase } from '../supabaseClient';

// --- Week Goals ---
export async function getWeekGoals(weekKey) {
  const { data, error } = await supabase.from('week_goals').select('*').eq('week_key', weekKey);
  if (error) throw error;
  return data;
}

export async function addWeekGoal(goal) {
  const { data, error } = await supabase.from('week_goals').insert([goal]);
  if (error) throw error;
  return data;
}

export async function updateWeekGoal(id, updates) {
  const { data, error } = await supabase.from('week_goals').update(updates).eq('id', id);
  if (error) throw error;
  return data;
}

export async function deleteWeekGoal(id) {
  const { data, error } = await supabase.from('week_goals').delete().eq('id', id);
  if (error) throw error;
  return data;
}

// --- Day Goals ---
export async function getDayGoals(date) {
  const { data, error } = await supabase.from('day_goals').select('*').eq('date', date);
  if (error) throw error;
  return data;
}

export async function addDayGoal(goal) {
  const { data, error } = await supabase.from('day_goals').insert([goal]);
  if (error) throw error;
  return data;
}

export async function updateDayGoal(id, updates) {
  const { data, error } = await supabase.from('day_goals').update(updates).eq('id', id);
  if (error) throw error;
  return data;
}

export async function deleteDayGoal(id) {
  const { data, error } = await supabase.from('day_goals').delete().eq('id', id);
  if (error) throw error;
  return data;
}
