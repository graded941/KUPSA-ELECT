import { createFileRoute } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { PageIntro } from "@/components/site-shell";

export const Route = createFileRoute("/conduct")({
  head: () => ({
    meta: [
      { title: "Code of conduct — KUPSA Elections" },
      { name: "description", content: "What candidates, agents and voters may and may not do during the KUPSA elections." },
      { property: "og:title", content: "KUPSA Elections code of conduct" },
      { property: "og:description", content: "What candidates, agents and voters may and may not do." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConductPage,
});

const SECTIONS = [
  {
    who: "Candidates",
    dos: ["Campaign only during the official campaign period", "Keep posters to approved notice boards", "Debate ideas respectfully", "Declare campaign spending to the Commission"],
    donts: ["Offer money, food or gifts for votes", "Insult or threaten other candidates", "Campaign on voting day", "Use association funds or property"],
  },
  {
    who: "Agents",
    dos: ["Carry your Commission-issued badge", "Report concerns to the Returning Officer", "Witness the count and sign the results"],
    donts: ["Interfere with voters", "Handle ballots", "Share results before they are declared"],
  },
  {
    who: "Voters",
    dos: ["Vote once, in secret", "Bring your student ID", "Report pressure or bribery"],
    donts: ["Share photos of your ballot", "Vote for someone else", "Sell or trade your vote"],
  },
];

function ConductPage() {
  return (
    <>
      <PageIntro eyebrow="Code of conduct · Art. 44" title="Play fair. Win fair.">
        Everyone taking part signs up to these rules. Breaking them can lead to disqualification.
      </PageIntro>
      <div className="mx-auto max-w-6xl space-y-6 px-5 py-14">
        {SECTIONS.map((s) => (
          <section key={s.who} className="rounded-2xl border bg-card p-6 shadow-card md:p-8">
            <h2 className="text-3xl font-semibold">{s.who}</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <ul className="space-y-3">
                <p className="eyebrow text-success">Do</p>
                {s.dos.map((d) => <li key={d} className="flex gap-2"><Check className="mt-0.5 h-5 w-5 shrink-0 text-success" />{d}</li>)}
              </ul>
              <ul className="space-y-3">
                <p className="eyebrow text-destructive">Don't</p>
                {s.donts.map((d) => <li key={d} className="flex gap-2"><X className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />{d}</li>)}
              </ul>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
