import { useState, useMemo, useCallback } from 'react';
import { getExercises, saveCustomExercise, deleteCustomExercise } from '../data/db.js';
import { MUSCLE_GROUPS } from '../data/exercises.js';
import { generateId } from '../utils/helpers.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Exercises</h1>
        <button
          onClick={() => { setShowCreate(true); setEditingExercise(null); setNewName(''); setNewGroup('Chest'); }}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'var(--accent)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            fontWeight: 300,
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
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 500,
            background: !filter ? 'var(--accent)' : 'var(--surface)',
            color: !filter ? 'white' : 'var(--text-muted)',
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
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 500,
              background: filter === mg ? 'var(--accent)' : 'var(--surface)',
              color: filter === mg ? 'white' : 'var(--text-muted)',
              border: `1px solid ${filter === mg ? 'var(--accent)' : 'var(--border)'}`,
            }}
          >
            {mg}
          </button>
        ))}
      </div>

      {Object.entries(grouped).map(([group, exs]) => (
        <div key={group}>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-muted)',
            padding: '12px 0 6px',
          }}>
            {group} ({exs.length})
          </div>
          {exs.map(ex => (
            <div key={ex.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: 15 }}>{ex.name}</span>
              {!ex.isBuiltIn && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => {
                      setEditingExercise(ex);
                      setNewName(ex.name);
                      setNewGroup(ex.muscleGroup);
                      setShowCreate(true);
                    }}
                    style={{ color: 'var(--text-muted)', fontSize: 13, padding: '4px 8px' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(ex)}
                    style={{ color: 'var(--red)', fontSize: 13, padding: '4px 8px' }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Create / Edit Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
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
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Muscle Group</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {MUSCLE_GROUPS.map(mg => (
                <button
                  key={mg}
                  onClick={() => setNewGroup(mg)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 14,
                    background: newGroup === mg ? 'var(--accent)' : 'var(--bg)',
                    color: newGroup === mg ? 'white' : 'var(--text-muted)',
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
                style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)' }}
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
