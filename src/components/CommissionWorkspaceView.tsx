import React, { useState, useEffect } from 'react';
import { ViewId, ReadinessGate, Candidate, StudentRecord, DisputeSubmission } from '../types';
import {
  READINESS_GATES,
  OBSERVER_AUDIT_LOGS,
  SAMPLE_DISPUTES,
  CANDIDATES,
  SAMPLE_STUDENTS,
  CONTINGENCY_PROTOCOLS,
  TURNOUT_METRICS
} from '../data/election';
import { fetchConstitutionalPetitions, adjudicateConstitutionalPetition } from '../lib/electionService';
import { PageIntro } from './site-shell';
import {
  Lock,
  Unlock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  FileCheck2,
  Download,
  Sparkles,
  Users,
  LogOut,
  RefreshCw,
  Send,
  Eye,
  Key,
  ShieldAlert,
  Sliders,
  Check,
  X
} from 'lucide-react';

interface CommissionWorkspaceViewProps {
  onNavigate: (view: ViewId) => void;
  onOpenAudit?: () => void;
  onOpenRehearsal?: () => void;
}

const OFFICER_ROLES = [
  'Chief Returning Officer (Prof. / Dr. David Kibet)',
  'Commission Secretary (Brenda Naliaka)',
  'ICT & Cryptographic Systems Officer (Eng. Mark Otieno)',
  'Faculty Patron & Observer Representative (Dr. J. Mwangi)'
];

export function CommissionWorkspaceView({
  onNavigate,
  onOpenAudit,
  onOpenRehearsal,
}: CommissionWorkspaceViewProps) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('kupsa_commission_auth') === 'true';
  });

  // Login Form State
  const [officerId, setOfficerId] = useState('');
  const [passcode, setPasscode] = useState('');
  const [selectedRole, setSelectedRole] = useState(OFFICER_ROLES[0]);
  const [authError, setAuthError] = useState<string | null>(null);

  // Operational State
  const [activeTab, setActiveTab] = useState<'vetting' | 'voters' | 'disputes' | 'readiness'>('vetting');
  const [systemHalt, setSystemHalt] = useState(false);
  const [candidatesList, setCandidatesList] = useState<Candidate[]>(CANDIDATES);
  const [studentsList, setStudentsList] = useState<StudentRecord[]>(SAMPLE_STUDENTS);
  const [disputesList, setDisputesList] = useState<DisputeSubmission[]>(SAMPLE_DISPUTES);
  const [gatesList, setGatesList] = useState<ReadinessGate[]>(READINESS_GATES);
  const [voterSearchQuery, setVoterSearchQuery] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // New dispute modal state
  const [showRulingModal, setShowRulingModal] = useState<string | null>(null);
  const [rulingNotes, setRulingNotes] = useState('');

  // Load live constitutional petitions from server
  useEffect(() => {
    fetchConstitutionalPetitions().then((res) => {
      if (res && res.length > 0) {
        setDisputesList(res);
      }
    });
  }, []);

  const triggerSuccessBanner = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 3500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!officerId.trim() || !passcode.trim()) {
      setAuthError('Please enter both Officer ID and Passcode.');
      return;
    }
    // Accept standard demo credentials or any reasonable input for convenience
    setIsAuthenticated(true);
    sessionStorage.setItem('kupsa_commission_auth', 'true');
    setAuthError(null);
  };

  const handleQuickDemoLogin = (role: string, id: string) => {
    setOfficerId(id);
    setPasscode('KUPSA-ELEC-2026');
    setSelectedRole(role);
    setIsAuthenticated(true);
    sessionStorage.setItem('kupsa_commission_auth', 'true');
    setAuthError(null);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('kupsa_commission_auth');
    setOfficerId('');
    setPasscode('');
  };

  // 1-Click Candidate Clearance Toggle
  const handleToggleClearance = (candId: string, newStatus: 'Vetted & Approved' | 'Provisional' | 'Under Review') => {
    setCandidatesList((prev) =>
      prev.map((c) => (c.id === candId ? { ...c, vettingStatus: newStatus } : c))
    );
    triggerSuccessBanner(`Updated clearance status to "${newStatus}" for candidate ${candId}.`);
  };

  // 1-Click Voter Override
  const handleVoterOverride = (regNo: string) => {
    setStudentsList((prev) =>
      prev.map((s) => {
        if (s.regNo !== regNo) return s;
        const newStatus = s.status === 'Eligible' ? 'Action Required' : 'Eligible';
        return {
          ...s,
          status: newStatus,
          duesCleared: newStatus === 'Eligible',
          reason: newStatus === 'Eligible' ? 'Manually accredited by Commission Desk (Article 39 exception)' : s.reason
        };
      })
    );
    triggerSuccessBanner(`Toggled eligibility status for Reg No ${regNo}.`);
  };

  // Dispute resolution & Article 51 Adjudication actions
  const handleResolveDispute = async (
    dispId: string,
    status: 'Resolved' | 'Dismissed' | 'Escalated to Patron' | 'Hearing Convened' | 'Upheld'
  ) => {
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' EAT';
    const note = rulingNotes || `Actioned by ${selectedRole} on ${timestampStr}: ${status}.`;

    setDisputesList((prev) =>
      prev.map((d) =>
        d.id === dispId
          ? {
              ...d,
              status,
              resolutionNotes: note,
              adjudicatedBy: selectedRole,
              adjudicatedAt: timestampStr,
            }
          : d
      )
    );
    setShowRulingModal(null);
    setRulingNotes('');
    triggerSuccessBanner(`Dispute ${dispId} marked as ${status}.`);

    try {
      await adjudicateConstitutionalPetition({
        id: dispId,
        status,
        resolutionNotes: note,
        adjudicatorRole: selectedRole,
        adjudicatorName: officerId || 'Chief Returning Officer',
      });
    } catch (_err) {
      // Local state is already updated
    }
  };

  // Toggle Readiness Gate Checkbox
  const handleToggleGateItem = (gateId: string, itemId: string) => {
    setGatesList((prev) =>
      prev.map((g) => {
        if (g.id !== gateId) return g;
        const updatedItems = g.items.map((it) =>
          it.id === itemId ? { ...it, verified: !it.verified } : it
        );
        const allDone = updatedItems.every((it) => it.verified);
        return {
          ...g,
          items: updatedItems,
          completed: allDone,
          blockersCount: updatedItems.filter((it) => !it.verified).length,
        };
      })
    );
  };

  // Filter voters by search
  const filteredStudents = studentsList.filter(
    (s) =>
      s.regNo.toLowerCase().includes(voterSearchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(voterSearchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(voterSearchQuery.toLowerCase())
  );

  // If NOT authenticated, render the dedicated Commission Login Page
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
          {/* Official Seal / Badge */}
          <div className="text-center space-y-3 mb-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-ink text-sun shadow-pop border-2 border-sun">
              <Lock className="h-8 w-8" />
            </div>
            <p className="eyebrow text-primary">Confidential · Official Access</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Commission Console
            </h1>
            <p className="text-sm text-muted-foreground">
              Authorized login for KUPSA Electoral Commissioners, Returning Officers, and School Patron observers under Article 50.
            </p>
          </div>

          {/* Login Card */}
          <div className="rounded-3xl border-2 border-ink bg-card p-6 sm:p-8 shadow-pop">
            <form onSubmit={handleLogin} className="space-y-4">
              {authError && (
                <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Role Selector */}
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 font-mono">
                  Official Mandate / Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full rounded-xl border-2 border-border bg-background px-3.5 py-2.5 text-xs font-medium text-foreground focus:border-ink focus:outline-none"
                >
                  {OFFICER_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Officer ID */}
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 font-mono">
                  Commission Officer ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={officerId}
                    onChange={(e) => setOfficerId(e.target.value)}
                    placeholder="e.g. EC-KUPSA-2026-01"
                    className="w-full rounded-xl border-2 border-border bg-background px-3.5 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:border-ink focus:outline-none"
                  />
                  <ShieldCheck className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Security Key / Passcode */}
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 font-mono">
                  Encrypted Station Key / PIN
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border-2 border-border bg-background px-3.5 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:border-ink focus:outline-none"
                  />
                  <Key className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-ink-foreground shadow-pop hover:bg-primary transition-colors flex items-center justify-center gap-2"
              >
                <Unlock className="h-4 w-4" />
                <span>Authenticate & Unlock Console</span>
              </button>
            </form>

            {/* Quick Demo Access Buttons */}
            <div className="mt-6 pt-5 border-t border-border">
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2 text-center">
                Demo Testing Shortcuts
              </p>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleQuickDemoLogin(
                      OFFICER_ROLES[0],
                      'EC-KUPSA-CHAIR-01'
                    )
                  }
                  className="rounded-xl border border-border bg-secondary/50 px-3 py-2 text-xs font-medium text-foreground hover:bg-accent hover:border-ink transition-colors text-left flex items-center justify-between"
                >
                  <span>Chief Returning Officer Demo</span>
                  <span className="text-[10px] font-mono text-primary font-bold">1-Click Login →</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickDemoLogin(
                      OFFICER_ROLES[2],
                      'EC-KUPSA-ICT-03'
                    )
                  }
                  className="rounded-xl border border-border bg-secondary/50 px-3 py-2 text-xs font-medium text-foreground hover:bg-accent hover:border-ink transition-colors text-left flex items-center justify-between"
                >
                  <span>ICT & Verification Desk Demo</span>
                  <span className="text-[10px] font-mono text-primary font-bold">1-Click Login →</span>
                </button>
              </div>
            </div>

            {/* Exit to Public Portal */}
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => onNavigate('overview')}
                className="text-xs text-muted-foreground hover:text-foreground underline font-mono"
              >
                ← Return to Vote
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED: Optimized, High-Utility Commission Dashboard
  const completedGatesCount = gatesList.filter((g) => g.completed).length;

  return (
    <div className="pb-16">
      {/* Top Officer Session Header */}
      <div className="bg-ink text-ink-foreground border-b border-white/10 px-4 sm:px-6 py-4">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sun text-ink font-bold shadow-xs">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="eyebrow text-sun">Official Operations Hub</span>
                <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-semibold">
                  SECURE SESSION · TLS 1.3
                </span>
              </div>
              <p className="font-display text-lg font-semibold text-white">
                {selectedRole.split('(')[0]} · <span className="font-mono text-xs opacity-70">{officerId || 'EC-OFFICER-742'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            {onOpenRehearsal && (
              <button
                onClick={onOpenRehearsal}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5 text-sun" />
                <span>Simulation Sandbox</span>
              </button>
            )}
            {onOpenAudit && (
              <button
                onClick={onOpenAudit}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Audit Logs</span>
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-full bg-destructive/90 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-destructive transition-colors shadow-xs"
              title="Lock console and sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Lock Console</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Bar */}
      {actionSuccessMessage && (
        <div className="bg-success text-white py-2.5 px-4 text-center text-xs font-semibold shadow-xs animate-in slide-in-from-top-1">
          ✓ {actionSuccessMessage}
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        {/* Emergency Control & Quick Health Strip */}
        <div className="rounded-2xl border-2 border-ink bg-card p-4 sm:p-5 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`h-3.5 w-3.5 rounded-full shrink-0 ${systemHalt ? 'bg-destructive animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Polling Terminal Master Switch
              </p>
              <p className="font-display font-semibold text-foreground sm:text-lg">
                {systemHalt ? 'EMERGENCY HALT ACTIVE — Polling Suspended' : 'POLLING ACTIVE — Digital & Paper Rosters Online'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSystemHalt(!systemHalt);
                triggerSuccessBanner(systemHalt ? 'Resumed normal polling operations.' : 'EMERGENCY HALT engaged.');
              }}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                systemHalt
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-amber-600 text-white hover:bg-amber-700'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>{systemHalt ? 'Resume Polling' : 'Engage Emergency Halt'}</span>
            </button>
          </div>
        </div>

        {/* 4 Quick Executive Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <span className="eyebrow text-primary text-[10px]">Accredited Ballots</span>
            <p className="font-mono text-2xl font-bold text-foreground mt-1">
              {TURNOUT_METRICS.ballotsCast} <span className="text-xs font-normal text-muted-foreground">/ {TURNOUT_METRICS.registeredTotal}</span>
            </p>
            <div className="mt-2 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${TURNOUT_METRICS.turnoutPercentage}%` }} />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 font-mono">{TURNOUT_METRICS.turnoutPercentage}% Turnout</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <span className="eyebrow text-primary text-[10px]">Candidate Clearance</span>
            <p className="font-mono text-2xl font-bold text-foreground mt-1">
              {candidatesList.filter((c) => c.vettingStatus === 'Vetted & Approved').length} <span className="text-xs font-normal text-muted-foreground">/ {candidatesList.length}</span>
            </p>
            <p className="text-[11px] text-success mt-1 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> All Portfolios Contested
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <span className="eyebrow text-primary text-[10px]">Open Disputes</span>
            <p className="font-mono text-2xl font-bold text-foreground mt-1">
              {disputesList.filter((d) => d.status === 'Filed' || d.status === 'Under Review by Commission & Patron').length}
            </p>
            <p className="text-[11px] text-amber-600 font-semibold mt-1 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" /> 1 Under Commission Review
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <span className="eyebrow text-primary text-[10px]">Statutory Gates</span>
            <p className="font-mono text-2xl font-bold text-foreground mt-1">
              {completedGatesCount} <span className="text-xs font-normal text-muted-foreground">/ {gatesList.length}</span>
            </p>
            <p className="text-[11px] text-primary font-semibold mt-1">
              {completedGatesCount === gatesList.length ? '100% Ready' : 'In Final Signoff'}
            </p>
          </div>
        </div>

        {/* Operational Console Tabs */}
        <div className="flex border-b border-border gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'vetting', label: 'Candidate Vetting (Direct Actions)', icon: Users },
            { id: 'voters', label: 'Voter Roll & Fast Check-In', icon: Search },
            { id: 'disputes', label: 'Dispute Docket & Rulings', icon: ShieldAlert },
            { id: 'readiness', label: 'Readiness Gates Checklist', icon: FileCheck2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-xs font-bold transition-colors whitespace-nowrap ${
                  active
                    ? 'border-2 border-b-0 border-ink bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-primary' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: Direct Candidate Vetting Actions */}
        {activeTab === 'vetting' && (
          <div className="rounded-2xl border-2 border-ink bg-card p-4 sm:p-6 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Nomination Clearance & Disqualification Panel
                </h3>
                <p className="text-xs text-muted-foreground">
                  Approve, review, or revoke candidates under Article 43 compliance checks.
                </p>
              </div>
              <span className="font-mono text-xs font-semibold text-muted-foreground">
                {candidatesList.length} Nominees Listed
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="py-2.5 px-3">Candidate</th>
                    <th className="py-2.5 px-3">Office</th>
                    <th className="py-2.5 px-3">Year</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Commission Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {candidatesList.map((cand) => (
                    <tr key={cand.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-3 font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary font-mono text-[10px] font-bold">
                            {cand.initials}
                          </span>
                          <span>{cand.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-muted-foreground">
                        {cand.officeId}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">
                        {cand.yearOfStudy}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold ${
                            cand.vettingStatus === 'Vetted & Approved'
                              ? 'bg-success/15 text-success'
                              : cand.vettingStatus === 'Provisional'
                              ? 'bg-amber-500/15 text-amber-600'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {cand.vettingStatus === 'Vetted & Approved' ? '✓ Approved' : cand.vettingStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleClearance(cand.id, 'Vetted & Approved')}
                          className="rounded-lg bg-emerald-600 text-white px-2.5 py-1 text-[11px] font-semibold hover:bg-emerald-700 transition-colors"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => handleToggleClearance(cand.id, 'Under Review')}
                          className="rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => handleToggleClearance(cand.id, 'Provisional')}
                          className="rounded-lg bg-destructive/10 text-destructive border border-destructive/20 px-2.5 py-1 text-[11px] font-semibold hover:bg-destructive/20 transition-colors"
                        >
                          Flag
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Voter Roll & Fast Registration Verification */}
        {activeTab === 'voters' && (
          <div className="rounded-2xl border-2 border-ink bg-card p-4 sm:p-6 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Fast Voter Roll Verification & Exception Override Desk
                </h3>
                <p className="text-xs text-muted-foreground">
                  Search any student by registration number to verify standing or grant manual poll-station clearance.
                </p>
              </div>

              {/* Fast Search Input */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={voterSearchQuery}
                  onChange={(e) => setVoterSearchQuery(e.target.value)}
                  placeholder="Search Reg No or Name..."
                  className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-1.5 text-xs font-mono text-foreground focus:border-ink focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="py-2.5 px-3">Reg No</th>
                    <th className="py-2.5 px-3">Full Name</th>
                    <th className="py-2.5 px-3">Cohort</th>
                    <th className="py-2.5 px-3">Dues</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Station Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredStudents.map((stud) => (
                    <tr key={stud.regNo} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-foreground">
                        {stud.regNo}
                      </td>
                      <td className="py-3 px-3 text-foreground font-medium">
                        {stud.name}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">
                        {stud.yearOfStudy}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        {stud.duesCleared ? (
                          <span className="text-success font-semibold">Cleared</span>
                        ) : (
                          <span className="text-destructive font-semibold">Arrears</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold ${
                            stud.status === 'Eligible'
                              ? 'bg-success/15 text-success'
                              : 'bg-destructive/15 text-destructive'
                          }`}
                        >
                          {stud.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleVoterOverride(stud.regNo)}
                          className={`rounded-lg px-3 py-1 text-[11px] font-semibold transition-colors ${
                            stud.status === 'Eligible'
                              ? 'border border-destructive/30 text-destructive hover:bg-destructive/10'
                              : 'bg-ink text-ink-foreground hover:bg-primary'
                          }`}
                        >
                          {stud.status === 'Eligible' ? 'Revoke Check-In' : 'Grant Override'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Dispute Docket & Executive Rulings */}
        {activeTab === 'disputes' && (
          <div className="rounded-2xl border-2 border-ink bg-card p-4 sm:p-6 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Official Election Dispute Docket
                </h3>
                <p className="text-xs text-muted-foreground">
                  Adjudicate formal objections under Article 51 in coordination with the School Patron.
                </p>
              </div>

              <button
                onClick={() => {
                  const demoDispute: DisputeSubmission = {
                    id: `disp-${Date.now()}`,
                    timestamp: 'Just now',
                    complainantName: 'Agent James Kariuki',
                    complainantRole: 'Candidate Agent',
                    officeContested: 'Chairperson',
                    constitutionalGrounds: 'Claimed campaign poster affixed inside polling zone boundary.',
                    status: 'Filed',
                    patronNotified: true,
                    resolutionNotes: 'Pending review by Commission Secretary.'
                  };
                  setDisputesList([demoDispute, ...disputesList]);
                  triggerSuccessBanner('Logged new dispute ticket on docket.');
                }}
                className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-ink-foreground hover:bg-primary transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>+ Log New Dispute Docket</span>
              </button>
            </div>

            <div className="space-y-3">
              {disputesList.map((disp) => (
                <div
                  key={disp.id}
                  className="rounded-xl border border-border p-4 hover:border-ink transition-colors bg-background space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary">
                        Docket #{disp.id}
                      </span>
                      <span className="text-xs text-muted-foreground">· {disp.timestamp}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                          disp.status === 'Resolved'
                            ? 'bg-success/15 text-success'
                            : disp.status === 'Dismissed'
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-amber-500/15 text-amber-600'
                        }`}
                      >
                        {disp.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => handleResolveDispute(disp.id, 'Hearing Convened')}
                        className="rounded-md bg-sky-600 text-white px-2 py-1 text-[11px] font-semibold hover:bg-sky-700 cursor-pointer"
                        title="Convene 48-Hour Quorum Hearing"
                      >
                        Convene Hearing
                      </button>
                      <button
                        onClick={() => handleResolveDispute(disp.id, 'Resolved')}
                        className="rounded-md bg-emerald-600 text-white px-2.5 py-1 text-[11px] font-semibold hover:bg-emerald-700 cursor-pointer"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleResolveDispute(disp.id, 'Upheld')}
                        className="rounded-md bg-indigo-600 text-white px-2.5 py-1 text-[11px] font-semibold hover:bg-indigo-700 cursor-pointer"
                      >
                        Uphold
                      </button>
                      <button
                        onClick={() => handleResolveDispute(disp.id, 'Dismissed')}
                        className="rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-muted cursor-pointer"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleResolveDispute(disp.id, 'Escalated to Patron')}
                        className="rounded-md bg-amber-600 text-white px-2.5 py-1 text-[11px] font-semibold hover:bg-amber-700 cursor-pointer"
                      >
                        Escalate
                      </button>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-foreground">
                    Contested: {disp.officeContested} · Complainant: {disp.complainantName} ({disp.complainantRole})
                    {disp.regNo && <span className="font-mono text-xs text-muted-foreground ml-2">[{disp.regNo}]</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {disp.constitutionalGrounds}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-muted-foreground pt-1">
                    {disp.transmittalHash && (
                      <span className="rounded bg-secondary px-2 py-0.5 text-emerald-700 dark:text-emerald-400 font-bold">
                        Patron Hash: {disp.transmittalHash}
                      </span>
                    )}
                    {disp.articlesCited && disp.articlesCited.map((a, i) => (
                      <span key={i} className="rounded bg-muted px-1.5 py-0.5">
                        {a}
                      </span>
                    ))}
                    {disp.adjudicatedBy && (
                      <span className="text-primary font-sans font-semibold">
                        · Adjudicated by {disp.adjudicatedBy}
                      </span>
                    )}
                  </div>

                  {disp.resolutionNotes && (
                    <div className="rounded-lg bg-secondary/50 p-2 text-xs font-mono text-foreground border border-border/50">
                      <strong>Ruling Note:</strong> {disp.resolutionNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Statutory Readiness Gates & Checklist */}
        {activeTab === 'readiness' && (
          <div className="rounded-2xl border-2 border-ink bg-card p-4 sm:p-6 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Statutory 5-Gate Checklist & Constitutional Verification
                </h3>
                <p className="text-xs text-muted-foreground">
                  Click any verification checkbox to record live compliance in the immutable audit trail.
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-primary">
                {completedGatesCount} of {gatesList.length} Gates Cleared
              </span>
            </div>

            <div className="space-y-4">
              {gatesList.map((gate) => (
                <div
                  key={gate.id}
                  className={`rounded-xl border-2 p-4 transition-colors ${
                    gate.completed ? 'border-border bg-background/50' : 'border-ink bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary">
                        Gate {gate.number}
                      </span>
                      <h4 className="font-display font-semibold text-foreground text-sm sm:text-base">
                        {gate.title}
                      </h4>
                    </div>
                    <span
                      className={`font-mono text-[10px] font-bold rounded-full px-2 py-0.5 ${
                        gate.completed ? 'bg-success/15 text-success' : 'bg-amber-500/15 text-amber-600'
                      }`}
                    >
                      {gate.completed ? '✓ Passed' : `${gate.blockersCount} Pending`}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3">{gate.description}</p>

                  <div className="space-y-2">
                    {gate.items.map((it) => (
                      <label
                        key={it.id}
                        onClick={() => handleToggleGateItem(gate.id, it.id)}
                        className="flex items-start gap-2.5 p-2 rounded-lg bg-secondary/40 hover:bg-secondary cursor-pointer transition-colors text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={it.verified}
                          onChange={() => {}}
                          className="mt-0.5 rounded border-border text-primary focus:ring-0 cursor-pointer"
                        />
                        <span className={it.verified ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                          {it.description}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
