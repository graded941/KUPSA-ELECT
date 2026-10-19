import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/site-shell";
import { OFFICES } from "@/data/election";

export const Route = createFileRoute("/roles")({
  head: () => ({
    meta: [
      { title: "Offices on the ballot — KUPSA Elections" },
      { name: "description", content: "Every KUPSA office up for election and what each leader does." },
      { property: "og:title", content: "KUPSA offices on the ballot" },
      { property: "og:description", content: "Every office up for election and what each leader does." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RolesPage,
});

const COMMISSION = [
  ["Returning Officer", "Runs voting day and announces results."],
  ["Commission Secretary", "Keeps records and publishes notices."],
  ["ICT Officer", "Keeps the voting system secure and working."],
  ["Observer Coordinator", "Organises independent observers."],
  ["Patron", "Senior staff member who oversees fairness and handles appeals."],
];

function RolesPage() {
  return (
    <>
      <PageIntro eyebrow="Roles" title="Who you're electing">
        {OFFICES.length} offices are on the ballot. Each serves one academic year.
      </PageIntro>
      <div className="mx-auto grid max-w-6xl gap-5 px-5 py-14 md:grid-cols-2 lg:grid-cols-3">
        {OFFICES.map((o) => (
          <article key={o.id} className="rounded-2xl border bg-card p-6 shadow-card">
            <p className="eyebrow text-primary">{o.constitutionalArticle}</p>
            <h2 className="mt-2 text-2xl font-semibold">{o.title}</h2>
            <p className="mt-3 text-muted-foreground">{o.description}</p>
            <p className="mt-4 text-sm font-medium">{o.seats} seat{o.seats > 1 ? "s" : ""} · {o.term}</p>
          </article>
        ))}
      </div>
      <section className="border-t bg-secondary/50">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <h2 className="text-3xl font-semibold">Who runs the election</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {COMMISSION.map(([t, b]) => (
              <div key={t} className="rounded-2xl border bg-card p-5">
                <h3 className="text-lg font-semibold">{t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
