'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * Closing call-to-action.
 *
 * Single, unambiguous next step. We avoid the "Schedule a demo / Talk
 * to sales" forking that dilutes intent — the dashboard is the demo.
 */
export function LandingCTA() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Spotlight */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.18),_transparent_60%)]"
      />
      {/* Cross-hatch */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-[0.18]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, rgba(255,255,255,0.04) 0 1px, transparent 1px 96px)',
        }}
      />

      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#e5e5e5] text-balance leading-[1.05]">
          Operate your fleet on{' '}
          <span className="bg-gradient-to-br from-[#3b82f6] to-[#06b6d4] bg-clip-text text-transparent">
            intelligence
          </span>
          , not intuition.
        </h2>
        <p className="mt-5 text-base sm:text-lg text-[#a3a3a3] leading-relaxed text-pretty">
          The dashboard is live. No sandbox, no demo data — your fleet, ranked
          decisions, full audit trail.
        </p>
        <div className="mt-10">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 rounded-md bg-[#3b82f6] hover:bg-[#2563eb] px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-[#3b82f6]/25 transition-colors"
          >
            Open the dashboard
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <div className="mt-4 text-xs text-[#525252]">
            Already configured for live AIS feeds · No credit card required
          </div>
        </div>
      </div>
    </section>
  );
}
