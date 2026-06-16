import { useState, useMemo } from 'react';
import { getExercises } from '../data/db.js';
import { MUSCLE_GROUPS } from '../data/exercises.js';

export default function ExercisePicker({ onSelect, onClose, excludeIds = [] }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(null);
  const exercises = useMemo(() => getExercises(), []);

  const filtered = useMemo(() => {
    return exercises.filter(ex => {
      if (excludeIds.includes(ex.id)) return false;
      if (filter && ex.muscleGroup !== filter) return false;
      if (search && !ex.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [exercises, search, filter, excludeIds]);

  const grouped = useMemo(() => {
    const groups = {};
    for (const ex of filtered) {
      if (!groups[ex.muscleGroup]) groups[ex.muscleGroup] = [];
      groups[ex.muscleGroup].push(ex);
    }
    return groups;
  }, [filtered]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Select Exercise</h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', fontSize: 28, lineHeight: 1, padding: '4px' }}>
            &times;
          </button>
        </div>

        <input
          className="input-field"
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
          style={{ marginBottom: 12 }}
        />

        <div style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 12,
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

        <div style={{ maxHeight: '50dvh', overflowY: 'auto' }}>
          {Object.keys(grouped).length === 0 && (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              No exercises found
            </div>
          )}
          {Object.entries(grouped).map(([group, exs]) => (
            <div key={group}>
              <div style={{
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-muted)',
                padding: '12px 0 6px',
                position: 'sticky',
                top: 0,
                background: 'var(--surface)',
                zIndex: 1,
              }}>
                {group}
              </div>
              {exs.map(ex => (
                <button
                  key={ex.id}
                  onClick={() => { onSelect(ex); onClose(); }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 0',
                    fontSize: 15,
                    color: 'var(--text)',
                    borderBottom: '1px solid var(--border)',
                    background: 'none',
                    transition: 'background 0.1s',
                  }}
                >
                  {ex.name}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
