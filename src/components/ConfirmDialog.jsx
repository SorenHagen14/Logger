export default function ConfirmDialog({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', danger = false, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ padding: 24 }}
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
          marginBottom: 24,
          lineHeight: 1.5,
        }}>
          {message}
        </p>
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
    </div>
  );
}
