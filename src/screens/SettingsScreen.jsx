import { useState, useEffect, useContext } from 'react';
import { getSettings, saveSettings, getTemplates, getExercises } from '../data/db.js';
import { AppContext } from '../App.jsx';
import StrongImport from '../components/StrongImport.jsx';

export default function SettingsScreen() {
  const [settings, setSettings] = useState(getSettings());
  const [showStrongImport, setShowStrongImport] = useState(false);
  const ctx = useContext(AppContext);

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

      {/* Rest Timer */}
      <div style={{
        borderTop: '1px solid var(--border)',
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

      {/* Import from Strong */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        padding: '0 0 24px',
        marginBottom: 24,
      }}>
        <div className="label" style={{ marginBottom: 14 }}>Import</div>
        <button
          onClick={() => setShowStrongImport(true)}
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
          Import from Strong
        </button>
      </div>

      {/* Data Management */}
      <div style={{ marginBottom: 24 }}>
        <div className="label" style={{ marginBottom: 14 }}>Data</div>
        <button
          onClick={async () => {
            const templates = getTemplates();
            const allExercises = getExercises();
            const getName = (id) => allExercises.find(e => e.id === id)?.name || 'Unknown';

            const rows = [['Template', 'Exercise', 'Set Number', 'Set Type']];
            for (const t of templates) {
              for (const ex of (t.exercises || [])) {
                const sets = ex.sets || Array.from({ length: ex.defaultSets || 3 }, () => ({ setType: 'normal' }));
                sets.forEach((s, i) => {
                  rows.push([
                    `"${t.name.replace(/"/g, '""')}"`,
                    `"${getName(ex.exerciseId).replace(/"/g, '""')}"`,
                    String(i + 1),
                    s.setType || 'normal',
                  ]);
                });
              }
            }

            const csv = rows.map(r => r.join(',')).join('\n');
            const filename = `workout-templates-${new Date().toISOString().split('T')[0]}.csv`;
            const file = new File([csv], filename, { type: 'text/csv' });

            if (navigator.canShare?.({ files: [file] })) {
              try {
                await navigator.share({ files: [file], title: 'Workout Templates' });
              } catch { /* user cancelled share */ }
            } else {
              const url = URL.createObjectURL(file);
              const a = document.createElement('a');
              a.href = url;
              a.download = filename;
              a.click();
              URL.revokeObjectURL(url);
            }
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
          Export Templates CSV
        </button>
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
            a.download = `workout-backup-${new Date().toISOString().split('T')[0]}.json`;
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
          Export Backup
        </button>
        <label
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
            cursor: 'pointer',
          }}
        >
          Import Backup
          <input
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={e => {
              const file = e.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (event) => {
                try {
                  const data = JSON.parse(event.target.result);
                  if (data.exercises) localStorage.setItem('wl_exercises', data.exercises);
                  if (data.templates) localStorage.setItem('wl_templates', data.templates);
                  if (data.workouts) localStorage.setItem('wl_workouts', data.workouts);
                  if (data.settings) localStorage.setItem('wl_settings', data.settings);
                  window.location.reload();
                } catch {
                  alert('Invalid backup file');
                }
              };
              reader.readAsText(file);
            }}
          />
        </label>
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
    </div>
  );
}
