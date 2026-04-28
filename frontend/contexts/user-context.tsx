'use client';

import React, { createContext, useContext, useState } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

interface UserPreferences {
  theme: 'dark' | 'light';
  notifications: boolean;
  autoRefresh: boolean;
}

interface UserContextType {
  user: User | null;
  preferences: UserPreferences;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user] = useState<User>({
    id: 'user-001',
    name: 'BPCL Admin',
    email: 'admin@bpcl.com',
    role: 'Operations Manager',
    avatar: 'B',
  });

  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'dark',
    notifications: true,
    autoRefresh: true,
  });

  const updatePreferences = (prefs: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...prefs }));
  };

  const logout = () => {
    // Handle logout logic
    console.log('User logged out');
  };

  return (
    <UserContext.Provider value={{ user, preferences, updatePreferences, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
