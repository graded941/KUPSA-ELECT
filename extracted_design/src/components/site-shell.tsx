import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/kupsa-logo.png.asset.json";

const NAV = [
  { to: "/candidates", label: "Candidates" },
  { to: "/roles", label: "Roles" },
  { to: "/rules", label: "The rules" },
  { to: "/conduct", label: "Conduct" },
  { to: "/results", label: "Results" },
  { to: "/help", label: "Help" },
  { to: "/commission", label: "Commission" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <img src={logo.url} alt="KUPSA" className="h-9 w-9" />
          <span className="font-display text-lg font-semibold">Elections</span>
        </Link>
        <nav className="hidden gap-6 text-sm font-medium text-muted-foreground lg:flex">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/portal" className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-ink-foreground hover:bg-primary">
            Student portal
          </Link>
          <button className="p-2 lg:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="flex flex-col border-t px-5 py-3 lg:hidden">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="py-3 font-medium" onClick={() => setOpen(false)}>
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="bg-brand h-1.5" />
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm opacity-80">
        <div className="flex items-center gap-3">
          <img src={logo.url} alt="" className="h-8 w-8" />
          Kabarak University Pharmacy Students Association
        </div>
        <span>Run by the independent KUPSA Electoral Commission</span>
      </div>
    </footer>
  );
}

export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <section className="grain border-b">
      <div className="mx-auto max-w-6xl px-5 py-14 md:py-20">
        <p className="eyebrow text-primary">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">{title}</h1>
        {children && <div className="mt-5 max-w-2xl text-lg text-muted-foreground">{children}</div>}
      </div>
    </section>
  );
}
