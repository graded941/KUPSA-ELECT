import React from 'react';
import { ViewId } from '../types';
import { ShieldCheck, Lock } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: ViewId) => void;
  onOpenAudit?: () => void;
  onOpenSecurity?: () => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-[#12100e] text-[#f4efe8] mt-auto border-t-2 border-[#e65c00]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Identity */}
          <div className="space-y-3">
            <button
              onClick={() => onNavigate('overview')}
              className="flex items-center gap-3 text-left cursor-pointer group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f59e0b] rounded-lg p-0.5"
            >
              <img
                src="/kupsa-logo.png"
                alt="KUPSA"
                className="h-9 w-9 object-contain rounded-full bg-[#221e1b] border border-[#38322c] p-0.5"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <span className="font-display text-xl font-semibold text-[#f4efe8] group-hover:text-[#f59e0b] transition-colors">
                KUPSA Elections
              </span>
            </button>
            <p className="text-sm text-[#b8b0a5] leading-relaxed">
              Kabarak University Pharmacy Students Association. Governing elections with constitutional integrity, verified student rosters, and secret ballots.
            </p>
            <p className="font-mono text-xs text-[#8f867b]">
              Constitutional Chapter Six · Articles 39–55
            </p>
          </div>

          {/* Column 2: Voter Services */}
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-[#f59e0b] font-semibold">Students</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('portal')}
                  className="text-[#b8b0a5] hover:text-[#f59e0b] transition-colors cursor-pointer text-left"
                >
                  Vote (Ballot Portal)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('candidates')}
                  className="text-[#b8b0a5] hover:text-[#f59e0b] transition-colors cursor-pointer text-left"
                >
                  Meet Cleared Candidates
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('results')}
                  className="text-[#b8b0a5] hover:text-[#f59e0b] transition-colors cursor-pointer text-left"
                >
                  Live & Certified Results
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('conduct')}
                  className="text-[#b8b0a5] hover:text-[#f59e0b] transition-colors cursor-pointer text-left"
                >
                  Voter Code of Conduct
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Governance & Rules */}
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-[#f59e0b] font-semibold">Governance</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('rules')}
                  className="text-[#b8b0a5] hover:text-[#f59e0b] transition-colors cursor-pointer text-left"
                >
                  Chapter Six Constitutional Rules
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('roles')}
                  className="text-[#b8b0a5] hover:text-[#f59e0b] transition-colors cursor-pointer text-left"
                >
                  Offices & Electoral Mandates
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('conduct')}
                  className="text-[#b8b0a5] hover:text-[#f59e0b] transition-colors cursor-pointer text-left"
                >
                  Candidate & Agent Code of Conduct
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('help')}
                  className="text-[#b8b0a5] hover:text-[#f59e0b] transition-colors cursor-pointer text-left"
                >
                  Helpdesk & 48hr Appeals
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Trust & Transparency */}
          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-wider text-[#f59e0b] font-semibold">Trust & Oversight</p>
            <div className="rounded-xl border border-[#2f2924] bg-[#1a1715] p-3.5 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <ShieldCheck className="h-4 w-4" />
                <span>5-Gate Clearance Protocol</span>
              </div>
              <p className="text-[#b8b0a5] leading-relaxed">
                Elections are monitored by independent faculty observers and the Patron under strict statutory rules.
              </p>
              <div className="flex items-center gap-2 pt-1 text-[#8f867b]">
                <Lock className="h-3.5 w-3.5 text-[#f59e0b]" />
                <span>Zero voter-to-ballot linkage</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar with solid Commission Officer access */}
        <div className="mt-10 pt-6 border-t border-[#292522] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8f867b]">
          <p>© 2026 Kabarak University Pharmacy Students Association (KUPSA). All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">Chapter 6 Constitutional Authority</span>
            <button
              onClick={() => onNavigate('commissioner')}
              className="text-[#f4efe8] hover:text-[#12100e] hover:bg-[#f59e0b] transition-colors font-mono text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#221e1b] border border-[#38322c] cursor-pointer"
              title="Official Electoral Commission Portal"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#f59e0b] group-hover:text-[#12100e]" />
              <span>Electoral Commission</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
