import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Circle, ShieldAlert } from "lucide-react";
import { PageIntro } from "@/components/site-shell";
import { READINESS_GATES, OBSERVER_AUDIT_LOGS, SAMPLE_DISPUTES, CONTINGENCY_PROTOCOLS } from "@/data/election";

export const Route = createFileRoute("/commission")({
  head: () => ({
    meta: [
      { title: "Commission workspace — KUPSA Elections" },
      { name: "description", content: "Readiness checks, activity log, disputes and backup plans for the KUPSA Electoral Commission." },
      { property: "og:title", content: "KUPSA Electoral Commission workspace" },
      { property: "og:description", content: "Readiness checks, activity log, disputes and backup plans." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CommissionPage,
});

const TABS = ["Readiness", "Activity log", "Disputes", "Backup plans"] as const;

function CommissionPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Readiness");
  const done = READINESS_GATES.filter((g) => g.completed).length;
  return (
    <>
      <PageIntro eyebrow="For the Electoral Commission" title="Commission workspace">
        {done} of {READINESS_GATES.length} readiness stages complete. Sample data shown.
      </PageIntro>
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`rounded-full border-2 px-4 py-2 text-sm font-semibold ${tab === t ? "border-ink bg-ink text-ink-foreground" : "border-border hover:border-ink"}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === "Readiness" && (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {READINESS_GATES.map((g) => (
              <article key={g.id} className="rounded-2xl border bg-card p-6 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="eyebrow text-primary">Stage {g.number} · {g.constitutionalArticle}</p>
                    <h2 className="mt-2 text-xl font-semibold">{g.title}</h2>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${g.completed ? "bg-success text-primary-foreground" : "bg-accent"}`}>
                    {g.completed ? "Done" : `${g.blockersCount} to do`}
                  </span>
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  {g.items.map((i) => (
                    <li key={i.id} className="flex gap-2">
                      {i.verified ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
                      <span>{i.label}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}

        {tab === "Activity log" && (
          <div className="mt-8 divide-y rounded-2xl border bg-card">
            {OBSERVER_AUDIT_LOGS.map((l) => (
              <div key={l.id} className="grid gap-1 p-5 md:grid-cols-[10rem_1fr_8rem]">
                <span className="font-mono text-xs text-muted-foreground">{l.timestamp}</span>
                <div>
                  <p className="font-semibold">{l.action}</p>
                  <p className="text-sm text-muted-foreground">{l.stage} · {l.actorRole}</p>
                </div>
                <span className="text-sm font-semibold text-primary md:text-right">{l.status}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "Disputes" && (
          <div className="mt-8 space-y-4">
            {SAMPLE_DISPUTES.map((d) => (
              <article key={d.id} className="rounded-2xl border bg-card p-6 shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-xl font-semibold">{d.officeContested}</h2>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">{d.status}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Filed by {d.complainantName} ({d.complainantRole}) · {d.timestamp}</p>
                <p className="mt-3">{d.constitutionalGrounds}</p>
              </article>
            ))}
          </div>
        )}

        {tab === "Backup plans" && (
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {CONTINGENCY_PROTOCOLS.map((c) => (
              <article key={c.id} className="rounded-2xl border bg-card p-6 shadow-card">
                <ShieldAlert className="h-6 w-6 text-primary" />
                <h2 className="mt-3 text-lg font-semibold">{c.scenario}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{c.mitigation}</p>
                <p className="mt-4 border-t pt-3 text-sm font-medium">{c.actionRequired}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
