import { useContext } from 'react';
import { AppContext } from '../App.jsx';
import { getExercises } from '../data/db.js';
import { formatDate, formatDuration } from '../utils/helpers.js';
import { shareWorkout } from '../utils/share.js';

export default function WorkoutDetail({ workout, onBack }) {
  const { setEditingWorkout } = useContext(AppContext);
  const allExercises = getExercises();
  const getExName = (id, name) => name || allExercises.find(e => e.id === id)?.name || id;

  const totalCompletedSets = workout.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0
  );

  return (
    <div className="screen">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
      }}>
        <button onClick={onBack} style={{
          color: 'var(--text-muted)',
          fontSize: 22,
          padding: '8px 4px',
          lineHeight: 1,
        }}>
          &#x2190;
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={() => setEditingWorkout(workout)} style={{
            color: 'var(--text-muted)',
            fontSize: 13,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            padding: '8px 12px',
          }}>
            Edit
          </button>
          <button onClick={() => shareWorkout(workout)} style={{
            color: 'var(--text-muted)',
            fontSize: 13,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            padding: '8px 12px',
          }}>
            Share
          </button>
        </div>
      </div>

      <h2 style={{
        fontSize: 32,
        fontWeight: 800,
        letterSpacing: '-0.03em',
        textTransform: 'uppercase',
        lineHeight: 1.1,
        marginBottom: 8,
      }}>
        {workout.templateName || 'Workout'}
      </h2>

      <div style={{ marginBottom: 24 }}>
        {workout.shared && (
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--accent)',
            marginBottom: 6,
          }}>
            Shared with you
          </div>
        )}
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}>
          {formatDate(workout.completedAt)}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}>
          {formatDuration(workout.startedAt, workout.completedAt)}
          {' · '}
          {totalCompletedSets} set{totalCompletedSets !== 1 ? 's' : ''}
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border)' }}>
        {workout.exercises.map((ex, i) => {
          const completedSets = ex.sets.filter(s => s.completed);
          if (completedSets.length === 0) return null;
          return (
            <div key={i} style={{
              borderBottom: '1px solid var(--border)',
              padding: '16px 0',
            }}>
              <div style={{
                fontSize: 13,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: 10,
              }}>
                {getExName(ex.exerciseId, ex.exerciseName)}
              </div>

              {/* Notes */}
              {ex.notes?.map((note, ni) => (
                <div key={ni} style={{
                  background: 'var(--note-bg)',
                  padding: '8px 12px',
                  marginBottom: 8,
                  fontSize: 13,
                  lineHeight: 1.4,
                  borderLeft: '2px solid var(--yellow)',
                }}>
                  {note.text}
                </div>
              ))}

              {/* Set Header */}
              {(() => {
                const hasRpe = completedSets.some(s => s.rpe);
                const gridCols = hasRpe ? '32px 1fr 1fr auto' : '32px 1fr 1fr';
                const typeColors = { normal: 'var(--text)', 'warm-up': 'var(--yellow)', failure: 'var(--red)', drop: 'var(--green)' };
                return (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 8, padding: '4px 0' }}>
                      {['Set', 'Weight', 'Reps', ...(hasRpe ? ['RPE'] : [])].map((h, hi) => (
                        <span key={hi} className="label" style={{ margin: 0 }}>{h}</span>
                      ))}
                    </div>
                    {completedSets.map((s, j) => (
                      <div key={j} style={{
                        display: 'grid',
                        gridTemplateColumns: gridCols,
                        gap: 8,
                        padding: '6px 0',
                        fontSize: 14,
                        borderTop: '1px solid var(--border)',
                        fontVariantNumeric: 'tabular-nums',
                      }}>
                        <span style={{ color: typeColors[s.setType] || 'var(--text)', fontWeight: 700 }}>
                          {s.setType === 'warm-up' ? 'W' : s.setType === 'failure' ? 'F' : s.setType === 'drop' ? 'D' : (s.setNumber || j + 1)}
                        </span>
                        <span>{s.weight || 0} {s.weightUnit || 'lbs'}</span>
                        <span>{s.reps || 0}</span>
                        {hasRpe && <span style={{ color: 'var(--text-muted)' }}>{s.rpe || '—'}</span>}
                      </div>
                    ))}
                  </>
                );
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
