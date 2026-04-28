'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Workspace {
  id: string;
  name: string;
  region: string;
  port: string;
  activeShipments: number;
}

interface WorkspaceContextType {
  currentWorkspace: Workspace;
  workspaces: Workspace[];
  switchWorkspace: (workspaceId: string) => void;
  isLoading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces] = useState<Workspace[]>([
    { id: 'bpcl-mumbai', name: 'Mumbai', region: 'Western India', port: 'Mumbai', activeShipments: 8 },
    { id: 'bpcl-kochi', name: 'Kochi', region: 'Southern India', port: 'Kochi', activeShipments: 5 },
    { id: 'bpcl-bina', name: 'Bina', region: 'Central India', port: 'Bina', activeShipments: 6 },
  ]);

  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>(workspaces[0]);
  const [isLoading, setIsLoading] = useState(false);

  const switchWorkspace = useCallback((workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (!workspace) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setCurrentWorkspace(workspace);
      setIsLoading(false);
    }, 500);
  }, [workspaces]);

  return (
    <WorkspaceContext.Provider value={{ currentWorkspace, workspaces, switchWorkspace, isLoading }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider');
  }
  return context;
}
