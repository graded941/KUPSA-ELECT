import React, { useState } from 'react';
import { ViewId } from '../types';
import { CONSTITUTIONAL_ARTICLES } from '../data/election';
import { PageIntro } from './site-shell';
import { Minus, Plus, BookOpen, ShieldCheck, ArrowRight } from 'lucide-react';
import { ConstitutionalPetitionModal } from './ConstitutionalPetitionModal';

interface RulesViewProps {
  onNavigate: (view: ViewId) => void;
  onOpenAudit?: () => void;
}

export function RulesView({ onNavigate, onOpenAudit }: RulesViewProps) {
  const [openArticle, setOpenArticle] = useState<number | null>(
    CONSTITUTIONAL_ARTICLES[0]?.number ?? 39
  );
  const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);

  return (
    <>
      <PageIntro eyebrow="The rules" title="How the election works, by the book">
        Chapter Six of the KUPSA Constitution establishes the supreme legal framework governing voter franchise, candidate qualification, voting procedures, and disputes.
      </PageIntro>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-14 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <BookOpen className="h-4 w-4 text-primary" />
            <span>Chapter Six: Electoral Regulations (Articles 39–55)</span>
          </div>
          {onOpenAudit && (
            <button
              onClick={onOpenAudit}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 font-mono"
            >
              <span>Inspect Commission Audit Checklist</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Articles Accordion */}
        <div className="divide-y divide-border rounded-2xl border-2 border-border bg-card shadow-card">
          {CONSTITUTIONAL_ARTICLES.map((a) => {
            const isOpen = openArticle === a.number;
            return (
              <div key={a.number}>
                <button
                  onClick={() => setOpenArticle(isOpen ? null : a.number)}
                  className="flex w-full items-center gap-4 px-5 sm:px-6 py-5 text-left transition-colors hover:bg-muted/30"
                >
                  <span className="w-16 shrink-0 font-mono text-sm font-semibold text-primary">
                    Art. {a.number}
                  </span>
                  <span className="flex-1 font-display text-lg sm:text-xl font-semibold text-foreground">
                    {a.title}
                  </span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-foreground shrink-0">
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 animate-in fade-in duration-200 sm:pl-24">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {a.summary}
                    </p>

                    <div className="mt-4 rounded-xl bg-secondary/50 p-4 border border-border">
                      <p className="eyebrow text-primary text-[10px] mb-2.5">
                        Statutory Requirements
                      </p>
                      <ul className="space-y-2 text-xs sm:text-sm text-foreground">
                        {a.keyRequirements.map((k) => (
                          <li key={k} className="flex items-start gap-2.5">
                            <span className="bg-brand mt-1.5 h-2 w-2 shrink-0 rounded-full" />
                            <span>{k}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="rounded-2xl border border-border bg-secondary/40 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-display text-base font-semibold text-foreground">
              Have a constitutional appeal or petition?
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Under Article 51, any disputed procedure can be petitioned to the Commission and Patron within 48 hours.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAppealModalOpen(true)}
            className="rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-ink-foreground hover:bg-primary transition-colors shrink-0 shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>File an appeal</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Constitutional Article 51 Petition & Appeal Filing Modal */}
      <ConstitutionalPetitionModal
        isOpen={isAppealModalOpen}
        onClose={() => setIsAppealModalOpen(false)}
      />
    </>
  );
}
