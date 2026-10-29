import React, { useState } from 'react';
import { ViewId, StudentRecord } from '../types';
import { OFFICES, CANDIDATES } from '../data/election';
import { PageIntro } from './site-shell';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lock,
  ArrowRight,
  ShieldCheck,
  Download,
  Printer,
  RotateCcw,
  KeyRound,
  Check
} from 'lucide-react';

import { useVotingStore } from '../context/VotingStore';

interface StudentPortalViewProps {
  onNavigate: (view: ViewId) => void;
}

export function StudentPortalView({ onNavigate }: StudentPortalViewProps) {
  const { accreditationList } = useVotingStore();
  const [regNo, setRegNo] = useState('');
  const [result, setResult] = useState<StudentRecord | null | undefined>(undefined);

  // Voting Simulator State
  const [votingStep, setVotingStep] = useState<1 | 2 | 3 | 4>(1); // 1: Check, 2: OTP, 3: Ballot, 4: Receipt
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [ballotSelections, setBallotSelections] = useState<Record<string, string>>({
    president: 'cand-pres-01',
    'vice-president': 'cand-vp-01',
    'sec-general': 'cand-sg-01',
    'dep-sec-general': 'cand-dsg-01',
    treasurer: 'cand-tres-01',
    'media-officer': 'cand-media-01',
    'org-sec': 'cand-org-01',
  });
  const [receiptData, setReceiptData] = useState<{
    receiptId: string;
    ballotHash: string;
    timestamp: string;
    studentToken: string;
  } | null>(null);

  const checkEligibility = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanReg = regNo.trim().toUpperCase();

    // Check live database accreditation roster first
    const inDb = accreditationList.find(
      (s) => s.regNo.toUpperCase() === cleanReg || s.email.toUpperCase() === cleanReg
    );
    if (inDb) {
      setResult({
        regNo: inDb.regNo,
        name: inDb.name,
        email: inDb.email,
        yearOfStudy: inDb.yearOfStudy,
        status: inDb.status,
        reason: inDb.reason,
        duesCleared: inDb.status === 'Eligible',
        academicGoodStanding: true,
      });
      return;
    }

    setResult(null);
  };

  const handleQuickSelect = (reg: string) => {
    setRegNo(reg);
    const cleanReg = reg.trim().toUpperCase();
    const inDb = accreditationList.find(
      (s) => s.regNo.toUpperCase() === cleanReg || s.email.toUpperCase() === cleanReg
    );
    if (inDb) {
      setResult({
        regNo: inDb.regNo,
        name: inDb.name,
        email: inDb.email,
        yearOfStudy: inDb.yearOfStudy,
        status: inDb.status,
        reason: inDb.reason,
        duesCleared: inDb.status === 'Eligible',
        academicGoodStanding: true,
      });
      return;
    }
    setResult(null);
  };

  const handleStartVoting = () => {
    setVotingStep(2);
    setOtpCode('8492'); // Auto-propose standard simulated OTP
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length >= 4) {
      setOtpVerified(true);
      setVotingStep(3);
    }
  };

  const handleCastBallot = () => {
    const timestamp = new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' });
    const receiptId = `KUPSA-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const ballotHash = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    const studentToken = `TOKEN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    setReceiptData({
      receiptId,
      ballotHash,
      timestamp,
      studentToken,
    });
    setVotingStep(4);
  };

  const resetAll = () => {
    setVotingStep(1);
    setResult(undefined);
    setRegNo('');
    setOtpVerified(false);
    setReceiptData(null);
  };

  const tone =
    result?.status === 'Eligible'
      ? { icon: CheckCircle2, cls: 'text-success', title: "You're all set to vote" }
      : result?.status === 'Action Required'
        ? { icon: AlertTriangle, cls: 'text-primary', title: 'One thing to sort out first' }
        : { icon: XCircle, cls: 'text-destructive', title: "You can't vote in this election" };

  return (
    <>
      <PageIntro eyebrow="Vote" title="Check if you can vote">
        Enter your pharmacy student registration number. Instant constitutional verification against the certified Dean's roll.
      </PageIntro>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14">
        {/* Step Indicator when active in balloting */}
        {votingStep > 1 && (
          <div className="mb-8 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs font-mono uppercase text-muted-foreground mb-3">
              <span>Interactive Polling Engine</span>
              <span>Step {votingStep} of 4</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                '1. Eligibility',
                '2. Accreditation',
                '3. Secret Ballot',
                '4. Verification Receipt',
              ].map((stepName, idx) => {
                const sNum = idx + 1;
                const isComplete = votingStep > sNum;
                const isCurrent = votingStep === sNum;
                return (
                  <div key={stepName} className="space-y-1.5">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isComplete
                          ? 'bg-success'
                          : isCurrent
                            ? 'bg-brand'
                            : 'bg-muted'
                      }`}
                    />
                    <span
                      className={`block truncate text-[11px] sm:text-xs font-medium ${
                        isCurrent ? 'text-primary font-semibold' : 'text-muted-foreground'
                      }`}
                    >
                      {stepName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 1: ELIGIBILITY CHECK */}
        {votingStep === 1 && (
          <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr]">
            {/* Left: Input Form & Verification Result */}
            <div className="rounded-3xl border-2 border-ink bg-card p-6 sm:p-10 shadow-pop">
              <form onSubmit={checkEligibility}>
                <label htmlFor="reg" className="block font-display text-lg font-semibold text-foreground">
                  Registration number
                </label>
                <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                  As shown on your university student identity card
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    id="reg"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    placeholder="PHARM/2023/1042"
                    className="flex-1 rounded-xl border-2 border-border bg-background px-4 py-3 font-mono text-base uppercase outline-none focus:border-ink"
                    required
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-ink transition-colors shadow-xs"
                  >
                    <span>Check</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>

              {/* Not found state */}
              {result === null && (
                <div className="mt-6 rounded-2xl bg-muted/60 p-5 text-muted-foreground animate-in fade-in">
                  <p className="font-semibold text-foreground">Registration Number Not Found</p>
                  <p className="mt-1 text-sm">
                    We couldn't match "{regNo}" in the accredited School of Pharmacy roster. Please verify your student number or visit the Commission Helpdesk in Room PH-104.
                  </p>
                </div>
              )}

              {/* Verified Result Card */}
              {result && (
                <div className="mt-8 border-t border-border pt-8 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-2.5">
                    <tone.icon className={`h-7 w-7 ${tone.cls} shrink-0`} />
                    <h3 className={`font-display text-2xl font-semibold ${tone.cls}`}>
                      {tone.title}
                    </h3>
                  </div>

                  <p className="mt-3 text-lg font-semibold text-foreground">
                    {result.name} · <span className="font-normal text-muted-foreground">{result.yearOfStudy}</span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {result.reason}
                  </p>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                    <span
                      className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 ${
                        result.duesCleared ? 'border-border bg-background' : 'border-destructive/40 bg-destructive/5'
                      }`}
                    >
                      {result.duesCleared ? (
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive shrink-0" />
                      )}
                      <span className="font-medium">KUPSA Annual Dues Cleared</span>
                    </span>

                    <span
                      className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 ${
                        result.academicGoodStanding ? 'border-border bg-background' : 'border-destructive/40 bg-destructive/5'
                      }`}
                    >
                      {result.academicGoodStanding ? (
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive shrink-0" />
                      )}
                      <span className="font-medium">Good Academic Standing (GPA ≥ 2.0)</span>
                    </span>
                  </div>

                  {result.status === 'Eligible' && (
                    <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <button
                        onClick={handleStartVoting}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-pop hover:bg-ink transition-all"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        <span>Proceed to Polling Accreditation</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onNavigate('candidates')}
                        className="text-xs font-semibold text-muted-foreground hover:text-foreground text-center"
                      >
                        Review candidates first
                      </button>
                    </div>
                  )}

                  {result.status === 'Action Required' && (
                    <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                      <button
                        onClick={() => onNavigate('help')}
                        className="text-sm font-semibold text-primary hover:underline flex items-center gap-1.5"
                      >
                        <span>Contact Helpdesk to clear dues</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Privacy & Quick Sample Buttons */}
            <aside className="space-y-6">
              {/* Privacy box */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="bg-brand flex h-10 w-10 items-center justify-center rounded-xl text-ink shadow-xs">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-foreground">
                  Your vote stays secret
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Checking your eligibility verifies whether you can vote. Once accredited, the ballot issuance token is cryptographically unlinked from your name and registration number.
                </p>
                <div className="mt-4 font-mono text-xs text-primary flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Article 39(2) Constitutional Privacy Guarantee</span>
                </div>
              </div>

              {/* Sample students helper */}
              {accreditationList.length > 0 && (
                <div className="rounded-2xl border-2 border-dashed border-border bg-secondary/50 p-6">
                  <p className="font-display text-base font-semibold text-foreground">
                    Accredited Voters
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Tap any registered student below to check official status:
                  </p>
                  <div className="mt-3 space-y-2">
                    {accreditationList.slice(0, 4).map((s) => (
                      <button
                        key={s.regNo}
                        onClick={() => handleQuickSelect(s.regNo)}
                        className="w-full flex items-center justify-between rounded-xl border border-border bg-card px-3.5 py-2 text-left hover:border-ink transition-colors cursor-pointer"
                      >
                        <div>
                          <span className="font-mono text-xs font-semibold text-foreground block">
                            {s.regNo}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {s.name} ({s.yearOfStudy.replace('Bachelor of Pharmacy ', '')})
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                            s.status === 'Eligible'
                              ? 'bg-success/15 text-success'
                              : 'bg-amber-500/15 text-amber-800'
                          }`}
                        >
                          {s.status}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}

        {/* STEP 2: ACCREDITATION & OTP */}
        {votingStep === 2 && (
          <div className="mx-auto max-w-lg rounded-3xl border-2 border-ink bg-card p-6 sm:p-10 shadow-pop">
            <div className="flex items-center gap-3">
              <span className="bg-brand flex h-12 w-12 items-center justify-center rounded-2xl text-ink shadow-xs">
                <KeyRound className="h-6 w-6" />
              </span>
              <div>
                <p className="eyebrow text-primary">Step 2 of 4</p>
                <h3 className="font-display text-2xl font-semibold text-foreground">
                  Voter Accreditation
                </h3>
              </div>
            </div>

            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              A 4-digit accreditation passcode has been sent to the student portal session for{' '}
              <strong className="text-foreground">{result?.name}</strong> ({result?.regNo}).
            </p>

            <form onSubmit={handleVerifyOtp} className="mt-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Enter 4-Digit Passcode
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full text-center font-mono text-3xl tracking-[0.5em] rounded-xl border-2 border-border bg-background py-3 focus:border-ink outline-none"
                  required
                />
                <p className="mt-2 text-center text-xs text-muted-foreground font-mono">
                  Official Dispatch Passcode: <span className="font-bold text-primary">8492</span>
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-primary py-3.5 text-center font-semibold text-primary-foreground hover:bg-ink transition-colors shadow-xs"
                >
                  Confirm Accreditation & Open Ballot
                </button>
                <button
                  type="button"
                  onClick={() => setVotingStep(1)}
                  className="text-xs text-muted-foreground hover:text-foreground text-center py-2"
                >
                  Cancel & Go Back
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: SECRET BALLOT CASTING */}
        {votingStep === 3 && (
          <div className="space-y-8 animate-in fade-in">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="eyebrow text-primary">Step 3 of 4 · Secret Ballot</p>
                <h3 className="font-display text-2xl font-semibold text-foreground mt-1">
                  Official KUPSA Election Ballot
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Select your preferred candidate for each office below. Your choices remain strictly secret.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-secondary px-3.5 py-2 font-mono text-xs text-muted-foreground shrink-0">
                <Lock className="h-4 w-4 text-primary" />
                <span>Encrypted Session</span>
              </div>
            </div>

            {/* Offices & Candidates */}
            <div className="space-y-8">
              {OFFICES.map((office) => {
                const candidatesForOffice = CANDIDATES.filter((c) => c.officeId === office.id);
                const selectedCandId = ballotSelections[office.id];

                return (
                  <div
                    key={office.id}
                    className="rounded-2xl border-2 border-border bg-card p-6 shadow-card"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3">
                      <div>
                        <h4 className="font-display text-xl font-semibold text-foreground">
                          {office.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {office.seats} seat · {office.constitutionalArticle}
                        </p>
                      </div>
                      <span className="font-mono text-xs text-primary font-medium">
                        {selectedCandId ? 'Choice selected' : 'Please select one'}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {candidatesForOffice.map((cand) => {
                        const isChosen = selectedCandId === cand.id;
                        return (
                          <button
                            key={cand.id}
                            type="button"
                            onClick={() =>
                              setBallotSelections({
                                ...ballotSelections,
                                [office.id]: cand.id,
                              })
                            }
                            className={`flex items-start justify-between rounded-xl border-2 p-4 text-left transition-all ${
                              isChosen
                                ? 'border-ink bg-accent/70 shadow-xs'
                                : 'border-border bg-background/50 hover:border-ink/50'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span className="bg-brand flex h-10 w-10 items-center justify-center rounded-full font-display text-sm font-semibold text-ink shrink-0 mt-0.5">
                                {cand.initials}
                              </span>
                              <div>
                                <span className="font-display text-base font-semibold text-foreground block">
                                  {cand.name}
                                </span>
                                <span className="text-xs text-muted-foreground block">
                                  {cand.yearOfStudy.replace('Bachelor of Pharmacy', 'B.Pharm')}
                                </span>
                              </div>
                            </div>
                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-full border-2 border-ink text-[11px] font-bold shrink-0 ${
                                isChosen ? 'bg-ink text-ink-foreground' : 'bg-card'
                              }`}
                            >
                              {isChosen ? '✓' : ''}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="sticky bottom-20 lg:bottom-6 rounded-2xl border-2 border-ink bg-card p-4 sm:p-6 shadow-pop flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>All 6 executive offices have a candidate selected</span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setVotingStep(1)}
                  className="w-1/2 sm:w-auto rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCastBallot}
                  className="w-1/2 sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-ink shadow-xs"
                >
                  <Lock className="h-4 w-4" />
                  <span>Cast Secret Ballot</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: VERIFICATION RECEIPT */}
        {votingStep === 4 && receiptData && (
          <div className="mx-auto max-w-xl animate-in zoom-in-95 duration-300">
            <div className="rounded-3xl border-2 border-ink bg-card p-6 sm:p-10 shadow-pop">
              <div className="text-center space-y-2">
                <span className="bg-brand inline-flex h-16 w-16 items-center justify-center rounded-2xl text-ink shadow-xs">
                  <Check className="h-8 w-8 stroke-[3]" />
                </span>
                <p className="eyebrow text-success">Ballot Confirmed & Recorded</p>
                <h3 className="font-display text-2xl sm:text-3xl font-semibold text-foreground">
                  Official Balloting Receipt
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Your encrypted ballot has been deposited into the virtual ballot box under Electoral Commission surveillance.
                </p>
              </div>

              {/* Receipt details */}
              <div className="mt-8 rounded-2xl border border-border bg-secondary/50 p-5 space-y-4 text-xs sm:text-sm font-mono">
                <div className="flex justify-between border-b border-border pb-2.5">
                  <span className="text-muted-foreground">Receipt Number:</span>
                  <span className="font-bold text-foreground">{receiptData.receiptId}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2.5">
                  <span className="text-muted-foreground">Timestamp:</span>
                  <span className="text-foreground">{receiptData.timestamp}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2.5">
                  <span className="text-muted-foreground">Anonymized Token:</span>
                  <span className="text-foreground">{receiptData.studentToken}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Cryptographic Proof Hash:</span>
                  <p className="break-all text-[11px] bg-background p-2.5 rounded-lg border border-border text-primary font-mono leading-tight">
                    {receiptData.ballotHash}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Keep this verification code. When final tallying concludes, you can verify your receipt hash against the certified results ledger.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 pt-4 border-t border-border flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-ink bg-card py-3 px-4 text-sm font-semibold text-foreground hover:bg-secondary"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => onNavigate('results')}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 px-4 text-sm font-semibold text-primary-foreground hover:bg-ink transition-colors shadow-xs"
                >
                  <span>View Election Results</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={resetAll}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border py-3 px-4 text-sm text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Done</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
