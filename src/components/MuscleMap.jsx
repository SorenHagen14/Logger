import { useId } from 'react';

const FRONT_GROUPS = new Set(['Chest', 'Shoulders', 'Biceps', 'Core', 'Quads']);

export default function MuscleMap({ muscleGroup, size = 28 }) {
  const id = useId();
  const isFront = FRONT_GROUPS.has(muscleGroup);
  const clipId = `body${id.replace(/:/g, '')}`;

  const base = '#1E1E1E';
  const active = 'rgba(255,255,255,0.9)';
  const line = '#2A2A2A';

  return (
    <svg
      width={size}
      viewBox="0 0 80 150"
      style={{ flexShrink: 0, display: 'block' }}
    >
      <defs>
        <clipPath id={clipId}>
          <ellipse cx="40" cy="13" rx="9" ry="11" />
          <rect x="36" y="22" width="8" height="10" rx="2" />
          <path d="M20,30 Q20,28 40,28 Q60,28 60,30 L60,34 L58,64 L56,86 Q56,90 48,90 L32,90 Q24,90 24,86 L22,64 L20,34 Z" />
          <rect x="6" y="32" width="16" height="30" rx="8" />
          <rect x="58" y="32" width="16" height="30" rx="8" />
          <rect x="4" y="58" width="13" height="32" rx="6" />
          <rect x="63" y="58" width="13" height="32" rx="6" />
          <path d="M26,88 Q26,86 30,86 L37,86 Q39,86 39,88 L37,122 Q37,124 35,124 L29,124 Q27,124 27,122 Z" />
          <path d="M41,88 Q41,86 43,86 L50,86 Q54,86 54,88 L52,122 Q52,124 50,124 L44,124 Q42,124 42,122 Z" />
          <path d="M29,122 Q29,120 31,120 L35,120 Q37,120 37,122 L35,144 Q35,148 33,148 L31,148 Q29,148 29,144 Z" />
          <path d="M43,122 Q43,120 45,120 L49,120 Q51,120 51,122 L49,144 Q49,148 47,148 L45,148 Q43,148 43,144 Z" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        <rect x="0" y="0" width="80" height="150" fill={base} />

        {isFront ? (
          <g>
            {/* Anatomy structure lines */}
            <line x1="40" y1="30" x2="40" y2="88" stroke={line} strokeWidth="0.7" />
            <path d="M24,50 Q32,54 40,50 Q48,54 56,50" fill="none" stroke={line} strokeWidth="0.7" />
            <line x1="32" y1="56" x2="48" y2="56" stroke={line} strokeWidth="0.5" />
            <line x1="33" y1="64" x2="47" y2="64" stroke={line} strokeWidth="0.5" />
            <line x1="33" y1="72" x2="47" y2="72" stroke={line} strokeWidth="0.5" />
            <line x1="33" y1="80" x2="47" y2="80" stroke={line} strokeWidth="0.5" />

            {muscleGroup === 'Chest' && <>
              <ellipse cx="31" cy="42" rx="12" ry="9" fill={active} />
              <ellipse cx="49" cy="42" rx="12" ry="9" fill={active} />
            </>}
            {muscleGroup === 'Shoulders' && <>
              <ellipse cx="13" cy="38" rx="11" ry="9" fill={active} />
              <ellipse cx="67" cy="38" rx="11" ry="9" fill={active} />
            </>}
            {muscleGroup === 'Biceps' && <>
              <rect x="5" y="36" width="18" height="24" rx="9" fill={active} />
              <rect x="57" y="36" width="18" height="24" rx="9" fill={active} />
            </>}
            {muscleGroup === 'Core' && <>
              <rect x="28" y="50" width="24" height="36" rx="4" fill={active} />
            </>}
            {muscleGroup === 'Quads' && <>
              <rect x="24" y="84" width="16" height="38" rx="5" fill={active} />
              <rect x="40" y="84" width="16" height="38" rx="5" fill={active} />
            </>}
          </g>
        ) : (
          <g>
            {/* Back anatomy structure lines */}
            <line x1="40" y1="30" x2="40" y2="88" stroke={line} strokeWidth="0.7" />
            <path d="M28,44 Q34,48 40,44 Q46,48 52,44" fill="none" stroke={line} strokeWidth="0.6" />
            <path d="M30,68 Q35,72 40,68 Q45,72 50,68" fill="none" stroke={line} strokeWidth="0.6" />

            {muscleGroup === 'Back' && <>
              <path d="M22,30 L58,30 L56,48 L52,72 L28,72 L24,48 Z" fill={active} />
            </>}
            {muscleGroup === 'Triceps' && <>
              <rect x="5" y="36" width="18" height="24" rx="9" fill={active} />
              <rect x="57" y="36" width="18" height="24" rx="9" fill={active} />
            </>}
            {muscleGroup === 'Hamstrings' && <>
              <rect x="24" y="84" width="16" height="38" rx="5" fill={active} />
              <rect x="40" y="84" width="16" height="38" rx="5" fill={active} />
            </>}
            {muscleGroup === 'Calves' && <>
              <ellipse cx="33" cy="134" rx="6" ry="14" fill={active} />
              <ellipse cx="47" cy="134" rx="6" ry="14" fill={active} />
            </>}
          </g>
        )}
      </g>
    </svg>
  );
}
