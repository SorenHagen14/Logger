import { createPortal } from 'react-dom';

export default function ConfirmDialog({ title, message, summary, confirmText = 'Confirm', cancelText = 'Cancel', danger = false, onConfirm, onCancel }) {
  return createPortal(
    <div className="confirm-overlay" onClick={onCancel}>
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
          {title}
        </h3>
        <p style={{
          fontSize: 14,
          color: 'var(--text-secondary)',
          marginBottom: summary ? 16 : 24,
          lineHeight: 1.5,
        }}>
          {message}
        </p>
        {summary && summary.length > 0 && (
          <div style={{
            marginBottom: 24,
            padding: '12px 0',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}>
            {summary.map((line, i) => (
              <div key={i} style={{
                fontSize: 13,
                color: 'var(--text-secondary)',
                letterSpacing: '0.02em',
              }}>
                {line}
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="btn"
            onClick={onCancel}
            style={{
              flex: 1,
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
          >
            {cancelText}
          </button>
          <button
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            style={{ flex: 1 }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
