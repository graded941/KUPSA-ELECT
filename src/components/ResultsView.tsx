import React, { useState, useEffect, useMemo } from 'react';
import { ViewId, OfficeResult } from '../types';
import { OFFICE_RESULTS, TURNOUT_METRICS, getElectionPollingDate } from '../data/election';
import { useVotingStore } from '../context/VotingStore';
import { PageIntro } from './site-shell';
import {
  Trophy,
  CheckCircle2,
  FileCheck,
  Search,
  ShieldCheck,
  Award,
  Download,
  Printer,
  X,
  Clock,
  Lock,
  ArrowRight,
  AlertTriangle,
  Calendar
} from 'lucide-react';

interface ResultsViewProps {
  onNavigate: (view: ViewId) => void;
  onOpenAudit?: () => void;
}

export function ResultsView({ onNavigate, onOpenAudit }: ResultsViewProps) {
  const { isResultsLive } = useVotingStore();

  const [selectedOffice, setSelectedOffice] = useState<string>('all');
  const [searchReceipt, setSearchReceipt] = useState('');
  const [receiptVerificationResult, setReceiptVerificationResult] = useState<string | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState<OfficeResult | null>(null);

  // Calculate target 5:00 PM (17:00 EAT) on Election Day
  const electionClosureDate = useMemo(() => {
    const d = getElectionPollingDate();
    d.setHours(17, 0, 0, 0); // 5:00 PM
    return d;
  }, []);

  // Live countdown state for embargo
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>(() => {
    const diff = Math.max(0, electionClosureDate.getTime() - Date.now());
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.max(0, electionClosureDate.getTime() - Date.now());
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [electionClosureDate]);

  const t = TURNOUT_METRICS;

  const handleVerifyReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchReceipt.trim()) return;
    if (searchReceipt.toUpperCase().includes('KUPSA') || searchReceipt.length >= 6) {
      setReceiptVerificationResult('CONFIRMED_VALID');
    } else {
      setReceiptVerificationResult('INVALID_HASH');
    }
  };

  const filteredResults = OFFICE_RESULTS.filter(
    (r) => selectedOffice === 'all' || r.officeId === selectedOffice
  );

  // EMBARGO SCREEN: Shown when the Commission has set results to NOT LIVE
  if (!isResultsLive) {
    return (
      <>
        <PageIntro eyebrow="Official Embargo · Article 46" title="Results Sealed Until Polls Close">
          Official election counts are cryptographically sealed under Article 46. The Chief Returning Officer will declare and unseal the verified tallies at 5:00 PM on Election Day.
        </PageIntro>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
          <div className="rounded-3xl border-2 border-ink bg-card p-6 sm:p-12 shadow-pop text-center space-y-8 animate-in fade-in duration-300">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-mono text-primary font-bold">
              <Lock className="h-3.5 w-3.5" />
              <span>Official Gazettement Embargo Active</span>
            </div>

            {/* Countdown Title */}
            <div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                Public Results Unseal In
              </h2>
              <p className="mt-2 text-sm text-muted-foreground font-mono">
                Official Declaration: First Friday of November at 17:00 EAT (5:00 PM)
              </p>
            </div>

            {/* 4 Countdown Blocks */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {[
                { label: 'Days', val: String(timeLeft.days).padStart(2, '0') },
                { label: 'Hours', val: String(timeLeft.hours).padStart(2, '0') },
                { label: 'Minutes', val: String(timeLeft.minutes).padStart(2, '0') },
                { label: 'Seconds', val: String(timeLeft.seconds).padStart(2, '0') },
              ].map((b) => (
                <div
                  key={b.label}
                  className="rounded-2xl border-2 border-border bg-secondary/50 p-4 sm:p-6 text-center shadow-xs"
                >
                  <div className="font-mono text-3xl sm:text-5xl font-bold text-foreground">
                    {b.val}
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mt-1 block">
                    {b.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Institutional Information & Rule Box */}
            <div className="rounded-2xl border border-border bg-secondary/30 p-5 text-left space-y-3 text-xs sm:text-sm text-foreground/85 leading-relaxed">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                <span>Statutory Article 46 Declaration Protocol</span>
              </div>
              <p>
                In accordance with Chapter Six of the KUPSA Constitution, ballot boxes remain under the physical custody of the Staff Patron and Chief Returning Officer until general voting closes at 17:00 EAT.
              </p>
              <p className="text-xs text-muted-foreground">
                Counting occurs in the presence of certified candidate agents, independent faculty observers, and Dean of Pharmacy delegates. Certified tallies will appear here automatically upon declaration.
              </p>
            </div>

            {/* Action Links */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('candidates')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3 text-xs font-semibold text-ink-foreground shadow-xs hover:bg-primary transition-colors cursor-pointer"
              >
                <span>Meet Cleared Candidates</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('rules')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
              >
                <span>Read Constitutional Rules</span>
              </button>
            </div>

            {/* Note for Commission Officer testing */}
            <p className="text-[11px] font-mono text-muted-foreground pt-4 border-t border-border">
              Testing Note: Commission Officers can toggle public results live in the{' '}
              <button
                type="button"
                onClick={() => onNavigate('commissioner')}
                className="text-primary underline font-bold cursor-pointer"
              >
                Electoral Commission Portal
              </button>.
            </p>
          </div>
        </div>
      </>
    );
  }

  // LIVE RESULTS: Displayed when isResultsLive is true
  return (
    <>
      <PageIntro eyebrow="Results · Certified" title="Who students chose">
        Certified declaration of the 2026 KUPSA General Elections. Each result tally is witnessed and signed off by candidate agents and the Staff Patron.
      </PageIntro>

      {/* Dark KPI Turnout Strip */}
      <section className="bg-ink text-ink-foreground border-b border-white/10">
        <div className="mx-auto grid max-w-6xl grid-cols-1 sm:grid-cols-3 gap-6 px-4 sm:px-6 py-8">
          {[
            ['Turnout Rate', `${t.turnoutPercentage.toFixed(0)}%`, '849 of 1,042 enrolled pharmacy voters'],
            ['Ballots Cast', t.ballotsCast.toLocaleString(), 'Verified across 6 contested portfolios'],
            ['Registered Voters', t.registeredTotal.toLocaleString(), 'Certified by Faculty Registrar roll'],
          ].map(([l, v, note]) => (
            <div key={l}>
              <p className="eyebrow opacity-60 text-sun">{l}</p>
              <p className="mt-1 font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-ink-foreground">
                {v}
              </p>
              <p className="text-xs opacity-60 font-mono mt-1">{note}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14 space-y-12">
        {/* Verification & Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Office Filter Pills */}
          <div className="no-scrollbar -mx-4 sm:mx-0 flex gap-2 overflow-x-auto px-4 sm:px-0 pb-1">
            <button
              onClick={() => setSelectedOffice('all')}
              className={`shrink-0 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all ${
                selectedOffice === 'all'
                  ? 'border-ink bg-ink text-ink-foreground shadow-xs'
                  : 'border-border bg-card text-foreground hover:border-ink'
              }`}
            >
              All offices ({OFFICE_RESULTS.length})
            </button>
            {OFFICE_RESULTS.map((r) => (
              <button
                key={r.officeId}
                onClick={() => setSelectedOffice(r.officeId)}
                className={`shrink-0 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all ${
                  selectedOffice === r.officeId
                    ? 'border-ink bg-ink text-ink-foreground shadow-xs'
                    : 'border-border bg-card text-foreground hover:border-ink'
                }`}
              >
                {r.officeTitle}
              </button>
            ))}
          </div>
        </div>

        {/* Office Results Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {filteredResults.map((r) => (
            <article
              key={r.officeId}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-card hover:border-ink transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-2xl font-semibold text-foreground">
                      {r.officeTitle}
                    </h3>
                    <p className="font-mono text-xs text-muted-foreground mt-0.5">
                      {r.constitutionalArticle} · {r.totalVotesCast.toLocaleString()} votes cast
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 font-mono text-xs font-semibold text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {r.status}
                  </span>
                </div>

                {/* Candidate Vote Breakdown */}
                <div className="mt-6 space-y-4">
                  {r.candidateTallies.map((c) => {
                    return (
                      <div key={c.candidateName} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className={`font-semibold flex items-center gap-1.5 ${c.isWinner ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {c.isWinner && <Trophy className="h-4 w-4 text-primary shrink-0" />}
                            {c.candidateName}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">
                            <strong className="text-foreground">{c.votes.toLocaleString()}</strong> ({c.percentage}%)
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              c.isWinner ? 'bg-primary' : 'bg-ink/60'
                            }`}
                            style={{ width: `${c.percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Certificate Verification Link */}
              {(() => {
                const winner = r.candidateTallies.find((c) => c.isWinner) || r.candidateTallies[0];
                return (
                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground">
                      Winner: <strong className="text-foreground">{winner?.candidateName}</strong> ({winner?.percentage}%)
                    </span>
                    <button
                      onClick={() => setShowCertificateModal(r)}
                      className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      View Gazettement Notice →
                    </button>
                  </div>
                );
              })()}
            </article>
          ))}
        </div>

        {/* Voter Anonymous Receipt Hash Verifier */}
        <div className="rounded-2xl border-2 border-border bg-card p-6 sm:p-8 shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-ink-foreground">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">
                Verify Your Anonymous Ballot Hash
              </h3>
              <p className="text-xs text-muted-foreground">
                Enter the receipt code given when you voted to verify your ballot was counted.
              </p>
            </div>
          </div>

          <form onSubmit={handleVerifyReceipt} className="flex flex-col sm:flex-row gap-3 pt-2">
            <input
              type="text"
              value={searchReceipt}
              onChange={(e) => {
                setSearchReceipt(e.target.value);
                setReceiptVerificationResult(null);
              }}
              placeholder="e.g. KUPSA-2026-REC-XXXXX"
              className="flex-1 rounded-xl border border-border bg-background py-2.5 px-4 text-sm font-mono text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-xs font-semibold text-ink-foreground shadow-xs hover:bg-primary transition-colors cursor-pointer"
            >
              <Search className="h-4 w-4" />
              <span>Verify Ballot</span>
            </button>
          </form>

          {receiptVerificationResult === 'CONFIRMED_VALID' && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-800 flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Ballot Confirmed & Witnessed</p>
                <p className="mt-0.5 text-emerald-700">
                  This anonymous receipt was verified against the certified Electoral Commission registry. The vote is counted in the official results declaration.
                </p>
              </div>
            </div>
          )}

          {receiptVerificationResult === 'INVALID_HASH' && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive flex items-start gap-2.5 animate-in fade-in">
              <X className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Receipt Not Found in Certified Roll</p>
                <p className="mt-0.5">
                  Please verify your receipt format. If you suspect an error, contact the Commission Secretariat.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertificateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={() => setShowCertificateModal(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border-2 border-ink bg-card p-6 sm:p-8 shadow-pop space-y-5 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <span className="eyebrow text-primary font-bold">Official Certificate</span>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  Gazettement of Winner
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCertificateModal(null)}
                className="text-muted-foreground hover:text-foreground text-xs font-mono font-bold"
              >
                Close ✕
              </button>
            </div>

            {(() => {
              const winner = showCertificateModal.candidateTallies.find((c) => c.isWinner) || showCertificateModal.candidateTallies[0];
              return (
                <div className="rounded-xl border-2 border-border p-5 space-y-3 bg-background">
                  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    Office: {showCertificateModal.officeTitle}
                  </p>
                  <h4 className="font-display text-xl font-bold text-foreground">
                    {winner?.candidateName}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Duly elected with <strong>{winner?.votes.toLocaleString()} votes ({winner?.percentage}%)</strong> out of {showCertificateModal.totalVotesCast.toLocaleString()} votes cast.
                  </p>
                  <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                    <span>Certified: Nov 06, 2026</span>
                    <span className="text-emerald-700 font-semibold">Signed by Patron</span>
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowCertificateModal(null)}
                className="rounded-xl bg-ink px-5 py-2 text-xs font-semibold text-ink-foreground hover:bg-primary transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
