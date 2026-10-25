import React from 'react';
import { ViewId } from '../types';
import { useVotingStore } from '../context/VotingStore';
import { Home, Users, Vote, BarChart3, BookOpen } from 'lucide-react';

interface MobileBottomNavProps {
  currentView: ViewId;
  onNavigate: (view: ViewId) => void;
}

export function MobileBottomNav({ currentView, onNavigate }: MobileBottomNavProps) {
  const { isResultsLive } = useVotingStore();
  const isTabActive = (tab: string) => {
    if (tab === 'home' && currentView === 'overview') return true;
    if (tab === 'candidates' && currentView === 'candidates') return true;
    if (tab === 'vote' && (currentView === 'portal' || currentView === 'student-portal')) return true;
    if (tab === 'results' && currentView === 'results') return true;
    if (tab === 'rules' && (currentView === 'rules' || currentView === 'how-it-works')) return true;
    return false;
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-md lg:hidden shadow-lg pb-safe"
    >
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-1">
        {/* Home */}
        <button
          onClick={() => onNavigate('overview')}
          className={`flex flex-col items-center justify-center gap-1 h-full py-1 transition-colors ${
            isTabActive('home') ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-[11px] font-sans">Home</span>
        </button>

        {/* Candidates */}
        <button
          onClick={() => onNavigate('candidates')}
          className={`flex flex-col items-center justify-center gap-1 h-full py-1 transition-colors ${
            isTabActive('candidates') ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="h-5 w-5" />
          <span className="text-[11px] font-sans">Candidates</span>
        </button>

        {/* Vote Center Highlight Button */}
        <button
          onClick={() => onNavigate('portal')}
          className="flex flex-col items-center justify-center -mt-4 relative group"
        >
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-full shadow-pop border-2 border-ink text-ink transition-transform group-active:scale-95 ${
              isTabActive('vote') ? 'bg-brand' : 'bg-brand'
            }`}
          >
            <Vote className="h-6 w-6 stroke-[2.2]" />
          </span>
          <span
            className={`text-[11px] mt-1 font-semibold ${
              isTabActive('vote') ? 'text-primary' : 'text-foreground'
            }`}
          >
            Vote
          </span>
        </button>

        {/* Results */}
        <button
          onClick={() => onNavigate('results')}
          className={`flex flex-col items-center justify-center gap-1 h-full py-1 transition-colors relative ${
            isTabActive('results') ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="relative">
            <BarChart3 className="h-5 w-5" />
            {isResultsLive && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            )}
            {isResultsLive && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-600" />
            )}
          </div>
          <span className="text-[11px] font-sans">Results</span>
        </button>

        {/* Rules */}
        <button
          onClick={() => onNavigate('rules')}
          className={`flex flex-col items-center justify-center gap-1 h-full py-1 transition-colors ${
            isTabActive('rules') ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="h-5 w-5" />
          <span className="text-[11px] font-sans">Rules</span>
        </button>
      </div>
    </nav>
  );
}
