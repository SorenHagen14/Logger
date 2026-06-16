import { useState, useContext, useCallback, useRef, useEffect } from 'react';
import { AppContext } from '../App.jsx';
import { getExercises, getPreviousDataForExercise, getSettings, saveActiveWorkout } from '../data/db.js';
import { generateId, formatTimer } from '../utils/helpers.js';
import ExercisePicker from '../components/ExercisePicker.jsx';
import RestTimer from '../components/RestTimer.jsx';
import UndoToast from '../components/UndoToast.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import ExerciseMenu from '../components/ExerciseMenu.jsx';

export default function ActiveWorkout() {
  const { activeWorkout, setActiveWorkout, finishWorkout, cancelWorkout } = useContext(AppContext);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [activeTimer, setActiveTimer] = useState(null);
  const [toast, setToast] = useState(null);
  const [menuExerciseIdx, setMenuExerciseIdx] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  const settings = getSettings();
  const allExercises = getExercises();
  const workout = activeWorkout;

  useEffect(() => {
    const interval = setInterval(() => {
      if (workout?.startedAt) {
        setElapsed(Math.floor((Date.now() - new Date(workout.startedAt).getTime()) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [workout?.startedAt]);

  useEffect(() => {
    if (workout) saveActiveWorkout(workout);
  }, [workout]);

  const getExName = (id) => allExercises.find(e => e.id === id)?.name || 'Unknown';

  const updateExercise = useCallback((exerciseIdx, updater) => {
    setActiveWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) =>
        i === exerciseIdx ? updater(ex) : ex
      ),
    }));
  }, [setActiveWorkout]);

  const updateSet = useCallback((exerciseIdx, setIdx, updates) => {
    updateExercise(exerciseIdx, ex => ({
      ...ex,
      sets: ex.sets.map((s, i) => i === setIdx ? { ...s, ...updates } : s),
    }));
  }, [updateExercise]);

  const addSet = useCallback((exerciseIdx) => {
    updateExercise(exerciseIdx, ex => ({
      ...ex,
      sets: [...ex.sets, {
        setNumber: ex.sets.length + 1,
        setType: 'normal',
        weight: '',
        reps: '',
        rpe: null,
        completed: false,
        weightUnit: ex.weightUnit || settings.defaultWeightUnit,
      }],
    }));
  }, [updateExercise, settings.defaultWeightUnit]);

  const deleteSet = useCallback((exerciseIdx, setIdx) => {
    const ex = workout.exercises[exerciseIdx];
    const deletedSet = ex.sets[setIdx];

    if (ex.sets.length === 1) {
      setToast({
        type: 'lastSet',
        exerciseIdx,
        message: `Remove ${getExName(ex.exerciseId)} from workout?`,
      });
      return;
    }

    updateExercise(exerciseIdx, ex => ({
      ...ex,
      sets: ex.sets.filter((_, i) => i !== setIdx).map((s, i) => ({ ...s, setNumber: i + 1 })),
    }));

    setToast({
      type: 'deleteSet',
      message: 'Set deleted',
      undo: () => {
        updateExercise(exerciseIdx, ex => {
          const sets = [...ex.sets];
          sets.splice(setIdx, 0, deletedSet);
          return { ...ex, sets: sets.map((s, i) => ({ ...s, setNumber: i + 1 })) };
        });
        setToast(null);
      },
    });
  }, [workout, updateExercise, getExName]);

  const toggleSetComplete = useCallback((exerciseIdx, setIdx) => {
    const ex = workout.exercises[exerciseIdx];
    const set = ex.sets[setIdx];
    const nowComplete = !set.completed;

    updateSet(exerciseIdx, setIdx, { completed: nowComplete });

    if (nowComplete && set.setType !== 'drop') {
      const isSupersetMember = workout.supersets?.some(ss => ss.exerciseIds.includes(ex.exerciseId));
      if (isSupersetMember) {
        const superset = workout.supersets.find(ss => ss.exerciseIds.includes(ex.exerciseId));
        const lastExId = superset.exerciseIds[superset.exerciseIds.length - 1];
        const lastEx = workout.exercises.find(e => e.exerciseId === lastExId);
        const isLastSetOfLastExercise = ex.exerciseId === lastExId &&
          setIdx === lastEx.sets.length - 1;
        if (!isLastSetOfLastExercise) return;
      }

      const restTime = ex.restTimerSeconds || settings.defaultRestTimerSeconds;
      setActiveTimer({ duration: restTime, exerciseIdx, setIdx });
    } else if (!nowComplete) {
      setActiveTimer(null);
    }
  }, [workout, updateSet, settings.defaultRestTimerSeconds]);

  const addExercise = useCallback((ex) => {
    const prevData = getPreviousDataForExercise(ex.id);
    setActiveWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, {
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
          completed: false,
          weightUnit: settings.defaultWeightUnit,
        })),
      }],
    }));
  }, [setActiveWorkout, settings.defaultWeightUnit]);

  const removeExercise = useCallback((idx) => {
    const removed = workout.exercises[idx];
    setActiveWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== idx),
    }));
    setToast({
      type: 'removeExercise',
      message: `${getExName(removed.exerciseId)} removed`,
      undo: () => {
        setActiveWorkout(prev => {
          const exs = [...prev.exercises];
          exs.splice(idx, 0, removed);
          return { ...prev, exercises: exs };
        });
        setToast(null);
      },
    });
  }, [workout, setActiveWorkout, getExName]);

  const replaceExercise = useCallback((idx, newEx) => {
    const old = workout.exercises[idx];
    const setCount = old.sets.length;
    setActiveWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) => i === idx ? {
        exerciseId: newEx.id,
        exerciseName: newEx.name,
        weightUnit: ex.weightUnit,
        restTimerSeconds: ex.restTimerSeconds,
        barType: ex.barType,
        notes: [],
        sets: Array.from({ length: setCount }, (_, j) => ({
          setNumber: j + 1,
          setType: 'normal',
          weight: '',
          reps: '',
          rpe: null,
          completed: false,
          weightUnit: ex.weightUnit || settings.defaultWeightUnit,
        })),
      } : ex),
    }));
    setToast({
      type: 'replaceExercise',
      message: `Replaced with ${newEx.name}`,
      undo: () => {
        setActiveWorkout(prev => ({
          ...prev,
          exercises: prev.exercises.map((ex, i) => i === idx ? old : ex),
        }));
        setToast(null);
      },
    });
  }, [workout, setActiveWorkout, settings.defaultWeightUnit]);

  if (!workout) return null;

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
      }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 600 }}>{workout.templateName || 'Workout'}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
            {formatTimer(elapsed)}
          </div>
        </div>
        <button
          onClick={() => setShowFinishConfirm(true)}
          style={{
            padding: '8px 18px',
            borderRadius: 8,
            background: 'var(--accent)',
            color: 'white',
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          Finish
        </button>
      </div>

      {/* Exercise Cards */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {workout.exercises.map((ex, exIdx) => {
          const prevData = getPreviousDataForExercise(ex.exerciseId);
          const isSupersetMember = workout.supersets?.some(ss => ss.exerciseIds.includes(ex.exerciseId));
          const supersetGroup = workout.supersets?.find(ss => ss.exerciseIds.includes(ex.exerciseId));
          const isFirstInSuperset = supersetGroup?.exerciseIds[0] === ex.exerciseId;

          return (
            <div key={`${ex.exerciseId}-${exIdx}`}>
              {isSupersetMember && isFirstInSuperset && (
                <div style={{
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--accent-light)',
                  marginBottom: 6,
                }}>
                  Superset
                </div>
              )}
              <div className="card" style={{
                borderLeft: isSupersetMember ? '3px solid var(--accent-light)' : undefined,
              }}>
                {/* Exercise Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--accent)' }}>
                    {getExName(ex.exerciseId)}
                  </div>
                  <button
                    onClick={() => setMenuExerciseIdx(exIdx)}
                    style={{ padding: '4px 8px', color: 'var(--text-muted)', fontSize: 18 }}
                  >
                    ⋮
                  </button>
                </div>

                {/* Notes */}
                {ex.notes?.filter(n => n.type === 'sticky' || n.showOnNextWorkout).map((note, ni) => (
                  <div key={ni} style={{
                    background: 'var(--note-bg)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    marginBottom: 10,
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
                  gridTemplateColumns: '36px 64px 1fr 1fr 40px',
                  gap: 6,
                  alignItems: 'center',
                  padding: '6px 0',
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--text-muted)',
                }}>
                  <span>Set</span>
                  <span>Previous</span>
                  <span>{ex.weightUnit || settings.defaultWeightUnit}</span>
                  <span>Reps</span>
                  <span style={{ textAlign: 'center' }}>✓</span>
                </div>

                {/* Set Rows */}
                {ex.sets.map((set, setIdx) => {
                  const prev = prevData?.[setIdx];
                  const setTypeColors = {
                    normal: 'var(--text)',
                    'warm-up': 'var(--yellow)',
                    failure: 'var(--red)',
                    drop: 'var(--green)',
                  };

                  return (
                    <div key={setIdx}>
                      <SetRow
                        set={set}
                        setIdx={setIdx}
                        prev={prev}
                        setTypeColor={setTypeColors[set.setType]}
                        onUpdateSet={(updates) => updateSet(exIdx, setIdx, updates)}
                        onToggleComplete={() => toggleSetComplete(exIdx, setIdx)}
                        onDelete={() => deleteSet(exIdx, setIdx)}
                      />
                      {activeTimer && activeTimer.exerciseIdx === exIdx && activeTimer.setIdx === setIdx && set.completed && (
                        <RestTimer
                          duration={activeTimer.duration}
                          onDismiss={() => setActiveTimer(null)}
                        />
                      )}
                    </div>
                  );
                })}

                {/* Add Set */}
                <button
                  onClick={() => addSet(exIdx)}
                  style={{
                    fontSize: 14,
                    color: 'var(--accent)',
                    fontWeight: 500,
                    padding: '10px 0 2px',
                    width: '100%',
                    textAlign: 'center',
                  }}
                >
                  + Add Set
                </button>
              </div>
            </div>
          );
        })}

        {/* Add Exercise */}
        <button
          onClick={() => setShowExercisePicker(true)}
          className="btn"
          style={{
            width: '100%',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--accent)',
          }}
        >
          + Add Exercise
        </button>

        {/* Cancel Workout */}
        <button
          onClick={() => setShowCancelConfirm(true)}
          className="btn btn-danger"
          style={{ width: '100%', marginTop: 16 }}
        >
          Cancel Workout
        </button>
      </div>

      {/* Modals */}
      {showExercisePicker && (
        <ExercisePicker
          onSelect={addExercise}
          onClose={() => setShowExercisePicker(false)}
        />
      )}

      {menuExerciseIdx !== null && (
        <ExerciseMenu
          exercise={workout.exercises[menuExerciseIdx]}
          exerciseIdx={menuExerciseIdx}
          settings={settings}
          onClose={() => setMenuExerciseIdx(null)}
          onUpdateExercise={(updates) => {
            updateExercise(menuExerciseIdx, ex => ({ ...ex, ...updates }));
            setMenuExerciseIdx(null);
          }}
          onReplace={(newEx) => {
            replaceExercise(menuExerciseIdx, newEx);
            setMenuExerciseIdx(null);
          }}
          onRemove={() => {
            removeExercise(menuExerciseIdx);
            setMenuExerciseIdx(null);
          }}
          onCreateSuperset={(exerciseIds) => {
            setActiveWorkout(prev => ({
              ...prev,
              supersets: [...(prev.supersets || []), { exerciseIds }],
            }));
            setMenuExerciseIdx(null);
          }}
        />
      )}

      {showFinishConfirm && (
        <ConfirmDialog
          title="Finish Workout"
          message="Are you done? This will save your workout."
          confirmText="Finish"
          onConfirm={() => { setShowFinishConfirm(false); finishWorkout(); }}
          onCancel={() => setShowFinishConfirm(false)}
        />
      )}

      {showCancelConfirm && (
        <ConfirmDialog
          title="Cancel Workout"
          message="Are you sure? All logged data for this session will be lost."
          confirmText="Cancel Workout"
          danger
          onConfirm={() => { setShowCancelConfirm(false); cancelWorkout(); }}
          onCancel={() => setShowCancelConfirm(false)}
        />
      )}

      {toast && toast.type === 'lastSet' && (
        <ConfirmDialog
          title="Remove Exercise?"
          message={toast.message}
          confirmText="Remove"
          danger
          onConfirm={() => {
            removeExercise(toast.exerciseIdx);
            setToast(null);
          }}
          onCancel={() => setToast(null)}
        />
      )}

      {toast && toast.undo && (
        <UndoToast
          message={toast.message}
          onUndo={toast.undo}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}

function SetRow({ set, setIdx, prev, setTypeColor, onUpdateSet, onToggleComplete, onDelete }) {
  const [swiping, setSwiping] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const startX = useRef(0);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showRpe, setShowRpe] = useState(false);

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
    if (swipeX > 60) {
      onDelete();
    }
    setSwipeX(0);
    setSwiping(false);
  };

  const setTypes = [
    { value: 'normal', label: 'Normal', color: 'var(--text)' },
    { value: 'warm-up', label: 'Warm-up', color: 'var(--yellow)' },
    { value: 'failure', label: 'Failure', color: 'var(--red)' },
    { value: 'drop', label: 'Drop Set', color: 'var(--green)' },
  ];

  const prevText = prev ? `${prev.weight}×${prev.reps}` : '—';

  return (
    <>
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 8,
        }}
      >
        {/* Delete zone — only visible during swipe */}
        {swipeX > 0 && (
          <div style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 80,
            background: 'var(--red)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </div>
        )}

        <div
          onClick={() => set.completed && setShowRpe(!showRpe)}
          style={{
            display: 'grid',
            gridTemplateColumns: '36px 64px 1fr 1fr 40px',
            gap: 6,
            alignItems: 'center',
            padding: '8px 0',
            minHeight: 44,
            background: set.completed ? 'rgba(34, 197, 94, 0.06)' : 'var(--surface)',
            borderRadius: 8,
            transform: `translateX(-${swipeX}px)`,
            transition: swiping ? 'none' : 'transform 0.2s',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Set Number / Type */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowTypeMenu(!showTypeMenu); }}
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: setTypeColor,
              textAlign: 'center',
              padding: '4px 0',
            }}
          >
            {set.setType === 'warm-up' ? 'W' : set.setType === 'failure' ? 'F' : set.setType === 'drop' ? 'D' : setIdx + 1}
          </button>

          {/* Previous */}
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
            {prevText}
          </span>

          {/* Weight */}
          <input
            type="number"
            inputMode="decimal"
            value={set.weight}
            placeholder={prev?.weight?.toString() || ''}
            onChange={e => onUpdateSet({ weight: e.target.value })}
            style={{
              height: 36,
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              textAlign: 'center',
              fontSize: 15,
              fontVariantNumeric: 'tabular-nums',
              width: '100%',
            }}
          />

          {/* Reps */}
          <input
            type="number"
            inputMode="numeric"
            value={set.reps}
            placeholder={prev?.reps?.toString() || ''}
            onChange={e => onUpdateSet({ reps: e.target.value })}
            style={{
              height: 36,
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              textAlign: 'center',
              fontSize: 15,
              fontVariantNumeric: 'tabular-nums',
              width: '100%',
            }}
          />

          {/* Checkbox */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleComplete(); }}
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              border: `2px solid ${set.completed ? 'var(--green)' : 'var(--border)'}`,
              background: set.completed ? 'var(--green)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              transition: 'all 0.15s',
              flexShrink: 0,
            }}
          >
            {set.completed && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Set Type Menu */}
      {showTypeMenu && (
        <div style={{
          display: 'flex',
          gap: 6,
          padding: '6px 0',
          flexWrap: 'wrap',
        }}>
          {setTypes.map(t => (
            <button
              key={t.value}
              onClick={() => { onUpdateSet({ setType: t.value }); setShowTypeMenu(false); }}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                color: t.color,
                background: set.setType === t.value ? 'rgba(255,255,255,0.08)' : 'transparent',
                border: `1px solid ${set.setType === t.value ? t.color : 'var(--border)'}`,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* RPE Selector */}
      {showRpe && set.completed && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 0',
          overflowX: 'auto',
        }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>RPE:</span>
          {Array.from({ length: 10 }, (_, i) => i + 1).map(val => (
            <button
              key={val}
              onClick={() => { onUpdateSet({ rpe: val }); setShowRpe(false); }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                flexShrink: 0,
                background: set.rpe === val ? 'var(--accent)' : 'var(--bg)',
                color: set.rpe === val ? 'white' : 'var(--text-muted)',
                border: `1px solid ${set.rpe === val ? 'var(--accent)' : 'var(--border)'}`,
              }}
            >
              {val}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
