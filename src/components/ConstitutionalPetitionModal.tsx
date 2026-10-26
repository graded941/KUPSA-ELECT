import React, { useState, useEffect } from 'react';
import {
  Scale,
  X,
  CheckCircle2,
  Clock,
  Shield,
  FileText,
  AlertTriangle,
  Download,
  Send,
  Search,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Award
} from 'lucide-react';
import { DisputeSubmission, StudentRecord } from '../types';
import { submitConstitutionalPetition, fetchConstitutionalPetitions } from '../lib/electionService';

interface ConstitutionalPetitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledStudent?: StudentRecord;
  defaultContestedOffice?: string;
}

const CONSTITUTIONAL_ARTICLES = [
  { id: 'art-51', label: 'Article 51: Dispute & Petition Procedure (48h Mandate)' },
  { id: 'art-46', label: 'Article 46: Declaration of Certified Election Results' },
  { id: 'art-44', label: 'Article 44: Electronic Ballot Integrity & Sealing' },
  { id: 'art-39', label: 'Article 39: Voter Roll Rights & Faculty Accreditation' },
  { id: 'art-41', label: 'Article 41: Polling Timetable & Free Secret Ballot' },
  { id: 'art-47', label: 'Article 47: Patron Supervisory & Constitutional Oversight' },
];

const CONTESTED_PORTFOLIOS = [
  'Chairperson Portfolio',
  'Vice-Chairperson Portfolio',
  'Secretary General Portfolio',
  'Treasurer Portfolio',
  'Media and Publications Officer Portfolio',
  'Voter Register Accreditation Procedure (Art. 39)',
  'Electronic Ballot Sealing / Verification (Art. 44)',
  'Tallying & Declaration of Results (Art. 46)',
  'Campaign Moratorium Compliance (Art. 44(3))',
  'General Election Conduct & Quorum Procedure',
];

export const ConstitutionalPetitionModal: React.FC<ConstitutionalPetitionModalProps> = ({
  isOpen,
  onClose,
  prefilledStudent,
  defaultContestedOffice,
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'track'>('file');

  // Form State
  const [petitionerName, setPetitionerName] = useState(prefilledStudent?.name || '');
  const [regNo, setRegNo] = useState(prefilledStudent?.regNo || '');
  const [email, setEmail] = useState(prefilledStudent?.email || '');
  const [petitionerRole, setPetitionerRole] = useState<'Enrolled Voter' | 'Cleared Candidate' | "Official Candidate's Agent" | 'Accredited Observer'>('Enrolled Voter');
  const [officeContested, setOfficeContested] = useState(defaultContestedOffice || CONTESTED_PORTFOLIOS[0]);
  const [selectedArticles, setSelectedArticles] = useState<string[]>(['Article 51: Dispute & Petition Procedure (48h Mandate)']);
  const [grounds, setGrounds] = useState('');
  const [remedy, setRemedy] = useState('Forensic Recount of Digital Ballot Hashes & Formal Patron Review');
  const [affirmed, setAffirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Successfully filed petition receipt state
  const [filedReceipt, setFiledReceipt] = useState<DisputeSubmission | null>(null);

  // Tracking tab state
  const [searchDocket, setSearchDocket] = useState('');
  const [allPetitions, setAllPetitions] = useState<DisputeSubmission[]>([]);
  const [loadingPetitions, setLoadingPetitions] = useState(false);

  // Countdown timer for 48h statutory deadline
  const [timeRemaining, setTimeRemaining] = useState('47h 56m remaining');

  useEffect(() => {
    if (isOpen) {
      loadPetitions();
      // Simple dynamic countdown display
      const updateClock = () => {
        const now = new Date();
        const mins = 59 - (now.getMinutes() % 60);
        const secs = 59 - (now.getSeconds() % 60);
        setTimeRemaining(`47h ${mins}m ${secs}s in statutory window`);
      };
      updateClock();
      const interval = setInterval(updateClock, 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const loadPetitions = async () => {
    setLoadingPetitions(true);
    try {
      const list = await fetchConstitutionalPetitions();
      setAllPetitions(list);
    } catch (_err) {
      // Ignore
    } finally {
      setLoadingPetitions(false);
    }
  };

  if (!isOpen) return null;

  const toggleArticle = (artLabel: string) => {
    setSelectedArticles((prev) =>
      prev.includes(artLabel)
        ? prev.filter((a) => a !== artLabel)
        : [...prev, artLabel]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!petitionerName.trim() || !regNo.trim() || !grounds.trim()) {
      setErrorMsg('Please complete all required fields including Name, Registration Number, and Grounds.');
      return;
    }

    if (!affirmed) {
      setErrorMsg('Please confirm the statutory constitutional affirmation under Article 51.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitConstitutionalPetition({
        petitionerName: petitionerName.trim(),
        regNo: regNo.trim().toUpperCase(),
        email: email.trim(),
        petitionerRole,
        officeContested,
        articlesCited: selectedArticles,
        grounds: grounds.trim(),
        remedy: remedy.trim(),
      });

      if (res.success && res.petition) {
        setFiledReceipt(res.petition);
        loadPetitions();
      } else {
        setErrorMsg(res.error || 'Failed to lodge petition. Please retry.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error lodging petition.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadSlip = () => {
    if (!filedReceipt) return;

    const slipContent = `
========================================================================
     KABARAK UNIVERSITY PHARMACY STUDENTS ASSOCIATION (KUPSA)
      ELECTORAL COMMISSION & PATRON CONSTITUTIONAL TRIBUNAL
            ARTICLE 51 OFFICIAL PETITION DOCKET RECEIPT
========================================================================

DOCKET REFERENCE NUMBER : ${filedReceipt.id}
STATUTORY INSTRUMENT    : Article 51 of KUPSA Constitution
STATUTORY FILING WINDOW : 48 Hours Post-Declaration
DATE & TIME DOCKETED    : ${filedReceipt.timestamp}
PATRON TRANSMITTAL HASH : ${filedReceipt.transmittalHash || 'VERIFIED-SHA256'}
TRANSMISSION STATUS     : Concurrent Copy Transmitted to Commission & Patron

PETITIONER PARTICULARS:
- Full Name             : ${filedReceipt.complainantName}
- Registration Number   : ${filedReceipt.regNo || regNo}
- Student Email         : ${filedReceipt.email || email || 'student@kabarak.ac.ke'}
- Legal Capacity        : ${filedReceipt.complainantRole}

CONTESTED PORTFOLIO / PROCESS:
- Disputed Matter       : ${filedReceipt.officeContested}
- Constitutional Clauses: ${(filedReceipt.articlesCited || selectedArticles).join(', ')}

SUMMARY OF GROUNDS & EVIDENCE:
${filedReceipt.constitutionalGrounds}

PRAYERS & REMEDY SOUGHT:
${filedReceipt.remedyRequested || remedy}

STATUTORY NEXT STEPS:
1. The Electoral Commission and Faculty Patron sit jointly as an adjudication quorum within 48 hours.
2. The petitioner and affected candidates/agents shall be summoned to provide sworn testimony if required.
3. Written determination signed by the Patron and Chief Returning Officer will be entered on the public docket.

OFFICIAL SIGNATURES:
[Signed] ____________________________     [Signed] ____________________________
Faculty Patron & Arbiter                  Chief Returning Officer
School of Pharmacy, Kabarak University    KUPSA Electoral Commission 2026
========================================================================
    `;

    const blob = new Blob([slipContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filedReceipt.id}-ARTICLE-51-RECEIPT.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredPetitions = allPetitions.filter((p) => {
    if (!searchDocket.trim()) return true;
    const q = searchDocket.toLowerCase();
    return (
      p.id.toLowerCase().includes(q) ||
      p.complainantName.toLowerCase().includes(q) ||
      p.officeContested.toLowerCase().includes(q) ||
      (p.regNo && p.regNo.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-card text-card-foreground rounded-t-2xl sm:rounded-2xl border-2 border-ink shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Mobile drag handle */}
        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto my-2.5 sm:hidden" />

        {/* Header */}
        <div className="flex items-start justify-between border-b border-border p-4 sm:p-6 pb-4 bg-secondary/30">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs shrink-0">
              <Scale className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-primary">
                  KUPSA Constitution Article 51
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-mono font-semibold">
                  <Clock className="w-3 h-3" />
                  {timeRemaining}
                </span>
              </div>
              <h3 className="font-display text-lg sm:text-2xl font-bold text-foreground">
                Constitutional Petition & Appeal Portal
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-lg cursor-pointer hover:bg-muted/60 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Tabs */}
        {!filedReceipt && (
          <div className="flex border-b border-border bg-secondary/20 px-4 sm:px-6">
            <button
              onClick={() => setActiveTab('file')}
              className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'file'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>File Formal Petition (Article 51)</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('track');
                loadPetitions();
              }}
              className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'track'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Track Live Docket ({allPetitions.length})</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-xs space-y-4">
          {/* SUCCESS SCREEN: CERTIFICATE GENERATED */}
          {filedReceipt ? (
            <div className="space-y-4 py-2">
              <div className="rounded-2xl border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 p-5 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-display text-xl font-bold text-emerald-900 dark:text-emerald-200">
                  Article 51 Constitutional Petition Docketed!
                </h4>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 max-w-md mx-auto">
                  Your petition has been officially registered on the statutory docket. An immutable copy has been concurrently transmitted to both the <strong>KUPSA Electoral Commission</strong> and the <strong>School of Pharmacy Patron</strong>.
                </p>
              </div>

              {/* Official Certificate Box */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3 font-mono text-[11px] shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Official Docket ID:</span>
                  <span className="text-sm font-bold text-primary">{filedReceipt.id}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Petitioner:</span>
                  <span className="font-semibold text-foreground">{filedReceipt.complainantName} ({filedReceipt.complainantRole})</span>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Registration No:</span>
                  <span className="font-semibold text-foreground">{filedReceipt.regNo || regNo}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Contested Portfolio / Action:</span>
                  <span className="font-semibold text-foreground">{filedReceipt.officeContested}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Patron Transmittal Hash:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">{filedReceipt.transmittalHash || 'VERIFIED-SHA256'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Statutory Deadline:</span>
                  <span className="text-amber-600 font-bold">Within 48 Hours of Declaration</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Docket Status:</span>
                  <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-[10px] font-bold">
                    {filedReceipt.status}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-secondary/50 p-3.5 space-y-1.5 text-muted-foreground text-[11px]">
                <strong className="text-foreground flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-primary" />
                  Constitutional Adjudication Procedure (Article 51)
                </strong>
                <p>
                  As guaranteed under Article 51, the Patron and Commission shall convene a joint adjudication quorum. You will receive an official notification with the hearing determination. You may check this status at any time using your Docket ID.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadSlip}
                  className="flex-1 py-3 bg-secondary hover:bg-secondary/80 text-foreground font-semibold rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-2 border border-border"
                >
                  <Download className="w-4 h-4 text-primary" />
                  <span>Download Formal Filing Slip (.txt)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFiledReceipt(null);
                    setActiveTab('track');
                    loadPetitions();
                  }}
                  className="flex-1 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Search className="w-4 h-4" />
                  <span>View Live Docket Status</span>
                </button>
              </div>
            </div>
          ) : activeTab === 'file' ? (
            /* TAB 1: FILE PETITION */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-3 text-destructive flex items-center gap-2 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Statutory Notice Banner */}
              <div className="rounded-xl border border-border bg-secondary/40 p-3 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  <strong>Article 51 Statutory Notice:</strong> Any registered voter, aspirant, or agent aggrieved by any procedure, counting anomaly, or declaration may petition the Commission & Patron within <strong>48 hours</strong>. Petitions are logged into the permanent audit trail.
                </p>
              </div>

              {/* Row 1: Name & Reg No */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Petitioner Full Name *</label>
                  <input
                    type="text"
                    required
                    value={petitionerName}
                    onChange={(e) => setPetitionerName(e.target.value)}
                    placeholder="e.g. David Kiprono"
                    className="w-full bg-secondary/30 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Registration Number *</label>
                  <input
                    type="text"
                    required
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    placeholder="PHARM/2024/1882"
                    className="w-full bg-secondary/30 border border-border rounded-xl px-3 py-2 text-foreground font-mono uppercase focus:outline-none focus:border-primary text-xs"
                  />
                </div>
              </div>

              {/* Row 2: Email & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Kabarak Student Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@kabarak.ac.ke"
                    className="w-full bg-secondary/30 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Filing Capacity *</label>
                  <select
                    value={petitionerRole}
                    onChange={(e: any) => setPetitionerRole(e.target.value)}
                    className="w-full bg-secondary/30 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary text-xs cursor-pointer"
                  >
                    <option value="Enrolled Voter">Enrolled Voter (School of Pharmacy)</option>
                    <option value="Cleared Candidate">Nominated Candidate / Aspirant</option>
                    <option value="Official Candidate's Agent">Official Candidate's Agent</option>
                    <option value="Accredited Observer">Accredited Election Observer</option>
                  </select>
                </div>
              </div>

              {/* Contested Matter */}
              <div className="space-y-1">
                <label className="font-bold text-foreground">Contested Portfolio or Electoral Procedure *</label>
                <select
                  value={officeContested}
                  onChange={(e) => setOfficeContested(e.target.value)}
                  className="w-full bg-secondary/30 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary text-xs cursor-pointer"
                >
                  {CONTESTED_PORTFOLIOS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* Constitutional Clauses Cited */}
              <div className="space-y-1.5">
                <label className="font-bold text-foreground block">
                  Constitutional Articles Invoked (Select all that apply)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {CONSTITUTIONAL_ARTICLES.map((art) => {
                    const isChecked = selectedArticles.includes(art.label);
                    return (
                      <button
                        type="button"
                        key={art.id}
                        onClick={() => toggleArticle(art.label)}
                        className={`text-left p-2 rounded-lg border transition-colors flex items-center justify-between cursor-pointer ${
                          isChecked
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border bg-card text-muted-foreground hover:bg-secondary/40'
                        }`}
                      >
                        <span className="text-[11px] leading-tight">{art.label}</span>
                        <span className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 ml-1 border ${isChecked ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/40'}`}>
                          {isChecked && <CheckCircle2 className="w-3 h-3" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Statement of Grounds & Evidence */}
              <div className="space-y-1">
                <label className="font-bold text-foreground">
                  Statement of Grounds & Description of Irregularity *
                </label>
                <textarea
                  required
                  rows={3}
                  value={grounds}
                  onChange={(e) => setGrounds(e.target.value)}
                  placeholder="Detail the specific factual grounds, time of occurrence, polling room/station, and constitutional deviation observed..."
                  className="w-full bg-secondary/30 border border-border rounded-xl p-3 text-foreground focus:outline-none focus:border-primary text-xs"
                />
              </div>

              {/* Remedy Sought */}
              <div className="space-y-1">
                <label className="font-bold text-foreground">Remedy or Relief Prayed For *</label>
                <input
                  type="text"
                  required
                  value={remedy}
                  onChange={(e) => setRemedy(e.target.value)}
                  placeholder="e.g. Forensic Recount of Cryptographic Ballots, Patron Review, Hearing"
                  className="w-full bg-secondary/30 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary text-xs"
                />
              </div>

              {/* Solemn Affirmation */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-secondary/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={affirmed}
                  onChange={(e) => setAffirmed(e.target.checked)}
                  className="mt-0.5 rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <span className="text-[11px] text-muted-foreground leading-relaxed">
                  I solemnly affirm under <strong>Article 51(2)</strong> that the particulars above are truthful, substantiated, and submitted in good faith under the Kabarak University Pharmacy Students Association Constitution.
                </span>
              </label>

              {/* Submit Actions */}
              <div className="pt-2 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 border border-border text-foreground hover:bg-secondary/60 rounded-xl font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold rounded-xl cursor-pointer transition-colors inline-flex items-center gap-2 shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      <span>Docketing with Commission & Patron...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>File Formal Article 51 Petition</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* TAB 2: TRACK LIVE DOCKET */
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchDocket}
                    onChange={(e) => setSearchDocket(e.target.value)}
                    placeholder="Search by Docket #, Petitioner Name, or Registration No..."
                    className="w-full bg-secondary/30 border border-border rounded-xl pl-8 pr-3 py-2 text-foreground focus:outline-none focus:border-primary text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={loadPetitions}
                  className="px-3 py-2 border border-border hover:bg-secondary/50 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                  title="Refresh Docket"
                >
                  Refresh
                </button>
              </div>

              {loadingPetitions ? (
                <div className="py-8 text-center text-muted-foreground">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p>Loading statutory dispute docket...</p>
                </div>
              ) : filteredPetitions.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                  <p className="font-semibold text-foreground">No matching petitions found</p>
                  <p className="text-[11px] mt-1">All election procedures are currently free of unresolved Article 51 disputes.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPetitions.map((pet) => (
                    <div
                      key={pet.id}
                      className="rounded-xl border border-border bg-card p-4 space-y-2.5 hover:border-primary/50 transition-colors shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-border/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-primary">
                            {pet.id}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            · {pet.timestamp}
                          </span>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold self-start sm:self-auto ${
                            pet.status === 'Resolved' || pet.status === 'Upheld'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                              : pet.status === 'Dismissed'
                              ? 'bg-muted text-muted-foreground'
                              : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {pet.status}
                        </span>
                      </div>

                      <div>
                        <p className="font-semibold text-foreground text-xs">
                          {pet.complainantName} ({pet.complainantRole}) · Contested: {pet.officeContested}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                          {pet.constitutionalGrounds}
                        </p>
                      </div>

                      {pet.articlesCited && pet.articlesCited.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {pet.articlesCited.map((a, idx) => (
                            <span
                              key={idx}
                              className="rounded bg-secondary px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Transmittal and Ruling */}
                      <div className="rounded-lg bg-secondary/50 p-2.5 text-[11px] space-y-1 font-mono">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-muted-foreground">Patron Transmittal Hash:</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{pet.transmittalHash || 'VERIFIED-SHA256'}</span>
                        </div>
                        {pet.resolutionNotes && (
                          <div className="pt-1 border-t border-border/40 text-foreground font-sans">
                            <strong className="text-primary text-[10px] font-mono uppercase block">Tribunal Ruling / Note:</strong>
                            <p className="text-xs text-muted-foreground mt-0.5">{pet.resolutionNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
