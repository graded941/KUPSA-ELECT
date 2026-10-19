import React, { useState, useMemo } from 'react';
import { useGmail } from '../context/GmailContext';
import { useVotingStore } from '../context/VotingStore';
import { SHARED_OFFICES, SHARED_CANDIDATES } from '../data/candidateData';
import { GoogleSignInButton } from './GoogleSignInButton';
import {
  Mail,
  Send,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Eye,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  Users,
  X,
  Check
} from 'lucide-react';

export function GmailBroadcastPanel() {
  const {
    isGmailConnected,
    googleUser,
    isConnecting,
    connectGmail,
    disconnectGmail,
    sendPasswordEmail,
    sendBroadcastResults,
    lastSendError,
  } = useGmail();

  const {
    votes,
    totalRegistered,
    users,
    accreditationList,
    electionPhase,
    isResultsLive,
  } = useVotingStore();

  // Active sub-section
  const [subTab, setSubTab] = useState<'broadcast' | 'passcards'>('broadcast');

  // Broadcast settings
  const [targetAudience, setTargetAudience] = useState<'all' | 'custom'>('all');
  const [customEmail, setCustomEmail] = useState('');
  const [declarationStatement, setDeclarationStatement] = useState(
    'Pursuant to Article 45 of the KUPSA Constitution, the Independent Electoral Commission officially declares and gazettes the certified general election outcomes as free, fair, credible, and conclusive.'
  );

  // Confirmation modal state (MANDATORY per Workspace Skill destructive operation rules)
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Sending progress
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState<{
    total: number;
    current: number;
    success: number;
    failed: number;
    logs: string[];
  } | null>(null);

  // Passcard single dispatch state
  const [passcardStudentName, setPasscardStudentName] = useState('');
  const [passcardEmail, setPasscardEmail] = useState('');
  const [passcardYear, setPasscardYear] = useState('Year 3');
  const [passcardPassword, setPasscardPassword] = useState('KUP-2026');
  const [passcardStatus, setPasscardStatus] = useState<string | null>(null);
  const [isSendingPasscard, setIsSendingPasscard] = useState(false);

  // Calculate office winners from current votes
  const officeWinners = useMemo(() => {
    return SHARED_OFFICES.map((office) => {
      const officeCandidates = SHARED_CANDIDATES.filter((c) => c.officeId === office.id);
      const tallies: Record<string, number> = {};
      officeCandidates.forEach((c) => (tallies[c.id] = 0));
      tallies['abstain'] = 0;

      votes.forEach((v) => {
        const choice = v.choices[office.id];
        if (choice && tallies[choice] !== undefined) {
          tallies[choice]++;
        }
      });

      // Find highest tally among non-abstain candidates
      let leaderId = officeCandidates[0]?.id || 'abstain';
      let maxVotes = -1;

      officeCandidates.forEach((c) => {
        const count = tallies[c.id] || 0;
        if (count > maxVotes) {
          maxVotes = count;
          leaderId = c.id;
        }
      });

      const leader = officeCandidates.find((c) => c.id === leaderId);
      const totalOfficeVotes = votes.length;
      const pct = totalOfficeVotes > 0 ? Math.round((maxVotes / totalOfficeVotes) * 100) : 0;

      return {
        officeTitle: office.title,
        winnerName: leader ? leader.name : 'Uncontested',
        winnerVotes: maxVotes > -1 ? maxVotes : 0,
        winnerPct: pct,
      };
    });
  }, [votes]);

  const turnoutPct = totalRegistered > 0 ? Math.round((votes.length / totalRegistered) * 100) : 0;

  // Determine recipient list
  const recipientsList = useMemo(() => {
    if (targetAudience === 'custom') {
      return customEmail.trim() ? [customEmail.trim().toLowerCase()] : [];
    }
    // All unique registered emails
    const set = new Set<string>();
    users.forEach((u) => set.add(u.email.toLowerCase()));
    accreditationList.forEach((a) => set.add(a.email.toLowerCase()));
    return Array.from(set);
  }, [targetAudience, customEmail, users, accreditationList]);

  // Execute broadcast dispatch
  const handleExecuteBroadcast = async () => {
    setShowConfirmModal(false);
    if (recipientsList.length === 0) return;

    setIsSending(true);
    setSendProgress({
      total: recipientsList.length,
      current: 0,
      success: 0,
      failed: 0,
      logs: [`Initiating official broadcast to ${recipientsList.length} recipient(s)...`],
    });

    const now = new Date();
    const timestampStr = `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} EAT`;

    try {
      const result = await sendBroadcastResults({
        recipients: recipientsList,
        declarationStatement,
        officesSummary: officeWinners,
        totalVotes: votes.length,
        totalRegistered,
        turnoutPct,
        timestamp: timestampStr,
      });

      setSendProgress((prev) => ({
        total: recipientsList.length,
        current: recipientsList.length,
        success: result.successCount,
        failed: result.failureCount,
        logs: [
          ...(prev?.logs || []),
          `Broadcast completed: ${result.successCount} sent, ${result.failureCount} failed.`,
          ...(result.errors.length > 0 ? [`Errors: ${result.errors.slice(0, 3).join('; ')}`] : []),
        ],
      }));
    } catch (err: any) {
      setSendProgress((prev) => ({
        total: recipientsList.length,
        current: prev?.current || 0,
        success: prev?.success || 0,
        failed: recipientsList.length,
        logs: [...(prev?.logs || []), `Fatal error: ${err.message}`],
      }));
    } finally {
      setIsSending(false);
    }
  };

  // Single passcard dispatch
  const handleSendPasscard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcardEmail.trim()) return;

    setIsSendingPasscard(true);
    setPasscardStatus(null);

    const res = await sendPasswordEmail({
      studentName: passcardStudentName.trim() || 'Accredited Student',
      recipientEmail: passcardEmail.trim().toLowerCase(),
      password: passcardPassword.trim() || 'KUP-2026',
      yearOfStudy: passcardYear,
    });

    setIsSendingPasscard(false);
    if (res.success) {
      setPasscardStatus(`✓ Passcard email successfully sent to ${passcardEmail} (ID: ${res.messageId})`);
    } else {
      setPasscardStatus(`✗ Error: ${res.error}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Commission Gmail Connection Bar */}
      <div className="rounded-2xl border-2 border-ink bg-card p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-ink border-2 border-sun text-white shrink-0">
              <Mail className="h-6 w-6 text-sun" />
              {isGmailConnected && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 border-2 border-card">
                  <Check className="h-2.5 w-2.5 text-white" />
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  Google Workspace Integration
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isGmailConnected
                      ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-800 border border-amber-500/30'
                  }`}
                >
                  {isGmailConnected ? 'GMAIL CONNECTED' : 'NOT CONNECTED'}
                </span>
              </div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Official Commission Gmail Dispatcher
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Authorizes direct automated dispatch of voter password credentials and gazetted election outcomes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isGmailConnected ? (
              <div className="flex items-center gap-3 bg-secondary/80 p-2 rounded-xl border border-border">
                {googleUser?.photoURL && (
                  <img
                    src={googleUser.photoURL}
                    alt={googleUser.displayName || 'Google User'}
                    className="h-8 w-8 rounded-full border border-border"
                  />
                )}
                <div className="text-left pr-2">
                  <div className="text-xs font-bold text-foreground truncate max-w-[180px]">
                    {googleUser?.email}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium">Ready to dispatch emails</div>
                </div>
                <button
                  type="button"
                  onClick={disconnectGmail}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-background text-muted-foreground hover:text-foreground border border-border cursor-pointer transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <GoogleSignInButton
                onClick={connectGmail}
                isLoading={isConnecting}
                label="Connect Commission Gmail"
              />
            )}
          </div>
        </div>

        {lastSendError && (
          <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{lastSendError}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-2">
        <button
          type="button"
          onClick={() => setSubTab('broadcast')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            subTab === 'broadcast'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          1. Broadcast Certified Election Results
        </button>
        <button
          type="button"
          onClick={() => setSubTab('passcards')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            subTab === 'passcards'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          2. Dispatch Voter Password Passcards
        </button>
      </div>

      {/* SUBTAB 1: BROADCAST ELECTION OUTCOMES */}
      {subTab === 'broadcast' && (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Column: Settings and Target Audience */}
          <div className="lg:col-span-7 space-y-5">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                <Send className="h-4 w-4 text-primary" />
                <span>Results Broadcast Configuration</span>
              </h3>

              {/* Target Audience */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Target Recipient Cohort
                </label>
                <div className="grid sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetAudience('all')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      targetAudience === 'all'
                        ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary'
                        : 'border-border bg-background text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    <div className="font-bold text-xs">All Registered Students</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {users.length + accreditationList.length} verified Kabarak emails
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetAudience('custom')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      targetAudience === 'custom'
                        ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary'
                        : 'border-border bg-background text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    <div className="font-bold text-xs">Test / Single Recipient</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Send test bulletin to a specific email
                    </div>
                  </button>
                </div>

                {targetAudience === 'custom' && (
                  <div className="mt-3">
                    <input
                      type="email"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="e.g. verve.n.co.ke@gmail.com or student@kabarak.ac.ke"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Statutory Declaration Statement */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Statutory Commission Declaration
                </label>
                <textarea
                  rows={3}
                  value={declarationStatement}
                  onChange={(e) => setDeclarationStatement(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="px-4 py-2.5 rounded-xl border border-border bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Preview Email Bulletin</span>
                </button>

                <button
                  type="button"
                  disabled={!isGmailConnected || recipientsList.length === 0 || isSending}
                  onClick={() => setShowConfirmModal(true)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-ink hover:bg-primary text-ink-foreground text-xs font-semibold shadow-pop inline-flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>
                    {isSending
                      ? 'Dispatching via Gmail...'
                      : `Broadcast to ${recipientsList.length} Student(s)`}
                  </span>
                </button>
              </div>

              {!isGmailConnected && (
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  Please click <strong>"Connect Commission Gmail"</strong> above to enable live message delivery.
                </p>
              )}
            </div>

            {/* Send Progress Log */}
            {sendProgress && (
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Dispatch Progress</span>
                  <span className="font-mono">
                    {sendProgress.success} / {sendProgress.total} Successful
                  </span>
                </div>

                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{
                      width: `${Math.round(
                        ((sendProgress.success + sendProgress.failed) / (sendProgress.total || 1)) * 100
                      )}%`,
                    }}
                  />
                </div>

                <div className="rounded-xl bg-secondary/50 p-3 max-h-36 overflow-y-auto space-y-1 font-mono text-[11px] text-muted-foreground">
                  {sendProgress.logs.map((log, idx) => (
                    <div key={idx} className="truncate">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Bulletin Summary */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <span className="eyebrow text-primary text-[10px]">Current Certified Tally</span>
              <h3 className="font-display text-sm font-bold text-foreground">
                Executive Winner Line-Up
              </h3>

              <div className="grid grid-cols-3 gap-2 py-2 border-y border-border">
                <div className="text-center p-2 rounded-lg bg-secondary/40">
                  <div className="text-base font-extrabold text-foreground">{votes.length}</div>
                  <div className="text-[10px] uppercase text-muted-foreground font-semibold">Votes</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-secondary/40">
                  <div className="text-base font-extrabold text-foreground">{totalRegistered}</div>
                  <div className="text-[10px] uppercase text-muted-foreground font-semibold">Registered</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-secondary/40">
                  <div className="text-base font-extrabold text-primary">{turnoutPct}%</div>
                  <div className="text-[10px] uppercase text-muted-foreground font-semibold">Turnout</div>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                {officeWinners.map((ow, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 text-xs border border-border/50"
                  >
                    <div>
                      <div className="font-bold text-foreground">{ow.winnerName}</div>
                      <div className="text-[10px] text-muted-foreground">{ow.officeTitle}</div>
                    </div>
                    <div className="text-right font-mono font-bold text-primary">
                      {ow.winnerVotes} ({ow.winnerPct}%)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: VOTER AUTH PASSCARD DISPATCH */}
      {subTab === 'passcards' && (
        <div className="max-w-2xl mx-auto rounded-2xl border border-border bg-card p-6 space-y-5">
          <div>
            <h3 className="font-display text-base font-bold text-foreground">
              Send Student Authentication Passcard
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Directly dispatch a secured voter account password to any accredited Kabarak pharmacy student email.
            </p>
          </div>

          {passcardStatus && (
            <div
              className={`p-3 rounded-xl text-xs font-medium border ${
                passcardStatus.startsWith('✓')
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-destructive/10 text-destructive border-destructive/20'
              }`}
            >
              {passcardStatus}
            </div>
          )}

          <form onSubmit={handleSendPasscard} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Student Full Name
              </label>
              <input
                type="text"
                required
                value={passcardStudentName}
                onChange={(e) => setPasscardStudentName(e.target.value)}
                placeholder="e.g. Cynthia Moraa"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Kabarak Student Email
              </label>
              <input
                type="email"
                required
                value={passcardEmail}
                onChange={(e) => setPasscardEmail(e.target.value)}
                placeholder="e.g. cmoraa23@kabarak.ac.ke"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Year of Study
                </label>
                <select
                  value={passcardYear}
                  onChange={(e) => setPasscardYear(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary outline-none"
                >
                  <option value="Year 1">Year 1</option>
                  <option value="Year 2">Year 2</option>
                  <option value="Year 3">Year 3</option>
                  <option value="Year 4">Year 4</option>
                  <option value="Year 5">Year 5</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Secret Passkey
                </label>
                <input
                  type="text"
                  required
                  value={passcardPassword}
                  onChange={(e) => setPasscardPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground font-mono focus:border-primary outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!isGmailConnected || isSendingPasscard}
              className="w-full py-3 rounded-xl bg-ink hover:bg-primary text-ink-foreground text-xs font-semibold shadow-pop inline-flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <Mail className="h-4 w-4" />
              <span>
                {isSendingPasscard
                  ? 'Transmitting via Gmail...'
                  : 'Send Official Passcard via Gmail'}
              </span>
            </button>
          </form>
        </div>
      )}

      {/* CONFIRMATION DIALOG (Mandatory for Destructive / Send Operations) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border-2 border-ink rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div>
              <h4 className="font-display text-lg font-bold text-foreground">
                Confirm Election Results Broadcast
              </h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                You are about to transmit the official certified results bulletin to{' '}
                <strong className="text-foreground">{recipientsList.length} recipient(s)</strong>{' '}
                using your connected Gmail account (<strong>{googleUser?.email}</strong>).
              </p>
            </div>

            <div className="rounded-xl border border-border bg-secondary/40 p-3 text-xs space-y-1">
              <div className="flex justify-between text-muted-foreground">
                <span>Total Ballots Included:</span>
                <span className="font-mono font-bold text-foreground">{votes.length}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Total Offices Certified:</span>
                <span className="font-mono font-bold text-foreground">{officeWinners.length}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Route:</span>
                <span className="font-mono font-bold text-emerald-600">Google Gmail API</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-foreground hover:bg-secondary text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBroadcast}
                className="flex-1 py-2.5 rounded-xl bg-ink hover:bg-primary text-ink-foreground text-xs font-semibold shadow-pop cursor-pointer transition-all"
              >
                Confirm & Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border-2 border-ink rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="eyebrow text-primary text-[10px]">Email Dispatch Preview</span>
                <h4 className="font-display text-base font-bold text-foreground">
                  Official Results Declaration Bulletin
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-4 pr-1 text-xs">
              <div className="p-3 bg-secondary/40 rounded-xl space-y-1 font-mono text-[11px]">
                <div><strong>Subject:</strong> OFFICIAL GAZETTEMENT: 2026 KUPSA Election Certified Results</div>
                <div><strong>From:</strong> KUPSA Electoral Commission &lt;{googleUser?.email || 'elections@kabarak.ac.ke'}&gt;</div>
                <div><strong>To:</strong> {recipientsList.slice(0, 3).join(', ')} {recipientsList.length > 3 ? `(+${recipientsList.length - 3} more)` : ''}</div>
              </div>

              <div className="p-4 border rounded-xl bg-background space-y-3">
                <div className="text-center py-2 border-b">
                  <div className="font-display font-bold text-base">KUPSA Electoral Commission</div>
                  <div className="text-[11px] text-primary font-bold">2026 GENERAL ELECTION RESULTS GAZETTEMENT</div>
                </div>

                <p className="italic text-stone-600 bg-amber-50/50 p-2.5 rounded border border-amber-200/60">
                  "{declarationStatement}"
                </p>

                <div className="space-y-1.5">
                  <div className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Certified Winners</div>
                  {officeWinners.map((ow, i) => (
                    <div key={i} className="flex justify-between py-1 border-b border-border/40 text-xs">
                      <span><strong>{ow.officeTitle}:</strong> {ow.winnerName}</span>
                      <span className="font-mono text-primary font-bold">{ow.winnerVotes} votes ({ow.winnerPct}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 rounded-xl bg-ink text-ink-foreground text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
