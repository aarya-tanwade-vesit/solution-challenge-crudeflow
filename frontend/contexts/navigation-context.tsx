'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type PageType = 'dashboard' | 'shipments' | 'simulation' | 'analytics' | 'settings';

interface NavigationContextValue {
  activePage: PageType;
  setActivePage: (page: PageType) => void;
}

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [activePage, setActivePage] = useState<PageType>('dashboard');

  return (
    <NavigationContext.Provider value={{ activePage, setActivePage }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
