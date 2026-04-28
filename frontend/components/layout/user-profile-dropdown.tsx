'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  User,
  Building2,
  Anchor,
  Key,
  Settings,
  Moon,
  Sun,
  HelpCircle,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useUser } from '@/contexts';

interface UserProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  hasSubmenu?: boolean;
  onClick?: () => void;
  danger?: boolean;
}

function MenuItem({ icon, label, hasSubmenu, onClick, danger }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs transition-colors ${
        danger
          ? 'text-red-400 hover:bg-red-500/10'
          : 'text-[#a3a3a3] hover:bg-[#262626] hover:text-[#e5e5e5]'
      }`}
    >
      <span className="w-4 h-4 flex items-center justify-center">{icon}</span>
      <span className="flex-1 text-left font-medium">{label}</span>
      {hasSubmenu && <ChevronRight className="w-3 h-3 text-[#525252]" />}
    </button>
  );
}

export function UserProfileDropdown({ isOpen, onClose, anchorRef }: UserProfileDropdownProps) {
  const router = useRouter();
  const { user, preferences, updatePreferences, logout } = useUser();
  const [position, setPosition] = useState({ top: 0, right: 0 });

  const goSettings = (tab?: string) => {
    router.push(tab ? `/settings?tab=${tab}` : '/settings');
    onClose();
  };

  // Calculate position based on anchor element
  useEffect(() => {
    if (isOpen && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen, anchorRef]);

  if (!isOpen || !user) return null;

  const toggleTheme = () => {
    updatePreferences({ theme: preferences.theme === 'dark' ? 'light' : 'dark' });
  };

  const dropdownContent = (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[9998]" 
        onClick={onClose}
        style={{ backgroundColor: 'transparent' }}
      />
      
      {/* Dropdown Panel */}
      <div 
        className="fixed w-[240px] bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-2xl z-[9999] overflow-hidden"
        style={{ 
          top: position.top,
          right: position.right,
        }}
      >
        {/* User Info Header */}
        <div className="px-4 py-3 border-b border-[#2a2a2a] bg-[#171717]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] flex items-center justify-center text-sm font-bold text-white">
              {user.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#e5e5e5] truncate">{user.name}</p>
              <p className="text-[11px] text-[#525252] truncate">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Personal — only the things that belong to a *user* */}
        <div className="py-1.5">
          <div className="px-4 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-[#525252]">
            Account
          </div>
          <MenuItem
            icon={<User className="w-4 h-4" />}
            label="Manage Account"
            onClick={() => goSettings('team')}
            hasSubmenu
          />
        </div>

        {/* Organization — these all live under /settings now to avoid duplication */}
        <div className="border-t border-[#2a2a2a] py-1.5">
          <div className="px-4 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-[#525252]">
            Organization
          </div>
          <MenuItem
            icon={<Settings className="w-4 h-4" />}
            label="Preferences"
            onClick={() => goSettings('preferences')}
            hasSubmenu
          />
          <MenuItem
            icon={<Building2 className="w-4 h-4" />}
            label="Team & Access"
            onClick={() => goSettings('team')}
            hasSubmenu
          />
          <MenuItem
            icon={<Anchor className="w-4 h-4" />}
            label="Ports & Suppliers"
            onClick={() => goSettings('ports')}
            hasSubmenu
          />
          <MenuItem
            icon={<Key className="w-4 h-4" />}
            label="API Keys & Integrations"
            onClick={() => goSettings('integrations')}
            hasSubmenu
          />
        </div>

        {/* Theme Toggle */}
        <div className="border-t border-[#2a2a2a] py-1.5">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-[#a3a3a3] hover:bg-[#262626] hover:text-[#e5e5e5] transition-colors"
          >
            <span className="w-4 h-4 flex items-center justify-center">
              {preferences.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </span>
            <span className="flex-1 text-left font-medium">
              {preferences.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
            <span className="text-[10px] text-[#404040] px-1.5 py-0.5 bg-[#262626] rounded">
              {preferences.theme === 'dark' ? 'Dark' : 'Light'}
            </span>
          </button>
        </div>

        <div className="border-t border-[#2a2a2a] py-1.5">
          <MenuItem
            icon={<HelpCircle className="w-4 h-4" />}
            label="Help & Documentation"
          />
        </div>

        <div className="border-t border-[#2a2a2a] py-1.5">
          <MenuItem
            icon={<LogOut className="w-4 h-4" />}
            label="Sign Out"
            onClick={logout}
            danger
          />
        </div>
      </div>
    </>
  );

  // Use portal to render outside the normal DOM hierarchy
  return createPortal(dropdownContent, document.body);
}
