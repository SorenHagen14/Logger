import { useState } from 'react';
import { createPortal } from 'react-dom';
import { APP_VERSION, RELEASE_NOTES } from '../data/releaseNotes.js';

const STORAGE_KEY = 'app_version_seen';

function shouldShow() {
  const seen = localStorage.getItem(STORAGE_KEY);
  return seen !== null && seen !== APP_VERSION;
}

export default function WhatsNew() {
  const [visible, setVisible] = useState(shouldShow);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, APP_VERSION);
    setVisible(false);
  }

  if (!visible || RELEASE_NOTES.length === 0) {
    if (localStorage.getItem(STORAGE_KEY) !== APP_VERSION) {
      localStorage.setItem(STORAGE_KEY, APP_VERSION);
    }
    return null;
  }

  return createPortal(
    <div className="confirm-overlay" onClick={dismiss}>
      <div className="confirm-content" onClick={e => e.stopPropagation()}>
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--accent)',
          marginBottom: 6,
        }}>
          v{APP_VERSION}
        </div>
        <h3 style={{
          fontSize: 16,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 16,
        }}>
          What's New
        </h3>
        <div style={{
          marginBottom: 24,
          padding: '14px 0',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          {RELEASE_NOTES.map((note, i) => (
            <div key={i} style={{
              fontSize: 14,
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              paddingLeft: 14,
              position: 'relative',
            }}>
              <span style={{
                position: 'absolute',
                left: 0,
                color: 'var(--text-muted)',
              }}>
                —
              </span>
              {note}
            </div>
          ))}
        </div>
        <button
          className="btn btn-primary"
          onClick={dismiss}
          style={{ width: '100%' }}
        >
          Got It
        </button>
      </div>
    </div>,
    document.body
  );
}
