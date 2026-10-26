import React, { useState, useEffect, useMemo } from 'react';
import { useVotingStore } from '../context/VotingStore';
import { SHARED_OFFICES, SHARED_CANDIDATES } from '../data/candidateData';
import {
  fetchSmtpStatus,
  triggerTestSmtp,
  dispatchVoterPassEmail,
  dispatchResultsGazetteEmail,
  dispatchNoticeEmail,
} from '../lib/electionService';
import {
  Mail,
  Send,
  CheckCircle2,
  AlertTriangle,
  Eye,
  RefreshCw,
  Server,
  FileText,
  Calendar,
  QrCode,
  ShieldCheck,
  X,
  Check
} from 'lucide-react';

export function GmailBroadcastPanel() {
  const {
    votes,
    totalRegistered,
    users,
    accreditationList,
    dbOffices,
    dbCandidates,
  } = useVotingStore();

  // Active sub-section
  const [subTab, setSubTab] = useState<'broadcast' | 'passcards' | 'gazette-notice'>('broadcast');

  // SMTP Driver Status
  const [smtpStatus, setSmtpStatus] = useState<{
    configured: boolean;
    user?: string;
    host?: string;
    port?: number;
    hasPassword?: boolean;
    from?: string;
  } | null>(null);
  const [isCheckingSmtp, setIsCheckingSmtp] = useState(false);
  const [testSmtpResult, setTestSmtpResult] = useState<{ success: boolean; message: string } | null>(null);

  // Broadcast settings
  const [targetAudience, setTargetAudience] = useState<'all' | 'custom'>('all');
  const [customEmail, setCustomEmail] = useState('');
  const [declarationStatement, setDeclarationStatement] = useState(
    'Pursuant to Article 45 of the KUPSA Constitution, the Independent Electoral Commission officially declares and gazettes the certified general election outcomes as free, fair, credible, and conclusive.'
  );

  // Confirmation modal state
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

  // Single passcard state
  const [passcardStudentName, setPasscardStudentName] = useState('');
  const [passcardEmail, setPasscardEmail] = useState('');
  const [passcardRegNo, setPasscardRegNo] = useState('PHARM/2026/0142');
  const [passcardYear, setPasscardYear] = useState('Year 3');
  const [passcardPassword, setPasscardPassword] = useState('KUP-2026');
  const [passcardStatus, setPasscardStatus] = useState<string | null>(null);
  const [isSendingPasscard, setIsSendingPasscard] = useState(false);

  // Commission Notice state
  const [noticeHeadline, setNoticeHeadline] = useState('Official Polling Station Check-in Directives');
  const [noticeBody, setNoticeBody] = useState(
    'All accredited pharmacy scholars are notified that official online voting opens at 08:00 EAT for the School of Pharmacy, Kabarak University. Online e-balloting remains accessible 24/7 on this portal.'
  );
  const [noticeUrgency, setNoticeUrgency] = useState<'routine' | 'urgent' | 'critical'>('urgent');
  const [noticeRecipient, setNoticeRecipient] = useState('');
  const [noticeStatus, setNoticeStatus] = useState<string | null>(null);
  const [isSendingNotice, setIsSendingNotice] = useState(false);

  // Load SMTP status on mount
  const checkSmtp = async () => {
    setIsCheckingSmtp(true);
    try {
      const status = await fetchSmtpStatus();
      setSmtpStatus(status);
    } catch {
      setSmtpStatus({ configured: false });
    } finally {
      setIsCheckingSmtp(false);
    }
  };

  useEffect(() => {
    checkSmtp();
  }, []);

  const handleTestSmtp = async () => {
    setIsCheckingSmtp(true);
    setTestSmtpResult(null);
    try {
      const res = await triggerTestSmtp();
      setTestSmtpResult(res);
      await checkSmtp();
    } catch (err: any) {
      setTestSmtpResult({ success: false, message: err.message || 'SMTP test handshake failed' });
    } finally {
      setIsCheckingSmtp(false);
    }
  };

  // Dynamic offices and candidates
  const effectiveOffices = useMemo(() => {
    return dbOffices.length > 0 ? dbOffices : SHARED_OFFICES;
  }, [dbOffices]);

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

  // Calculate office winners from current votes
  const officeWinners = useMemo(() => {
    return effectiveOffices.map((office) => {
      const officeCandidates = effectiveCandidates.filter((c) => c.officeId === office.id);
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
  }, [effectiveOffices, effectiveCandidates, votes]);

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

  // Handle Send Results Broadcast via Nodemailer SMTP
  const handleSendBroadcast = async () => {
    setShowConfirmModal(false);
    if (recipientsList.length === 0) return;

    setIsSending(true);
    setSendProgress({
      total: recipientsList.length,
      current: 0,
      success: 0,
      failed: 0,
      logs: [`Initiating official broadcast to ${recipientsList.length} recipient(s) via Nodemailer SSL (Port 465)...`],
    });

    try {
      let successCount = 0;
      let failCount = 0;
      const newLogs: string[] = [];

      for (let i = 0; i < recipientsList.length; i++) {
        const recEmail = recipientsList[i];
        const res = await dispatchResultsGazetteEmail({
          recipientEmail: recEmail,
          declarationStatement,
          officesSummary: officeWinners,
          totalVotes: votes.length,
          totalRegistered,
          turnoutPct,
        });

        if (res.success) {
          successCount++;
          newLogs.push(`[${i + 1}/${recipientsList.length}] ✓ Dispatched to ${recEmail} (Outbox ID: ${res.outboxId})`);
        } else {
          failCount++;
          newLogs.push(`[${i + 1}/${recipientsList.length}] ✗ Failed for ${recEmail}: ${res.error}`);
        }

        setSendProgress({
          total: recipientsList.length,
          current: i + 1,
          success: successCount,
          failed: failCount,
          logs: newLogs,
        });
      }
    } catch (err: any) {
      setSendProgress((prev) => ({
        total: recipientsList.length,
        current: prev?.current || 0,
        success: prev?.success || 0,
        failed: recipientsList.length,
        logs: [...(prev?.logs || []), `Fatal dispatch error: ${err.message}`],
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

    try {
      const res = await dispatchVoterPassEmail({
        studentName: passcardStudentName.trim() || 'Accredited Student',
        email: passcardEmail.trim().toLowerCase(),
        regNo: passcardRegNo.trim(),
        yearOfStudy: passcardYear,
        passwordCode: passcardPassword.trim(),
        pollingStation: 'School of Pharmacy, Kabarak University',
      });

      if (res.success) {
        setPasscardStatus(
          `✓ Official Voter Pass (with PDF passcard and .ics calendar invite) successfully queued & sent to ${passcardEmail} (Outbox ID: ${res.outboxId})`
        );
      } else {
        setPasscardStatus(`✗ Error: ${res.error}`);
      }
    } catch (err: any) {
      setPasscardStatus(`✗ Unexpected error: ${err.message}`);
    } finally {
      setIsSendingPasscard(false);
    }
  };

  // Commission Notice dispatch
  const handleSendNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    const recipient = noticeRecipient.trim() || customEmail.trim() || (recipientsList[0] || 'verve.n.co.ke@gmail.com');
    setIsSendingNotice(true);
    setNoticeStatus(null);

    try {
      const res = await dispatchNoticeEmail({
        recipientEmail: recipient,
        headline: noticeHeadline,
        bodyText: noticeBody,
        urgency: noticeUrgency,
      });

      if (res.success) {
        setNoticeStatus(`✓ Gazette Notice queued and dispatched to ${recipient} (Outbox ID: ${res.outboxId})`);
      } else {
        setNoticeStatus(`✗ Failed to dispatch notice: ${res.error}`);
      }
    } catch (err: any) {
      setNoticeStatus(`✗ Error: ${err.message}`);
    } finally {
      setIsSendingNotice(false);
    }
  };

  const isSmtpReady = Boolean(smtpStatus?.configured && smtpStatus?.hasPassword);

  return (
    <div className="space-y-6">
      {/* Commission Autonomous Dispatch Engine Plaque */}
      <div className="rounded-2xl border-2 border-ink bg-card p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-ink border-2 border-sun text-white shrink-0">
              <Mail className="h-6 w-6 text-sun" />
              {isSmtpReady && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 border-2 border-card">
                  <Check className="h-2.5 w-2.5 text-white" />
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  Autonomous Email Dispatch System
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isSmtpReady
                      ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-800 border border-amber-500/30'
                  }`}
                >
                  {isSmtpReady ? 'SMTP DRIVER OPERATIONAL' : 'SMTP CONFIGURATION PENDING'}
                </span>
              </div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Official Commission Dispatch Engine
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Transactional Outbox architecture with Nodemailer SSL driver (Port 465) for guaranteed voter passcard & results delivery.
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2 bg-secondary/80 px-3.5 py-2 rounded-xl border border-border">
            <Server className="h-4 w-4 text-primary" />
            <span className="text-xs font-mono font-bold text-foreground">SSL Port 465 Active</span>
          </div>
        </div>

        {/* Diagnostic SMTP Card */}
        <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-foreground">Driver:</span>
              <span className="font-mono text-muted-foreground">
                {smtpStatus?.host || 'smtp.gmail.com'}:{smtpStatus?.port || 465} (SSL)
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="font-bold text-foreground">Sender:</span>
              <span className="font-mono text-primary font-semibold">
                {smtpStatus?.user || 'verve.n.co.ke@gmail.com'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isCheckingSmtp}
                onClick={handleTestSmtp}
                className="px-3 py-1 rounded-lg bg-background border border-border hover:bg-secondary text-foreground text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${isCheckingSmtp ? 'animate-spin' : ''}`} />
                <span>Test SMTP Handshake</span>
              </button>
            </div>
          </div>

          {testSmtpResult && (
            <div
              className={`p-2.5 rounded-lg text-xs font-mono border ${
                testSmtpResult.success
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}
            >
              {testSmtpResult.message}
            </div>
          )}
        </div>
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
          2. Dispatch Official Voter Pass (PDF + QR + ICS)
        </button>
        <button
          type="button"
          onClick={() => setSubTab('gazette-notice')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            subTab === 'gazette-notice'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          3. Commission Gazette Directives & Notices
        </button>
      </div>

      {/* SUBTAB 1: BROADCAST CERTIFIED RESULTS */}
      {subTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-5">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div>
                <h3 className="font-display text-sm font-bold text-foreground">
                  Official Election Outcome Broadcast
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sends formatted election outcomes with winner tallies, voter turnout, and returning officer declaration.
                </p>
              </div>

              {/* Recipient Audience Selection */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">
                  Target Audience
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetAudience('all')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      targetAudience === 'all'
                        ? 'border-primary bg-primary/10 text-primary font-bold'
                        : 'border-border bg-background text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    <div className="font-bold text-xs">All Registered Students</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {users.length || totalRegistered} student accounts
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetAudience('custom')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      targetAudience === 'custom'
                        ? 'border-primary bg-primary/10 text-primary font-bold'
                        : 'border-border bg-background text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    <div className="font-bold text-xs">Custom / Test Recipient</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Single verified email</div>
                  </button>
                </div>
              </div>

              {targetAudience === 'custom' && (
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Recipient Email Address
                  </label>
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="e.g. egathungu@kabarak.ac.ke"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary outline-none"
                  />
                </div>
              )}

              {/* Statutory Statement */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Commission Gazettement Statement
                </label>
                <textarea
                  rows={3}
                  value={declarationStatement}
                  onChange={(e) => setDeclarationStatement(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2 border-t border-border">
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
                  disabled={!isSmtpReady || recipientsList.length === 0 || isSending}
                  onClick={() => setShowConfirmModal(true)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-ink hover:bg-primary text-ink-foreground text-xs font-semibold shadow-pop inline-flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>
                    {isSending
                      ? 'Dispatching via Outbox...'
                      : `Broadcast to ${recipientsList.length} Student(s)`}
                  </span>
                </button>
              </div>

              {!isSmtpReady && (
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  SMTP driver configuration pending. Please verify credentials in server environment.
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

              <div className="space-y-2 pt-1">
                {officeWinners.map((ow, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-border bg-secondary/30 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-foreground">{ow.officeTitle}</div>
                      <div className="font-display text-primary font-bold text-sm mt-0.5">
                        {ow.winnerName}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-foreground text-xs">{ow.winnerVotes}</span>
                      <span className="text-muted-foreground text-[10px] block">
                        ({ow.winnerPct}% tally)
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>Total Turnout:</span>
                <span className="font-bold text-foreground">
                  {votes.length} ballots ({turnoutPct}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: INDIVIDUAL VOTER PASSCARD DISPATCH */}
      {subTab === 'passcards' && (
        <div className="max-w-2xl mx-auto rounded-2xl border border-border bg-card p-6 space-y-5">
          <div>
            <h3 className="font-display text-base font-bold text-foreground">
              Direct Voter Pass Dispatch (PDF + QR Code + Calendar Invite)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Generates and emails an official voter pass with embedded security barcodes and .ics calendar synchronization.
            </p>
          </div>

          {passcardStatus && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                passcardStatus.startsWith('✓')
                  ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/30'
                  : 'bg-destructive/10 text-destructive border-destructive/30'
              }`}
            >
              {passcardStatus.startsWith('✓') ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
              )}
              <span className="leading-relaxed">{passcardStatus}</span>
            </div>
          )}

          <form onSubmit={handleSendPasscard} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Student Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Joy Chebet"
                  value={passcardStudentName}
                  onChange={(e) => setPasscardStudentName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Official Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. jchebet@kabarak.ac.ke"
                  value={passcardEmail}
                  onChange={(e) => setPasscardEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary outline-none"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Registration Number
                </label>
                <input
                  type="text"
                  value={passcardRegNo}
                  onChange={(e) => setPasscardRegNo(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground font-mono focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Cohort / Year
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
                  Credential Passcard Code
                </label>
                <input
                  type="text"
                  value={passcardPassword}
                  onChange={(e) => setPasscardPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground font-mono focus:border-primary outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!isSmtpReady || isSendingPasscard}
              className="w-full py-3 rounded-xl bg-ink hover:bg-primary text-ink-foreground text-xs font-semibold shadow-pop inline-flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <Mail className="h-4 w-4" />
              <span>
                {isSendingPasscard
                  ? 'Compiling PDF & Dispatching...'
                  : 'Dispatch Official Voter Passcard (Port 465 SSL)'}
              </span>
            </button>
          </form>
        </div>
      )}

      {/* SUBTAB 3: COMMISSION GAZETTE DIRECTIVES */}
      {subTab === 'gazette-notice' && (
        <div className="max-w-2xl mx-auto rounded-2xl border border-border bg-card p-6 space-y-5">
          <div>
            <h3 className="font-display text-base font-bold text-foreground">
              Broadcast Commission Gazette Notice
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Send immediate statutory directives, nomination announcements, or polling hours notices to student inboxes.
            </p>
          </div>

          {noticeStatus && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                noticeStatus.startsWith('✓')
                  ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/30'
                  : 'bg-destructive/10 text-destructive border-destructive/30'
              }`}
            >
              <span className="leading-relaxed">{noticeStatus}</span>
            </div>
          )}

          <form onSubmit={handleSendNotice} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Urgency Classification
                </label>
                <select
                  value={noticeUrgency}
                  onChange={(e: any) => setNoticeUrgency(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary outline-none"
                >
                  <option value="routine">Routine Gazette Notice</option>
                  <option value="urgent">Urgent Commission Directive</option>
                  <option value="critical">Critical Constitutional Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Recipient Email (or blank for default)
                </label>
                <input
                  type="email"
                  value={noticeRecipient}
                  onChange={(e) => setNoticeRecipient(e.target.value)}
                  placeholder="verve.n.co.ke@gmail.com"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Directive Headline
              </label>
              <input
                type="text"
                required
                value={noticeHeadline}
                onChange={(e) => setNoticeHeadline(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Directive Body
              </label>
              <textarea
                rows={4}
                required
                value={noticeBody}
                onChange={(e) => setNoticeBody(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary outline-none resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={!isSmtpReady || isSendingNotice}
              className="w-full py-3 rounded-xl bg-ink hover:bg-primary text-ink-foreground text-xs font-semibold shadow-pop inline-flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <Send className="h-4 w-4" />
              <span>
                {isSendingNotice
                  ? 'Dispatching Directive...'
                  : 'Dispatch Statutory Notice (Port 465 SSL)'}
              </span>
            </button>
          </form>
        </div>
      )}

      {/* CONFIRMATION DIALOG */}
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
                using the <strong className="text-primary">Nodemailer SSL Driver</strong>.
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
                <span>Delivery Driver:</span>
                <span className="font-mono font-bold text-emerald-600">
                  Transactional Outbox + Nodemailer SSL (Port 465)
                </span>
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
                onClick={handleSendBroadcast}
                className="flex-1 py-2.5 rounded-xl bg-ink hover:bg-primary text-ink-foreground text-xs font-semibold shadow-xs cursor-pointer transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Confirm & Send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW BULLETIN MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border-2 border-ink rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h4 className="font-display text-sm font-bold text-foreground">
                  Official Gazette Email Preview
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-2xl border-2 border-border bg-background p-5 space-y-4 text-xs font-sans">
              <div className="text-center space-y-1 pb-3 border-b border-border">
                <span className="text-[10px] font-mono uppercase font-bold text-primary tracking-widest">
                  Kabarak University Pharmacy Students Association
                </span>
                <h3 className="font-display text-base font-bold text-foreground">
                  OFFICIAL GAZETTE OF ELECTION RESULTS
                </h3>
                <p className="text-[11px] text-muted-foreground font-mono">
                  Certified Outcomes · Term 2026/2027
                </p>
              </div>

              <div className="bg-secondary/40 p-3 rounded-xl border border-border/80 text-[11px] leading-relaxed italic text-foreground">
                "{declarationStatement}"
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground">
                  Declared Executive Winners:
                </span>
                {officeWinners.map((ow, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-border bg-secondary/20 flex justify-between items-center text-xs"
                  >
                    <div>
                      <span className="text-muted-foreground text-[10px] block">{ow.officeTitle}</span>
                      <strong className="text-foreground">{ow.winnerName}</strong>
                    </div>
                    <span className="font-mono text-primary font-bold">
                      {ow.winnerVotes} votes ({ow.winnerPct}%)
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-border flex justify-between text-[11px] font-mono text-muted-foreground">
                <span>Voter Turnout:</span>
                <span className="font-bold text-foreground">
                  {votes.length} cast / {turnoutPct}%
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPreviewModal(false)}
              className="w-full py-2.5 rounded-xl bg-ink text-ink-foreground text-xs font-semibold cursor-pointer hover:bg-primary transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
