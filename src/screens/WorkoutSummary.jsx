import { useState, useMemo } from 'react';
import { getExercises, getWorkouts, saveTemplate, getTemplates } from '../data/db.js';
import { formatDate, formatDuration } from '../utils/helpers.js';

export default function WorkoutSummary({ workout, onDone }) {
  const [saveOrder, setSaveOrder] = useState(false);
  const allExercises = getExercises();
  const getExName = (id) => allExercises.find(e => e.id === id)?.name || id;

  const prs = useMemo(() => {
    const allWorkouts = getWorkouts();
    const prList = [];
    for (const ex of workout.exercises) {
      let prevMaxWeight = 0;
      let prevMaxReps = 0;
      for (const w of allWorkouts) {
        if (w.id === workout.id) continue;
        const found = w.exercises.find(e => e.exerciseId === ex.exerciseId);
        if (!found) continue;
        for (const s of found.sets) {
          if (Number(s.weight) > prevMaxWeight) prevMaxWeight = Number(s.weight);
          if (Number(s.reps) > prevMaxReps) prevMaxReps = Number(s.reps);
        }
      }
      for (const s of ex.sets) {
        if (Number(s.weight) > prevMaxWeight && Number(s.weight) > 0) {
          prList.push({ exercise: getExName(ex.exerciseId), type: 'weight', value: `${s.weight} ${s.weightUnit || 'lbs'}` });
          break;
        }
        if (Number(s.reps) > prevMaxReps && Number(s.reps) > 0) {
          prList.push({ exercise: getExName(ex.exerciseId), type: 'reps', value: `${s.reps} reps` });
          break;
        }
      }
    }
    return prList;
  }, [workout]);

  const handleDone = () => {
    if (saveOrder && workout.templateId) {
      const templates = getTemplates();
      const template = templates.find(t => t.id === workout.templateId);
      if (template) {
        template.exercises = workout.exercises.map(ex => {
          const existing = template.exercises.find(te => te.exerciseId === ex.exerciseId);
          return existing || {
            exerciseId: ex.exerciseId,
            defaultSets: ex.sets.length,
            restTimerSeconds: null,
            weightUnit: null,
            barType: null,
          };
        });
        saveTemplate(template);
      }
    }
    onDone();
  };

  const completedSets = workout.exercises.reduce((sum, ex) =>
    sum + ex.sets.filter(s => s.completed).length, 0
  );

  return (
    <div className="screen" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>💪</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
          {workout.templateName || 'Workout'} Complete!
        </h1>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          {formatDate(workout.completedAt)}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 12,
        marginBottom: 24,
      }}>
        {[
          { label: 'Duration', value: formatDuration(workout.startedAt, workout.completedAt) },
          { label: 'Exercises', value: workout.exercises.length },
          { label: 'Sets', value: completedSets },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ textAlign: 'center', padding: 14 }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* PRs */}
      {prs.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="section-header">Personal Records 🏆</div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {prs.map((pr, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14 }}>{pr.exercise}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--yellow)' }}>{pr.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exercise Breakdown */}
      <div className="section-header">Exercises</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {workout.exercises.map((ex, i) => (
          <div key={i} className="card">
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: 'var(--accent)' }}>
              {getExName(ex.exerciseId)}
            </div>
            {ex.sets.filter(s => s.completed).map((s, j) => (
              <div key={j} style={{
                display: 'flex',
                gap: 8,
                fontSize: 14,
                color: 'var(--text-muted)',
                padding: '3px 0',
              }}>
                <span style={{ width: 24, color: 'var(--text-muted)' }}>{j + 1}.</span>
                <span>{s.weight || 0} {s.weightUnit || 'lbs'} × {s.reps || 0}</span>
                {s.rpe && <span style={{ color: 'var(--accent-light)' }}>RPE {s.rpe}</span>}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Save Order Toggle */}
      {workout.orderChanged && (
        <div className="card" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}>
          <span style={{ fontSize: 14 }}>Save new exercise order to template?</span>
          <button
            onClick={() => setSaveOrder(!saveOrder)}
            style={{
              width: 48,
              height: 28,
              borderRadius: 14,
              background: saveOrder ? 'var(--accent)' : 'var(--border)',
              position: 'relative',
              transition: 'background 0.2s',
            }}
          >
            <div style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              background: 'white',
              position: 'absolute',
              top: 3,
              left: saveOrder ? 23 : 3,
              transition: 'left 0.2s',
            }} />
          </button>
        </div>
      )}

      <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleDone}>
        Done
      </button>
    </div>
  );
}
