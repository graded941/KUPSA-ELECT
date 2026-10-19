import React, { useState, useEffect } from 'react';
import { ViewId, ElectionPhase } from './types';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OverviewView } from './components/OverviewView';
import { CandidatesView } from './components/CandidatesView';
import { StudentPortalView } from './components/StudentPortalView';
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
    case 'portal':
    case 'student-portal':
      return 'portal';
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
      return 'commission';
    case 'overview':
    case '':
    default:
      return 'overview';
  }
}

export default function App() {
  const [currentView, setCurrentView] = useState<ViewId>(getViewFromHash);
  const [currentPhase, setCurrentPhase] = useState<ElectionPhase>('pre-election');

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
    if (view === 'student-portal') cleanView = 'portal';
    if (view === 'commission-workspace' || view === 'governance') cleanView = 'commission';
    if (view === 'how-it-works') cleanView = 'rules';
    if (view === 'code-of-conduct') cleanView = 'conduct';

    setCurrentView(cleanView);
    window.location.hash = cleanView === 'overview' ? '' : cleanView;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-accent selection:text-ink antialiased">
      {/* Main Sticky Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        currentPhase={currentPhase}
        onPhaseChange={setCurrentPhase}
      />

      {/* Main View Container with mobile-first bottom padding for MobileBottomNav */}
      <main className="flex-1 pb-24 lg:pb-12">
        {currentView === 'overview' && (
          <OverviewView
            onNavigate={handleNavigate}
            onOpenAudit={() => setIsAuditModalOpen(true)}
            onOpenRehearsal={() => setIsRehearsalOpen(true)}
            currentPhase={currentPhase}
          />
        )}
        {currentView === 'candidates' && (
          <CandidatesView onNavigate={handleNavigate} currentPhase={currentPhase} />
        )}
        {(currentView === 'portal' || currentView === 'student-portal') && (
          <StudentPortalView onNavigate={handleNavigate} />
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
        {(currentView === 'commission' ||
          currentView === 'commission-workspace' ||
          currentView === 'governance') && (
          <CommissionWorkspaceView
            onNavigate={handleNavigate}
            onOpenAudit={() => setIsAuditModalOpen(true)}
            onOpenRehearsal={() => setIsRehearsalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenAudit={() => setIsAuditModalOpen(true)}
        onOpenSecurity={() => setIsSecurityModalOpen(true)}
      />

      {/* Mobile Bottom Navigation Bar (< 1024px) */}
      <MobileBottomNav currentView={currentView} onNavigate={handleNavigate} />

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
