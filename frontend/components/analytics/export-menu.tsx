'use client';

/**
 * Single source of truth for "Export" — replaces the duplicated buttons
 * that previously lived in both the page header and the filters panel.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Download, FileText, Sheet, FileImage, ChevronDown, Check } from 'lucide-react';

interface Props {
  activeTab: string;
  timeRange: string;
}

export function ExportMenu({ activeTab, timeRange }: Props) {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const exportAs = (format: 'csv' | 'xlsx' | 'pdf') => {
    console.log('[v0] Export', { format, activeTab, timeRange });
    setLast(format);
    setOpen(false);
    setTimeout(() => setLast(null), 1500);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs font-semibold rounded transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        Export
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {last && (
        <div className="absolute right-0 mt-1 flex items-center gap-1 rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-1 text-[10px] text-emerald-400">
          <Check className="h-3 w-3" />
          {last.toUpperCase()} ready
        </div>
      )}

      {open && (
        <div className="pop-in absolute right-0 mt-1 w-48 rounded-md border border-[#2a2a2a] bg-[#0f0f0f] shadow-2xl overflow-hidden z-50">
          <div className="px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-[#525252] border-b border-[#1a1a1a]">
            Download {activeTab} ({timeRange})
          </div>
          <button
            onClick={() => exportAs('csv')}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-[#e5e5e5] transition-colors"
          >
            <Sheet className="h-3.5 w-3.5" />
            CSV (raw data)
          </button>
          <button
            onClick={() => exportAs('xlsx')}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-[#e5e5e5] transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            Excel workbook
          </button>
          <button
            onClick={() => exportAs('pdf')}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-[#e5e5e5] transition-colors"
          >
            <FileImage className="h-3.5 w-3.5" />
            PDF report (charts)
          </button>
        </div>
      )}
    </div>
  );
}
