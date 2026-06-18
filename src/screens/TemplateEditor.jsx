import { useState, useEffect, useRef, useCallback } from 'react';
import { getExercises } from '../data/db.js';
import ExercisePicker from '../components/ExercisePicker.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function TemplateEditor({ template, onSave, onDelete, onCancel }) {
  const [name, setName] = useState(template.name);
  const [exercises, setExercises] = useState(() =>
    (template.exercises || []).map(ex => ({
      ...ex,
      sets: ex.sets || Array.from({ length: ex.defaultSets || 3 }, () => ({ setType: 'normal' })),
    }))
  );
  const [showPicker, setShowPicker] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [menuExerciseIdx, setMenuExerciseIdx] = useState(null);
  const [showReplacePicker, setShowReplacePicker] = useState(null);
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  const allExercises = getExercises();
  const getExName = (id) => allExercises.find(e => e.id === id)?.name || 'Unknown';

  const isNew = !template.lastCompletedAt && !template.exercises?.length;

  const hasChanges = () => {
    if (name !== template.name) return true;
    const orig = template.exercises || [];
    if (exercises.length !== orig.length) return true;
    return exercises.some((ex, i) => {
      const o = orig[i];
      if (ex.exerciseId !== o.exerciseId) return true;
      const origSets = o.sets || Array.from({ length: o.defaultSets || 3 }, () => ({ setType: 'normal' }));
      if (ex.sets.length !== origSets.length) return true;
      return ex.sets.some((s, j) => s.setType !== origSets[j].setType);
    });
  };

  const handleBack = () => {
    if (hasChanges()) {
      setShowBackConfirm(true);
    } else {
      onCancel();
    }
  };

  useEffect(() => {
    if (isNew && exercises.length === 0 && name === '') {
      const timer = setTimeout(() => setShowPicker(true), 300);
      return () => clearTimeout(timer);
    }
  }, []);

  const addExercise = (ex) => {
    setExercises(prev => [...prev, {
      exerciseId: ex.id,
      restTimerSeconds: null,
      weightUnit: null,
      barType: null,
      sets: [{ setType: 'normal' }, { setType: 'normal' }, { setType: 'normal' }],
    }]);
  };

  const removeExercise = useCallback((idx) => {
    setExercises(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const replaceExercise = useCallback((idx, newEx) => {
    setExercises(prev => prev.map((ex, i) => i === idx ? { ...ex, exerciseId: newEx.id } : ex));
  }, []);

  const updateExercise = useCallback((idx, updater) => {
    setExercises(prev => prev.map((ex, i) => i === idx ? updater(ex) : ex));
  }, []);

  const addSet = useCallback((exIdx) => {
    updateExercise(exIdx, ex => ({
      ...ex,
      sets: [...ex.sets, { setType: 'normal' }],
    }));
  }, [updateExercise]);

  const deleteSet = useCallback((exIdx, setIdx) => {
    updateExercise(exIdx, ex => {
      if (ex.sets.length <= 1) return ex;
      return { ...ex, sets: ex.sets.filter((_, i) => i !== setIdx) };
    });
  }, [updateExercise]);

  const updateSetType = useCallback((exIdx, setIdx, setType) => {
    updateExercise(exIdx, ex => ({
      ...ex,
      sets: ex.sets.map((s, i) => i === setIdx ? { ...s, setType } : s),
    }));
  }, [updateExercise]);

  const moveExercise = useCallback((fromIdx, direction) => {
    const toIdx = fromIdx + direction;
    setExercises(prev => {
      if (toIdx < 0 || toIdx >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, item);
      return next;
    });
  }, []);

  const handleSave = () => {
    onSave({
      ...template,
      name: name || 'Untitled',
      exercises: exercises.map(ex => ({
        exerciseId: ex.exerciseId,
        defaultSets: ex.sets.length,
        sets: ex.sets,
        restTimerSeconds: ex.restTimerSeconds,
        weightUnit: ex.weightUnit,
        barType: ex.barType,
      })),
    });
  };

  return (
    <div style={{
      paddingTop: 'env(safe-area-inset-top, 0px)',
      paddingBottom: 24,
      minHeight: '100dvh',
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        padding: '12px 16px',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
      }}>
        <button onClick={handleBack} style={{
          color: 'var(--text-muted)',
          fontSize: 22,
          padding: '8px 4px',
          lineHeight: 1,
          flexShrink: 0,
        }}>
          &#x2190;
        </button>
        <input
          type="text"
          placeholder="TEMPLATE NAME"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{
            flex: 1,
            fontSize: 14,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            background: 'transparent',
            border: 'none',
            color: 'var(--text)',
            textAlign: 'center',
            padding: '4px 0',
            minWidth: 0,
          }}
        />
        <button
          onClick={handleSave}
          style={{
            padding: '8px 20px',
            background: 'var(--accent)',
            color: 'var(--accent-text)',
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            flexShrink: 0,
          }}
        >
          Save
        </button>
      </div>

      {/* Exercise Cards */}
      <div style={{ padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {exercises.map((ex, exIdx) => (
          <div key={`${ex.exerciseId}-${exIdx}`}>
            {/* Exercise Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}>
              <div className="exercise-name" style={{
                fontSize: 14,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>
                {getExName(ex.exerciseId)}
              </div>
              <button
                onClick={() => setMenuExerciseIdx(exIdx)}
                style={{ padding: '4px 8px', color: 'var(--text-muted)', fontSize: 18 }}
              >
                &#x22EE;
              </button>
            </div>

            {/* Column Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr',
              gap: 8,
              alignItems: 'center',
              padding: '6px 0',
              borderBottom: '1px solid var(--border)',
              marginBottom: 2,
            }}>
              <span className="label" style={{ textAlign: 'center', margin: 0 }}>Set</span>
              <span className="label" style={{ margin: 0 }}>Type</span>
            </div>

            {/* Set Rows */}
            {ex.sets.map((set, setIdx) => (
              <TemplateSetRow
                key={setIdx}
                set={set}
                setIdx={setIdx}
                onUpdateType={(type) => updateSetType(exIdx, setIdx, type)}
                onDelete={() => deleteSet(exIdx, setIdx)}
                canDelete={ex.sets.length > 1}
              />
            ))}

            {/* Add Set */}
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
        ))}

        <button
          onClick={() => setShowPicker(true)}
          className="btn"
          style={{
            width: '100%',
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          }}
        >
          + Add Exercise
        </button>

        {!isNew && (
          <button
            onClick={() => setShowDelete(true)}
            className="btn btn-danger"
            style={{ width: '100%', marginTop: 8 }}
          >
            Delete Template
          </button>
        )}
      </div>

      {showPicker && (
        <ExercisePicker
          onSelect={addExercise}
          onClose={() => setShowPicker(false)}
          excludeIds={exercises.map(e => e.exerciseId)}
        />
      )}

      {menuExerciseIdx !== null && (
        <TemplateExerciseMenu
          exercise={exercises[menuExerciseIdx]}
          exerciseIdx={menuExerciseIdx}
          exerciseCount={exercises.length}
          getExName={getExName}
          onClose={() => setMenuExerciseIdx(null)}
          onRemove={() => {
            removeExercise(menuExerciseIdx);
            setMenuExerciseIdx(null);
          }}
          onReplace={() => {
            setShowReplacePicker(menuExerciseIdx);
            setMenuExerciseIdx(null);
          }}
          onMoveUp={() => {
            moveExercise(menuExerciseIdx, -1);
            setMenuExerciseIdx(null);
          }}
          onMoveDown={() => {
            moveExercise(menuExerciseIdx, 1);
            setMenuExerciseIdx(null);
          }}
        />
      )}

      {showReplacePicker !== null && (
        <ExercisePicker
          onSelect={(newEx) => {
            replaceExercise(showReplacePicker, newEx);
            setShowReplacePicker(null);
          }}
          onClose={() => setShowReplacePicker(null)}
          excludeIds={exercises.map(e => e.exerciseId)}
        />
      )}

      {showBackConfirm && (
        <ConfirmDialog
          title="Discard Changes"
          message="You have unsaved changes. Are you sure you want to go back?"
          confirmText="Discard"
          danger
          onConfirm={onCancel}
          onCancel={() => setShowBackConfirm(false)}
        />
      )}

      {showDelete && (
        <ConfirmDialog
          title="Delete Template"
          message={`Delete "${name || 'Untitled'}"? This cannot be undone.`}
          confirmText="Delete"
          danger
          onConfirm={() => onDelete(template.id)}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}

const MENU_ITEM_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  width: '100%',
  textAlign: 'left',
  padding: '14px 4px',
  fontSize: 14,
  color: 'var(--text)',
  borderBottom: '1px solid var(--border)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  fontWeight: 600,
};

function TemplateExerciseMenu({ exercise, exerciseIdx, exerciseCount, getExName, onClose, onRemove, onReplace, onMoveUp, onMoveDown }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}>
          <h3 style={{
            fontSize: 14,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            {getExName(exercise.exerciseId)}
          </h3>
          <button onClick={onClose} style={{
            color: 'var(--text-muted)',
            fontSize: 28,
            lineHeight: 1,
            padding: 4,
          }}>
            &times;
          </button>
        </div>

        {exerciseIdx > 0 && (
          <button onClick={onMoveUp} style={MENU_ITEM_STYLE}>
            <span style={{ fontSize: 16 }}>&#x2191;</span> Move Up
          </button>
        )}
        {exerciseIdx < exerciseCount - 1 && (
          <button onClick={onMoveDown} style={MENU_ITEM_STYLE}>
            <span style={{ fontSize: 16 }}>&#x2193;</span> Move Down
          </button>
        )}
        <button onClick={onReplace} style={MENU_ITEM_STYLE}>
          <span style={{ fontSize: 16 }}>&#x21BB;</span> Replace
        </button>
        <button onClick={onRemove} style={{ ...MENU_ITEM_STYLE, color: 'var(--red)' }}>
          <span style={{ fontSize: 16 }}>&#x2715;</span> Remove
        </button>
      </div>
    </div>
  );
}

const SET_TYPES = [
  { value: 'normal', label: 'Normal', abbr: null, color: 'var(--text)' },
  { value: 'warm-up', label: 'Warm-up', abbr: 'W', color: 'var(--yellow)' },
  { value: 'failure', label: 'Failure', abbr: 'F', color: 'var(--red)' },
  { value: 'drop', label: 'Drop Set', abbr: 'D', color: 'var(--green)' },
];

const SET_TYPE_COLORS = {
  normal: 'var(--text)',
  'warm-up': 'var(--yellow)',
  failure: 'var(--red)',
  drop: 'var(--green)',
};

function TemplateSetRow({ set, setIdx, onUpdateType, onDelete, canDelete }) {
  const [swiping, setSwiping] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const startX = useRef(0);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [typeMenuPos, setTypeMenuPos] = useState({ top: 0, left: 0 });

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    setSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!swiping) return;
    const diff = startX.current - e.touches[0].clientX;
    setSwipeX(Math.max(0, Math.min(diff, 100)));
  };

  const handleTouchEnd = () => {
    if (swipeX > 60 && canDelete) onDelete();
    setSwipeX(0);
    setSwiping(false);
  };

  const setTypeColor = SET_TYPE_COLORS[set.setType] || 'var(--text)';
  const setLabel = set.setType === 'normal'
    ? String(setIdx + 1)
    : SET_TYPES.find(t => t.value === set.setType)?.abbr || String(setIdx + 1);

  return (
    <>
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        {swipeX > 0 && (
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: 80,
            background: 'var(--red)', display: 'flex', alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: '40px 1fr',
          gap: 8,
          alignItems: 'center',
          padding: '6px 0',
          minHeight: 44,
          borderBottom: '1px solid var(--border)',
          transform: `translateX(-${swipeX}px)`,
          transition: swiping ? 'none' : 'transform 0.2s',
          position: 'relative',
          zIndex: 1,
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              setTypeMenuPos({ top: rect.top, left: rect.right + 4 });
              setShowTypeMenu(!showTypeMenu);
            }}
            style={{
              width: '100%',
              fontSize: 14,
              fontWeight: 700,
              color: setTypeColor,
              textAlign: 'center',
              padding: '6px 0',
            }}
          >
            {setLabel}
          </button>

          <span style={{
            fontSize: 13,
            color: 'var(--text-muted)',
            paddingLeft: 8,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
            {SET_TYPES.find(t => t.value === set.setType)?.label || 'Normal'}
          </span>
        </div>
      </div>

      {showTypeMenu && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 90 }}
            onClick={() => setShowTypeMenu(false)}
          />
          <div style={{
            position: 'fixed',
            top: typeMenuPos.top,
            left: typeMenuPos.left,
            zIndex: 100,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow)',
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 120,
          }}>
            {SET_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => {
                  onUpdateType(t.value);
                  setShowTypeMenu(false);
                }}
                style={{
                  padding: '10px 12px',
                  fontSize: 13,
                  fontWeight: 700,
                  color: t.color,
                  background: set.setType === t.value ? 'var(--highlight)' : 'transparent',
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
