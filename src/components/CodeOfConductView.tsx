import React, { useState } from 'react';
import { ViewId } from '../types';
import { PageIntro } from './site-shell';
import { Check, X, ShieldAlert, Send, CheckCircle2, AlertTriangle } from 'lucide-react';

interface CodeOfConductViewProps {
  onNavigate: (view: ViewId) => void;
}

const SECTIONS = [
  {
    who: 'Candidates',
    article: 'Article 44(1)',
    description: 'Statutory ethical standards for all approved nominees across campaigns and media.',
    dos: [
      'Campaign strictly during the official gazetted campaign period',
      'Affix campaign materials only on designated School of Pharmacy notice boards',
      'Debate clinical, academic, and student welfare policies respectfully',
      'Submit complete campaign expenditure statements to the Commission',
    ],
    donts: [
      'Offer cash, academic assignment favors, or material gifts in exchange for votes',
      'Defame, harass, or circulate unverified allegations against opponents',
      'Campaign within 100 meters of polling stations on voting day',
      'Utilize university or KUPSA institutional assets for personal campaigning',
    ],
  },
  {
    who: 'Candidate Agents',
    article: 'Article 44(2)',
    description: 'Accredited representatives witnessing voter accreditation, counting, and certification.',
    dos: [
      'Wear official Commission-issued biometric accreditation badges at all times',
      'Observe the seal verification, ballot box inspection, and live digital tally',
      'Submit written objections to the Returning Officer before results declaration',
      'Witness the final tally sheet and affix statutory signatures',
    ],
    donts: [
      'Interfere with voters while they make their secret selections',
      'Physically touch or handle ballots or the digital ballot box console',
      'Announce unofficial or preliminary figures before certified declaration',
      'Engage in voter intimidation or harassment in polling zones',
    ],
  },
  {
    who: 'Student Voters',
    article: 'Article 44(3)',
    description: 'Rights and responsibilities of the pharmacy electorate.',
    dos: [
      'Exercise your democratic franchise by casting one secret vote',
      'Carry your university student identity card for accreditation',
      'Promptly report attempted bribery, coercion, or vote-buying',
      'Respect the peaceful exercise of voting by fellow pharmacy students',
    ],
    donts: [
      'Capture photographs or screenshots of your secret ballot paper',
      'Impersonate another registered student or attempt duplicate voting',
      'Trade, sell, or solicit inducements for your ballot token',
      'Disrupt polling stations or spread misinformation during voting hours',
    ],
  },
];

export function CodeOfConductView({ onNavigate }: CodeOfConductViewProps) {
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportForm, setReportForm] = useState({
    name: '',
    regNo: '',
    offenderName: '',
    category: 'Voter Intimidation / Coercion',
    evidenceDetails: '',
  });

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setReportForm({
        name: '',
        regNo: '',
        offenderName: '',
        category: 'Voter Intimidation / Coercion',
        evidenceDetails: '',
      });
    }, 4000);
  };

  return (
    <>
      <PageIntro eyebrow="Code of conduct · Art. 44" title="Play fair. Win fair.">
        Everyone taking part in KUPSA elections is bound by Article 44 of the Constitution. Material violations carry penalties up to immediate disqualification.
      </PageIntro>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14 space-y-12">
        {/* Sections for Candidates, Agents, Voters */}
        <div className="space-y-8">
          {SECTIONS.map((s) => (
            <section
              key={s.who}
              className="rounded-2xl border-2 border-border bg-card p-6 sm:p-8 shadow-card"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-4">
                <div>
                  <h3 className="font-display text-2xl sm:text-3xl font-semibold text-foreground">
                    {s.who}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    {s.description}
                  </p>
                </div>
                <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  {s.article}
                </span>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {/* DOs */}
                <div className="rounded-xl bg-success/5 border border-success/20 p-5">
                  <p className="eyebrow text-success mb-3 flex items-center gap-1.5 font-bold">
                    <Check className="h-4 w-4" /> Required Conduct (Do)
                  </p>
                  <ul className="space-y-3 text-xs sm:text-sm text-foreground">
                    {s.dos.map((d) => (
                      <li key={d} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* DONTs */}
                <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-5">
                  <p className="eyebrow text-destructive mb-3 flex items-center gap-1.5 font-bold">
                    <X className="h-4 w-4" /> Prohibited Acts (Don't)
                  </p>
                  <ul className="space-y-3 text-xs sm:text-sm text-foreground">
                    {s.donts.map((d) => (
                      <li key={d} className="flex items-start gap-2.5">
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Incident Reporting Section */}
        <section className="rounded-3xl border-2 border-ink bg-card p-6 sm:p-10 shadow-pop">
          <div className="max-w-2xl space-y-2">
            <span className="eyebrow text-primary">Confidential Integrity Reporting</span>
            <h3 className="font-display text-2xl sm:text-3xl font-semibold text-foreground">
              Report an Election Code Violation
            </h3>
            <p className="text-sm text-muted-foreground">
              Witnessed bribery, campaign harassment, or unauthorised polling interference? Lodge an expedited report directly with the Observer Coordinator and Patron.
            </p>
          </div>

          {reportSubmitted ? (
            <div className="mt-8 rounded-2xl bg-success/10 border border-success/30 p-6 text-center space-y-2 animate-in fade-in">
              <CheckCircle2 className="h-10 w-10 text-success mx-auto" />
              <h4 className="font-display text-lg font-semibold text-foreground">
                Violation Incident Logged
              </h4>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Your incident report has been securely transmitted to the Electoral Commission and School Patron for immediate review under Article 44 enforcement procedures.
              </p>
            </div>
          ) : (
            <form onSubmit={handleReportSubmit} className="mt-8 space-y-4 max-w-2xl">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Your Name (Optional / Anonymous)
                  </label>
                  <input
                    value={reportForm.name}
                    onChange={(e) => setReportForm({ ...reportForm, name: e.target.value })}
                    placeholder="e.g. Student Witness"
                    className="w-full rounded-xl border-2 border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Your Registration Number
                  </label>
                  <input
                    value={reportForm.regNo}
                    onChange={(e) => setReportForm({ ...reportForm, regNo: e.target.value })}
                    placeholder="PHARM/2024/..."
                    className="w-full rounded-xl border-2 border-border bg-background px-3.5 py-2.5 text-sm font-mono uppercase outline-none focus:border-ink"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Violation Category
                  </label>
                  <select
                    value={reportForm.category}
                    onChange={(e) => setReportForm({ ...reportForm, category: e.target.value })}
                    className="w-full rounded-xl border-2 border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-ink"
                  >
                    <option>Voter Intimidation / Coercion</option>
                    <option>Illegal Vote Buying / Material Inducement</option>
                    <option>Campaigning on Polling Day</option>
                    <option>Defamation or Character Smear</option>
                    <option>Misuse of Association Assets</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Person or Campaign Involved
                  </label>
                  <input
                    required
                    value={reportForm.offenderName}
                    onChange={(e) =>
                      setReportForm({ ...reportForm, offenderName: e.target.value })
                    }
                    placeholder="e.g. Campaign Team X"
                    className="w-full rounded-xl border-2 border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-ink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Incident Description & Evidence
                </label>
                <textarea
                  required
                  rows={3}
                  value={reportForm.evidenceDetails}
                  onChange={(e) =>
                    setReportForm({ ...reportForm, evidenceDetails: e.target.value })
                  }
                  placeholder="Specify location, approximate time, and nature of the infraction observed..."
                  className="w-full rounded-xl border-2 border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-ink"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-pop hover:bg-ink transition-all"
                >
                  Submit Incident to Commission
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </>
  );
}
