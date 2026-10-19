import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Lock, ShieldCheck, Users, Vote, FileCheck2, Plus, Minus } from "lucide-react";
import logo from "@/assets/kupsa-logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KUPSA Elections 2026 — Choose leaders who move us forward" },
      { name: "description", content: "Candidates, voting steps and results for the Kabarak University Pharmacy Students Association elections." },
      { property: "og:title", content: "KUPSA Elections 2026" },
      { property: "og:description", content: "Candidates, voting steps and results for the KUPSA elections." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const STATUS = [
  { label: "Status", value: "Getting ready", note: "3 of 5 checks done", live: true },
  { label: "Voting day", value: "First Friday, Nov", note: "Article 41(1)" },
  { label: "Run by", value: "Electoral Commission", note: "5 independent members" },
  { label: "Voters", value: "~1,000 students", note: "School of Pharmacy" },
];

const STEPS = [
  { icon: Users, title: "Meet the candidates", body: "Read every manifesto and see who has been cleared to run." },
  { icon: FileCheck2, title: "Confirm you can vote", body: "Check your registration with your student number before voting day." },
  { icon: Vote, title: "Cast a secret ballot", body: "Nobody — not even the Commission — can link your vote to you." },
  { icon: ShieldCheck, title: "See verified results", body: "Results signed by every candidate's agent, published within 24 hours." },
];

const ARTICLES = [
  { n: 39, t: "Who can vote", b: "Every registered pharmacy student in good standing may vote once, in person or through the official portal." },
  { n: 41, t: "When elections happen", b: "General elections are held on the first Friday of November each academic year." },
  { n: 46, t: "Announcing results", b: "The Commission declares official results within 24 hours of polls closing." },
  { n: 50, t: "The Electoral Commission", b: "Five members, independent of the sitting executive, run the election under the Patron's oversight." },
];

function Index() {
  const [open, setOpen] = useState<number | null>(39);
  return (
    <div>
      <section className="grain relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:py-24 lg:grid-cols-[1.25fr_1fr]">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="eyebrow text-primary">KUPSA General Elections · 2026</p>
            <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
              Choose leaders who <em className="text-brand font-normal">move us forward.</em>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              One student, one secret vote. Everything you need to take part in the Pharmacy Students Association election — in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/portal" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-primary-foreground shadow-pop transition-transform hover:-translate-y-0.5">
                Check if you can vote <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/candidates" className="inline-flex items-center rounded-full border-2 border-ink px-6 py-3.5 font-semibold hover:bg-ink hover:text-ink-foreground">
                Meet the candidates
              </Link>
            </div>
            <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4 text-primary" /> Your identity is never linked to your ballot.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-sm animate-in fade-in zoom-in-95 duration-1000">
            <div className="bg-brand absolute inset-0 -rotate-6 rounded-[2rem]" />
            <div className="relative rounded-[2rem] border-2 border-ink bg-card p-8 shadow-pop">
              <div className="flex items-center justify-between">
                <span className="eyebrow text-muted-foreground">Ballot · Specimen</span>
                <img src={logo.url} alt="" className="h-10 w-10" />
              </div>
              <h2 className="mt-6 text-2xl font-semibold">Chairperson</h2>
              <ul className="mt-5 space-y-3">
                {["Candidate A", "Candidate B", "Candidate C"].map((c, i) => (
                  <li key={c} className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 ${i === 1 ? "border-ink bg-accent" : "border-border"}`}>
                    <span className="font-medium">{c}</span>
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink text-xs font-bold ${i === 1 ? "bg-ink text-ink-foreground" : ""}`}>
                      {i === 1 ? "✓" : ""}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t pt-4 font-mono text-xs text-muted-foreground">Chapter 6 · Articles 39–55</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-5 lg:grid-cols-4">
          {STATUS.map((s) => (
            <div key={s.label} className="py-7 lg:px-6 lg:first:pl-0">
              <p className="eyebrow opacity-60">{s.label}</p>
              <p className="mt-2 flex items-center gap-2 text-lg font-semibold">
                {s.live && <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-sun" />}
                {s.value}
              </p>
              <p className="text-sm opacity-60">{s.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <p className="eyebrow text-primary">How it works</p>
        <h2 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight md:text-5xl">Four steps. One fair vote.</h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="group rounded-2xl border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:border-ink">
              <div className="flex items-center justify-between">
                <span className="bg-brand flex h-11 w-11 items-center justify-center rounded-xl text-ink">
                  <s.icon className="h-5 w-5" />
                </span>
                <span className="font-mono text-sm text-muted-foreground">0{i + 1}</span>
              </div>
              <h3 className="mt-6 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="rules" className="border-t bg-secondary/50">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="eyebrow text-primary">The rules</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight">What the constitution says</h2>
            <p className="mt-4 text-muted-foreground">Plain-language summaries of Chapter Six of the KUPSA Constitution.</p>
          </div>
          <div className="divide-y rounded-2xl border bg-card">
            {ARTICLES.map((a) => {
              const isOpen = open === a.n;
              return (
                <div key={a.n}>
                  <button onClick={() => setOpen(isOpen ? null : a.n)} className="flex w-full items-center gap-4 px-6 py-5 text-left">
                    <span className="font-mono text-sm text-primary">Art. {a.n}</span>
                    <span className="flex-1 text-lg font-semibold">{a.t}</span>
                    {isOpen ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  </button>
                  {isOpen && <p className="px-6 pb-6 text-muted-foreground animate-in fade-in">{a.b}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
