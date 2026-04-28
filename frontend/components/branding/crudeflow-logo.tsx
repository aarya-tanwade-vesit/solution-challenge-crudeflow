import React from 'react';
import { Anchor } from 'lucide-react';

interface CrudeFlowLogoProps {
  showText?: boolean;
}

export function CrudeFlowLogo({ showText = false }: CrudeFlowLogoProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Logo Mark - Fixed size container for visual consistency */}
      <div className="w-9 h-9 rounded-md bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] flex items-center justify-center shadow-lg shadow-[#3b82f6]/20 flex-shrink-0">
        <Anchor className="w-5 h-5 text-white" strokeWidth={2.5} />
      </div>
      
      {/* Wordmark - Only shown when sidebar is expanded */}
      {showText && (
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-semibold text-[#e5e5e5] tracking-tight leading-none">
            CrudeFlow
          </span>
          <span className="text-[10px] font-medium text-[#737373] tracking-wider uppercase leading-tight mt-0.5">
            by NEMO
          </span>
        </div>
      )}
    </div>
  );
}
