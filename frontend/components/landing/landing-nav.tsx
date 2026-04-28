'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Anchor, ArrowRight, Menu, X } from 'lucide-react';

/**
 * Top navigation for the marketing landing page.
 *
 * Behavior:
 *  - Transparent at the top of the viewport, then gains a thin
 *    bottom border + blurred backdrop once the user scrolls past 8px.
 *    This keeps the hero feeling "open" while preserving readability
 *    when section content begins to slide under it.
 *  - Mobile: collapses links into a sheet-style drawer.
 */
export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const links = [
    { label: 'Product', href: '#product' },
    { label: 'Theatre', href: '#theatre' },
    { label: 'Sentiment', href: '#sentiment' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Customers', href: '/customers' },
    { label: 'Company', href: '/company' },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#2a2a2a]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] flex items-center justify-center shadow-lg shadow-[#3b82f6]/20">
            <Anchor className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold text-[#e5e5e5] tracking-tight">
              CrudeFlow
            </span>
            <span className="text-[9px] font-medium text-[#737373] tracking-[0.12em] uppercase mt-0.5">
              by NEMO
            </span>
          </div>
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-3 py-2 text-sm text-[#a3a3a3] hover:text-[#e5e5e5] transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* CTA cluster */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/dashboard"
            className="px-3 py-2 text-sm text-[#a3a3a3] hover:text-[#e5e5e5] transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-1.5 rounded-md bg-[#3b82f6] hover:bg-[#2563eb] px-3.5 py-2 text-sm font-semibold text-white transition-colors"
          >
            Open dashboard
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile trigger */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden p-2 rounded-md text-[#a3a3a3] hover:text-[#e5e5e5] hover:bg-[#1a1a1a]"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile sheet */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#2a2a2a] bg-[#0a0a0a]/95 backdrop-blur-md">
          <div className="px-6 py-4 flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 text-sm text-[#a3a3a3] hover:text-[#e5e5e5] hover:bg-[#1a1a1a] rounded-md"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/dashboard"
              className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-md bg-[#3b82f6] hover:bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Open dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
