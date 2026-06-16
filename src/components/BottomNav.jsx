import { useContext } from 'react';
import { AppContext } from '../App.jsx';

const tabs = [
  {
    id: 'home',
    label: 'Home',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    id: 'exercises',
    label: 'Exercises',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 6.5h11M6.5 17.5h11"/>
        <path d="M4 10v4M8 8v8M16 8v8M20 10v4"/>
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
      </svg>
    ),
  },
];

export default function BottomNav() {
  const { screen, setScreen, activeWorkout } = useContext(AppContext);

  if (activeWorkout) return null;

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: `calc(var(--nav-height) + var(--safe-bottom))`,
      paddingBottom: 'var(--safe-bottom)',
      background: '#111113',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 50,
    }}>
      {tabs.map(tab => {
        const active = screen === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setScreen(tab.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              padding: '6px 16px',
              color: active ? 'var(--accent)' : 'var(--text-muted)',
              background: 'none',
              border: 'none',
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.02em',
              transition: 'color 0.15s',
              minWidth: '64px',
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
