import { createFileRoute } from "@tanstack/react-router";
import { Trophy, CheckCircle2 } from "lucide-react";
import { PageIntro } from "@/components/site-shell";
import { OFFICE_RESULTS, TURNOUT_METRICS } from "@/data/election";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Results — KUPSA Elections 2026" },
      { name: "description", content: "Verified results and turnout for every office in the KUPSA elections." },
      { property: "og:title", content: "KUPSA Elections results" },
      { property: "og:description", content: "Verified results and turnout for every office." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const t = TURNOUT_METRICS;
  return (
    <>
      <PageIntro eyebrow="Results · Preview" title="Who students chose">
        Sample results showing how the final page will look. Each result is signed off by every candidate's agent.
      </PageIntro>

      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto grid max-w-6xl grid-cols-3 px-5 py-8">
          {[
            ["Turnout", `${t.turnoutPercentage.toFixed(0)}%`],
            ["Ballots cast", t.ballotsCast.toLocaleString()],
            ["Registered", t.registeredTotal.toLocaleString()],
          ].map(([l, v]) => (
            <div key={l}>
              <p className="eyebrow opacity-60">{l}</p>
              <p className="mt-1 font-display text-3xl font-semibold md:text-5xl">{v}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-14 md:grid-cols-2">
        {OFFICE_RESULTS.map((r) => (
          <article key={r.officeId} className="rounded-2xl border bg-card p-6 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-2xl font-semibold">{r.officeTitle}</h2>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">{r.status}</span>
            </div>
            <ul className="mt-5 space-y-4">
              {r.candidateTallies.map((c) => (
                <li key={c.candidateId}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-semibold">
                      {c.isWinner && <Trophy className="h-4 w-4 text-primary" />} {c.candidateName}
                    </span>
                    <span className="font-mono">{c.votes} · {c.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full rounded-full ${c.isWinner ? "bg-brand" : "bg-ink/25"}`} style={{ width: `${c.percentage}%` }} />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-5 flex items-center gap-2 border-t pt-4 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-success" />
              {r.agentSignoffs.filter((a) => a.signed).length} of {r.agentSignoffs.length} agents signed · {r.spoiltOrBlanks} spoilt
            </p>
          </article>
        ))}
      </div>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <h2 className="text-3xl font-semibold">Turnout by year</h2>
        <div className="mt-6 space-y-4">
          {t.turnoutByCohort.map((c) => (
            <div key={c.year} className="grid grid-cols-[8rem_1fr_3.5rem] items-center gap-4 text-sm sm:grid-cols-[14rem_1fr_4rem]">
              <span className="font-medium">{c.year}</span>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div className="bg-brand h-full rounded-full" style={{ width: `${c.percentage}%` }} />
              </div>
              <span className="text-right font-mono">{c.percentage.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
