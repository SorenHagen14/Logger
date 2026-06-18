import builtInExercises from './exercises.js';
import { syncAfterWrite } from './sync.js';

const KEYS = {
  exercises: 'wl_exercises',
  templates: 'wl_templates',
  workouts: 'wl_workouts',
  settings: 'wl_settings',
  activeWorkout: 'wl_activeWorkout',
};

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Exercises
export function getExercises() {
  const custom = read(KEYS.exercises) || [];
  return [...builtInExercises, ...custom];
}

export function getCustomExercises() {
  return read(KEYS.exercises) || [];
}

export function saveCustomExercise(exercise) {
  const custom = getCustomExercises();
  const idx = custom.findIndex(e => e.id === exercise.id);
  if (idx >= 0) custom[idx] = exercise;
  else custom.push(exercise);
  write(KEYS.exercises, custom);
  syncAfterWrite();
}

export function deleteCustomExercise(id) {
  const custom = getCustomExercises().filter(e => e.id !== id);
  write(KEYS.exercises, custom);
  syncAfterWrite();
}

// Templates
export function getTemplates() {
  return read(KEYS.templates) || [];
}

export function saveTemplate(template) {
  const templates = getTemplates();
  const idx = templates.findIndex(t => t.id === template.id);
  if (idx >= 0) templates[idx] = template;
  else templates.push(template);
  write(KEYS.templates, templates);
  syncAfterWrite();
}

export function deleteTemplate(id) {
  const templates = getTemplates().filter(t => t.id !== id);
  write(KEYS.templates, templates);
  syncAfterWrite();
}

// Workouts
export function getWorkouts() {
  return read(KEYS.workouts) || [];
}

export function saveWorkout(workout) {
  const workouts = getWorkouts();
  workouts.push(workout);
  write(KEYS.workouts, workouts);
  syncAfterWrite();
}

export function getLastWorkoutForTemplate(templateId) {
  const workouts = getWorkouts()
    .filter(w => w.templateId === templateId)
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  return workouts[0] || null;
}

export function getPreviousDataForExercise(exerciseId) {
  const workouts = getWorkouts()
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  for (const w of workouts) {
    const ex = w.exercises.find(e => e.exerciseId === exerciseId);
    if (ex) return ex.sets;
  }
  return null;
}

export function getPreviousNotesForExercise(exerciseId) {
  const workouts = getWorkouts()
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  for (const w of workouts) {
    const ex = w.exercises.find(e => e.exerciseId === exerciseId);
    if (ex?.notes?.length) return ex.notes;
  }
  return [];
}

export function getPersonalRecords(exerciseId) {
  const workouts = getWorkouts();
  let maxWeight = 0;
  let maxReps = 0;
  for (const w of workouts) {
    const ex = w.exercises.find(e => e.exerciseId === exerciseId);
    if (!ex) continue;
    for (const s of ex.sets) {
      if (s.weight > maxWeight) maxWeight = s.weight;
      if (s.reps > maxReps) maxReps = s.reps;
    }
  }
  return { maxWeight, maxReps };
}

// Settings
export function getSettings() {
  return read(KEYS.settings) || {
    defaultRestTimerSeconds: 120,
    defaultWeightUnit: 'lbs',
  };
}

export function saveSettings(settings) {
  write(KEYS.settings, settings);
  syncAfterWrite();
}

// Active workout (persist across refreshes)
export function getActiveWorkout() {
  return read(KEYS.activeWorkout);
}

export function saveActiveWorkout(workout) {
  write(KEYS.activeWorkout, workout);
}

export function clearActiveWorkout() {
  localStorage.removeItem(KEYS.activeWorkout);
}
