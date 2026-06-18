import { useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import { AppContext } from '../App.jsx';
import { getExercises } from '../data/db.js';
import ExercisePicker from './ExercisePicker.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';

const BAR_TYPES = [
  { value: null, label: 'None (0 lb)' },
  { value: 'olympic_45', label: 'Olympic Bar (45 lb)' },
  { value: 'short_45', label: 'Short Bar (45 lb)' },
  { value: 'ez_curl_33', label: 'EZ Curl Bar (33 lb)' },
  { value: 'hex_20', label: 'Hex Bar (20 lb)' },
  { value: 'heavy_75', label: 'Heavy Bar (75 lb)' },
];

export default function ExerciseMenu({ exercise, exerciseIdx, settings, onClose, onUpdateExercise, onReplace, onRemove, onCreateSuperset }) {
  const { activeWorkout } = useContext(AppContext);
  const [subMenu, setSubMenu] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState('regular');
  const [showReplacePicker, setShowReplacePicker] = useState(false);
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [supersetSelection, setSupersetSelection] = useState([exercise.exerciseId]);
  const [restMinutes, setRestMinutes] = useState(
    Math.floor((exercise.restTimerSeconds || settings.defaultRestTimerSeconds) / 60)
  );
  const [restSeconds, setRestSeconds] = useState(
    (exercise.restTimerSeconds || settings.defaultRestTimerSeconds) % 60
  );

  const allExercises = getExercises();
  const getExName = (id) => allExercises.find(e => e.id === id)?.name || 'Unknown';

  const loggedSets = exercise.sets.filter(s => s.completed || s.weight || s.reps).length;

  const menuItems = [
    {
      group: 'Notes',
      items: [
        { label: 'Add Note', icon: '✎', action: () => { setNoteType('regular'); setSubMenu('note'); } },
        { label: 'Add Sticky Note', icon: '◈', action: () => { setNoteType('sticky'); setSubMenu('note'); } },
      ],
    },
    {
      group: 'Actions',
      items: [
        { label: 'Replace Exercise', icon: '↻', action: () => {
          if (loggedSets > 0) {
            setShowReplaceConfirm(true);
          } else {
            setShowReplacePicker(true);
          }
        }},
        { label: 'Create Superset', icon: '↔', action: () => setSubMenu('superset') },
        { label: 'Remove Exercise', icon: '✕', color: 'var(--red)', action: () => setShowRemoveConfirm(true) },
      ],
    },
    {
      group: 'Preferences',
      items: [
        { label: `Weight: ${exercise.weightUnit || settings.defaultWeightUnit}`, icon: '⚖', action: () => setSubMenu('unit') },
        { label: 'Bar Type', icon: '≡', action: () => setSubMenu('barType') },
        { label: 'Rest Timer', icon: '⏱', action: () => setSubMenu('restTimer') },
      ],
    },
  ];

  return createPortal(
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

        {!subMenu && (
          <div>
            {menuItems.map(group => (
              <div key={group.group}>
                <div className="label" style={{ padding: '12px 0 4px' }}>
                  {group.group}
                </div>
                {group.items.map(item => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      textAlign: 'left',
                      padding: '14px 4px',
                      fontSize: 14,
                      fontWeight: 600,
                      color: item.color || 'var(--text)',
                      borderBottom: '1px solid var(--border)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Note Sub-menu */}
        {subMenu === 'note' && (
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
              {noteType === 'sticky' ? 'This note will appear on all future workouts.' : 'This note will appear on the next workout only.'}
            </div>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Add a note..."
              autoFocus
              style={{
                width: '100%',
                minHeight: 80,
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                padding: 12,
                fontSize: 15,
                color: 'var(--text)',
                resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button className="btn" onClick={() => setSubMenu(null)} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)' }}>
                Back
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => {
                  if (!noteText.trim()) return;
                  onUpdateExercise({
                    notes: [...(exercise.notes || []), {
                      type: noteType,
                      text: noteText.trim(),
                      showOnNextWorkout: noteType === 'regular',
                      delivered: noteType === 'sticky',
                    }],
                  });
                }}
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Weight Unit Sub-menu */}
        {subMenu === 'unit' && (
          <div style={{ borderTop: '1px solid var(--border)' }}>
            {['lbs', 'kg'].map(unit => (
              <button
                key={unit}
                onClick={() => onUpdateExercise({ weightUnit: unit })}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '14px 4px',
                  fontSize: 14,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: (exercise.weightUnit || settings.defaultWeightUnit) === unit ? 'var(--accent)' : 'var(--text-muted)',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                {unit}
                {(exercise.weightUnit || settings.defaultWeightUnit) === unit && ' ✓'}
              </button>
            ))}
          </div>
        )}

        {/* Bar Type Sub-menu */}
        {subMenu === 'barType' && (
          <div style={{ borderTop: '1px solid var(--border)' }}>
            {BAR_TYPES.map(bt => (
              <button
                key={bt.label}
                onClick={() => onUpdateExercise({ barType: bt.value })}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '14px 4px',
                  fontSize: 14,
                  fontWeight: exercise.barType === bt.value ? 600 : 400,
                  color: exercise.barType === bt.value ? 'var(--accent)' : 'var(--text-secondary)',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                {bt.label}
                {exercise.barType === bt.value && ' ✓'}
              </button>
            ))}
          </div>
        )}

        {/* Rest Timer Sub-menu */}
        {subMenu === 'restTimer' && (
          <div>
            <div style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}>
              <div style={{ textAlign: 'center' }}>
                <div className="label" style={{ marginBottom: 4 }}>Min</div>
                <input
                  type="number"
                  value={restMinutes}
                  onChange={e => setRestMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                  style={{
                    width: 60,
                    height: 44,
                    textAlign: 'center',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    fontSize: 18,
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                />
              </div>
              <span style={{ fontSize: 24, fontWeight: 300, color: 'var(--text-muted)', paddingTop: 20 }}>:</span>
              <div style={{ textAlign: 'center' }}>
                <div className="label" style={{ marginBottom: 4 }}>Sec</div>
                <input
                  type="number"
                  value={restSeconds}
                  onChange={e => setRestSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  style={{
                    width: 60,
                    height: 44,
                    textAlign: 'center',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    fontSize: 18,
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                />
              </div>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => onUpdateExercise({ restTimerSeconds: restMinutes * 60 + restSeconds })}
            >
              Save
            </button>
          </div>
        )}

        {/* Superset Sub-menu */}
        {subMenu === 'superset' && (
          <div>
            <div style={{
              fontSize: 13,
              color: 'var(--text-muted)',
              marginBottom: 12,
            }}>
              Select exercises to include in the superset:
            </div>
            <div style={{ borderTop: '1px solid var(--border)' }}>
              {activeWorkout.exercises.map((ex, i) => {
                const selected = supersetSelection.includes(ex.exerciseId);
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (ex.exerciseId === exercise.exerciseId) return;
                      setSupersetSelection(prev =>
                        selected ? prev.filter(id => id !== ex.exerciseId) : [...prev, ex.exerciseId]
                      );
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 4px',
                      borderBottom: '1px solid var(--border)',
                      opacity: ex.exerciseId === exercise.exerciseId ? 0.5 : 1,
                    }}
                  >
                    <div style={{
                      width: 22,
                      height: 22,
                      border: `2px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                      background: selected ? 'var(--accent)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {selected && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="3" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </div>
                    <span style={{ fontSize: 14 }}>{getExName(ex.exerciseId)}</span>
                  </button>
                );
              })}
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 16 }}
              onClick={() => {
                if (supersetSelection.length >= 2) {
                  onCreateSuperset(supersetSelection);
                }
              }}
              disabled={supersetSelection.length < 2}
            >
              Save Superset
            </button>
          </div>
        )}

        {/* Replace confirm */}
        {showReplaceConfirm && (
          <ConfirmDialog
            title="Replace Exercise"
            message={`You've logged ${loggedSets} set${loggedSets > 1 ? 's' : ''} for ${getExName(exercise.exerciseId)}. This data will be deleted. Continue?`}
            confirmText="Replace"
            danger
            onConfirm={() => { setShowReplaceConfirm(false); setShowReplacePicker(true); }}
            onCancel={() => setShowReplaceConfirm(false)}
          />
        )}

        {showReplacePicker && (
          <ExercisePicker
            onSelect={(ex) => { setShowReplacePicker(false); onReplace(ex); }}
            onClose={() => setShowReplacePicker(false)}
          />
        )}

        {showRemoveConfirm && (
          <ConfirmDialog
            title="Remove Exercise"
            message={`Remove ${getExName(exercise.exerciseId)} from this workout?`}
            confirmText="Remove"
            danger
            onConfirm={onRemove}
            onCancel={() => setShowRemoveConfirm(false)}
          />
        )}
      </div>
    </div>,
    document.body
  );
}
