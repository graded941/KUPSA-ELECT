import React, { useState } from 'react';
import { ViewId, ElectionPhase } from '../types';
import { useVotingStore } from '../context/VotingStore';
import {
  Menu,
  X,
  Vote,
  Users,
  BarChart3,
  BookOpen,
  Scale,
  LifeBuoy,
  Briefcase,
  ChevronRight
} from 'lucide-react';

interface NavbarProps {
  currentView: ViewId;
  onNavigate: (view: ViewId) => void;
  currentPhase?: ElectionPhase;
  onPhaseChange?: (phase: ElectionPhase) => void;
}

const NAV_ITEMS: { id: ViewId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'candidates', label: 'Candidates', icon: Users },
  { id: 'roles', label: 'Roles', icon: Briefcase },
  { id: 'rules', label: 'The rules', icon: BookOpen },
  { id: 'conduct', label: 'Conduct', icon: Scale },
  { id: 'results', label: 'Results', icon: BarChart3 },
  { id: 'help', label: 'Help', icon: LifeBuoy },
];

export function Navbar({ currentView, onNavigate, currentPhase }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const { isResultsLive } = useVotingStore();

  const handleNav = (view: ViewId) => {
    onNavigate(view);
    setOpen(false);
  };

  const isActive = (id: ViewId) => {
    if (id === currentView) return true;
    if (id === 'portal' && currentView === 'student-portal') return true;
    if ((id === 'commissioner' || id === 'commission') && (currentView === 'commissioner' || currentView === 'commission-workspace' || currentView === 'governance')) return true;
    if (id === 'rules' && currentView === 'how-it-works') return true;
    if (id === 'conduct' && currentView === 'code-of-conduct') return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3">
        {/* Logo and Title */}
        <button
          onClick={() => handleNav('overview')}
          className="flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1 -m-1"
        >
          <img
            src="/kupsa-logo.png"
            alt="KUPSA"
            className="h-9 w-9 object-contain rounded-full shadow-xs"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div className="flex flex-col">
            <span className="font-display text-lg font-semibold leading-tight text-foreground">
              KUPSA <span className="text-primary font-normal">Elections</span>
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground hidden sm:inline">
              Kabarak University Pharmacy
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-5 text-sm font-medium text-muted-foreground lg:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`transition-colors hover:text-foreground relative py-1 inline-flex items-center gap-1.5 ${
                  active ? 'font-semibold text-foreground' : ''
                }`}
              >
                <span>{item.label}</span>
                {item.id === 'results' && (
                  <span
                    className={`inline-flex items-center rounded-full px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase tracking-wider ${
                      isResultsLive
                        ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 animate-pulse'
                        : 'bg-secondary text-muted-foreground/80 border border-border text-[9px]'
                    }`}
                  >
                    {isResultsLive ? 'LIVE' : 'SEALED'}
                  </span>
                )}
                {active && (
                  <span className="absolute -bottom-3 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleNav('portal')}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all shadow-xs ${
              isActive('portal')
                ? 'bg-primary text-primary-foreground shadow-pop'
                : 'bg-ink text-ink-foreground hover:bg-primary'
            }`}
          >
            <Vote className="h-4 w-4" />
            <span>Vote</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border p-2 text-foreground lg:hidden hover:border-ink hover:bg-card"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Drawer */}
      {open && (
        <div className="border-t border-border bg-card px-4 py-4 lg:hidden shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            <button
              onClick={() => handleNav('overview')}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left font-medium transition-colors ${
                currentView === 'overview' ? 'bg-secondary font-semibold text-foreground' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <span>Home / Overview</span>
              <ChevronRight className="h-4 w-4 opacity-50" />
            </button>
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.id);
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left font-medium transition-colors ${
                    active ? 'bg-secondary font-semibold text-foreground' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${active ? 'text-primary' : 'opacity-70'}`} />
                    <span>{item.label}</span>
                    {item.id === 'results' && (
                      <span
                        className={`inline-flex items-center rounded-full px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase tracking-wider ${
                          isResultsLive
                            ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30'
                            : 'bg-secondary text-muted-foreground/80 border border-border'
                        }`}
                      >
                        {isResultsLive ? 'LIVE' : 'SEALED'}
                      </span>
                    )}
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-border/60">
            <button
              onClick={() => handleNav('portal')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3 text-center text-sm font-semibold text-ink-foreground hover:bg-primary shadow-xs"
            >
              <Vote className="h-4 w-4" />
              Check Eligibility / Cast Ballot
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
