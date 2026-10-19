import React from 'react';
import { ViewId } from '../types';
import { ShieldCheck, Scale, Lock } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: ViewId) => void;
  onOpenAudit?: () => void;
  onOpenSecurity?: () => void;
}

export function Footer({ onNavigate, onOpenAudit, onOpenSecurity }: FooterProps) {
  return (
    <footer className="bg-ink text-ink-foreground mt-auto">
      {/* Brand Gradient Bar */}
      <div className="bg-brand h-1.5 w-full" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/kupsa-logo.png"
                alt="KUPSA"
                className="h-9 w-9 object-contain rounded-full bg-white/10 p-0.5"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <span className="font-display text-xl font-semibold text-ink-foreground">
                KUPSA Elections
              </span>
            </div>
            <p className="text-sm text-ink-foreground/75 leading-relaxed">
              Kabarak University Pharmacy Students Association. Governing elections with constitutional integrity, biometric student rosters, and secret ballots.
            </p>
            <p className="font-mono text-xs text-ink-foreground/60">
              Constitutional Chapter Six · Articles 39–55
            </p>
          </div>

          {/* Column 2: Voter Services */}
          <div>
            <p className="eyebrow text-sun opacity-80">Students</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('portal')}
                  className="text-ink-foreground/80 hover:text-sun transition-colors"
                >
                  Student Eligibility Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('candidates')}
                  className="text-ink-foreground/80 hover:text-sun transition-colors"
                >
                  Meet Cleared Candidates
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('results')}
                  className="text-ink-foreground/80 hover:text-sun transition-colors"
                >
                  Live & Certified Results
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('conduct')}
                  className="text-ink-foreground/80 hover:text-sun transition-colors"
                >
                  Voter Code of Conduct
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Governance & Rules */}
          <div>
            <p className="eyebrow text-sun opacity-80">Governance</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('rules')}
                  className="text-ink-foreground/80 hover:text-sun transition-colors"
                >
                  Chapter Six Constitutional Rules
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('roles')}
                  className="text-ink-foreground/80 hover:text-sun transition-colors"
                >
                  Offices & Electoral Mandates
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('conduct')}
                  className="text-ink-foreground/80 hover:text-sun transition-colors"
                >
                  Candidate & Agent Code of Conduct
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('help')}
                  className="text-ink-foreground/80 hover:text-sun transition-colors"
                >
                  Helpdesk & 48hr Appeals
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Trust & Transparency */}
          <div className="space-y-3">
            <p className="eyebrow text-sun opacity-80">Trust & Oversight</p>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <ShieldCheck className="h-4 w-4" />
                <span>5-Gate Clearance Protocol</span>
              </div>
              <p className="text-ink-foreground/70">
                Elections are monitored by independent faculty observers and the Patron under strict audit rules.
              </p>
              <div className="flex items-center gap-2 pt-1 text-ink-foreground/60">
                <Lock className="h-3.5 w-3.5 text-sun" />
                <span>Zero voter-to-ballot linkage</span>
              </div>
            </div>
            {onOpenAudit && (
              <button
                onClick={onOpenAudit}
                className="text-xs text-sun hover:underline inline-flex items-center gap-1 font-mono"
              >
                Inspect Official Audit Dossier →
              </button>
            )}
          </div>
        </div>

        {/* Bottom bar with discrete Commission Officer access */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-foreground/60">
          <p>© 2026 Kabarak University Pharmacy Students Association (KUPSA). All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">Chapter 6 Constitutional Authority</span>
            <button
              onClick={() => onNavigate('commission')}
              className="text-ink-foreground/50 hover:text-sun transition-colors font-mono flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10"
              title="Official Electoral Commission Staff Login"
            >
              <Lock className="h-3 w-3" />
              <span>Officer Portal</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
