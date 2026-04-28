'use client';

import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { useSimulation } from '@/contexts';

interface SaveScenarioDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SaveScenarioDialog({ open, onClose }: SaveScenarioDialogProps) {
  const { saveScenario, activeScenario } = useSimulation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (open) {
      const scenarioLabel = activeScenario === 'baseline' ? 'Baseline' : activeScenario.replace('-', ' ');
      const ts = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      setName(`${scenarioLabel} - ${ts}`);
      setDescription('');
    }
  }, [open, activeScenario]);

  if (!open) return null;

  const handleSave = () => {
    saveScenario(name.trim(), description.trim());
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <Save className="w-4 h-4 text-[#3b82f6]" />
            <h2 className="text-sm font-semibold text-[#e5e5e5]">Save Simulation Scenario</h2>
          </div>
          <button onClick={onClose} className="text-[#525252] hover:text-[#a3a3a3] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[10px] font-semibold text-[#737373] uppercase tracking-wider mb-1.5">
              Scenario Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Hormuz Crisis Test"
              className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-sm text-[#e5e5e5] placeholder-[#525252] focus:outline-none focus:border-[#3b82f6]/50"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#737373] uppercase tracking-wider mb-1.5">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes about this scenario"
              rows={3}
              className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-sm text-[#e5e5e5] placeholder-[#525252] focus:outline-none focus:border-[#3b82f6]/50 resize-none"
            />
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-[11px] text-[#737373]">
            <span className="w-1 h-1 bg-[#3b82f6] rounded-full" />
            Captures all sliders, scenario type, and per-vessel overrides
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#2a2a2a] bg-[#0f0f0f]">
          <button onClick={onClose} className="px-3 py-1.5 text-xs text-[#a3a3a3] hover:text-[#e5e5e5] transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3b82f6] text-white text-xs font-semibold rounded hover:bg-[#2563eb] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-3 h-3" />
            Save Scenario
          </button>
        </div>
      </div>
    </div>
  );
}
