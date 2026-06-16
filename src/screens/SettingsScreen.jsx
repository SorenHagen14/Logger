import { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../data/db.js';

export default function SettingsScreen() {
  const [settings, setSettings] = useState(getSettings());

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const restMinutes = Math.floor(settings.defaultRestTimerSeconds / 60);
  const restSeconds = settings.defaultRestTimerSeconds % 60;

  return (
    <div className="screen">
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Settings</h1>

      {/* Rest Timer */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Default Rest Timer</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Min</div>
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
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 18,
                fontWeight: 600,
              }}
            />
          </div>
          <span style={{ fontSize: 24, fontWeight: 300, color: 'var(--text-muted)', paddingTop: 20 }}>:</span>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Sec</div>
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
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 18,
                fontWeight: 600,
              }}
            />
          </div>
        </div>
      </div>

      {/* Weight Unit */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Default Weight Unit</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['lbs', 'kg'].map(unit => (
            <button
              key={unit}
              onClick={() => setSettings(prev => ({ ...prev, defaultWeightUnit: unit }))}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                background: settings.defaultWeightUnit === unit ? 'var(--accent)' : 'var(--bg)',
                color: settings.defaultWeightUnit === unit ? 'white' : 'var(--text-muted)',
                border: `1px solid ${settings.defaultWeightUnit === unit ? 'var(--accent)' : 'var(--border)'}`,
                transition: 'all 0.15s',
              }}
            >
              {unit.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Data</div>
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
            padding: '12px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            background: 'var(--bg)',
            color: 'var(--accent)',
            border: '1px solid var(--border)',
            marginBottom: 8,
          }}
        >
          Export Backup
        </button>
        <label
          style={{
            display: 'block',
            width: '100%',
            padding: '12px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            background: 'var(--bg)',
            color: 'var(--accent)',
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

      <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>
        Workout Logger v1.0
      </div>
    </div>
  );
}
