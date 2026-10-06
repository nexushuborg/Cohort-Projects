import { createContext, useContext, useState, useCallback } from 'react';

const ModeContext = createContext(null);

const VALID_MODES = ['rider', 'driver', 'admin'];

export function ModeProvider({ children }) {
  const [mode, setModeState] = useState(() => {
    const saved = localStorage.getItem('appMode');
    return VALID_MODES.includes(saved) ? saved : 'rider';
  });

  const setMode = useCallback((newMode) => {
    if (VALID_MODES.includes(newMode)) {
      setModeState(newMode);
      localStorage.setItem('appMode', newMode);
    }
  }, []);

  const value = {
    mode,
    setMode,
    isDriver: mode === 'driver',
    isRider: mode === 'rider',
    isAdmin: mode === 'admin',
  };

  return (
    <ModeContext.Provider value={value}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
}

export default ModeContext;
