import React, { useState } from 'react';
import { ViewId } from '../types';
import {
  ShieldCheck,
  Lock,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Database,
  KeyRound,
  EyeOff
} from 'lucide-react';

interface HowItWorksViewProps {
  onNavigate: (view: ViewId) => void;
}

export const HowItWorksView: React.FC<HowItWorksViewProps> = ({ onNavigate }) => {
  const [activeStage, setActiveStage] = useState<number>(1);

  const stages = [
    {
      num: 1,
      title: 'Commission Prepares',
      shortTitle: '1. Preparation',
      timing: '30 Days Before Polls',
      article: 'Articles 49, 50 & 51',
      summary: 'The Executive appoints a 5-member independent Electoral Commission. The Commission establishes written regulations, gazettes the timetable, secures the registrar enrollment roster, and vets candidate credentials.',
      allowed: [
        'Establish written electoral code of conduct and campaign spending limits',
        'Request certified enrollment register from School of Pharmacy dean',
        'Publish approved list of candidates and specimen ballot'
      ],
      forbidden: [
        'Allow current executive members to participate in vetting decisions',
        'Alter voting dates without 2/3 executive majority and Patron concurrence',
        'Introduce unvetted candidate names onto the ballot'
      ],
      artifacts: [
        'Form KUPSA-EC-01 (Nomination & Clearance Gazette)',
        'Signed Registrar Master Student Roll',
        'Candidate Code of Conduct Declarations'
      ]
    },
    {
      num: 2,
      title: 'Students Check Eligibility',
      shortTitle: '2. Eligibility',
      timing: 'Pre-Polling Window',
      article: 'Articles 39 & 42',
      summary: 'Students authenticate via their official Kabarak University Google Workspace account (@kabarak.ac.ke). The system verifies that the student is registered in the School of Pharmacy and in good association standing.',
      allowed: [
        'Verify institutional email address against registrar roll in real-time',
        'Issue private eligibility clearance status to each student',
        'Provide private dispute desk for enrollment discrepancies'
      ],
      forbidden: [
        'Collect or store student university passwords',
        'Expose full student enrollment roster to non-commissioners',
        'Allow students outside the School of Pharmacy to cast KUPSA ballots'
      ],
      artifacts: [
        'Authenticated OpenID Connect Identity Assertion',
        'Roster Verification Audit Receipt',
        'Eligibility Correction Tickets'
      ]
    },
    {
      num: 3,
      title: 'Voting Window Opens',
      shortTitle: '3. Voting',
      timing: 'Friday, 6th Nov: 08:00 – 17:00 EAT',
      article: 'Articles 41 & 45',
      summary: 'On Friday, the 6th of November, authorized eligible students access the blinded digital ballot. Upon casting, a zero-knowledge token marks the student as having voted, while the ballot drops anonymously into an unlinked encrypted tally box.',
      allowed: [
        'Present vetted candidates grouped clearly by constitutional office',
        'Issue a neutral cryptographic cast receipt to the voter',
        'Enforce strict one-student-one-vote rule'
      ],
      forbidden: [
        'Store voter registration numbers alongside candidate choices',
        'Display partial live candidate vote tallies before poll closure',
        'Permit cast ballots to be retracted or altered'
      ],
      artifacts: [
        'Voter Check-off Token (Identity Decoupled)',
        'Encrypted Unlinked Cast Ballot Token',
        'SHA-256 Voter Inclusion Proof'
      ]
    },
    {
      num: 4,
      title: 'Polls Close & Tallying',
      shortTitle: '4. Tallying',
      timing: '17:00 EAT Promptly',
      article: 'Articles 40 & 46',
      summary: 'At exactly 17:00 EAT, the voting window seals automatically. Counting begins under the direct physical and cryptographic observation of all candidate agents and accredited observers.',
      allowed: [
        'Decrypt aggregated ballot box using multi-party threshold keys',
        'Tabulate candidate totals in real-time for accredited agents',
        'Record dissenting agent observations on Form EC-04'
      ],
      forbidden: [
        'Introduce late ballots after statutory 17:00 EAT closure',
        'Conduct counts in private or without accredited agent witnesses',
        'Manually adjust or invalidate ballots without formal agent signoff'
      ],
      artifacts: [
        'Form KUPSA-EC-04 (Official Tally Sheet)',
        'Signed Candidate Agent Verification Protocols',
        'Observer Delegation Consensus Report'
      ]
    },
    {
      num: 5,
      title: 'Declaration & Disputes',
      shortTitle: '5. Declaration',
      timing: 'Within 24 Hours (Declaration) · 12 Hours (Petition)',
      article: 'Articles 46 & 47',
      summary: 'The Returning Officer officially declares the winners within 24 hours. Aggrieved aspirants have 12 hours to submit a written petition to the Commission, copied concurrently to the Patron for independent oversight.',
      allowed: [
        'Issue formal Certificates of Election to majority winners',
        'Publish verified aggregate votes per candidate on public portal',
        'Receive and docket written Article 47 dispute petitions'
      ],
      forbidden: [
        'Delay declaration past the 24-hour statutory deadline',
        'Reject petition submission without formal docketing and Patron copy',
        'Inaugurate officials while an active recount or petition is pending'
      ],
      artifacts: [
        'Gazette Notice of Duly Elected KUPSA Officials',
        'Certified Election Results Certificate',
        'Article 47 Petition Records & Patron Transmittals'
      ]
    }
  ];

  const currentStage = stages.find((s) => s.num === activeStage) || stages[0];

  return (
    <div className="max-w-[1160px] mx-auto px-4 sm:px-6 py-6 sm:py-12 space-y-8 sm:space-y-12">
      {/* Header */}
      <div className="space-y-2 max-w-2xl">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#286746] uppercase">
          <span>Constitutional Architecture</span>
          <span>·</span>
          <span>Chapter Six Workflow</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#17271f] font-normal tracking-tight">
          How the election works
        </h1>
        <p className="text-xs sm:text-sm text-[#58675e] leading-relaxed">
          The KUPSA election workflow translates constitutional safeguards into an unambiguous
          5-stage lifecycle. Explore each stage below to inspect the legal boundaries, allowed
          actions, and required evidentiary artifacts.
        </p>
      </div>

      {/* Stage Navigator (Mobile-First Touch Scrollable Bar -> Desktop Grid) */}
      <div className="space-y-4">
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:grid sm:grid-cols-5 sm:gap-2.5">
          {stages.map((st) => {
            const isActive = st.num === activeStage;
            return (
              <button
                key={st.num}
                type="button"
                onClick={() => setActiveStage(st.num)}
                className={`p-3 sm:p-4 rounded-xl text-left border transition-all cursor-pointer shrink-0 min-w-[150px] sm:min-w-0 min-h-[64px] flex flex-col justify-between ${
                  isActive
                    ? 'bg-[#17271f] text-white border-[#17271f] shadow-sm ring-1 ring-[#17271f]'
                    : 'bg-white border-[#e1e7df] text-[#58675e] hover:border-[#cbd8cb]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`font-mono text-xs font-bold ${
                      isActive ? 'text-[#a8c3ac]' : 'text-[#286746]'
                    }`}
                  >
                    Stage 0{st.num}
                  </span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  )}
                </div>
                <span
                  className={`text-xs font-bold truncate block ${
                    isActive ? 'text-white' : 'text-[#17271f]'
                  }`}
                >
                  {st.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Stage Inspector Card */}
        <div className="bg-white border border-[#e1e7df] rounded-2xl p-5 sm:p-8 md:p-10 space-y-6 shadow-2xs">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#e1e7df] pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#286746]">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{currentStage.timing}</span>
                <span>·</span>
                <span className="font-semibold">{currentStage.article}</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#17271f] mt-1">
                Stage {currentStage.num}: {currentStage.title}
              </h2>
            </div>
            <span className="font-mono text-[11px] text-[#286746] bg-[#eaf1e9] px-3 py-1 rounded-md font-bold self-start sm:self-auto">
              Constitutional Stage
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#58675e] leading-relaxed max-w-3xl">
            {currentStage.summary}
          </p>

          {/* Allowed vs Blocked Actions: Stack on mobile, 2-col on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2">
            {/* Allowed */}
            <div className="bg-[#f7faf7] border border-[#d2ded0] rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#286746] font-bold">
                <CheckCircle2 className="w-4 h-4 text-[#286746] shrink-0" />
                <span>Constitutionally Mandated & Allowed</span>
              </div>
              <ul className="space-y-2 text-xs text-[#17271f]">
                {currentStage.allowed.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#286746] font-bold mt-0.5">✓</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Forbidden */}
            <div className="bg-[#fef9f9] border border-[#f5d0d0] rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#a83232] font-bold">
                <XCircle className="w-4 h-4 text-[#a83232] shrink-0" />
                <span>Explicitly Blocked & Prohibited</span>
              </div>
              <ul className="space-y-2 text-xs text-[#17271f]">
                {currentStage.forbidden.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#a83232] font-bold mt-0.5">✕</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Required Artifacts */}
          <div className="pt-4 border-t border-[#e1e7df] space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#7a867d] block font-bold">
              Evidentiary Artifacts Generated in Stage {currentStage.num}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {currentStage.artifacts.map((art, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#fafcfa] border border-[#e1e7df] rounded-xl text-xs flex items-center gap-2.5 text-[#17271f]"
                >
                  <FileCheck className="w-4 h-4 text-[#286746] shrink-0" />
                  <span className="font-mono text-[11px] leading-snug">{art}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Zero-Knowledge Decoupling Architecture Graphic: Mobile-Responsive Stack */}
      <section className="bg-[#17271f] text-white rounded-2xl p-5 sm:p-8 md:p-10 space-y-6 shadow-sm">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#a8c3ac]">
            <Lock className="w-4 h-4 text-[#a8c3ac]" />
            <span>Cryptographic Privacy Safeguard</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-normal leading-snug">
            How voter identity is completely severed from ballot choices.
          </h3>
          <p className="text-xs sm:text-sm text-[#cbd8cb] leading-relaxed">
            The KUPSA election implements mathematical zero-knowledge decoupling under Article 45.
            Even if a rogue database administrator extracts the raw database, it is physically
            impossible to determine how any individual student voted.
          </p>
        </div>

        {/* Architecture flow boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#286746] flex items-center justify-center font-bold text-xs text-white">
              01
            </div>
            <h4 className="font-bold text-sm text-white">Identity Check-off</h4>
            <p className="text-xs text-[#cbd8cb] leading-relaxed">
              Student logs in via @kabarak.ac.ke. The registrar roll marks "Has Voted = TRUE" to prevent
              double voting.
            </p>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#286746] flex items-center justify-center font-bold text-xs text-white">
              02
            </div>
            <h4 className="font-bold text-sm text-white">Blinded Cast Token</h4>
            <p className="text-xs text-[#cbd8cb] leading-relaxed">
              The client browser generates an independent anonymous token with zero student identifiers,
              signed with a blind signature key.
            </p>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#286746] flex items-center justify-center font-bold text-xs text-white">
              03
            </div>
            <h4 className="font-bold text-sm text-white">Public Cast Receipt</h4>
            <p className="text-xs text-[#cbd8cb] leading-relaxed">
              The voter receives an encrypted SHA-256 hash receipt to verify ledger inclusion without
              disclosing their ballot choices.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs border-t border-white/10">
          <span className="text-[#a8c3ac] font-mono text-[11px]">
            Statutory standard: Article 45 (Complete Ballot Secrecy)
          </span>
          <button
            onClick={() => onNavigate('student-portal')}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#286746] hover:bg-[#327a54] text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors inline-flex items-center justify-center gap-1.5 min-h-[42px]"
          >
            <span>Test in Vote</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
