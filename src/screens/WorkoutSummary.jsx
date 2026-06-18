import { useState, useMemo } from 'react';
import { getExercises, getWorkouts, saveTemplate, getTemplates } from '../data/db.js';
import { formatDate, formatDuration } from '../utils/helpers.js';
import { shareWorkout } from '../utils/share.js';

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
      // Scan ALL completed sets to find this workout's best
      let thisMaxWeight = 0;
      let thisMaxWeightSet = null;
      let thisMaxReps = 0;
      for (const s of ex.sets) {
        if (!s.completed) continue;
        if (Number(s.weight) > thisMaxWeight) { thisMaxWeight = Number(s.weight); thisMaxWeightSet = s; }
        if (Number(s.reps) > thisMaxReps) thisMaxReps = Number(s.reps);
      }
      if (thisMaxWeight > prevMaxWeight && thisMaxWeight > 0) {
        prList.push({ exercise: getExName(ex.exerciseId), type: 'weight', value: `${thisMaxWeight} ${thisMaxWeightSet?.weightUnit || 'lbs'}` });
      } else if (thisMaxReps > prevMaxReps && thisMaxReps > 0) {
        prList.push({ exercise: getExName(ex.exerciseId), type: 'reps', value: `${thisMaxReps} reps` });
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

  const totalVolume = workout.exercises.reduce((sum, ex) =>
    sum + ex.sets.filter(s => s.completed).reduce((sSum, s) =>
      sSum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0
    ), 0
  );

  const volumeUnit = workout.exercises.find(ex => ex.weightUnit)?.weightUnit
    || workout.exercises[0]?.sets[0]?.weightUnit
    || 'lbs';

  const stats = [
    { label: 'Duration', value: formatDuration(workout.startedAt, workout.completedAt) },
    { label: 'Sets', value: completedSets },
    { label: 'Volume', value: totalVolume.toLocaleString() + ' ' + volumeUnit },
  ];

  return (
    <div style={{
      padding: '16px',
      paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)',
      paddingBottom: '24px',
      minHeight: '100dvh',
    }}>
      {/* Hero */}
      <div style={{ marginBottom: 40 }}>
        <div className="label" style={{ marginBottom: 8, color: 'var(--accent)' }}>Complete</div>
        <h1 style={{
          fontSize: 40,
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          marginBottom: 4,
        }}>
          {workout.templateName || 'Workout'}
        </h1>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {formatDate(workout.completedAt)}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 1,
        background: 'var(--border)',
        marginBottom: 32,
        border: '1px solid var(--border)',
      }}>
        {stats.map(stat => (
          <div key={stat.label} style={{
            background: 'var(--surface)',
            textAlign: 'center',
            padding: '20px 8px',
          }}>
            <div style={{
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
              marginBottom: 6,
            }}>
              {stat.value}
            </div>
            <div className="label" style={{ margin: 0 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* PRs */}
      {prs.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div className="label" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--accent)', fontSize: 14 }}>&#x2726;</span>
            Personal Records
          </div>
          <div style={{ borderTop: '1px solid var(--border)' }}>
            {prs.map((pr, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 14 }}>{pr.exercise}</span>
                <span style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--green)',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {pr.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exercise Breakdown */}
      <div className="label" style={{ marginBottom: 12 }}>Exercises</div>
      <div style={{ marginBottom: 32 }}>
        {workout.exercises.filter(ex => ex.sets.some(s => s.completed)).map((ex, i) => (
          <div key={i} style={{
            borderTop: i === 0 ? '1px solid var(--border)' : 'none',
            borderBottom: '1px solid var(--border)',
            padding: '14px 0',
          }}>
            <div style={{
              fontSize: 13,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: 8,
            }}>
              {getExName(ex.exerciseId)}
            </div>
            {ex.sets.filter(s => s.completed).map((s, j) => (
              <div key={j} style={{
                display: 'flex',
                gap: 8,
                fontSize: 13,
                color: 'var(--text-secondary)',
                padding: '2px 0',
                fontVariantNumeric: 'tabular-nums',
              }}>
                <span style={{ width: 20, color: 'var(--text-muted)' }}>{j + 1}</span>
                <span>{s.weight || 0} {s.weightUnit || 'lbs'} × {s.reps || 0}</span>
                {s.rpe && <span style={{ color: 'var(--text-muted)' }}>RPE {s.rpe}</span>}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Save Order Toggle */}
      {workout.orderChanged && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 0',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          marginBottom: 24,
        }}>
          <span style={{ fontSize: 14 }}>Save new exercise order?</span>
          <button
            onClick={() => setSaveOrder(!saveOrder)}
            style={{
              width: 48,
              height: 28,
              background: saveOrder ? 'var(--accent)' : 'var(--border)',
              position: 'relative',
              transition: 'background 0.2s',
            }}
          >
            <div style={{
              width: 22,
              height: 22,
              background: saveOrder ? 'var(--accent-text)' : 'var(--text-muted)',
              position: 'absolute',
              top: 3,
              left: saveOrder ? 23 : 3,
              transition: 'left 0.2s, background 0.2s',
            }} />
          </button>
        </div>
      )}

      <button
        onClick={() => shareWorkout(workout)}
        style={{
          width: '100%',
          padding: '14px 0',
          fontSize: 14,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--text)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          marginBottom: 12,
        }}
      >
        Share Workout
      </button>

      <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleDone}>
        Done
      </button>
    </div>
  );
}
