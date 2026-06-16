import { useState, useContext, useMemo } from 'react';
import { AppContext } from '../App.jsx';
import { getTemplates, getWorkouts, saveTemplate, deleteTemplate } from '../data/db.js';
import { generateId, formatRelativeTime, formatDate } from '../utils/helpers.js';
import TemplateEditor from './TemplateEditor.jsx';
import WorkoutDetail from './WorkoutDetail.jsx';

export default function HomeScreen() {
  const { startWorkout } = useContext(AppContext);
  const [editing, setEditing] = useState(null);
  const [viewingWorkout, setViewingWorkout] = useState(null);
  const [, forceUpdate] = useState(0);

  const templates = useMemo(() => {
    const t = getTemplates();
    return t.sort((a, b) => {
      if (!a.lastCompletedAt && !b.lastCompletedAt) return 0;
      if (!a.lastCompletedAt) return -1;
      if (!b.lastCompletedAt) return -1;
      return new Date(a.lastCompletedAt) - new Date(b.lastCompletedAt);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, forceUpdate]);

  const workouts = useMemo(() => {
    return getWorkouts().sort((a, b) =>
      new Date(b.completedAt) - new Date(a.completedAt)
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, forceUpdate]);

  if (viewingWorkout) {
    return <WorkoutDetail workout={viewingWorkout} onBack={() => setViewingWorkout(null)} />;
  }

  if (editing) {
    return (
      <TemplateEditor
        template={editing}
        onSave={(t) => {
          saveTemplate(t);
          setEditing(null);
          forceUpdate(n => n + 1);
        }}
        onDelete={(id) => {
          deleteTemplate(id);
          setEditing(null);
          forceUpdate(n => n + 1);
        }}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Workout</h1>
      </div>

      {/* Templates */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span className="section-header" style={{ margin: 0 }}>Templates</span>
          <button
            onClick={() => setEditing({ id: generateId(), name: '', exercises: [], supersets: [] })}
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

        {templates.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px 24px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            <span>Create your first template to get started</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {templates.map(t => (
              <div key={t.id} className="card" style={{ position: 'relative' }}>
                <button
                  onClick={() => startWorkout(t)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: 0,
                    background: 'none',
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                    {t.name || 'Untitled Template'}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {formatRelativeTime(t.lastCompletedAt)}
                    {t.exercises.length > 0 && ` · ${t.exercises.length} exercise${t.exercises.length > 1 ? 's' : ''}`}
                  </div>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setEditing(t); }}
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    padding: '4px 8px',
                    color: 'var(--text-muted)',
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workout History */}
      <div>
        <span className="section-header">History</span>

        {workouts.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
            Complete a workout to see it here
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {workouts.map(w => (
              <button
                key={w.id}
                className="card"
                onClick={() => setViewingWorkout(w)}
                style={{ textAlign: 'left', cursor: 'pointer' }}
              >
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>
                  {w.templateName || 'Workout'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {formatDate(w.completedAt)} · {w.exercises.length} exercise{w.exercises.length !== 1 ? 's' : ''}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
