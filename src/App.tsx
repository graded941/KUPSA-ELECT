import React, { useState, useEffect } from 'react';
import { ViewId, ElectionPhase } from './types';
import { VotingStoreProvider, useVotingStore } from './context/VotingStore';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OverviewView } from './components/OverviewView';
import { CandidatesView } from './components/CandidatesView';
import { AuthView } from './components/AuthView';
import { BallotView } from './components/BallotView';
import { CommissionerDashboardView } from './components/CommissionerDashboardView';
import { ResultsView } from './components/ResultsView';
import { CommissionWorkspaceView } from './components/CommissionWorkspaceView';
import { RolesView } from './components/RolesView';
import { RulesView } from './components/RulesView';
import { CodeOfConductView } from './components/CodeOfConductView';
import { HelpView } from './components/HelpView';
import { Footer } from './components/Footer';
import { AuditDossierModal } from './components/AuditDossierModal';
import { SecurityDossierModal } from './components/SecurityDossierModal';
import { RehearsalSimulator } from './components/RehearsalSimulator';

function getViewFromHash(): ViewId {
  const hash = window.location.hash.replace('#', '').toLowerCase();
  switch (hash) {
    case 'candidates':
      return 'candidates';
    case 'auth':
    case 'login':
    case 'signup':
      return 'auth';
    case 'portal':
    case 'student-portal':
    case 'vote':
    case 'ballot':
      return 'portal';
    case 'commissioner':
    case 'dashboard':
    case 'tally':
      return 'commissioner';
    case 'roles':
      return 'roles';
    case 'rules':
    case 'how-it-works':
      return 'rules';
    case 'conduct':
    case 'code-of-conduct':
      return 'conduct';
    case 'results':
      return 'results';
    case 'help':
      return 'help';
    case 'commission':
    case 'commission-workspace':
    case 'governance':
      return 'commissioner'; // Route to the data-dense Commissioner dashboard
    case 'overview':
    case '':
    default:
      return 'overview';
  }
}

function MainApp() {
  const [currentView, setCurrentView] = useState<ViewId>(getViewFromHash);

  // Modals state
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isRehearsalOpen, setIsRehearsalOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentView(getViewFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (view: ViewId) => {
    let cleanView: ViewId = view;
    if (view === 'student-portal' || view === 'ballot') cleanView = 'portal';
    if (view === 'commission-workspace' || view === 'governance' || view === 'commission') {
      cleanView = 'commissioner';
    }
    if (view === 'how-it-works') cleanView = 'rules';
    if (view === 'code-of-conduct') cleanView = 'conduct';

    setCurrentView(cleanView);
    window.location.hash = cleanView === 'overview' ? '' : cleanView;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { currentUser, announcementBanner, electionPhase, setElectionPhase } = useVotingStore();

  // Dedicated focus mode for voting or commissioner portal (both have their own focused layout & sidebar)
  const isCustomLayout = (currentView === 'portal' && Boolean(currentUser)) || currentView === 'commissioner';

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-accent selection:text-ink antialiased">
      {/* Commission Broadcast Notice Banner (Only displayed if actively pushed from the commissioner dashboard) */}
      {Boolean(announcementBanner?.trim()) && !isCustomLayout && (
        <div className="bg-ink text-sun px-4 py-2 text-xs font-mono text-center border-b border-white/10 flex items-center justify-center gap-2">
          <span className="font-bold uppercase tracking-wider text-primary">Commission Notice:</span>
          <span>{announcementBanner}</span>
        </div>
      )}

      {/* Main Sticky Navbar (Hidden during active ballot voting and commissioner sidebar mode) */}
      {!isCustomLayout && (
        <Navbar
          currentView={currentView}
          onNavigate={handleNavigate}
          currentPhase={electionPhase}
          onPhaseChange={setElectionPhase}
        />
      )}

      {/* Main View Container */}
      <main className={`flex-1 ${!isCustomLayout ? 'pb-24 lg:pb-12' : ''}`}>
        {currentView === 'overview' && (
          <OverviewView
            onNavigate={handleNavigate}
            onOpenAudit={() => setIsAuditModalOpen(true)}
            onOpenRehearsal={() => setIsRehearsalOpen(true)}
            currentPhase={electionPhase}
          />
        )}

        {currentView === 'candidates' && (
          <CandidatesView onNavigate={handleNavigate} currentPhase={electionPhase} />
        )}

        {currentView === 'auth' && (
          <AuthView onNavigate={handleNavigate} />
        )}

        {currentView === 'portal' && (
          currentUser ? (
            <BallotView onNavigate={handleNavigate} />
          ) : (
            <AuthView onNavigate={handleNavigate} defaultMode="signup" />
          )
        )}

        {currentView === 'commissioner' && (
          <CommissionerDashboardView onNavigate={handleNavigate} />
        )}

        {currentView === 'roles' && <RolesView onNavigate={handleNavigate} />}

        {(currentView === 'rules' || currentView === 'how-it-works') && (
          <RulesView
            onNavigate={handleNavigate}
            onOpenAudit={() => setIsAuditModalOpen(true)}
          />
        )}

        {(currentView === 'conduct' || currentView === 'code-of-conduct') && (
          <CodeOfConductView onNavigate={handleNavigate} />
        )}

        {currentView === 'results' && (
          <ResultsView
            onNavigate={handleNavigate}
            onOpenAudit={() => setIsAuditModalOpen(true)}
          />
        )}

        {currentView === 'help' && <HelpView onNavigate={handleNavigate} />}
      </main>

      {/* Footer (Hidden during active ballot voting and commissioner sidebar mode) */}
      {!isCustomLayout && (
        <Footer
          onNavigate={handleNavigate}
          onOpenAudit={() => setIsAuditModalOpen(true)}
          onOpenSecurity={() => setIsSecurityModalOpen(true)}
        />
      )}

      {/* Mobile Bottom Navigation Bar (< 1024px) (Hidden during active ballot voting and commissioner sidebar mode) */}
      {!isCustomLayout && (
        <MobileBottomNav currentView={currentView} onNavigate={handleNavigate} />
      )}

      {/* Global Modals */}
      <AuditDossierModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />
      <SecurityDossierModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />
      <RehearsalSimulator
        isOpen={isRehearsalOpen}
        onClose={() => setIsRehearsalOpen(false)}
      />
    </div>
  );
}

import { GmailProvider } from './context/GmailContext';

export default function App() {
  return (
    <GmailProvider>
      <VotingStoreProvider>
        <MainApp />
      </VotingStoreProvider>
    </GmailProvider>
  );
}
