import { useState, useRef } from 'react';
import { parseStrongCsv, importAll } from '../utils/strongImport.js';

export default function StrongImport({ onClose, onImported }) {
  const [step, setStep] = useState('pick');
  const [parsed, setParsed] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = parseStrongCsv(evt.target.result);
      if (data.templates.length === 0) {
        setError('No templates found. Make sure this is a Strong CSV export.');
        return;
      }
      setParsed(data);
      setSelected(new Set(data.templates.map((_, i) => i)));
      setStep('review');
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    const res = importAll(parsed, selected);
    setResult(res);
    setStep('done');
  };

  const toggleTemplate = (idx) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const selectedWorkoutCount = parsed
    ? parsed.workouts.filter(w => {
        const names = new Set([...selected].map(i => parsed.templates[i].name));
        return names.has(w.workoutName);
      }).length
    : 0;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'var(--bg)',
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <button onClick={onClose} style={{
          color: 'var(--text-muted)',
          fontSize: 22,
          padding: '8px 4px',
          lineHeight: 1,
        }}>
          &#x2190;
        </button>
        <span style={{
          fontSize: 14,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          Import from Strong
        </span>
        <div style={{ width: 30 }} />
      </div>

      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: 16,
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
      }}>
        {step === 'pick' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: 24,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 40,
                fontWeight: 800,
                letterSpacing: '-0.03em',
                marginBottom: 16,
              }}>
                STRONG
              </div>
              <div style={{
                fontSize: 13,
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                maxWidth: 280,
                margin: '0 auto',
              }}>
                Export your data from Strong app:
              </div>
              <div style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                lineHeight: 1.8,
                marginTop: 12,
                textAlign: 'left',
                maxWidth: 280,
                margin: '12px auto 0',
              }}>
                1. Open Strong app<br />
                2. Go to Settings<br />
                3. Tap "Export Data"<br />
                4. Choose CSV format<br />
                5. Select the file below
              </div>
            </div>

            <label style={{
              display: 'block',
              padding: '14px 32px',
              fontSize: 13,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              background: 'var(--accent)',
              color: 'var(--accent-text)',
              textAlign: 'center',
              cursor: 'pointer',
            }}>
              Select CSV File
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.txt"
                style={{ display: 'none' }}
                onChange={handleFile}
              />
            </label>

            {error && (
              <div style={{
                color: 'var(--red)',
                fontSize: 13,
                textAlign: 'center',
                padding: '0 16px',
              }}>
                {error}
              </div>
            )}
          </div>
        )}

        {step === 'review' && parsed && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 8,
            }}>
              <div style={{
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-secondary)',
              }}>
                {parsed.templates.length} template{parsed.templates.length !== 1 ? 's' : ''} found
              </div>
              <button
                onClick={() => {
                  if (selected.size === parsed.templates.length) setSelected(new Set());
                  else setSelected(new Set(parsed.templates.map((_, i) => i)));
                }}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-muted)',
                  padding: '4px 0',
                }}
              >
                {selected.size === parsed.templates.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              marginBottom: 20,
              lineHeight: 1.5,
            }}>
              {parsed.workouts.length} total workouts &middot; Templates + full history will be imported
            </div>

            {parsed.templates.map((t, idx) => (
              <button
                key={idx}
                onClick={() => toggleTemplate(idx)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '16px 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 8,
                }}>
                  <div style={{
                    width: 22,
                    height: 22,
                    border: selected.has(idx) ? 'none' : '1px solid var(--text-muted)',
                    background: selected.has(idx) ? 'var(--accent)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {selected.has(idx) && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="3" strokeLinecap="square">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: 'var(--text)',
                    }}>
                      {t.name}
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      marginTop: 2,
                    }}>
                      {t.exercises.length} exercises &middot; {t.timesCompleted} workout{t.timesCompleted !== 1 ? 's' : ''} logged
                    </div>
                  </div>
                </div>

                <div style={{ paddingLeft: 34 }}>
                  {t.exercises.map((ex, i) => (
                    <div key={i} style={{
                      fontSize: 12,
                      color: ex.match ? 'var(--text-secondary)' : 'var(--yellow)',
                      padding: '3px 0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ex.match ? ex.match.name : ex.strongName}
                      </span>
                      <span style={{
                        color: 'var(--text-muted)',
                        fontSize: 11,
                        marginLeft: 8,
                        flexShrink: 0,
                      }}>
                        {ex.setCount} sets
                      </span>
                    </div>
                  ))}
                  {t.exercises.some(ex => !ex.match) && (
                    <div style={{
                      fontSize: 11,
                      color: 'var(--yellow)',
                      marginTop: 6,
                      fontStyle: 'italic',
                    }}>
                      Yellow = new exercise (will be added)
                    </div>
                  )}
                </div>
              </button>
            ))}

            <button
              onClick={handleImport}
              disabled={selected.size === 0}
              style={{
                width: '100%',
                padding: 16,
                marginTop: 24,
                fontSize: 14,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                background: selected.size > 0 ? 'var(--accent)' : 'var(--surface)',
                color: selected.size > 0 ? 'var(--bg)' : 'var(--text-muted)',
              }}
            >
              Import {selected.size} Template{selected.size !== 1 ? 's' : ''} + {selectedWorkoutCount} Workout{selectedWorkoutCount !== 1 ? 's' : ''}
            </button>
          </div>
        )}

        {step === 'done' && result && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: 16,
          }}>
            <div style={{
              fontSize: 64,
              fontWeight: 900,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.04em',
            }}>
              {result.workoutCount}
            </div>
            <div style={{
              fontSize: 14,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-secondary)',
            }}>
              Workouts Imported
            </div>
            <div style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              textAlign: 'center',
              lineHeight: 1.8,
            }}>
              {result.templateCount} templates &middot; {result.exerciseCount} exercises
            </div>
            <button
              onClick={() => { onImported(); onClose(); }}
              style={{
                padding: '14px 40px',
                fontSize: 14,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                background: 'var(--accent)',
                color: 'var(--accent-text)',
                marginTop: 16,
              }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
