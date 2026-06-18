import { createPortal } from 'react-dom';
import { supabase } from '../data/supabase.js';

export default function AuthModal({ onClose }) {
  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname,
      },
    });
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ padding: 28 }}
      >
        <h3 style={{
          fontSize: 18,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 6,
        }}>
          Sign In
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
          Sign in with Google to sync your workouts across devices. No password needed.
        </p>
        <button
          onClick={signInWithGoogle}
          style={{
            width: '100%',
            height: 52,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            background: '#fff',
            color: '#1a1a1a',
            border: 'none',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <GoogleIcon />
          Sign in with Google
        </button>

        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            fontSize: 20,
            background: 'transparent',
          }}
        >
          ×
        </button>
      </div>
    </div>,
    document.body
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H24v7.5h11.1C33.6 32.4 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1 7.3 2.7l5.7-5.7C33.8 7.5 29.1 5.5 24 5.5 13.8 5.5 5.5 13.8 5.5 24S13.8 42.5 24 42.5c10.5 0 18-7.4 18-18 0-1.2-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M7 14.7l6.6 4.8C15.3 16 19.4 13.5 24 13.5c2.8 0 5.4 1 7.3 2.7l5.7-5.7C33.8 7.5 29.1 5.5 24 5.5c-7.3 0-13.6 4-17 10.2z"/>
      <path fill="#4CAF50" d="M24 42.5c5 0 9.7-1.9 13.2-5.1l-6.1-5.1C29.3 34 26.7 35 24 35c-5.3 0-9.6-2.6-11.1-7H6.7c3.4 6.3 9.8 10.5 17.3 10.5z"/>
      <path fill="#1976D2" d="M43.6 20.5H24v7.5h11.1c-.8 2.1-2.2 3.9-4.1 5.2l6.1 5.1c3.6-3.4 5.9-8.4 5.9-14.3 0-1.2-.1-2.4-.4-3.5z"/>
    </svg>
  );
}
