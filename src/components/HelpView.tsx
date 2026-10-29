import React, { useState, type FormEvent } from 'react';
import { ViewId, DisputeSubmission } from '../types';
import { OFFICES } from '../data/election';
import { PageIntro } from './site-shell';
import { CheckCircle2, LifeBuoy, Scale, MapPin, Mail, Clock, Download, ExternalLink } from 'lucide-react';
import { submitConstitutionalPetition } from '../lib/electionService';
import { ConstitutionalPetitionModal } from './ConstitutionalPetitionModal';

interface HelpViewProps {
  onNavigate: (view: ViewId) => void;
}

const inputClass =
  'w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-sm focus:border-ink focus:outline-none transition-colors';

function SentFeedback({ text, onReset }: { text: string; onReset: () => void }) {
  return (
    <div className="py-10 text-center space-y-3 animate-in fade-in">
      <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
      <p className="font-display text-lg font-semibold text-foreground">{text}</p>
      <button
        onClick={onReset}
        className="text-xs font-semibold text-primary underline hover:text-foreground cursor-pointer"
      >
        Submit another request
      </button>
    </div>
  );
}

export function HelpView({ onNavigate }: HelpViewProps) {
  const [helpSent, setHelpSent] = useState(false);
  const [appealSent, setAppealSent] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Real appeal form state
  const [appealName, setAppealName] = useState('');
  const [appealRegNo, setAppealRegNo] = useState('');
  const [appealRole, setAppealRole] = useState('Enrolled Voter');
  const [appealOffice, setAppealOffice] = useState(OFFICES[0]?.title || 'Chairperson');
  const [appealGrounds, setAppealGrounds] = useState('');
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);
  const [filedDocket, setFiledDocket] = useState<DisputeSubmission | null>(null);

  const handleHelpSubmit = (e: FormEvent) => {
    e.preventDefault();
    setHelpSent(true);
  };

  const handleAppealSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!appealName.trim() || !appealRegNo.trim() || !appealGrounds.trim()) return;

    setIsSubmittingAppeal(true);
    try {
      const res = await submitConstitutionalPetition({
        petitionerName: appealName.trim(),
        regNo: appealRegNo.trim().toUpperCase(),
        petitionerRole: appealRole,
        officeContested: `${appealOffice} Portfolio`,
        grounds: appealGrounds.trim(),
        remedy: 'Formal hearing and adjudication by Commission and Patron within 48h',
        articlesCited: ['Article 51', 'Article 46'],
      });

      if (res.success && res.petition) {
        setFiledDocket(res.petition);
        setAppealSent(true);
      }
    } catch (_err) {
      // Handled inside submitConstitutionalPetition
    } finally {
      setIsSubmittingAppeal(false);
    }
  };

  return (
    <>
      <PageIntro eyebrow="Help & appeals" title="We're here to help">
        Have questions regarding voter eligibility, polling logistics, or wish to challenge an electoral declaration within the statutory 48-hour period? Our secretariat is on standby.
      </PageIntro>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14 space-y-12">
        {/* Quick Help Info Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-start gap-3">
            <span className="bg-brand flex h-10 w-10 items-center justify-center rounded-xl text-ink shrink-0">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display font-semibold text-foreground">Physical Secretariat</p>
              <p className="text-xs text-muted-foreground mt-0.5">Room PH-104, School of Pharmacy</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-start gap-3">
            <span className="bg-brand flex h-10 w-10 items-center justify-center rounded-xl text-ink shrink-0">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display font-semibold text-foreground">Official Email</p>
              <p className="text-xs text-muted-foreground mt-0.5">elections@kupsa.kabarak.ac.ke</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-start gap-3">
            <span className="bg-brand flex h-10 w-10 items-center justify-center rounded-xl text-ink shrink-0">
              <Clock className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display font-semibold text-foreground">Statutory Deadline</p>
              <p className="text-xs text-muted-foreground mt-0.5">Petitions must be filed within 48h</p>
            </div>
          </div>
        </div>

        {/* Two Forms Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Form 1: Helpdesk */}
          <section className="flex flex-col justify-between rounded-2xl border-2 border-border bg-card p-6 sm:p-8 shadow-card">
            <div>
              <div className="flex items-center gap-3">
                <span className="bg-secondary flex h-10 w-10 items-center justify-center rounded-xl text-foreground">
                  <LifeBuoy className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-2xl font-semibold text-foreground">Helpdesk</h3>
                  <p className="text-xs text-muted-foreground">
                    Assistance with student registration, portal access, or dues clearance.
                  </p>
                </div>
              </div>

              {helpSent ? (
                <SentFeedback
                  text="Inquiry received! The Commission Helpdesk will respond to your university email within 4 hours."
                  onReset={() => setHelpSent(false)}
                />
              ) : (
                <form onSubmit={handleHelpSubmit} className="mt-6 space-y-4">
                  <input required className={inputClass} placeholder="Your full name" />
                  <input
                    required
                    className={`${inputClass} font-mono uppercase`}
                    placeholder="Student registration number (e.g. PHAM/M/0000/00/00)"
                  />
                  <input required type="email" className={inputClass} placeholder="Student email address" />
                  <textarea
                    required
                    rows={4}
                    className={inputClass}
                    placeholder="How can we assist you with voter clearance or polling?"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-ink px-6 py-3 font-semibold text-sm text-ink-foreground hover:bg-primary transition-colors shadow-xs cursor-pointer"
                  >
                    Send question to Helpdesk
                  </button>
                </form>
              )}
            </div>
          </section>

          {/* Form 2: Official Appeal */}
          <section className="flex flex-col justify-between rounded-2xl border-2 border-ink bg-card p-6 sm:p-8 shadow-pop">
            <div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="bg-brand flex h-10 w-10 items-center justify-center rounded-xl text-ink">
                    <Scale className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-2xl font-semibold text-foreground">File an appeal</h3>
                    <p className="text-xs text-muted-foreground">
                      Article 51 Petitions reviewed directly by the Commission and the Patron.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-foreground underline cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Interactive Docket</span>
                </button>
              </div>

              {appealSent && filedDocket ? (
                <div className="py-8 space-y-4 animate-in fade-in text-center sm:text-left">
                  <div className="flex items-center gap-3 justify-center sm:justify-start">
                    <CheckCircle2 className="h-8 w-8 text-success" />
                    <div>
                      <h4 className="font-display text-lg font-bold text-foreground">
                        Formal Petition Docketed!
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Concurrent transmission confirmed to Commission and School Patron under Article 51.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-secondary/30 p-3.5 text-xs font-mono space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Docket Reference:</span>
                      <strong className="text-primary">{filedDocket.id}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Petitioner:</span>
                      <span>{filedDocket.complainantName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Patron Transmittal Hash:</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">{filedDocket.transmittalHash}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Statutory Deadline:</span>
                      <span className="text-amber-600 font-bold">Within 48 Hours</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                      Track Live Docket & Rulings
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAppealSent(false);
                        setFiledDocket(null);
                        setAppealGrounds('');
                      }}
                      className="px-4 py-2 rounded-full border border-border text-foreground text-xs font-semibold hover:bg-secondary/50 transition-colors cursor-pointer"
                    >
                      Submit Another Petition
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAppealSubmit} className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      required
                      value={appealName}
                      onChange={(e) => setAppealName(e.target.value)}
                      className={inputClass}
                      placeholder="Petitioner's full name"
                    />
                    <input
                      required
                      value={appealRegNo}
                      onChange={(e) => setAppealRegNo(e.target.value)}
                      className={`${inputClass} font-mono uppercase`}
                      placeholder="Reg No (e.g. PHARM/2024/1882)"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      required
                      value={appealRole}
                      onChange={(e) => setAppealRole(e.target.value)}
                      className={inputClass}
                    >
                      <option value="Enrolled Voter">Enrolled Voter</option>
                      <option value="Cleared Candidate">Cleared Candidate</option>
                      <option value="Official Candidate's Agent">Official Candidate's Agent</option>
                      <option value="Accredited Observer">Accredited Observer</option>
                    </select>
                    <select
                      required
                      value={appealOffice}
                      onChange={(e) => setAppealOffice(e.target.value)}
                      className={inputClass}
                    >
                      {OFFICES.map((o) => (
                        <option key={o.id} value={o.title}>{o.title} Portfolio</option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    required
                    rows={4}
                    value={appealGrounds}
                    onChange={(e) => setAppealGrounds(e.target.value)}
                    className={inputClass}
                    placeholder="Describe what occurred, citing relevant constitutional articles (e.g. Art. 44, Art. 46, Art. 51)..."
                  />
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <button
                      type="submit"
                      disabled={isSubmittingAppeal}
                      className="w-full sm:w-auto rounded-full bg-primary px-6 py-3 font-semibold text-sm text-primary-foreground shadow-xs hover:bg-ink transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingAppeal ? 'Docketing Petition...' : 'Submit formal appeal (Article 51)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="text-xs font-semibold text-muted-foreground hover:text-foreground underline cursor-pointer"
                    >
                      Open Full Constitutional Tribunal Modal
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>

      <ConstitutionalPetitionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
