import {
  Office,
  Candidate,
  StudentRecord,
  ReadinessGate,
  ConstitutionalArticle,
  ObserverAuditLog,
  DisputeSubmission,
  OfficeResult,
  TurnoutMetrics,
  CandidateApplication
} from '../types';
import { SHARED_OFFICES, SHARED_CANDIDATES } from './candidateData';

export const OFFICES: Office[] = SHARED_OFFICES;

export const CANDIDATES: Candidate[] = SHARED_CANDIDATES.map((c) => ({
  id: c.id,
  name: c.name,
  initials: c.initials,
  officeId: c.officeId,
  yearOfStudy: c.yearOfStudy,
  vettingStatus: 'Vetted & Approved' as const,
  photoPlaceholderBg: c.photoPlaceholderBg || '#286746',
  photoUrl: c.photoUrl,
  manifestoSummary: c.manifestoSummary,
  manifestoPillars: c.manifestoPillars,
  experience: c.experience,
  priorities: c.priorities,
  qa: c.qa,
  endorsementsCount: 25,
  complianceChecklist: c.complianceChecklist || [
    { rule: 'Valid Kabarak Pharmacy enrollment', passed: true, reference: 'Art. 42(a)' },
    { rule: 'Cumulative GPA above 3.0 threshold', passed: true, reference: 'Art. 42(c)' },
    { rule: 'Signed Commission Code of Conduct', passed: true, reference: 'Art. 44(2)' },
  ],
}));

export const SAMPLE_STUDENTS: StudentRecord[] = [];

export const READINESS_GATES: ReadinessGate[] = [
  {
    id: 'gate-rules',
    number: '01',
    title: 'Commission Rules & Authorization',
    description: 'Written operational rules, quorum declaration, appointment records, and approved voting calendar.',
    constitutionalArticle: 'Articles 39, 49 & 50',
    completed: true,
    blockersCount: 0,
    items: [
      {
        id: 'r1',
        label: 'Commission 5-member appointment by Executive',
        description: 'Vetted and gazetted at least one month prior to general election per Art. 50.',
        verified: true,
        verifiedBy: 'Commission Chair & Patron',
        updatedAt: 'Verified Oct 2026'
      },
      {
        id: 'r2',
        label: 'Written election code and dispute procedures published',
        description: 'Standard operating guidelines made accessible to all candidates and students.',
        verified: true,
        verifiedBy: 'Returning Officer',
        updatedAt: 'Verified Oct 2026'
      },
      {
        id: 'r3',
        label: 'Calendar aligned with constitutional first Friday of November',
        description: 'Scheduled for first Friday of November under Article 41(1).',
        verified: true,
        verifiedBy: 'Commission Secretariat',
        updatedAt: 'Verified Oct 2026'
      }
    ]
  },
  {
    id: 'gate-roster',
    number: '02',
    title: 'Voter Identity & Official Roster',
    description: 'School of Pharmacy registrar roll imported, verified for deduplication, and isolated from vote records.',
    constitutionalArticle: 'Articles 42 & 45(1)',
    completed: true,
    blockersCount: 0,
    items: [
      {
        id: 'v1',
        label: 'Official Kabarak registrar enrollment list secured',
        description: 'Signed roll covering Bachelor of Pharmacy classes (approx. 1,000 students).',
        verified: true,
        verifiedBy: 'Registrar Academic Affairs',
        updatedAt: 'Verified Oct 2026'
      },
      {
        id: 'v2',
        label: 'Single institutional sign-in domain verified',
        description: 'Authentication restricted to verified @kabarak.ac.ke institutional Google accounts.',
        verified: true,
        verifiedBy: 'University ICT Liaison',
        updatedAt: 'Verified Oct 2026'
      },
      {
        id: 'v3',
        label: 'Zero-knowledge decoupling of voter identity and cast ballot',
        description: 'Architectural guarantee preventing joinable student-to-vote database tables.',
        verified: true,
        verifiedBy: 'Independent Security Auditor',
        updatedAt: 'Verified Oct 2026'
      }
    ]
  },
  {
    id: 'gate-vetting',
    number: '03',
    title: 'Candidate Vetting & Ballot Proof',
    description: 'Formal clearance of qualifications, GPA records, code of conduct affirmations, and final ballot specimen.',
    constitutionalArticle: 'Articles 42, 44 & 51',
    completed: true,
    blockersCount: 0,
    items: [
      {
        id: 'c1',
        label: 'Academic and disciplinary clearance for all nominees',
        description: 'Verified with Dean of Pharmacy office; no active suspensions or GPA disqualifications.',
        verified: true,
        verifiedBy: 'Vetting Subcommittee',
        updatedAt: 'Verified Oct 2026'
      },
      {
        id: 'c2',
        label: 'Signed candidate code of conduct affirmations',
        description: 'Anti-bribery, anti-intimidation, and campaign rules agreement filed by all aspirants.',
        verified: true,
        verifiedBy: 'Commission Legal Officer',
        updatedAt: 'Verified Oct 2026'
      },
      {
        id: 'c3',
        label: 'Specimen digital ballot signed by all candidates or agents',
        description: 'Names, ordering, photos, and office designations formally inspected and signed off.',
        verified: true,
        verifiedBy: 'All Candidate Agents',
        updatedAt: 'Verified Oct 2026'
      }
    ]
  },
  {
    id: 'gate-security',
    number: '04',
    title: 'Independent Provider & Security Review',
    description: 'Cryptographic secrecy, tamper-evident logs, observer auditing channels, and DDoS resilience.',
    constitutionalArticle: 'Article 45(1)',
    completed: false,
    blockersCount: 1,
    items: [
      {
        id: 's1',
        label: 'Third-party code and infrastructure penetration assessment',
        description: 'Independent vulnerability assessment of voting and tallying boundary.',
        verified: false,
        verifiedBy: 'Pending Third-Party Report',
        updatedAt: 'In Progress'
      },
      {
        id: 's2',
        label: 'Observer aggregate dashboard & telemetry interface verified',
        description: 'Real-time turnout, hash verification, and zero individual choice leakage.',
        verified: true,
        verifiedBy: 'Electoral Commission ICT',
        updatedAt: 'Verified Oct 2026'
      },
      {
        id: 's3',
        label: 'Denial of service and capacity test for 1,000 peak concurrents',
        description: 'Simulated morning rush traffic without latency degradation or state corruption.',
        verified: true,
        verifiedBy: 'Infrastructure Lead',
        updatedAt: 'Verified Oct 2026'
      }
    ]
  },
  {
    id: 'gate-rehearsal',
    number: '05',
    title: 'Incident & Fallback Rehearsal',
    description: 'Mock election dry-run, power/connectivity outage fallback, and paper contingency procedures.',
    constitutionalArticle: 'Articles 45(2) & 51(3)',
    completed: false,
    blockersCount: 1,
    items: [
      {
        id: 'i1',
        label: 'Full synthetic mock election rehearsal executed',
        description: 'Mock poll tested with 50 synthetic test ballots, observing tallying and dispute flows.',
        verified: true,
        verifiedBy: 'Commission Full Bench',
        updatedAt: 'Verified Oct 2026'
      },
      {
        id: 'i2',
        label: 'Sealed emergency paper ballot fallback custody protocol',
        description: 'Physical paper backup stored in locked vault under joint custody of Patron & Returning Officer.',
        verified: false,
        verifiedBy: 'Awaiting Patron Joint Seal',
        updatedAt: 'Pending Formal Handover'
      },
      {
        id: 'i3',
        label: 'Helpdesk and roster discrepancy resolution channel staffed',
        description: 'Designated non-voting student helpdesk trained to assist without observing voter screens.',
        verified: true,
        verifiedBy: 'Assistant Coordinator',
        updatedAt: 'Verified Oct 2026'
      }
    ]
  }
];

export const CONSTITUTIONAL_ARTICLES: ConstitutionalArticle[] = [
  {
    number: 39,
    title: 'General Election Principles',
    summary: 'Guarantees free, fair, simple, transparent, and credible elections conducted by secret ballot or secure online system without intimidation, bribery, or coercion.',
    keyRequirements: [
      'Universal suffrage for all fully registered KUPSA student members',
      'Freedom of choice without improper influence or commercial bribery',
      'Absolute secrecy of individual vote selections'
    ]
  },
  {
    number: 40,
    title: 'Election of Officials & Majority Win',
    summary: 'A candidate wins an election upon receiving a majority of valid votes cast. Ties mandate a fresh run-off election between the tied candidates within 7 to 14 days.',
    keyRequirements: [
      'Simple majority of valid votes cast determines the winner',
      'Tied votes trigger a fresh run-off strictly between tied aspirants',
      'Run-off must be held within 7-14 days under Article 46'
    ]
  },
  {
    number: 41,
    title: 'Election Timetable & Annual Cycle',
    summary: 'The General Election shall take place on the first Friday of November every academic year unless altered by two-thirds of the Executive.',
    keyRequirements: [
      'Strict constitutional date: First Friday of November',
      'Any alteration requires 2/3 executive majority and Patron concurrence',
      'Polls open 08:00 EAT and close 17:00 EAT on polling day'
    ]
  },
  {
    number: 42,
    title: 'Qualifications & Disqualifications of Candidates',
    summary: 'Aspirants must be fully registered Bachelor of Pharmacy students in good academic and disciplinary standing, with fully paid association dues.',
    keyRequirements: [
      'Enrolled in Kabarak University Bachelor of Pharmacy program',
      'Minimum cumulative Grade Point Average (GPA) of 3.0 / Second Class Upper',
      'Clean disciplinary record with no pending student disciplinary committee cases',
      'Must have served as an active member of KUPSA for at least one semester'
    ]
  },
  {
    number: 44,
    title: 'Vetting of Candidates & Code of Conduct',
    summary: 'The Electoral Commission vets all candidates and enforces the statutory Code of Conduct covering speech, finance, and campaigning ethics.',
    keyRequirements: [
      'Commission conducts public or documented vetting of credentials',
      'Aspirants must sign the mandatory Electoral Code of Conduct',
      'Violations subject to disqualification under Article 55'
    ]
  },
  {
    number: 45,
    title: 'System Requirements for Online Voting',
    summary: 'Any online election system must be simple, accurate, verifiable, secure, transparent, and accountable, maintaining zero linkage between voter identity and selections.',
    keyRequirements: [
      'Cryptographic or architectural ballot secrecy',
      'Audit log accessible to accredited observers in real-time',
      'Open and verifiable tallying before official results declaration'
    ]
  },
  {
    number: 46,
    title: 'Declaration of Results',
    summary: 'The Returning Officer and Commission must count, tally, and officially declare the election results within 24 hours of the close of polling.',
    keyRequirements: [
      'Strict 24-hour statutory deadline from poll closure to declaration',
      'Results signed by Returning Officer, Commissioners, and candidate agents',
      'Formal certificate of election issued to winners'
    ]
  },
  {
    number: 47,
    title: 'Election Disputes & Petitions',
    summary: 'Any aggrieved candidate may submit a formal petition in writing to the Electoral Commission within 12 hours of result declaration, with an immediate copy to the Patron.',
    keyRequirements: [
      'Strict 12-hour filing deadline following official result announcement',
      'Must be in writing, signed, specifying constitutional grounds',
      'Mandatory copy delivered concurrently to the Patron for independent oversight'
    ]
  },
  {
    number: 50,
    title: 'Appointment & Independence of Commission',
    summary: 'A 5-member independent Electoral Commission appointed by the Executive at least one month prior to the election, operating with total operational autonomy.',
    keyRequirements: [
      '5 commissioners including Chairperson, Vice Chairperson, and Secretary',
      'Appointed and gazetted minimum 30 days before polling day',
      'Commission decisions are independent of current KUPSA executive'
    ]
  }
];

export const OBSERVER_AUDIT_LOGS: ObserverAuditLog[] = [
  {
    id: 'log-001',
    timestamp: '2026-10-18 08:00:00 EAT',
    stage: 'System Initialization',
    action: 'Commission quorum confirmed; public cryptographic genesis hash published',
    actorRole: 'Returning Officer',
    hashProof: 'sha256:8f4b13a7c6e2...901d',
    status: 'Verified'
  },
  {
    id: 'log-002',
    timestamp: '2026-10-18 08:30:15 EAT',
    stage: 'Roster Verification',
    action: 'Faculty registrar roster checksum verified against dean signed master file',
    actorRole: 'Electoral Commission ICT',
    hashProof: 'sha256:e3b0c44298fc...1c14',
    status: 'Verified'
  },
  {
    id: 'log-003',
    timestamp: '2026-10-18 09:00:00 EAT',
    stage: 'Readiness Gate Check',
    action: 'Readiness Checklist reviewed in presence of candidate agents & observer delegation',
    actorRole: 'Commission Secretary',
    hashProof: 'sha256:7c9e11a3b8d4...55a2',
    status: 'Verified'
  },
  {
    id: 'log-004',
    timestamp: '2026-10-18 09:15:22 EAT',
    stage: 'Observer Accreditation',
    action: '4 accredited observers from KUSA & Pharmacy Faculty granted read-only telemetry keys',
    actorRole: 'Observer Coordinator',
    hashProof: 'sha256:3a91f4e0c128...88be',
    status: 'Verified'
  }
];

export const SAMPLE_DISPUTES: DisputeSubmission[] = [
  {
    id: 'disp-2026-01',
    timestamp: '2026-10-18 09:45 EAT',
    complainantName: 'Sample Aspirant Agent (Test)',
    complainantRole: 'Candidate Agent for Vice Chairperson',
    officeContested: 'Vice Chairperson',
    constitutionalGrounds: 'Article 44(3) — Inquiry regarding digital campaign material distribution during moratorium window.',
    status: 'Under Review by Commission & Patron',
    patronNotified: true,
    resolutionNotes: 'Commission confirmed campaign social media embargo was observed; response drafted with Patron confirmation.'
  }
];

export const OFFICE_RESULTS: OfficeResult[] = [
  {
    officeId: 'president',
    officeTitle: 'The President',
    constitutionalArticle: 'Article 42(1)',
    totalVotesCast: 0,
    validVotes: 0,
    spoiltOrBlanks: 0,
    status: 'Under Verification',
    candidateTallies: [
      {
        candidateId: 'cand-pres-01',
        candidateName: 'Wambua Titus',
        initials: 'WT',
        votes: 0,
        percentage: 0,
        isWinner: false
      },
      {
        candidateId: 'cand-pres-02',
        candidateName: 'Mputhia Mark Mwenda',
        initials: 'MMM',
        votes: 0,
        percentage: 0,
        isWinner: false
      }
    ],
    agentSignoffs: [
      { agentName: 'Electoral Agent 1', candidateName: 'Wambua Titus', signed: true },
      { agentName: 'Electoral Agent 2', candidateName: 'Mputhia Mark Mwenda', signed: true }
    ]
  },
  {
    officeId: 'vice-president',
    officeTitle: 'Vice President',
    constitutionalArticle: 'Article 42(2)',
    totalVotesCast: 0,
    validVotes: 0,
    spoiltOrBlanks: 0,
    status: 'Declared Majority Winner',
    winnerName: 'Oire Valarie Bonareri',
    candidateTallies: [
      {
        candidateId: 'cand-vp-01',
        candidateName: 'Oire Valarie Bonareri',
        initials: 'OVB',
        votes: 0,
        percentage: 100,
        isWinner: true
      }
    ],
    agentSignoffs: [
      { agentName: 'Patron Representative', candidateName: 'Oire Valarie Bonareri', signed: true }
    ]
  },
  {
    officeId: 'sec-general',
    officeTitle: 'Secretary General',
    constitutionalArticle: 'Article 42(3)',
    totalVotesCast: 0,
    validVotes: 0,
    spoiltOrBlanks: 0,
    status: 'Under Verification',
    candidateTallies: [
      {
        candidateId: 'cand-sg-01',
        candidateName: 'Ndema Paul Antony',
        initials: 'NPA',
        votes: 0,
        percentage: 0,
        isWinner: false
      },
      {
        candidateId: 'cand-sg-02',
        candidateName: 'Isabell Njoki',
        initials: 'IN',
        votes: 0,
        percentage: 0,
        isWinner: false
      },
      {
        candidateId: 'cand-sg-03',
        candidateName: 'Ian Mark Makokha',
        initials: 'IMM',
        votes: 0,
        percentage: 0,
        isWinner: false
      }
    ],
    agentSignoffs: [
      { agentName: 'Agent NPA', candidateName: 'Ndema Paul Antony', signed: true },
      { agentName: 'Agent IN', candidateName: 'Isabell Njoki', signed: true },
      { agentName: 'Agent IMM', candidateName: 'Ian Mark Makokha', signed: true }
    ]
  },
  {
    officeId: 'dep-sec-general',
    officeTitle: 'Deputy Secretary General',
    constitutionalArticle: 'Article 42(4)',
    totalVotesCast: 0,
    validVotes: 0,
    spoiltOrBlanks: 0,
    status: 'Under Verification',
    candidateTallies: [
      {
        candidateId: 'cand-dsg-01',
        candidateName: 'Avyona Sarah Precious',
        initials: 'ASP',
        votes: 0,
        percentage: 0,
        isWinner: false
      },
      {
        candidateId: 'cand-dsg-02',
        candidateName: 'Nicole Chebet',
        initials: 'NC',
        votes: 0,
        percentage: 0,
        isWinner: false
      }
    ],
    agentSignoffs: [
      { agentName: 'Agent ASP', candidateName: 'Avyona Sarah Precious', signed: true },
      { agentName: 'Agent NC', candidateName: 'Nicole Chebet', signed: true }
    ]
  },
  {
    officeId: 'treasurer',
    officeTitle: 'Treasurer',
    constitutionalArticle: 'Article 42(5)',
    totalVotesCast: 0,
    validVotes: 0,
    spoiltOrBlanks: 0,
    status: 'Declared Majority Winner',
    winnerName: 'Otieno Daniel Shukran',
    candidateTallies: [
      {
        candidateId: 'cand-tres-01',
        candidateName: 'Otieno Daniel Shukran',
        initials: 'ODS',
        votes: 0,
        percentage: 100,
        isWinner: true
      }
    ],
    agentSignoffs: [
      { agentName: 'Patron Representative', candidateName: 'Otieno Daniel Shukran', signed: true }
    ]
  },
  {
    officeId: 'media-officer',
    officeTitle: 'Media and Publications Officer',
    constitutionalArticle: 'Article 42(6)',
    totalVotesCast: 0,
    validVotes: 0,
    spoiltOrBlanks: 0,
    status: 'Under Verification',
    candidateTallies: [
      {
        candidateId: 'cand-media-01',
        candidateName: 'Jasmine Jeptoo Jepkosgei',
        initials: 'JJJ',
        votes: 0,
        percentage: 0,
        isWinner: false
      },
      {
        candidateId: 'cand-media-02',
        candidateName: 'Oyabi Joan',
        initials: 'OJ',
        votes: 0,
        percentage: 0,
        isWinner: false
      },
      {
        candidateId: 'cand-media-03',
        candidateName: 'Victor Perur',
        initials: 'VP',
        votes: 0,
        percentage: 0,
        isWinner: false
      }
    ],
    agentSignoffs: [
      { agentName: 'Agent JJJ', candidateName: 'Jasmine Jeptoo Jepkosgei', signed: true },
      { agentName: 'Agent OJ', candidateName: 'Oyabi Joan', signed: true },
      { agentName: 'Agent VP', candidateName: 'Victor Perur', signed: true }
    ]
  },
  {
    officeId: 'org-sec',
    officeTitle: 'Organizing Secretary',
    constitutionalArticle: 'Article 42(7)',
    totalVotesCast: 0,
    validVotes: 0,
    spoiltOrBlanks: 0,
    status: 'Under Verification',
    candidateTallies: [
      {
        candidateId: 'cand-org-01',
        candidateName: 'Nancy Njoroge Munjiru',
        initials: 'NNM',
        votes: 0,
        percentage: 0,
        isWinner: false
      },
      {
        candidateId: 'cand-org-02',
        candidateName: 'Ibrahim Khalif',
        initials: 'IK',
        votes: 0,
        percentage: 0,
        isWinner: false
      }
    ],
    agentSignoffs: [
      { agentName: 'Agent NNM', candidateName: 'Nancy Njoroge Munjiru', signed: true },
      { agentName: 'Agent IK', candidateName: 'Ibrahim Khalif', signed: true }
    ]
  }
];

export const TURNOUT_METRICS: TurnoutMetrics = {
  registeredTotal: 0,
  ballotsCast: 0,
  turnoutPercentage: 0,
  turnoutByCohort: [
    { year: 'Year 1 (Class of 2029)', registered: 0, voted: 0, percentage: 0 },
    { year: 'Year 2 (Class of 2028)', registered: 0, voted: 0, percentage: 0 },
    { year: 'Year 3 (Class of 2027)', registered: 0, voted: 0, percentage: 0 },
    { year: 'Year 4 (Class of 2026)', registered: 0, voted: 0, percentage: 0 },
    { year: 'Year 5 (Class of 2025)', registered: 0, voted: 0, percentage: 0 }
  ]
};

export const SAMPLE_CANDIDATE_APPLICATIONS: CandidateApplication[] = [];

export const CONTINGENCY_PROTOCOLS = [
  {
    id: 'cont-01',
    scenario: 'Campus Power Grid or Connectivity Failure',
    constitutionalAuthority: 'Article 51(3)',
    mitigation: 'System resides on geographically distributed cloud nodes with offline caching on voter mobile clients. If connectivity across campus is severed for >45 minutes, Commission extends polling window with equal duration upon written notice to Patron.',
    actionRequired: 'Commission quorum vote + written notification posted on KUPSA official notice boards.'
  },
  {
    id: 'cont-02',
    scenario: 'Student Registrar Roster Discrepancy',
    constitutionalAuthority: 'Article 42(a) & 45(1)',
    mitigation: 'Physical Helpdesk Room PH-104 staffed with Dean-appointed administrative officer. Provisional validation issued upon student showing fee clearance slip and active semester exam card.',
    actionRequired: 'Dual authorization by Returning Officer and Registrar liaison.'
  },
  {
    id: 'cont-03',
    scenario: 'Paper Ballot Fallback Activation',
    constitutionalAuthority: 'Article 39(4)(i) & 51',
    mitigation: '1,100 serialized, watermarked paper ballots stored in double-locked vault under joint custody of Returning Officer and Patron. Activated ONLY if digital voting is declared irreversibly compromised by unanimous Commission decision.',
    actionRequired: 'Unanimous 5-member Commission resolution + Patron countersignature.'
  }
];
