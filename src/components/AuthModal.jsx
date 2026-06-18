import { useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../data/supabase.js';

export default function AuthModal({ onClose }) {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function sendLink(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: true,
        emailRedirectTo: window.location.origin + window.location.pathname,
      },
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSent(true);
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
          {sent ? 'Check Your Email' : 'Sign In'}
        </h3>

        {!sent ? (
          <>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
              Enter your email and we'll send a sign-in link. Your workouts sync automatically once signed in.
            </p>
            <form onSubmit={sendLink}>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  height: 52,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  padding: '0 16px',
                  fontSize: 16,
                  color: 'var(--text)',
                }}
                autoFocus
                autoCapitalize="none"
                autoComplete="email"
              />
              {error && (
                <p style={{ fontSize: 12, color: 'var(--red)', marginTop: 8 }}>{error}</p>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !email.trim()}
                style={{ width: '100%', marginTop: 16, opacity: loading ? 0.6 : 1 }}
              >
                {loading ? 'Sending…' : 'Send Sign-in Link'}
              </button>
            </form>
          </>
        ) : (
          <>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
              A sign-in link was sent to{' '}
              <strong style={{ color: 'var(--text)' }}>{email}</strong>.
              Tap it and you'll be signed in automatically.
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
              The link opens this app in your browser. Come back here after tapping it — your data will sync automatically.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(''); }}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                background: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              Use a different email
            </button>
          </>
        )}

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
