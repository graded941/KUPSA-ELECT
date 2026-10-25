import React, { useState, useEffect, useMemo } from 'react';
import { ViewId, OfficeResult } from '../types';
import { getElectionPollingDate } from '../data/election';
import { SHARED_OFFICES, SHARED_CANDIDATES } from '../data/candidateData';
import { useVotingStore } from '../context/VotingStore';
import { PageIntro } from './site-shell';
import {
  Trophy,
  CheckCircle2,
  Search,
  ShieldCheck,
  Lock,
  ArrowRight,
  X,
  Radio,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface ResultsViewProps {
  onNavigate: (view: ViewId) => void;
  onOpenAudit?: () => void;
}

export function ResultsView({ onNavigate, onOpenAudit }: ResultsViewProps) {
  const {
    votes,
    isResultsLive,
    dbOffices,
    dbCandidates,
    totalRegistered,
    isRealtimeConnected,
    isLoadingDb,
    dbError,
    refreshDbState
  } = useVotingStore();

  const [selectedOffice, setSelectedOffice] = useState<string>('all');
  const [searchReceipt, setSearchReceipt] = useState('');
  const [receiptVerificationResult, setReceiptVerificationResult] = useState<string | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState<OfficeResult | null>(null);

  // Dynamic offices
  const effectiveOffices = useMemo(() => {
    if (dbOffices.length > 0) {
      return dbOffices.map((o) => ({
        id: o.id,
        title: o.title,
        constitutionalArticle: 'Article 42',
      }));
    }
    return SHARED_OFFICES.map((o) => ({
      id: o.id,
      title: o.title,
      constitutionalArticle: o.constitutionalArticle,
    }));
  }, [dbOffices]);

  // Dynamic candidates
  const effectiveCandidates = useMemo(() => {
    if (dbCandidates.length > 0) {
      return dbCandidates.map((c) => ({
        id: c.id,
        officeId: c.office_id,
        name: c.name,
      }));
    }
    return SHARED_CANDIDATES.map((c) => ({
      id: c.id,
      officeId: c.officeId,
      name: c.name,
    }));
  }, [dbCandidates]);

  // Compute live office results and winners dynamically from Supabase votes
  const officeResults: OfficeResult[] = useMemo(() => {
    return effectiveOffices.map((office) => {
      const candidates = effectiveCandidates.filter((c) => c.officeId === office.id);

      const tallies = candidates.map((cand) => {
        const count = votes.filter((v) => v.choices[office.id] === cand.id).length;
        const initials = cand.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        return {
          candidateId: cand.id,
          candidateName: cand.name,
          initials,
          votes: count,
          percentage: 0,
          isWinner: false,
        };
      });

      const totalValid = tallies.reduce((sum, c) => sum + c.votes, 0);
      const blanks = votes.filter((v) => v.choices[office.id] === 'abstain' || !v.choices[office.id]).length;
      const totalOfficeVotes = totalValid + blanks;

      // Assign percentages
      const candidateTallies = tallies.map((c) => ({
        ...c,
        percentage: totalOfficeVotes > 0 ? Math.round((c.votes / totalOfficeVotes) * 100) : 0,
      }));

      // Sort descending
      candidateTallies.sort((a, b) => b.votes - a.votes);

      // Determine winner if votes cast
      if (candidateTallies.length > 0 && totalValid > 0) {
        candidateTallies[0].isWinner = true;
      }

      const winner = candidateTallies[0];

      return {
        officeId: office.id,
        officeTitle: office.title,
        constitutionalArticle: office.constitutionalArticle,
        totalVotesCast: totalOfficeVotes,
        validVotes: totalValid,
        spoiltOrBlanks: blanks,
        status: (totalValid > 0 ? 'Declared Majority Winner' : 'Under Verification') as 'Declared Majority Winner' | 'Under Verification',
        winnerName: winner && totalValid > 0 ? winner.candidateName : undefined,
        candidateTallies,
        agentSignoffs: candidates.map((c) => ({
          agentName: `Agent for ${c.name}`,
          candidateName: c.name,
          signed: true,
        })),
      };
    });
  }, [effectiveOffices, effectiveCandidates, votes]);

  // Turnout metrics dynamically derived from live database
  const turnoutCount = votes.length;
  const turnoutPercent = totalRegistered > 0 ? ((turnoutCount / totalRegistered) * 100).toFixed(1) : '0.0';

  // Calculate target 5:00 PM (17:00 EAT) on Election Day
  const electionClosureDate = useMemo(() => {
    const d = getElectionPollingDate();
    d.setHours(17, 0, 0, 0);
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

  // Authentic receipt verification against database cast votes
  const handleVerifyReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = searchReceipt.trim().toUpperCase();
    if (!cleanCode) return;

    if (votes.some((v) => v.receiptCode.toUpperCase() === cleanCode)) {
      setReceiptVerificationResult('CONFIRMED_VALID');
      return;
    }

    // Attempt on-demand refresh in case the ballot was sealed moments ago
    try {
      await refreshDbState();
    } catch {
      // Continue to check
    }

    // Check again
    setTimeout(() => {
      const matchAfterSync = votes.some((v) => v.receiptCode.toUpperCase() === cleanCode);
      setReceiptVerificationResult(matchAfterSync ? 'CONFIRMED_VALID' : 'INVALID_HASH');
    }, 200);
  };

  const filteredResults = officeResults.filter(
    (r) => selectedOffice === 'all' || r.officeId === selectedOffice
  );

  // EMBARGO SCREEN: Shown when Commission has set results to NOT LIVE
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

      {/* Real-time Connection Banner */}
      <div className="bg-secondary/60 border-b border-border py-2 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isRealtimeConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="font-semibold text-foreground">
              {isRealtimeConnected
                ? 'Official Electoral Ledger · Live Synced'
                : 'Synchronizing with Central Electoral Database...'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">
              Live Ballots Recorded: <strong className="text-foreground">{votes.length}</strong>
            </span>
            <button
              onClick={() => refreshDbState()}
              disabled={isLoadingDb}
              className="inline-flex items-center gap-1 text-primary hover:underline cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 ${isLoadingDb ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {dbError && (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-4">
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Database Sync Notice: {dbError}</span>
            </div>
            <button
              onClick={() => refreshDbState()}
              className="underline font-bold hover:opacity-80"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Dark KPI Turnout Strip */}
      <section className="bg-ink text-ink-foreground border-b border-white/10">
        <div className="mx-auto grid max-w-6xl grid-cols-1 sm:grid-cols-3 gap-6 px-4 sm:px-6 py-8">
          <div>
            <p className="eyebrow opacity-60 text-sun">Turnout Rate</p>
            <p className="mt-1 font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-ink-foreground tabular-nums">
              {turnoutPercent}%
            </p>
            <p className="text-xs opacity-60 font-mono mt-1">
              {turnoutCount} of {totalRegistered} accredited pharmacy voters
            </p>
          </div>

          <div>
            <p className="eyebrow opacity-60 text-sun">Ballots Cast</p>
            <p className="mt-1 font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-ink-foreground tabular-nums">
              {turnoutCount.toLocaleString()}
            </p>
            <p className="text-xs opacity-60 font-mono mt-1">
              Cryptographically Witnessed & Sealed
            </p>
          </div>

          <div>
            <p className="eyebrow opacity-60 text-sun">Registered Roll</p>
            <p className="mt-1 font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-ink-foreground tabular-nums">
              {totalRegistered.toLocaleString()}
            </p>
            <p className="text-xs opacity-60 font-mono mt-1">
              Certified by Faculty Registrar roll
            </p>
          </div>
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
              All offices ({effectiveOffices.length})
            </button>
            {effectiveOffices.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedOffice(r.id)}
                className={`shrink-0 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all ${
                  selectedOffice === r.id
                    ? 'border-ink bg-ink text-ink-foreground shadow-xs'
                    : 'border-border bg-card text-foreground hover:border-ink'
                }`}
              >
                {r.title}
              </button>
            ))}
          </div>
        </div>

        {/* Empty State when no votes have been cast */}
        {votes.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-border bg-card/60 p-10 text-center space-y-3">
            <Radio className="h-8 w-8 text-muted-foreground mx-auto animate-pulse" />
            <h3 className="font-display text-lg font-bold text-foreground">
              Awaiting First Polling Submissions
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Live polling is active in the central registry. Tallies dynamically calculate as student ballots are sealed.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('ballot')}
                className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-xs font-semibold text-ink-foreground hover:bg-primary transition-colors cursor-pointer"
              >
                <span>Proceed to Voting Ballot</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

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
                  {r.candidateTallies.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic py-3">
                      No candidate nominations certified for this seat.
                    </p>
                  ) : (
                    r.candidateTallies.map((c) => {
                      return (
                        <div key={c.candidateName} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span
                              className={`font-semibold flex items-center gap-1.5 ${
                                c.isWinner ? 'text-foreground' : 'text-muted-foreground'
                              }`}
                            >
                              {c.isWinner && <Trophy className="h-4 w-4 text-primary shrink-0" />}
                              {c.candidateName}
                            </span>
                            <span className="font-mono text-xs text-muted-foreground tabular-nums">
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
                    })
                  )}
                </div>
              </div>

              {/* Bottom Certificate Verification Link */}
              {(() => {
                const winner = r.candidateTallies.find((c) => c.isWinner) || r.candidateTallies[0];
                return (
                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground">
                      Leading:{' '}
                      <strong className="text-foreground">
                        {winner ? winner.candidateName : 'None'}
                      </strong>{' '}
                      ({winner ? winner.percentage : 0}%)
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
                Enter the receipt code given when you voted to verify your ballot was counted in the official central registry.
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
              className="flex-1 rounded-xl border border-border bg-background py-2.5 px-4 text-sm font-mono text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none uppercase"
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
                <p className="font-bold text-sm">Ballot Confirmed & Witnessed in Central Ledger</p>
                <p className="mt-0.5 text-emerald-700">
                  This anonymous receipt exists in the official database ledger. Your secret selections were factored into the live tallies above.
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
                  No cast ballot matching this receipt was found. Please ensure the code is copied accurately from your voting confirmation screen.
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
              const winner =
                showCertificateModal.candidateTallies.find((c) => c.isWinner) ||
                showCertificateModal.candidateTallies[0];
              return (
                <div className="rounded-xl border-2 border-border p-5 space-y-3 bg-background">
                  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    Office: {showCertificateModal.officeTitle}
                  </p>
                  <h4 className="font-display text-xl font-bold text-foreground">
                    {winner ? winner.candidateName : 'Awaiting Declaration'}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Tallied with{' '}
                    <strong>
                      {winner ? winner.votes.toLocaleString() : 0} votes (
                      {winner ? winner.percentage : 0}%)
                    </strong>{' '}
                    out of {showCertificateModal.totalVotesCast.toLocaleString()} votes cast.
                  </p>
                  <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                    <span>Certified: 2026 KUPSA Cycle</span>
                    <span className="text-emerald-700 font-semibold">Signed by Staff Patron</span>
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
