import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { PageIntro } from "@/components/site-shell";
import { CANDIDATES, OFFICES } from "@/data/election";
import type { Candidate } from "@/data/types";

export const Route = createFileRoute("/candidates")({
  head: () => ({
    meta: [
      { title: "Candidates — KUPSA Elections 2026" },
      { name: "description", content: "Meet every cleared candidate for the KUPSA 2026 elections and read their plans." },
      { property: "og:title", content: "Meet the KUPSA 2026 candidates" },
      { property: "og:description", content: "Every cleared candidate and their plans, office by office." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CandidatesPage,
});

function CandidatesPage() {
  const [office, setOffice] = useState<string>("all");
  const [picked, setPicked] = useState<Candidate | null>(null);
  const offices = OFFICES.filter((o) => office === "all" || o.id === office);

  return (
    <>
      <PageIntro eyebrow="Candidates" title="Meet the people asking for your vote">
        Every candidate below has been checked by the Electoral Commission. Tap a card to read their plans.
      </PageIntro>

      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-2">
          {[{ id: "all", title: "All offices" }, ...OFFICES].map((o) => (
            <button
              key={o.id}
              onClick={() => setOffice(o.id)}
              className={`shrink-0 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors ${
                office === o.id ? "border-ink bg-ink text-ink-foreground" : "border-border hover:border-ink"
              }`}
            >
              {o.title}
            </button>
          ))}
        </div>

        <div className="mt-10 space-y-14">
          {offices.map((o) => {
            const list = CANDIDATES.filter((c) => c.officeId === o.id);
            return (
              <section key={o.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b pb-3">
                  <h2 className="text-3xl font-semibold">{o.title}</h2>
                  <span className="font-mono text-sm text-muted-foreground">
                    {list.length} candidate{list.length === 1 ? "" : "s"}
                  </span>
                </div>
                <p className="mt-3 max-w-2xl text-muted-foreground">{o.description}</p>
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setPicked(c)}
                      className="rounded-2xl border bg-card p-6 text-left shadow-card transition-all hover:-translate-y-1 hover:border-ink"
                    >
                      <div className="flex items-center gap-4">
                        <span className="bg-brand flex h-14 w-14 items-center justify-center rounded-full font-display text-xl font-semibold text-ink">
                          {c.initials}
                        </span>
                        <div>
                          <h3 className="text-xl font-semibold">{c.name}</h3>
                          <p className="text-sm text-muted-foreground">{c.yearOfStudy.replace("Bachelor of Pharmacy", "B.Pharm")}</p>
                        </div>
                      </div>
                      <p className="mt-4 line-clamp-3 text-muted-foreground">{c.manifestoSummary}</p>
                      <p className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-success">
                        <CheckCircle2 className="h-4 w-4" /> Cleared to run
                      </p>
                    </button>
                  ))}
                  {list.length === 0 && <p className="text-muted-foreground">No candidates yet.</p>}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {picked && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/60 p-0 sm:items-center sm:p-6" onClick={() => setPicked(null)}>
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border-2 border-ink bg-card p-7 shadow-pop animate-in slide-in-from-bottom-8 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <span className="bg-brand flex h-16 w-16 items-center justify-center rounded-full font-display text-2xl font-semibold text-ink">
                {picked.initials}
              </span>
              <button onClick={() => setPicked(null)} aria-label="Close" className="p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <h2 className="mt-4 text-3xl font-semibold">{picked.name}</h2>
            <p className="text-muted-foreground">
              {OFFICES.find((o) => o.id === picked.officeId)?.title} · {picked.yearOfStudy}
            </p>
            <p className="mt-5">{picked.manifestoSummary}</p>
            <h3 className="eyebrow mt-7 text-primary">Key promises</h3>
            <ul className="mt-3 space-y-3">
              {picked.manifestoPillars.map((p, i) => (
                <li key={p} className="flex gap-3">
                  <span className="font-mono text-sm text-primary">0{i + 1}</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <h3 className="eyebrow mt-7 text-primary">Commission checks</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {picked.complianceChecklist.map((r) => (
                <li key={r.rule} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" /> {r.rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
