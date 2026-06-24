import { useState, useContext, useCallback, useRef, useEffect } from 'react';
import { AppContext } from '../App.jsx';
import { getExercises, getPreviousDataForExercise, getSettings, saveActiveWorkout } from '../data/db.js';
import { generateId } from '../utils/helpers.js';
import ExercisePicker from '../components/ExercisePicker.jsx';
import RestTimer from '../components/RestTimer.jsx';
import UndoToast from '../components/UndoToast.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import ExerciseMenu from '../components/ExerciseMenu.jsx';
import NumericInputModal from '../components/NumericInputModal.jsx';
import ExerciseHistory from '../components/ExerciseHistory.jsx';

export default function ActiveWorkout() {
  const { activeWorkout, setActiveWorkout, finishWorkout, cancelWorkout } = useContext(AppContext);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [activeTimers, setActiveTimers] = useState({});
  const [toast, setToast] = useState(null);
  const [menuExerciseIdx, setMenuExerciseIdx] = useState(null);
  const [numpadOpen, setNumpadOpen] = useState(false);
  const [numericTarget, setNumericTarget] = useState(null);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [dragActivating, setDragActivating] = useState(null);
  const [historyExercise, setHistoryExercise] = useState(null);
  const dragRefs = useRef([]);
  const longPressTimer = useRef(null);
  const dragStartY = useRef(0);
  const isDragging = useRef(false);

  const settings = getSettings();
  const allExercises = getExercises();
  const workout = activeWorkout;

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

  const addDropSet = useCallback((exerciseIdx, afterSetIdx) => {
    updateExercise(exerciseIdx, ex => {
      const sets = [...ex.sets];
      sets.splice(afterSetIdx + 1, 0, {
        setNumber: 0,
        setType: 'drop',
        weight: '',
        reps: '',
        rpe: null,
        completed: false,
        weightUnit: ex.weightUnit || settings.defaultWeightUnit,
      });
      return { ...ex, sets: sets.map((s, i) => ({ ...s, setNumber: i + 1 })) };
    });
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
  }, [workout, updateExercise]);

  const dismissTimer = useCallback((key) => {
    setActiveTimers(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const toggleSetComplete = useCallback((exerciseIdx, setIdx) => {
    const ex = workout.exercises[exerciseIdx];
    const set = ex.sets[setIdx];
    const nowComplete = !set.completed;
    const timerKey = `${exerciseIdx}-${setIdx}`;

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
      setActiveTimers({ [timerKey]: { duration: restTime } });
    } else if (!nowComplete) {
      dismissTimer(timerKey);
    }
  }, [workout, updateSet, settings.defaultRestTimerSeconds, dismissTimer]);

  const addExercise = useCallback((ex) => {
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
  }, [workout, setActiveWorkout]);

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

  const handleTouchStart = useCallback((exIdx, e) => {
    const touch = e.touches[0];
    dragStartY.current = touch.clientY;
    isDragging.current = false;
    setDragActivating(exIdx);
    longPressTimer.current = setTimeout(() => {
      isDragging.current = true;
      setDragActivating(null);
      setDragIdx(exIdx);
      setDragOverIdx(exIdx);
      setNumericTarget(null);
      setNumpadOpen(false);
      if (navigator.vibrate) navigator.vibrate(20);
    }, 400);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging.current) {
      if (longPressTimer.current) {
        const touch = e.touches[0];
        if (Math.abs(touch.clientY - dragStartY.current) > 10) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
          setDragActivating(null);
        }
      }
      return;
    }
    e.preventDefault();
    const touch = e.touches[0];
    const y = touch.clientY;
    for (let i = 0; i < dragRefs.current.length; i++) {
      const el = dragRefs.current[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (y >= rect.top && y <= rect.bottom) {
        setDragOverIdx(i);
        break;
      }
    }
  }, []);

  const handleTouchEnd = useCallback((exIdx) => {
    const wasDragging = isDragging.current;
    const hadTimer = !!longPressTimer.current;
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setDragActivating(null);
    if (wasDragging && dragIdx !== null && dragOverIdx !== null && dragIdx !== dragOverIdx) {
      setActiveWorkout(prev => {
        const exs = [...prev.exercises];
        const [moved] = exs.splice(dragIdx, 1);
        exs.splice(dragOverIdx, 0, moved);
        return { ...prev, exercises: exs };
      });
    }
    if (!wasDragging && hadTimer && exIdx !== undefined) {
      const ex = workout?.exercises[exIdx];
      if (ex) {
        const info = allExercises.find(e => e.id === ex.exerciseId);
        if (info) setHistoryExercise(info);
      }
    }
    isDragging.current = false;
    setDragIdx(null);
    setDragOverIdx(null);
  }, [dragIdx, dragOverIdx, setActiveWorkout, workout, allExercises]);

  if (!workout) return null;

  return (
    <div
      onClick={() => { if (numericTarget) { setNumericTarget(null); setNumpadOpen(false); } }}
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: numpadOpen ? 300 : 24,
        minHeight: '100dvh',
      }}
    >
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
        <div style={{
          fontSize: 14,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          {workout.templateName || 'Workout'}
        </div>
        <button
          onClick={() => setShowFinishConfirm(true)}
          style={{
            padding: '8px 20px',
            background: 'var(--accent)',
            color: 'var(--accent-text)',
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Finish
        </button>
      </div>

      {/* Exercise Cards */}
      <div style={{ padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {workout.exercises.map((ex, exIdx) => {
          const prevData = getPreviousDataForExercise(ex.exerciseId);
          const isSupersetMember = workout.supersets?.some(ss => ss.exerciseIds.includes(ex.exerciseId));
          const supersetGroup = workout.supersets?.find(ss => ss.exerciseIds.includes(ex.exerciseId));
          const isFirstInSuperset = supersetGroup?.exerciseIds[0] === ex.exerciseId;

          return (
            <div
              key={`${ex.exerciseId}-${exIdx}`}
              ref={el => dragRefs.current[exIdx] = el}
              style={{
                opacity: dragIdx === exIdx ? 0.4 : 1,
                transform: dragActivating === exIdx ? 'scale(0.98)' : undefined,
                transition: 'opacity 0.15s, transform 0.15s',
                borderTop: dragOverIdx === exIdx && dragIdx !== null && dragIdx > exIdx ? '2px solid var(--accent)' : undefined,
                borderBottom: dragOverIdx === exIdx && dragIdx !== null && dragIdx < exIdx ? '2px solid var(--accent)' : undefined,
                paddingTop: dragOverIdx === exIdx && dragIdx !== null && dragIdx > exIdx ? 8 : undefined,
                paddingBottom: dragOverIdx === exIdx && dragIdx !== null && dragIdx < exIdx ? 8 : undefined,
              }}
            >
              {isSupersetMember && isFirstInSuperset && (
                <div style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--text-secondary)',
                  marginBottom: 6,
                }}>
                  Superset
                </div>
              )}
              <div style={{
                borderLeft: isSupersetMember ? '2px solid var(--text-secondary)' : undefined,
                paddingLeft: isSupersetMember ? 12 : 0,
              }}>
                {/* Exercise Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}>
                  <div
                    className="exercise-name"
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      touchAction: 'none',
                      cursor: 'grab',
                    }}
                    onTouchStart={(e) => handleTouchStart(exIdx, e)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={() => handleTouchEnd(exIdx)}
                  >
                    {getExName(ex.exerciseId)}
                  </div>
                  {dragIdx === null && (
                    <button
                      onClick={() => setMenuExerciseIdx(exIdx)}
                      style={{ padding: '4px 8px', color: 'var(--text-muted)', fontSize: 18 }}
                    >
                      &#x22EE;
                    </button>
                  )}
                </div>

                {dragIdx !== null ? (
                  <div style={{
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    padding: '4px 0',
                  }}>
                    {ex.sets.length} set{ex.sets.length !== 1 ? 's' : ''}
                  </div>
                ) : (
                  <>
                    {/* Notes */}
                    {ex.notes?.filter(n => n.delivered).map((note, ni) => (
                      <div key={ni} style={{
                        background: 'var(--note-bg)',
                        padding: '8px 12px',
                        marginBottom: 10,
                        fontSize: 13,
                        lineHeight: 1.4,
                        borderLeft: '2px solid var(--yellow)',
                      }}>
                        {note.text}
                      </div>
                    ))}

                    {/* Column Header */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '40px 60px 1fr 1fr 40px',
                      gap: 8,
                      alignItems: 'center',
                      padding: '6px 0',
                      borderBottom: '1px solid var(--border)',
                      marginBottom: 2,
                    }}>
                      {['Set', 'Prev', ex.weightUnit || settings.defaultWeightUnit, 'Reps', ''].map((label, i) => (
                        <span key={i} className="label" style={{ textAlign: 'center', margin: 0 }}>
                          {label}
                        </span>
                      ))}
                    </div>

                    {/* Set Rows */}
                    {(() => {
                      let mainSetNum = 0;
                      return ex.sets.map((set, setIdx) => {
                        const isDrop = set.setType === 'drop';
                        if (!isDrop) mainSetNum++;
                        const displayNum = mainSetNum;
                        const prev = prevData?.[setIdx];
                        const setTypeColors = {
                          normal: 'var(--text)',
                          'warm-up': 'var(--yellow)',
                          failure: 'var(--red)',
                          drop: 'var(--green)',
                        };

                        const timerKey = `${exIdx}-${setIdx}`;
                        const timerActive = set.completed && !!activeTimers[timerKey];
                        const restDuration = ex.restTimerSeconds || settings.defaultRestTimerSeconds;
                        const isLastDropInGroup = isDrop &&
                          (setIdx === ex.sets.length - 1 || ex.sets[setIdx + 1]?.setType !== 'drop');

                        return (
                          <div key={setIdx}>
                            <div style={isDrop ? {
                              marginLeft: 20,
                              borderLeft: '2px solid var(--green)',
                              paddingLeft: 12,
                            } : undefined}>
                              <SetRow
                                set={set}
                                setIdx={setIdx}
                                exIdx={exIdx}
                                displayNum={displayNum}
                                prev={prev}
                                setTypeColor={setTypeColors[set.setType]}
                                weightUnit={ex.weightUnit || settings.defaultWeightUnit}
                                onUpdateSet={(updates) => updateSet(exIdx, setIdx, updates)}
                                onToggleComplete={() => toggleSetComplete(exIdx, setIdx)}
                                onDelete={() => deleteSet(exIdx, setIdx)}
                                numericTarget={numericTarget}
                                onNumericOpen={(field) => {
                                  setNumericTarget({ exIdx, setIdx, field });
                                  setNumpadOpen(true);
                                }}
                              />
                              <RestTimer
                                key={`timer-${timerKey}`}
                                duration={restDuration}
                                active={timerActive}
                                onDismiss={() => dismissTimer(timerKey)}
                                onDurationChange={(d) => updateExercise(exIdx, ex => ({ ...ex, restTimerSeconds: d }))}
                              />
                            </div>
                            {isLastDropInGroup && (
                              <button
                                onClick={() => addDropSet(exIdx, setIdx)}
                                style={{
                                  marginLeft: 34,
                                  fontSize: 11,
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.06em',
                                  color: 'var(--green)',
                                  padding: '8px 0',
                                }}
                              >
                                + Drop Set
                              </button>
                            )}
                          </div>
                        );
                      });
                    })()}

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
                  </>
                )}
              </div>
            </div>
          );
        })}

        <button
          onClick={() => setShowExercisePicker(true)}
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

        <button
          onClick={() => setShowCancelConfirm(true)}
          className="btn btn-danger"
          style={{ width: '100%', marginTop: 8 }}
        >
          Cancel Workout
        </button>
      </div>

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
          summary={workout?.exercises?.map(ex => `${ex.sets?.length || 0} x ${getExName(ex.exerciseId)}`)}
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

      {historyExercise && (
        <ExerciseHistory
          exercise={historyExercise}
          onClose={() => setHistoryExercise(null)}
        />
      )}

      {numericTarget && (() => {
        const ex = workout.exercises[numericTarget.exIdx];
        const set = ex?.sets[numericTarget.setIdx];
        if (!set) return null;
        const prevData = getPreviousDataForExercise(ex.exerciseId);
        const prev = prevData?.[numericTarget.setIdx];
        const field = numericTarget.field;
        return (
          <NumericInputModal
            key={`${numericTarget.exIdx}-${numericTarget.setIdx}-${field}`}
            value={field === 'weight' ? set.weight : set.reps}
            allowDecimal={field === 'weight'}
            placeholder={field === 'weight' ? (prev?.weight?.toString() || '—') : (prev?.reps?.toString() || '—')}
            onConfirm={(val) => updateSet(numericTarget.exIdx, numericTarget.setIdx, { [field]: val })}
            onClose={() => { setNumericTarget(null); setNumpadOpen(false); }}
          />
        );
      })()}
    </div>
  );
}

function SetRow({ set, setIdx, exIdx, displayNum, prev, setTypeColor, weightUnit, onUpdateSet, onToggleComplete, onDelete, numericTarget, onNumericOpen }) {
  const [swiping, setSwiping] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const startX = useRef(0);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [typeMenuPos, setTypeMenuPos] = useState({ top: 0, left: 0 });
  const [showRpe, setShowRpe] = useState(false);
  const weightRef = useRef(null);
  const repsRef = useRef(null);

  const isActiveWeight = numericTarget?.exIdx === exIdx && numericTarget?.setIdx === setIdx && numericTarget?.field === 'weight';
  const isActiveReps = numericTarget?.exIdx === exIdx && numericTarget?.setIdx === setIdx && numericTarget?.field === 'reps';

  useEffect(() => {
    if (isActiveWeight && weightRef.current) {
      requestAnimationFrame(() => {
        weightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    } else if (isActiveReps && repsRef.current) {
      requestAnimationFrame(() => {
        repsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  }, [isActiveWeight, isActiveReps]);

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
    if (swipeX > 60) onDelete();
    setSwipeX(0);
    setSwiping(false);
  };

  const setTypes = [
    { value: 'normal', label: 'Normal', abbr: null, color: 'var(--text)' },
    { value: 'warm-up', label: 'Warm-up', abbr: 'W', color: 'var(--yellow)' },
    { value: 'failure', label: 'Failure', abbr: 'F', color: 'var(--red)' },
    { value: 'drop', label: 'Drop Set', abbr: 'D', color: 'var(--green)' },
  ];

  const prevText = prev ? `${prev.weight}×${prev.reps}` : '—';

  const setLabel = set.setType === 'normal'
    ? String(displayNum)
    : setTypes.find(t => t.value === set.setType)?.abbr || String(displayNum);

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

        <div
          onClick={() => set.completed && setShowRpe(!showRpe)}
          style={{
            display: 'grid',
            gridTemplateColumns: '40px 60px 1fr 1fr 40px',
            gap: 8,
            alignItems: 'center',
            padding: '6px 0',
            minHeight: 44,
            background: set.completed ? 'linear-gradient(var(--green-dim), var(--green-dim)), var(--bg)' : 'var(--bg)',
            borderBottom: '1px solid var(--border)',
            transform: `translateX(-${swipeX}px)`,
            transition: swiping ? 'none' : 'transform 0.2s',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Set Number */}
          <div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                const menuWidth = 130;
                const menuHeight = 176;
                const left = Math.min(rect.right + 4, window.innerWidth - menuWidth - 8);
                const top = Math.min(rect.top, window.innerHeight - menuHeight - 8);
                setTypeMenuPos({ top, left });
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
          </div>

          {/* Previous */}
          <span style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            fontVariantNumeric: 'tabular-nums',
            textAlign: 'center',
            display: 'block',
          }}>
            {prevText}
          </span>

          {/* Weight */}
          <button
            ref={weightRef}
            onClick={(e) => { e.stopPropagation(); onNumericOpen('weight'); }}
            style={{
              height: 36,
              background: 'var(--surface)',
              border: `1px solid ${isActiveWeight ? 'var(--accent)' : 'var(--border)'}`,
              textAlign: 'center',
              fontSize: 15,
              fontVariantNumeric: 'tabular-nums',
              width: '100%',
              color: set.completed || set.weight !== '' ? 'var(--text)' : 'var(--text-muted)',
            }}
          >
            {set.weight !== '' ? set.weight : (prev?.weight?.toString() || '—')}
          </button>

          {/* Reps */}
          <button
            ref={repsRef}
            onClick={(e) => { e.stopPropagation(); onNumericOpen('reps'); }}
            style={{
              height: 36,
              background: 'var(--surface)',
              border: `1px solid ${isActiveReps ? 'var(--accent)' : 'var(--border)'}`,
              textAlign: 'center',
              fontSize: 15,
              fontVariantNumeric: 'tabular-nums',
              width: '100%',
              color: set.completed || set.reps !== '' ? 'var(--text)' : 'var(--text-muted)',
            }}
          >
            {set.reps !== '' ? set.reps : (prev?.reps?.toString() || '—')}
          </button>

          {/* Checkbox */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleComplete(); }}
              style={{
                width: 28,
                height: 28,
                border: `2px solid ${set.completed ? 'var(--green)' : 'var(--border)'}`,
                background: set.completed ? 'var(--green)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
      </div>

      {/* Set Type Popover */}
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
            {setTypes.map(t => (
              <button
                key={t.value}
                onClick={() => {
                  onUpdateSet({ setType: t.value });
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

      {/* RPE Selector */}
      {showRpe && set.completed && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 0',
          overflowX: 'auto',
        }}>
          <span className="label" style={{ flexShrink: 0, margin: 0 }}>RPE:</span>
          {Array.from({ length: 10 }, (_, i) => i + 1).map(val => (
            <button
              key={val}
              onClick={() => { onUpdateSet({ rpe: val }); setShowRpe(false); }}
              style={{
                width: 32, height: 32,
                fontSize: 13, fontWeight: 600, flexShrink: 0,
                background: set.rpe === val ? 'var(--accent)' : 'var(--surface)',
                color: set.rpe === val ? 'var(--bg)' : 'var(--text-muted)',
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
