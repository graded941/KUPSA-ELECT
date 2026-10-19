import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { PageIntro } from "@/components/site-shell";
import { CONSTITUTIONAL_ARTICLES } from "@/data/election";

export const Route = createFileRoute("/rules")({
  head: () => ({
    meta: [
      { title: "Election rules — KUPSA Constitution Chapter Six" },
      { name: "description", content: "The KUPSA election rules from Chapter Six of the constitution, explained clearly." },
      { property: "og:title", content: "KUPSA election rules" },
      { property: "og:description", content: "Chapter Six of the KUPSA Constitution, explained clearly." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RulesPage,
});

function RulesPage() {
  const [open, setOpen] = useState<number | null>(CONSTITUTIONAL_ARTICLES[0]?.number ?? null);
  return (
    <>
      <PageIntro eyebrow="The rules" title="How the election works, by the book">
        Chapter Six of the KUPSA Constitution sets the rules everyone follows — voters, candidates and the Commission.
      </PageIntro>
      <div className="mx-auto max-w-4xl px-5 py-14">
        <div className="divide-y rounded-2xl border bg-card">
          {CONSTITUTIONAL_ARTICLES.map((a) => {
            const isOpen = open === a.number;
            return (
              <div key={a.number}>
                <button onClick={() => setOpen(isOpen ? null : a.number)} className="flex w-full items-center gap-4 px-6 py-5 text-left">
                  <span className="w-16 shrink-0 font-mono text-sm text-primary">Art. {a.number}</span>
                  <span className="flex-1 text-lg font-semibold">{a.title}</span>
                  {isOpen ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 animate-in fade-in sm:pl-26">
                    <p className="text-muted-foreground">{a.summary}</p>
                    <ul className="mt-4 space-y-2">
                      {a.keyRequirements.map((k) => (
                        <li key={k} className="flex gap-3">
                          <span className="bg-brand mt-2 h-2 w-2 shrink-0 rounded-full" /> {k}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
