
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AutoplayContextType {
  autoplayEnabled: boolean;
  setAutoplayEnabled: (enabled: boolean) => void;
}

const AutoplayContext = createContext<AutoplayContextType | undefined>(undefined);

export const AutoplayProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [autoplayEnabled, setAutoplayEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('starlight_autoplay');
    // Default to true if not set
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('starlight_autoplay', JSON.stringify(autoplayEnabled));
  }, [autoplayEnabled]);

  return (
    <AutoplayContext.Provider value={{ autoplayEnabled, setAutoplayEnabled }}>
      {children}
    </AutoplayContext.Provider>
  );
};

export const useAutoplay = (): AutoplayContextType => {
  const context = useContext(AutoplayContext);
  if (!context) {
    throw new Error('useAutoplay must be used within an AutoplayProvider');
  }
  return context;
};
