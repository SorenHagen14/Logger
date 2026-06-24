const DB_VERSION = 1;
const STORE_NAME = 'history';

let currentUserId = null;
let dbPromise = null;

function dbName() {
  const suffix = currentUserId || 'local';
  return `wl_exercise_history_${suffix}`;
}

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName(), DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('exerciseId', 'exerciseId', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

export function setHistoryUser(userId) {
  if (userId === currentUserId) return;
  if (dbPromise) {
    dbPromise.then(db => db.close()).catch(() => {});
    dbPromise = null;
  }
  currentUserId = userId || null;
}

export async function addWorkoutToHistory(workout) {
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  for (const ex of workout.exercises) {
    const completedSets = ex.sets.filter(s => s.completed);
    if (completedSets.length === 0) continue;
    store.add({
      exerciseId: ex.exerciseId,
      exerciseName: ex.name,
      workoutId: workout.id,
      templateName: workout.templateName || '',
      date: workout.completedAt,
      sets: completedSets.map(s => ({
        setType: s.setType || 'normal',
        setNumber: s.setNumber,
        weight: Number(s.weight) || 0,
        reps: Number(s.reps) || 0,
        weightUnit: s.weightUnit || 'lbs',
      })),
    });
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

export async function getHistoryForExercise(exerciseId) {
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const index = tx.objectStore(STORE_NAME).index('exerciseId');
  const req = index.getAll(exerciseId);

  return new Promise((resolve, reject) => {
    req.onsuccess = () => {
      const results = req.result.sort((a, b) => new Date(b.date) - new Date(a.date));
      resolve(results);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getRecordsForExercise(exerciseId) {
  const history = await getHistoryForExercise(exerciseId);
  let maxWeight = 0;
  let maxReps = 0;
  for (const entry of history) {
    for (const s of entry.sets) {
      if (s.weight > maxWeight) maxWeight = s.weight;
      if (s.reps > maxReps) maxReps = s.reps;
    }
  }
  return { maxWeight, maxReps, sessions: history.length };
}

export async function backfillIfNeeded(getWorkouts) {
  const key = `wl_history_backfilled_${currentUserId || 'local'}`;
  if (localStorage.getItem(key)) return;
  const workouts = getWorkouts();
  if (workouts.length === 0) {
    localStorage.setItem(key, '1');
    return;
  }
  for (const w of workouts) {
    await addWorkoutToHistory(w);
  }
  localStorage.setItem(key, '1');
}
