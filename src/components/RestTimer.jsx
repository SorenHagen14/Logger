import { useState, useEffect, useRef } from 'react';
import { formatTimer } from '../utils/helpers.js';

export default function RestTimer({ duration, active, onDismiss, onDurationChange }) {
  const [remaining, setRemaining] = useState(duration);
  const [editing, setEditing] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!active) {
      clearInterval(intervalRef.current);
      setRemaining(duration);
      return;
    }
    setRemaining(duration);
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [active, duration]);

  const progress = active ? remaining / duration : 1;
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);
  const done = active && remaining === 0;

  const adjustDuration = (delta) => {
    const next = Math.max(15, duration + delta);
    onDurationChange(next);
  };

  if (editing && !active) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: '10px 4px',
        borderTop: '1px solid var(--border)',
      }}>
        <button
          onClick={() => adjustDuration(-15)}
          style={{
            width: 32, height: 32,
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            fontSize: 16, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          −
        </button>
        <span style={{
          fontSize: 18,
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          minWidth: 50,
          textAlign: 'center',
        }}>
          {formatTimer(duration)}
        </span>
        <button
          onClick={() => adjustDuration(15)}
          style={{
            width: 32, height: 32,
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            fontSize: 16, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          +
        </button>
        <button
          onClick={() => setEditing(false)}
          style={{
            padding: '4px 12px',
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-secondary)',
          }}
        >
          Done
        </button>
      </div>
    );
  }

  if (!active) {
    return (
      <button
        onClick={() => setEditing(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '6px 4px',
          borderTop: '1px solid var(--border)',
          width: '100%',
        }}
      >
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>⏱</span>
        <span style={{
          fontSize: 12,
          color: 'var(--text-muted)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {formatTimer(duration)}
        </span>
      </button>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      padding: '8px 4px',
      background: done ? 'var(--green-dim)' : 'var(--highlight)',
      borderTop: '1px solid var(--border)',
    }}>
      <div style={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}>
        <svg width="36" height="36" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="18" cy="18" r={radius} fill="none" stroke="var(--border)" strokeWidth="2.5" />
          <circle
            cx="18" cy="18" r={radius}
            fill="none"
            stroke={done ? 'var(--green)' : 'var(--text-secondary)'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          color: done ? 'var(--green)' : 'var(--text)',
        }}>
          {formatTimer(remaining)}
        </div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 500, color: done ? 'var(--green)' : 'var(--text-muted)' }}>
        {done ? "Time's up!" : 'Rest'}
      </div>

      <button
        onClick={() => { clearInterval(intervalRef.current); onDismiss(); }}
        style={{
          padding: '6px 14px',
          fontSize: 12,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: done ? 'var(--bg)' : 'var(--text-muted)',
          background: done ? 'var(--green)' : 'transparent',
          border: `1px solid ${done ? 'var(--green)' : 'var(--border)'}`,
          flexShrink: 0,
        }}
      >
        {done ? 'Dismiss' : 'Skip'}
      </button>
    </div>
  );
}
