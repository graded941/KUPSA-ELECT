import React, { useState, useEffect, useMemo } from 'react';
import { ViewId } from '../types';
import { useVotingStore } from '../context/VotingStore';
import { SHARED_OFFICES, SHARED_CANDIDATES, SharedCandidate, SharedOffice } from '../data/candidateData';
import {
  CheckCircle2,
  Circle,
  Vote,
  ShieldCheck,
  Lock,
  ArrowRight,
  ArrowLeft,
  X,
  AlertCircle,
  Check,
  FileCheck2,
  Sparkles,
  Info,
  ExternalLink,
  Ban,
  Clock,
  LogOut,
  ChevronRight
} from 'lucide-react';

interface BallotViewProps {
  onNavigate: (view: ViewId) => void;
}

export function BallotView({ onNavigate }: BallotViewProps) {
  const { currentUser, logout, castVote, dbOffices, dbCandidates, isLoadingDb } = useVotingStore();
  const [submitError, setSubmitError] = useState<string | null>(null);

  // If no user is logged in, redirect to auth
  useEffect(() => {
    if (!currentUser) {
      onNavigate('auth');
    }
  }, [currentUser, onNavigate]);

  // Selections map: officeId -> candidateId | 'abstain'
  const [selections, setSelections] = useState<Record<string, string>>({});

  // Review modal state
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [confirmedDeclaration, setConfirmedDeclaration] = useState(false);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);

  // Success receipt state
  const [voteReceipt, setVoteReceipt] = useState<{ receiptCode: string; timestamp: string } | null>(null);

  // Inspect Manifesto modal
  const [manifestoModalCandidate, setManifestoModalCandidate] = useState<SharedCandidate | null>(null);

  // Derive dynamic offices & candidates from DB
  const effectiveOffices: SharedOffice[] = useMemo(() => {
    if (dbOffices.length > 0) {
      return dbOffices.map((o) => ({
        id: o.id,
        title: o.title,
        description: o.description,
        seats: 1,
        constitutionalArticle: 'Article 42',
        term: '2026/2027 Academic Year',
      }));
    }
    return SHARED_OFFICES;
  }, [dbOffices]);

  const effectiveCandidates: SharedCandidate[] = useMemo(() => {
    if (dbCandidates.length > 0) {
      return dbCandidates.map((c) => {
        const shared = SHARED_CANDIDATES.find(
          (sc) => sc.id === c.id || sc.name.toLowerCase() === c.name.toLowerCase()
        );
        const off = effectiveOffices.find((o) => o.id === c.office_id);
        const initials = c.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        return {
          id: c.id,
          name: c.name,
          initials: shared?.initials || initials || 'CA',
          officeId: c.office_id,
          officeTitle: off ? off.title : 'Executive Seat',
          yearOfStudy: c.year_of_study || shared?.yearOfStudy || 'Bachelor of Pharmacy',
          status: 'Cleared' as const,
          photoUrl: c.photo_url || shared?.photoUrl,
          photoPlaceholderBg: shared?.photoPlaceholderBg || '#0B1B3D',
          manifestoSummary: c.manifesto_summary || shared?.manifestoSummary || 'Serving pharmacy students with transparency.',
          manifestoPillars: shared?.manifestoPillars || [
            c.manifesto_summary || 'Promote student academic excellence',
            'Enhance clinical rotation welfare and supplies',
            'Maintain transparent association financial records',
          ],
          unopposed: shared?.unopposed ?? false,
        };
      });
    }
    return SHARED_CANDIDATES;
  }, [dbCandidates, effectiveOffices]);

  // Filter offices that have candidates
  const officesWithCandidates: (SharedOffice & { candidates: SharedCandidate[]; hasCandidates: boolean })[] = useMemo(() => {
    return effectiveOffices.map((office) => {
      const cands = effectiveCandidates
        .filter((c) => c.officeId === office.id)
        .sort((a, b) => a.name.localeCompare(b.name));
      return {
        ...office,
        candidates: cands,
        hasCandidates: cands.length > 0,
      };
    });
  }, [effectiveOffices, effectiveCandidates]);

  // Active offices requiring voter decision (excludes empty offices)
  const activeOffices = officesWithCandidates.filter((o) => o.hasCandidates);
  const totalActiveOffices = activeOffices.length;

  // Count how many offices have been selected or abstained
  const selectedCount = activeOffices.filter((o) => Boolean(selections[o.id])).length;
  const isComplete = selectedCount === totalActiveOffices;
  const progressPercent = totalActiveOffices > 0 ? (selectedCount / totalActiveOffices) * 100 : 100;

  // Toggle selection for an office (radio behaviour, deselect if clicking selected)
  const handleSelect = (officeId: string, choiceId: string) => {
    setSelections((prev) => {
      const current = prev[officeId];
      if (current === choiceId) {
        // Deselect
        const next = { ...prev };
        delete next[officeId];
        return next;
      }
      return {
        ...prev,
        [officeId]: choiceId,
      };
    });
  };

  // Scroll to office section from Review modal edit link
  const scrollToOffice = (officeId: string) => {
    setIsReviewOpen(false);
    setTimeout(() => {
      const el = document.getElementById(`ballot-office-${officeId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  // Submit Vote
  const handleConfirmSubmitVote = async () => {
    if (!confirmedDeclaration || isSubmittingVote) return;

    setIsSubmittingVote(true);
    setSubmitError(null);
    try {
      const res = await castVote(selections);
      setIsSubmittingVote(false);
      setIsReviewOpen(false);
      setVoteReceipt({
        receiptCode: res.receiptCode,
        timestamp: res.timestamp,
      });
    } catch (e: any) {
      console.error(e);
      setSubmitError(e.message || 'Failed to seal ballot.');
      setIsSubmittingVote(false);
    }
  };

  // If user is not yet loaded, show nothing or spinner
  if (!currentUser) {
    return null;
  }

  // SCREEN F: ALREADY VOTED STATE
  // If user has already voted, skip ballot and show friendly already voted screen
  if (currentUser.hasVoted && !voteReceipt) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        {/* Focused Top bar */}
        <header className="border-b border-border bg-card px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/kupsa-logo.png"
              alt="KUPSA"
              className="h-8 w-8 rounded-full object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <span className="font-display text-lg font-bold text-foreground">
              KUPSA Elections
            </span>
          </div>
          <button
            onClick={() => {
              logout();
              onNavigate('overview');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground py-1 px-3 rounded-lg border border-border hover:bg-secondary transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </header>

        {/* Already Voted Content */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-lg rounded-3xl border-2 border-border bg-card p-6 sm:p-10 shadow-card text-center space-y-6 animate-in fade-in duration-300">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 ring-8 ring-emerald-500/5">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div>
              <span className="eyebrow text-emerald-700">Participation Recorded</span>
              <h1 className="mt-2 font-display text-3xl font-bold text-foreground">
                You've already voted. Thank you.
              </h1>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Hello <strong>{currentUser.name}</strong>, your constitutional ballot has already been securely cast and sealed into the anonymous tally. Under Article 39(1), each registered student is entitled to exactly one vote.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-secondary/40 p-4 text-left space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Student Name:</span>
                <span className="text-foreground font-semibold">{currentUser.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Academic Cohort:</span>
                <span className="text-foreground font-semibold">{currentUser.yearOfStudy}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ballot Timestamp:</span>
                <span className="text-foreground font-semibold">{currentUser.votedAt || 'Today'}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border/80 pt-2">
                <span className="text-muted-foreground">Verification Receipt:</span>
                <span className="text-primary font-bold">{currentUser.receiptCode || 'KUPSA-2026-REC-SEALED'}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('results')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-ink bg-card px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
              >
                <span>View Election Tallies</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => {
                  logout();
                  onNavigate('overview');
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-xs font-semibold text-ink-foreground shadow-xs hover:bg-primary transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // SCREEN E: VOTE SUCCESS / RECEIPT SCREEN
  if (voteReceipt) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        {/* Focused Top bar */}
        <header className="border-b border-border bg-card px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/kupsa-logo.png"
              alt="KUPSA"
              className="h-8 w-8 rounded-full object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <span className="font-display text-lg font-bold text-foreground">
              KUPSA Elections
            </span>
          </div>
          <button
            onClick={() => {
              logout();
              onNavigate('overview');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground py-1 px-3 rounded-lg border border-border hover:bg-secondary transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-lg rounded-3xl border-2 border-border bg-card p-6 sm:p-10 shadow-pop text-center space-y-6 animate-in zoom-in-95 duration-400">
            {/* Animated Check */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 ring-8 ring-emerald-500/5 animate-bounce">
              <Check className="h-10 w-10 stroke-[3]" />
            </div>

            <div>
              <span className="eyebrow text-emerald-700">Official Ballot Sealed</span>
              <h1 className="mt-2 font-display text-3xl font-bold text-foreground">
                Your vote has been recorded
              </h1>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Thank you for exercising your constitutional right. Your ballot has been cryptographically decoupled from your student profile and deposited into the official Electoral Commission tally box.
              </p>
            </div>

            {/* Receipt Box */}
            <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-primary/15 pb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-primary font-bold">
                  Anonymous Receipt Code
                </span>
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-700 font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5" /> Certified
                </span>
              </div>

              <div className="font-mono text-2xl font-bold tracking-widest text-foreground text-center py-1">
                {voteReceipt.receiptCode}
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1 border-t border-primary/15">
                <span>Timestamp:</span>
                <span className="text-foreground">{voteReceipt.timestamp}</span>
              </div>
            </div>

            {/* Privacy Guarantee Note */}
            <div className="rounded-xl bg-secondary/50 p-3 text-xs text-muted-foreground flex items-center gap-2 text-left">
              <Lock className="h-4 w-4 text-primary shrink-0" />
              <span>
                <strong>Zero voter-to-ballot linkage:</strong> By constitutional design under Article 45, nobody—including Commission Officers—can inspect who you voted for.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('results')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-ink bg-card px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
              >
                <span>View Results</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  logout();
                  onNavigate('overview');
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-xs font-semibold text-ink-foreground shadow-xs hover:bg-primary transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // SCREEN C: ELECTION PORTAL / BALLOT
  return (
    <div className="min-h-screen bg-background flex flex-col pb-28">
      {/* Top Bar (Dedicated, No General Site Nav to keep student focused) */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/kupsa-logo.png"
              alt="KUPSA"
              className="h-9 w-9 rounded-full object-contain bg-white/70 p-0.5 border border-border"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-primary font-bold block">
                KUPSA General Elections 2026
              </span>
              <h1 className="font-display text-base font-bold text-foreground">
                Official Secret Ballot
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Student Identity Badge */}
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-foreground">{currentUser.name}</span>
              <span className="text-[11px] font-mono text-muted-foreground">{currentUser.yearOfStudy}</span>
            </div>

            <button
              onClick={() => {
                logout();
                onNavigate('auth');
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
              title="End session"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Dynamic Progress Indicator */}
        <div className="mx-auto max-w-5xl mt-3 pt-2.5 border-t border-border/60">
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-muted-foreground">
              Offices Completed: <strong className="text-foreground">{selectedCount} of {totalActiveOffices}</strong>
            </span>
            <span className="text-primary font-bold">{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Ballot Body */}
      <main className="mx-auto max-w-5xl w-full px-4 sm:px-6 py-8 space-y-12">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5 flex items-start gap-3.5 text-xs sm:text-sm text-foreground/80 leading-relaxed">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <strong className="text-foreground">Voting Guidelines (Chapter 6):</strong> Choose exactly one candidate for each executive office below, or choose "Abstain". Tapping an already selected candidate card will deselect it. When you have made choices for all contested offices, tap "Review my vote" at the bottom.
          </div>
        </div>

        {/* Office Sections */}
        {officesWithCandidates.map((office, officeIndex) => {
          const currentChoice = selections[office.id];
          const isOfficeDecided = Boolean(currentChoice);

          return (
            <section
              key={office.id}
              id={`ballot-office-${office.id}`}
              className="scroll-mt-28 space-y-4"
            >
              {/* Office Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b-2 border-border pb-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink text-ink-foreground font-mono text-xs font-bold">
                    0{officeIndex + 1}
                  </span>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">
                      {office.title}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {office.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {office.hasCandidates && (
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                        isOfficeDecided
                          ? 'bg-emerald-500/10 text-emerald-700 font-semibold'
                          : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {isOfficeDecided ? '✓ Selected' : 'Pending Choice'}
                    </span>
                  )}
                </div>
              </div>

              {/* Candidates Grid or Calm Empty State */}
              {office.hasCandidates ? (
                <div className="space-y-4">
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {office.candidates.map((cand) => {
                      const isSelected = currentChoice === cand.id;
                      const isDimmed = isOfficeDecided && !isSelected;

                      return (
                        <div
                          key={cand.id}
                          onClick={() => handleSelect(office.id, cand.id)}
                          role="radio"
                          aria-checked={isSelected}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                              e.preventDefault();
                              handleSelect(office.id, cand.id);
                            }
                          }}
                          className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 min-h-[380px] sm:min-h-[420px] text-left cursor-pointer transition-all duration-300 select-none ${
                            isSelected
                              ? 'border-primary ring-4 ring-primary/30 shadow-pop scale-[1.01]'
                              : isDimmed
                              ? 'border-border opacity-65 hover:opacity-100 hover:border-ink/60'
                              : 'border-border shadow-card hover:border-ink hover:shadow-pop hover:-translate-y-1'
                          }`}
                        >
                          {/* Full Background Candidate Image / Portrait Pluck */}
                          <div className="absolute inset-0 z-0 bg-[#286746]">
                            {/* Watermark initials fallback */}
                            <div
                              className="absolute inset-0 z-0 flex items-center justify-center font-display text-8xl font-bold text-white/20 select-none pointer-events-none"
                              style={{ backgroundColor: cand.photoPlaceholderBg || '#286746' }}
                            >
                              {cand.initials}
                            </div>

                            {cand.photoUrl ? (
                              <img
                                src={cand.photoUrl}
                                alt={cand.name}
                                className="absolute inset-0 z-10 h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                                loading="lazy"
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : null}

                            {/* Multi-stage Scrim Overlay for crisp contrast */}
                            <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/95 via-black/40 to-black/20 pointer-events-none" />
                          </div>

                          {/* Top Badges Bar: Year of Study + Radio Selection Check Circle */}
                          <div className="relative z-10 flex items-center justify-between p-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="rounded-full bg-black/50 backdrop-blur-md px-3 py-1 font-mono text-[11px] font-semibold text-white/90 border border-white/15 shadow-xs">
                                {cand.yearOfStudy.replace('Bachelor of Pharmacy', 'B.Pharm')}
                              </span>
                              {cand.unopposed && (
                                <span className="rounded-full bg-amber-500/90 backdrop-blur-md px-2.5 py-1 font-mono text-[10px] font-bold text-white border border-amber-400/30 shadow-xs">
                                  Unopposed
                                </span>
                              )}
                            </div>

                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 shadow-xs ${
                                isSelected
                                  ? 'bg-primary text-primary-foreground ring-2 ring-white scale-110'
                                  : 'bg-black/50 backdrop-blur-md border border-white/30 text-transparent group-hover:border-white group-hover:text-white/60'
                              }`}
                            >
                              <Check className="h-4 w-4 stroke-[3]" />
                            </div>
                          </div>

                          {/* Bottom Pluck Card Hover Transition: Name of Candidate & Details */}
                          <div className="relative z-10 bg-gradient-to-t from-black/90 via-black/80 to-transparent p-5 pt-8 transition-all duration-300 ease-out">
                            {/* Candidate Name Banner */}
                            <div className="flex items-end justify-between gap-2">
                              <div>
                                <h3 className="font-display text-2xl font-bold text-white tracking-tight drop-shadow-md">
                                  {cand.name}
                                </h3>
                                {cand.unopposed ? (
                                  <p className="text-xs text-amber-300 font-mono drop-shadow-xs mt-0.5">
                                    Declared Elected Unopposed
                                  </p>
                                ) : (
                                  <p className="text-xs text-white/75 font-mono drop-shadow-xs mt-0.5">
                                    Candidate ID: {cand.id.toUpperCase()}
                                  </p>
                                )}
                              </div>
                              {isSelected && (
                                <span className="shrink-0 rounded-full bg-primary px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-xs">
                                  Selected
                                </span>
                              )}
                            </div>

                            {/* Smooth Hover Transition Drawer */}
                            <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out">
                              <div className="overflow-hidden">
                                <div className="pt-3 border-t border-white/20 mt-3 space-y-2.5">
                                  <p className="text-xs text-white/90 line-clamp-2 leading-relaxed">
                                    "{cand.manifestoSummary}"
                                  </p>
                                  <div className="flex items-center justify-between pt-1">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setManifestoModalCandidate(cand);
                                      }}
                                      className="text-xs font-semibold text-sun hover:underline inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      <span>View manifesto</span>
                                      <ExternalLink className="h-3 w-3" />
                                    </button>
                                    <span className="text-[11px] font-mono text-white/70">
                                      {isSelected ? 'Tap to deselect' : 'Tap to select'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Optional Abstain Option for Every Office */}
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => handleSelect(office.id, 'abstain')}
                      className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-mono transition-all cursor-pointer ${
                        currentChoice === 'abstain'
                          ? 'border-primary bg-primary/10 text-primary font-bold ring-2 ring-primary/20'
                          : 'border-dashed border-border bg-card/60 text-muted-foreground hover:border-ink hover:text-foreground'
                      }`}
                    >
                      <Ban className="h-3.5 w-3.5" />
                      <span>
                        {currentChoice === 'abstain'
                          ? '✓ Abstained from this office (Tap to remove)'
                          : 'Abstain from voting for this office'}
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Calm Empty State for Offices with No Candidates */
                <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-6 text-center space-y-2">
                  <p className="font-display text-base font-semibold text-foreground">
                    No candidates for this office
                  </p>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Under Article 48 of the Constitution, nominations for {office.title} yielded no cleared candidates. This vacancy will be contested via a Special By-Election scheduled by the Staff Patron. This office is automatically skipped in your progress.
                  </p>
                </div>
              )}
            </section>
          );
        })}
      </main>

      {/* Sticky Bottom Bar */}
      <aside
        aria-label="Ballot submission bar"
        className="fixed bottom-0 inset-x-0 z-40 border-t-2 border-ink bg-card/95 backdrop-blur-md px-4 sm:px-6 py-3.5 shadow-pop"
      >
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl text-ink font-mono text-xs font-bold ${
                isComplete ? 'bg-emerald-500 text-white' : 'bg-primary/20 text-primary'
              }`}
            >
              <Vote className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-foreground">
                {selectedCount} of {totalActiveOffices} offices selected
              </p>
              <p className="text-[11px] text-muted-foreground">
                {isComplete
                  ? 'All contested offices decided. Ready to review your ballot.'
                  : 'Please make a selection or choose abstain for each office above.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={!isComplete}
            onClick={() => setIsReviewOpen(true)}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all shadow-xs cursor-pointer ${
              isComplete
                ? 'bg-ink text-ink-foreground shadow-pop hover:bg-primary hover:text-white'
                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
            }`}
          >
            <span>Review my vote</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* SCREEN D: REVIEW AND CONFIRM MODAL */}
      {isReviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Review your vote choices"
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border-2 border-ink bg-card shadow-pop animate-in zoom-in-95 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border p-5 bg-background/50">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h3 className="font-display text-xl font-bold text-foreground">
                  Review & Confirm Your Vote
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3.5 text-xs text-destructive flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Important Notice:</strong> Your vote is final and cannot be changed once submitted. Please verify each of your choices carefully before confirming.
                </span>
              </div>

              {/* Chosen Plaques */}
              <div className="space-y-3">
                <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Summary of Selected Nominees
                </h4>

                <div className="divide-y divide-border rounded-2xl border-2 border-border bg-background/50 overflow-hidden">
                  {activeOffices.map((office) => {
                    const choiceId = selections[office.id];
                    const chosenCandidate = effectiveCandidates.find((c) => c.id === choiceId);
                    const isAbstain = choiceId === 'abstain';

                    return (
                      <div
                        key={office.id}
                        className="p-4 flex items-center justify-between gap-4 hover:bg-card/70 transition-colors"
                      >
                        <div className="min-w-0">
                          <span className="text-[11px] font-mono text-primary font-bold uppercase block">
                            {office.title}
                          </span>
                          {isAbstain ? (
                            <span className="font-mono text-sm text-muted-foreground italic flex items-center gap-1.5 mt-0.5">
                              <Ban className="h-3.5 w-3.5" /> Abstained from this office
                            </span>
                          ) : chosenCandidate ? (
                            <div className="flex items-center gap-2.5 mt-0.5">
                              <span className="font-display text-base font-bold text-foreground">
                                {chosenCandidate.name}
                              </span>
                              <span className="text-xs font-mono text-muted-foreground">
                                ({chosenCandidate.yearOfStudy.replace('Bachelor of Pharmacy', 'B.Pharm')})
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-destructive font-medium">No selection</span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => scrollToOffice(office.id)}
                          className="text-xs font-mono font-semibold text-primary hover:underline px-2.5 py-1 rounded bg-secondary/80 hover:bg-secondary shrink-0 cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Error Banner if rejected by DB */}
              {submitError && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-xs text-destructive flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Ballot Submission Error</p>
                    <p className="mt-0.5 text-foreground/90">{submitError}</p>
                  </div>
                </div>
              )}

              {/* Declaration Checkbox */}
              <div className="rounded-xl border border-border bg-secondary/30 p-4">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={confirmedDeclaration}
                    onChange={(e) => setConfirmedDeclaration(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
                  />
                  <span className="text-xs font-medium text-foreground leading-relaxed">
                    I confirm these are my choices, and I understand that once submitted, my vote is permanent and my account will be sealed from voting again.
                  </span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-border p-5 bg-background/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsReviewOpen(false)}
                disabled={isSubmittingVote}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
              >
                Go back & edit
              </button>

              <button
                type="button"
                disabled={!confirmedDeclaration || isSubmittingVote}
                onClick={handleConfirmSubmitVote}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-semibold transition-all cursor-pointer ${
                  confirmedDeclaration && !isSubmittingVote
                    ? 'bg-ink text-ink-foreground shadow-pop hover:bg-primary'
                    : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
                }`}
              >
                {isSubmittingVote ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Sealing Ballot (1.5s)...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm and submit vote</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manifesto Inspection Modal */}
      {manifestoModalCandidate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={() => setManifestoModalCandidate(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl border-2 border-ink bg-card p-6 shadow-pop animate-in zoom-in-95 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="eyebrow text-primary">Candidate Dossier</span>
                <h3 className="font-display text-2xl font-bold text-foreground mt-1">
                  {manifestoModalCandidate.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {manifestoModalCandidate.officeTitle} · {manifestoModalCandidate.yearOfStudy}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setManifestoModalCandidate(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-foreground/80 leading-relaxed border-t border-border pt-4">
              <div>
                <h4 className="font-semibold text-foreground text-sm mb-1">Executive Platform Summary</h4>
                <p className="bg-secondary/50 p-3 rounded-xl">{manifestoModalCandidate.manifestoSummary}</p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground text-sm mb-2">Priority Pillars</h4>
                <ul className="space-y-2">
                  {manifestoModalCandidate.manifestoPillars.map((p, i) => (
                    <li key={p} className="flex items-start gap-2 bg-background p-2.5 rounded-lg border border-border">
                      <span className="font-mono text-primary font-bold">0{i + 1}</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  handleSelect(manifestoModalCandidate.officeId, manifestoModalCandidate.id);
                  setManifestoModalCandidate(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-xs font-semibold text-ink-foreground shadow-xs hover:bg-primary transition-colors cursor-pointer"
              >
                <span>Select {manifestoModalCandidate.name}</span>
                <Check className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
