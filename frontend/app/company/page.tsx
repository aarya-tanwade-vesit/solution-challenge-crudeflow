'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import { Anchor, ArrowRight, CheckCircle2, AlertTriangle, Zap, Shield, TrendingUp, Mail, Linkedin, Github } from 'lucide-react';

/**
 * NEMO Company Page — Enterprise storytelling via scroll-triggered ship journey
 *
 * Ship animation states cascade with scroll:
 * - INTRO (calm sailing) → 0–15%
 * - PROBLEM (turbulent/vibrating) → 15–40%
 * - SOLUTION (smooth, confident) → 40–65%
 * - WHY US (ascending) → 65–85%
 * - CTA (anchored, stable) → 85–100%
 *
 * Ship fixed on right side. Content flows left with margin for ship.
 */

export default function CompanyPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const [shipState, setShipState] = useState<'intro' | 'problem' | 'solution' | 'why' | 'cta'>('intro');

  // Detect scroll position and update ship state
  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((v) => {
      if (v < 0.15) setShipState('intro');
      else if (v < 0.4) setShipState('problem');
      else if (v < 0.65) setShipState('solution');
      else if (v < 0.85) setShipState('why');
      else setShipState('cta');
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  // Ship parallax (slight vertical drift)
  const shipY = useTransform(scrollYProgress, [0, 1], [0, 120]);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#0a0a0a] text-[#e5e5e5] overflow-x-hidden">
      {/* ════════════════════════════════════════════════════════════════
          FIXED SHIP ANIMATION (Right side)
          ════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="fixed right-12 top-1/3 z-30 pointer-events-none hidden lg:block"
        style={{ y: shipY }}
      >
        <svg
          width="140"
          height="140"
          viewBox="0 0 140 140"
          className="filter drop-shadow-2xl"
        >
          {/* PROBLEM STATE: Turbulent waves (high amplitude) */}
          {shipState === 'problem' && (
            <motion.g
              animate={{ y: [0, -6, 2, -4, 0] }}
              transition={{ duration: 0.4, repeat: Infinity, ease: 'easeInOut' }}
              opacity={0.7}
            >
              <path d="M 15 115 Q 40 100, 70 115 T 125 115" stroke="rgba(239, 68, 68, 0.5)" strokeWidth="2.5" fill="none" />
              <path d="M 15 128 Q 40 118, 70 128 T 125 128" stroke="rgba(239, 68, 68, 0.35)" strokeWidth="2" fill="none" />
              <path d="M 15 140 Q 40 133, 70 140 T 125 140" stroke="rgba(239, 68, 68, 0.2)" strokeWidth="1.5" fill="none" />
            </motion.g>
          )}

          {/* SOLUTION STATE: Smooth, gentle waves */}
          {shipState === 'solution' && (
            <motion.g
              animate={{ y: [0, 2, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              opacity={0.5}
            >
              <path d="M 15 118 Q 40 113, 70 118 T 125 118" stroke="rgba(34, 211, 238, 0.4)" strokeWidth="2" fill="none" />
              <path d="M 15 130 Q 40 126, 70 130 T 125 130" stroke="rgba(34, 211, 238, 0.25)" strokeWidth="1.5" fill="none" />
            </motion.g>
          )}

          {/* WHY STATE: Rising (uplift animation) */}
          {shipState === 'why' && (
            <motion.g
              animate={{ y: [-8, 0, -8] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              opacity={0.6}
            >
              <path d="M 15 120 Q 40 115, 70 120 T 125 120" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="2" fill="none" />
              <circle cx="70" cy="100" r="30" fill="none" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" strokeDasharray="4,2" />
            </motion.g>
          )}

          {/* Ship hull */}
          <rect x="30" y="80" width="80" height="28" rx="6" fill="#1f1f1f" stroke="#3b82f6" strokeWidth="2.5" />

          {/* Ship cabin */}
          <rect x="52" y="55" width="36" height="32" rx="3" fill="#0f0f0f" stroke="#3b82f6" strokeWidth="2.5" />

          {/* Ship mast */}
          <line x1="70" y1="55" x2="70" y2="15" stroke="#3b82f6" strokeWidth="2.5" />

          {/* Sail (animates with problem state) */}
          <motion.path
            d="M 70 22 L 100 65 L 85 65 Z"
            fill="rgba(59, 130, 246, 0.25)"
            stroke="#3b82f6"
            strokeWidth="2"
            animate={shipState === 'problem' ? { rotate: [0, 2, -2, 0] } : { rotate: 0 }}
            transition={shipState === 'problem' ? { duration: 0.3, repeat: Infinity } : {}}
          />

          {/* Anchor (NEMO logo reference) */}
          <circle cx="70" cy="108" r="5" fill="#3b82f6" />
          <path d="M 70 113 L 70 122 M 66 122 L 74 122" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />

          {/* Status indicator (color-coded per state) */}
          <circle
            cx="128"
            cy="25"
            r="7"
            fill={
              shipState === 'problem'
                ? '#ef4444'
                : shipState === 'solution'
                  ? '#10b981'
                  : shipState === 'why'
                    ? '#8b5cf6'
                    : '#3b82f6'
            }
            opacity={0.85}
          />
        </svg>

        {/* State label below ship */}
        <motion.div
          className="text-center mt-6 text-xs font-mono text-[#737373] uppercase tracking-widest"
          key={shipState}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {shipState === 'intro' && '⛵ Sailing'}
          {shipState === 'problem' && '⚠️ Turbulence'}
          {shipState === 'solution' && '✓ Resolved'}
          {shipState === 'why' && '📈 Ascending'}
          {shipState === 'cta' && '⚓ Anchored'}
        </motion.div>
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════
          MAIN CONTENT (Left side, with right margin for ship on desktop)
          ════════════════════════════════════════════════════════════════ */}
      <div className="max-w-3xl mx-auto px-6 pb-24 lg:pr-96">
        {/* ─────────────────────────────────────────────────────────────
            SECTION 1: BRANDING HERO
            ───────────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="min-h-screen flex flex-col items-start justify-center py-20"
        >
          {/* Anchor badge */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            className="mb-8 inline-flex items-center gap-4"
          >
            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] flex items-center justify-center shadow-lg shadow-[#3b82f6]/20">
              <Anchor className="w-11 h-11 text-white" strokeWidth={2} />
            </div>
          </motion.div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 max-w-2xl">
            Neural Engine
            <br />
            <span className="text-transparent bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] bg-clip-text">
              for Maritime Operations
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-[#a3a3a3] mb-12 max-w-2xl leading-relaxed">
            NEMO transforms maritime uncertainty into deterministic decisions. Built by operators for operators. Deployed at BPCL · handling 180+ shipments per month.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="#products"
              className="group inline-flex items-center gap-2 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#3b82f6]/20 transition-all hover:translate-y-[-2px]"
            >
              Explore Solutions
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-lg border border-[#2a2a2a] hover:border-[#3a3a3a] bg-[#141414] hover:bg-[#1a1a1a] px-6 py-3.5 text-sm font-semibold text-[#e5e5e5] transition-all"
            >
              Get in touch
            </a>
          </div>
        </motion.section>

        {/* ─────────────────────────────────────────────────────────────
            SECTION 2: PRODUCTS
            ───────────────────────────────────────────────────────────── */}
        <motion.section
          id="products"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="min-h-screen flex flex-col justify-center py-24"
        >
          <div className="mb-4 text-xs font-mono uppercase tracking-widest text-[#3b82f6]">Solutions</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Products</h2>
          <p className="text-[#a3a3a3] mb-16 max-w-xl text-lg">
            Purpose-built platforms on the NEMO core. Each solves a vertical problem end-to-end.
          </p>

          {/* CrudeFlow Card */}
          <Link href="/">
            <motion.div
              whileHover={{ translateY: -6 }}
              className="group relative rounded-xl border border-[#2a2a2a] hover:border-[#3a3a3a] bg-[#141414] hover:bg-[#1a1a1a] p-10 cursor-pointer transition-all overflow-hidden"
            >
              {/* Accent bar */}
              <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-[#3b82f6] to-[#1d4ed8] opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Content */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-3xl font-bold mb-2">CrudeFlow</h3>
                  <p className="text-sm text-[#737373] uppercase tracking-widest">Refinery Logistics</p>
                </div>
                <ArrowRight className="w-6 h-6 text-[#3b82f6] opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
              </div>

              {/* Description */}
              <p className="text-[#a3a3a3] mb-8 leading-relaxed text-base">
                Real-time routing, cost optimization, and execution orchestration for VLCC fleets feeding Indian refineries. Reduces fuel + delay costs by 25% while maintaining on-time delivery under geopolitical disruption.
              </p>

              {/* Key features */}
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#10b981] mt-0.5 flex-shrink-0" />
                  <span className="text-[#d4d4d4]">Live AIS + weather + geopolitical sentiment (−100…+100)</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#10b981] mt-0.5 flex-shrink-0" />
                  <span className="text-[#d4d4d4]">Multi-leg execution (ship → rail → truck → refinery intake)</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#10b981] mt-0.5 flex-shrink-0" />
                  <span className="text-[#d4d4d4]">Live at BPCL · 180+ shipments/month · ₹18 Cr+ annual savings</span>
                </div>
              </div>

              {/* Status badge */}
              <div className="pt-6 border-t border-[#1f1f1f]">
                <div className="inline-flex items-center gap-2 text-xs text-[#10b981] font-mono">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                  Production Grade
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Roadmap tease */}
          <div className="mt-20 pt-20 border-t border-[#1f1f1f]">
            <p className="text-xs text-[#737373] uppercase tracking-widest mb-8 font-mono">Coming Soon</p>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { name: 'CargoDirect', desc: 'General cargo & breakbulk optimization' },
                { name: 'PortHarbor', desc: 'Port terminal scheduling + berth allocation' },
              ].map((product) => (
                <div key={product.name} className="rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] p-6 hover:border-[#2a2a2a] transition-colors">
                  <h4 className="font-semibold mb-2">{product.name}</h4>
                  <p className="text-sm text-[#737373]">{product.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ─────────────────────────────────────────────────────────────
            SECTION 3: PROBLEM (Ship turbulates)
            ───────────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="min-h-screen flex flex-col justify-center py-24"
        >
          <div className="mb-4 text-xs font-mono uppercase tracking-widest text-[#3b82f6]">The Challenge</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Maritime Logistics Is Broken</h2>
          <p className="text-[#a3a3a3] mb-16 max-w-xl text-lg">
            Global fleets face converging pressures. Siloed systems cannot keep pace.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: AlertTriangle,
                title: 'Geopolitical Volatility',
                desc: 'Hormuz closures, sanctions, piracy — unplanned detours cost ₹2.5 Cr+ per vessel per day.',
              },
              {
                icon: Zap,
                title: 'Decision Velocity',
                desc: 'Weather windows close in hours. Manual planning cannot keep pace. Operators are reactive, not proactive.',
              },
              {
                icon: TrendingUp,
                title: 'Cost Pressure',
                desc: 'Bunker prices swing ±30% weekly. Shipping rates volatile. Margins compress daily.',
              },
              {
                icon: Shield,
                title: 'Execution Complexity',
                desc: 'Rail + trucking + refinery intake slots. One bottleneck cascades through the entire chain.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
                className="rounded-lg border border-[#2a2a2a] hover:border-[#ef4444]/30 bg-[#141414] hover:bg-[#1a0f0f] p-6 transition-colors"
              >
                <item.icon className="w-7 h-7 text-[#ef4444] mb-4" />
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-[#a3a3a3] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ─────────────────────────────────────────────────────────────
            SECTION 4: SOLUTION (Ship sails smoothly)
            ───────────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="min-h-screen flex flex-col justify-center py-24"
        >
          <div className="mb-4 text-xs font-mono uppercase tracking-widest text-[#3b82f6]">How We Solve It</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Deterministic Systems</h2>
          <p className="text-[#a3a3a3] mb-16 max-w-xl text-lg">
            A system that fuses live signals into ranked decisions. No guessing. No delay. No black boxes.
          </p>

          <div className="space-y-8">
            {[
              {
                step: '01',
                title: 'Fuse Intelligence',
                desc: 'AIS + weather + charter terms + geopolitical news (−100…+100 sentiment) into a unified operational model.',
              },
              {
                step: '02',
                title: 'Reason Mathematically',
                desc: 'Linear programming solves for minimum cost + on-time delivery under real-time constraints. Solver, not magic.',
              },
              {
                step: '03',
                title: 'Act Automatically',
                desc: 'Reroute approval + rail/truck booking + refinery slot allocation cascade in seconds, with full audit trail.',
              },
              {
                step: '04',
                title: 'Learn Continuously',
                desc: 'Every decision logs confidence, outcome, and delta. The system improves weekly from operational feedback.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="relative pl-24 py-6 border-l-2 border-[#3b82f6]"
              >
                <div className="absolute left-[-17px] top-0 w-10 h-10 rounded-full bg-[#3b82f6] flex items-center justify-center text-xs font-bold text-white">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-[#a3a3a3] text-base leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ─────────────────────────────────────────────────────────────
            SECTION 5: WHY US (Ship ascending)
            ───────────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="min-h-screen flex flex-col justify-center py-24"
        >
          <div className="mb-4 text-xs font-mono uppercase tracking-widest text-[#3b82f6]">Why NEMO</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Built Different</h2>
          <p className="text-[#a3a3a3] mb-16 max-w-xl text-lg">
            Purpose-built for operators. Not analytics. Not dashboards. Decisions.
          </p>

          <div className="space-y-6">
            {[
              {
                title: 'Sovereign & Secure',
                desc: 'Data residency in India (Mumbai + Hyderabad). No foreign tenancy. Every decision audit-trail captured for CAG compliance.',
              },
              {
                title: 'Operator-First Design',
                desc: 'Built by maritime people for maritime people. Every feature solves a real operator pain. No consultant fantasy.',
              },
              {
                title: 'Production Proven',
                desc: 'BPCL · 180+ shipments/month · ₹18 Cr+ annual savings. Not a beta. Not a pilot. Live production.',
              },
              {
                title: 'Extensible Foundation',
                desc: 'NEMO core powers CrudeFlow, CargoDirect, PortHarbor. Same engine, vertical solutions.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ borderColor: '#3b82f6' }}
                className="rounded-lg border border-[#2a2a2a] hover:border-[#3b82f6]/50 bg-[#141414] p-8 transition-colors"
              >
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-[#a3a3a3] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ─────────────────────────────────────────────────────────────
            SECTION 6: CONTACT FORM (CTA)
            ───────────────────────────────────────────────────────────── */}
        <motion.section
          id="contact"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="min-h-screen flex flex-col justify-center py-24"
        >
          <div className="mb-4 text-xs font-mono uppercase tracking-widest text-[#3b82f6]">Let's Connect</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Talk to the Team</h2>
          <p className="text-[#a3a3a3] mb-12 max-w-xl text-lg">
            Questions? Ready to pilot? We respond in IST business hours. First call is always with an engineer.
          </p>

          <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-10 max-w-2xl">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-[#e5e5e5] placeholder-[#525252] focus:outline-none focus:border-[#3b82f6] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Company</label>
                  <input
                    type="text"
                    placeholder="Your company"
                    className="w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-[#e5e5e5] placeholder-[#525252] focus:outline-none focus:border-[#3b82f6] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-[#e5e5e5] placeholder-[#525252] focus:outline-none focus:border-[#3b82f6] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">What problem are you solving?</label>
                <textarea
                  placeholder="E.g., optimizing VLCC routing, reducing bunker costs, improving execution..."
                  rows={4}
                  className="w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-[#e5e5e5] placeholder-[#525252] focus:outline-none focus:border-[#3b82f6] transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#3b82f6]/20 transition-all hover:translate-y-[-2px]"
              >
                Send Message
              </button>
            </form>

            {/* Contact methods */}
            <div className="mt-10 pt-8 border-t border-[#1f1f1f] space-y-4">
              <p className="text-xs text-[#737373] uppercase tracking-widest font-mono">Or reach us directly</p>
              <div className="flex flex-col sm:flex-row gap-6">
                <a
                  href="mailto:hello@nemo.ai"
                  className="group flex items-center gap-2 text-[#a3a3a3] hover:text-[#3b82f6] transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span className="font-mono text-sm">hello@nemo.ai</span>
                </a>
                <a
                  href="#"
                  className="group flex items-center gap-2 text-[#a3a3a3] hover:text-[#3b82f6] transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  <span className="font-mono text-sm">LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ─────────────────────────────────────────────────────────────
            FOOTER
            ───────────────────────────────────────────────────────────── */}
        <footer className="py-12 border-t border-[#1f1f1f] mt-24">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-sm text-[#737373]">© 2025 NEMO AI. All rights reserved.</p>
              <p className="text-xs text-[#525252] mt-2">Data residency: Mumbai (primary) · Hyderabad (failover)</p>
            </div>
            <Link href="/" className="text-sm text-[#3b82f6] hover:text-[#60a5fa] transition-colors font-semibold">
              Back to CrudeFlow ↗
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
