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

export const OFFICES: Office[] = [
  {
    id: 'chairperson',
    title: 'Chairperson',
    description: 'Chief executive officer of KUPSA; presides over executive meetings, represents pharmacy students in faculty boards and national pharmaceutical bodies.',
    seats: 1,
    constitutionalArticle: 'Article 42(1)',
    term: '2026/2027 Academic Year'
  },
  {
    id: 'vice-chairperson',
    title: 'Vice Chairperson',
    description: 'Deputizes the Chairperson, oversees student welfare, academic mentoring committees, and coordinate professional symposium logistics.',
    seats: 1,
    constitutionalArticle: 'Article 42(2)',
    term: '2026/2027 Academic Year'
  },
  {
    id: 'sec-general',
    title: 'Secretary General',
    description: 'Custodian of all association records, minutes, correspondence, and official publications under constitutional mandate.',
    seats: 1,
    constitutionalArticle: 'Article 42(3)',
    term: '2026/2027 Academic Year'
  },
  {
    id: 'treasurer',
    title: 'Treasurer',
    description: 'Responsible for KUPSA financial records, annual budgets, pharmacy gala accounts, and timely financial reports audited by the Commission and Patron.',
    seats: 1,
    constitutionalArticle: 'Article 42(4)',
    term: '2026/2027 Academic Year'
  },
  {
    id: 'org-sec',
    title: 'Organizing Secretary',
    description: 'Coordinates pharmacy week outreach programs, community health camps, pharmaceutical manufacturer industrial visits, and sports.',
    seats: 1,
    constitutionalArticle: 'Article 42(5)',
    term: '2026/2027 Academic Year'
  },
  {
    id: 'academic-sec',
    title: 'Academic & Research Secretary',
    description: 'Liaises with School of Pharmacy faculty, organises peer revision groups, scientific abstract seminars, and student research journal entries.',
    seats: 1,
    constitutionalArticle: 'Article 42(6)',
    term: '2026/2027 Academic Year'
  }
];

export const CANDIDATES: Candidate[] = [
  {
    id: 'cand-01',
    name: 'Amina Muthoni',
    initials: 'AM',
    officeId: 'chairperson',
    yearOfStudy: 'Bachelor of Pharmacy (Year 4)',
    vettingStatus: 'Vetted & Approved',
    photoPlaceholderBg: '#286746',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    manifestoSummary: 'Dedicated to expanding pharmaceutical industry internships, student mental health support, and transparent executive accountability.',
    manifestoPillars: [
      'Expand regional pharmaceutical hospital & laboratory attachments by 40%',
      'Launch a transparent termly financial bulletin for all KUPSA members',
      'Institute peer-led pharmacology & medicinal chemistry tutorials'
    ],
    experience: [
      'Vice Chairperson, Kabarak Health Sciences Student Guild (2025)',
      'Clinical Pharmacy Attachment, Nakuru Level 5 Hospital (August 2025)',
      'Lead Convener, 2024 Rift Valley Young Pharmacists Symposium',
      'Class Representative, B.Pharm Class of 2027'
    ],
    priorities: [
      {
        title: 'Industrial & Hospital Placement Pipeline',
        desc: 'Formalize MoUs with 15 leading pharmaceutical manufacturers and county referral facilities for guaranteed clinical rotations.',
        timeline: 'Q1 2027'
      },
      {
        title: 'Real-Time Financial Transparency Ledger',
        desc: 'Publish monthly executive income/expense sheets directly to the student portal with dual-signatory receipts.',
        timeline: 'Immediate'
      },
      {
        title: 'Board Exam Preparation & Peer Tutorials',
        desc: 'Institutionalize weekend mock exams and pharmacology review seminars ahead of Pharmacy and Poisons Board assessments.',
        timeline: 'Q2 2027'
      }
    ],
    qa: [
      {
        question: 'How will you fund the promised hospital attachments stipends?',
        answer: 'We will ring-fence 25% of corporate sponsorship revenues from Pharmacy Week and collaborate with the Dean of Pharmacy on joint county liaison.'
      },
      {
        question: 'What is your plan for addressing student grievances during exam periods?',
        answer: 'Establish a 24-hour academic liaison channel directly to the Faculty Board of Examiners under constitutional Article 42.'
      }
    ],
    endorsementsCount: 84,
    complianceChecklist: [
      { rule: 'Valid Kabarak Pharmacy enrollment', passed: true, reference: 'Art. 42(a)' },
      { rule: 'Cumulative GPA above 3.0 threshold', passed: true, reference: 'Art. 42(c)' },
      { rule: 'No active disciplinary infractions', passed: true, reference: 'Art. 42(d)' },
      { rule: 'Signed Commission Code of Conduct', passed: true, reference: 'Art. 44(2)' }
    ]
  },
  {
    id: 'cand-02',
    name: 'Brian Kiprop',
    initials: 'BK',
    officeId: 'chairperson',
    yearOfStudy: 'Bachelor of Pharmacy (Year 4)',
    vettingStatus: 'Vetted & Approved',
    photoPlaceholderBg: '#194a31',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    manifestoSummary: 'Focusing on student scientific symposium sponsorship, laboratory material supplies advocacy, and clinical pharmacy round exchanges.',
    manifestoPillars: [
      'Establish student travel grants for national pharmaceutical conferences',
      'Strengthen dialogue with the Dean on compounding lab equipment upgrades',
      'Organize the 2027 Annual Rift Valley Pharmacy Health Caravan'
    ],
    experience: [
      'Head of Academic Affairs, Pharmaceutical Research Society (2025)',
      'Research Assistant, Kabarak Natural Products & Phytochemistry Lab',
      '1st Place, National Young Pharmacist Innovation Pitch (KPA 2025)',
      'Peer Tutor in Medicinal Chemistry & Pharmacognosy'
    ],
    priorities: [
      {
        title: 'Modern Laboratory Instrumentation Advocacy',
        desc: 'Submit a formal petition backed by student signatures to fast-track modern dissolution and HPLC apparatus upgrades.',
        timeline: 'Q1 2027'
      },
      {
        title: 'PSK National Conference Travel Grants',
        desc: 'Secure corporate grants to sponsor 12 students presenting research abstracts at the Pharmaceutical Society of Kenya Annual Conference.',
        timeline: 'Q2 2027'
      },
      {
        title: 'Cross-County Pharmacy Outreach Caravan',
        desc: 'Mobilize 150 students for community screening and patient education drives across Nakuru and Baringo counties.',
        timeline: 'Q3 2027'
      }
    ],
    qa: [
      {
        question: 'How do you plan to resolve equipment bottlenecks in practicals?',
        answer: 'By working with chief laboratory technologists to schedule flexible evening bench hours and procure supplementary glassware kits.'
      },
      {
        question: 'Why should students choose your leadership over traditional campaigns?',
        answer: 'I focus on tangible academic outcomes, verifiable research support, and clinical excellence that elevates our pharmacy degree.'
      }
    ],
    endorsementsCount: 79,
    complianceChecklist: [
      { rule: 'Valid Kabarak Pharmacy enrollment', passed: true, reference: 'Art. 42(a)' },
      { rule: 'Cumulative GPA above 3.0 threshold', passed: true, reference: 'Art. 42(c)' },
      { rule: 'No active disciplinary infractions', passed: true, reference: 'Art. 42(d)' },
      { rule: 'Signed Commission Code of Conduct', passed: true, reference: 'Art. 44(2)' }
    ]
  },
  {
    id: 'cand-03',
    name: 'Faith Chebet',
    initials: 'FC',
    officeId: 'vice-chairperson',
    yearOfStudy: 'Bachelor of Pharmacy (Year 3)',
    vettingStatus: 'Vetted & Approved',
    photoPlaceholderBg: '#365314',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    manifestoSummary: 'Prioritizing freshman integration into pharmacy school, mentorship pairing with practicing hospital pharmacists, and welfare emergency funds.',
    manifestoPillars: [
      'Pair 100% of incoming pharmacy freshers with senior peer guides',
      'Establish a formal KUPSA student welfare and emergency medicine fund',
      'Curate monthly professional networking dinners with alumni'
    ],
    experience: [
      'Secretary, Kabarak Red Cross Student Chapter (2024–2025)',
      'Coordinator, Pharmacy Peer Counseling Program',
      'Community Health Volunteer, Baringo County Medical Mission'
    ],
    priorities: [
      {
        title: 'Structured Peer Mentorship Academy',
        desc: 'Provide every Year 1 & Year 2 student a dedicated upper-year mentor for biochemistry and pharmaceutical math support.',
        timeline: 'Orientation 2027'
      },
      {
        title: 'Emergency Student Welfare & Rx Relief Fund',
        desc: 'Establish an independently overseen contingency reserve to assist students experiencing sudden medical or personal emergencies.',
        timeline: 'Q1 2027'
      },
      {
        title: 'Executive Alumni Networking Roundtables',
        desc: 'Host bi-monthly intimate dinners connecting current students with community pharmacy proprietors and hospital chief pharmacists.',
        timeline: 'Monthly'
      }
    ],
    qa: [
      {
        question: 'How will the welfare fund be governed to avoid favoritism?',
        answer: 'Applications will be reviewed anonymously by a tripartite committee consisting of the Patron, Vice Chairperson, and student welfare lead.'
      }
    ],
    endorsementsCount: 68,
    complianceChecklist: [
      { rule: 'Valid Kabarak Pharmacy enrollment', passed: true, reference: 'Art. 42(a)' },
      { rule: 'Cumulative GPA above 3.0 threshold', passed: true, reference: 'Art. 42(c)' },
      { rule: 'No active disciplinary infractions', passed: true, reference: 'Art. 42(d)' },
      { rule: 'Signed Commission Code of Conduct', passed: true, reference: 'Art. 44(2)' }
    ]
  },
  {
    id: 'cand-07',
    name: 'Sharon Nekesa',
    initials: 'SN',
    officeId: 'vice-chairperson',
    yearOfStudy: 'Bachelor of Pharmacy (Year 4)',
    vettingStatus: 'Vetted & Approved',
    photoPlaceholderBg: '#0f766e',
    photoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80',
    manifestoSummary: 'Championing practical clinical ward rounds, student mental health hotlines, and transparent hostel welfare conditions.',
    manifestoPillars: [
      'Advocate for protected clinical rotation shifts with Nakuru referral hospital',
      'Launch an anonymous peer mental wellness support desk',
      'Initiate quarterly Dean-student town halls on curriculum delivery'
    ],
    experience: [
      'Clinical Rotation Representative, Level 5 Hospital',
      'President, Kabarak Women in Science Initiative (2024)',
      'Lead Debater, Inter-faculty Bioethics Forum'
    ],
    priorities: [
      {
        title: 'Clinical Ward Preceptorship Expansion',
        desc: 'Work with the hospital clinical instructor to ensure third-year students get hands-on bedside dosing calculation experience.',
        timeline: 'Q1 2027'
      },
      {
        title: 'Pharmacy Mental Health Resilience Desk',
        desc: 'Partner with the University counseling department to provide confidential, stigma-free counseling sessions tailored to rigorous pharmacy coursework.',
        timeline: 'Immediate'
      },
      {
        title: 'Dean-Student Quarterly Town Halls',
        desc: 'Open forum where students directly question faculty leadership on exam timelines, syllabus coverage, and continuous assessments.',
        timeline: 'Quarterly'
      }
    ],
    qa: [
      {
        question: 'Why run for Vice Chairperson instead of Chairperson?',
        answer: 'Article 42(2) tasks the Vice Chairperson specifically with student welfare, mentoring, and symposiums—where my true passion and experience lie.'
      }
    ],
    endorsementsCount: 62,
    complianceChecklist: [
      { rule: 'Valid Kabarak Pharmacy enrollment', passed: true, reference: 'Art. 42(a)' },
      { rule: 'Cumulative GPA above 3.0 threshold', passed: true, reference: 'Art. 42(c)' },
      { rule: 'No active disciplinary infractions', passed: true, reference: 'Art. 42(d)' },
      { rule: 'Signed Commission Code of Conduct', passed: true, reference: 'Art. 44(2)' }
    ]
  },
  {
    id: 'cand-04',
    name: 'Dennis Omondi',
    initials: 'DO',
    officeId: 'sec-general',
    yearOfStudy: 'Bachelor of Pharmacy (Year 3)',
    vettingStatus: 'Vetted & Approved',
    photoPlaceholderBg: '#1e3a8a',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    manifestoSummary: 'Digitizing all KUPSA archives, publishing meeting minutes within 48 hours, and maintaining an active student bulletin board.',
    manifestoPillars: [
      'Digital public repository for all KUPSA meeting records',
      'Bi-weekly newsletter featuring internship openings and academic notices',
      'Automated association membership cards and certificate distribution'
    ],
    experience: [
      'Editor-in-Chief, The Kabarak Pharmakon Journal',
      'Secretary, Health Sciences Debating Union',
      'Digital Archivist for University Student Council'
    ],
    priorities: [
      {
        title: 'Public Digital Minutes & Resolution Tracker',
        desc: 'All executive decisions and constitutional votes published within 48 hours to prevent backroom resolutions.',
        timeline: 'Immediate'
      },
      {
        title: 'The Pharmacy Weekly Dispatch',
        desc: 'Curated e-newsletter sent directly to all pharmacy students featuring vetted internships, webinars, and deadlines.',
        timeline: 'Bi-weekly'
      },
      {
        title: 'Instant Digital Association Badges',
        desc: 'Issue verifiable digital membership cards with QR codes for access to symposiums and library book reserves.',
        timeline: 'Q1 2027'
      }
    ],
    qa: [
      {
        question: 'How will you guarantee that executive meetings will be released on time?',
        answer: 'I will mandate standard audio recording and publish summary resolutions within 48 hours with executive secretary sign-off.'
      }
    ],
    endorsementsCount: 54,
    complianceChecklist: [
      { rule: 'Valid Kabarak Pharmacy enrollment', passed: true, reference: 'Art. 42(a)' },
      { rule: 'Cumulative GPA above 3.0 threshold', passed: true, reference: 'Art. 42(c)' },
      { rule: 'No active disciplinary infractions', passed: true, reference: 'Art. 42(d)' },
      { rule: 'Signed Commission Code of Conduct', passed: true, reference: 'Art. 44(2)' }
    ]
  },
  {
    id: 'cand-05',
    name: 'Mercy Wanjiku',
    initials: 'MW',
    officeId: 'treasurer',
    yearOfStudy: 'Bachelor of Pharmacy (Year 4)',
    vettingStatus: 'Vetted & Approved',
    photoPlaceholderBg: '#78350f',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    manifestoSummary: 'Strict financial discipline, transparent budgeting with zero unaccounted petty cash, and audited accounts published before every AGM.',
    manifestoPillars: [
      'Audited quarterly financial statements displayed on portal',
      'Zero unauthorized expenditures; strict two-signatory compliance',
      'Maximize pharmacy week sponsorships to lower student contribution fees'
    ],
    experience: [
      'Treasurer, Kabarak University Finance & Investment Club',
      'Internal Auditor Assistant, Student Guild Accounts',
      'Passed CPA Section 1 with distinctions in financial accounting'
    ],
    priorities: [
      {
        title: 'Open Real-Time Financial Ledger',
        desc: 'Students can inspect all debits, credits, and sponsorship remittances in a secure public read-only portal view.',
        timeline: 'Q1 2027'
      },
      {
        title: 'Sponsorship Growth to Zero Student Levies',
        desc: 'Aggressively engage pharmaceutical distributors to underwrite symposium expenses, reducing student ticket prices to zero.',
        timeline: 'Q2 2027'
      },
      {
        title: 'Dual-Signatory Anti-Mismanagement Protocol',
        desc: 'Enforce strict Article 42(4) compliance where no withdrawal occurs without written approval from the Staff Patron.',
        timeline: 'Immediate'
      }
    ],
    qa: [
      {
        question: 'What happens if a project runs over budget?',
        answer: 'Any budget reallocation over 5% requires emergency executive vote and immediate publication to the association ledger.'
      }
    ],
    endorsementsCount: 71,
    complianceChecklist: [
      { rule: 'Valid Kabarak Pharmacy enrollment', passed: true, reference: 'Art. 42(a)' },
      { rule: 'Cumulative GPA above 3.0 threshold', passed: true, reference: 'Art. 42(c)' },
      { rule: 'No active disciplinary infractions', passed: true, reference: 'Art. 42(d)' },
      { rule: 'Signed Commission Code of Conduct', passed: true, reference: 'Art. 44(2)' }
    ]
  },
  {
    id: 'cand-06',
    name: 'Kevin Kibet',
    initials: 'KK',
    officeId: 'org-sec',
    yearOfStudy: 'Bachelor of Pharmacy (Year 2)',
    vettingStatus: 'Vetted & Approved',
    photoPlaceholderBg: '#14532d',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    manifestoSummary: 'Energizing the pharmacy community through impactful community medical drives, inter-faculty sports, and memorable annual dinners.',
    manifestoPillars: [
      'Organize two multi-county pharmacy outreach caravans in Nakuru & Baringo',
      'Revive the annual Kabarak Pharmacy Sports Gala and quiz competition',
      'Facilitate factory visits to leading Kenyan pharmaceutical manufacturers'
    ],
    experience: [
      'Sports Captain, School of Pharmacy (2024–2025)',
      'Lead Logistics Coordinator, Kabarak Health Week 2024',
      'Volunteer, Kenya Red Cross Disaster Response Team'
    ],
    priorities: [
      {
        title: 'Pharmacy Industrial Plant Excursions',
        desc: 'Organize three subsidized study tours to pharmaceutical manufacturing plants in Nairobi, Thika, and Athi River.',
        timeline: 'Semester 2'
      },
      {
        title: 'Annual Inter-Class Pharmaceutical Derby',
        desc: 'Organize football, basketball, and academic quiz matches between Years 1 through 5 to build cross-cohort unity.',
        timeline: 'Termly'
      },
      {
        title: 'Professional Pharmacy Gala & Award Night',
        desc: 'Host a prestigious end-of-year black-tie gala recognizing outstanding student researchers, clinicians, and mentors.',
        timeline: 'End of Year'
      }
    ],
    qa: [
      {
        question: 'As a Year 2 student, do you have enough time to manage complex logistics?',
        answer: 'My work coordinating Health Week proved that effective delegation, digital checklists, and teamwork deliver world-class events without academic compromise.'
      }
    ],
    endorsementsCount: 59,
    complianceChecklist: [
      { rule: 'Valid Kabarak Pharmacy enrollment', passed: true, reference: 'Art. 42(a)' },
      { rule: 'Cumulative GPA above 3.0 threshold', passed: true, reference: 'Art. 42(c)' },
      { rule: 'No active disciplinary infractions', passed: true, reference: 'Art. 42(d)' },
      { rule: 'Signed Commission Code of Conduct', passed: true, reference: 'Art. 44(2)' }
    ]
  }
];

export const SAMPLE_STUDENTS: StudentRecord[] = [
  {
    regNo: 'PHARM/2023/1042',
    name: 'Wairimu Njeri',
    email: 'wnjeri23@kabarak.ac.ke',
    yearOfStudy: 'Year 3',
    status: 'Eligible',
    reason: 'Enrolled in B.Pharm, active semester registration confirmed, KUPSA annual dues cleared.',
    duesCleared: true,
    academicGoodStanding: true
  },
  {
    regNo: 'PHARM/2022/0891',
    name: 'Emmanuel Kiprono',
    email: 'ekiprono22@kabarak.ac.ke',
    yearOfStudy: 'Year 4',
    status: 'Eligible',
    reason: 'Enrolled in B.Pharm, verified on official faculty register, KUPSA annual dues cleared.',
    duesCleared: true,
    academicGoodStanding: true
  },
  {
    regNo: 'PHARM/2024/1512',
    name: 'Stacy Akinyi',
    email: 'sakinyi24@kabarak.ac.ke',
    yearOfStudy: 'Year 2',
    status: 'Eligible',
    reason: 'Enrolled in B.Pharm, valid institutional identity, eligible for representative balloting.',
    duesCleared: true,
    academicGoodStanding: true
  },
  {
    regNo: 'PHARM/2021/0411',
    name: 'Collins Cheruiyot',
    email: 'ccheruiyot21@kabarak.ac.ke',
    yearOfStudy: 'Year 5',
    status: 'Action Required',
    reason: 'Semester unit registration pending registrar verification. Visit School of Pharmacy office.',
    duesCleared: true,
    academicGoodStanding: false
  },
  {
    regNo: 'PHARM/2025/2004',
    name: 'Joyce Kwamboka',
    email: 'jkwamboka25@kabarak.ac.ke',
    yearOfStudy: 'Year 1',
    status: 'Eligible',
    reason: 'Enrolled in B.Pharm, verified on freshman register, dues cleared.',
    duesCleared: true,
    academicGoodStanding: true
  },
  {
    regNo: 'MED/2023/3419',
    name: 'Victor Maina',
    email: 'vmaina23@kabarak.ac.ke',
    yearOfStudy: 'Year 3 (MBChB)',
    status: 'Ineligible',
    reason: 'Enrolled in School of Medicine (MBChB), not School of Pharmacy. Only KUPSA members vote in KUPSA elections.',
    duesCleared: false,
    academicGoodStanding: true
  }
];

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
    officeId: 'chairperson',
    officeTitle: 'Chairperson',
    constitutionalArticle: 'Article 40(1)',
    totalVotesCast: 894,
    validVotes: 880,
    spoiltOrBlanks: 14,
    status: 'Declared Majority Winner',
    winnerName: 'Amina Muthoni',
    candidateTallies: [
      {
        candidateId: 'cand-01',
        candidateName: 'Amina Muthoni',
        initials: 'AM',
        votes: 512,
        percentage: 58.18,
        isWinner: true
      },
      {
        candidateId: 'cand-02',
        candidateName: 'Brian Kiprop',
        initials: 'BK',
        votes: 368,
        percentage: 41.82,
        isWinner: false
      }
    ],
    agentSignoffs: [
      { agentName: 'Daniel Koech', candidateName: 'Amina Muthoni', signed: true },
      { agentName: 'Priscilla Kemunto', candidateName: 'Brian Kiprop', signed: true }
    ]
  },
  {
    officeId: 'vice-chairperson',
    officeTitle: 'Vice Chairperson',
    constitutionalArticle: 'Article 40(1)',
    totalVotesCast: 894,
    validVotes: 872,
    spoiltOrBlanks: 22,
    status: 'Declared Majority Winner',
    winnerName: 'Faith Chebet',
    candidateTallies: [
      {
        candidateId: 'cand-03',
        candidateName: 'Faith Chebet',
        initials: 'FC',
        votes: 492,
        percentage: 56.42,
        isWinner: true
      },
      {
        candidateId: 'cand-03b',
        candidateName: 'Samuel Rotich',
        initials: 'SR',
        votes: 380,
        percentage: 43.58,
        isWinner: false
      }
    ],
    agentSignoffs: [
      { agentName: 'Eunice Wangari', candidateName: 'Faith Chebet', signed: true },
      { agentName: 'Mark Kibor', candidateName: 'Samuel Rotich', signed: true }
    ]
  },
  {
    officeId: 'sec-general',
    officeTitle: 'Secretary General',
    constitutionalArticle: 'Article 40(5)',
    totalVotesCast: 894,
    validVotes: 880,
    spoiltOrBlanks: 14,
    status: 'Run-off Required (Tie)',
    candidateTallies: [
      {
        candidateId: 'cand-04',
        candidateName: 'Dennis Omondi',
        initials: 'DO',
        votes: 440,
        percentage: 50.0,
        isWinner: false
      },
      {
        candidateId: 'cand-04b',
        candidateName: 'Brenda Atieno',
        initials: 'BA',
        votes: 440,
        percentage: 50.0,
        isWinner: false
      }
    ],
    agentSignoffs: [
      { agentName: 'Titus Mutua', candidateName: 'Dennis Omondi', signed: true },
      { agentName: 'Gladys Chepkemoi', candidateName: 'Brenda Atieno', signed: true }
    ]
  },
  {
    officeId: 'treasurer',
    officeTitle: 'Treasurer',
    constitutionalArticle: 'Article 40(1)',
    totalVotesCast: 894,
    validVotes: 872,
    spoiltOrBlanks: 22,
    status: 'Declared Majority Winner',
    winnerName: 'Mercy Wanjiku',
    candidateTallies: [
      {
        candidateId: 'cand-05',
        candidateName: 'Mercy Wanjiku',
        initials: 'MW',
        votes: 610,
        percentage: 69.95,
        isWinner: true
      },
      {
        candidateId: 'cand-05b',
        candidateName: 'Nelson Mutiso',
        initials: 'NM',
        votes: 262,
        percentage: 30.05,
        isWinner: false
      }
    ],
    agentSignoffs: [
      { agentName: 'Faith Mwangi', candidateName: 'Mercy Wanjiku', signed: true },
      { agentName: 'Gideon Kiprono', candidateName: 'Nelson Mutiso', signed: true }
    ]
  },
  {
    officeId: 'org-sec',
    officeTitle: 'Organizing Secretary',
    constitutionalArticle: 'Article 40(1)',
    totalVotesCast: 894,
    validVotes: 872,
    spoiltOrBlanks: 22,
    status: 'Declared Majority Winner',
    winnerName: 'Kevin Kibet',
    candidateTallies: [
      {
        candidateId: 'cand-06',
        candidateName: 'Kevin Kibet',
        initials: 'KK',
        votes: 534,
        percentage: 61.24,
        isWinner: true
      },
      {
        candidateId: 'cand-06b',
        candidateName: 'Lucy Nyambura',
        initials: 'LN',
        votes: 338,
        percentage: 38.76,
        isWinner: false
      }
    ],
    agentSignoffs: [
      { agentName: 'Hillary Korir', candidateName: 'Kevin Kibet', signed: true },
      { agentName: 'Beatrice Achieng', candidateName: 'Lucy Nyambura', signed: true }
    ]
  }
];

export const TURNOUT_METRICS: TurnoutMetrics = {
  registeredTotal: 1028,
  ballotsCast: 894,
  turnoutPercentage: 86.96,
  turnoutByCohort: [
    { year: 'Year 1 (Class of 2029)', registered: 210, voted: 188, percentage: 89.52 },
    { year: 'Year 2 (Class of 2028)', registered: 224, voted: 196, percentage: 87.5 },
    { year: 'Year 3 (Class of 2027)', registered: 204, voted: 182, percentage: 89.22 },
    { year: 'Year 4 (Class of 2026)', registered: 205, voted: 178, percentage: 86.83 },
    { year: 'Year 5 (Class of 2025)', registered: 185, voted: 150, percentage: 81.08 }
  ]
};

export const SAMPLE_CANDIDATE_APPLICATIONS: CandidateApplication[] = [
  {
    id: 'APP-2026-081',
    fullName: 'Amina Muthoni',
    regNo: 'PHARM/2022/0742',
    email: 'amuthoni22@kabarak.ac.ke',
    officeId: 'chairperson',
    yearOfStudy: 'Year 4',
    gpa: '3.62',
    manifestoSummary: 'Advancing pharmaceutical industry internships, student mental health advocacy, and transparent termly financial bulletins.',
    manifestoPillars: [
      'Expand regional pharmaceutical hospital & laboratory attachments by 40%',
      'Launch transparent termly financial bulletins',
      'Institute peer-led pharmacology tutorials'
    ],
    endorsementsCount: 18,
    status: 'Approved & Gazetted',
    submittedAt: '2026-10-12 14:20 EAT',
    commissionNotes: 'Cleared by Dean of Pharmacy and Commission Vetting Bench. Validated 18 student endorsements.'
  },
  {
    id: 'APP-2026-094',
    fullName: 'Timothy Kiprotich',
    regNo: 'PHARM/2023/1104',
    email: 'tkiprotich23@kabarak.ac.ke',
    officeId: 'academic-sec',
    yearOfStudy: 'Year 3',
    gpa: '3.45',
    manifestoSummary: 'Establishing peer scientific journals, study material banks, and research publication clinics.',
    manifestoPillars: [
      'Create digital pharmacy revision archive',
      'Secure faculty mentorship for student clinical research'
    ],
    endorsementsCount: 16,
    status: 'Under Faculty Review',
    submittedAt: '2026-10-15 11:05 EAT',
    commissionNotes: 'Transcripts under academic verification with faculty registrar.'
  },
  {
    id: 'APP-2026-102',
    fullName: 'Caroline Njoki',
    regNo: 'PHARM/2024/1892',
    email: 'cnjoki24@kabarak.ac.ke',
    officeId: 'vice-chairperson',
    yearOfStudy: 'Year 2',
    gpa: '3.15',
    manifestoSummary: 'Student welfare emergency safety net, mentorship pairings, and orientation camps.',
    manifestoPillars: [
      'Freshman mentorship pairings',
      'Student emergency medical welfare kitty'
    ],
    endorsementsCount: 12,
    status: 'Clarification Requested',
    submittedAt: '2026-10-16 16:40 EAT',
    commissionNotes: 'Requires 3 additional student endorsement signatures to satisfy statutory 15-signature rule (Article 42).'
  }
];

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
