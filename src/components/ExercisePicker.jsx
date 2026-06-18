import { useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getExercises } from '../data/db.js';
import { MUSCLE_GROUPS } from '../data/exercises.js';
import MuscleMap from './MuscleMap.jsx';

export default function ExercisePicker({ onSelect, onClose, excludeIds = [] }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(null);
  const [addedIds, setAddedIds] = useState([]);
  const exercises = useMemo(() => getExercises(), []);

  const handleSelect = useCallback((ex) => {
    onSelect(ex);
    setAddedIds(prev => [...prev, ex.id]);
  }, [onSelect]);

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

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}>
          <div>
            <h2 style={{
              fontSize: 14,
              fontWeight: 700,
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              Select Exercises
            </h2>
            {addedIds.length > 0 && (
              <span style={{
                fontSize: 12,
                color: 'var(--green)',
                fontWeight: 600,
              }}>
                {addedIds.length} added
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              background: addedIds.length > 0 ? 'var(--accent)' : 'transparent',
              color: addedIds.length > 0 ? 'var(--accent-text)' : 'var(--text-muted)',
              border: addedIds.length > 0 ? 'none' : '1px solid var(--border)',
              minHeight: 44,
              minWidth: 44,
            }}
          >
            Done
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

        <div style={{ maxHeight: '50dvh', overflowY: 'auto' }}>
          {Object.keys(grouped).length === 0 && (
            <div style={{
              padding: '32px 0',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: 13,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              No exercises found
            </div>
          )}
          {Object.entries(grouped).map(([group, exs]) => (
            <div key={group}>
              <div className="label" style={{
                padding: '12px 0 6px',
                position: 'sticky',
                top: 0,
                background: 'var(--surface)',
                zIndex: 1,
              }}>
                {group}
              </div>
              {exs.map(ex => {
                const justAdded = addedIds.includes(ex.id);
                return (
                  <button
                    key={ex.id}
                    onClick={() => { if (!justAdded) handleSelect(ex); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 0',
                      fontSize: 15,
                      color: justAdded ? 'var(--green)' : 'var(--text)',
                      borderBottom: '1px solid var(--border)',
                      background: 'none',
                      transition: 'color 0.15s',
                      opacity: justAdded ? 0.7 : 1,
                    }}
                  >
                    <MuscleMap muscleGroup={ex.muscleGroup} size={28} />
                    <span style={{ flex: 1 }}>{ex.name}</span>
                    {justAdded && (
                      <span style={{
                        fontSize: 16,
                        lineHeight: 1,
                        marginRight: 4,
                        color: 'var(--green)',
                      }}>
                        &#10003;
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
