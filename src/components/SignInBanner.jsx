import { supabase } from '../data/supabase.js';

export default function SignInBanner({ onDismiss }) {
  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname,
      },
    });
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 16px',
      background: 'var(--accent-dim)',
      borderBottom: '1px solid var(--accent)',
      minHeight: 44,
    }}>
      <span style={{
        flex: 1,
        fontSize: 12,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: 'var(--text-secondary)',
        lineHeight: 1.4,
      }}>
        Back up your data — sign in to keep your templates &amp; workouts safe
      </span>

      <button
        onClick={signInWithGoogle}
        style={{
          flexShrink: 0,
          height: 44,
          padding: '0 14px',
          background: 'var(--accent)',
          color: 'var(--accent-text)',
          border: 'none',
          fontSize: 11,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Sign In
      </button>

      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        style={{
          flexShrink: 0,
          width: 44,
          height: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          fontSize: 18,
          cursor: 'pointer',
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
}
