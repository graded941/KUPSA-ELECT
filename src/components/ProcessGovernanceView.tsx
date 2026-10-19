import React, { useState } from 'react';
import { ViewId } from '../types';
import { HowItWorksView } from './HowItWorksView';
import { RolesView } from './RolesView';
import {
  GitCommit,
  Users,
  ShieldCheck,
  FileCheck,
  Printer,
  X
} from 'lucide-react';

interface ProcessGovernanceViewProps {
  onNavigate: (view: ViewId) => void;
  initialTab?: 'stages' | 'roles';
}

export const ProcessGovernanceView: React.FC<ProcessGovernanceViewProps> = ({
  onNavigate,
  initialTab = 'stages'
}) => {
  const [activeTab, setActiveTab] = useState<'stages' | 'roles'>(initialTab);
  const [showObserverProtocolModal, setShowObserverProtocolModal] = useState<boolean>(false);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sub-Navigation Ribbon (Mobile-First Responsive Segmented Bar) */}
      <div className="border-b border-[#e1e7df] bg-white sticky top-14 sm:top-16 md:top-[72px] z-30 shadow-2xs">
        <div className="max-w-[1160px] mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-mono font-bold text-[#286746] uppercase tracking-wider hidden md:inline shrink-0">
              Chapter Six Governance:
            </span>
            <div className="grid grid-cols-2 sm:inline-flex p-1 bg-[#f7f9f6] border border-[#e1e7df] rounded-xl text-xs w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab('stages')}
                className={`px-3 py-2 sm:py-1.5 rounded-lg font-semibold cursor-pointer transition-colors inline-flex items-center justify-center gap-1.5 min-h-[38px] ${
                  activeTab === 'stages'
                    ? 'bg-[#17271f] text-white shadow-xs'
                    : 'text-[#58675e] hover:text-[#17271f]'
                }`}
              >
                <GitCommit className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">5-Stage Lifecycle</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('roles')}
                className={`px-3 py-2 sm:py-1.5 rounded-lg font-semibold cursor-pointer transition-colors inline-flex items-center justify-center gap-1.5 min-h-[38px] ${
                  activeTab === 'roles'
                    ? 'bg-[#17271f] text-white shadow-xs'
                    : 'text-[#58675e] hover:text-[#17271f]'
                }`}
              >
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">6 Team Roles</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              onClick={() => setShowObserverProtocolModal(true)}
              className="text-xs font-semibold text-[#286746] hover:underline inline-flex items-center gap-1.5 cursor-pointer py-1 min-h-[34px]"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Observer Protocol (Form EC-04)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Render */}
      <div>
        {activeTab === 'stages' ? (
          <HowItWorksView onNavigate={onNavigate} />
        ) : (
          <RolesView onNavigate={onNavigate} />
        )}
      </div>

      {/* Observer Accreditation Protocol Specimen Modal (Mobile Bottom Sheet -> Desktop Modal) */}
      {showObserverProtocolModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl border border-[#e1e7df] shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            {/* Mobile Drag Indicator */}
            <div className="w-12 h-1.5 bg-[#d2ded0] rounded-full mx-auto my-2.5 sm:hidden" />

            <div className="flex items-start justify-between gap-4 border-b border-[#e1e7df] p-4 sm:p-6 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#286746] block font-bold">
                  Accreditation Specimen
                </span>
                <h3 className="font-serif text-lg sm:text-2xl font-bold text-[#17271f]">
                  Form KUPSA-EC-04: Observer Protocol
                </h3>
              </div>
              <button
                onClick={() => setShowObserverProtocolModal(false)}
                className="w-8 h-8 flex items-center justify-center text-[#58675e] hover:text-[#17271f] rounded-lg cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              <div className="p-3 bg-[#f7f9f6] border border-[#e1e7df] rounded-xl font-mono text-[11px] text-[#58675e] space-y-1">
                <div>Statutory Instrument: Article 51 of KUPSA Constitution</div>
                <div>Issued by: Electoral Commission Secretariat</div>
                <div>Authorized Witness: Senior Faculty Patron</div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-[#17271f]">Mandatory Observer Conduct Commitments:</h4>
                <ul className="space-y-1.5 text-[#375845]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#286746] font-bold">1.</span>
                    <span>Observe all proceedings silently without interfering with voters or staff.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#286746] font-bold">2.</span>
                    <span>Wear official KUPSA Electoral Commission accreditation badge at all times.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#286746] font-bold">3.</span>
                    <span>Maintain zero communication with voters inside the polling privacy boundary.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#286746] font-bold">4.</span>
                    <span>Submit all observed irregularities directly to the Commission bench on Form EC-05.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 border-t border-[#e1e7df] text-[11px] font-mono text-[#7a867d]">
                Accreditation Registry Code: KUPSA-OBS-2026-ACCRED-007
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t border-[#e1e7df] bg-[#fafcfa] flex items-center justify-between pb-safe">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 border border-[#e1e7df] text-[#17271f] text-xs font-semibold rounded-lg hover:bg-white inline-flex items-center gap-1.5 min-h-[40px]"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Protocol</span>
              </button>

              <button
                onClick={() => setShowObserverProtocolModal(false)}
                className="px-5 py-2 bg-[#17271f] text-white text-xs font-semibold rounded-lg hover:bg-[#286746] transition-colors min-h-[40px]"
              >
                Close Specimen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
