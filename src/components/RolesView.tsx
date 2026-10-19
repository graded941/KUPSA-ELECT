import React from 'react';
import { ViewId } from '../types';
import { OFFICES } from '../data/election';
import { PageIntro } from './site-shell';
import { ArrowRight, ShieldCheck, Users } from 'lucide-react';

interface RolesViewProps {
  onNavigate: (view: ViewId) => void;
}

const COMMISSION_ROLES = [
  {
    title: 'Returning Officer',
    mandate: 'Presides over election operations, tallies accredited ballots, verifies agent sign-offs, and officially declares certified winners.',
    article: 'Article 50(1)',
  },
  {
    title: 'Commission Secretary',
    mandate: 'Custody of voter registration rolls, candidate nomination dockets, official notices, and statutory minutes.',
    article: 'Article 50(2)',
  },
  {
    title: 'ICT Systems Officer',
    mandate: 'Responsible for cryptographic ballot integrity, digital eligibility portal uptime, and hash-chain verification audit.',
    article: 'Article 50(3)',
  },
  {
    title: 'Observer Coordinator',
    mandate: 'Liaises with independent student and faculty observers, monitoring polling stations and enforcing the Code of Conduct.',
    article: 'Article 50(4)',
  },
  {
    title: 'School Patron',
    mandate: 'Senior faculty member who acts as supreme constitutional arbiter, oversees fair conduct, and adjudicates appeals within 48h.',
    article: 'Article 51(3)',
  },
];

export function RolesView({ onNavigate }: RolesViewProps) {
  return (
    <>
      <PageIntro eyebrow="Roles" title="Who you're electing">
        {OFFICES.length} executive portfolios are contested on the ballot. Each executive officer serves a constitutional term of one academic year.
      </PageIntro>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14 space-y-16">
        {/* Executive Offices */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-border pb-4">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-foreground">
              Executive Committee Portfolios
            </h2>
            <button
              onClick={() => onNavigate('candidates')}
              className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>See cleared candidates</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {OFFICES.map((o) => (
              <article
                key={o.id}
                className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-card hover:border-ink transition-colors"
              >
                <div>
                  <p className="eyebrow text-primary">{o.constitutionalArticle}</p>
                  <h3 className="mt-2 font-display text-2xl font-semibold text-foreground">
                    {o.title}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {o.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <span>
                    {o.seats} seat · {o.term}
                  </span>
                  <button
                    onClick={() => onNavigate('candidates')}
                    className="font-sans font-semibold text-primary hover:underline"
                  >
                    View →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Electoral Commission Roles */}
        <section className="rounded-3xl border-2 border-border bg-secondary/50 p-6 sm:p-10">
          <div className="flex items-center gap-3">
            <span className="bg-brand flex h-10 w-10 items-center justify-center rounded-xl text-ink shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="eyebrow text-primary">Independent Oversight</p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-foreground">
                Who runs the election
              </h2>
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            Under Chapter Six, Article 50 of the KUPSA Constitution, elections are administered by an independent 5-member Electoral Commission under faculty Patron guidance.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {COMMISSION_ROLES.map((c) => (
              <div
                key={c.title}
                className="rounded-2xl border border-border bg-card p-5 shadow-xs"
              >
                <span className="font-mono text-[10px] text-primary font-semibold uppercase">
                  {c.article}
                </span>
                <h4 className="mt-1 font-display text-lg font-semibold text-foreground">
                  {c.title}
                </h4>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  {c.mandate}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
