import Link from 'next/link';
import { Fragment } from 'react';
import { ArrowRight, Check, Minus } from 'lucide-react';
import { LandingNav } from '@/components/landing/landing-nav';
import { LandingFooter } from '@/components/landing/landing-footer';

export const metadata = {
  title: 'Pricing — CrudeFlow by NEMO',
  description:
    'Refinery-tiered pricing for CrudeFlow. Single-site, multi-site operator, and sovereign on-prem deployments — priced in INR.',
};

/**
 * /pricing — Refinery-aligned tiers, INR-denominated.
 *
 * Design intent: this is not a SaaS pricing page for a developer
 * tool. It's a procurement document for a national refiner.
 * Hence: annual contract values, SLA tiers, named success teams,
 * and a sovereign / on-prem lane.
 *
 * The three tiers map to the actual shape of the Indian refining
 * market:
 *   - Single Site     — standalone refinery (e.g. CPCL Manali, MRPL)
 *   - Multi-Site      — major operator (BPCL, HPCL, IOCL refining only)
 *   - Sovereign       — full operator + retail integration, on-prem
 */

type Tier = {
  id: string;
  name: string;
  audience: string;
  price: string;
  priceNote: string;
  cta: { label: string; href: string };
  highlight?: boolean;
  inclusions: string[];
};

const TIERS: Tier[] = [
  {
    id: 'single',
    name: 'Single site',
    audience: 'One refinery, ≤ 20 MMTPA throughput',
    price: '₹48 L',
    priceNote: 'per month · billed annually',
    cta: { label: 'Talk to sales', href: '/company#contact' },
    inclusions: [
      'Live AIS + port congestion ingestion',
      '−100…+100 sentiment intelligence',
      'Routing & scheduling math core',
      'Up to 25 named operator seats',
      'Standard SLA · 99.5% uptime',
      'Indian data residency · Mumbai',
      'Email + business-hours support',
    ],
  },
  {
    id: 'operator',
    name: 'Multi-site operator',
    audience: 'National operator, up to 6 refineries',
    price: '₹1.85 Cr',
    priceNote: 'per month · annual contract',
    cta: { label: 'Talk to sales', href: '/company#contact' },
    highlight: true,
    inclusions: [
      'Everything in Single site',
      'Cross-site cargo & berth scheduling',
      'Geopolitical & weather scenario lab',
      'Up to 200 named operator seats',
      'Priority SLA · 99.9% uptime',
      'Dual-region residency · Mumbai + Hyderabad',
      'Named customer success · 4-hour response',
      'Quarterly executive review',
    ],
  },
  {
    id: 'sovereign',
    name: 'Sovereign',
    audience: 'PSU & strategic operators · on-prem',
    price: 'Custom',
    priceNote: 'multi-year programme',
    cta: { label: 'Discuss programme', href: '/company#contact' },
    inclusions: [
      'Everything in Multi-site operator',
      'Air-gapped or on-prem deployment',
      'MeitY-aligned controls + audit logs',
      'Unlimited seats · custom RBAC',
      'Sovereign SLA · 99.99% uptime',
      'Source escrow & exit clause',
      'Dedicated solutions engineering pod',
      'Co-development of vertical extensions',
    ],
  },
];

/**
 * Comparison matrix — the second deck below the cards.
 * Helps a procurement team check tier-by-tier features at a glance.
 */
const MATRIX: { group: string; rows: { label: string; values: (string | boolean)[] }[] }[] = [
  {
    group: 'Intelligence',
    rows: [
      { label: 'Sentiment scoring (−100…+100)', values: [true, true, true] },
      { label: 'OSINT & news ingestion', values: [true, true, true] },
      { label: 'Custom signal sources', values: [false, true, true] },
      { label: 'On-prem fine-tuning', values: [false, false, true] },
    ],
  },
  {
    group: 'Operations',
    rows: [
      { label: 'Routing & scheduling solver', values: [true, true, true] },
      { label: 'Cross-site cargo balancing', values: [false, true, true] },
      { label: 'Refinery feedstock optimisation', values: ['Add-on', true, true] },
      { label: 'Berth & port slot allocation', values: [false, true, true] },
    ],
  },
  {
    group: 'Governance',
    rows: [
      { label: 'Audit log retention', values: ['1 yr', '3 yr', 'Unlimited'] },
      { label: 'Role-based access control', values: ['Standard', 'Advanced', 'Custom'] },
      { label: 'Data residency', values: ['Mumbai', 'Mumbai + Hyderabad', 'On-prem'] },
      { label: 'MeitY-aligned controls', values: [false, true, true] },
    ],
  },
  {
    group: 'Service',
    rows: [
      { label: 'SLA', values: ['99.5%', '99.9%', '99.99%'] },
      { label: 'Support response', values: ['Next business day', '4 hr', '1 hr'] },
      { label: 'Named CSM', values: [false, true, true] },
      { label: 'Quarterly exec review', values: [false, true, true] },
    ],
  },
];

const FAQ = [
  {
    q: 'Do you charge per barrel or per vessel?',
    a: 'No. CrudeFlow is priced as enterprise infrastructure: a flat annual contract per tier. We do not insert ourselves between you and your throughput economics.',
  },
  {
    q: 'How is data residency handled?',
    a: 'All Single-site and Multi-site customer data is stored in Indian regions (Mumbai primary, Hyderabad failover). Sovereign deployments run inside the customer’s own infrastructure with no outbound telemetry.',
  },
  {
    q: 'What is the typical implementation timeline?',
    a: 'Single site: 4–6 weeks from contract to go-live. Multi-site operator: 8–12 weeks for the first refinery, 2–3 weeks per subsequent site. Sovereign: programme-led, typically 4–6 months.',
  },
  {
    q: 'Can we start with one refinery and expand?',
    a: 'Yes. We expect that. Most BPCL / HPCL / IOCL conversations begin with a single coastal refinery as the proving ground, then expand site-by-site with a credit applied from the original contract.',
  },
  {
    q: 'How are your fees treated for tax / capex?',
    a: 'Annual contracts can be structured as opex (subscription) or capex-aligned (perpetual licence with annual maintenance) for Sovereign deployments. We work with your finance team in either direction.',
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] antialiased">
      <LandingNav />

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="pt-36 pb-20 sm:pb-24 border-b border-[#1f1f1f]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3b82f6]">
              Pricing
            </div>
            <h1 className="mt-4 text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-[#e5e5e5] leading-[1.02] text-balance">
              Priced for refineries.
              <br />
              <span className="text-[#737373]">Not for SaaS investors.</span>
            </h1>
            <p className="mt-6 text-lg text-[#a3a3a3] leading-relaxed max-w-2xl text-pretty">
              Three tiers, INR-denominated, annual contracts. No per-barrel
              fees. No per-vessel surprises. Pick the shape that matches your
              refining footprint and grow at your own cadence.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Tier cards ───────────────────────────────────────── */}
      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {TIERS.map((t) => (
              <div
                key={t.id}
                className={`relative rounded-2xl border p-8 flex flex-col transition-all duration-300 hover:translate-y-[-2px] ${
                  t.highlight
                    ? 'border-[#3b82f6]/40 bg-gradient-to-b from-[#0a1628] to-[#0a0a0a] shadow-[0_0_40px_-12px_rgba(59,130,246,0.4)]'
                    : 'border-[#2a2a2a] bg-[#0d0d0d] hover:border-[#3a3a3a]'
                }`}
              >
                {t.highlight && (
                  <div className="absolute -top-3 left-8 rounded-full border border-[#3b82f6]/40 bg-[#0a1628] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.16em] text-[#60a5fa]">
                    Most refiners
                  </div>
                )}

                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#737373]">
                  {t.name}
                </div>
                <div className="mt-1 text-sm text-[#a3a3a3]">{t.audience}</div>

                <div className="mt-8 flex items-baseline gap-2">
                  <span className="text-5xl font-semibold tracking-tight text-[#e5e5e5]">
                    {t.price}
                  </span>
                </div>
                <div className="mt-1 text-xs text-[#737373]">{t.priceNote}</div>

                <Link
                  href={t.cta.href}
                  className={`mt-8 inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${
                    t.highlight
                      ? 'bg-[#3b82f6] hover:bg-[#2563eb] text-white'
                      : 'border border-[#2a2a2a] hover:border-[#3a3a3a] hover:bg-[#141414] text-[#e5e5e5]'
                  }`}
                >
                  {t.cta.label}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <ul className="mt-8 space-y-3">
                  {t.inclusions.map((line) => (
                    <li key={line} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 text-[#3b82f6] shrink-0" strokeWidth={2.5} />
                      <span className="text-[#d4d4d4]">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Note row */}
          <p className="mt-8 text-center text-xs text-[#525252]">
            All prices in INR. GST extra. Multi-year commitments earn a 12%
            discount in year 2 and 18% in year 3.
          </p>
        </div>
      </section>

      {/* ─── Comparison matrix ────────────────────────────────── */}
      <section className="py-20 sm:py-24 border-t border-[#1f1f1f] bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3b82f6]">
              Compare tiers
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight text-[#e5e5e5] leading-tight text-balance">
              Everything your procurement team will ask.
            </h2>
          </div>

          <div className="mt-10 rounded-2xl border border-[#2a2a2a] bg-[#0a0a0a] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1f1f1f] bg-[#0d0d0d]">
                    <th className="text-left p-4 text-[10px] font-mono uppercase tracking-[0.16em] text-[#525252] font-medium">
                      Feature
                    </th>
                    {TIERS.map((t) => (
                      <th
                        key={t.id}
                        className="text-left p-4 text-xs font-semibold text-[#e5e5e5]"
                      >
                        {t.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MATRIX.map((group) => (
                    <Fragment key={group.group}>
                      <tr className="bg-[#0d0d0d]">
                        <td
                          colSpan={4}
                          className="px-4 py-2 text-[10px] font-mono uppercase tracking-[0.18em] text-[#737373]"
                        >
                          {group.group}
                        </td>
                      </tr>
                      {group.rows.map((row) => (
                        <tr
                          key={row.label}
                          className="border-t border-[#1a1a1a] hover:bg-[#0d0d0d] transition-colors"
                        >
                          <td className="p-4 text-[#a3a3a3]">{row.label}</td>
                          {row.values.map((v, i) => (
                            <td key={i} className="p-4">
                              {typeof v === 'boolean' ? (
                                v ? (
                                  <Check className="h-4 w-4 text-[#3b82f6]" strokeWidth={2.5} />
                                ) : (
                                  <Minus className="h-4 w-4 text-[#3a3a3a]" strokeWidth={2.5} />
                                )
                              ) : (
                                <span className="text-[#d4d4d4]">{v}</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 border-t border-[#1f1f1f]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3b82f6]">
              FAQ
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight text-[#e5e5e5] leading-tight text-balance">
              The questions every refiner asks.
            </h2>
          </div>

          <div className="mt-10 divide-y divide-[#1f1f1f] border-y border-[#1f1f1f]">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group py-5 cursor-pointer"
              >
                <summary className="flex items-center justify-between gap-4 list-none">
                  <span className="text-base sm:text-lg font-medium text-[#e5e5e5]">
                    {item.q}
                  </span>
                  <span className="text-xl text-[#525252] group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-[#a3a3a3] leading-relaxed max-w-2xl">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA strip ────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 border-t border-[#1f1f1f] bg-gradient-to-b from-[#0a0f1a] to-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#e5e5e5] leading-tight text-balance">
            Tell us about your fleet. We&apos;ll build the proposal.
          </h2>
          <p className="mt-4 text-base text-[#a3a3a3] max-w-xl mx-auto">
            Most refining conversations start with a 30-minute working session
            on a single port and a single product. We bring the operators.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/company#contact"
              className="inline-flex items-center gap-2 rounded-md bg-[#3b82f6] hover:bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white transition-colors"
            >
              Schedule a working session
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-md border border-[#2a2a2a] hover:border-[#3a3a3a] px-5 py-3 text-sm font-semibold text-[#e5e5e5] transition-colors"
            >
              Open a live dashboard
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
