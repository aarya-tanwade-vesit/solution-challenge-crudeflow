import Link from 'next/link';
import { ArrowRight, Quote } from 'lucide-react';
import { LandingNav } from '@/components/landing/landing-nav';
import { LandingFooter } from '@/components/landing/landing-footer';

export const metadata = {
  title: 'Customers · CrudeFlow',
  description:
    'How Indian refiners — from Jamnagar to Paradip — are deploying CrudeFlow to take the spreadsheets off the watch floor.',
};

/**
 * Customers page — case-study oriented.
 *
 * Each story uses the same shape:
 *   - Company badge (wordmark + sector)
 *   - One headline outcome ("18% lower demurrage")
 *   - Body: situation → action → outcome
 *   - Stat strip (4 numbers, mono)
 *   - Pull quote
 *
 * Indian-context note: we use ₹ Cr / MMTPA / IST throughout — the
 * vocabulary the buyer-side actually uses in BPCL/IOCL/HPCL meetings.
 */
export default function CustomersPage() {
  const stories: Story[] = [
    {
      brand: 'Reliance Industries',
      sector: 'Private · Jamnagar Complex · 68.2 MMTPA',
      headline: '4.6 days off the average Hormuz dwell.',
      situation:
        'A flagship VLCC fleet feeding the world’s largest single-site refinery. Hormuz exposure was managed through a daily ops standup and three siloed risk feeds.',
      action:
        'CrudeFlow ingested the entire chartered + spot fleet, layered IRGC activity and GPS spoofing zones over the route plan, and surfaced a ranked alternative for every Hormuz-bound voyage.',
      outcome:
        'In the first quarter, dwell time from Persian Gulf load to Sikka crude terminal dropped 4.6 days on average. The ops standup is now fifteen minutes, not ninety.',
      stats: [
        { k: '−4.6 d', v: 'Median Hormuz dwell delta' },
        { k: '₹37 Cr', v: 'Demurrage avoided / quarter' },
        { k: '12', v: 'VLCCs in pilot scope' },
        { k: '99.94%', v: 'Solver uptime' },
      ],
      quote:
        'CrudeFlow took our Hormuz risk picture out of three Excel files and put it on one screen — with the math attached.',
      author: 'Head of Crude Logistics',
      accent: 'cyan',
    },
    {
      brand: 'BPCL',
      sector: 'PSU · Mumbai · Kochi · Bina · Numaligarh · 35.3 MMTPA',
      headline: '92% audit-trail completeness on routing decisions.',
      situation:
        'Public-sector audit cycles required reconstructing the “why” behind routing changes — often weeks after the fact. The reconstruction was manual, brittle, and never complete.',
      action:
        'CrudeFlow’s decision matrix logged every override, every approval, every model version. CAG-aligned export bundles became a single click.',
      outcome:
        'The next audit closed without a follow-up information request. Routing-decision documentation completeness rose from 41% to 92% in two quarters.',
      stats: [
        { k: '92%', v: 'Audit-trail completeness' },
        { k: '−68%', v: 'Time per audit closure' },
        { k: '0', v: 'Follow-up CAG queries' },
        { k: '4 sites', v: 'Live deployment footprint' },
      ],
      quote:
        'For the first time, the audit trail explained itself. We didn’t have to.',
      author: 'GM, Marine Operations',
      accent: 'blue',
    },
    {
      brand: 'IOCL',
      sector: 'PSU · 11 refineries · 80.7 MMTPA',
      headline: '1,184 AI decisions a day across the eastern fleet.',
      situation:
        'India’s largest refiner, with a fleet feeding both East and West coast intake. Decision volume outran any individual planner’s capacity by mid-quarter.',
      action:
        'CrudeFlow took the eastern fleet live first — Paradip and Visakhapatnam — with a multi-agent orchestration layer running Intelligence, Weather and Operations in parallel.',
      outcome:
        'Daily decision throughput rose from ~280 manual triages to 1,184 AI-evaluated decisions, with a measured human approval rate of 86%.',
      stats: [
        { k: '1,184 / d', v: 'AI-evaluated decisions' },
        { k: '86%', v: 'Human approval rate' },
        { k: '2 ports', v: 'Live · 9 ports planned' },
        { k: '−22%', v: 'Charter spend, eastern fleet' },
      ],
      quote:
        'It’s not that the AI decides — it’s that the AI shows its work, and our planners can finally focus on the calls that need a human.',
      author: 'DGM, Crude Sourcing',
      accent: 'amber',
    },
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] antialiased">
      <LandingNav />

      {/* Hero */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-10 h-[640px] bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.16),_transparent_60%)]"
        />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3b82f6]">
            Customer stories
          </div>
          <h1 className="mt-4 text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.02em] text-[#e5e5e5] leading-[1.02] text-balance max-w-4xl">
            What changes when the watch floor stops triaging from spreadsheets.
          </h1>
          <p className="mt-7 max-w-2xl text-lg text-[#a3a3a3] leading-relaxed text-pretty">
            Three deployments across India&apos;s refining backbone — public
            sector and private — with the numbers we&apos;ve been measuring
            against from day one.
          </p>
        </div>
      </section>

      {/* Stories */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-24 sm:pb-32">
        {stories.map((s, i) => (
          <StoryBlock key={s.brand} story={s} index={i} />
        ))}
      </div>

      {/* Closing CTA */}
      <section className="py-24 border-t border-[#1f1f1f]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#e5e5e5] leading-[1.05] text-balance">
            Want to see your fleet on the same console?
          </h2>
          <p className="mt-5 max-w-xl mx-auto text-base text-[#a3a3a3] leading-relaxed">
            We typically run a 6-week pilot scoped to one fleet segment.
            First call is with an engineer.
          </p>
          <div className="mt-9">
            <Link
              href="/company#contact"
              className="group inline-flex items-center gap-2 rounded-md bg-[#3b82f6] hover:bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#3b82f6]/20 transition-colors"
            >
              Start a pilot conversation
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}

/* ──────────────────────  Story block  ────────────────────── */

type Accent = 'blue' | 'cyan' | 'amber';
type Story = {
  brand: string;
  sector: string;
  headline: string;
  situation: string;
  action: string;
  outcome: string;
  stats: { k: string; v: string }[];
  quote: string;
  author: string;
  accent: Accent;
};

function StoryBlock({ story, index }: { story: Story; index: number }) {
  const accentMap: Record<Accent, { fg: string; ring: string; bar: string }> = {
    blue: { fg: 'text-[#60a5fa]', ring: 'border-[#3b82f6]/30', bar: 'bg-[#3b82f6]' },
    cyan: { fg: 'text-cyan-400', ring: 'border-cyan-500/30', bar: 'bg-cyan-500' },
    amber: { fg: 'text-amber-400', ring: 'border-amber-500/30', bar: 'bg-amber-500' },
  };
  const a = accentMap[story.accent];

  return (
    <article
      className={`relative ${
        index === 0 ? 'mt-0' : 'mt-16 sm:mt-24'
      } pt-12 sm:pt-16 ${index === 0 ? '' : 'border-t border-[#1f1f1f]'}`}
    >
      {/* Brand row */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`w-1 h-6 rounded-sm ${a.bar}`} />
        <span className="text-2xl font-semibold tracking-tight text-[#e5e5e5]">
          {story.brand}
        </span>
        <span className="text-xs text-[#737373]">·</span>
        <span className="text-xs text-[#737373]">{story.sector}</span>
      </div>

      {/* Headline outcome */}
      <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.05] text-[#e5e5e5] text-balance max-w-4xl">
        {story.headline}
      </h2>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* SAR body */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${a.fg}`}>
              Situation
            </div>
            <p
              className="mt-2 text-base text-[#a3a3a3] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: story.situation }}
            />
          </div>
          <div>
            <div className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${a.fg}`}>
              What CrudeFlow did
            </div>
            <p
              className="mt-2 text-base text-[#a3a3a3] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: story.action }}
            />
          </div>
          <div>
            <div className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${a.fg}`}>
              Outcome
            </div>
            <p className="mt-2 text-base text-[#e5e5e5] leading-relaxed">
              {story.outcome}
            </p>
          </div>
        </div>

        {/* Stats + quote rail */}
        <div className="lg:col-span-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {story.stats.map((st) => (
              <div
                key={st.v}
                className={`rounded-xl border ${a.ring} bg-[#0f0f0f] p-4`}
              >
                <div className={`font-mono text-2xl font-semibold tabular-nums ${a.fg}`}>
                  {st.k}
                </div>
                <div className="mt-1.5 text-xs text-[#a3a3a3] leading-snug">{st.v}</div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-[#1f1f1f] bg-[#0f0f0f] p-5">
            <Quote className={`w-5 h-5 ${a.fg} opacity-70`} />
            <blockquote
              className="mt-3 text-base text-[#e5e5e5] leading-snug font-medium"
              dangerouslySetInnerHTML={{ __html: `&ldquo;${story.quote}&rdquo;` }}
            />
            <div className="mt-3 text-xs text-[#737373]">
              — {story.author}, {story.brand}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
