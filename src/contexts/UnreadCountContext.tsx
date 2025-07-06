
import React, { createContext, useContext, useState, useCallback } from 'react';

interface UnreadCountContextType {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  decreaseUnreadCount: (amount: number) => void;
}

const UnreadCountContext = createContext<UnreadCountContextType | null>(null);

export const useUnreadCount = () => {
  const context = useContext(UnreadCountContext);
  if (!context) {
    throw new Error('useUnreadCount must be used within UnreadCountProvider');
  }
  return context;
};

export const UnreadCountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const decreaseUnreadCount = useCallback((amount: number) => {
    setUnreadCount(prev => Math.max(0, prev - amount));
  }, []);

  return (
    <UnreadCountContext.Provider value={{ unreadCount, setUnreadCount, decreaseUnreadCount }}>
      {children}
    </UnreadCountContext.Provider>
  );
};
