import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ViewId, Candidate, CandidateApplication, ElectionPhase } from '../types';
import { CANDIDATES, OFFICES, SAMPLE_CANDIDATE_APPLICATIONS } from '../data/election';
import { useVotingStore } from '../context/VotingStore';
import { PageIntro } from './site-shell';
import {
  CheckCircle2,
  X,
  FileText,
  AlertCircle,
  PlusCircle,
  Award,
  Users,
  Coins,
  Megaphone,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Share2,
  Bookmark,
  BookmarkCheck,
  Scale,
  ShieldCheck,
  Check,
  Shuffle,
  Clock,
  Sparkles,
  HelpCircle,
  Briefcase,
  Layers,
  Vote,
  ExternalLink
} from 'lucide-react';
import { HoverTransition } from './ui/hover-transition';

interface CandidatesViewProps {
  onNavigate: (view: ViewId) => void;
  currentPhase?: ElectionPhase;
}

// Icon mapping per office ID
const OFFICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  president: Award,
  'vice-president': Users,
  'sec-general': FileText,
  'dep-sec-general': FileText,
  'org-sec': Megaphone,
  treasurer: Coins,
  'media-officer': Sparkles,
};

// One-line "what this role does"
const OFFICE_ONE_LINERS: Record<string, string> = {
  president: 'Chief Executive Officer; presides over Executive meetings, represents pharmacy students in Faculty Board and University Senate.',
  'vice-president': 'Deputizes the President; coordinates student welfare, clinical rotations mentorship, and academic appeals.',
  'sec-general': 'Official custodian of association records, minutes, executive correspondence, and constitutional gazette notices.',
  'dep-sec-general': 'Assists the Secretary General in institutional archives, committee minutes, and official correspondence.',
  'org-sec': 'Directs Pharmacy Week outreach, community health camps, industrial pharmaceutical manufacturer tours, and sports.',
  treasurer: 'Custodian of association funds, annual budgets, Pharmacy Gala books, and certified audited accounts.',
  'media-officer': 'Directs association public affairs, press statements, digital student bulletins, and the Pharmakon scientific journal.',
};

const SHORTLIST_STORAGE_KEY = 'kupsa_candidate_shortlist_v1';

function CandidateDefaultCard({
  cand,
  office,
}: {
  cand: Candidate;
  office: typeof OFFICES[number] & { isContested?: boolean; isUnopposed?: boolean };
}) {
  return (
    <article className="relative flex h-full min-h-[400px] flex-col justify-between overflow-hidden bg-[#ece9e1] p-6 text-[#151515] transition-colors">
      {/* Top Row: Office Tag and Year */}
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-black/55 font-mono">
            {office.title}
          </span>
          <span className="mt-0.5 text-[11px] font-mono text-black/50">
            {cand.yearOfStudy.replace('Bachelor of Pharmacy', 'B.Pharm')}
          </span>
        </div>
      </div>

      {/* Giant Watermark Initials in the Background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 grid place-items-center text-[7.5rem] sm:text-[9rem] font-semibold tracking-[-0.08em] text-black/[0.06] select-none pointer-events-none"
      >
        {cand.initials}
      </div>

      {/* Bottom Identity Block */}
      <div className="relative z-10 mt-8">
        <div className="flex items-center gap-3.5 mb-3">
          <div className="relative h-14 w-14 overflow-hidden rounded-full ring-2 ring-black/15 ring-offset-2 ring-offset-[#ece9e1] shrink-0 shadow-xs">
            <span
              className="absolute inset-0 z-0 flex items-center justify-center font-display text-lg font-bold text-white shadow-xs"
              style={{ backgroundColor: cand.photoPlaceholderBg || '#286746' }}
            >
              {cand.initials}
            </span>
            {cand.photoUrl ? (
              <img
                src={cand.photoUrl}
                alt={cand.name}
                className="absolute inset-0 z-10 h-full w-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            ) : null}
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-medium tracking-[-0.05em] text-[#151515] leading-tight">
              {cand.name}
            </h3>
            <p className="text-xs text-black/55 font-mono">
              Candidate ID: {cand.id.toUpperCase()}
            </p>
          </div>
        </div>

        <p className="mt-2 text-sm text-black/65 line-clamp-2 leading-relaxed">
          {cand.manifestoSummary}
        </p>
      </div>
    </article>
  );
}

function CandidateHoverCard({
  cand,
  office,
}: {
  cand: Candidate;
  office: typeof OFFICES[number] & { isContested?: boolean; isUnopposed?: boolean };
}) {
  return (
    <article className="flex h-full min-h-[400px] flex-col justify-between bg-[#dfff5f] p-6 text-[#111] transition-colors">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-black/60 font-mono">
            {office.title} Platform
          </span>
        </div>

        <p className="max-w-[24ch] text-xl sm:text-2xl font-medium leading-tight tracking-[-0.035em] text-[#111]">
          "{cand.manifestoSummary}"
        </p>

        {cand.manifestoPillars?.[0] && (
          <div className="rounded-2xl bg-black/[0.08] p-3.5 text-xs text-black/85 leading-relaxed">
            <span className="font-mono text-[10px] uppercase font-bold text-black/60 block mb-0.5">
              Priority Promise 01
            </span>
            <p className="font-medium text-black">{cand.manifestoPillars[0]}</p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-black/15">
        <p className="font-bold text-lg text-[#111]">{cand.name}</p>
        <p className="text-xs uppercase tracking-[0.12em] text-black/60 font-mono mt-0.5">
          {cand.yearOfStudy.replace('Bachelor of Pharmacy', 'B.Pharm')}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#111] px-4 py-2 text-xs font-semibold text-[#dfff5f] shadow-xs">
            <span>View platform dossier</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
}

export function CandidatesView({ onNavigate, currentPhase = 'pre-election' }: CandidatesViewProps) {
  const { dbCandidates, candidateClearances } = useVotingStore();

  const effectiveCandidates: Candidate[] = useMemo(() => {
    return CANDIDATES.map((baseCand) => {
      const dbMatch = dbCandidates?.find((c) => c.id === baseCand.id);
      const clearance = candidateClearances[baseCand.id];

      const rawStatus = clearance?.status || dbMatch?.clearance_status || 'Cleared & Certified';
      const vettingStatus: Candidate['vettingStatus'] =
        rawStatus === 'Cleared & Certified' ? 'Vetted & Approved' : (rawStatus as Candidate['vettingStatus']);

      return {
        ...baseCand,
        name: clearance?.name || dbMatch?.name || baseCand.name,
        photoUrl: clearance?.photoUrl || dbMatch?.photo_url || baseCand.photoUrl,
        manifestoSummary: clearance?.manifestoSummary || dbMatch?.manifesto_summary || baseCand.manifestoSummary,
        manifestoPillars: clearance?.manifestoPillars || baseCand.manifestoPillars,
        vettingStatus,
      };
    });
  }, [dbCandidates, candidateClearances]);

  // Navigation & filtering state
  const [selectedOffice, setSelectedOffice] = useState<string>('all');
  const [onlyShortlisted, setOnlyShortlisted] = useState(false);
  const [sortOrder, setSortOrder] = useState<'alpha' | 'random'>('alpha');

  // Interactive Panel & Compare state
  const [pickedCandidate, setPickedCandidate] = useState<Candidate | null>(null);
  const [activeTab, setActiveTab] = useState<'manifesto' | 'experience' | 'priorities' | 'qa'>('manifesto');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Private Shortlist state (stored strictly on-device in localStorage)
  const [shortlist, setShortlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(SHORTLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sticky "Ready to vote?" bar visibility on scroll
  const [showStickyVoteBar, setShowStickyVoteBar] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Nomination filing modal
  const [showNominationModal, setShowNominationModal] = useState(false);
  const [applications, setApplications] = useState<CandidateApplication[]>(SAMPLE_CANDIDATE_APPLICATIONS);
  const [nominationForm, setNominationForm] = useState({
    fullName: '',
    regNo: '',
    email: '',
    officeId: 'president',
    yearOfStudy: 'Bachelor of Pharmacy (Year 4)',
    gpa: '3.42',
    manifestoSummary: '',
    pillar1: '',
    pillar2: '',
    pillar3: '',
  });
  const [nominationSubmitted, setNominationSubmitted] = useState(false);

  // Sync shortlist with localStorage
  const toggleShortlist = (candId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShortlist((prev) => {
      const next = prev.includes(candId) ? prev.filter((id) => id !== candId) : [...prev, candId];
      try {
        localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save shortlist', err);
      }
      return next;
    });
  };

  // Toggle compare selection
  const toggleCompare = (candId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCompareIds((prev) => {
      if (prev.includes(candId)) {
        return prev.filter((id) => id !== candId);
      }
      if (prev.length >= 3) {
        return [prev[1], prev[2], candId];
      }
      return [...prev, candId];
    });
  };

  // Check URL query/hash on mount for direct candidate link (?candidate=cand-01 or #candidates?id=cand-01)
  useEffect(() => {
    const handleUrlSync = () => {
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);
      let candId = searchParams.get('candidate');

      if (!candId && hash.includes('candidate=')) {
        const parts = hash.split('candidate=');
        if (parts[1]) candId = parts[1].split('&')[0];
      }

      if (candId) {
        const found = effectiveCandidates.find((c) => c.id === candId || c.name.toLowerCase().replace(/\s+/g, '-') === candId);
        if (found) {
          setPickedCandidate(found);
        }
      }
    };

    handleUrlSync();
  }, [effectiveCandidates]);

  // Update URL when candidate panel opens/closes
  useEffect(() => {
    if (pickedCandidate) {
      const newUrl = `${window.location.pathname}#candidates?candidate=${pickedCandidate.id}`;
      window.history.replaceState({ candidateId: pickedCandidate.id }, '', newUrl);
    } else {
      const newUrl = `${window.location.pathname}#candidates`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [pickedCandidate]);

  // Handle keyboard navigation for candidate detail modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!pickedCandidate) return;

      if (e.key === 'Escape') {
        setPickedCandidate(null);
      } else if (e.key === 'ArrowRight') {
        // Next candidate in filtered list
        const currentOfficeCands = effectiveCandidates.filter((c) => c.officeId === pickedCandidate.officeId);
        const idx = currentOfficeCands.findIndex((c) => c.id === pickedCandidate.id);
        if (idx !== -1 && idx < currentOfficeCands.length - 1) {
          setPickedCandidate(currentOfficeCands[idx + 1]);
        } else if (idx === currentOfficeCands.length - 1) {
          setPickedCandidate(currentOfficeCands[0]);
        }
      } else if (e.key === 'ArrowLeft') {
        // Previous candidate in filtered list
        const currentOfficeCands = effectiveCandidates.filter((c) => c.officeId === pickedCandidate.officeId);
        const idx = currentOfficeCands.findIndex((c) => c.id === pickedCandidate.id);
        if (idx > 0) {
          setPickedCandidate(currentOfficeCands[idx - 1]);
        } else if (idx === 0) {
          setPickedCandidate(currentOfficeCands[currentOfficeCands.length - 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pickedCandidate, effectiveCandidates]);

  // Scroll listener for sticky vote bar and scroll-spy
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 380) {
        setShowStickyVoteBar(true);
      } else {
        setShowStickyVoteBar(false);
      }

      // Scroll-spy: identify currently visible office section
      if (selectedOffice === 'all') {
        for (const office of OFFICES) {
          const el = document.getElementById(`office-${office.id}`);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= 200 && rect.bottom >= 150) {
              setActiveSpyOffice(office.id);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedOffice]);

  const [activeSpyOffice, setActiveSpyOffice] = useState<string>('president');

  // Filter and sort candidates
  const processedOffices = useMemo(() => {
    return OFFICES.filter((o) => selectedOffice === 'all' || o.id === selectedOffice).map((office) => {
      let list = effectiveCandidates.filter((c) => c.officeId === office.id);

      // Shortlist filtering
      if (onlyShortlisted) {
        list = list.filter((c) => shortlist.includes(c.id));
      }

      // Sort fairness rules: alphabetical (standard) vs randomized
      if (sortOrder === 'alpha') {
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
      } else {
        // Deterministic pseudo-random shuffle per office
        list = [...list].reverse();
      }

      return {
        ...office,
        candidates: list,
        isContested: list.length > 1,
        isUnopposed: list.length === 1,
      };
    });
  }, [selectedOffice, onlyShortlisted, sortOrder, shortlist, effectiveCandidates]);

  const handleCopyShare = (cand: Candidate) => {
    const url = `${window.location.origin}${window.location.pathname}#candidates?candidate=${cand.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 2200);
    });
  };

  const handleNominationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newApp: CandidateApplication = {
      id: `app-${Date.now()}`,
      fullName: nominationForm.fullName,
      regNo: nominationForm.regNo,
      email: nominationForm.email,
      officeId: nominationForm.officeId,
      yearOfStudy: nominationForm.yearOfStudy,
      gpa: nominationForm.gpa,
      manifestoSummary: nominationForm.manifestoSummary,
      manifestoPillars: [nominationForm.pillar1, nominationForm.pillar2, nominationForm.pillar3].filter(Boolean),
      endorsementsCount: 15,
      status: 'Submitted for Vetting',
      submittedAt: 'Just now (Simulated)',
      commissionNotes: 'Provisional submission recorded. Pending Dean certificate verification.',
    };
    setApplications([newApp, ...applications]);
    setNominationSubmitted(true);
    setTimeout(() => {
      setNominationSubmitted(false);
      setShowNominationModal(false);
      setNominationForm({
        fullName: '',
        regNo: '',
        email: '',
        officeId: 'president',
        yearOfStudy: 'Bachelor of Pharmacy (Year 4)',
        gpa: '3.42',
        manifestoSummary: '',
        pillar1: '',
        pillar2: '',
        pillar3: '',
      });
    }, 1800);
  };

  const scrollToOffice = (officeId: string) => {
    setSelectedOffice(officeId);
    if (officeId !== 'all') {
      const el = document.getElementById(`office-${officeId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      <PageIntro eyebrow="Article 41 Candidates" title="Meet the cleared nominees asking for your vote">
        Every candidate below has met constitutional threshold requirements under Article 42, passed academic good
        standing checks, and signed the Commission Code of Conduct. Tap any candidate to inspect their detailed
        platform, experience, and Q&A.
      </PageIntro>

      {/* Main Container */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10">
        {/* Sticky Filter Bar */}
        <div className="sticky top-16 z-30 -mx-4 sm:mx-0 px-4 sm:px-0 py-3 bg-background/95 backdrop-blur-md border-b border-border transition-all">
          <div className="flex flex-col gap-3">
            {/* Top Row: Shortlist Counter, Fairness Sort & Nomination */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {/* Shortlist Filter Button */}
                <button
                  onClick={() => setOnlyShortlisted(!onlyShortlisted)}
                  className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3.5 py-1.5 text-xs font-semibold shrink-0 transition-all ${
                    onlyShortlisted
                      ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                      : 'border-border bg-card text-foreground hover:border-ink'
                  }`}
                  title="Private on-device shortlist"
                >
                  {onlyShortlisted ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                  <span>My Shortlist ({shortlist.length})</span>
                </button>

                {/* Ballot Sort Order Toggle */}
                <button
                  onClick={() => setSortOrder(sortOrder === 'alpha' ? 'random' : 'alpha')}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/70 px-3 py-1.5 text-xs font-mono text-muted-foreground hover:text-foreground shrink-0 transition-colors"
                  title="Equal prominence under Article 41(3)"
                >
                  <Shuffle className="h-3.5 w-3.5 text-primary" />
                  <span>{sortOrder === 'alpha' ? 'Sort: A–Z (Statutory)' : 'Sort: Ballot Draw'}</span>
                </button>
              </div>
            </div>

            {/* Bottom Row: Office Sliding Navigation Tabs */}
            <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1 scroll-smooth snap-x snap-mandatory">
              <button
                onClick={() => scrollToOffice('all')}
                className={`snap-start shrink-0 rounded-full border-2 px-4 py-1.5 text-xs font-semibold transition-all ${
                  selectedOffice === 'all'
                    ? 'border-ink bg-ink text-ink-foreground shadow-xs'
                    : 'border-border bg-card text-foreground hover:border-ink'
                }`}
              >
                All Offices ({effectiveCandidates.length})
              </button>

              {OFFICES.map((office) => {
                const count = effectiveCandidates.filter((c) => c.officeId === office.id).length;
                const IconComponent = OFFICE_ICONS[office.id] || Award;
                const isActive = selectedOffice === office.id || (selectedOffice === 'all' && activeSpyOffice === office.id);

                return (
                  <button
                    key={office.id}
                    onClick={() => scrollToOffice(office.id)}
                    className={`snap-start inline-flex items-center gap-1.5 shrink-0 rounded-full border-2 px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      isActive
                        ? 'border-ink bg-ink text-ink-foreground shadow-xs'
                        : 'border-border bg-card text-foreground hover:border-ink'
                    }`}
                  >
                    <IconComponent className="h-3.5 w-3.5" />
                    <span>{office.title}</span>
                    <span
                      className={`ml-0.5 rounded-full px-1.5 py-0.2 font-mono text-[10px] ${
                        isActive ? 'bg-accent text-ink font-bold' : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Shortlist Notice Banner (when viewing shortlisted candidates) */}
        {onlyShortlisted && (
          <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-primary/40 bg-accent/30 p-4 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <BookmarkCheck className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-semibold text-foreground">
                  Showing your {shortlist.length} privately saved candidate{shortlist.length === 1 ? '' : 's'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Stored securely only in your browser. This list is private and never counted as a vote.
                </p>
              </div>
            </div>
            <button
              onClick={() => setOnlyShortlisted(false)}
              className="text-xs font-semibold text-primary underline hover:text-ink shrink-0"
            >
              Show All Candidates
            </button>
          </div>
        )}

        {/* Candidate Sections Grouped by Office */}
        <div className="mt-8 space-y-16">
          {processedOffices.map((office) => {
            const IconComponent = OFFICE_ICONS[office.id] || Award;

            return (
              <section key={office.id} id={`office-${office.id}`} className="scroll-mt-36">
                {/* Office Header Card with Domain-native styling */}
                <div className="rounded-3xl border-2 border-border bg-card/60 p-5 sm:p-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xs shrink-0">
                        <IconComponent className="h-5 w-5" />
                      </span>
                      <div>
                        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                          {office.title}
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                          {OFFICE_ONE_LINERS[office.id] || office.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Candidates Grid */}
                  {office.candidates.length > 0 ? (
                    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {office.candidates.map((cand) => {
                        const isShortlisted = shortlist.includes(cand.id);
                        const isComparing = compareIds.includes(cand.id);

                        return (
                          <div key={cand.id} className="flex flex-col">
                            {/* Animated Wipe Pluck Card */}
                            <HoverTransition
                              effect="wipe"
                              direction="right"
                              duration={0.72}
                              defaultComponent={<CandidateDefaultCard cand={cand} office={office} />}
                              hoverComponent={<CandidateHoverCard cand={cand} office={office} />}
                              className="w-full min-h-[410px] rounded-3xl shadow-card"
                              onClick={() => {
                                setPickedCandidate(cand);
                                setActiveTab('manifesto');
                              }}
                            />

                            {/* Card Utility Action Bar: Compare & Shortlist in their logical place */}
                            <div className="mt-3 px-1 flex items-center justify-between gap-2">
                              {/* Compare Toggle */}
                              <button
                                type="button"
                                onClick={() => toggleCompare(cand.id)}
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors ${
                                  isComparing
                                    ? 'border-ink bg-ink text-ink-foreground font-bold shadow-xs'
                                    : 'border-border bg-card text-muted-foreground hover:border-ink hover:text-foreground'
                                }`}
                                title="Add to side-by-side comparison"
                              >
                                <Scale className="h-3.5 w-3.5" />
                                <span>{isComparing ? 'Comparing' : '+ Compare'}</span>
                              </button>

                              {/* Shortlist Bookmark Toggle */}
                              <button
                                type="button"
                                onClick={() => toggleShortlist(cand.id)}
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
                                  isShortlisted
                                    ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-xs'
                                    : 'border-border bg-card text-muted-foreground hover:border-ink hover:text-foreground'
                                }`}
                                title={isShortlisted ? 'Saved in private shortlist' : 'Save to private shortlist'}
                              >
                                {isShortlisted ? (
                                  <BookmarkCheck className="h-3.5 w-3.5" />
                                ) : (
                                  <Bookmark className="h-3.5 w-3.5" />
                                )}
                                <span>{isShortlisted ? 'Saved' : 'Shortlist'}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Friendlier Empty State for Offices with No Nominees */
                    <div className="mt-6 rounded-2xl border-2 border-dashed border-border bg-card/40 p-8 text-center space-y-3">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                        <GraduationCap className="h-6 w-6" />
                      </div>
                      <h4 className="font-display text-lg font-bold text-foreground">
                        Nominations Closed for {office.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                        No candidates cleared during the statutory Article 42 vetting window. In accordance with Article
                        48, this executive post will be filled via a Special By-Election overseen by the Staff Patron and
                        the Dean of Pharmacy.
                      </p>
                      <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedOffice('all')}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
                        >
                          <span>Explore Other Contested Offices</span>
                        </button>
                        <button
                          onClick={() => onNavigate('rules')}
                          className="inline-flex items-center gap-1.5 rounded-full border border-transparent bg-secondary px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <span>Read By-Election Bylaws</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* Floating Compare Dock (Appears when 1 or more candidates are selected for comparison) */}
      {compareIds.length > 0 && (
        <aside
          aria-label="Candidate Comparison Dock"
          className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-xl rounded-2xl border-2 border-ink bg-card p-3 sm:p-4 shadow-pop animate-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs shrink-0">
                <Scale className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs sm:text-sm font-bold text-foreground">
                  Comparing {compareIds.length} candidate{compareIds.length === 1 ? '' : 's'}
                </p>
                <p className="text-[11px] text-muted-foreground hidden sm:block">
                  Side-by-side priorities, experience, and constitutional pledges
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCompareIds([])}
                className="text-xs font-mono text-muted-foreground hover:text-foreground px-2 py-1"
              >
                Clear
              </button>
              <button
                onClick={() => setIsCompareOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-ink-foreground shadow-xs hover:bg-primary transition-colors"
              >
                <span>Compare Now</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Sticky "Ready to vote?" Bar (Appears on scroll) */}
      {showStickyVoteBar && (
        <aside
          aria-label="Election Phase Quick Action"
          className="fixed bottom-0 inset-x-0 z-30 border-t-2 border-ink bg-card/95 backdrop-blur-md px-4 py-2.5 shadow-pop animate-in slide-in-from-bottom-2 hidden sm:block"
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-ink">
                <Vote className="h-4 w-4" />
              </div>
              <p className="text-xs font-medium text-foreground">
                {currentPhase === 'polling-live' ? (
                  <>
                    <strong className="text-primary font-bold">Polling is currently LIVE!</strong> Cast your secret
                    ballot in the digital voting booth.
                  </>
                ) : (
                  <>
                    <strong className="text-foreground font-bold">Ready for Election Day?</strong> Review candidates
                    now so you are fully prepared when polling opens.
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onNavigate('portal')}
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-ink-foreground shadow-xs hover:bg-primary transition-colors"
              >
                <span>Proceed to Vote</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setShowStickyVoteBar(false)}
                className="p-1 text-muted-foreground hover:text-foreground"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Slide-over Panel (Drawer on Desktop, Bottom Sheet on Mobile) */}
      {pickedCandidate && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end bg-ink/60 backdrop-blur-xs transition-opacity"
          onClick={() => setPickedCandidate(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${pickedCandidate.name} platform`}
        >
          <div
            className="w-full sm:max-w-2xl max-h-[92vh] sm:max-h-full sm:h-full flex flex-col rounded-t-[2.5rem] sm:rounded-t-none sm:rounded-l-[2.5rem] border-t-2 sm:border-t-0 sm:border-l-2 border-ink bg-card shadow-pop animate-in slide-in-from-bottom sm:slide-in-from-right duration-300 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Top Navigation & Actions Bar */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-background/50">
              {/* Prev / Next Candidate Arrows */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const currentOfficeCands = effectiveCandidates.filter((c) => c.officeId === pickedCandidate.officeId);
                    const idx = currentOfficeCands.findIndex((c) => c.id === pickedCandidate.id);
                    if (idx > 0) setPickedCandidate(currentOfficeCands[idx - 1]);
                    else setPickedCandidate(currentOfficeCands[currentOfficeCands.length - 1]);
                  }}
                  className="rounded-full border border-border bg-card p-1.5 text-foreground hover:bg-secondary transition-colors"
                  title="Previous candidate (Arrow Left)"
                  aria-label="Previous candidate"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <span className="font-mono text-xs text-muted-foreground px-1">
                  Candidate Profile
                </span>
                <button
                  onClick={() => {
                    const currentOfficeCands = effectiveCandidates.filter((c) => c.officeId === pickedCandidate.officeId);
                    const idx = currentOfficeCands.findIndex((c) => c.id === pickedCandidate.id);
                    if (idx < currentOfficeCands.length - 1) setPickedCandidate(currentOfficeCands[idx + 1]);
                    else setPickedCandidate(currentOfficeCands[0]);
                  }}
                  className="rounded-full border border-border bg-card p-1.5 text-foreground hover:bg-secondary transition-colors"
                  title="Next candidate (Arrow Right)"
                  aria-label="Next candidate"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Action Controls: Share, Shortlist, Compare & Close */}
              <div className="flex items-center gap-1.5">
                {/* Share Link Button */}
                <button
                  onClick={() => handleCopyShare(pickedCandidate)}
                  className="relative rounded-full border border-border bg-card p-2 text-foreground hover:bg-secondary transition-colors"
                  title="Share profile link"
                  aria-label="Share profile link"
                >
                  <Share2 className="h-4 w-4" />
                  {copiedShareLink && (
                    <span className="absolute -bottom-8 right-0 rounded-md bg-ink px-2 py-0.5 font-mono text-[10px] text-ink-foreground shadow-xs whitespace-nowrap">
                      Link Copied!
                    </span>
                  )}
                </button>

                {/* Shortlist Toggle */}
                <button
                  onClick={() => toggleShortlist(pickedCandidate.id)}
                  className={`rounded-full border p-2 transition-colors ${
                    shortlist.includes(pickedCandidate.id)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-foreground hover:bg-secondary'
                  }`}
                  title="Save to private shortlist"
                  aria-label="Bookmark candidate"
                >
                  {shortlist.includes(pickedCandidate.id) ? (
                    <BookmarkCheck className="h-4 w-4" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setPickedCandidate(null)}
                  className="rounded-full border border-border bg-card p-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ml-1"
                  aria-label="Close dialog"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Candidate Header Identity Block */}
            <div className="p-6 border-b border-border bg-card">
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-primary ring-offset-2 ring-offset-card shadow-md">
                    <span
                      className="absolute inset-0 z-0 flex items-center justify-center font-display text-2xl font-bold text-white"
                      style={{ backgroundColor: pickedCandidate.photoPlaceholderBg || '#286746' }}
                    >
                      {pickedCandidate.initials}
                    </span>
                    {pickedCandidate.photoUrl ? (
                      <img
                        src={pickedCandidate.photoUrl}
                        alt={pickedCandidate.name}
                        className="absolute inset-0 z-10 h-full w-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : null}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                      {OFFICES.find((o) => o.id === pickedCandidate.officeId)?.title}
                    </span>
                    <span className="text-xs font-mono text-success font-medium flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> Cleared by Commission
                    </span>
                  </div>
                  <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-foreground truncate">
                    {pickedCandidate.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {pickedCandidate.yearOfStudy} · Candidate ID: {pickedCandidate.id}
                  </p>
                </div>
              </div>

              {/* 4 Navigation Tabs: Manifesto, Experience, Priorities, Q&A */}
              <div className="mt-6 flex border-b border-border">
                {[
                  { id: 'manifesto', label: 'Manifesto' },
                  { id: 'experience', label: 'Experience' },
                  { id: 'priorities', label: 'Priorities (3)' },
                  { id: 'qa', label: 'Q&A' },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold transition-all relative ${
                        isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span>{tab.label}</span>
                      {isActive && (
                        <span className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Body Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Tab 1: Manifesto */}
              {activeTab === 'manifesto' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="rounded-2xl border border-border bg-secondary/50 p-5 leading-relaxed text-foreground text-sm sm:text-base">
                    <p>{pickedCandidate.manifestoSummary}</p>
                  </div>

                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">
                      Core Constitutional Pillars
                    </h3>
                    <ul className="mt-3 space-y-3">
                      {pickedCandidate.manifestoPillars.map((pillar, idx) => (
                        <li
                          key={pillar}
                          className="flex items-start gap-3 rounded-2xl border border-border bg-background p-4 shadow-xs"
                        >
                          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 font-mono text-xs font-bold text-primary shrink-0 mt-0.5">
                            0{idx + 1}
                          </span>
                          <span className="text-sm text-foreground font-medium leading-relaxed">
                            {pillar}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Commission Clearance Dossier */}
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">
                      Electoral Commission Clearance Dossier
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {pickedCandidate.complianceChecklist.map((item) => (
                        <li
                          key={item.rule}
                          className="flex items-center justify-between rounded-xl border border-border bg-background/50 px-4 py-2.5 text-xs sm:text-sm"
                        >
                          <span className="flex items-center gap-2 text-foreground font-medium">
                            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                            <span>{item.rule}</span>
                          </span>
                          <span className="font-mono text-xs text-muted-foreground font-semibold">
                            {item.reference}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Tab 2: Experience */}
              {activeTab === 'experience' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <h3 className="font-display text-lg font-bold text-foreground">
                    Leadership & Practical Pharmacy Track Record
                  </h3>
                  {pickedCandidate.experience && pickedCandidate.experience.length > 0 ? (
                    <div className="space-y-3">
                      {pickedCandidate.experience.map((exp, idx) => (
                        <div
                          key={exp}
                          className="flex items-start gap-3.5 rounded-2xl border border-border bg-background p-4 shadow-xs"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-ink shrink-0 mt-0.5">
                            <Briefcase className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{exp}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Verified with the School of Pharmacy Student Affairs Register
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      General B.Pharm academic record submitted. No secondary club appointments on file.
                    </p>
                  )}
                </div>
              )}

              {/* Tab 3: Priorities */}
              {activeTab === 'priorities' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <h3 className="font-display text-lg font-bold text-foreground">
                    Actionable 100-Day Priorities
                  </h3>
                  {pickedCandidate.priorities && pickedCandidate.priorities.length > 0 ? (
                    <div className="space-y-4">
                      {pickedCandidate.priorities.map((p, idx) => (
                        <div
                          key={p.title}
                          className="rounded-2xl border-2 border-border bg-card p-5 shadow-xs hover:border-ink transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs font-bold text-primary uppercase tracking-wider">
                              Priority 0{idx + 1}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                              <Clock className="h-3 w-3 text-primary" />
                              Target: {p.timeline}
                            </span>
                          </div>
                          <h4 className="mt-2 font-display text-base font-bold text-foreground">
                            {p.title}
                          </h4>
                          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            {p.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Standard priorities outlined under the primary manifesto pillars.
                    </p>
                  )}
                </div>
              )}

              {/* Tab 4: Q&A */}
              {activeTab === 'qa' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <h3 className="font-display text-lg font-bold text-foreground">
                    Voter Questions & Executive Answers
                  </h3>
                  {pickedCandidate.qa && pickedCandidate.qa.length > 0 ? (
                    <div className="space-y-4">
                      {pickedCandidate.qa.map((qaItem, idx) => (
                        <div
                          key={qaItem.question}
                          className="rounded-2xl border border-border bg-background p-5 shadow-xs space-y-2.5"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary font-mono text-xs font-bold shrink-0">
                              Q
                            </span>
                            <p className="text-sm font-bold text-foreground">{qaItem.question}</p>
                          </div>
                          <div className="flex items-start gap-2.5 pl-8 border-l-2 border-primary/20">
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                              {qaItem.answer}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Town hall recordings and question responses will be published here ahead of debate night.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Drawer Bottom Actions: Compare & Vote */}
            <div className="border-t border-border p-4 sm:p-6 bg-card flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => toggleCompare(pickedCandidate.id)}
                className={`w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-full border-2 py-3 text-xs font-semibold transition-all ${
                  compareIds.includes(pickedCandidate.id)
                    ? 'border-ink bg-ink text-ink-foreground'
                    : 'border-border bg-card text-foreground hover:border-ink'
                }`}
              >
                <Scale className="h-4 w-4" />
                <span>
                  {compareIds.includes(pickedCandidate.id) ? 'Remove from Compare' : 'Add to Compare'}
                </span>
              </button>

              <button
                onClick={() => {
                  setPickedCandidate(null);
                  onNavigate('portal');
                }}
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-xs font-semibold text-primary-foreground shadow-pop hover:bg-primary/90 transition-colors"
              >
                <span>Proceed to Vote for Candidate</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Modal */}
      {isCompareOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-xs p-3 sm:p-6"
          onClick={() => setIsCompareOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Candidate Comparison"
        >
          <div
            className="w-full max-w-5xl max-h-[90vh] flex flex-col rounded-3xl border-2 border-ink bg-card shadow-pop overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-background/60">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                  <Scale className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    Candidate Comparison Matrix
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Side-by-side evaluation for informed voting under Article 41
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCompareOpen(false)}
                className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-secondary"
                aria-label="Close comparison"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Comparison Table (Horizontal Scroll on Mobile) */}
            <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
              {compareIds.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Scale className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="font-semibold text-foreground">No candidates selected for comparison.</p>
                  <p className="text-xs mt-1">Tap "+ Compare" on 2 or 3 candidate cards to see them side-by-side.</p>
                </div>
              ) : (
                <div
                  className="grid gap-6 min-w-[650px]"
                  style={{ gridTemplateColumns: `repeat(${compareIds.length}, minmax(0, 1fr))` }}
                >
                  {compareIds.map((cId) => {
                    const c = effectiveCandidates.find((item) => item.id === cId);
                    if (!c) return null;

                    return (
                      <div
                        key={c.id}
                        className="rounded-2xl border-2 border-border bg-background p-5 flex flex-col justify-between shadow-xs space-y-6"
                      >
                        {/* Header Info */}
                        <div className="text-center">
                          <div className="mx-auto h-20 w-20 overflow-hidden rounded-full ring-2 ring-primary ring-offset-2 ring-offset-background shadow-xs relative">
                            <span
                              className="absolute inset-0 z-0 flex items-center justify-center font-display text-2xl font-bold text-white"
                              style={{ backgroundColor: c.photoPlaceholderBg || '#286746' }}
                            >
                              {c.initials}
                            </span>
                            {c.photoUrl ? (
                              <img
                                src={c.photoUrl}
                                alt={c.name}
                                className="absolute inset-0 z-10 h-full w-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : null}
                          </div>

                          <h4 className="mt-3 font-display text-lg font-bold text-foreground">
                            {c.name}
                          </h4>
                          <p className="text-xs font-mono text-primary font-semibold">
                            {OFFICES.find((o) => o.id === c.officeId)?.title}
                          </p>
                          <p className="text-xs text-muted-foreground">{c.yearOfStudy}</p>
                        </div>

                        {/* Manifesto Summary */}
                        <div className="border-t border-border pt-4">
                          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                            Platform Vision
                          </p>
                          <p className="mt-1 text-xs text-foreground leading-relaxed line-clamp-4">
                            {c.manifestoSummary}
                          </p>
                        </div>

                        {/* Top 3 Priorities */}
                        <div className="border-t border-border pt-4">
                          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                            Key Priorities
                          </p>
                          <ul className="mt-2 space-y-2">
                            {c.priorities?.slice(0, 3).map((p, idx) => (
                              <li key={p.title} className="text-xs bg-secondary/50 p-2 rounded-lg">
                                <span className="font-semibold text-foreground block">{p.title}</span>
                                <span className="text-[10px] font-mono text-primary">{p.timeline}</span>
                              </li>
                            )) ||
                              c.manifestoPillars.slice(0, 3).map((pillar, idx) => (
                                <li key={pillar} className="text-xs bg-secondary/50 p-2 rounded-lg text-foreground">
                                  {pillar}
                                </li>
                              ))}
                          </ul>
                        </div>

                        {/* Compliance Status */}
                        <div className="border-t border-border pt-4 flex items-center justify-between text-xs font-mono text-success">
                          <span className="flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="h-4 w-4" /> Commission Cleared
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="pt-2 flex items-center gap-2">
                          <button
                            onClick={() => {
                              setIsCompareOpen(false);
                              setPickedCandidate(c);
                            }}
                            className="flex-1 rounded-full border border-border bg-card py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
                          >
                            Full Dossier
                          </button>
                          <button
                            onClick={() => {
                              setIsCompareOpen(false);
                              onNavigate('portal');
                            }}
                            className="flex-1 rounded-full bg-primary py-2 text-xs font-semibold text-primary-foreground hover:bg-ink transition-colors shadow-xs"
                          >
                            Vote Now
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-border px-6 py-3.5 bg-background/60 flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-mono">
                Fairness Guarantee: Candidates presented with identical weight under constitutional standards.
              </span>
              <button
                onClick={() => setIsCompareOpen(false)}
                className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-ink-foreground hover:bg-primary transition-colors"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nomination Modal */}
      {showNominationModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/60 backdrop-blur-xs p-0 sm:p-4"
          onClick={() => setShowNominationModal(false)}
        >
          <div
            className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl sm:rounded-3xl border-2 border-ink bg-card p-6 sm:p-8 shadow-pop animate-in slide-in-from-bottom-6 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-semibold text-primary uppercase tracking-wider">
                  Article 42 Nominations
                </span>
                <h2 className="mt-1 font-display text-2xl font-bold text-foreground">
                  File Nomination Papers
                </h2>
              </div>
              <button
                onClick={() => setShowNominationModal(false)}
                className="rounded-full p-2 hover:bg-secondary text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {nominationSubmitted ? (
              <div className="mt-8 rounded-2xl bg-success/10 border-2 border-success p-6 text-center space-y-3">
                <CheckCircle2 className="h-10 w-10 text-success mx-auto" />
                <h3 className="font-display text-xl font-bold text-foreground">Nomination Filed Successfully!</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Your candidate application has been recorded in the Commission Registry docket. You will receive an
                  official clearance audit confirmation once academic and disciplinary credentials are confirmed.
                </p>
              </div>
            ) : (
              <form onSubmit={handleNominationSubmit} className="mt-6 space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="font-semibold text-foreground block">Full Legal Name (as on Student ID)</label>
                  <input
                    type="text"
                    required
                    value={nominationForm.fullName}
                    onChange={(e) => setNominationForm({ ...nominationForm, fullName: e.target.value })}
                    placeholder="e.g. Beatrice Muthoni"
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-foreground focus:border-ink focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-foreground block">Registration Number</label>
                    <input
                      type="text"
                      required
                      value={nominationForm.regNo}
                      onChange={(e) => setNominationForm({ ...nominationForm, regNo: e.target.value })}
                      placeholder="PHAM/M/0000/00/00"
                      className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 font-mono text-foreground focus:border-ink focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-foreground block">Cumulative GPA</label>
                    <input
                      type="text"
                      required
                      value={nominationForm.gpa}
                      onChange={(e) => setNominationForm({ ...nominationForm, gpa: e.target.value })}
                      placeholder="min. 3.0"
                      className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 font-mono text-foreground focus:border-ink focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-foreground block">Target Executive Office</label>
                  <select
                    value={nominationForm.officeId}
                    onChange={(e) => setNominationForm({ ...nominationForm, officeId: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-foreground focus:border-ink focus:outline-none"
                  >
                    {OFFICES.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.title} ({o.constitutionalArticle})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-foreground block">Two-Line Platform Summary</label>
                  <textarea
                    rows={2}
                    required
                    value={nominationForm.manifestoSummary}
                    onChange={(e) => setNominationForm({ ...nominationForm, manifestoSummary: e.target.value })}
                    placeholder="Outline your primary vision for the student body..."
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-foreground focus:border-ink focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-semibold text-foreground block">3 Core Policy Priorities</label>
                  <input
                    type="text"
                    required
                    placeholder="Priority 1: e.g. Hospital Attachment Grants"
                    value={nominationForm.pillar1}
                    onChange={(e) => setNominationForm({ ...nominationForm, pillar1: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-foreground focus:border-ink focus:outline-none text-xs"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Priority 2: e.g. Bi-monthly Treasury Transparency Reports"
                    value={nominationForm.pillar2}
                    onChange={(e) => setNominationForm({ ...nominationForm, pillar2: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-foreground focus:border-ink focus:outline-none text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Priority 3 (Optional): e.g. Pharmacy Week Career Expo"
                    value={nominationForm.pillar3}
                    onChange={(e) => setNominationForm({ ...nominationForm, pillar3: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-foreground focus:border-ink focus:outline-none text-xs"
                  />
                </div>

                <div className="rounded-xl bg-secondary/50 p-3 text-xs text-muted-foreground font-mono">
                  By submitting, you certify good disciplinary standing and authorize the Commission to verify Dean
                  clearance.
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNominationModal(false)}
                    className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-ink shadow-xs"
                  >
                    Submit Nomination Papers
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
