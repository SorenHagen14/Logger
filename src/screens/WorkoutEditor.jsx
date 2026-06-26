import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getExercises, getTemplates, getSettings, saveTemplate, updateWorkout } from '../data/db.js';
import { generateId } from '../utils/helpers.js';
import ExercisePicker from '../components/ExercisePicker.jsx';

export default function WorkoutEditor({ workout, onSave, onCancel }) {
  const allExercises = getExercises();
  const settings = getSettings();
  const getExName = (id, name) => name || allExercises.find(e => e.id === id)?.name || id;

  const [exercises, setExercises] = useState(() =>
    workout.exercises.map(ex => ({
      ...ex,
      sets: ex.sets.map(s => ({
        ...s,
        weight: String(s.weight ?? ''),
        reps: String(s.reps ?? ''),
      })),
    }))
  );

  const [activeInput, setActiveInput] = useState(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [savedWorkout, setSavedWorkout] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const inputRefs = useRef({});
  const nameInputRef = useRef(null);

  const handleSetChange = (exIdx, setIdx, field, value) => {
    setExercises(prev => {
      const next = [...prev];
      const ex = { ...next[exIdx], sets: [...next[exIdx].sets] };
      ex.sets[setIdx] = { ...ex.sets[setIdx], [field]: value };
      next[exIdx] = ex;
      return next;
    });
  };

  const addSet = (exIdx) => {
    setExercises(prev => {
      const next = [...prev];
      const ex = { ...next[exIdx], sets: [...next[exIdx].sets] };
      ex.sets.push({
        setNumber: ex.sets.length + 1,
        setType: 'normal',
        weight: '',
        reps: '',
        rpe: null,
        completed: true,
        weightUnit: ex.weightUnit || settings.defaultWeightUnit,
      });
      next[exIdx] = ex;
      return next;
    });
  };

  const deleteSet = (exIdx, setIdx) => {
    setExercises(prev => {
      const next = [...prev];
      const ex = { ...next[exIdx], sets: [...next[exIdx].sets] };
      if (ex.sets.length <= 1) {
        return prev.filter((_, i) => i !== exIdx);
      }
      ex.sets = ex.sets.filter((_, i) => i !== setIdx).map((s, i) => ({ ...s, setNumber: i + 1 }));
      next[exIdx] = ex;
      return next;
    });
  };

  const addExercise = (ex) => {
    setExercises(prev => [...prev, {
      exerciseId: ex.id,
      exerciseName: ex.name,
      weightUnit: settings.defaultWeightUnit,
      restTimerSeconds: null,
      barType: null,
      notes: [],
      sets: Array.from({ length: 3 }, (_, i) => ({
        setNumber: i + 1,
        setType: 'normal',
        weight: '',
        reps: '',
        rpe: null,
        completed: true,
        weightUnit: settings.defaultWeightUnit,
      })),
    }]);
  };

  const removeExercise = (exIdx) => {
    setExercises(prev => prev.filter((_, i) => i !== exIdx));
  };

  const buildUpdatedWorkout = () => ({
    ...workout,
    exercises: exercises.map(ex => ({
      ...ex,
      sets: ex.sets.map(s => ({
        ...s,
        weight: Number(s.weight) || 0,
        reps: Number(s.reps) || 0,
      })),
    })),
  });

  const workoutToTemplateExercises = (w) =>
    w.exercises.map(ex => ({
      exerciseId: ex.exerciseId,
      restTimerSeconds: ex.restTimerSeconds ?? null,
      weightUnit: ex.weightUnit ?? null,
      barType: ex.barType ?? null,
      sets: ex.sets.filter(s => s.completed).map(s => ({ setType: s.setType || 'normal' })),
    })).filter(ex => ex.sets.length > 0);

  const originalTemplate = getTemplates().find(t => t.id === workout.templateId);

  const handleSave = () => {
    const updated = buildUpdatedWorkout();
    updateWorkout(updated);
    setSavedWorkout(updated);
    setNewTemplateName((workout.templateName || 'Workout') + ' 2');
    setShowTemplateDialog(true);
  };

  const handleSkipTemplate = () => {
    setShowTemplateDialog(false);
    onSave(savedWorkout);
  };

  const handleUpdateTemplate = () => {
    if (originalTemplate) {
      const updated = {
        ...originalTemplate,
        exercises: workoutToTemplateExercises(savedWorkout),
      };
      saveTemplate(updated);
    }
    setShowTemplateDialog(false);
    onSave(savedWorkout);
  };

  const handleSaveNewTemplate = () => {
    const trimmed = newTemplateName.trim();
    if (!trimmed) return;
    const tmpl = {
      id: generateId(),
      name: trimmed,
      exercises: workoutToTemplateExercises(savedWorkout),
      supersets: savedWorkout.supersets || [],
      lastCompletedAt: null,
    };
    saveTemplate(tmpl);
    setShowTemplateDialog(false);
    onSave(savedWorkout);
  };

  const typeColors = {
    normal: 'var(--text)',
    'warm-up': 'var(--yellow)',
    failure: 'var(--red)',
    drop: 'var(--green)',
  };

  const typeLabels = {
    normal: null,
    'warm-up': 'W',
    failure: 'F',
    drop: 'D',
  };

  return (
    <div className="screen">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
      }}>
        <button onClick={onCancel} style={{
          color: 'var(--text-muted)',
          fontSize: 22,
          padding: '8px 4px',
          lineHeight: 1,
        }}>
          &#x2190;
        </button>
        <button onClick={handleSave} style={{
          color: 'var(--accent)',
          fontSize: 13,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          padding: '8px 12px',
        }}>
          Save
        </button>
      </div>

      <h2 style={{
        fontSize: 32,
        fontWeight: 800,
        letterSpacing: '-0.03em',
        textTransform: 'uppercase',
        lineHeight: 1.1,
        marginBottom: 8,
      }}>
        Edit Workout
      </h2>

      <div style={{
        fontSize: 13,
        color: 'var(--text-muted)',
        marginBottom: 24,
      }}>
        {workout.templateName || 'Workout'}
      </div>

      <div style={{ borderTop: '1px solid var(--border)' }}>
        {exercises.map((ex, exIdx) => {
          return (
            <div key={exIdx} style={{
              borderBottom: '1px solid var(--border)',
              padding: '16px 0',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
              }}>
                <div style={{
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  {getExName(ex.exerciseId, ex.exerciseName)}
                </div>
                <button
                  onClick={() => removeExercise(exIdx)}
                  style={{
                    padding: '4px 8px',
                    color: 'var(--text-muted)',
                    fontSize: 16,
                    lineHeight: 1,
                  }}
                >
                  &#x2715;
                </button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '32px 1fr 1fr 28px',
                gap: 8,
                padding: '4px 0',
              }}>
                <span className="label" style={{ margin: 0 }}>Set</span>
                <span className="label" style={{ margin: 0 }}>Weight</span>
                <span className="label" style={{ margin: 0 }}>Reps</span>
                <span />
              </div>

              {ex.sets.map((s, setIdx) => {
                const setLabel = typeLabels[s.setType] || (s.setNumber || setIdx + 1);
                const weightKey = `${exIdx}-${setIdx}-weight`;
                const repsKey = `${exIdx}-${setIdx}-reps`;
                return (
                  <div key={setIdx} style={{
                    display: 'grid',
                    gridTemplateColumns: '32px 1fr 1fr 28px',
                    gap: 8,
                    padding: '6px 0',
                    fontSize: 14,
                    borderTop: '1px solid var(--border)',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    <span style={{
                      color: typeColors[s.setType] || 'var(--text)',
                      fontWeight: 700,
                    }}>
                      {setLabel}
                    </span>
                    <input
                      ref={el => inputRefs.current[weightKey] = el}
                      type="text"
                      inputMode="decimal"
                      value={activeInput === weightKey ? s.weight : (s.weight || '0')}
                      onFocus={() => {
                        setActiveInput(weightKey);
                        if (s.weight === '0') handleSetChange(exIdx, setIdx, 'weight', '');
                      }}
                      onBlur={() => setActiveInput(null)}
                      onChange={e => handleSetChange(exIdx, setIdx, 'weight', e.target.value)}
                      style={{
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                        padding: '6px 8px',
                        fontSize: 14,
                        width: '100%',
                        textAlign: 'center',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    />
                    <input
                      ref={el => inputRefs.current[repsKey] = el}
                      type="text"
                      inputMode="numeric"
                      value={activeInput === repsKey ? s.reps : (s.reps || '0')}
                      onFocus={() => {
                        setActiveInput(repsKey);
                        if (s.reps === '0') handleSetChange(exIdx, setIdx, 'reps', '');
                      }}
                      onBlur={() => setActiveInput(null)}
                      onChange={e => handleSetChange(exIdx, setIdx, 'reps', e.target.value)}
                      style={{
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                        padding: '6px 8px',
                        fontSize: 14,
                        width: '100%',
                        textAlign: 'center',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    />
                    <button
                      onClick={() => deleteSet(exIdx, setIdx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted)',
                        fontSize: 13,
                        lineHeight: 1,
                      }}
                    >
                      &#x2212;
                    </button>
                  </div>
                );
              })}

              <button
                onClick={() => addSet(exIdx)}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-secondary)',
                  padding: '12px 0 4px',
                  width: '100%',
                  textAlign: 'center',
                }}
              >
                + Add Set
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setShowPicker(true)}
        className="btn"
        style={{
          width: '100%',
          background: 'transparent',
          border: '1px solid var(--border)',
          color: 'var(--text-secondary)',
          marginTop: 16,
        }}
      >
        + Add Exercise
      </button>

      {showPicker && (
        <ExercisePicker
          onSelect={(ex) => { addExercise(ex); setShowPicker(false); }}
          onClose={() => setShowPicker(false)}
        />
      )}

      {showTemplateDialog && createPortal(
        <div className="confirm-overlay" onClick={handleSkipTemplate}>
          <div className="confirm-content" onClick={e => e.stopPropagation()}>
            <h3 style={{
              fontSize: 16,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 8,
            }}>
              Update Template?
            </h3>
            <p style={{
              fontSize: 14,
              color: 'var(--text-secondary)',
              marginBottom: 20,
              lineHeight: 1.5,
            }}>
              Save this workout's exercises as a template for future use.
            </p>

            {originalTemplate && (
              <button
                onClick={handleUpdateTemplate}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  fontSize: 14,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  textAlign: 'left',
                  marginBottom: 8,
                }}
              >
                Update "{originalTemplate.name}"
              </button>
            )}

            <div style={{
              width: '100%',
              padding: '14px 16px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              marginBottom: 16,
            }}>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-secondary)',
                marginBottom: 8,
              }}>
                Save as New Template
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={newTemplateName}
                  onChange={e => setNewTemplateName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveNewTemplate(); }}
                  placeholder="Template name"
                  style={{
                    flex: 1,
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    padding: '8px 12px',
                    fontSize: 14,
                  }}
                />
                <button
                  onClick={handleSaveNewTemplate}
                  style={{
                    padding: '8px 16px',
                    background: 'var(--accent)',
                    color: 'var(--accent-text)',
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Save
                </button>
              </div>
            </div>

            <button
              onClick={handleSkipTemplate}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                fontSize: 13,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Skip
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
