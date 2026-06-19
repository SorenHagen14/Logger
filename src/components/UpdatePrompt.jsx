import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function UpdatePrompt() {
  const [dismissed, setDismissed] = useState(false);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      setInterval(() => { registration.update(); }, 60 * 60 * 1000);
    },
  });

  if (!needRefresh || dismissed) return null;

  return createPortal(
    <div className="confirm-overlay" onClick={() => setDismissed(true)}>
      <div className="confirm-content" onClick={e => e.stopPropagation()}>
        <h3 style={{
          fontSize: 16,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 8,
        }}>
          New Version Available
        </h3>
        <p style={{
          fontSize: 14,
          color: 'var(--text-secondary)',
          marginBottom: 24,
          lineHeight: 1.5,
        }}>
          A new version of Workout Logger is ready. Update now to get the latest features and fixes.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="btn"
            onClick={() => setDismissed(true)}
            style={{
              flex: 1,
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
          >
            Not Now
          </button>
          <button
            className="btn btn-primary"
            onClick={() => updateServiceWorker(true)}
            style={{ flex: 1 }}
          >
            Update
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
