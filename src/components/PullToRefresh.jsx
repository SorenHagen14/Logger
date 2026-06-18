import { useState, useRef, useCallback, useEffect } from 'react';

const THRESHOLD = 80;
const MAX_PULL = 120;
const COOLDOWN_MS = 3000;

export default function PullToRefresh({ children }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const pulling = useRef(false);
  const lastRefresh = useRef(0);

  const isAtTop = useCallback(() => {
    return window.scrollY <= 0;
  }, []);

  useEffect(() => {
    const onTouchStart = (e) => {
      if (refreshing) return;
      if (!isAtTop()) return;
      if (Date.now() - lastRefresh.current < COOLDOWN_MS) return;
      touchStartY.current = e.touches[0].clientY;
      pulling.current = true;
    };

    const onTouchMove = (e) => {
      if (!pulling.current || refreshing) return;
      const dy = e.touches[0].clientY - touchStartY.current;
      if (dy < 0) {
        pulling.current = false;
        setPullDistance(0);
        return;
      }
      if (!isAtTop()) {
        pulling.current = false;
        setPullDistance(0);
        return;
      }
      const distance = Math.min(dy * 0.5, MAX_PULL);
      setPullDistance(distance);
    };

    const onTouchEnd = () => {
      if (!pulling.current || refreshing) {
        pulling.current = false;
        return;
      }
      pulling.current = false;
      if (pullDistance >= THRESHOLD) {
        setRefreshing(true);
        lastRefresh.current = Date.now();
        setPullDistance(THRESHOLD);
        setTimeout(() => window.location.reload(), 400);
      } else {
        setPullDistance(0);
      }
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd);
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [pullDistance, refreshing, isAtTop]);

  const progress = Math.min(pullDistance / THRESHOLD, 1);
  const visible = pullDistance > 5 || refreshing;

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 300,
        pointerEvents: 'none',
        transform: `translateY(${visible ? Math.max(pullDistance - 20, 8) : -40}px)`,
        opacity: visible ? 1 : 0,
        transition: pulling.current ? 'none' : 'transform 0.3s ease, opacity 0.3s ease',
      }}>
        <div style={{
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: `rotate(${refreshing ? 0 : progress * 270}deg)`,
              animation: refreshing ? 'ptr-spin 0.8s linear infinite' : 'none',
              opacity: Math.max(progress, refreshing ? 1 : 0),
            }}
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </div>
      </div>
      <div style={{
        transform: visible ? `translateY(${pullDistance}px)` : 'none',
        transition: pulling.current ? 'none' : 'transform 0.3s ease',
      }}>
        {children}
      </div>
      <style>{`
        @keyframes ptr-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
