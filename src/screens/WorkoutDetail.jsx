import { getExercises } from '../data/db.js';
import { formatDate, formatDuration } from '../utils/helpers.js';

export default function WorkoutDetail({ workout, onBack }) {
  const allExercises = getExercises();
  const getExName = (id) => allExercises.find(e => e.id === id)?.name || id;

  return (
    <div className="screen">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ color: 'var(--accent)', fontSize: 15, fontWeight: 500 }}>
          ← Back
        </button>
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
        {workout.templateName || 'Workout'}
      </h2>
      <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>
        {formatDate(workout.completedAt)}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
        Duration: {formatDuration(workout.startedAt, workout.completedAt)}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {workout.exercises.map((ex, i) => (
          <div key={i} className="card">
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--accent)' }}>
              {getExName(ex.exerciseId)}
            </div>

            {/* Notes */}
            {ex.notes?.map((note, ni) => (
              <div key={ni} style={{
                background: 'var(--note-bg)',
                borderRadius: 8,
                padding: '8px 12px',
                marginBottom: 8,
                fontSize: 13,
                lineHeight: 1.4,
                display: 'flex',
                gap: 6,
              }}>
                <span>{note.type === 'sticky' ? '📌' : '📝'}</span>
                <span>{note.text}</span>
              </div>
            ))}

            {/* Set Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '32px 1fr 1fr auto',
              gap: 8,
              padding: '4px 0',
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--text-muted)',
            }}>
              <span>Set</span>
              <span>Weight</span>
              <span>Reps</span>
              <span>RPE</span>
            </div>

            {ex.sets.map((s, j) => {
              const typeColors = {
                normal: 'var(--text)',
                'warm-up': 'var(--yellow)',
                failure: 'var(--red)',
                drop: 'var(--green)',
              };
              return (
                <div key={j} style={{
                  display: 'grid',
                  gridTemplateColumns: '32px 1fr 1fr auto',
                  gap: 8,
                  padding: '6px 0',
                  fontSize: 14,
                  borderTop: '1px solid var(--border)',
                }}>
                  <span style={{ color: typeColors[s.setType] || 'var(--text)', fontWeight: 600 }}>
                    {s.setType === 'warm-up' ? 'W' : s.setType === 'failure' ? 'F' : s.setType === 'drop' ? 'D' : j + 1}
                  </span>
                  <span>{s.weight || 0} {s.weightUnit || 'lbs'}</span>
                  <span>{s.reps || 0}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{s.rpe || '—'}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
