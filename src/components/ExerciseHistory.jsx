import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getHistoryForExercise, getRecordsForExercise } from '../data/historyDb.js';
import { formatDate } from '../utils/helpers.js';

export default function ExerciseHistory({ exercise, onClose }) {
  const [history, setHistory] = useState(null);
  const [prs, setPrs] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getHistoryForExercise(exercise.id),
      getRecordsForExercise(exercise.id),
    ]).then(([h, r]) => {
      if (!cancelled) { setHistory(h); setPrs(r); }
    });
    return () => { cancelled = true; };
  }, [exercise.id]);

  const typeColors = {
    normal: 'var(--text)',
    'warm-up': 'var(--yellow)',
    failure: 'var(--red)',
    drop: 'var(--green)',
  };

  const loading = history === null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 16,
        }}>
          <div>
            <h3 style={{
              fontSize: 18,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              lineHeight: 1.2,
            }}>
              {exercise.name}
            </h3>
            <div className="label" style={{ marginTop: 4 }}>
              {exercise.muscleGroup}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              color: 'var(--text-muted)',
              fontSize: 22,
              padding: '4px 8px',
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>

        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '32px 0',
            color: 'var(--text-muted)',
            fontSize: 14,
          }}>
            Loading...
          </div>
        ) : (
          <>
            {/* PR Banner */}
            {prs && (prs.maxWeight > 0 || prs.maxReps > 0) && (
              <div style={{
                display: 'flex',
                gap: 16,
                padding: '12px 0',
                borderTop: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                marginBottom: 16,
              }}>
                {prs.maxWeight > 0 && (
                  <div>
                    <div className="label" style={{ margin: 0, marginBottom: 2 }}>Best Weight</div>
                    <div style={{
                      fontSize: 24,
                      fontWeight: 800,
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {prs.maxWeight}
                    </div>
                  </div>
                )}
                {prs.maxReps > 0 && (
                  <div>
                    <div className="label" style={{ margin: 0, marginBottom: 2 }}>Best Reps</div>
                    <div style={{
                      fontSize: 24,
                      fontWeight: 800,
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {prs.maxReps}
                    </div>
                  </div>
                )}
                <div>
                  <div className="label" style={{ margin: 0, marginBottom: 2 }}>Sessions</div>
                  <div style={{
                    fontSize: 24,
                    fontWeight: 800,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {prs.sessions}
                  </div>
                </div>
              </div>
            )}

            {/* History */}
            {history.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '32px 0',
                color: 'var(--text-muted)',
                fontSize: 14,
              }}>
                No history yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {history.map((entry, i) => (
                  <div key={i} style={{
                    padding: '12px 0',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      marginBottom: 8,
                    }}>
                      <span style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: 'var(--text)',
                      }}>
                        {formatDate(entry.date)}
                      </span>
                      {entry.templateName && (
                        <span style={{
                          fontSize: 11,
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          fontWeight: 600,
                        }}>
                          {entry.templateName}
                        </span>
                      )}
                    </div>

                    {/* Sets grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '28px 1fr 1fr',
                      gap: '2px 8px',
                    }}>
                      <span className="label" style={{ margin: 0 }}>Set</span>
                      <span className="label" style={{ margin: 0 }}>Weight</span>
                      <span className="label" style={{ margin: 0 }}>Reps</span>
                      {entry.sets.map((s, j) => {
                        const setLabel = s.setType === 'warm-up' ? 'W'
                          : s.setType === 'failure' ? 'F'
                          : s.setType === 'drop' ? 'D'
                          : (s.setNumber || j + 1);
                        return [
                          <span key={`n${j}`} style={{
                            fontSize: 13,
                            fontWeight: 700,
                            fontVariantNumeric: 'tabular-nums',
                            color: typeColors[s.setType] || 'var(--text)',
                            padding: '2px 0',
                          }}>
                            {setLabel}
                          </span>,
                          <span key={`w${j}`} style={{
                            fontSize: 13,
                            fontVariantNumeric: 'tabular-nums',
                            padding: '2px 0',
                          }}>
                            {s.weight || 0} {s.weightUnit || 'lbs'}
                          </span>,
                          <span key={`r${j}`} style={{
                            fontSize: 13,
                            fontVariantNumeric: 'tabular-nums',
                            padding: '2px 0',
                          }}>
                            {s.reps || 0}
                          </span>,
                        ];
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
