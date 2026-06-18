import { useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../data/supabase.js';

export default function AuthModal({ onClose }) {
  const [step, setStep] = useState('email'); // 'email' | 'code'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function sendCode(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setStep('code');
  }

  async function verifyCode(e) {
    e.preventDefault();
    if (code.length < 6) return;
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code.trim(),
      type: 'email',
    });
    setLoading(false);
    if (err) { setError('Invalid or expired code. Try again.'); return; }
    onClose();
  }

  const inputStyle = {
    width: '100%',
    height: 52,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    padding: '0 16px',
    fontSize: 16,
    color: 'var(--text)',
    letterSpacing: step === 'code' ? '0.25em' : 'normal',
    textAlign: step === 'code' ? 'center' : 'left',
    fontWeight: step === 'code' ? 700 : 400,
  };

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
          {step === 'email' ? 'Sign In' : 'Check Your Email'}
        </h3>

        {step === 'email' ? (
          <>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
              Enter your email to receive a 6-digit login code. Your workouts will sync across all your devices.
            </p>
            <form onSubmit={sendCode}>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={inputStyle}
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
                {loading ? 'Sending…' : 'Send Code'}
              </button>
            </form>
          </>
        ) : (
          <>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
              A 6-digit code was sent to <strong style={{ color: 'var(--text)' }}>{email}</strong>. Enter it below.
            </p>
            <form onSubmit={verifyCode}>
              <input
                type="number"
                inputMode="numeric"
                placeholder="000000"
                value={code}
                onChange={e => setCode(e.target.value.slice(0, 6))}
                style={inputStyle}
                autoFocus
              />
              {error && (
                <p style={{ fontSize: 12, color: 'var(--red)', marginTop: 8 }}>{error}</p>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || code.length < 6}
                style={{ width: '100%', marginTop: 16, opacity: loading ? 0.6 : 1 }}
              >
                {loading ? 'Verifying…' : 'Sign In'}
              </button>
              <button
                type="button"
                onClick={() => { setStep('email'); setCode(''); setError(''); }}
                style={{
                  width: '100%',
                  marginTop: 10,
                  padding: '12px',
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  background: 'transparent',
                  textDecoration: 'underline',
                }}
              >
                Use a different email
              </button>
            </form>
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
