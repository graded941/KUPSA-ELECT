export type ViewId =
  | 'overview'
  | 'candidates'
  | 'roles'
  | 'rules'
  | 'conduct'
  | 'results'
  | 'help'
  | 'commission'
  | 'portal'
  | 'governance'
  | 'how-it-works'
  | 'commission-workspace'
  | 'student-portal'
  | 'code-of-conduct';

export type ElectionPhase =
  | 'pre-election'
  | 'polling-live'
  | 'counting'
  | 'results-declared';

export interface Office {
  id: string;
  title: string;
  description: string;
  seats: number;
  constitutionalArticle: string;
  term: string;
}

export interface Candidate {
  id: string;
  name: string;
  initials: string;
  officeId: string;
  yearOfStudy: string;
  vettingStatus: 'Vetted & Approved' | 'Under Review' | 'Provisional';
  photoPlaceholderBg: string;
  photoUrl?: string;
  manifestoSummary: string;
  manifestoPillars: string[];
  experience?: string[];
  priorities?: { title: string; desc: string; timeline: string }[];
  qa?: { question: string; answer: string }[];
  endorsementsCount?: number;
  complianceChecklist: {
    rule: string;
    passed: boolean;
    reference: string;
  }[];
}

export interface StudentRecord {
  regNo: string;
  name: string;
  email: string;
  yearOfStudy: string;
  status: 'Eligible' | 'Action Required' | 'Ineligible';
  reason: string;
  duesCleared: boolean;
  academicGoodStanding: boolean;
}

export interface ReadinessCheckItem {
  id: string;
  label: string;
  description: string;
  verified: boolean;
  verifiedBy?: string;
  updatedAt?: string;
}

export interface ReadinessGate {
  id: string;
  number: string;
  title: string;
  description: string;
  constitutionalArticle: string;
  completed: boolean;
  blockersCount: number;
  items: ReadinessCheckItem[];
}

export interface ConstitutionalArticle {
  number: number;
  title: string;
  summary: string;
  keyRequirements: string[];
}

export interface ObserverAuditLog {
  id: string;
  timestamp: string;
  stage: string;
  action: string;
  actorRole: string;
  hashProof: string;
  status: 'Verified' | 'Pending Witness' | 'Recorded';
}

export interface DisputeSubmission {
  id: string;
  timestamp: string;
  complainantName: string;
  complainantRole: string;
  officeContested: string;
  constitutionalGrounds: string;
  status:
    | 'Filed'
    | 'Under Review by Commission & Patron'
    | 'Dismissed'
    | 'Upheld'
    | 'Resolved'
    | 'Escalated to Patron';
  patronNotified: boolean;
  resolutionNotes?: string;
}

export interface CandidateTally {
  candidateId: string;
  candidateName: string;
  initials: string;
  votes: number;
  percentage: number;
  isWinner: boolean;
}

export interface OfficeResult {
  officeId: string;
  officeTitle: string;
  constitutionalArticle: string;
  totalVotesCast: number;
  validVotes: number;
  spoiltOrBlanks: number;
  status: 'Declared Majority Winner' | 'Run-off Required (Tie)' | 'Under Verification';
  winnerName?: string;
  candidateTallies: CandidateTally[];
  agentSignoffs: { agentName: string; candidateName: string; signed: boolean }[];
}

export interface TurnoutMetrics {
  registeredTotal: number;
  ballotsCast: number;
  turnoutPercentage: number;
  turnoutByCohort: {
    year: string;
    registered: number;
    voted: number;
    percentage: number;
  }[];
}

export interface CandidateApplication {
  id: string;
  fullName: string;
  regNo: string;
  email: string;
  officeId: string;
  yearOfStudy: string;
  gpa: string;
  manifestoSummary: string;
  manifestoPillars: string[];
  endorsementsCount: number;
  status: 'Draft' | 'Submitted for Vetting' | 'Under Faculty Review' | 'Approved & Gazetted' | 'Clarification Requested';
  submittedAt: string;
  commissionNotes?: string;
}

export interface ElectionMilestone {
  id: string;
  title: string;
  phase: ElectionPhase;
  dateStr: string;
  timeStr: string;
  article: string;
  description: string;
  badge: string;
}
