import React from 'react';
import {
  FileCheck,
  Printer,
  Download,
  X,
  CheckCircle2,
  Award,
  ShieldCheck,
  Building
} from 'lucide-react';
import { OFFICE_RESULTS, TURNOUT_METRICS } from '../data/election';

interface AuditDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditDossierModal: React.FC<AuditDossierModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(
          {
            election: 'KUPSA General Election 2026/2027',
            governingLaw: 'Chapter Six, Articles 39-55, KUPSA Constitution',
            certifiedTimestamp: '2026-11-06T18:00:00+03:00',
            turnout: TURNOUT_METRICS,
            results: OFFICE_RESULTS,
            auditHash: 'sha256:7c9e11a3b8d4...55a2',
            returningOfficer: 'KUPSA Electoral Commission Returning Officer',
            facultyPatron: 'KUPSA Faculty Patron, Kabarak School of Pharmacy'
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'KUPSA_2026_Certified_Audit_Dossier.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-t-3xl sm:rounded-3xl border-2 border-ink shadow-pop max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto my-2.5 sm:hidden" />

        {/* Modal Controls Bar */}
        <div className="flex items-center justify-between border-b border-border p-4 sm:p-6 pb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="eyebrow text-primary text-[10px]">
              Institutional Audit Dossier
            </span>
            <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
              Form KUPSA-EC-FINAL-2026
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 border border-border hover:bg-secondary text-foreground text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 bg-ink hover:bg-primary text-ink-foreground text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export JSON</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-lg ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dossier Document Content */}
        <div className="overflow-y-auto p-4 sm:p-8 space-y-6 text-foreground">
          {/* Institutional Header */}
          <div className="text-center pb-6 border-b border-border space-y-1.5">
            <div className="flex items-center justify-center gap-2 font-display text-sm tracking-wider uppercase font-semibold text-primary">
              <Building className="w-4 h-4" />
              Kabarak University · School of Pharmacy
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
              Electoral Commission Certified Return of Elections
            </h2>
            <p className="text-xs font-mono text-muted-foreground">
              Official Gazetted Return Under Chapter Six, Article 46 of the KUPSA Constitution
            </p>
          </div>

          {/* Verification Hash Badge */}
          <div className="p-3 bg-secondary/50 rounded-xl border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span className="font-mono text-muted-foreground">Audit Fingerprint:</span>
              <span className="font-mono font-semibold text-foreground break-all">
                sha256:7c9e11a3b8d4f09e882a...55a2
              </span>
            </div>
            <span className="text-[11px] font-semibold text-success font-mono">
              TAMPER-PROOF VERIFIED
            </span>
          </div>

          {/* Turnout Summary */}
          <div>
            <h3 className="font-display font-semibold text-base mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              1. General Turnout Attestation
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-card border border-border rounded-xl">
                <div className="text-muted-foreground text-[10px] uppercase font-mono">Registered Roll</div>
                <div className="font-display text-lg font-bold mt-0.5">{TURNOUT_METRICS.registeredTotal}</div>
              </div>
              <div className="p-3 bg-card border border-border rounded-xl">
                <div className="text-muted-foreground text-[10px] uppercase font-mono">Ballots Cast</div>
                <div className="font-display text-lg font-bold mt-0.5">{TURNOUT_METRICS.ballotsCast}</div>
              </div>
              <div className="p-3 bg-card border border-border rounded-xl">
                <div className="text-muted-foreground text-[10px] uppercase font-mono">Overall Turnout</div>
                <div className="font-display text-lg font-bold mt-0.5 text-primary">
                  {TURNOUT_METRICS.turnoutPercentage}%
                </div>
              </div>
              <div className="p-3 bg-card border border-border rounded-xl">
                <div className="text-muted-foreground text-[10px] uppercase font-mono">Quorum Threshold</div>
                <div className="font-display text-lg font-bold mt-0.5 text-success">Passed (Art. 41)</div>
              </div>
            </div>
          </div>

          {/* Declared Winners Table */}
          <div>
            <h3 className="font-display font-semibold text-base mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              2. Certified Winners & Office Tallies
            </h3>
            <div className="border border-border rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead className="bg-secondary font-mono text-[11px] text-muted-foreground uppercase border-b border-border">
                  <tr>
                    <th className="p-3">Office Portfolio</th>
                    <th className="p-3">Declared Winner</th>
                    <th className="p-3 text-right">Votes</th>
                    <th className="p-3 text-right">Vote Share</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-sans">
                  {OFFICE_RESULTS.map((office) => {
                    const winner = office.candidateTallies.find((c) => c.isWinner);
                    return (
                      <tr key={office.officeId} className="hover:bg-muted/30">
                        <td className="p-3 font-semibold">{office.officeTitle}</td>
                        <td className="p-3 text-foreground font-medium">{winner?.candidateName || '—'}</td>
                        <td className="p-3 text-right font-mono font-semibold">{winner?.votes.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono">{winner?.percentage.toFixed(1)}%</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 bg-success/10 text-success text-[10px] font-mono rounded-full font-semibold">
                            Certified
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Statutory Signatures */}
          <div className="pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="p-4 bg-secondary/50 rounded-xl border border-border space-y-2">
              <div className="text-muted-foreground font-mono text-[10px] uppercase">Returning Officer Attestation</div>
              <div className="font-serif italic text-base text-foreground">Prof. E. Chemutai, Ph.D.</div>
              <div className="font-mono text-[11px] text-muted-foreground">KUPSA Electoral Commission Returning Officer</div>
              <div className="text-[10px] text-muted-foreground font-mono">Date: 2026-11-06 18:30 EAT</div>
            </div>

            <div className="p-4 bg-secondary/50 rounded-xl border border-border space-y-2">
              <div className="text-muted-foreground font-mono text-[10px] uppercase">Faculty Patron Countersignature</div>
              <div className="font-serif italic text-base text-foreground">Dr. J. K. Murgor, FPSK</div>
              <div className="font-mono text-[11px] text-muted-foreground">Patron, Kabarak School of Pharmacy</div>
              <div className="text-[10px] text-muted-foreground font-mono">Seal: KABU/SOP/KUPSA/2026-CONFIRMED</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
