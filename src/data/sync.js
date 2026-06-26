import { supabase } from './supabase.js';

const KEYS = {
  templates: 'wl_templates',
  workouts: 'wl_workouts',
  exercises: 'wl_exercises',
  settings: 'wl_settings',
};

function readLocal(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}

// Tracks the current user ID so syncAfterWrite() doesn't need to await getSession
let _userId = null;

export function setSyncUser(id) {
  _userId = id;
}

// Called after any db write — fires and forgets, never blocks the UI
export function syncAfterWrite() {
  if (!_userId) return;
  uploadToCloud(_userId).catch(() => {});
}

export async function uploadToCloud(userId) {
  const { error } = await supabase.from('user_data').upsert({
    user_id: userId,
    templates: readLocal(KEYS.templates) || [],
    workouts: readLocal(KEYS.workouts) || [],
    custom_exercises: readLocal(KEYS.exercises) || [],
    settings: readLocal(KEYS.settings) || {},
    updated_at: new Date().toISOString(),
  });
  return !error;
}

function mergeById(local, cloud) {
  const map = new Map();
  for (const item of local) map.set(item.id, item);
  for (const item of cloud) {
    if (!map.has(item.id)) map.set(item.id, item);
  }
  return [...map.values()];
}

// Returns true if cloud had data (and it was written to localStorage)
export async function downloadFromCloud() {
  const { data, error } = await supabase
    .from('user_data')
    .select('*')
    .single();

  if (error || !data) return false;

  const hasData =
    (data.templates?.length > 0) ||
    (data.workouts?.length > 0) ||
    (data.custom_exercises?.length > 0);

  if (!hasData) return false;

  if (data.templates?.length) {
    const local = readLocal(KEYS.templates) || [];
    localStorage.setItem(KEYS.templates, JSON.stringify(mergeById(local, data.templates)));
  }
  if (data.workouts?.length) {
    const local = readLocal(KEYS.workouts) || [];
    localStorage.setItem(KEYS.workouts, JSON.stringify(mergeById(local, data.workouts)));
  }
  if (data.custom_exercises?.length) {
    const local = readLocal(KEYS.exercises) || [];
    localStorage.setItem(KEYS.exercises, JSON.stringify(mergeById(local, data.custom_exercises)));
  }
  if (data.settings && Object.keys(data.settings).length) {
    localStorage.setItem(KEYS.settings, JSON.stringify(data.settings));
  }

  return true;
}
