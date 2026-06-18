import builtInExercises from '../data/exercises.js';
import { getCustomExercises, saveCustomExercise, saveWorkout, saveTemplate } from '../data/db.js';
import { generateId } from './helpers.js';

function parseCSVLine(line, delimiter) {
  const values = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  values.push(current.trim());
  return values;
}

function normalizeForMatch(name) {
  return name
    .toLowerCase()
    .replace(/[()]/g, ' ')
    .replace(/[-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreMatch(strongName, builtInName) {
  const a = normalizeForMatch(strongName);
  const b = normalizeForMatch(builtInName);
  if (a === b) return 1;

  const aWords = a.split(' ').filter(w => w.length > 1);
  const bWords = b.split(' ').filter(w => w.length > 1);

  let matched = 0;
  for (const w of aWords) {
    if (bWords.some(bw => bw.includes(w) || w.includes(bw))) matched++;
  }

  return matched / Math.max(aWords.length, bWords.length);
}

function findBestMatch(strongExName) {
  const allExercises = [...builtInExercises, ...getCustomExercises()];
  let best = null;
  let bestScore = 0;

  for (const ex of allExercises) {
    const score = scoreMatch(strongExName, ex.name);
    if (score > bestScore) {
      bestScore = score;
      best = ex;
    }
  }

  return bestScore >= 0.5 ? { exercise: best, score: bestScore } : null;
}

const MUSCLE_GROUP_KEYWORDS = {
  Chest: ['bench', 'chest', 'pec', 'fly', 'flye', 'push-up', 'pushup', 'dip', 'crossover'],
  Back: ['row', 'pull-up', 'pullup', 'chin-up', 'chinup', 'lat', 'deadlift', 'pulldown', 'pullover', 'back', 'shrug', 'kelso', 't bar', 'rack pull', 'trap bar'],
  Shoulders: ['shoulder', 'overhead press', 'lateral raise', 'delt', 'face pull', 'upright', 'ohp', 'military', 'reverse fly'],
  Biceps: ['curl', 'bicep'],
  Triceps: ['tricep', 'pushdown', 'skull', 'close-grip', 'kickback'],
  Quads: ['squat', 'leg press', 'leg extension', 'lunge', 'hack', 'goblet', 'split squat'],
  Hamstrings: ['rdl', 'romanian', 'leg curl', 'hamstring', 'stiff-leg', 'nordic', 'glute-ham', 'ghd'],
  Calves: ['calf', 'calve'],
  Core: ['ab', 'crunch', 'plank', 'sit-up', 'situp', 'woodchop', 'leg raise', 'rollout', 'twist'],
};

function guessMuscleGroup(name) {
  const lower = name.toLowerCase();
  for (const [group, keywords] of Object.entries(MUSCLE_GROUP_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return group;
  }
  return 'Core';
}

function mapSetType(setOrder) {
  if (setOrder === 'F') return 'failure';
  if (setOrder === 'W') return 'warm-up';
  if (setOrder === 'D') return 'drop';
  return 'normal';
}

export function parseStrongCsv(csvText) {
  const lines = csvText.split('\n').filter(l => l.trim());
  if (lines.length < 2) return { templates: [], workouts: [] };

  const firstLine = lines[0];
  const delimiter = firstLine.includes('\t') ? '\t' : firstLine.includes(';') ? ';' : ',';

  const headers = parseCSVLine(lines[0], delimiter).map(h =>
    h.replace(/^"|"$/g, '').trim()
  );

  const col = (name) => headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));
  const dateIdx = col('Date');
  const nameIdx = headers.findIndex(h => /workout\s*name/i.test(h));
  const exIdx = headers.findIndex(h => /exercise\s*name/i.test(h));
  const setOrderIdx = headers.findIndex(h => /set\s*order/i.test(h));
  const weightIdx = col('Weight');
  const repsIdx = col('Reps');
  const notesIdx = col('Notes');
  const rpeIdx = headers.findIndex(h => /^rpe$/i.test(h));

  if (nameIdx === -1 || exIdx === -1) return { templates: [], workouts: [] };

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i], delimiter);
    const setOrder = (values[setOrderIdx] || '').replace(/^"|"$/g, '');
    if (setOrder === 'Rest Timer') continue;

    const workoutName = (values[nameIdx] || '').replace(/^"|"$/g, '');
    const exerciseName = (values[exIdx] || '').replace(/^"|"$/g, '');
    if (!workoutName || !exerciseName) continue;

    rows.push({
      date: (values[dateIdx] || '').replace(/^"|"$/g, ''),
      workoutName,
      exerciseName,
      setOrder,
      weight: parseFloat(values[weightIdx]) || 0,
      reps: parseFloat(values[repsIdx]) || 0,
      notes: (values[notesIdx] || '').replace(/^"|"$/g, ''),
      rpe: rpeIdx >= 0 ? parseFloat(values[rpeIdx]) || null : null,
    });
  }

  // Group: workoutName → date → rows
  const byNameDate = {};
  for (const row of rows) {
    const key = row.workoutName;
    if (!byNameDate[key]) byNameDate[key] = {};
    if (!byNameDate[key][row.date]) byNameDate[key][row.date] = [];
    byNameDate[key][row.date].push(row);
  }

  // Build exercise match cache (resolve each Strong name once)
  const matchCache = {};
  for (const row of rows) {
    if (!(row.exerciseName in matchCache)) {
      matchCache[row.exerciseName] = findBestMatch(row.exerciseName);
    }
  }

  // Build template previews
  const templates = [];
  for (const [name, dateGroups] of Object.entries(byNameDate)) {
    const dates = Object.keys(dateGroups).sort().reverse();
    const latestRows = dateGroups[dates[0]];

    const exerciseOrder = [];
    const exerciseSets = {};
    const exerciseSetTypes = {};
    for (const row of latestRows) {
      if (!exerciseSets[row.exerciseName]) {
        exerciseOrder.push(row.exerciseName);
        exerciseSets[row.exerciseName] = 0;
        exerciseSetTypes[row.exerciseName] = [];
      }
      exerciseSets[row.exerciseName]++;
      exerciseSetTypes[row.exerciseName].push(mapSetType(row.setOrder));
    }

    const exercises = exerciseOrder.map(exName => ({
      strongName: exName,
      setCount: exerciseSets[exName],
      setTypes: exerciseSetTypes[exName],
      match: matchCache[exName]
        ? { id: matchCache[exName].exercise.id, name: matchCache[exName].exercise.name, score: matchCache[exName].score }
        : null,
    }));

    templates.push({
      name,
      exercises,
      timesCompleted: dates.length,
      dates,
    });
  }

  templates.sort((a, b) => b.timesCompleted - a.timesCompleted);

  // Build full workout list
  const workouts = [];
  for (const [name, dateGroups] of Object.entries(byNameDate)) {
    for (const [date, wRows] of Object.entries(dateGroups)) {
      const exerciseOrder = [];
      const exerciseMap = {};
      for (const row of wRows) {
        if (!exerciseMap[row.exerciseName]) {
          exerciseOrder.push(row.exerciseName);
          exerciseMap[row.exerciseName] = [];
        }
        exerciseMap[row.exerciseName].push(row);
      }

      workouts.push({
        date,
        workoutName: name,
        exercises: exerciseOrder.map(exName => ({
          strongName: exName,
          match: matchCache[exName],
          sets: exerciseMap[exName].map((r, i) => ({
            setNumber: i + 1,
            setType: mapSetType(r.setOrder),
            weight: r.weight,
            reps: r.reps,
            rpe: r.rpe,
          })),
        })),
      });
    }
  }

  workouts.sort((a, b) => new Date(a.date) - new Date(b.date));

  return { templates, workouts };
}

export function importAll(parsed, selectedIdxs) {
  // Resolve exercise IDs — create custom exercises for unmatched
  const exerciseIdMap = {};

  for (const t of parsed.templates) {
    for (const ex of t.exercises) {
      if (exerciseIdMap[ex.strongName]) continue;
      if (ex.match) {
        exerciseIdMap[ex.strongName] = ex.match.id;
      } else {
        const customId = `custom-${generateId().slice(0, 8)}`;
        saveCustomExercise({
          id: customId,
          name: ex.strongName,
          muscleGroup: guessMuscleGroup(ex.strongName),
          isBuiltIn: false,
        });
        exerciseIdMap[ex.strongName] = customId;
      }
    }
  }

  const templateIdMap = {};
  let templateCount = 0;
  let workoutCount = 0;
  const idxArray = [...selectedIdxs];

  // Create templates
  for (const idx of idxArray) {
    const t = parsed.templates[idx];
    const templateId = generateId();
    templateIdMap[t.name] = templateId;

    const lastDate = t.dates[0];

    saveTemplate({
      id: templateId,
      name: t.name,
      exercises: t.exercises.map(ex => ({
        exerciseId: exerciseIdMap[ex.strongName],
        defaultSets: ex.setCount,
        sets: ex.setTypes.map(st => ({ setType: st })),
        restTimerSeconds: null,
        weightUnit: null,
        barType: null,
      })),
      createdAt: new Date().toISOString(),
      lastCompletedAt: lastDate ? new Date(lastDate).toISOString() : null,
      supersets: [],
    });
    templateCount++;
  }

  // Import workout history for selected templates
  const selectedNames = new Set(idxArray.map(i => parsed.templates[i].name));
  for (const w of parsed.workouts) {
    if (!selectedNames.has(w.workoutName)) continue;
    const templateId = templateIdMap[w.workoutName];
    if (!templateId) continue;

    const startedAt = new Date(w.date).toISOString();

    saveWorkout({
      id: generateId(),
      templateId,
      templateName: w.workoutName,
      startedAt,
      completedAt: startedAt,
      exercises: w.exercises.map(ex => ({
        exerciseId: exerciseIdMap[ex.strongName],
        weightUnit: 'lbs',
        restTimerSeconds: null,
        barType: null,
        notes: [],
        sets: ex.sets.map(s => ({
          setNumber: s.setNumber,
          setType: s.setType,
          weight: s.weight,
          reps: s.reps,
          rpe: s.rpe,
          completed: true,
          weightUnit: 'lbs',
        })),
      })),
    });
    workoutCount++;
  }

  return { templateCount, workoutCount, exerciseCount: Object.keys(exerciseIdMap).length };
}
