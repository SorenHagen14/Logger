import { getExercises } from '../data/db.js';
import { generateId } from './helpers.js';

const BASE_URL = 'https://sorenhagen14.github.io/Logger/';

function toBase64Url(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64Url(b64) {
  const padded = b64.replace(/-/g, '+').replace(/_/g, '/');
  return decodeURIComponent(escape(atob(padded)));
}

export function encodeWorkout(workout) {
  const allExercises = getExercises();
  const getName = (id, name) => name || allExercises.find(e => e.id === id)?.name || id;

  const payload = {
    n: workout.templateName || 'Workout',
    s: workout.startedAt,
    d: workout.completedAt,
    e: workout.exercises
      .filter(ex => ex.sets.some(s => s.completed))
      .map(ex => ({
        n: getName(ex.exerciseId, ex.exerciseName),
        u: ex.weightUnit || ex.sets[0]?.weightUnit || 'lbs',
        t: ex.sets.filter(s => s.completed).map(s => {
          const set = { w: Number(s.weight) || 0, r: Number(s.reps) || 0 };
          if (s.setType && s.setType !== 'normal') set.y = s.setType;
          if (s.rpe) set.p = s.rpe;
          return set;
        }),
      })),
  };

  return BASE_URL + '#share=' + toBase64Url(JSON.stringify(payload));
}

export function decodeShareUrl(hash) {
  if (!hash || !hash.startsWith('#share=')) return null;
  try {
    const b64 = hash.slice('#share='.length);
    const payload = JSON.parse(fromBase64Url(b64));
    return {
      id: generateId(),
      templateId: null,
      templateName: payload.n,
      startedAt: payload.s,
      completedAt: payload.d,
      shared: true,
      exercises: payload.e.map(ex => ({
        exerciseId: null,
        exerciseName: ex.n,
        weightUnit: ex.u,
        notes: [],
        sets: ex.t.map((s, i) => ({
          setNumber: i + 1,
          setType: s.y || 'normal',
          weight: s.w,
          reps: s.r,
          rpe: s.p || null,
          completed: true,
          weightUnit: ex.u,
        })),
      })),
    };
  } catch {
    return null;
  }
}

export function encodeTemplate(template) {
  const allExercises = getExercises();
  const getName = (id) => allExercises.find(e => e.id === id)?.name || id;

  const payload = {
    n: template.name || 'Untitled',
    e: (template.exercises || []).map(ex => {
      const entry = {
        i: ex.exerciseId,
        n: getName(ex.exerciseId),
        s: (ex.sets || Array.from({ length: ex.defaultSets || 3 }, () => ({ setType: 'normal' }))).map(s => {
          if (s.setType && s.setType !== 'normal') return { y: s.setType };
          return {};
        }),
      };
      if (ex.restTimerSeconds) entry.r = ex.restTimerSeconds;
      if (ex.weightUnit) entry.u = ex.weightUnit;
      if (ex.barType) entry.b = ex.barType;
      return entry;
    }),
  };

  return BASE_URL + '#tmpl=' + toBase64Url(JSON.stringify(payload));
}

export function decodeTemplateUrl(hash) {
  if (!hash || !hash.startsWith('#tmpl=')) return null;
  try {
    const b64 = hash.slice('#tmpl='.length);
    const payload = JSON.parse(fromBase64Url(b64));

    const allExercises = getExercises();
    const findExercise = (id, name) => {
      if (id) {
        const byId = allExercises.find(e => e.id === id);
        if (byId) return byId.id;
      }
      if (name) {
        const byName = allExercises.find(e => e.name.toLowerCase() === name.toLowerCase());
        if (byName) return byName.id;
      }
      return id || name;
    };

    return {
      id: generateId(),
      name: payload.n,
      shared: true,
      supersets: [],
      exercises: payload.e.map(ex => ({
        exerciseId: findExercise(ex.i, ex.n),
        defaultSets: ex.s.length,
        sets: ex.s.map(s => ({ setType: s.y || 'normal' })),
        restTimerSeconds: ex.r || null,
        weightUnit: ex.u || null,
        barType: ex.b || null,
      })),
    };
  } catch {
    return null;
  }
}

export async function shareWorkout(workout) {
  const url = encodeWorkout(workout);
  const text = `Check out my ${workout.templateName || 'workout'}`;

  if (navigator.share) {
    await navigator.share({ text, url });
    return true;
  }

  await navigator.clipboard.writeText(url);
  return false;
}

export function encodeAllTemplates(templates) {
  const allExercises = getExercises();
  const getName = (id) => allExercises.find(e => e.id === id)?.name || id;

  const payload = templates.map(template => ({
    n: template.name || 'Untitled',
    e: (template.exercises || []).map(ex => {
      const entry = {
        i: ex.exerciseId,
        n: getName(ex.exerciseId),
        s: (ex.sets || Array.from({ length: ex.defaultSets || 3 }, () => ({ setType: 'normal' }))).map(s => {
          if (s.setType && s.setType !== 'normal') return { y: s.setType };
          return {};
        }),
      };
      if (ex.restTimerSeconds) entry.r = ex.restTimerSeconds;
      if (ex.weightUnit) entry.u = ex.weightUnit;
      if (ex.barType) entry.b = ex.barType;
      return entry;
    }),
  }));

  return BASE_URL + '#tmpls=' + toBase64Url(JSON.stringify(payload));
}

export function decodeAllTemplatesUrl(hash) {
  if (!hash || !hash.startsWith('#tmpls=')) return null;
  try {
    const b64 = hash.slice('#tmpls='.length);
    const payload = JSON.parse(fromBase64Url(b64));
    if (!Array.isArray(payload)) return null;

    const allExercises = getExercises();
    const findExercise = (id, name) => {
      if (id) {
        const byId = allExercises.find(e => e.id === id);
        if (byId) return byId.id;
      }
      if (name) {
        const byName = allExercises.find(e => e.name.toLowerCase() === name.toLowerCase());
        if (byName) return byName.id;
      }
      return id || name;
    };

    return payload.map(t => ({
      id: generateId(),
      name: t.n,
      shared: true,
      supersets: [],
      exercises: t.e.map(ex => ({
        exerciseId: findExercise(ex.i, ex.n),
        defaultSets: ex.s.length,
        sets: ex.s.map(s => ({ setType: s.y || 'normal' })),
        restTimerSeconds: ex.r || null,
        weightUnit: ex.u || null,
        barType: ex.b || null,
      })),
    }));
  } catch {
    return null;
  }
}

export async function shareTemplate(template) {
  const url = encodeTemplate(template);
  const text = `Try my template: ${template.name || 'Untitled'}`;

  if (navigator.share) {
    await navigator.share({ text, url });
    return true;
  }

  await navigator.clipboard.writeText(url);
  return false;
}

export async function shareAllTemplates(templates) {
  const url = encodeAllTemplates(templates);
  const names = templates.map(t => t.name || 'Untitled');
  const text = `Check out my templates: ${names.join(', ')}`;

  if (navigator.share) {
    await navigator.share({ text, url });
    return true;
  }

  await navigator.clipboard.writeText(url);
  return false;
}
