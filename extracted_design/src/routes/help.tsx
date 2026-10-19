import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { PageIntro } from "@/components/site-shell";
import { OFFICES } from "@/data/election";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & appeals — KUPSA Elections" },
      { name: "description", content: "Ask the helpdesk a question or file an election appeal with the KUPSA Electoral Commission." },
      { property: "og:title", content: "KUPSA Elections help & appeals" },
      { property: "og:description", content: "Ask the helpdesk or file an election appeal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HelpPage,
});

const input = "w-full rounded-xl border-2 border-border bg-background px-4 py-3 focus:border-ink focus:outline-none";

function Sent({ text, onReset }: { text: string; onReset: () => void }) {
  return (
    <div className="py-8 text-center">
      <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
      <p className="mt-3 font-semibold">{text}</p>
      <button onClick={onReset} className="mt-4 text-sm font-semibold text-primary underline">Send another</button>
    </div>
  );
}

function HelpPage() {
  const [helpSent, setHelpSent] = useState(false);
  const [appealSent, setAppealSent] = useState(false);
  const submit = (fn: (v: boolean) => void) => (e: FormEvent) => { e.preventDefault(); fn(true); };

  return (
    <>
      <PageIntro eyebrow="Help & appeals" title="We're here to help">
        Ask a question, or challenge a decision within 48 hours. Helpdesk in person: Room PH-104.
      </PageIntro>
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-14 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-6 shadow-card md:p-8">
          <h2 className="text-2xl font-semibold">Helpdesk</h2>
          <p className="mt-1 text-muted-foreground">Registration, voting or login problems.</p>
          {helpSent ? <Sent text="Thanks — the helpdesk will reply by email." onReset={() => setHelpSent(false)} /> : (
            <form onSubmit={submit(setHelpSent)} className="mt-6 space-y-4">
              <input required className={input} placeholder="Your name" />
              <input required className={input} placeholder="Registration number" />
              <input required type="email" className={input} placeholder="Email" />
              <textarea required rows={4} className={input} placeholder="How can we help?" />
              <button className="rounded-full bg-ink px-6 py-3 font-semibold text-ink-foreground hover:bg-primary">Send question</button>
            </form>
          )}
        </section>
        <section className="rounded-2xl border-2 border-ink bg-card p-6 shadow-pop md:p-8">
          <h2 className="text-2xl font-semibold">File an appeal</h2>
          <p className="mt-1 text-muted-foreground">Reviewed by the Commission and the Patron.</p>
          {appealSent ? <Sent text="Appeal received. The Commission will contact you within 48 hours." onReset={() => setAppealSent(false)} /> : (
            <form onSubmit={submit(setAppealSent)} className="mt-6 space-y-4">
              <input required className={input} placeholder="Your name" />
              <select required className={input} defaultValue="">
                <option value="" disabled>I am a…</option>
                <option>Voter</option><option>Candidate</option><option>Candidate's agent</option>
              </select>
              <select required className={input} defaultValue="">
                <option value="" disabled>Which office?</option>
                {OFFICES.map((o) => <option key={o.id}>{o.title}</option>)}
              </select>
              <textarea required rows={4} className={input} placeholder="What happened, and which rule was broken?" />
              <button className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Submit appeal</button>
            </form>
          )}
        </section>
      </div>
    </>
  );
}
