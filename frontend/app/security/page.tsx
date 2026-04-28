import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  MapPin,
  Lock,
  Network,
  FileCheck,
  Cpu,
  Eye,
  KeyRound,
} from 'lucide-react';
import { LandingNav } from '@/components/landing/landing-nav';
import { LandingFooter } from '@/components/landing/landing-footer';

export const metadata = {
  title: 'Security & data residency — CrudeFlow by NEMO',
  description:
    'Sovereign-by-design. Indian data residency, MeitY-aligned controls, optional on-prem deployment, full audit trail.',
};

/**
 * /security — sovereign-by-design positioning.
 *
 * Indian refiners (and especially PSUs) buy on data residency, audit
 * traceability and exit-clause comfort more than on raw feature lists.
 * This page is built around those three concerns:
 *
 *  1. Residency  — where the data lives
 *  2. Controls   — how access is governed and logged
 *  3. Architecture — how the system is built to be auditable
 *
 * The hero ends with three sealed badges (SOC 2 II, ISO 27001, MeitY)
 * to make the trust posture readable in 5 seconds.
 */

const RESIDENCY = [
  {
    icon: MapPin,
    label: 'Mumbai · primary',
    body: 'All Single-site and Multi-site customer state lives in AWS ap-south-1 (Mumbai). No data leaves Indian sovereign territory under default operation.',
  },
  {
    icon: MapPin,
    label: 'Hyderabad · failover',
    body: 'Multi-site Operator and above replicate to AWS ap-south-2 (Hyderabad) for active-active failover within the Indian boundary.',
  },
  {
    icon: Cpu,
    label: 'On-prem · sovereign',
    body: 'Sovereign customers run the full stack inside their own datacentre. No outbound telemetry, no internet path required for steady-state operation.',
  },
];

const CONTROLS = [
  {
    icon: KeyRound,
    label: 'Identity',
    body: 'SSO via SAML / OIDC. Role-based access control with optional refinery-level isolation. SCIM provisioning. MFA required for any operator action that mutates state.',
  },
  {
    icon: Eye,
    label: 'Audit',
    body: 'Every read, write, plan-commit and override is logged with actor, timestamp, source IP and request payload. Logs are append-only and time-stamped against an internal trusted clock.',
  },
  {
    icon: Lock,
    label: 'Encryption',
    body: 'TLS 1.3 in flight. AES-256 at rest. Customer-managed keys (BYOK) on AWS KMS for Multi-site Operator and above; HSM-backed keys for Sovereign deployments.',
  },
  {
    icon: Network,
    label: 'Network',
    body: 'Private VPC isolation per customer. PrivateLink endpoints for ingestion. Sovereign deployments support full air-gap with sneakernet update bundles signed by NEMO.',
  },
];

const COMPLIANCE = [
  {
    title: 'SOC 2 Type II',
    body: 'Independently audited annually against the Trust Services Criteria for security, availability and confidentiality.',
  },
  {
    title: 'ISO/IEC 27001',
    body: 'Information security management system certified to ISO/IEC 27001:2022 across our engineering, operations and customer-success functions.',
  },
  {
    title: 'MeitY-aligned',
    body: 'Controls aligned with India\'s MeitY guidelines for sensitive workloads. Sovereign deployments map to the Empanelled Cloud Services Provider expectations.',
  },
];

const ARCHITECTURE = [
  {
    icon: ShieldCheck,
    title: 'Determinism over generation',
    body: 'Operational decisions emerge from a deterministic linear-programming core, not a generative model. Every plan is a feasible solution to an explicit, written-down objective. No hallucinations to audit.',
  },
  {
    icon: FileCheck,
    title: 'Replayable graphs',
    body: 'Every multi-agent deliberation is a directed graph that can be replayed step-by-step with the same inputs and reach the same outputs. A regulator or internal audit team can walk any decision back to its constraints.',
  },
  {
    icon: Lock,
    title: 'Exit clause by design',
    body: 'Sovereign customers receive source escrow and a contractual right to extract the running deployment. We win on continued service quality, not lock-in.',
  },
];

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] antialiased">
      <LandingNav />

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="pt-36 pb-20 sm:pb-24 border-b border-[#1f1f1f]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3b82f6]">
              Security &amp; data residency
            </div>
            <h1 className="mt-4 text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-[#e5e5e5] leading-[1.02] text-balance">
              Sovereign by design.
            </h1>
            <p className="mt-6 text-lg text-[#a3a3a3] leading-relaxed max-w-2xl text-pretty">
              CrudeFlow holds the most sensitive data a refiner generates —
              cargo flows, hedging stance, port relationships. Our security
              posture is built around one principle: the operator stays in
              control of their own data, end-to-end.
            </p>

            {/* Trust badges */}
            <div className="mt-10 flex flex-wrap gap-3">
              {COMPLIANCE.map((c) => (
                <div
                  key={c.title}
                  className="inline-flex items-center gap-2 rounded-full border border-[#2a2a2a] bg-[#0d0d0d] px-3 py-1.5 text-xs"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-[#d4d4d4]">{c.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Data residency ───────────────────────────────────── */}
      <section id="residency" className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3b82f6]">
              Where your data lives
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight text-[#e5e5e5] leading-tight text-balance">
              Indian by default. Air-gapped on request.
            </h2>
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {RESIDENCY.map((r) => {
              const Icon = r.icon;
              return (
                <div
                  key={r.label}
                  className="rounded-2xl border border-[#2a2a2a] bg-[#0d0d0d] p-6 transition-all duration-300 hover:translate-y-[-1px] hover:border-[#3a3a3a]"
                >
                  <div className="rounded-md border border-[#2a2a2a] bg-[#141414] inline-flex p-2">
                    <Icon className="h-4 w-4 text-[#3b82f6]" />
                  </div>
                  <div className="mt-4 text-base font-semibold text-[#e5e5e5]">
                    {r.label}
                  </div>
                  <p className="mt-2 text-sm text-[#a3a3a3] leading-relaxed">{r.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Controls ─────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 border-t border-[#1f1f1f] bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3b82f6]">
              Controls
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight text-[#e5e5e5] leading-tight text-balance">
              Identity, audit, encryption, network — explicit at every layer.
            </h2>
          </div>

          <div className="mt-10 grid md:grid-cols-2 gap-px bg-[#1f1f1f] rounded-2xl overflow-hidden border border-[#1f1f1f]">
            {CONTROLS.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.label} className="bg-[#0a0a0a] p-7">
                  <div className="flex items-center gap-3">
                    <div className="rounded-md border border-[#2a2a2a] bg-[#141414] p-2">
                      <Icon className="h-4 w-4 text-[#3b82f6]" />
                    </div>
                    <div className="text-sm font-semibold text-[#e5e5e5]">{c.label}</div>
                  </div>
                  <p className="mt-4 text-sm text-[#a3a3a3] leading-relaxed">{c.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Architecture ─────────────────────────────────────── */}
      <section className="py-20 sm:py-24 border-t border-[#1f1f1f]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3b82f6]">
              Architecture
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight text-[#e5e5e5] leading-tight text-balance">
              Auditable by construction, not by promise.
            </h2>
          </div>

          <div className="mt-10 space-y-3">
            {ARCHITECTURE.map((a) => {
              const Icon = a.icon;
              return (
                <div
                  key={a.title}
                  className="rounded-2xl border border-[#2a2a2a] bg-[#0d0d0d] p-6 sm:p-8 flex flex-col sm:flex-row gap-5 transition-all duration-300 hover:border-[#3a3a3a]"
                >
                  <div className="rounded-md border border-[#2a2a2a] bg-[#141414] inline-flex p-2 self-start">
                    <Icon className="h-4 w-4 text-[#3b82f6]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-semibold text-[#e5e5e5]">
                      {a.title}
                    </div>
                    <p className="mt-2 text-sm text-[#a3a3a3] leading-relaxed max-w-3xl">
                      {a.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── SLA ──────────────────────────────────────────────── */}
      <section id="sla" className="py-20 sm:py-24 border-t border-[#1f1f1f] bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3b82f6]">
              SLA
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight text-[#e5e5e5] leading-tight text-balance">
              Service levels that match operational reality.
            </h2>
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              { tier: 'Single site', uptime: '99.5%', response: 'Next business day' },
              { tier: 'Multi-site operator', uptime: '99.9%', response: '4 hr · 24×7' },
              { tier: 'Sovereign', uptime: '99.99%', response: '1 hr · 24×7' },
            ].map((row) => (
              <div
                key={row.tier}
                className="rounded-2xl border border-[#2a2a2a] bg-[#0a0a0a] p-6"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#737373]">
                  {row.tier}
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#525252]">
                      Uptime
                    </div>
                    <div className="mt-1 font-mono text-2xl text-[#e5e5e5] tabular-nums">
                      {row.uptime}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#525252]">
                      Response
                    </div>
                    <div className="mt-1 text-sm text-[#d4d4d4] leading-tight">
                      {row.response}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 border-t border-[#1f1f1f]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#e5e5e5] leading-tight text-balance">
            Want the full security review packet?
          </h2>
          <p className="mt-4 text-base text-[#a3a3a3] max-w-xl mx-auto">
            We&apos;ll send the SOC 2 II report, ISO 27001 certificate, sub-processor
            list and our standard DPA under NDA.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/company#contact"
              className="inline-flex items-center gap-2 rounded-md bg-[#3b82f6] hover:bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white transition-colors"
            >
              Request the packet
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-md border border-[#2a2a2a] hover:border-[#3a3a3a] px-5 py-3 text-sm font-semibold text-[#e5e5e5] transition-colors"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
