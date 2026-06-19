import { useState, useEffect, useContext } from 'react';
import { getSettings, saveSettings } from '../data/db.js';
import { AppContext } from '../App.jsx';
import StrongImport from '../components/StrongImport.jsx';
import AuthModal from '../components/AuthModal.jsx';
import { supabase } from '../data/supabase.js';

export default function SettingsScreen() {
  const [settings, setSettings] = useState(getSettings());
  const [showStrongImport, setShowStrongImport] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(null);
  const ctx = useContext(AppContext);
  const { user, syncing } = ctx;

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const restMinutes = Math.floor(settings.defaultRestTimerSeconds / 60);
  const restSeconds = settings.defaultRestTimerSeconds % 60;

  return (
    <div className="screen">
      <h1 style={{
        fontSize: 40,
        fontWeight: 800,
        letterSpacing: '-0.03em',
        textTransform: 'uppercase',
        marginBottom: 32,
      }}>
        Settings
      </h1>

      {/* Account / Sync */}
      <div style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '20px 0',
        marginBottom: 24,
      }}>
        <div className="label" style={{ marginBottom: 14 }}>Account</div>
        {user ? (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 12,
            }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: syncing ? 'var(--yellow)' : 'var(--green)',
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </span>
            </div>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                ctx.forceUpdate();
              }}
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
                textAlign: 'center',
              }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>
              Sign in to sync your workouts and templates across all your devices.
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: 13,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                background: 'var(--accent)',
                color: 'var(--accent-text)',
                border: 'none',
                textAlign: 'center',
              }}
            >
              Sign In
            </button>
          </div>
        )}
      </div>

      {/* Rest Timer */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        padding: '20px 0',
        marginBottom: 24,
      }}>
        <div className="label" style={{ marginBottom: 14 }}>Default Rest Timer</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div>
            <div className="label" style={{ marginBottom: 4 }}>Min</div>
            <input
              type="number"
              value={restMinutes}
              onChange={e => {
                const m = Math.max(0, parseInt(e.target.value) || 0);
                setSettings(prev => ({ ...prev, defaultRestTimerSeconds: m * 60 + restSeconds }));
              }}
              style={{
                width: 56,
                height: 44,
                textAlign: 'center',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                fontSize: 18,
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
              }}
            />
          </div>
          <span style={{ fontSize: 24, fontWeight: 300, color: 'var(--text-muted)', paddingTop: 20 }}>:</span>
          <div>
            <div className="label" style={{ marginBottom: 4 }}>Sec</div>
            <input
              type="number"
              value={restSeconds}
              onChange={e => {
                const s = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                setSettings(prev => ({ ...prev, defaultRestTimerSeconds: restMinutes * 60 + s }));
              }}
              style={{
                width: 56,
                height: 44,
                textAlign: 'center',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                fontSize: 18,
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
              }}
            />
          </div>
        </div>
      </div>

      {/* Weight Unit */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        padding: '0 0 24px',
        marginBottom: 24,
      }}>
        <div className="label" style={{ marginBottom: 14 }}>Default Weight Unit</div>
        <div style={{ display: 'flex', gap: 1, background: 'var(--border)' }}>
          {['lbs', 'kg'].map(unit => (
            <button
              key={unit}
              onClick={() => setSettings(prev => ({ ...prev, defaultWeightUnit: unit }))}
              style={{
                flex: 1,
                height: 44,
                fontSize: 13,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                background: settings.defaultWeightUnit === unit ? 'var(--accent)' : 'var(--surface)',
                color: settings.defaultWeightUnit === unit ? 'var(--accent-text)' : 'var(--text-muted)',
                transition: 'all 0.15s',
              }}
            >
              {unit}
            </button>
          ))}
        </div>
      </div>

      {/* Data */}
      <div style={{ marginBottom: 24 }}>
        <div className="label" style={{ marginBottom: 14 }}>Data</div>
        <button
          onClick={() => {
            const data = {
              exercises: localStorage.getItem('wl_exercises'),
              templates: localStorage.getItem('wl_templates'),
              workouts: localStorage.getItem('wl_workouts'),
              settings: localStorage.getItem('wl_settings'),
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `logger-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: 13,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            background: 'transparent',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            marginBottom: 8,
            textAlign: 'center',
          }}
        >
          Export Training Data
        </button>
        <button
          onClick={() => setShowImportModal(true)}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: 13,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            background: 'transparent',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            textAlign: 'center',
          }}
        >
          Import Training Data
        </button>
      </div>

      {/* Feedback */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: '20px 0',
        marginBottom: 24,
      }}>
        <div className="label" style={{ marginBottom: 14 }}>Feedback</div>
        <a
          href="mailto:sorenhagen14@gmail.com?subject=Logger%20Feedback"
          style={{
            display: 'block',
            width: '100%',
            padding: '14px',
            fontSize: 13,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            background: 'transparent',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            textAlign: 'center',
            textDecoration: 'none',
          }}
        >
          Report Bug / Request Feature
        </a>
      </div>

      <div style={{
        textAlign: 'center',
        padding: '32px 0',
        color: 'var(--text-muted)',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      }}>
        Workout Logger v1.0
      </div>

      {showStrongImport && (
        <StrongImport
          onClose={() => setShowStrongImport(false)}
          onImported={() => ctx.forceUpdate()}
        />
      )}

      {showAuthModal && (
        <AuthModal onClose={() => { setShowAuthModal(false); ctx.forceUpdate(); }} />
      )}

      {showImportModal && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
          onClick={() => setShowImportModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              borderTop: '1px solid var(--border)',
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
            }}
          >
            <div style={{
              padding: '20px 16px 16px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span className="label">How to import from</span>
              <button onClick={() => setShowImportModal(false)} style={{ color: 'var(--text-muted)', fontSize: 20, lineHeight: 1, padding: '4px 8px' }}>✕</button>
            </div>
            {[{ id: 'strong', label: 'Strong' }].map(app => (
              <div
                key={app.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <button
                  onClick={() => { setShowImportModal(false); setShowStrongImport(true); }}
                  style={{
                    flex: 1,
                    padding: '16px',
                    textAlign: 'left',
                    fontSize: 14,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--text)',
                  }}
                >
                  {app.label}
                </button>
                <button
                  onClick={() => setShowInstructions(app.id)}
                  style={{
                    padding: '16px',
                    color: 'var(--text-muted)',
                    fontSize: 16,
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                  aria-label={`How to export from ${app.label}`}
                >
                  ?
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showInstructions === 'strong' && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
          onClick={() => setShowInstructions(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              borderTop: '1px solid var(--border)',
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
            }}
          >
            <div style={{
              padding: '20px 16px 16px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span className="label">Export from Strong</span>
              <button onClick={() => setShowInstructions(null)} style={{ color: 'var(--text-muted)', fontSize: 20, lineHeight: 1, padding: '4px 8px' }}>✕</button>
            </div>
            <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {['Open the Strong app', 'Tap the Profile tab', 'Scroll down and tap Settings', 'Tap Export Data', 'Choose CSV format and share the file'].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--accent)',
                    letterSpacing: '0.06em',
                    paddingTop: 2,
                    flexShrink: 0,
                    width: 16,
                    textAlign: 'right',
                  }}>{i + 1}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
