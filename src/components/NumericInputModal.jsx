import { useState } from 'react';

export default function NumericInputModal({ value, label, allowDecimal, placeholder, onConfirm, onClose }) {
  const [display, setDisplay] = useState(String(value ?? ''));

  const handleKey = (key) => {
    if (key === 'back') {
      setDisplay(prev => prev.slice(0, -1));
    } else if (key === '.') {
      if (display.includes('.')) return;
      setDisplay(prev => prev === '' ? '0.' : prev + '.');
    } else {
      if (display === '0') {
        setDisplay(key);
      } else {
        setDisplay(prev => prev + key);
      }
    }
  };

  const handleDone = () => {
    onConfirm(display);
    onClose();
  };

  const rows = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    [allowDecimal ? '.' : null, '0', 'back'],
  ];

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
      onClick={handleDone}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg)',
          borderTop: '1px solid var(--border)',
          animation: 'slideUp 0.22s ease-out',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: '1px solid var(--border)',
        }}>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--text-secondary)',
          }}>
            {label}
          </span>
          <button
            onClick={handleDone}
            style={{ color: 'var(--text-muted)', padding: '4px 8px', lineHeight: 0 }}
            aria-label="Dismiss keyboard"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>

        {/* Value Display */}
        <div style={{
          padding: '20px 24px 16px',
          textAlign: 'center',
          minHeight: 96,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
            color: display ? 'var(--text)' : 'var(--text-muted)',
          }}>
            {display || placeholder || '—'}
          </span>
        </div>

        {/* Keypad */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1,
          background: 'var(--border)',
        }}>
          {rows.flat().map((key, i) => {
            if (key === null) {
              return <div key={i} style={{ background: 'var(--bg)', height: 68 }} />;
            }
            const isBack = key === 'back';
            return (
              <button
                key={i}
                onPointerDown={(e) => { e.preventDefault(); handleKey(key); }}
                style={{
                  height: 68,
                  background: 'var(--surface)',
                  fontSize: isBack ? 22 : 26,
                  fontWeight: isBack ? 400 : 500,
                  fontVariantNumeric: 'tabular-nums',
                  color: isBack ? 'var(--text-secondary)' : 'var(--text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  WebkitTapHighlightColor: 'transparent',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                {isBack ? (
                  <svg width="26" height="20" viewBox="0 0 40 28" fill="none">
                    <path d="M15 2H38C39.1 2 40 2.9 40 4V24C40 25.1 39.1 26 38 26H15L2 14L15 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    <line x1="20" y1="10" x2="33" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="33" y1="10" x2="20" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ) : key}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
