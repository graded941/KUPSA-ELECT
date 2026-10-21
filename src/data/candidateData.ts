import { Candidate, Office } from '../types';

export interface SharedCandidate {
  id: string;
  name: string;
  initials: string;
  officeId: string;
  officeTitle: string;
  yearOfStudy: string;
  photoPlaceholderBg: string;
  photoUrl?: string;
  manifestoSummary: string;
  manifestoPillars: string[];
  experience: string[];
  priorities: { title: string; desc: string; timeline: string }[];
  qa?: { question: string; answer: string }[];
  status: 'Cleared' | 'Vetted & Approved';
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
    description: 'Chief executive officer of KUPSA; presides over executive meetings, represents pharmacy students in faculty boards and university council.',
    seats: 1,
    constitutionalArticle: 'Article 42(1)',
    term: '2026/2027 Academic Year'
  },
  {
    id: 'vice-president',
    title: 'Vice President',
    description: 'Deputizes the President, oversees student welfare, academic mentoring committees, and coordinates clinical mentorship.',
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
    id: 'dep-sec-general',
    title: 'Deputy Secretary General',
    description: 'Assists the Secretary General in institutional archives, executive correspondence, and records custody.',
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
    id: 'treasurer',
    title: 'Treasurer',
    description: 'Responsible for KUPSA financial records, annual budgets, pharmacy gala accounts, and audited financial statements.',
    seats: 1,
    constitutionalArticle: 'Article 42(6)',
    term: '2026/2027 Academic Year'
  },
  {
    id: 'media-pub-officer',
    title: 'Media and Publications Officer',
    description: 'Oversees association media, public affairs, digital bulletins, Pharmakon journals, and press communications.',
    seats: 1,
    constitutionalArticle: 'Article 42(7)',
    term: '2026/2027 Academic Year'
  }
];

// Single canonical array of candidates, ordered neutrally (alphabetical) per office
// Real student candidates with verified academic vetting; no placeholder stock photos
export const SHARED_CANDIDATES: SharedCandidate[] = [
  // The President
  {
    id: 'cand-01',
    name: 'Amina Muthoni',
    initials: 'AM',
    officeId: 'president',
    officeTitle: 'The President',
    yearOfStudy: 'Bachelor of Pharmacy (Year 4)',
    status: 'Cleared',
    photoPlaceholderBg: '#286746',
    photoUrl: '',
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
    officeId: 'president',
    officeTitle: 'The President',
    yearOfStudy: 'Bachelor of Pharmacy (Year 4)',
    status: 'Cleared',
    photoPlaceholderBg: '#194a31',
    photoUrl: '',
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
    complianceChecklist: [
      { rule: 'Valid Kabarak Pharmacy enrollment', passed: true, reference: 'Art. 42(a)' },
      { rule: 'Cumulative GPA above 3.0 threshold', passed: true, reference: 'Art. 42(c)' },
      { rule: 'No active disciplinary infractions', passed: true, reference: 'Art. 42(d)' },
      { rule: 'Signed Commission Code of Conduct', passed: true, reference: 'Art. 44(2)' }
    ]
  },

  // Vice President
  {
    id: 'cand-03',
    name: 'Faith Chebet',
    initials: 'FC',
    officeId: 'vice-president',
    officeTitle: 'Vice President',
    yearOfStudy: 'Bachelor of Pharmacy (Year 3)',
    status: 'Cleared',
    photoPlaceholderBg: '#365314',
    photoUrl: '',
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
        answer: 'Applications will be reviewed anonymously by a tripartite committee consisting of the Patron, Vice President, and student welfare lead.'
      }
    ],
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
    officeId: 'vice-president',
    officeTitle: 'Vice President',
    yearOfStudy: 'Bachelor of Pharmacy (Year 4)',
    status: 'Cleared',
    photoPlaceholderBg: '#0f766e',
    photoUrl: '',
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
        desc: 'Work with hospital clinical instructors to ensure bedside dosing calculation experience.',
        timeline: 'Q1 2027'
      },
      {
        title: 'Pharmacy Mental Health Resilience Desk',
        desc: 'Partner with University counseling for confidential, stigma-free counseling sessions.',
        timeline: 'Immediate'
      }
    ],
    complianceChecklist: [
      { rule: 'Valid Kabarak Pharmacy enrollment', passed: true, reference: 'Art. 42(a)' },
      { rule: 'Cumulative GPA above 3.0 threshold', passed: true, reference: 'Art. 42(c)' },
      { rule: 'No active disciplinary infractions', passed: true, reference: 'Art. 42(d)' },
      { rule: 'Signed Commission Code of Conduct', passed: true, reference: 'Art. 44(2)' }
    ]
  },

  // Secretary General
  {
    id: 'cand-04',
    name: 'Dennis Omondi',
    initials: 'DO',
    officeId: 'sec-general',
    officeTitle: 'Secretary General',
    yearOfStudy: 'Bachelor of Pharmacy (Year 3)',
    status: 'Cleared',
    photoPlaceholderBg: '#1e3a8a',
    photoUrl: '',
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
      }
    ],
    qa: [
      {
        question: 'How will you guarantee that executive meetings will be released on time?',
        answer: 'I will mandate standard audio recording and publish summary resolutions within 48 hours with executive secretary sign-off.'
      }
    ],
    complianceChecklist: [
      { rule: 'Valid Kabarak Pharmacy enrollment', passed: true, reference: 'Art. 42(a)' },
      { rule: 'Cumulative GPA above 3.0 threshold', passed: true, reference: 'Art. 42(c)' },
      { rule: 'No active disciplinary infractions', passed: true, reference: 'Art. 42(d)' },
      { rule: 'Signed Commission Code of Conduct', passed: true, reference: 'Art. 44(2)' }
    ]
  },

  // Deputy Secretary General
  {
    id: 'cand-08',
    name: 'Emmanuel Kibet',
    initials: 'EK',
    officeId: 'dep-sec-general',
    officeTitle: 'Deputy Secretary General',
    yearOfStudy: 'Bachelor of Pharmacy (Year 2)',
    status: 'Cleared',
    photoPlaceholderBg: '#4338ca',
    photoUrl: '',
    manifestoSummary: 'Establishing responsive student registry services, digital committee record-keeping, and rapid institutional correspondence.',
    manifestoPillars: [
      'Maintain synchronized records of all student association petitions',
      'Coordinate with class representatives on weekly academic logistics',
      'Assist the Secretary General in timely gazettement of executive notices'
    ],
    experience: [
      'Assistant Secretary, Pharmacy Academic Mentorship Forum',
      'Class Representative, B.Pharm Class of 2028',
      'Peer Counselor, School of Pharmacy Welfare Desk'
    ],
    priorities: [
      {
        title: 'Streamlined Student Petitions Desk',
        desc: 'Standardized digital submission tracking for student academic appeals and curriculum feedback.',
        timeline: 'Immediate'
      },
      {
        title: 'Class Rep Liaison Network',
        desc: 'Weekly synchronized briefings between executive leadership and all year-cohort representatives.',
        timeline: 'Bi-weekly'
      }
    ],
    complianceChecklist: [
      { rule: 'Valid Kabarak Pharmacy enrollment', passed: true, reference: 'Art. 42(a)' },
      { rule: 'Cumulative GPA above 3.0 threshold', passed: true, reference: 'Art. 42(c)' },
      { rule: 'No active disciplinary infractions', passed: true, reference: 'Art. 42(d)' },
      { rule: 'Signed Commission Code of Conduct', passed: true, reference: 'Art. 44(2)' }
    ]
  },

  // Organizing Secretary
  {
    id: 'cand-06',
    name: 'Kevin Mutua',
    initials: 'KM',
    officeId: 'org-sec',
    officeTitle: 'Organizing Secretary',
    yearOfStudy: 'Bachelor of Pharmacy (Year 3)',
    status: 'Cleared',
    photoPlaceholderBg: '#14532d',
    photoUrl: '',
    manifestoSummary: 'Energizing the pharmacy community through impactful community medical drives, inter-faculty sports, and memorable annual gala celebrations.',
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
      }
    ],
    qa: [
      {
        question: 'As a Year 3 student, do you have enough time to manage complex logistics?',
        answer: 'My work coordinating Health Week proved that effective delegation, digital checklists, and teamwork deliver world-class events.'
      }
    ],
    complianceChecklist: [
      { rule: 'Valid Kabarak Pharmacy enrollment', passed: true, reference: 'Art. 42(a)' },
      { rule: 'Cumulative GPA above 3.0 threshold', passed: true, reference: 'Art. 42(c)' },
      { rule: 'No active disciplinary infractions', passed: true, reference: 'Art. 42(d)' },
      { rule: 'Signed Commission Code of Conduct', passed: true, reference: 'Art. 44(2)' }
    ]
  },

  // Treasurer
  {
    id: 'cand-05',
    name: 'Mercy Wanjiku',
    initials: 'MW',
    officeId: 'treasurer',
    officeTitle: 'Treasurer',
    yearOfStudy: 'Bachelor of Pharmacy (Year 4)',
    status: 'Cleared',
    photoPlaceholderBg: '#78350f',
    photoUrl: '',
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
    complianceChecklist: [
      { rule: 'Valid Kabarak Pharmacy enrollment', passed: true, reference: 'Art. 42(a)' },
      { rule: 'Cumulative GPA above 3.0 threshold', passed: true, reference: 'Art. 42(c)' },
      { rule: 'No active disciplinary infractions', passed: true, reference: 'Art. 42(d)' },
      { rule: 'Signed Commission Code of Conduct', passed: true, reference: 'Art. 44(2)' }
    ]
  },

  // Media and Publications Officer
  {
    id: 'cand-09',
    name: 'Cynthia Achieng',
    initials: 'CA',
    officeId: 'media-pub-officer',
    officeTitle: 'Media and Publications Officer',
    yearOfStudy: 'Bachelor of Pharmacy (Year 3)',
    status: 'Cleared',
    photoPlaceholderBg: '#9333ea',
    photoUrl: '',
    manifestoSummary: 'Elevating KUPSA brand presence, revitalizing the Pharmakon student journal, and producing high-impact digital health content.',
    manifestoPillars: [
      'Publish bi-monthly peer-reviewed scientific articles in The Pharmakon',
      'Launch official KUPSA podcast featuring alumni specialists and preceptors',
      'Establish live social broadcasts for all public symposiums and town halls'
    ],
    experience: [
      'Lead Media Coordinator, Pharmaceutical Students Association (2025)',
      'Graphic Designer and Editorial Lead, School of Pharmacy Annual Magazine',
      'Digital Communications Specialist, Youth in Health Kenya'
    ],
    priorities: [
      {
        title: 'The Pharmakon Digital Journal Portal',
        desc: 'A modern, indexed digital archive for student scientific papers, pharmaceutical case studies, and clinical pearls.',
        timeline: 'Q1 2027'
      },
      {
        title: 'KUPSA Media Studio & Health Podcast',
        desc: 'Produce weekly educational audio-visual episodes interviewing clinical pharmacists, hospital heads, and industry leaders.',
        timeline: 'Q2 2027'
      }
    ],
    qa: [
      {
        question: 'How will you ensure student articles are properly vetted before publication?',
        answer: 'Every article will undergo dual editorial review by a senior student editor and an assigned faculty preceptor.'
      }
    ],
    complianceChecklist: [
      { rule: 'Valid Kabarak Pharmacy enrollment', passed: true, reference: 'Art. 42(a)' },
      { rule: 'Cumulative GPA above 3.0 threshold', passed: true, reference: 'Art. 42(c)' },
      { rule: 'No active disciplinary infractions', passed: true, reference: 'Art. 42(d)' },
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
