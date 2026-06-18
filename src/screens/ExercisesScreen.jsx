import { useState, useMemo, useCallback } from 'react';
import { getExercises, saveCustomExercise, deleteCustomExercise } from '../data/db.js';
import { MUSCLE_GROUPS } from '../data/exercises.js';
import { generateId } from '../utils/helpers.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import MuscleMap from '../components/MuscleMap.jsx';

export default function ExercisesScreen() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState('Chest');
  const [refresh, setRefresh] = useState(0);

  const exercises = useMemo(() => getExercises(), [refresh]);

  const filtered = useMemo(() => {
    return exercises.filter(ex => {
      if (filter && ex.muscleGroup !== filter) return false;
      if (search && !ex.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [exercises, search, filter]);

  const grouped = useMemo(() => {
    const groups = {};
    for (const ex of filtered) {
      if (!groups[ex.muscleGroup]) groups[ex.muscleGroup] = [];
      groups[ex.muscleGroup].push(ex);
    }
    return groups;
  }, [filtered]);

  const handleSave = useCallback(() => {
    if (!newName.trim()) return;
    if (editingExercise) {
      saveCustomExercise({ ...editingExercise, name: newName.trim(), muscleGroup: newGroup });
    } else {
      saveCustomExercise({
        id: generateId(),
        name: newName.trim(),
        muscleGroup: newGroup,
        isBuiltIn: false,
      });
    }
    setNewName('');
    setNewGroup('Chest');
    setShowCreate(false);
    setEditingExercise(null);
    setRefresh(n => n + 1);
  }, [newName, newGroup, editingExercise]);

  const handleDelete = useCallback(() => {
    if (deleteTarget) {
      deleteCustomExercise(deleteTarget.id);
      setDeleteTarget(null);
      setRefresh(n => n + 1);
    }
  }, [deleteTarget]);

  return (
    <div className="screen">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
      }}>
        <h1 style={{
          fontSize: 40,
          fontWeight: 800,
          letterSpacing: '-0.03em',
          textTransform: 'uppercase',
        }}>
          Exercises
        </h1>
        <button
          onClick={() => { setShowCreate(true); setEditingExercise(null); setNewName(''); setNewGroup('Chest'); }}
          style={{
            width: 32,
            height: 32,
            background: 'var(--accent)',
            color: 'var(--accent-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            fontWeight: 400,
          }}
        >
          +
        </button>
      </div>

      <input
        className="input-field"
        type="text"
        placeholder="Search exercises..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 12 }}
      />

      <div style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        paddingBottom: 16,
        WebkitOverflowScrolling: 'touch',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      }}>
        <button
          onClick={() => setFilter(null)}
          style={{
            flexShrink: 0,
            padding: '6px 14px',
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            background: !filter ? 'var(--accent)' : 'transparent',
            color: !filter ? 'var(--accent-text)' : 'var(--text-muted)',
            border: `1px solid ${!filter ? 'var(--accent)' : 'var(--border)'}`,
          }}
        >
          All
        </button>
        {MUSCLE_GROUPS.map(mg => (
          <button
            key={mg}
            onClick={() => setFilter(mg === filter ? null : mg)}
            style={{
              flexShrink: 0,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              background: filter === mg ? 'var(--accent)' : 'transparent',
              color: filter === mg ? 'var(--accent-text)' : 'var(--text-muted)',
              border: `1px solid ${filter === mg ? 'var(--accent)' : 'var(--border)'}`,
            }}
          >
            {mg}
          </button>
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--border)' }}>
        {Object.entries(grouped).map(([group, exs]) => (
          <div key={group}>
            <div className="label" style={{
              padding: '14px 0 8px',
            }}>
              {group} ({exs.length})
            </div>
            {exs.map(ex => (
              <div key={ex.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 0',
                borderBottom: '1px solid var(--border)',
              }}>
                <MuscleMap muscleGroup={ex.muscleGroup} size={28} />
                <span style={{ fontSize: 15, flex: 1 }}>{ex.name}</span>
                {!ex.isBuiltIn && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => {
                        setEditingExercise(ex);
                        setNewName(ex.name);
                        setNewGroup(ex.muscleGroup);
                        setShowCreate(true);
                      }}
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: 12,
                        padding: '4px 8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        fontWeight: 600,
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(ex)}
                      style={{
                        color: 'var(--red)',
                        fontSize: 12,
                        padding: '4px 8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        fontWeight: 600,
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{
              fontSize: 16,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 16,
            }}>
              {editingExercise ? 'Edit Exercise' : 'New Exercise'}
            </h3>
            <input
              className="input-field"
              type="text"
              placeholder="Exercise name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              autoFocus
              style={{ marginBottom: 16 }}
            />
            <div className="label" style={{ marginBottom: 8 }}>Muscle Group</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {MUSCLE_GROUPS.map(mg => (
                <button
                  key={mg}
                  onClick={() => setNewGroup(mg)}
                  style={{
                    padding: '8px 16px',
                    fontSize: 13,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    background: newGroup === mg ? 'var(--accent)' : 'transparent',
                    color: newGroup === mg ? 'var(--accent-text)' : 'var(--text-muted)',
                    border: `1px solid ${newGroup === mg ? 'var(--accent)' : 'var(--border)'}`,
                  }}
                >
                  {mg}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="btn"
                onClick={() => setShowCreate(false)}
                style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)' }}
              >
                Cancel
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>
                {editingExercise ? 'Save' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Exercise"
          message={`Delete "${deleteTarget.name}"? This cannot be undone.`}
          confirmText="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
