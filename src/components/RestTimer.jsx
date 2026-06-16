import { useState, useEffect, useRef } from 'react';
import { formatTimer } from '../utils/helpers.js';

export default function RestTimer({ duration, onDismiss }) {
  const [remaining, setRemaining] = useState(duration);
  const intervalRef = useRef(null);
  const total = duration;

  useEffect(() => {
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
  }, []);

  const progress = remaining / total;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px 0',
      gap: 12,
    }}>
      <div style={{ position: 'relative', width: 96, height: 96 }}>
        <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="48" cy="48" r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth="4"
          />
          <circle
            cx="48" cy="48" r={radius}
            fill="none"
            stroke={remaining === 0 ? 'var(--green)' : 'var(--accent)'}
            strokeWidth="4"
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
          fontSize: 22,
          fontWeight: 600,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {formatTimer(remaining)}
        </div>
      </div>

      {remaining === 0 ? (
        <div style={{ fontSize: 14, color: 'var(--green)', fontWeight: 500 }}>
          Time's up!
        </div>
      ) : null}

      <button
        onClick={() => {
          clearInterval(intervalRef.current);
          onDismiss();
        }}
        style={{
          padding: '8px 24px',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 500,
          color: 'var(--text-muted)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
        }}
      >
        {remaining === 0 ? 'Dismiss' : 'Skip'}
      </button>
    </div>
  );
}
