'use client';

import { Building2, Globe, MapPin, Users } from 'lucide-react';

/**
 * "Why CrudeFlow, why now, why India" — a mission strip that closes
 * the geopolitical loop opened by the Hormuz section, before the
 * final CTA.
 *
 * We removed the generic quote testimonial that used to live here —
 * the actual operator quote already appears in the customer showcase
 * with full context. Repeating it here would feel redundant; this
 * panel does the *positioning* work instead.
 *
 * Layout: 4-column responsive grid of "values" + a tight closing
 * statement. Apple-style: declarative, sparse, no ornament.
 */
export function LandingTestimonial() {
  const tenets = [
    {
      Icon: MapPin,
      title: 'Built in India, for India',
      body: 'IST-aligned operations, INR-native economics, IMO + DGS compliance flows baked into the audit log.',
    },
    {
      Icon: Building2,
      title: 'Multi-operator from day one',
      body: 'Designed to span PSU governance and private-sector velocity — same engine, different policies.',
    },
    {
      Icon: Globe,
      title: 'Sovereign data, by default',
      body: 'Data residency in Mumbai / Hyderabad regions. No vessel state ever leaves Indian commercial law.',
    },
    {
      Icon: Users,
      title: 'Operators, not analysts',
      body: 'The console is built for the watch officer at 02:00 IST — not the analyst with a Monday morning deck.',
    },
  ];

  return (
    <section className="relative py-24 sm:py-32 border-t border-[#1f1f1f] bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3b82f6]">
              Why CrudeFlow
            </div>
            <h2 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight text-[#e5e5e5] leading-[1.05] text-balance">
              The world&apos;s most consequential energy corridor deserves
              India&apos;s most disciplined operating system.
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-[#a3a3a3] text-base leading-relaxed text-pretty">
              CrudeFlow is built by operators, for operators. It treats
              India&apos;s refining backbone as a sovereign concern — and
              its watch-floor as the customer that matters most.
            </p>
          </div>
        </div>

        {/* Tenets grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {tenets.map((t) => (
            <div
              key={t.title}
              className="rounded-xl border border-[#1f1f1f] bg-[#0f0f0f] p-6 hover:border-[#2a2a2a] transition-colors"
            >
              <div className="w-9 h-9 rounded-md border border-[#3b82f6]/30 bg-[#3b82f6]/10 flex items-center justify-center">
                <t.Icon className="w-4 h-4 text-[#60a5fa]" strokeWidth={2} />
              </div>
              <div className="mt-4 text-base font-semibold text-[#e5e5e5] leading-snug text-balance">
                {t.title}
              </div>
              <p className="mt-2 text-sm text-[#a3a3a3] leading-relaxed">{t.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
