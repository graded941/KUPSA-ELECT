import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, Lock, XCircle } from "lucide-react";
import { PageIntro } from "@/components/site-shell";
import { SAMPLE_STUDENTS } from "@/data/election";
import type { StudentRecord } from "@/data/types";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Student portal — Check if you can vote | KUPSA Elections" },
      { name: "description", content: "Enter your registration number to check whether you can vote in the KUPSA elections." },
      { property: "og:title", content: "Check if you can vote — KUPSA Elections" },
      { property: "og:description", content: "Confirm your voter registration before election day." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PortalPage,
});

function PortalPage() {
  const [regNo, setRegNo] = useState("");
  const [result, setResult] = useState<StudentRecord | null | undefined>(undefined);

  const check = (e: React.FormEvent) => {
    e.preventDefault();
    const found = SAMPLE_STUDENTS.find((s) => s.regNo.toLowerCase() === regNo.trim().toLowerCase());
    setResult(found ?? null);
  };

  const tone =
    result?.status === "Eligible"
      ? { icon: CheckCircle2, cls: "text-success", title: "You're all set to vote" }
      : result?.status === "Action Required"
        ? { icon: AlertTriangle, cls: "text-primary", title: "One thing to sort out first" }
        : { icon: XCircle, cls: "text-destructive", title: "You can't vote in this election" };

  return (
    <>
      <PageIntro eyebrow="Student portal" title="Check if you can vote">
        Enter your registration number. It takes a few seconds.
      </PageIntro>

      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl border-2 border-ink bg-card p-7 shadow-pop md:p-10">
          <form onSubmit={check}>
            <label htmlFor="reg" className="font-semibold">Registration number</label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                id="reg"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                placeholder="PHARM/2023/1042"
                className="flex-1 rounded-xl border-2 bg-background px-4 py-3 font-mono uppercase outline-none focus:border-ink"
                required
              />
              <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-ink">
                Check <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          {result === null && (
            <p className="mt-6 rounded-xl bg-muted p-4 text-muted-foreground animate-in fade-in">
              We couldn't find that number. Check it and try again, or contact the Electoral Commission.
            </p>
          )}

          {result && (
            <div className="mt-8 border-t pt-8 animate-in fade-in slide-in-from-bottom-2">
              <p className={`flex items-center gap-2 text-2xl font-display font-semibold ${tone.cls}`}>
                <tone.icon className="h-7 w-7" /> {tone.title}
              </p>
              <p className="mt-2 text-lg">{result.name} · {result.yearOfStudy}</p>
              <p className="mt-3 text-muted-foreground">{result.reason}</p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <Check ok={result.duesCleared} label="Dues paid" />
                <Check ok={result.academicGoodStanding} label="Good academic standing" />
              </div>
              {result.status === "Eligible" && (
                <Link to="/candidates" className="mt-6 inline-flex items-center gap-2 font-semibold text-primary hover:underline">
                  Now meet the candidates <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border bg-card p-6">
            <Lock className="h-5 w-5 text-primary" />
            <h2 className="mt-3 text-xl font-semibold">Your vote stays secret</h2>
            <p className="mt-2 text-muted-foreground">
              Checking you can vote is kept completely separate from how you vote. No one can link your ballot to you.
            </p>
          </div>
          <div className="rounded-2xl border border-dashed bg-secondary/50 p-6 text-sm">
            <p className="font-semibold">Trying it out?</p>
            <p className="mt-1 text-muted-foreground">These are sample students while the portal is being tested:</p>
            <ul className="mt-3 space-y-1.5 font-mono">
              {SAMPLE_STUDENTS.slice(0, 4).map((s) => (
                <li key={s.regNo}>
                  <button onClick={() => setRegNo(s.regNo)} className="hover:text-primary">{s.regNo}</button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}

function Check({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 ${ok ? "" : "border-destructive/40"}`}>
      {ok ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-destructive" />}
      {label}
    </span>
  );
}
