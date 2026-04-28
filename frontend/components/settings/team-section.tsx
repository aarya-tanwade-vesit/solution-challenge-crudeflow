'use client';

import React, { useState } from 'react';
import { useSettings } from '@/contexts';
import type { OrgMember } from '@/contexts/settings-context';
import { UserPlus, Trash2, ChevronDown } from 'lucide-react';

const ROLE_META: Record<OrgMember['role'], { label: string; color: string; description: string }> = {
  admin:   { label: 'Admin',    color: 'text-red-400 bg-red-500/10 border-red-500/30',         description: 'Full access including settings & team' },
  manager: { label: 'Manager',  color: 'text-[#3b82f6] bg-[#3b82f6]/10 border-[#3b82f6]/30',   description: 'Approve decisions, run simulations' },
  analyst: { label: 'Analyst',  color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', description: 'Read all + run simulations' },
  viewer:  { label: 'Viewer',   color: 'text-[#a3a3a3] bg-[#262626] border-[#2a2a2a]',         description: 'Read-only access' },
};

function fmtActive(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'Active now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function TeamSection() {
  const { members, updateMemberRole, removeMember } = useSettings();
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#e5e5e5]">Team &amp; Access</h2>
          <p className="mt-1 text-xs text-[#737373]">
            Manage members, roles, and access to CrudeFlow. Role changes apply immediately.
          </p>
        </div>
        <button
          className="flex items-center gap-1.5 rounded-md bg-[#3b82f6] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2563eb]"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Invite Member
        </button>
      </div>

      <section className="rounded-lg border border-[#2a2a2a] bg-[#141414]">
        <header className="flex items-center justify-between border-b border-[#2a2a2a] px-4 py-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#e5e5e5]">
            Members ({members.length})
          </h3>
        </header>
        <ul className="divide-y divide-[#1f1f1f]">
          {members.map((m) => (
            <li key={m.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] text-xs font-bold text-white">
                {m.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-[#e5e5e5]">{m.name}</h4>
                  <span className="text-[10px] text-[#525252]">&middot; {fmtActive(m.lastActive)}</span>
                </div>
                <p className="truncate text-[11px] text-[#737373]">{m.email}</p>
              </div>

              {/* Role selector */}
              <div className="relative flex-none">
                <select
                  value={m.role}
                  onChange={(e) => updateMemberRole(m.id, e.target.value as OrgMember['role'])}
                  className={`cursor-pointer appearance-none rounded-md border px-2.5 py-1 pr-6 text-[11px] font-semibold ${ROLE_META[m.role].color}`}
                >
                  {(Object.keys(ROLE_META) as OrgMember['role'][]).map((r) => (
                    <option key={r} value={r} className="bg-[#141414] text-[#e5e5e5]">{ROLE_META[r].label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-current opacity-70" />
              </div>

              {confirmRemoveId === m.id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { removeMember(m.id); setConfirmRemoveId(null); }}
                    className="rounded-md bg-red-500 px-2 py-1 text-[11px] font-semibold text-white hover:bg-red-600"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmRemoveId(null)}
                    className="rounded-md border border-[#2a2a2a] bg-[#141414] px-2 py-1 text-[11px] text-[#a3a3a3]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmRemoveId(m.id)}
                  className="rounded-md border border-[#2a2a2a] bg-[#141414] p-1.5 text-[#737373] hover:border-red-500/40 hover:text-red-400"
                  title="Remove member"
                  aria-label="Remove member"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Roles reference */}
      <section className="rounded-lg border border-[#2a2a2a] bg-[#141414]">
        <header className="border-b border-[#2a2a2a] px-4 py-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#e5e5e5]">Role Permissions</h3>
        </header>
        <ul className="divide-y divide-[#1f1f1f]">
          {(Object.keys(ROLE_META) as OrgMember['role'][]).map((r) => (
            <li key={r} className="flex items-center justify-between px-4 py-3">
              <span className={`rounded border px-2 py-0.5 text-[11px] font-semibold ${ROLE_META[r].color}`}>
                {ROLE_META[r].label}
              </span>
              <span className="text-[11px] text-[#737373]">{ROLE_META[r].description}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
