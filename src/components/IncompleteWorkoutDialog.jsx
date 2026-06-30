import { createPortal } from 'react-dom';

export default function IncompleteWorkoutDialog({ incompleteCount, onFinishAsIs, onAutoFill, onGoBack }) {
  return createPortal(
    <div className="confirm-overlay" onClick={onGoBack}>
      <div
        className="confirm-content"
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{
          fontSize: 16,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 8,
        }}>
          Unfinished Sets
        </h3>
        <p style={{
          fontSize: 14,
          color: 'var(--text-secondary)',
          marginBottom: 24,
          lineHeight: 1.5,
        }}>
          You have {incompleteCount} incomplete {incompleteCount === 1 ? 'set' : 'sets'}. What would you like to do?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            className="btn btn-primary"
            onClick={onAutoFill}
            style={{ width: '100%' }}
          >
            Complete All & Finish
          </button>
          <button
            className="btn"
            onClick={onFinishAsIs}
            style={{
              width: '100%',
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
          >
            Skip Incomplete
          </button>
          <button
            className="btn"
            onClick={onGoBack}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
