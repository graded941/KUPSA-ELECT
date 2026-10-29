export interface SharedCandidate {
  id: string;
  name: string;
  initials: string;
  officeId: string;
  officeTitle: string;
  yearOfStudy: string;
  photoUrl?: string;
  photoPlaceholderBg?: string;
  manifestoSummary: string;
  manifestoPillars: string[];
  experience?: string[];
  priorities?: { title: string; desc: string; timeline: string }[];
  qa?: { question: string; answer: string }[];
  status: 'Cleared' | 'Vetted & Approved';
  unopposed?: boolean;
  complianceChecklist?: { rule: string; passed: boolean; reference: string }[];
}

export interface SharedOffice {
  id: string;
  title: string;
  description: string;
  seats: number;
  constitutionalArticle: string;
  term: string;
}

export const SHARED_OFFICES: SharedOffice[] = [
  {
    id: 'president',
    title: 'The President',
    description: 'Chief Executive Officer; presides over Executive meetings, represents pharmacy students in Faculty Board and University Senate.',
    seats: 1,
    constitutionalArticle: 'Article 42(1)',
    term: '2026/2027 Academic Year'
  },
  {
    id: 'vice-president',
    title: 'Vice President',
    description: 'Deputizes the President; coordinates student welfare, clinical rotations mentorship, and academic appeals.',
    seats: 1,
    constitutionalArticle: 'Article 42(2)',
    term: '2026/2027 Academic Year'
  },
  {
    id: 'sec-general',
    title: 'Secretary General',
    description: 'Official custodian of association records, minutes, executive correspondence, and constitutional gazette notices.',
    seats: 1,
    constitutionalArticle: 'Article 42(3)',
    term: '2026/2027 Academic Year'
  },
  {
    id: 'dep-sec-general',
    title: 'Deputy Secretary General',
    description: 'Assists the Secretary General in institutional archives, committee minutes, and official correspondence.',
    seats: 1,
    constitutionalArticle: 'Article 42(4)',
    term: '2026/2027 Academic Year'
  },
  {
    id: 'treasurer',
    title: 'Treasurer',
    description: 'Custodian of association funds, annual budgets, Pharmacy Gala books, and certified audited accounts.',
    seats: 1,
    constitutionalArticle: 'Article 42(5)',
    term: '2026/2027 Academic Year'
  },
  {
    id: 'media-officer',
    title: 'Media and Publications Officer',
    description: 'Directs association public affairs, press statements, digital student bulletins, and the Pharmakon scientific journal.',
    seats: 1,
    constitutionalArticle: 'Article 42(6)',
    term: '2026/2027 Academic Year'
  },
  {
    id: 'org-sec',
    title: 'Organizing Secretary',
    description: 'Directs Pharmacy Week outreach, community health camps, industrial pharmaceutical manufacturer tours, and sports.',
    seats: 1,
    constitutionalArticle: 'Article 42(7)',
    term: '2026/2027 Academic Year'
  }
];

// Official list of certified candidates across the 7 constitutional portfolios (without admission numbers)
export const SHARED_CANDIDATES: SharedCandidate[] = [
  // 1. PRESIDENT
  {
    id: 'cand-pres-01',
    name: 'Wambua Titus',
    initials: 'WT',
    officeId: 'president',
    officeTitle: 'The President',
    yearOfStudy: 'Bachelor of Pharmacy (Year 3)',
    status: 'Vetted & Approved',
    photoPlaceholderBg: '#1e3a8a',
    manifestoSummary: 'Advancing academic excellence, student representation in faculty governance, and pharmaceutical industry mentorship.',
    manifestoPillars: [
      'Represent pharmacy student interests in University Senate and Faculty Board',
      'Foster clinical rotation sponsorships and national hospital attachments',
      'Ensure transparent executive accountability and termly town halls'
    ],
    experience: [
      'Active Student Representative, School of Pharmacy',
      'Lead Coordinator, Kabarak Medical Outreach 2025'
    ],
    complianceChecklist: [
      { rule: 'Valid Kabarak Pharmacy enrollment', passed: true, reference: 'Art. 42(a)' },
      { rule: 'Cumulative GPA above 3.0 threshold', passed: true, reference: 'Art. 42(c)' },
      { rule: 'Signed Commission Code of Conduct', passed: true, reference: 'Art. 44(2)' }
    ]
  },
  {
    id: 'cand-pres-02',
    name: 'Mputhia Mark Mwenda',
    initials: 'MMM',
    officeId: 'president',
    officeTitle: 'The President',
    yearOfStudy: 'Bachelor of Pharmacy (Year 2)',
    status: 'Vetted & Approved',
    photoPlaceholderBg: '#065f46',
    manifestoSummary: 'Unifying all pharmacy cohorts, elevating pharmacy student welfare, and championing innovative clinical skills workshops.',
    manifestoPillars: [
      'Launch peer-led pharmacology mastery tutorials and resource banks',
      'Streamline emergency student welfare assistance',
      'Expand regional medical camps and community health engagements'
    ],
    experience: [
      'Coordinator, Pharmacy Peer Tutoring Program',
      'Committee Member, Health Week Logistics'
    ],
    complianceChecklist: [
      { rule: 'Valid Kabarak Pharmacy enrollment', passed: true, reference: 'Art. 42(a)' },
      { rule: 'Cumulative GPA above 3.0 threshold', passed: true, reference: 'Art. 42(c)' },
      { rule: 'Signed Commission Code of Conduct', passed: true, reference: 'Art. 44(2)' }
    ]
  },

  // 2. VICE PRESIDENT (Elected Unopposed)
  {
    id: 'cand-vp-01',
    name: 'Oire Valarie Bonareri',
    initials: 'OVB',
    officeId: 'vice-president',
    officeTitle: 'Vice President',
    yearOfStudy: 'Bachelor of Pharmacy (Year 2)',
    status: 'Vetted & Approved',
    unopposed: true,
    photoPlaceholderBg: '#831843',
    manifestoSummary: 'Elected unopposed. Dedicated to student welfare, freshman peer mentorship, and hospital clinical rotation attachments.',
    manifestoPillars: [
      'Comprehensive mentorship pairing for incoming cohorts',
      'Protected clinical ward round scheduling and student academic support',
      'Promote mental wellness and inclusive pharmacy community events'
    ],
    experience: [
      'Vice Lead, Student Mentorship Academy',
      'Active Volunteer, Nakuru Community Health Drive'
    ],
    complianceChecklist: [
      { rule: 'Valid Kabarak Pharmacy enrollment', passed: true, reference: 'Art. 42(a)' },
      { rule: 'Cumulative GPA above 3.0 threshold', passed: true, reference: 'Art. 42(c)' },
      { rule: 'Signed Commission Code of Conduct', passed: true, reference: 'Art. 44(2)' }
    ]
  },

  // 3. SECRETARY GENERAL
  {
    id: 'cand-sg-01',
    name: 'Ndema Paul Antony',
    initials: 'NPA',
    officeId: 'sec-general',
    officeTitle: 'Secretary General',
    yearOfStudy: 'Bachelor of Pharmacy (Year 2)',
    status: 'Vetted & Approved',
    photoPlaceholderBg: '#1f2937',
    manifestoSummary: 'Institutional transparency, prompt dissemination of meeting minutes, and seamless communication between executive and students.',
    manifestoPillars: [
      'Publish executive resolutions within 48 hours of sittings',
      'Establish a digital constitutional archive and circular portal',
      'Streamline official communication with student class representatives'
    ],
    experience: [
      'Cohort Secretary, Class of 2028',
      'Documentation Officer, Pharmacy Academic Forum'
    ],
    complianceChecklist: [
      { rule: 'Valid Kabarak Pharmacy enrollment', passed: true, reference: 'Art. 42(a)' },
      { rule: 'Cumulative GPA above 3.0 threshold', passed: true, reference: 'Art. 42(c)' },
      { rule: 'Signed Commission Code of Conduct', passed: true, reference: 'Art. 44(2)' }
    ]
  },
  {
    id: 'cand-sg-02',
    name: 'Isabell Njoki',
    initials: 'IN',
    officeId: 'sec-general',
    officeTitle: 'Secretary General',
    yearOfStudy: 'Bachelor of Pharmacy (Year 1)',
    status: 'Vetted & Approved',
    photoPlaceholderBg: '#4c1d95',
    manifestoSummary: 'Diligent documentation, accessible student inquiries, and transparent association affairs.',
    manifestoPillars: [
      'Timely gazettement of KUPSA notices and academic activities',
      'Open digital correspondence desk for all student inquiries',
      'Accurate historical records and comprehensive annual executive reports'
    ],
    experience: [
      'Freshman Class Liaison Officer',
      'Member, Student Debate & Communications Society'
    ],
    complianceChecklist: [
      { rule: 'Valid Kabarak Pharmacy enrollment', passed: true, reference: 'Art. 42(a)' },
      { rule: 'Cumulative GPA above 3.0 threshold', passed: true, reference: 'Art. 42(c)' },
      { rule: 'Signed Commission Code of Conduct', passed: true, reference: 'Art. 44(2)' }
    ]
  },
  {
    id: 'cand-sg-03',
    name: 'Ian Mark Makokha',
    initials: 'IMM',
    officeId: 'sec-general',
    officeTitle: 'Secretary General',
    yearOfStudy: 'Bachelor of Pharmacy (Year 2)',
    status: 'Vetted & Approved',
    photoPlaceholderBg: '#0f766e',
    manifestoSummary: 'Streamlined executive administration, dynamic student engagements, and prompt official bulletins.',
    manifestoPillars: [
      'Modernize association digital records and circular workflows',
      'Facilitate active inter-cohort communication networks',
      'Ensure strict constitutional compliance across all executive meetings'
    ],
    experience: [
      'Assistant Secretary, Health Sciences Coalition',
      'Administrative Liaison, KUPSA Annual General Meeting'
    ],
    complianceChecklist: [
      { rule: 'Valid Kabarak Pharmacy enrollment', passed: true, reference: 'Art. 42(a)' },
      { rule: 'Cumulative GPA above 3.0 threshold', passed: true, reference: 'Art. 42(c)' },
      { rule: 'Signed Commission Code of Conduct', passed: true, reference: 'Art. 44(2)' }
    ]
  },

  // 4. DEPUTY SECRETARY GENERAL
  {
    id: 'cand-dsg-01',
    name: 'Avyona Sarah Precious',
    initials: 'ASP',
    officeId: 'dep-sec-general',
    officeTitle: 'Deputy Secretary General',
    yearOfStudy: 'Bachelor of Pharmacy (Year 1)',
    status: 'Vetted & Approved',
    photoPlaceholderBg: '#701a75',
    manifestoSummary: 'Supporting administrative excellence, cohort-wide liaison, and meticulous record keeping.',
    manifestoPillars: [
      'Support timely execution and backup of all Secretariat duties',
      'Bridge lower and upper cohort communications effectively',
      'Maintain reliable association records and calendar tracking'
    ],
    experience: [
      'Member, KUPSA Secretariat Support Team',
      'Event Coordinator, World Pharmacists Day 2025'
    ],
    complianceChecklist: [
      { rule: 'Valid Kabarak Pharmacy enrollment', passed: true, reference: 'Art. 42(a)' },
      { rule: 'Cumulative GPA above 3.0 threshold', passed: true, reference: 'Art. 42(c)' },
      { rule: 'Signed Commission Code of Conduct', passed: true, reference: 'Art. 44(2)' }
    ]
  },
  {
    id: 'cand-dsg-02',
    name: 'Nicole Chebet',
    initials: 'NC',
    officeId: 'dep-sec-general',
    officeTitle: 'Deputy Secretary General',
    yearOfStudy: 'Bachelor of Pharmacy (Year 1)',
    status: 'Vetted & Approved',
    photoPlaceholderBg: '#155e75',
    manifestoSummary: 'Active secretariat support, efficient event documentation, and responsive student coordination.',
    manifestoPillars: [
      'Rapid notification of association circulars and study timetables',
      'Comprehensive minute archiving for all committee sessions',
      'Assist student welfare initiatives through organized secretarial support'
    ],
    experience: [
      'Secretary, Kabarak Red Cross Student Division',
      'Freshman Peer Mentor'
    ],
    complianceChecklist: [
      { rule: 'Valid Kabarak Pharmacy enrollment', passed: true, reference: 'Art. 42(a)' },
      { rule: 'Cumulative GPA above 3.0 threshold', passed: true, reference: 'Art. 42(c)' },
      { rule: 'Signed Commission Code of Conduct', passed: true, reference: 'Art. 44(2)' }
    ]
  },

  // 5. TREASURER (Elected Unopposed)
  {
    id: 'cand-tres-01',
    name: 'Otieno Daniel Shukran',
    initials: 'ODS',
    officeId: 'treasurer',
    officeTitle: 'Treasurer',
    yearOfStudy: 'Bachelor of Pharmacy (Year 1)',
    status: 'Vetted & Approved',
    unopposed: true,
    photoPlaceholderBg: '#14532d',
    manifestoSummary: 'Elected unopposed. Prudent financial stewardship, transparent budget reporting, and timely funding for student events.',
    manifestoPillars: [
      'Publish termly itemized financial statements and balance sheets',
      'Prudently disburse funds for Pharmacy Week and community health camps',
      'Ensure absolute accountability and integrity in all KUPSA expenditures'
    ],
    experience: [
      'Finance Committee Member, School of Pharmacy',
      'Audit Assistant, Health Sciences Association'
    ],
    complianceChecklist: [
      { rule: 'Valid Kabarak Pharmacy enrollment', passed: true, reference: 'Art. 42(a)' },
      { rule: 'Cumulative GPA above 3.0 threshold', passed: true, reference: 'Art. 42(c)' },
      { rule: 'Signed Commission Code of Conduct', passed: true, reference: 'Art. 44(2)' }
    ]
  },

  // 6. MEDIA AND PUBLICATIONS OFFICER
  {
    id: 'cand-media-01',
    name: 'Jasmine Jeptoo Jepkosgei',
    initials: 'JJJ',
    officeId: 'media-officer',
    officeTitle: 'Media and Publications Officer',
    yearOfStudy: 'Bachelor of Pharmacy (Year 2)',
    status: 'Vetted & Approved',
    photoPlaceholderBg: '#854d0e',
    manifestoSummary: 'Transforming KUPSA digital presence, highlighting student research, and publishing engaging pharmacy newsletters.',
    manifestoPillars: [
      'Revamp social media outreach and professional LinkedIn presence',
      'Feature student clinical research and scientific achievements',
      'Produce regular visual and video recaps of school events'
    ],
    experience: [
      'Editor, The Pharmakon Student Bulletin',
      'Lead Graphic Designer, Health Sciences Expo 2025'
    ],
    complianceChecklist: [
      { rule: 'Valid Kabarak Pharmacy enrollment', passed: true, reference: 'Art. 42(a)' },
      { rule: 'Cumulative GPA above 3.0 threshold', passed: true, reference: 'Art. 42(c)' },
      { rule: 'Signed Commission Code of Conduct', passed: true, reference: 'Art. 44(2)' }
    ]
  },
  {
    id: 'cand-media-02',
    name: 'Oyabi Joan',
    initials: 'OJ',
    officeId: 'media-officer',
    officeTitle: 'Media and Publications Officer',
    yearOfStudy: 'Bachelor of Pharmacy (Year 2)',
    status: 'Vetted & Approved',
    photoPlaceholderBg: '#7c2d12',
    manifestoSummary: 'Creative media campaigns, informative public health bulletins, and vibrant association branding.',
    manifestoPillars: [
      'Launch student-driven pharmaceutical awareness campaigns',
      'Deliver informative digital pharmacy infographics and revision summaries',
      'Document and broadcast all KUPSA symposia and academic events'
    ],
    experience: [
      'Digital Media Manager, Pharmacy Student Association',
      'Content Creator, Public Health Awareness Outreach'
    ],
    complianceChecklist: [
      { rule: 'Valid Kabarak Pharmacy enrollment', passed: true, reference: 'Art. 42(a)' },
      { rule: 'Cumulative GPA above 3.0 threshold', passed: true, reference: 'Art. 42(c)' },
      { rule: 'Signed Commission Code of Conduct', passed: true, reference: 'Art. 44(2)' }
    ]
  },
  {
    id: 'cand-media-03',
    name: 'Victor Perur',
    initials: 'VP',
    officeId: 'media-officer',
    officeTitle: 'Media and Publications Officer',
    yearOfStudy: 'Bachelor of Pharmacy (Year 1)',
    status: 'Vetted & Approved',
    photoPlaceholderBg: '#374151',
    manifestoSummary: 'Amplifying student voices, innovative digital design, and timely broadcast of association opportunities.',
    manifestoPillars: [
      'Expand pharmacy career and internship broadcast channels',
      'Establish a monthly multimedia student spotlight series',
      'Enhance the aesthetic branding of all official publications'
    ],
    experience: [
      'Media Team Member, Kabarak University Annual Conference',
      'Communications Liaison, Class of 2029'
    ],
    complianceChecklist: [
      { rule: 'Valid Kabarak Pharmacy enrollment', passed: true, reference: 'Art. 42(a)' },
      { rule: 'Cumulative GPA above 3.0 threshold', passed: true, reference: 'Art. 42(c)' },
      { rule: 'Signed Commission Code of Conduct', passed: true, reference: 'Art. 44(2)' }
    ]
  },

  // 7. ORGANIZING SECRETARY
  {
    id: 'cand-org-01',
    name: 'Nancy Njoroge Munjiru',
    initials: 'NNM',
    officeId: 'org-sec',
    officeTitle: 'Organizing Secretary',
    yearOfStudy: 'Bachelor of Pharmacy (Year 2)',
    status: 'Vetted & Approved',
    photoPlaceholderBg: '#1e40af',
    manifestoSummary: 'Organizing impactful health outreaches, memorable social events, and well-structured industrial pharmaceutical tours.',
    manifestoPillars: [
      'Execute high-impact Kabarak Pharmacy Week and medical camps',
      'Coordinate factory tours to leading pharmaceutical manufacturing plants',
      'Foster cohort unity through inter-year sports and annual gala evenings'
    ],
    experience: [
      'Logistics Lead, Nakuru Free Medical Mission',
      'Assistant Events Coordinator, Health Week 2025'
    ],
    complianceChecklist: [
      { rule: 'Valid Kabarak Pharmacy enrollment', passed: true, reference: 'Art. 42(a)' },
      { rule: 'Cumulative GPA above 3.0 threshold', passed: true, reference: 'Art. 42(c)' },
      { rule: 'Signed Commission Code of Conduct', passed: true, reference: 'Art. 44(2)' }
    ]
  },
  {
    id: 'cand-org-02',
    name: 'Ibrahim Khalif',
    initials: 'IK',
    officeId: 'org-sec',
    officeTitle: 'Organizing Secretary',
    yearOfStudy: 'Bachelor of Pharmacy (Year 1)',
    status: 'Vetted & Approved',
    photoPlaceholderBg: '#047857',
    manifestoSummary: 'Dynamic event planning, collaborative community health initiatives, and vibrant student extracurriculars.',
    manifestoPillars: [
      'Seamless logistical coordination for all KUPSA activities',
      'Engaging academic symposia and clinical skills competitions',
      'Strengthen partnerships with local hospitals and community pharmacies'
    ],
    experience: [
      'Sports & Recreation Captain, Class of 2029',
      'Volunteer, Red Cross Community Health Aid'
    ],
    complianceChecklist: [
      { rule: 'Valid Kabarak Pharmacy enrollment', passed: true, reference: 'Art. 42(a)' },
      { rule: 'Cumulative GPA above 3.0 threshold', passed: true, reference: 'Art. 42(c)' },
      { rule: 'Signed Commission Code of Conduct', passed: true, reference: 'Art. 44(2)' }
    ]
  }
];

// Helper to get candidates for an office strictly sorted alphabetically by name
export function getCandidatesForOffice(officeId: string): SharedCandidate[] {
  return SHARED_CANDIDATES
    .filter((c) => c.officeId === officeId)
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Helper to get a candidate by id
export function getCandidateById(candidateId: string): SharedCandidate | undefined {
  return SHARED_CANDIDATES.find((c) => c.id === candidateId);
}
