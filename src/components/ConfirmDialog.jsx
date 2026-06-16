export default function ConfirmDialog({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', danger = false, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ borderRadius: 16, padding: 24 }}
      >
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{title}</h3>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.5 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="btn"
            onClick={onCancel}
            style={{
              flex: 1,
              background: 'var(--surface)',
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
