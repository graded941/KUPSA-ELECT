import React, { useState } from 'react';
import { ViewId, ElectionPhase } from '../types';
import {
  ArrowRight,
  ShieldCheck,
  Users,
  Vote,
  FileCheck2,
  Plus,
  Minus
} from 'lucide-react';
import { ElectionCountdown } from './ElectionCountdown';

interface OverviewViewProps {
  onNavigate: (view: ViewId) => void;
  onOpenAudit?: () => void;
  onOpenRehearsal?: () => void;
  currentPhase?: ElectionPhase;
}

const STATUS = [
  { label: 'Status', value: 'Getting ready', note: '3 of 5 checks done', live: true },
  { label: 'Voting day', value: 'First Friday, Nov', note: 'Article 41(1)', live: false },
  { label: 'Run by', value: 'Electoral Commission', note: '5 independent members', live: false },
  { label: 'Voters', value: '~1,000 students', note: 'School of Pharmacy', live: false },
];

const STEPS = [
  {
    icon: Users,
    title: 'Meet the candidates',
    body: 'Read every manifesto, vetting clearance report, and compliance check before voting.',
    target: 'candidates' as ViewId,
    ctaText: 'View Candidates'
  },
  {
    icon: FileCheck2,
    title: 'Confirm you can vote',
    body: 'Check your voter eligibility with your university registration number before polling opens.',
    target: 'portal' as ViewId,
    ctaText: 'Check Eligibility'
  },
  {
    icon: Vote,
    title: 'Cast a secret ballot',
    body: 'Nobody — not even the Commission — can link your cast ballot back to your identity.',
    target: 'portal' as ViewId,
    ctaText: 'Voting Simulator'
  },
  {
    icon: ShieldCheck,
    title: 'See verified results',
    body: 'Results are verified by every candidate agent and certified under the Patron’s oversight.',
    target: 'results' as ViewId,
    ctaText: 'Election Tallies'
  },
];

const ARTICLES = [
  {
    n: 39,
    t: 'Who can vote',
    b: 'Every registered pharmacy student in good standing may vote once, in person or through the official electronic portal.'
  },
  {
    n: 41,
    t: 'When elections happen',
    b: 'General elections are held on the first Friday of November each academic year following statutory notice.'
  },
  {
    n: 46,
    t: 'Announcing results',
    b: 'The Returning Officer declares certified official results within 24 hours of polls closing with agent signatures.'
  },
  {
    n: 50,
    t: 'The Electoral Commission',
    b: 'Five members, independent of the sitting executive, oversee the election under the School Patron’s constitutional supervision.'
  },
];

export function OverviewView({ onNavigate, onOpenAudit, onOpenRehearsal, currentPhase }: OverviewViewProps) {
  const [openArticle, setOpenArticle] = useState<number | null>(39);

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="grain relative overflow-hidden border-b border-border bg-background">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 py-12 sm:py-16 md:py-24 lg:grid-cols-[1.25fr_1fr]">
          {/* Left Column */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="eyebrow text-primary">KUPSA General Elections · 2026</p>
            <h1 className="mt-4 sm:mt-5 font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.04] tracking-tight text-foreground">
              Choose leaders who{' '}
              <em className="text-brand font-normal italic">move us forward.</em>
            </h1>
            <p className="mt-5 sm:mt-6 max-w-lg text-base sm:text-lg text-muted-foreground leading-relaxed">
              One student, one secret vote. Everything you need to take part in the Pharmacy Students Association election — in one constitutional hub.
            </p>

            <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row flex-wrap gap-3">
              <button
                onClick={() => onNavigate('portal')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-primary-foreground shadow-pop transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Sign in</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => onNavigate('candidates')}
                className="inline-flex items-center justify-center rounded-full border-2 border-ink bg-card px-6 py-3.5 font-semibold text-foreground hover:bg-ink hover:text-ink-foreground transition-colors"
              >
                Meet the candidates
              </button>
            </div>
          </div>

          {/* Right Column: Specimen Ballot Card */}
          <div className="relative mx-auto w-full max-w-sm sm:max-w-md animate-in fade-in zoom-in-95 duration-700">
            {/* Tilted Gradient Underlay */}
            <div className="bg-brand absolute inset-0 -rotate-3 sm:-rotate-6 rounded-[2rem] opacity-90 transition-transform group-hover:rotate-0" />

            {/* Specimen Card */}
            <div className="relative rounded-[2rem] border-2 border-ink bg-card p-6 sm:p-8 shadow-pop">
              <div className="flex items-center justify-end">
                <img
                  src="/kupsa-logo.png"
                  alt="KUPSA"
                  className="h-10 w-10 object-contain rounded-full shadow-xs"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              <h2 className="mt-5 font-display text-2xl font-semibold text-foreground">
                Chairperson
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Select exactly one cleared candidate</p>

              <ul className="mt-5 space-y-3">
                {[
                  { name: 'Amina Muthoni', selected: false, initials: 'AM' },
                  { name: 'Brian Kiprop', selected: true, initials: 'BK' },
                  { name: 'Faith Chebet', selected: false, initials: 'FC' },
                ].map((c) => (
                  <li
                    key={c.name}
                    className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 transition-colors ${
                      c.selected
                        ? 'border-ink bg-accent/70 shadow-xs'
                        : 'border-border bg-background/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary font-mono text-xs font-semibold text-foreground">
                        {c.initials}
                      </span>
                      <span className="font-medium text-foreground">{c.name}</span>
                    </div>
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink text-xs font-bold ${
                        c.selected ? 'bg-ink text-ink-foreground' : 'bg-card'
                      }`}
                    >
                      {c.selected ? '✓' : ''}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 pt-3 border-t border-border">
                <button
                  onClick={() => onNavigate('portal')}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary/50 py-2.5 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
                >
                  <span>Test Voting Flow in Vote</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between font-mono text-xs text-muted-foreground">
                <span>Chapter 6 · Articles 39–55</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Election Countdown Section */}
      <section className="bg-background py-8 sm:py-12 border-b border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ElectionCountdown onNavigate={onNavigate} currentPhase={currentPhase} />
        </div>
      </section>

      {/* Dark Stat Strip */}
      <section className="bg-ink text-ink-foreground border-b border-white/10">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-4 sm:px-6 lg:grid-cols-4">
          {STATUS.map((s) => (
            <div key={s.label} className="py-6 sm:py-7 lg:px-6 lg:first:pl-0">
              <p className="eyebrow opacity-60 text-sun">{s.label}</p>
              <p className="mt-1.5 flex items-center gap-2 font-display text-lg sm:text-xl font-semibold">
                {s.live && <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-sun shrink-0" />}
                {s.value}
              </p>
              <p className="mt-0.5 text-xs sm:text-sm opacity-60 font-mono">{s.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works: Four Steps */}
      <section id="how" className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20 md:py-28">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="eyebrow text-primary">How it works</p>
            <h2 className="mt-3 max-w-xl font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
              Four steps. One fair vote.
            </h2>
          </div>
          <button
            onClick={() => onNavigate('rules')}
            className="text-sm font-semibold text-primary hover:underline self-start md:self-auto flex items-center gap-1.5"
          >
            Read Chapter Six Constitution <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-10 sm:mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                onClick={() => onNavigate(s.target)}
                className="group cursor-pointer rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:border-ink hover:shadow-pop flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="bg-brand flex h-11 w-11 items-center justify-center rounded-xl text-ink shadow-xs">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-sm font-semibold text-muted-foreground">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {s.body}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-primary">
                  <span>{s.ctaText}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Rules & Constitution Accordion */}
      <section id="rules" className="border-t border-border bg-secondary/40 py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 sm:gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="eyebrow text-primary">The rules</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
              What the constitution says
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Plain-language summaries of Chapter Six of the KUPSA Constitution. Every stage has an explicit constitutional mandate.
            </p>

            <div className="mt-8 space-y-3">
              <button
                onClick={() => onNavigate('rules')}
                className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-ink-foreground hover:bg-primary transition-colors"
              >
                <span>View all constitutional articles</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="divide-y divide-border rounded-2xl border-2 border-border bg-card shadow-card">
            {ARTICLES.map((a) => {
              const isOpen = openArticle === a.n;
              return (
                <div key={a.n}>
                  <button
                    onClick={() => setOpenArticle(isOpen ? null : a.n)}
                    className="flex w-full items-center gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left transition-colors hover:bg-muted/30"
                  >
                    <span className="font-mono text-sm font-semibold text-primary">
                      Art. {a.n}
                    </span>
                    <span className="flex-1 font-display text-lg font-semibold text-foreground">
                      {a.t}
                    </span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-foreground">
                      {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed animate-in fade-in duration-200">
                      <p>{a.b}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
