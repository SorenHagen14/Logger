import { useRegisterSW } from 'virtual:pwa-register/react';

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      if (!registration) return;
      setInterval(() => { registration.update(); }, 60 * 60 * 1000);
    },
  });

  if (!needRefresh) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 'calc(var(--nav-height) + var(--safe-bottom) + 12px)',
      left: 16,
      right: 16,
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 9999,
      gap: 12,
    }}>
      <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
        Update available
      </span>
      <button
        onClick={() => updateServiceWorker(true)}
        style={{
          background: 'var(--accent)',
          color: 'var(--accent-text)',
          padding: '8px 16px',
          fontSize: 13,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          minHeight: 36,
        }}
      >
        Refresh
      </button>
    </div>
  );
}
