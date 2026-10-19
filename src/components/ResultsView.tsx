import React, { useState } from 'react';
import { ViewId, OfficeResult } from '../types';
import { OFFICE_RESULTS, TURNOUT_METRICS } from '../data/election';
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
  X
} from 'lucide-react';

interface ResultsViewProps {
  onNavigate: (view: ViewId) => void;
  onOpenAudit?: () => void;
}

export function ResultsView({ onNavigate, onOpenAudit }: ResultsViewProps) {
  const [selectedOffice, setSelectedOffice] = useState<string>('all');
  const [searchReceipt, setSearchReceipt] = useState('');
  const [receiptVerificationResult, setReceiptVerificationResult] = useState<string | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState<OfficeResult | null>(null);

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

  return (
    <>
      <PageIntro eyebrow="Results · Preview" title="Who students chose">
        Sample results showing how the final declaration page operates. Each result tally is witnessed and signed off by candidate agents before announcement.
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

          {/* Audit Dossier CTA */}
          {onOpenAudit && (
            <button
              onClick={onOpenAudit}
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-ink hover:text-ink-foreground transition-colors shrink-0"
            >
              <FileCheck className="h-4 w-4 text-primary" />
              <span>Commission Audit Dossier</span>
            </button>
          )}
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
                  <span className="rounded-full bg-secondary border border-border px-3 py-1 text-xs font-semibold text-foreground shrink-0">
                    {r.status}
                  </span>
                </div>

                {/* Candidate Tallies */}
                <ul className="mt-6 space-y-4">
                  {r.candidateTallies.map((c) => (
                    <li key={c.candidateId}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="flex items-center gap-2 font-medium text-foreground">
                          {c.isWinner && (
                            <Trophy className="h-4 w-4 text-primary shrink-0" />
                          )}
                          <span className={c.isWinner ? 'font-bold' : ''}>{c.candidateName}</span>
                          {c.isWinner && (
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                              Winner
                            </span>
                          )}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground font-semibold">
                          {c.votes.toLocaleString()} votes · {c.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            c.isWinner ? 'bg-brand' : 'bg-ink/30'
                          }`}
                          style={{ width: `${c.percentage}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card Footer: Agent Signoffs & Certificate trigger */}
              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                  <span>
                    {r.agentSignoffs.filter((a) => a.signed).length} of {r.agentSignoffs.length} agents signed
                  </span>
                  <span>· {r.spoiltOrBlanks} spoilt</span>
                </span>
                <button
                  onClick={() => setShowCertificateModal(r)}
                  className="font-mono text-primary font-semibold hover:underline"
                >
                  View Certificate →
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Turnout by Cohort Year */}
        <section className="rounded-2xl border-2 border-border bg-card p-6 sm:p-8 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
            <div>
              <h3 className="font-display text-2xl font-semibold text-foreground">
                Turnout by academic cohort
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Voter participation breakdown by year of pharmacy study
              </p>
            </div>
            <span className="font-mono text-xs text-primary font-semibold">
              Dean's Roll Verification
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {t.turnoutByCohort.map((c) => (
              <div
                key={c.year}
                className="grid grid-cols-[8rem_1fr_4rem] sm:grid-cols-[14rem_1fr_4.5rem] items-center gap-4 text-sm"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-foreground text-xs sm:text-sm">{c.year}</span>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {c.voted} / {c.registered} voted
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="bg-brand h-full rounded-full transition-all duration-500"
                    style={{ width: `${c.percentage}%` }}
                  />
                </div>
                <span className="text-right font-mono font-semibold text-xs sm:text-sm text-foreground">
                  {c.percentage.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Receipt Verification Tool */}
        <section className="rounded-2xl border-2 border-ink bg-card p-6 sm:p-8 shadow-pop">
          <div className="max-w-2xl space-y-2">
            <span className="eyebrow text-primary">Cryptographic Audit</span>
            <h3 className="font-display text-2xl font-semibold text-foreground">
              Verify your balloting receipt
            </h3>
            <p className="text-sm text-muted-foreground">
              Check if your anonymous voting token hash is accounted for in the certified tally ledger.
            </p>

            <form onSubmit={handleVerifyReceipt} className="mt-4 flex flex-col sm:flex-row gap-3">
              <input
                value={searchReceipt}
                onChange={(e) => setSearchReceipt(e.target.value)}
                placeholder="Paste receipt code or hash proof..."
                className="flex-1 rounded-xl border-2 border-border bg-background px-4 py-2.5 font-mono text-xs outline-none focus:border-ink"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-xs font-semibold text-ink-foreground hover:bg-primary transition-colors shrink-0"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Verify Proof</span>
              </button>
            </form>

            {receiptVerificationResult === 'CONFIRMED_VALID' && (
              <div className="mt-4 rounded-xl bg-success/10 border border-success/30 p-4 text-success text-xs font-mono flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">RECEIPT VERIFIED & RECORDED</p>
                  <p className="mt-1 text-foreground/80 font-sans">
                    This encrypted ballot was validated in the virtual ballot box at block #2026-NOV. Zero identity disclosure.
                  </p>
                </div>
              </div>
            )}

            {receiptVerificationResult === 'INVALID_HASH' && (
              <div className="mt-4 rounded-xl bg-destructive/10 border border-destructive/30 p-4 text-destructive text-xs font-mono animate-in fade-in">
                Receipt code not found in current certified batch. Ensure the code begins with KUPSA-2026.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Certificate Modal */}
      {showCertificateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-xs p-4"
          onClick={() => setShowCertificateModal(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border-2 border-ink bg-card p-6 sm:p-8 shadow-pop animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <span className="bg-brand flex h-12 w-12 items-center justify-center rounded-2xl text-ink shadow-xs">
                  <Award className="h-6 w-6" />
                </span>
                <div>
                  <span className="eyebrow text-primary">Certificate of Results</span>
                  <h3 className="font-display text-2xl font-semibold text-foreground">
                    {showCertificateModal.officeTitle}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowCertificateModal(null)}
                className="rounded-full p-2 hover:bg-secondary text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4 text-sm">
              <div className="rounded-xl bg-secondary/50 p-4 border border-border">
                <p className="font-mono text-xs text-muted-foreground">Certified Winner:</p>
                <p className="font-display text-xl font-bold text-foreground mt-0.5">
                  {showCertificateModal.candidateTallies.find((c) => c.isWinner)?.candidateName ?? 'Declared Majority'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Received {showCertificateModal.candidateTallies.find((c) => c.isWinner)?.votes} votes (
                  {showCertificateModal.candidateTallies.find((c) => c.isWinner)?.percentage.toFixed(1)}%) of valid votes cast.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground text-xs uppercase font-mono tracking-wider mb-2">
                  Agent Signoffs:
                </h4>
                <div className="space-y-1.5">
                  {showCertificateModal.agentSignoffs.map((a) => (
                    <div
                      key={a.agentName}
                      className="flex items-center justify-between text-xs rounded-lg border border-border p-2.5 bg-background"
                    >
                      <span>
                        {a.agentName} <span className="text-muted-foreground">({a.candidateName})</span>
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-success font-mono text-[11px]">
                        <CheckCircle2 className="h-3.5 w-3.5" /> SIGNED & ATTESTED
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-border flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-ink py-2.5 text-xs font-semibold text-foreground hover:bg-secondary"
              >
                <Printer className="h-4 w-4" />
                <span>Print Declaration</span>
              </button>
              <button
                onClick={() => setShowCertificateModal(null)}
                className="rounded-xl bg-ink px-6 py-2.5 text-xs font-semibold text-ink-foreground hover:bg-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
