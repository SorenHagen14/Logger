import { useState } from 'react';
import { getExercises } from '../data/db.js';
import ExercisePicker from '../components/ExercisePicker.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function TemplateEditor({ template, onSave, onDelete, onCancel }) {
  const [name, setName] = useState(template.name);
  const [exercises, setExercises] = useState(template.exercises || []);
  const [showPicker, setShowPicker] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);

  const allExercises = getExercises();
  const getExName = (id) => allExercises.find(e => e.id === id)?.name || 'Unknown';

  const addExercise = (ex) => {
    setExercises(prev => [...prev, {
      exerciseId: ex.id,
      defaultSets: 3,
      restTimerSeconds: null,
      weightUnit: null,
      barType: null,
    }]);
  };

  const removeExercise = (idx) => {
    setExercises(prev => prev.filter((_, i) => i !== idx));
  };

  const updateSets = (idx, val) => {
    setExercises(prev => prev.map((ex, i) =>
      i === idx ? { ...ex, defaultSets: Math.max(1, parseInt(val) || 1) } : ex
    ));
  };

  const moveExercise = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= exercises.length) return;
    const next = [...exercises];
    const [item] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, item);
    setExercises(next);
  };

  const isNew = !template.lastCompletedAt && !template.exercises?.length;

  return (
    <div className="screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button onClick={onCancel} style={{ color: 'var(--text-muted)', fontSize: 15, fontWeight: 500 }}>
          Cancel
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>
          {isNew ? 'New Template' : 'Edit Template'}
        </h2>
        <button
          onClick={() => onSave({ ...template, name: name || 'Untitled', exercises })}
          style={{ color: 'var(--accent)', fontSize: 15, fontWeight: 600 }}
        >
          Save
        </button>
      </div>

      <input
        className="input-field"
        type="text"
        placeholder="Template name"
        value={name}
        onChange={e => setName(e.target.value)}
        autoFocus
        style={{ marginBottom: 24 }}
      />

      <div className="section-header">Exercises</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {exercises.map((ex, idx) => (
          <div key={idx} className="card" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            opacity: dragIdx === idx ? 0.5 : 1,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, color: 'var(--text-muted)' }}>
              <button
                onClick={() => moveExercise(idx, idx - 1)}
                style={{ color: 'var(--text-muted)', fontSize: 12, padding: 2, lineHeight: 1 }}
                disabled={idx === 0}
              >
                ▲
              </button>
              <button
                onClick={() => moveExercise(idx, idx + 1)}
                style={{ color: 'var(--text-muted)', fontSize: 12, padding: 2, lineHeight: 1 }}
                disabled={idx === exercises.length - 1}
              >
                ▼
              </button>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{getExName(ex.exerciseId)}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sets:</span>
                <input
                  type="number"
                  value={ex.defaultSets}
                  onChange={e => updateSets(idx, e.target.value)}
                  style={{
                    width: 40,
                    height: 28,
                    textAlign: 'center',
                    background: 'var(--bg)',
                    borderRadius: 6,
                    fontSize: 14,
                    border: '1px solid var(--border)',
                  }}
                />
              </div>
            </div>

            <button
              onClick={() => removeExercise(idx)}
              style={{ color: 'var(--red)', fontSize: 18, padding: '4px 8px' }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowPicker(true)}
        className="btn"
        style={{
          width: '100%',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--accent)',
          marginBottom: 32,
        }}
      >
        + Add Exercise
      </button>

      {!isNew && (
        <button
          onClick={() => setShowDelete(true)}
          className="btn btn-danger"
          style={{ width: '100%' }}
        >
          Delete Template
        </button>
      )}

      {showPicker && (
        <ExercisePicker
          onSelect={addExercise}
          onClose={() => setShowPicker(false)}
          excludeIds={exercises.map(e => e.exerciseId)}
        />
      )}

      {showDelete && (
        <ConfirmDialog
          title="Delete Template"
          message={`Are you sure you want to delete "${name || 'Untitled'}"? This cannot be undone.`}
          confirmText="Delete"
          danger
          onConfirm={() => onDelete(template.id)}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}
