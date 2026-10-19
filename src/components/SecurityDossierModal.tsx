import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Database,
  Trash2,
  FileText,
  Key,
  X,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface SecurityDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityDossierModal: React.FC<SecurityDossierModalProps> = ({ isOpen, onClose }) => {
  const [activeThreatIndex, setActiveThreatIndex] = useState<number>(0);

  if (!isOpen) return null;

  const threats = [
    {
      id: 'threat-coercion',
      title: 'Coercion & Vote-Buying Mitigation',
      shortTitle: 'Coercion / Bribery',
      constitutionalRef: 'Article 39(1) & Article 45(1)',
      severity: 'High Threat in Student Politics',
      vulnerability: 'Students pressured to prove their vote choice to earn financial favours, hall privileges, or avoid peer intimidation.',
      mitigationArchitecture: 'Receipt-Free Ballot Protocol. The voter receives a SHA-256 proof that mathematically confirms their ballot was tallied into the unblinded ledger, but the receipt contains ZERO information identifying which candidate was selected. It is impossible to use the receipt to prove a vote to a third party.',
      verificationCheck: 'Cast receipts checked against public block ledger confirm presence without choice disclosure.'
    },
    {
      id: 'threat-insider',
      title: 'Administrator & Insider Tampering',
      shortTitle: 'Insider Tampering',
      constitutionalRef: 'Article 45(1) & Article 50(2)',
      severity: 'Critical Threat to Legitimacy',
      vulnerability: 'A rogue system administrator, commissioner, or candidate sympathizer altering tallies directly in database tables.',
      mitigationArchitecture: 'Zero-Discretion Tallying & Observer Hash Chains. Every administrative lifecycle event is committed to an immutable append-only SHA-256 ledger broadcast to accredited observers in real-time. High-impact operations require dual-custody cryptographic keys shared between the Returning Officer and the KUPSA Faculty Patron.',
      verificationCheck: 'Candidate agents countersign cryptographic genesis and final closure hashes.'
    },
    {
      id: 'threat-sybil',
      title: 'Sybil & Non-Pharmacy Infiltration',
      shortTitle: 'Faculty Infiltration',
      constitutionalRef: 'Article 42(a) & Article 45(1)',
      severity: 'Medium-High Threat',
      vulnerability: 'Students from other faculties (e.g. Medicine MBChB, Law, Business) attempting to participate in KUPSA executive elections.',
      mitigationArchitecture: 'Two-Factor Institutional Identity Matching. Authentication enforces Kabarak Google Workspace domain tokens (@kabarak.ac.ke) coupled with real-time matching against the Dean-certified School of Pharmacy enrollment roll. Students not registered on the official B.Pharm roll are blocked at the identity boundary before reaching the ballot server.',
      verificationCheck: 'Registrar checksum validated against Dean master file before poll opening.'
    },
    {
      id: 'threat-outage',
      title: 'Network Outage & Service Disruption',
      shortTitle: 'Power / Net Outage',
      constitutionalRef: 'Article 51(3)',
      severity: 'Operational Contingency',
      vulnerability: 'Campus fiber cuts, Wi-Fi saturation during afternoon practicals, or power failure halting student voting.',
      mitigationArchitecture: 'Paper-Based Contingency Fallback Protocol. Pre-printed serial-numbered paper ballots stored under dual-custody physical seals. If electronic quorum falls below 40% due to systemic infrastructure failure, the Commission exercises emergency Article 51 authorization to transition to physical paper voting.',
      verificationCheck: 'Observer-verified tamper seal serial numbers logged in public gazette.'
    }
  ];

  const currentThreat = threats[activeThreatIndex];

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-t-3xl sm:rounded-3xl border-2 border-ink shadow-pop max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto my-2.5 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-border p-4 sm:p-6 pb-3">
          <div>
            <span className="eyebrow text-primary text-[10px]">
              Architectural Defense Specification
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mt-0.5">
              Security threat model & privacy defense
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Threat Switcher (Mobile Swipeable Tabs) */}
        <div className="px-4 sm:px-6 pt-3 border-b border-border bg-secondary/50">
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 text-xs">
            {threats.map((t, idx) => {
              const active = idx === activeThreatIndex;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveThreatIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors shrink-0 ${
                    active
                      ? 'bg-ink text-ink-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground bg-card border border-border'
                  }`}
                >
                  {t.shortTitle}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Threat Card Details */}
        <div className="overflow-y-auto p-4 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
            <div>
              <span className="font-mono text-xs text-primary font-semibold">
                {currentThreat.constitutionalRef}
              </span>
              <h4 className="font-display text-lg sm:text-xl font-bold text-foreground">
                {currentThreat.title}
              </h4>
            </div>
            <span className="px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 text-xs font-mono font-semibold rounded-full self-start sm:self-center">
              {currentThreat.severity}
            </span>
          </div>

          {/* Threat Vector */}
          <div className="space-y-1.5">
            <div className="eyebrow text-destructive text-[10px] flex items-center gap-1.5 font-bold">
              <ShieldAlert className="w-3.5 h-3.5" />
              Vulnerability Vector in Student Association Context
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentThreat.vulnerability}
            </p>
          </div>

          {/* Defense Architecture */}
          <div className="p-4 bg-secondary/50 rounded-xl border border-border space-y-2">
            <div className="eyebrow text-success text-[10px] flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Cryptographic & Governance Defense Mechanism
            </div>
            <p className="text-xs sm:text-sm text-foreground leading-relaxed">
              {currentThreat.mitigationArchitecture}
            </p>
          </div>

          {/* Verification Audit Check */}
          <div className="p-3 bg-card border border-border rounded-xl flex items-start gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-foreground">Independent Verification: </span>
              <span className="text-muted-foreground">{currentThreat.verificationCheck}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 pt-3 border-t border-border bg-secondary/30 flex items-center justify-between">
          <div className="text-[11px] font-mono text-muted-foreground hidden sm:block">
            Audited for KUPSA General Elections
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-ink text-ink-foreground hover:bg-primary font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            Acknowledge Defense Architecture
          </button>
        </div>
      </div>
    </div>
  );
};
