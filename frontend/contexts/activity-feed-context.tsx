'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getActivityEvents } from '@/lib/dashboard-api';

export type EventType = 'alert' | 'decision' | 'simulation' | 'update';

export interface ActivityEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  timestamp: Date;
  metadata?: {
    vesselName?: string;
    location?: string;
    decisionId?: string;
  };
  read: boolean;
  actionLink?: string;
}

interface ActivityFeedContextType {
  events: ActivityEvent[];
  unreadCount: number;
  markEventAsRead: (eventId: string) => void;
  addEvent: (event: Omit<ActivityEvent, 'id' | 'read'>) => void;
}

const ActivityFeedContext = createContext<ActivityFeedContextType | undefined>(undefined);

const LOCAL_EVENTS: ActivityEvent[] = [
  {
    id: '1',
    type: 'decision',
    title: 'Reroute approved',
    description: 'MT Rajput reroute via Suez approved by operations',
    timestamp: new Date(Date.now() - 2 * 60000),
    metadata: { vesselName: 'MT Rajput', decisionId: 'dec-001' },
    read: false,
    actionLink: '/decisions/dec-001',
  },
  {
    id: '2',
    type: 'alert',
    title: 'Delay detected',
    description: 'MT Yamuna experiencing unexpected port delay at Kochi',
    timestamp: new Date(Date.now() - 5 * 60000),
    metadata: { vesselName: 'MT Yamuna', location: 'Kochi' },
    read: false,
    actionLink: '/vessels/yamuna',
  },
  {
    id: '3',
    type: 'simulation',
    title: 'Simulation executed',
    description: 'Alternative route simulation completed for Suez corridor',
    timestamp: new Date(Date.now() - 8 * 60000),
    metadata: { location: 'Suez' },
    read: true,
    actionLink: '/simulations/sim-001',
  },
  {
    id: '4',
    type: 'update',
    title: 'Port status updated',
    description: 'Kochi port capacity increased to 85%',
    timestamp: new Date(Date.now() - 12 * 60000),
    metadata: { location: 'Kochi' },
    read: true,
  },
  {
    id: '5',
    type: 'alert',
    title: 'High risk alert',
    description: 'Geopolitical risk escalation in Hormuz corridor',
    timestamp: new Date(Date.now() - 15 * 60000),
    metadata: { location: 'Hormuz' },
    read: true,
  },
];

export function ActivityFeedProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<ActivityEvent[]>(LOCAL_EVENTS);

  useEffect(() => {
    let active = true;
    getActivityEvents(LOCAL_EVENTS).then((nextEvents) => {
      if (active) setEvents(nextEvents);
    });
    return () => {
      active = false;
    };
  }, []);

  const unreadCount = events.filter(e => !e.read).length;

  const markEventAsRead = useCallback((eventId: string) => {
    setEvents(prevEvents =>
      prevEvents.map(e => (e.id === eventId ? { ...e, read: true } : e))
    );
  }, []);

  const addEvent = useCallback((event: Omit<ActivityEvent, 'id' | 'read'>) => {
    const newEvent: ActivityEvent = {
      ...event,
      id: `event-${Date.now()}`,
      read: false,
    };
    setEvents(prevEvents => [newEvent, ...prevEvents]);
  }, []);

  return (
    <ActivityFeedContext.Provider value={{ events, unreadCount, markEventAsRead, addEvent }}>
      {children}
    </ActivityFeedContext.Provider>
  );
}

export function useActivityFeed() {
  const context = useContext(ActivityFeedContext);
  if (!context) {
    throw new Error('useActivityFeed must be used within ActivityFeedProvider');
  }
  return context;
}
