import { useEffect } from 'react';

export default function UndoToast({ message, onUndo, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="toast">
      <span style={{ fontSize: 14 }}>{message}</span>
      <button
        onClick={onUndo}
        style={{
          color: 'var(--accent)',
          fontWeight: 600,
          fontSize: 14,
          padding: '4px 8px',
        }}
      >
        Undo
      </button>
      <div className="toast-progress" />
    </div>
  );
}
