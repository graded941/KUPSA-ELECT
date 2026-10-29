import React, { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Users,
  Activity,
  FileCheck,
  Award,
  AlertCircle,
  X,
  Clock
} from 'lucide-react';

interface RehearsalSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RehearsalSimulator: React.FC<RehearsalSimulatorProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<number>(1);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([]);
  const [quorumConfirmed, setQuorumConfirmed] = useState<boolean>(false);
  const [agentsPresent, setAgentsPresent] = useState<boolean>(false);

  // Rehearsal Results State
  const [rehearsalResults, setRehearsalResults] = useState<{
    totalCast: number;
    chairpersonAmina: number;
    chairpersonBrian: number;
    secrecyVerificationPassed: boolean;
    hashProof: string;
  } | null>(null);

  useEffect(() => {
    let interval: any;
    if (isSimulating) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsSimulating(false);
            clearInterval(interval);
            setRehearsalResults({
              totalCast: 50,
              chairpersonAmina: 31,
              chairpersonBrian: 19,
              secrecyVerificationPassed: true,
              hashProof: 'sha256:91f2e04a...c712'
            });
            setStep(3);
            return 100;
          }
          const nextVal = prev + 10;
          setSimulatedLogs((logs) => [
            `[${new Date().toLocaleTimeString()}] Blinded token #${Math.floor(nextVal / 2)} cast across cohort Y${(nextVal % 5) + 1} — Hash: sha256:${Math.random().toString(36).substring(2, 10)}...`,
            ...logs.slice(0, 5)
          ]);
          return nextVal;
        });
      }, 350);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  if (!isOpen) return null;

  const startLiveSimulation = () => {
    setIsSimulating(true);
    setProgress(0);
    setSimulatedLogs([]);
    setStep(2);
  };

  const resetSimulation = () => {
    setStep(1);
    setProgress(0);
    setIsSimulating(false);
    setSimulatedLogs([]);
    setRehearsalResults(null);
    setQuorumConfirmed(false);
    setAgentsPresent(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-t-3xl sm:rounded-3xl border-2 border-ink shadow-pop max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 animate-in slide-in-from-bottom-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1">
            <span className="eyebrow text-primary text-[10px]">
              Commission Rehearsal Engine · Dry Run
            </span>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Mock Election Stress Rehearsal
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between text-xs font-mono text-muted-foreground border-b border-border pb-3">
          <span className={step === 1 ? 'text-primary font-bold' : ''}>
            1. Quorum & Pre-Flight
          </span>
          <span>›</span>
          <span className={step === 2 ? 'text-primary font-bold' : ''}>
            2. 50-Ballot Synthetic Poll
          </span>
          <span>›</span>
          <span className={step === 3 ? 'text-primary font-bold' : ''}>
            3. Zero-Knowledge Tally
          </span>
        </div>

        {/* STEP 1: PRE-FLIGHT CHECKS */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Before casting synthetic ballots, verify pre-flight requirements under Chapter Six, Article 41:
            </p>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 bg-secondary/50 rounded-xl border border-border cursor-pointer hover:bg-secondary transition-colors">
                <input
                  type="checkbox"
                  checked={quorumConfirmed}
                  onChange={(e) => setQuorumConfirmed(e.target.checked)}
                  className="mt-1 accent-primary"
                />
                <div className="text-xs">
                  <div className="font-semibold text-foreground">
                    Confirm Registry Quorum (≥ 50% School Roll)
                  </div>
                  <div className="text-muted-foreground mt-0.5">
                    Dean-certified B.Pharm roster containing 1,042 enrolled pharmacy students loaded into memory.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-secondary/50 rounded-xl border border-border cursor-pointer hover:bg-secondary transition-colors">
                <input
                  type="checkbox"
                  checked={agentsPresent}
                  onChange={(e) => setAgentsPresent(e.target.checked)}
                  className="mt-1 accent-primary"
                />
                <div className="text-xs">
                  <div className="font-semibold text-foreground">
                    Candidate Agent Presence & Zero-Genesis Verification
                  </div>
                  <div className="text-muted-foreground mt-0.5">
                    Agents for Wambua Titus and Mputhia Mark Mwenda witness the virtual ballot box empty state (genesis hash: 0x00000000).
                  </div>
                </div>
              </label>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                disabled={!quorumConfirmed || !agentsPresent}
                onClick={startLiveSimulation}
                className={`px-5 py-3 rounded-full text-xs font-semibold inline-flex items-center gap-2 transition-all ${
                  quorumConfirmed && agentsPresent
                    ? 'bg-primary text-primary-foreground shadow-pop hover:bg-ink'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                Initialize 50-Ballot Synthetic Wave
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ACTIVE REHEARSAL IN PROGRESS */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-muted-foreground">Synthetic Voter Throughput:</span>
                <span className="font-bold text-primary">{progress}% Complete</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className="bg-brand h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="p-4 bg-ink rounded-xl text-ink-foreground font-mono text-xs space-y-1.5 h-44 overflow-y-auto">
              <div className="text-sun text-[11px] font-semibold border-b border-white/10 pb-1 mb-2">
                Simulated Observer Ledger Stream (Real-Time Proofs):
              </div>
              {simulatedLogs.map((log, idx) => (
                <div key={idx} className="text-[11px] opacity-80">
                  {log}
                </div>
              ))}
            </div>

            <div className="text-xs text-muted-foreground italic flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary animate-spin" />
              Simulating concurrent voter authentication, token blinding, and cryptographic ledger commits...
            </div>
          </div>
        )}

        {/* STEP 3: REHEARSAL VERIFICATION RESULTS */}
        {step === 3 && rehearsalResults && (
          <div className="space-y-6">
            <div className="p-4 bg-success/10 border border-success/30 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-success font-display font-semibold text-base">
                <CheckCircle2 className="w-5 h-5" />
                Rehearsal Protocol Completed Successfully
              </div>
              <p className="text-xs text-muted-foreground">
                All 50 mock ballots were tallied without a single voter identity exposure or cryptographic checksum error.
              </p>
            </div>

            {/* Mock Tallies */}
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                Simulated President Portfolio Outcome:
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Wambua Titus (Simulated)</span>
                    <span className="font-mono">31 votes (62.0%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                    <div className="bg-brand h-full rounded-full" style={{ width: '62%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Mputhia Mark Mwenda (Simulated)</span>
                    <span className="font-mono">19 votes (38.0%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                    <div className="bg-ink/30 h-full rounded-full" style={{ width: '38%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Cryptographic Proof Verification */}
            <div className="p-3 bg-secondary/50 rounded-xl border border-border text-xs space-y-1">
              <div className="text-muted-foreground font-mono text-[10px]">
                Genesis-to-Closure Audit Root:
              </div>
              <div className="font-mono font-bold text-primary break-all">
                {rehearsalResults.hashProof}
              </div>
              <div className="text-[11px] text-success font-semibold flex items-center gap-1 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Dual-Signature Key Match Attested by RO & Faculty Patron
              </div>
            </div>

            <div className="pt-4 flex justify-between gap-3">
              <button
                onClick={resetSimulation}
                className="px-4 py-2 border border-border hover:bg-secondary text-foreground text-xs font-semibold rounded-xl inline-flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Re-Run Rehearsal
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2 bg-ink hover:bg-primary text-ink-foreground text-xs font-semibold rounded-xl"
              >
                Close Rehearsal Console
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
