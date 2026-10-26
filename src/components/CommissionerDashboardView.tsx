import React, { useState, useMemo } from 'react';
import { ViewId } from '../types';
import { useVotingStore } from '../context/VotingStore';
import { SHARED_OFFICES, SHARED_CANDIDATES } from '../data/candidateData';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  ShieldCheck,
  Settings,
  Lock,
  LogOut,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Search,
  Save,
  Menu,
  X,
  Eye,
  EyeOff,
  UserCheck,
  FileText,
  Clock,
  Layers,
  Key,
  Mail,
  Send,
  Database,
  RefreshCw
} from 'lucide-react';
import { GmailBroadcastPanel } from './GmailBroadcastPanel';
import { isSupabaseConfigured } from '../lib/supabaseClient';

interface CommissionerDashboardViewProps {
  onNavigate: (view: ViewId) => void;
}

type TabType = 'overview' | 'results-control' | 'controls' | 'voter-roll' | 'candidates' | 'ballot-ledger' | 'gmail-broadcast';

export function CommissionerDashboardView({ onNavigate }: CommissionerDashboardViewProps) {
  const {
    votes,
    totalRegistered,
    isResultsLive,
    setIsResultsLive,
    electionPhase,
    setElectionPhase,
    announcementBanner,
    setAnnouncementBanner,
    candidateClearances,
    updateCandidateClearance,
    accreditationList,
    toggleAccreditation,
    resetUserVoteStatus,
    resetVotesToSeed,
    isLoadingDb,
    dbError,
    isRealtimeConnected,
    lastSyncTime,
    refreshDbState,
    resetAllBallots,
    dbOffices,
    dbCandidates,
  } = useVotingStore();

  const [isResettingBallots, setIsResettingBallots] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // Officer Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('kupsa_commissioner_auth') === 'true';
  });
  const [officerName, setOfficerName] = useState<string>(() => {
    return sessionStorage.getItem('kupsa_officer_name') || 'Dr. Ronald Kipkemoi';
  });
  const [officerRole, setOfficerRole] = useState<string>(() => {
    return sessionStorage.getItem('kupsa_officer_role') || 'Head Commissioner';
  });
  const [loginEmail, setLoginEmail] = useState('returning.officer@kabarak.ac.ke');
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [authError, setAuthError] = useState(false);

  // Active Sidebar Tab
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Form states for editable changes
  const [editingBanner, setEditingBanner] = useState(announcementBanner);
  const [bannerSavedAlert, setBannerSavedAlert] = useState(false);

  // Voter roll search & filters
  const [voterSearch, setVoterSearch] = useState('');
  const [voterCohortFilter, setVoterCohortFilter] = useState('all');
  const [voterStatusFilter, setVoterStatusFilter] = useState<'all' | 'voted' | 'not-voted'>('all');

  const effectiveOffices = useMemo(() => {
    return dbOffices && dbOffices.length > 0 ? dbOffices : SHARED_OFFICES;
  }, [dbOffices]);

  // Candidate list combined from Supabase dbCandidates or fallback
  const candidateList = useMemo(() => {
    if (dbCandidates && dbCandidates.length > 0) {
      return dbCandidates.map((c) => {
        const off = effectiveOffices.find((o) => o.id === c.office_id);
        const clearanceRec = candidateClearances[c.id];
        return {
          id: c.id,
          name: c.name,
          officeId: c.office_id,
          officeTitle: off ? off.title : 'Executive Seat',
          photoUrl: c.photo_url || '',
          manifestoSummary: c.manifesto_summary || '',
          yearOfStudy: c.year_of_study || 'Year 3',
          clearanceStatus: clearanceRec?.status || c.clearance_status || 'Cleared & Certified',
          clearanceNotes: clearanceRec?.notes || c.clearance_notes || '',
        };
      });
    }
    return SHARED_CANDIDATES.map((c) => ({
      id: c.id,
      name: c.name,
      officeId: c.officeId,
      officeTitle: c.officeTitle,
      photoUrl: c.photoUrl || '',
      manifestoSummary: c.manifestoSummary || '',
      yearOfStudy: c.yearOfStudy || 'Year 3',
      clearanceStatus: 'Cleared & Certified',
      clearanceNotes: '',
    }));
  }, [dbCandidates, effectiveOffices, candidateClearances]);

  // Candidate edit state
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(SHARED_CANDIDATES[0]?.id || 'cand-01');
  const [candidateEditName, setCandidateEditName] = useState(SHARED_CANDIDATES[0]?.name || '');
  const [candidateEditPhotoUrl, setCandidateEditPhotoUrl] = useState(SHARED_CANDIDATES[0]?.photoUrl || '');
  const [candidateEditManifesto, setCandidateEditManifesto] = useState(SHARED_CANDIDATES[0]?.manifestoSummary || '');
  const [candidateEditStatus, setCandidateEditStatus] = useState<'Cleared & Certified' | 'Under Review' | 'Provisional'>('Cleared & Certified');
  const [candidateEditNotes, setCandidateEditNotes] = useState('');
  const [candidateSavedAlert, setCandidateSavedAlert] = useState(false);

  // Sync candidate edit state when selected candidate changes
  const handleSelectCandidate = (candId: string) => {
    setSelectedCandidateId(candId);
    const rec = candidateClearances[candId];
    const cand = candidateList.find((c) => c.id === candId);
    if (cand) {
      setCandidateEditName(cand.name);
      setCandidateEditPhotoUrl(cand.photoUrl || '');
      setCandidateEditManifesto(cand.manifestoSummary || '');
    }
    if (rec) {
      setCandidateEditStatus(rec.status);
      setCandidateEditNotes(rec.notes);
    } else {
      setCandidateEditStatus('Cleared & Certified');
      setCandidateEditNotes('');
    }
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = passcode.trim();
    if (cleanPass === 'Vervetend@kupsa2027.' || cleanPass === 'Vervetend@kupsa2027') {
      setIsAuthenticated(true);
      sessionStorage.setItem('kupsa_commissioner_auth', 'true');
      sessionStorage.setItem('kupsa_officer_name', officerName);
      sessionStorage.setItem('kupsa_officer_role', officerRole);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('kupsa_commissioner_auth');
  };

  // Metrics calculation
  const totalVotesCast = votes.length;
  const turnoutPercent = ((totalVotesCast / totalRegistered) * 100).toFixed(1);
  const quorumMet = parseFloat(turnoutPercent) >= 15.0;

  // Cohort participation metrics
  const cohortTurnout = useMemo(() => {
    const cohorts = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];
    return cohorts.map((c) => {
      const cohortVotes = votes.filter((v) => v.voterYear === c).length;
      const cohortStudents = accreditationList.filter((s) => s.yearOfStudy === c).length || 1;
      const pct = Math.round((cohortVotes / cohortStudents) * 100);
      return {
        cohort: c,
        votes: cohortVotes,
        total: cohortStudents,
        percentage: Math.min(100, pct)
      };
    });
  }, [votes, accreditationList]);

  // Filtered voters
  const filteredVoters = useMemo(() => {
    return accreditationList.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(voterSearch.toLowerCase()) ||
        s.regNo.toLowerCase().includes(voterSearch.toLowerCase()) ||
        s.email.toLowerCase().includes(voterSearch.toLowerCase());
      const matchCohort = voterCohortFilter === 'all' || s.yearOfStudy.includes(voterCohortFilter);
      const matchStatus =
        voterStatusFilter === 'all'
          ? true
          : voterStatusFilter === 'voted'
          ? s.hasVoted
          : !s.hasVoted;
      return matchSearch && matchCohort && matchStatus;
    });
  }, [accreditationList, voterSearch, voterCohortFilter, voterStatusFilter]);

  // Calculate tallies per office dynamically from live database
  const officeResults = useMemo(() => {
    return effectiveOffices.map((office) => {
      const candidates = candidateList.filter((c) => c.officeId === office.id);
      const tallies = candidates.map((cand) => {
        const count = votes.filter((v) => v.choices[office.id] === cand.id).length;
        return { ...cand, count };
      });
      const abstainCount = votes.filter((v) => v.choices[office.id] === 'abstain').length;
      const totalDecisions = tallies.reduce((sum, c) => sum + c.count, 0) + abstainCount;
      const sortedCandidates = [...tallies].sort((a, b) => b.count - a.count);
      const leadingCandidate = sortedCandidates.length > 0 ? sortedCandidates[0] : null;

      return {
        ...office,
        candidates: sortedCandidates,
        leadingCandidate,
        abstainCount,
        totalDecisions,
        hasCandidates: candidates.length > 0,
      };
    });
  }, [effectiveOffices, candidateList, votes]);

  // Save announcement banner
  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    setAnnouncementBanner(editingBanner);
    setBannerSavedAlert(true);
    setTimeout(() => setBannerSavedAlert(false), 2500);
  };

  // Save candidate clearance and profile update
  const handleSaveCandidateClearance = (e: React.FormEvent) => {
    e.preventDefault();
    updateCandidateClearance(selectedCandidateId, candidateEditStatus, candidateEditNotes, {
      name: candidateEditName,
      photoUrl: candidateEditPhotoUrl,
      manifestoSummary: candidateEditManifesto,
    });
    setCandidateSavedAlert(true);
    setTimeout(() => setCandidateSavedAlert(false), 2500);
  };

  // 1. COMMISSION LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-background">
        <div className="w-full max-w-lg rounded-3xl border-2 border-ink bg-card p-6 sm:p-10 shadow-pop space-y-6 animate-in fade-in duration-300">
          {/* Header */}
          <div className="flex items-center gap-4 border-b border-border pb-5">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-ink border-2 border-sun shadow-pop shrink-0">
              <ShieldCheck className="h-8 w-8 text-sun stroke-[2.2]" />
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-sun text-ink font-mono font-bold text-[10px] border-2 border-ink shadow-xs">
                ★
              </span>
            </div>
            <div>
              <span className="eyebrow text-primary font-bold">Chapter Six Statutory Authority</span>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Electoral Commission
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Restricted administrative gateway for certified Returning Officers, Faculty Observers, and Commissioners presiding over the 2026 KUPSA Elections.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Officer Name */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Commissioner Officer Name
              </label>
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            {/* Officer Role Designation */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Official Mandate / Designation
              </label>
              <select
                value={officerRole}
                onChange={(e) => setOfficerRole(e.target.value)}
                className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="Head Commissioner">Head Commissioner</option>
                <option value="Commissioner">Commissioner</option>
                <option value="Patron / Dean">Patron / Dean</option>
                <option value="Observer">Observer</option>
              </select>
            </div>

            {/* Officer Email */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Official Commission Email
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-mono text-xs"
              />
            </div>

            {/* Passcode with show/hide toggle */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-foreground">
                  Security Key / Passcode
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPasscode ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (authError) setAuthError(false);
                  }}
                  placeholder="Enter commission security key"
                  className="w-full rounded-xl border border-border bg-background py-2.5 pl-3.5 pr-10 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  aria-label="Toggle password visibility"
                >
                  {showPasscode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {authError && (
                <p className="mt-1.5 text-xs text-destructive font-medium flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Invalid commission security key. Access restricted to accredited officers.</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-ink py-3 text-sm font-semibold text-ink-foreground shadow-xs hover:bg-primary transition-colors cursor-pointer text-center"
            >
              Sign In
            </button>
          </form>

          {/* Return link */}
          <div className="pt-3 border-t border-border flex items-center justify-center text-xs">
            <button
              type="button"
              onClick={() => onNavigate('overview')}
              className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              ← Back to Public Site
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. COMMISSIONER DASHBOARD WITH SIDEBAR NAVIGATION
  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Mobile Top Header */}
      <header className="lg:hidden border-b border-border bg-card px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 rounded-lg border border-border text-foreground hover:bg-secondary cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div>
            <span className="text-[10px] font-mono uppercase text-primary font-bold block leading-none">
              KUPSA Electoral Commission
            </span>
            <span className="font-display text-sm font-bold text-foreground">
              Officer Dashboard
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
              isResultsLive ? 'bg-emerald-500/20 text-emerald-700' : 'bg-amber-500/20 text-amber-800'
            }`}
          >
            {isResultsLive ? 'RESULTS LIVE' : 'EMBARGOED'}
          </span>
          <button
            onClick={handleLogout}
            className="text-xs font-mono text-muted-foreground hover:text-foreground p-1 cursor-pointer"
            title="Lock session"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Backdrop for Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-card border-r-2 border-ink flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="overflow-y-auto">
          {/* Sidebar Brand Header */}
          <div className="p-5 border-b border-border bg-secondary/40">
            <div className="flex items-center gap-3">
              <img
                src="/kupsa-logo.png"
                alt="KUPSA"
                className="h-10 w-10 rounded-full object-contain bg-white/80 p-0.5 border border-border"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <span className="eyebrow text-primary text-[10px] font-bold block">
                  Chapter Six Mandate
                </span>
                <h1 className="font-display text-base font-bold text-foreground leading-tight">
                  Electoral Commission
                </h1>
              </div>
            </div>

            {/* Officer Profile Badge */}
            <div className="mt-4 rounded-xl border border-border bg-card p-3 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground truncate">{officerName}</span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" title="Active Session" />
              </div>
              <span className="text-[11px] font-mono text-primary font-medium block truncate">
                {officerRole}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {[
              { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
              { id: 'results-control', label: 'Results & Embargo', icon: BarChart3, badge: isResultsLive ? 'LIVE' : 'EMBARGO' },
              { id: 'controls', label: 'Editable Controls', icon: Settings },
              { id: 'voter-roll', label: 'Voter Roll & Registry', icon: Users },
              { id: 'candidates', label: 'Candidate Clearance', icon: ShieldCheck },
              { id: 'ballot-ledger', label: 'Cast Ballots Ledger', icon: FileText, badge: `${totalVotesCast}` },
              { id: 'gmail-broadcast', label: 'Email Dispatcher', icon: Mail, badge: 'PORT 465 SSL' },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as TabType);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-ink text-ink-foreground shadow-xs'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        item.id === 'results-control'
                          ? isResultsLive
                            ? 'bg-emerald-500/20 text-emerald-700'
                            : 'bg-amber-500/20 text-amber-800'
                          : isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-secondary text-foreground'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Central Database Storage Status Chip */}
        <div className="px-4 py-2.5 border-t border-border bg-card/60 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Database className="h-3.5 w-3.5" />
            <span className="font-medium">Central DB</span>
          </div>
          {isSupabaseConfigured() ? (
            <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-500/15 px-2 py-0.5 rounded">
              CONNECTED
            </span>
          ) : (
            <span
              className="font-mono text-[10px] font-bold text-amber-800 bg-amber-500/15 px-2 py-0.5 rounded cursor-help"
              title="Awaiting database configuration keys in environment"
            >
              PENDING CONFIG
            </span>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border space-y-2 bg-secondary/20">
          <button
            onClick={() => onNavigate('overview')}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-border bg-card text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            <span>← Exit to Public Site</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Lock Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-6xl w-full">
        {/* TAB 1: EXECUTIVE OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-border pb-4">
              <div>
                <span className="eyebrow text-primary">Live Monitor</span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                  Monitor
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Statutory electoral metrics and certified tallies under Article 41 & 46 oversight
                </p>
              </div>

              {/* Real-time Database Live Pulse Indicator */}
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-border bg-card shadow-xs self-start sm:self-auto">
                <span
                  className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                    isRealtimeConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <span className="font-mono text-xs font-semibold text-foreground">
                  {isRealtimeConnected ? 'DB Synced / Live Connected' : 'Connecting to Central DB...'}
                </span>
                {lastSyncTime && (
                  <span className="text-[10px] font-mono text-muted-foreground hidden sm:inline">
                    · {lastSyncTime}
                  </span>
                )}
              </div>
            </div>

            {/* Top 4 Statutory Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Registered Voters */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                <span className="text-xs font-mono uppercase text-muted-foreground">Registered Roll</span>
                <div className="mt-2 font-display text-3xl font-bold text-foreground">{totalRegistered.toLocaleString()}</div>
                <p className="mt-1 text-[11px] font-mono text-muted-foreground">Certified pharmacy roster</p>
              </div>

              {/* Total Votes Cast */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                <span className="text-xs font-mono uppercase text-muted-foreground">Ballots Cast</span>
                <div className="mt-2 font-display text-3xl font-bold text-primary">{totalVotesCast.toLocaleString()}</div>
                <p className="mt-1 text-[11px] font-mono text-muted-foreground">Sealed in digital tally</p>
              </div>

              {/* Turnout & Quorum Status */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                <span className="text-xs font-mono uppercase text-muted-foreground">Turnout Quorum</span>
                <div className="mt-2 font-display text-3xl font-bold text-emerald-700">{turnoutPercent}%</div>
                <p className="mt-1 text-[11px] font-mono text-emerald-800 font-semibold">
                  {quorumMet ? '✓ Quorum Achieved (≥15%)' : 'Quorum Pending (<15%)'}
                </p>
              </div>

              {/* Poll Window & Status */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                <span className="text-xs font-mono uppercase text-muted-foreground">Poll Window</span>
                <div className="mt-2 font-display text-2xl font-bold text-foreground">Closes 17:00 EAT</div>
                <p className="mt-1 text-[11px] font-mono text-muted-foreground">
                  Status: {isResultsLive ? 'Results Live' : 'Embargoed until 5pm'}
                </p>
              </div>
            </div>

            {/* Cohort Participation Breakdown */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    Cohort Participation Breakdown
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Turnout distribution across academic study cohorts (Year 1 to Year 5)
                  </p>
                </div>
                <span className="text-xs font-mono text-muted-foreground">5 Cohorts Tracked</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-5">
                {cohortTurnout.map((c) => (
                  <div key={c.cohort} className="rounded-xl border border-border bg-secondary/30 p-3 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-foreground">{c.cohort}</span>
                      <span className="font-mono text-primary font-bold">{c.votes} votes</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${c.percentage}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground block text-right">
                      {c.percentage}% turnout
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Per-Office Live Tallies */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    Certified Office Portfolios
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Real-time count of student choices per constitutional office
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('results-control')}
                  className="text-xs font-mono text-primary hover:underline cursor-pointer"
                >
                  Manage Public Visibility →
                </button>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {officeResults.map((office) => (
                  <div key={office.id} className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <h4 className="font-display text-base font-bold text-foreground">{office.title}</h4>
                      <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {office.totalDecisions} votes cast
                      </span>
                    </div>

                    {office.hasCandidates ? (
                      <div className="space-y-3 text-xs">
                        {office.candidates.map((c, idx) => {
                          const pct = office.totalDecisions > 0 ? Math.round((c.count / office.totalDecisions) * 100) : 0;
                          const isLeading = idx === 0 && c.count > 0;
                          return (
                            <div key={c.id} className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-foreground flex items-center gap-1.5">
                                  {c.name}
                                  {isLeading && (
                                    <span className="text-[9px] font-mono bg-emerald-500/15 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                                      Leading
                                    </span>
                                  )}
                                </span>
                                <span className="font-mono text-muted-foreground font-semibold">
                                  {c.count} ({pct}%)
                                </span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    isLeading ? 'bg-primary' : 'bg-primary/60'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}

                        {/* Abstentions tally */}
                        <div className="pt-2 border-t border-border/60 flex justify-between text-[11px] font-mono text-muted-foreground">
                          <span>Abstained / Blank:</span>
                          <span>
                            {office.abstainCount} (
                            {office.totalDecisions > 0
                              ? Math.round((office.abstainCount / office.totalDecisions) * 100)
                              : 0}
                            %)
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic py-4 text-center">
                        No candidates nominated (Scheduled for By-Election under Article 44)
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RESULTS & EMBARGO CONTROL */}
        {activeTab === 'results-control' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b-2 border-border pb-4">
              <span className="eyebrow text-primary">Public Visibility</span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                Results Page Gazettement & Embargo Control
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Toggle public display of certified election tallies vs the constitutional 5:00 PM countdown embargo timer.
              </p>
            </div>

            {/* The Live / Not Live Control Card */}
            <div className="rounded-3xl border-2 border-ink bg-card p-6 sm:p-8 shadow-pop space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
                <div>
                  <span className="eyebrow text-muted-foreground">Publication Status</span>
                  <h3 className="font-display text-2xl font-bold text-foreground mt-0.5">
                    Public Results Display
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-md mt-1 leading-relaxed">
                    When set to <strong>Not Live (Embargoed)</strong>, any student visiting the Results tab will see the constitutional countdown timer to 5:00 PM on Election Day.
                  </p>
                </div>

                {/* Primary Toggle Switch */}
                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <span className="text-xs font-mono font-bold text-muted-foreground">
                    {isResultsLive ? 'LIVE' : 'EMBARGOED'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsResultsLive(!isResultsLive)}
                    className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-ink transition-colors duration-200 ease-in-out focus:outline-none ${
                      isResultsLive ? 'bg-emerald-600' : 'bg-secondary'
                    }`}
                    title={isResultsLive ? 'Click to embargo results' : 'Click to publish results live'}
                  >
                    <span
                      className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        isResultsLive ? 'translate-x-8' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Status Explanation Card */}
              <div
                className={`rounded-2xl border p-5 text-xs sm:text-sm leading-relaxed ${
                  isResultsLive
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-950'
                    : 'border-amber-500/40 bg-amber-500/10 text-amber-950'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  {isResultsLive ? <Eye className="h-4 w-4 text-emerald-700" /> : <EyeOff className="h-4 w-4 text-amber-800" />}
                  <span>
                    Current Setting: {isResultsLive ? 'Public Results are LIVE' : 'Public Results are NOT LIVE (Embargoed)'}
                  </span>
                </div>
                <p>
                  {isResultsLive
                    ? 'All students and observers visiting the Results page can currently inspect real-time candidate tallies and download official winner gazettement certificates.'
                    : 'Students currently see the official embargo screen with an active countdown timer targeting 5:00 PM (17:00 EAT) on Election Day.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('results')}
                  className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-xs font-semibold text-ink-foreground shadow-xs hover:bg-primary transition-colors cursor-pointer"
                >
                  <span>Preview Public Results Tab</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsResultsLive(!isResultsLive)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
                >
                  <span>Switch to {isResultsLive ? 'Embargo Mode (5pm Timer)' : 'Live Mode'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('gmail-broadcast')}
                  className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-5 py-2.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Broadcast Certified Results via Gmail</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EDITABLE CONTROLS & NOTICE BANNER */}
        {activeTab === 'controls' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b-2 border-border pb-4">
              <span className="eyebrow text-primary">Directives & Governance</span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                Editable App Controls & Directives
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Broadcast official directives to students, configure statutory polling phases, and manage prototype testing data.
              </p>
            </div>

            {/* Broadcast Notice Banner */}
            <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    Public Commission Notice Banner
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Broadcasted across the top banner of all public pages for all students to read.
                  </p>
                </div>
                <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                  Active Banner
                </span>
              </div>

              <form onSubmit={handleSaveBanner} className="space-y-3">
                <textarea
                  rows={3}
                  value={editingBanner}
                  onChange={(e) => setEditingBanner(e.target.value)}
                  placeholder="Enter official commission directive or notice..."
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-5 py-2.5 text-xs font-semibold text-ink-foreground shadow-xs hover:bg-primary transition-colors cursor-pointer"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>Broadcast Directive</span>
                    </button>
                    {editingBanner && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBanner('');
                          setAnnouncementBanner('');
                        }}
                        className="rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                      >
                        Clear Notice
                      </button>
                    )}
                  </div>

                  {bannerSavedAlert && (
                    <span className="text-xs font-mono text-emerald-700 font-semibold animate-fade-in flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Broadcast announcement updated across site!</span>
                    </span>
                  )}
                </div>
              </form>
            </div>

            {/* Reset Tools */}
            <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-5 space-y-3">
              <div>
                <h4 className="font-display text-sm font-bold text-foreground">
                  Reset Tools
                </h4>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={isResettingBallots || isLoadingDb}
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to purge all ballots for live polling day? This will clear all votes and reset student voting statuses. This cannot be undone.')) {
                      setIsResettingBallots(true);
                      try {
                        await resetAllBallots();
                        alert('All ballots successfully purged. Voter participation flags reset. Database is clean for Polling Day.');
                      } catch (err: any) {
                        alert(`Failed to purge ballots: ${err.message || 'Server error'}`);
                      } finally {
                        setIsResettingBallots(false);
                      }
                    }
                  }}
                  className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-xs font-mono text-destructive hover:bg-destructive/10 transition-colors cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResettingBallots ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Purging Ballots & Resetting Registry...</span>
                    </>
                  ) : (
                    <span>Purge All Ballots (Start Live Polling Clean)</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: VOTER ROLL & ACCREDITATION */}
        {activeTab === 'voter-roll' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b-2 border-border pb-4">
              <span className="eyebrow text-primary">Student Register</span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                Voter Roll & Accreditation Registry
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Inspect registered pharmacy students, monitor ballot status, toggle accreditation eligibility, and reset voter accounts for testing.
              </p>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={voterSearch}
                  onChange={(e) => setVoterSearch(e.target.value)}
                  placeholder="Search by student name, reg number, or email..."
                  className="w-full rounded-xl border border-border bg-card py-2 pl-10 pr-3 text-xs sm:text-sm text-foreground focus:border-primary outline-none"
                />
              </div>

              <select
                value={voterCohortFilter}
                onChange={(e) => setVoterCohortFilter(e.target.value)}
                className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-mono text-foreground focus:border-primary outline-none"
              >
                <option value="all">All Cohorts (Year 1–5)</option>
                <option value="Year 1">Year 1</option>
                <option value="Year 2">Year 2</option>
                <option value="Year 3">Year 3</option>
                <option value="Year 4">Year 4</option>
                <option value="Year 5">Year 5</option>
              </select>

              <select
                value={voterStatusFilter}
                onChange={(e: any) => setVoterStatusFilter(e.target.value)}
                className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-mono text-foreground focus:border-primary outline-none"
              >
                <option value="all">All Ballot Statuses</option>
                <option value="voted">Already Voted</option>
                <option value="not-voted">Not Yet Voted</option>
              </select>
            </div>

            {/* Voters Table */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-secondary/60 border-b border-border text-muted-foreground font-mono">
                    <tr>
                      <th className="p-3.5">Registration</th>
                      <th className="p-3.5">Student Name</th>
                      <th className="p-3.5">Cohort</th>
                      <th className="p-3.5">Ballot Status</th>
                      <th className="p-3.5">Accreditation</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredVoters.map((v) => (
                      <tr key={v.regNo} className="hover:bg-secondary/30 transition-colors">
                        <td className="p-3.5 font-mono text-foreground font-semibold">{v.regNo}</td>
                        <td className="p-3.5 font-medium text-foreground">{v.name}</td>
                        <td className="p-3.5 font-mono text-muted-foreground">{v.yearOfStudy}</td>
                        <td className="p-3.5">
                          {v.hasVoted ? (
                            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-700 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="h-3 w-3" /> Voted
                            </span>
                          ) : (
                            <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                              Not Yet Voted
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <button
                            type="button"
                            onClick={() => toggleAccreditation(v.regNo)}
                            className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-bold cursor-pointer transition-colors ${
                              v.status === 'Eligible'
                                ? 'bg-emerald-500/15 text-emerald-800 hover:bg-emerald-500/25'
                                : 'bg-amber-500/15 text-amber-800 hover:bg-amber-500/25'
                            }`}
                            title="Click to toggle accreditation status"
                          >
                            {v.status === 'Eligible' ? '✓ Eligible' : '⚠️ Action Req.'}
                          </button>
                        </td>
                        <td className="p-3.5 text-right">
                          {v.hasVoted ? (
                            <button
                              type="button"
                              onClick={() => resetUserVoteStatus(v.email)}
                              className="text-[11px] font-mono text-primary hover:underline cursor-pointer font-semibold"
                              title="Allow student to vote again for prototype testing"
                            >
                              Reset Vote State
                            </button>
                          ) : (
                            <span className="text-[11px] font-mono text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CANDIDATE CLEARANCE REGISTRY */}
        {activeTab === 'candidates' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b-2 border-border pb-4">
              <span className="eyebrow text-primary">Vetting & Compliance</span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                Candidate Clearance & Vetting Registry
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review nominees across all portfolios and update statutory clearance status and commission vetting remarks.
              </p>
            </div>

            {/* Candidate Edit Form */}
            <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-xs space-y-5">
              <h3 className="font-display text-lg font-bold text-foreground">
                Update Nominee Details, Photo & Clearance
              </h3>

              <form onSubmit={handleSaveCandidateClearance} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Select Candidate */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Select Nominee to Edit
                    </label>
                    <select
                      value={selectedCandidateId}
                      onChange={(e) => handleSelectCandidate(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background py-2.5 px-3 text-xs sm:text-sm text-foreground focus:border-primary outline-none"
                    >
                      {candidateList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} — {c.officeTitle}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Vetting Status */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Statutory Clearance Status
                    </label>
                    <select
                      value={candidateEditStatus}
                      onChange={(e: any) => setCandidateEditStatus(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background py-2.5 px-3 text-xs sm:text-sm text-foreground focus:border-primary outline-none"
                    >
                      <option value="Cleared & Certified">Cleared & Certified</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Provisional">Provisional Clearance</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Candidate Name */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Candidate Full Name
                    </label>
                    <input
                      type="text"
                      value={candidateEditName}
                      onChange={(e) => setCandidateEditName(e.target.value)}
                      placeholder="e.g. Amina Muthoni"
                      className="w-full rounded-xl border border-border bg-background py-2.5 px-3 text-xs sm:text-sm text-foreground focus:border-primary outline-none"
                    />
                  </div>

                  {/* Photo URL with Thumbnail */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Official Portrait Image URL
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={candidateEditPhotoUrl}
                        onChange={(e) => setCandidateEditPhotoUrl(e.target.value)}
                        placeholder="https://... photo link"
                        className="flex-1 rounded-xl border border-border bg-background py-2.5 px-3 text-xs sm:text-sm text-foreground focus:border-primary outline-none font-mono"
                      />
                      {candidateEditPhotoUrl && (
                        <div className="h-9 w-9 rounded-lg overflow-hidden border border-border shrink-0 bg-secondary">
                          <img
                            src={candidateEditPhotoUrl}
                            alt="Preview"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Manifesto Summary */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Manifesto Summary & Executive Platform
                  </label>
                  <textarea
                    rows={2}
                    value={candidateEditManifesto}
                    onChange={(e) => setCandidateEditManifesto(e.target.value)}
                    placeholder="Short summary of candidate policy priorities and platform..."
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary outline-none"
                  />
                </div>

                {/* Commission Notes */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Commission Vetting Remarks & Evidence Notes
                  </label>
                  <textarea
                    rows={2}
                    value={candidateEditNotes}
                    onChange={(e) => setCandidateEditNotes(e.target.value)}
                    placeholder="e.g. GPA verified with School Dean. Code of conduct signed."
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-5 py-2.5 text-xs font-semibold text-ink-foreground shadow-xs hover:bg-primary transition-colors cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Candidate Updates to Database</span>
                  </button>

                  {candidateSavedAlert && (
                    <span className="text-xs font-mono text-emerald-700 font-semibold animate-fade-in flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Nominee profile and clearance updated in Central Registry!</span>
                    </span>
                  )}
                </div>
              </form>
            </div>

            {/* Candidate Directory Overview */}
            <div className="grid gap-4 sm:grid-cols-2">
              {candidateList.map((cand) => {
                const clearance = candidateClearances[cand.id] || {
                  status: 'Cleared & Certified',
                  notes: 'Standard statutory clearance',
                  updatedAt: 'Recently',
                };
                return (
                  <div
                    key={cand.id}
                    onClick={() => handleSelectCandidate(cand.id)}
                    className={`rounded-2xl border bg-card p-4 space-y-3 cursor-pointer transition-all hover:border-ink ${
                      selectedCandidateId === cand.id ? 'border-primary ring-2 ring-primary/20 shadow-xs' : 'border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-full overflow-hidden bg-secondary border border-border shrink-0 flex items-center justify-center font-bold text-xs">
                          {cand.photoUrl ? (
                            <img
                              src={cand.photoUrl}
                              alt={cand.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            cand.name.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-foreground text-sm">{cand.name}</h4>
                          <span className="text-xs text-muted-foreground font-mono">{cand.officeTitle}</span>
                        </div>
                      </div>

                      <span
                        className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          clearance.status === 'Cleared & Certified'
                            ? 'bg-emerald-500/10 text-emerald-800'
                            : clearance.status === 'Under Review'
                            ? 'bg-amber-500/10 text-amber-800'
                            : 'bg-blue-500/10 text-blue-800'
                        }`}
                      >
                        {clearance.status}
                      </span>
                    </div>

                    {cand.manifestoSummary && (
                      <p className="text-xs text-foreground/80 line-clamp-2 italic">
                        "{cand.manifestoSummary}"
                      </p>
                    )}

                    <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                      <span>Remarks: {clearance.notes}</span>
                      <span>{clearance.updatedAt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: CAST BALLOTS LEDGER */}
        {activeTab === 'ballot-ledger' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b-2 border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="eyebrow text-primary">Sealed Audit Ledger</span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                  Cast Ballots Ledger (Anonymized)
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Constitutional Article 45 secret ballot stream: choices are permanently decoupled from voter identities.
                </p>
              </div>

              <div className="text-xs font-mono font-bold bg-secondary px-3 py-1.5 rounded-xl border border-border">
                Total Ballots: {totalVotesCast}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-secondary/60 border-b border-border text-muted-foreground font-mono">
                    <tr>
                      <th className="p-3.5">Receipt Hash</th>
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">Cohort</th>
                      <th className="p-3.5">Chairperson Choice</th>
                      <th className="p-3.5">Vice Chair Choice</th>
                      <th className="p-3.5 text-right">Integrity Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {votes.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground font-mono">
                          No ballots cast yet. As accredited students submit secret votes, sealed anonymous entries will appear here in real-time.
                        </td>
                      </tr>
                    ) : (
                      votes.slice(0, 30).map((v) => {
                        const chairCand = candidateList.find((c) => c.id === v.choices.chairperson);
                        const vcCand = candidateList.find((c) => c.id === v.choices['vice-chairperson']);
                        return (
                          <tr key={v.id} className="hover:bg-secondary/30 transition-colors">
                            <td className="p-3.5 font-mono text-primary font-bold">{v.receiptCode}</td>
                            <td className="p-3.5 font-mono text-muted-foreground">{v.timestamp}</td>
                            <td className="p-3.5 font-mono text-foreground">{v.voterYear}</td>
                            <td className="p-3.5 font-medium text-foreground">
                              {chairCand ? chairCand.name : v.choices.chairperson === 'abstain' ? 'Abstained' : 'None'}
                            </td>
                            <td className="p-3.5 font-medium text-foreground">
                              {vcCand ? vcCand.name : v.choices['vice-chairperson'] === 'abstain' ? 'Abstained' : 'None'}
                            </td>
                            <td className="p-3.5 text-right">
                              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-700 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="h-3 w-3" /> Sealed
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-3 text-center text-xs text-muted-foreground font-mono border-t border-border bg-secondary/20">
                Displaying most recent 30 of {totalVotesCast} constitutionally sealed ballots.
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: GMAIL DISPATCHER & RESULTS BROADCAST */}
        {activeTab === 'gmail-broadcast' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <GmailBroadcastPanel />
          </div>
        )}
      </main>
    </div>
  );
}
