import { useState, useContext, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AppContext } from '../App.jsx';
import { getTemplates, getWorkouts, getExercises, saveTemplate, deleteTemplate } from '../data/db.js';
import { generateId, formatRelativeTime, formatDate } from '../utils/helpers.js';
import { shareTemplate, shareAllTemplates } from '../utils/share.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function HomeScreen() {
  const { startWorkout, setEditingTemplate, setViewingWorkout, forceUpdate } = useContext(AppContext);
  const [confirmStart, setConfirmStart] = useState(null);
  const [menuTemplate, setMenuTemplate] = useState(null);
  const [renameTemplate, setRenameTemplate] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const renameInputRef = useRef(null);

  const allExercises = getExercises();
  const getExName = (id) => allExercises.find(e => e.id === id)?.name || 'Unknown';

  const buildSummary = (template) => {
    if (!template?.exercises?.length) return [];
    return template.exercises.map(ex => {
      const setCount = ex.sets?.length || ex.defaultSets || 3;
      return `${setCount} x ${getExName(ex.exerciseId)}`;
    });
  };

  const templates = getTemplates().sort((a, b) => {
    if (!a.lastCompletedAt && !b.lastCompletedAt) return 0;
    if (!a.lastCompletedAt) return -1;
    if (!b.lastCompletedAt) return 1;
    return new Date(a.lastCompletedAt) - new Date(b.lastCompletedAt);
  });

  const workouts = getWorkouts().sort((a, b) =>
    new Date(b.completedAt) - new Date(a.completedAt)
  );

  const totalWorkouts = workouts.length;

  const handleRename = () => {
    if (!renameTemplate) return;
    const updated = { ...renameTemplate, name: renameValue || 'Untitled' };
    saveTemplate(updated);
    setRenameTemplate(null);
    forceUpdate();
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    deleteTemplate(deleteConfirm.id);
    setDeleteConfirm(null);
    forceUpdate();
  };

  return (
    <div className="screen">
      {/* Hero */}
      <div style={{ marginBottom: 40, paddingTop: 12 }}>
        <h1 style={{
          fontSize: 44,
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.05,
          marginBottom: 8,
        }}>
          <span className="serif-italic" style={{ color: 'var(--accent)' }}>
            Logger
          </span>
        </h1>
      </div>

      {/* Sessions Stat */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        padding: '20px 16px',
        marginBottom: 32,
      }}>
        <div className="label" style={{ margin: 0 }}>
          Sessions Completed
        </div>
        <div style={{
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
          marginTop: 8,
        }}>
          {totalWorkouts}
        </div>
      </div>

      {/* Templates */}
      <div style={{ marginBottom: 40 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}>
          <span className="label">Templates</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {templates.length > 0 && (
              <button
                onClick={() => shareAllTemplates(templates)}
                style={{
                  width: 44,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  fontSize: 18,
                  lineHeight: 1,
                }}
              >
                &#x22EE;
              </button>
            )}
            <button
              onClick={() => setEditingTemplate({ id: generateId(), name: '', exercises: [], supersets: [] })}
              style={{
                width: 44,
                height: 44,
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
        </div>

        {templates.length === 0 ? (
          <div className="empty-state" style={{
            padding: '32px 24px',
            border: '1px solid var(--border)',
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Create your first template
            </span>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {templates.map(t => (
              <div
                key={t.id}
                onClick={() => setConfirmStart(t)}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  padding: '16px',
                  position: 'relative',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  fontSize: 15,
                  fontWeight: 700,
                  marginBottom: 8,
                  paddingRight: 36,
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                  lineHeight: 1.3,
                }}>
                  {t.name || 'Untitled Template'}
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  <span>{formatRelativeTime(t.lastCompletedAt)}</span>
                  {t.exercises.length > 0 && (
                    <span>{t.exercises.length} exercise{t.exercises.length !== 1 ? 's' : ''}</span>
                  )}
                </div>
                {/* Arrow indicator — decorative only */}
                <div style={{
                  position: 'absolute',
                  bottom: 12,
                  right: 12,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--ghost)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  pointerEvents: 'none',
                }}>
                  &rsaquo;
                </div>
                {/* Menu button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuTemplate(t);
                  }}
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    width: 44,
                    height: 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    fontSize: 16,
                    lineHeight: 1,
                  }}
                >
                  &#x22EE;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workout History */}
      <div>
        <button
          onClick={() => setHistoryOpen(prev => !prev)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            padding: '12px 0',
            marginBottom: historyOpen ? 4 : 0,
            background: 'none',
          }}
        >
          <span className="label" style={{ margin: 0 }}>History</span>
          <span style={{
            color: 'var(--text-muted)',
            fontSize: 18,
            lineHeight: 1,
            transition: 'transform 0.2s',
            transform: historyOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}>
            &#x25BE;
          </span>
        </button>

        {historyOpen && <div style={{ borderTop: '1px solid var(--border)' }}>
          {workouts.length === 0 ? (
            <div style={{
              padding: '24px 0',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: 13,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              Complete a workout to see it here
            </div>
          ) : (
            workouts.map(w => (
              <button
                key={w.id}
                onClick={() => setViewingWorkout(w)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '14px 0',
                  borderBottom: '1px solid var(--border)',
                  background: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{
                    fontSize: 15,
                    fontWeight: 600,
                    marginBottom: 2,
                    letterSpacing: '-0.01em',
                  }}>
                    {w.templateName || 'Workout'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {formatDate(w.completedAt)} · {w.exercises.length} exercise{w.exercises.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>&rsaquo;</span>
              </button>
            ))
          )}
        </div>}
      </div>

      {confirmStart && (
        <ConfirmDialog
          title={`Start ${confirmStart.name || 'Untitled Template'}?`}
          message="This will begin a new workout session."
          summary={buildSummary(confirmStart)}
          confirmText="Start"
          onConfirm={() => {
            startWorkout(confirmStart);
            setConfirmStart(null);
          }}
          onCancel={() => setConfirmStart(null)}
        />
      )}

      {menuTemplate && createPortal(
        <div className="modal-overlay" onClick={() => setMenuTemplate(null)}>
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
                {menuTemplate.name || 'Untitled Template'}
              </h3>
              <button onClick={() => setMenuTemplate(null)} style={{
                color: 'var(--text-muted)',
                fontSize: 28,
                lineHeight: 1,
                padding: 4,
              }}>
                &times;
              </button>
            </div>

            <button
              onClick={() => {
                const t = menuTemplate;
                setMenuTemplate(null);
                setEditingTemplate(t);
              }}
              style={MENU_ITEM_STYLE}
            >
              <span style={{ fontSize: 16 }}>&#x270E;</span> Edit Template
            </button>
            <button
              onClick={() => {
                const t = menuTemplate;
                setRenameValue(t.name || '');
                setRenameTemplate(t);
                setMenuTemplate(null);
                setTimeout(() => renameInputRef.current?.focus(), 100);
              }}
              style={MENU_ITEM_STYLE}
            >
              <span style={{ fontSize: 16 }}>Aa</span> Rename
            </button>
            <button
              onClick={() => {
                const t = menuTemplate;
                setMenuTemplate(null);
                shareTemplate(t);
              }}
              style={MENU_ITEM_STYLE}
            >
              <span style={{ fontSize: 16 }}>&#x2197;</span> Share
            </button>
            <button
              onClick={() => {
                const t = menuTemplate;
                setMenuTemplate(null);
                setDeleteConfirm(t);
              }}
              style={{ ...MENU_ITEM_STYLE, color: 'var(--red)', borderBottom: 'none' }}
            >
              <span style={{ fontSize: 16 }}>&#x2715;</span> Delete
            </button>
          </div>
        </div>,
        document.body
      )}

      {renameTemplate && createPortal(
        <div className="modal-overlay" onClick={() => setRenameTemplate(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: 24 }}>
            <h3 style={{
              fontSize: 14,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 16,
            }}>
              Rename Template
            </h3>
            <input
              ref={renameInputRef}
              type="text"
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleRename(); }}
              placeholder="Template name"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: 15,
                fontWeight: 600,
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                marginBottom: 20,
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="btn"
                onClick={() => setRenameTemplate(null)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleRename}
                style={{ flex: 1 }}
              >
                Save
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {deleteConfirm && (
        <ConfirmDialog
          title="Delete Template"
          message={`Delete "${deleteConfirm.name || 'Untitled'}"? This cannot be undone.`}
          confirmText="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(null)}
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
