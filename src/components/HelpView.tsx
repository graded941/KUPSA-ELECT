import React, { useState, type FormEvent } from 'react';
import { ViewId } from '../types';
import { OFFICES } from '../data/election';
import { PageIntro } from './site-shell';
import { CheckCircle2, LifeBuoy, Scale, MapPin, Mail, Clock } from 'lucide-react';

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
        className="text-xs font-semibold text-primary underline hover:text-foreground"
      >
        Submit another request
      </button>
    </div>
  );
}

export function HelpView({ onNavigate }: HelpViewProps) {
  const [helpSent, setHelpSent] = useState(false);
  const [appealSent, setAppealSent] = useState(false);

  const submit = (setter: (v: boolean) => void) => (e: FormEvent) => {
    e.preventDefault();
    setter(true);
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
                <form onSubmit={submit(setHelpSent)} className="mt-6 space-y-4">
                  <input required className={inputClass} placeholder="Your full name" />
                  <input
                    required
                    className={`${inputClass} font-mono uppercase`}
                    placeholder="Student registration number (e.g. PHARM/2023/...)"
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
                    className="rounded-full bg-ink px-6 py-3 font-semibold text-sm text-ink-foreground hover:bg-primary transition-colors shadow-xs"
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

              {appealSent ? (
                <SentFeedback
                  text="Formal appeal logged into statutory docket! The School Patron has been notified and a hearing will be convened within 48 hours."
                  onReset={() => setAppealSent(false)}
                />
              ) : (
                <form onSubmit={submit(setAppealSent)} className="mt-6 space-y-4">
                  <input required className={inputClass} placeholder="Petitioner's full name" />
                  <select required className={inputClass} defaultValue="">
                    <option value="" disabled>
                      I am filing as a…
                    </option>
                    <option>Enrolled Voter</option>
                    <option>Cleared Candidate</option>
                    <option>Official Candidate's Agent</option>
                  </select>
                  <select required className={inputClass} defaultValue="">
                    <option value="" disabled>
                      Which contested portfolio?
                    </option>
                    {OFFICES.map((o) => (
                      <option key={o.id}>{o.title}</option>
                    ))}
                  </select>
                  <textarea
                    required
                    rows={4}
                    className={inputClass}
                    placeholder="Describe what occurred, citing relevant constitutional articles (e.g. Art. 44, Art. 46)..."
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-primary px-6 py-3 font-semibold text-sm text-primary-foreground shadow-xs hover:bg-ink transition-colors"
                  >
                    Submit formal appeal
                  </button>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
