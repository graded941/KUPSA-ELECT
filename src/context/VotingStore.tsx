import React, { createContext, useContext, useState, useEffect } from 'react';
import { SHARED_OFFICES, SHARED_CANDIDATES } from '../data/candidateData';
import { SAMPLE_STUDENTS } from '../data/mockData';

export interface VoterUser {
  email: string;
  name: string;
  yearOfStudy: string;
  password: string;
  hasVoted: boolean;
  votedAt?: string;
  receiptCode?: string;
}

export interface SimulatedEmail {
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  password: string;
  sentAt: string;
}

export interface CastVote {
  id: string;
  timestamp: string; // e.g. "14:32"
  fullTimestamp: string;
  choices: Record<string, string>; // officeId -> candidateId | 'abstain'
  voterYear: string;
  receiptCode: string;
}

export interface CandidateClearanceRecord {
  status: 'Cleared & Certified' | 'Under Review' | 'Provisional';
  notes: string;
  updatedAt: string;
}

export interface StudentAccreditationRecord {
  regNo: string;
  name: string;
  email: string;
  yearOfStudy: string;
  status: 'Eligible' | 'Action Required' | 'Ineligible';
  reason: string;
  hasVoted: boolean;
}

interface VotingStoreContextType {
  currentUser: VoterUser | null;
  users: VoterUser[];
  votes: CastVote[];
  simulatedEmails: SimulatedEmail[];
  lastCastVote: CastVote | null;
  totalRegistered: number;
  
  // Results Live / Not Live Control
  isResultsLive: boolean;
  setIsResultsLive: (val: boolean) => void;
  
  // Election Phase & Broadcast Notice Control
  electionPhase: 'pre-election' | 'polling-live' | 'counting' | 'results-declared';
  setElectionPhase: (phase: 'pre-election' | 'polling-live' | 'counting' | 'results-declared') => void;
  announcementBanner: string;
  setAnnouncementBanner: (text: string) => void;

  // Candidate Clearance Management
  candidateClearances: Record<string, CandidateClearanceRecord>;
  updateCandidateClearance: (candidateId: string, status: 'Cleared & Certified' | 'Under Review' | 'Provisional', notes: string) => void;

  // Voter Roll & Accreditation Management
  accreditationList: StudentAccreditationRecord[];
  toggleAccreditation: (regNo: string) => void;
  resetUserVoteStatus: (email: string) => void;

  // Auth actions
  signUp: (name: string, email: string, yearOfStudy: string) => { success: boolean; error?: string; password?: string; user?: VoterUser };
  login: (email: string, password: string) => { success: boolean; error?: string; user?: VoterUser };
  logout: () => void;
  castVote: (choices: Record<string, string>) => Promise<{ success: boolean; receiptCode: string; timestamp: string }>;
  simulateIncomingVote: () => CastVote;
  resetVotesToSeed: () => void;
  getSimulatedEmail: (email: string) => SimulatedEmail | undefined;
  resendEmail: (email: string) => boolean;
}

const USERS_STORAGE_KEY = 'kupsa_voters_v4';
const SESSION_STORAGE_KEY = 'kupsa_session_v4';
const VOTES_STORAGE_KEY = 'kupsa_votes_v4';
const EMAILS_STORAGE_KEY = 'kupsa_emails_v4';
const RESULTS_LIVE_KEY = 'kupsa_results_live_v4';
const PHASE_STORAGE_KEY = 'kupsa_phase_v4';
const BANNER_STORAGE_KEY = 'kupsa_banner_v4';
const CLEARANCE_STORAGE_KEY = 'kupsa_clearances_v4';
const ACCREDITATION_STORAGE_KEY = 'kupsa_accreditation_v4';

// Initial default seed users
const INITIAL_USERS: VoterUser[] = [
  {
    email: 'john.doe@kabarak.ac.ke',
    name: 'John Kipruto',
    yearOfStudy: 'Year 3',
    password: 'KUP-2026',
    hasVoted: false,
  },
  {
    email: 'sarah.cherono@kabarak.ac.ke',
    name: 'Sarah Cherono',
    yearOfStudy: 'Year 4',
    password: 'KUP-2026',
    hasVoted: true,
    votedAt: 'Today at 09:42 EAT',
    receiptCode: 'KUPSA-2026-REC-8921B',
  },
  {
    email: 'wnjeri23@kabarak.ac.ke',
    name: 'Wairimu Njeri',
    yearOfStudy: 'Year 3',
    password: 'KUP-2026',
    hasVoted: false,
  },
  {
    email: 'ekiprono22@kabarak.ac.ke',
    name: 'Emmanuel Kiprono',
    yearOfStudy: 'Year 4',
    password: 'KUP-2026',
    hasVoted: false,
  },
  {
    email: 'sakinyi24@kabarak.ac.ke',
    name: 'Stacy Akinyi',
    yearOfStudy: 'Year 2',
    password: 'KUP-2026',
    hasVoted: false,
  }
];

// Initial candidate clearance records
const INITIAL_CLEARANCES: Record<string, CandidateClearanceRecord> = {
  'cand-01': { status: 'Cleared & Certified', notes: 'Academic GPA > 3.0 confirmed. Clean conduct certification by School Patron.', updatedAt: 'Today, 08:30 EAT' },
  'cand-02': { status: 'Cleared & Certified', notes: 'All statutory nomination endorsements verified by Commission Secretary.', updatedAt: 'Today, 08:30 EAT' },
  'cand-03': { status: 'Cleared & Certified', notes: 'Welfare committee clearance and registrar academic standing confirmed.', updatedAt: 'Today, 08:35 EAT' },
  'cand-07': { status: 'Cleared & Certified', notes: 'Clinical rotations standing confirmed by Level 5 Hospital preceptor.', updatedAt: 'Today, 08:35 EAT' },
  'cand-04': { status: 'Cleared & Certified', notes: 'Constitutional editorial ethics oath signed and sealed.', updatedAt: 'Today, 08:40 EAT' },
  'cand-05': { status: 'Cleared & Certified', notes: 'CPA Section 1 certification verified; financial bond registered.', updatedAt: 'Today, 08:40 EAT' },
  'cand-06': { status: 'Cleared & Certified', notes: 'Sports and logistics patron approval certified.', updatedAt: 'Today, 08:45 EAT' },
};

// Initial accreditation registry
function generateInitialAccreditation(): StudentAccreditationRecord[] {
  return SAMPLE_STUDENTS.map((s) => ({
    regNo: s.regNo,
    name: s.name,
    email: s.email,
    yearOfStudy: s.yearOfStudy,
    status: s.status,
    reason: s.reason,
    hasVoted: s.email === 'sarah.cherono@kabarak.ac.ke',
  }));
}

// Initial seed votes for realistic tallies
function generateInitialVotes(): CastVote[] {
  const seedVotes: CastVote[] = [];
  const years = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];
  const now = new Date();

  // Create 247 realistic votes
  const count = 247;
  for (let i = 0; i < count; i++) {
    const minutesAgo = Math.floor(Math.random() * 360) + 10;
    const voteTime = new Date(now.getTime() - minutesAgo * 60000);
    const timeStr = voteTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // Weighted choice selection
    const choices: Record<string, string> = {
      chairperson: Math.random() < 0.53 ? 'cand-01' : 'cand-02',
      'vice-chairperson': Math.random() < 0.58 ? 'cand-03' : 'cand-07',
      'sec-general': Math.random() < 0.88 ? 'cand-04' : 'abstain',
      treasurer: Math.random() < 0.91 ? 'cand-05' : 'abstain',
      'org-sec': Math.random() < 0.85 ? 'cand-06' : 'abstain',
      'academic-sec': 'abstain',
    };

    seedVotes.push({
      id: `seed-vote-${i + 1}`,
      timestamp: timeStr,
      fullTimestamp: voteTime.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }),
      choices,
      voterYear: years[i % years.length] ?? 'Year 3',
      receiptCode: `KUPSA-2026-REC-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    });
  }

  return seedVotes.reverse();
}

const VotingStoreContext = createContext<VotingStoreContextType | null>(null);

export const VotingStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Users state
  const [users, setUsers] = useState<VoterUser[]>(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_USERS;
  });

  // 2. Current Session state
  const [currentUser, setCurrentUser] = useState<VoterUser | null>(() => {
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  // 3. Votes state
  const [votes, setVotes] = useState<CastVote[]>(() => {
    try {
      const saved = localStorage.getItem(VOTES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return generateInitialVotes();
  });

  // 4. Simulated Emails
  const [simulatedEmails, setSimulatedEmails] = useState<SimulatedEmail[]>(() => {
    try {
      const saved = localStorage.getItem(EMAILS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'email-demo-1',
        recipientEmail: 'john.doe@kabarak.ac.ke',
        recipientName: 'John Kipruto',
        subject: 'Your Official KUPSA Election Portal Password',
        password: 'KUP-2026',
        sentAt: 'Just now',
      },
    ];
  });

  // 5. Results Live Toggle (default: true for testing as requested)
  const [isResultsLive, setIsResultsLive] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(RESULTS_LIVE_KEY);
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return true; // ON by default for testing
  });

  // 6. Election Phase
  const [electionPhase, setElectionPhase] = useState<'pre-election' | 'polling-live' | 'counting' | 'results-declared'>(() => {
    try {
      const saved = localStorage.getItem(PHASE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return 'polling-live';
  });

  // 7. Announcement Banner
  const [announcementBanner, setAnnouncementBanner] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(BANNER_STORAGE_KEY);
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return 'Official Notice: General Polling stations close at 17:00 EAT. Late queues are constitutionally protected under Article 41(4).';
  });

  // 8. Candidate Clearance Registry
  const [candidateClearances, setCandidateClearances] = useState<Record<string, CandidateClearanceRecord>>(() => {
    try {
      const saved = localStorage.getItem(CLEARANCE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CLEARANCES;
  });

  // 9. Voter Roll & Accreditation
  const [accreditationList, setAccreditationList] = useState<StudentAccreditationRecord[]>(() => {
    try {
      const saved = localStorage.getItem(ACCREDITATION_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return generateInitialAccreditation();
  });

  const [lastCastVote, setLastCastVote] = useState<CastVote | null>(null);
  const totalRegistered = 384;

  // Persist states
  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  }, [users]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(votes));
    } catch (e) {
      console.error(e);
    }
  }, [votes]);

  useEffect(() => {
    try {
      localStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(simulatedEmails));
    } catch (e) {
      console.error(e);
    }
  }, [simulatedEmails]);

  useEffect(() => {
    try {
      localStorage.setItem(RESULTS_LIVE_KEY, JSON.stringify(isResultsLive));
    } catch (e) {
      console.error(e);
    }
  }, [isResultsLive]);

  useEffect(() => {
    try {
      localStorage.setItem(PHASE_STORAGE_KEY, JSON.stringify(electionPhase));
    } catch (e) {
      console.error(e);
    }
  }, [electionPhase]);

  useEffect(() => {
    try {
      localStorage.setItem(BANNER_STORAGE_KEY, JSON.stringify(announcementBanner));
    } catch (e) {
      console.error(e);
    }
  }, [announcementBanner]);

  useEffect(() => {
    try {
      localStorage.setItem(CLEARANCE_STORAGE_KEY, JSON.stringify(candidateClearances));
    } catch (e) {
      console.error(e);
    }
  }, [candidateClearances]);

  useEffect(() => {
    try {
      localStorage.setItem(ACCREDITATION_STORAGE_KEY, JSON.stringify(accreditationList));
    } catch (e) {
      console.error(e);
    }
  }, [accreditationList]);

  // Update candidate status
  const updateCandidateClearance = (
    candidateId: string,
    status: 'Cleared & Certified' | 'Under Review' | 'Provisional',
    notes: string
  ) => {
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')} EAT`;
    setCandidateClearances((prev) => ({
      ...prev,
      [candidateId]: {
        status,
        notes,
        updatedAt: `Today, ${timeStr}`,
      },
    }));
  };

  // Toggle accreditation status of student
  const toggleAccreditation = (regNo: string) => {
    setAccreditationList((prev) =>
      prev.map((s) => {
        if (s.regNo === regNo) {
          const nextStatus = s.status === 'Eligible' ? 'Action Required' : 'Eligible';
          return {
            ...s,
            status: nextStatus,
            reason: nextStatus === 'Eligible' ? 'Manually accredited by Commission Officer.' : 'Under review by Commission Secretariat.',
          };
        }
        return s;
      })
    );
  };

  // Reset a voter's vote status for testing
  const resetUserVoteStatus = (email: string) => {
    const clean = email.toLowerCase().trim();
    setUsers((prev) =>
      prev.map((u) => {
        if (u.email.toLowerCase() === clean) {
          return {
            ...u,
            hasVoted: false,
            votedAt: undefined,
            receiptCode: undefined,
          };
        }
        return u;
      })
    );

    if (currentUser && currentUser.email.toLowerCase() === clean) {
      setCurrentUser((prev: any) =>
        prev
          ? {
              ...prev,
              hasVoted: false,
              votedAt: undefined,
              receiptCode: undefined,
            }
          : null
      );
    }

    setAccreditationList((prev) =>
      prev.map((s) => {
        if (s.email.toLowerCase() === clean) {
          return { ...s, hasVoted: false };
        }
        return s;
      })
    );
  };

  // Reset votes to seed
  const resetVotesToSeed = () => {
    const seed = generateInitialVotes();
    setVotes(seed);
  };

  // Sign up action
  const signUp = (name: string, email: string, yearOfStudy: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail.endsWith('@kabarak.ac.ke')) {
      return { success: false, error: 'Use your Kabarak student email ending in @kabarak.ac.ke' };
    }

    if (!cleanName) {
      return { success: false, error: 'Full name is required' };
    }

    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return {
        success: false,
        error: 'An account with this Kabarak email already exists. Please log in directly.',
      };
    }

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const generatedPassword = `KUP-${randomDigits}`;

    const newUser: VoterUser = {
      email: cleanEmail,
      name: cleanName,
      yearOfStudy,
      password: generatedPassword,
      hasVoted: false,
    };

    const newEmail: SimulatedEmail = {
      id: `email-${Date.now()}`,
      recipientEmail: cleanEmail,
      recipientName: cleanName,
      subject: 'Your Official KUPSA Election Portal Password',
      password: generatedPassword,
      sentAt: 'Just now',
    };

    setUsers((prev) => [newUser, ...prev]);
    setSimulatedEmails((prev) => [newEmail, ...prev]);

    // Also add to accreditation list if not present
    setAccreditationList((prev) => {
      if (!prev.some((s) => s.email.toLowerCase() === cleanEmail)) {
        return [
          {
            regNo: `PHARM/2026/${Math.floor(1000 + Math.random() * 9000)}`,
            name: cleanName,
            email: cleanEmail,
            yearOfStudy,
            status: 'Eligible',
            reason: 'Registered via student auth portal.',
            hasVoted: false,
          },
          ...prev,
        ];
      }
      return prev;
    });

    return {
      success: true,
      password: generatedPassword,
      user: newUser,
    };
  };

  // Login action
  const login = (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return {
        success: false,
        error: 'No account registered with this email. Please check your address or sign up first.',
      };
    }

    if (user.password !== cleanPass) {
      return {
        success: false,
        error: 'Incorrect password. Passwords are sent to your Kabarak email address.',
      };
    }

    setCurrentUser(user);
    return {
      success: true,
      user,
    };
  };

  // Logout action
  const logout = () => {
    setCurrentUser(null);
  };

  // Cast vote action
  const castVote = async (choices: Record<string, string>): Promise<{ success: boolean; receiptCode: string; timestamp: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const fullTimeStr = `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} EAT`;
    const receiptCode = `KUPSA-2026-REC-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const newCastVote: CastVote = {
      id: `vote-${Date.now()}`,
      timestamp: timeStr,
      fullTimestamp: fullTimeStr,
      choices,
      voterYear: currentUser?.yearOfStudy || 'Year 3',
      receiptCode,
    };

    setVotes((prev) => [newCastVote, ...prev]);
    setLastCastVote(newCastVote);

    if (currentUser) {
      const updatedUser: VoterUser = {
        ...currentUser,
        hasVoted: true,
        votedAt: fullTimeStr,
        receiptCode,
      };

      setCurrentUser(updatedUser);
      setUsers((prev) => prev.map((u) => (u.email === updatedUser.email ? updatedUser : u)));

      setAccreditationList((prev) =>
        prev.map((s) => (s.email.toLowerCase() === updatedUser.email.toLowerCase() ? { ...s, hasVoted: true } : s))
      );
    }

    return {
      success: true,
      receiptCode,
      timestamp: fullTimeStr,
    };
  };

  // Simulate incoming vote for live dashboard demo
  const simulateIncomingVote = (): CastVote => {
    const years = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const fullTimeStr = `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${timeStr} EAT`;
    const randomYear = years[Math.floor(Math.random() * years.length)] ?? 'Year 3';

    const simChoices: Record<string, string> = {
      chairperson: Math.random() < 0.5 ? 'cand-01' : 'cand-02',
      'vice-chairperson': Math.random() < 0.55 ? 'cand-03' : 'cand-07',
      'sec-general': Math.random() < 0.9 ? 'cand-04' : 'abstain',
      treasurer: Math.random() < 0.9 ? 'cand-05' : 'abstain',
      'org-sec': Math.random() < 0.88 ? 'cand-06' : 'abstain',
      'academic-sec': 'abstain',
    };

    const simVote: CastVote = {
      id: `sim-vote-${Date.now()}`,
      timestamp: timeStr,
      fullTimestamp: fullTimeStr,
      choices: simChoices,
      voterYear: randomYear,
      receiptCode: `KUPSA-2026-REC-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    };

    setVotes((prev) => [simVote, ...prev]);
    setLastCastVote(simVote);
    return simVote;
  };

  const getSimulatedEmail = (email: string) => {
    return simulatedEmails.find((e) => e.recipientEmail.toLowerCase() === email.trim().toLowerCase());
  };

  const resendEmail = (email: string) => {
    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) return false;

    const updatedEmail: SimulatedEmail = {
      id: `email-${Date.now()}`,
      recipientEmail: user.email,
      recipientName: user.name,
      subject: 'Your Official KUPSA Election Portal Password (Resent)',
      password: user.password,
      sentAt: 'Just now',
    };

    setSimulatedEmails((prev) => [updatedEmail, ...prev.filter((e) => e.recipientEmail !== user.email)]);
    return true;
  };

  return (
    <VotingStoreContext.Provider
      value={{
        currentUser,
        users,
        votes,
        simulatedEmails,
        lastCastVote,
        totalRegistered,
        isResultsLive,
        setIsResultsLive,
        electionPhase,
        setElectionPhase,
        announcementBanner,
        setAnnouncementBanner,
        candidateClearances,
        updateCandidateClearance,
        accreditationList,
        toggleAccreditation,
        resetUserVoteStatus,
        signUp,
        login,
        logout,
        castVote,
        simulateIncomingVote,
        resetVotesToSeed,
        getSimulatedEmail,
        resendEmail,
      }}
    >
      {children}
    </VotingStoreContext.Provider>
  );
};

export function useVotingStore() {
  const context = useContext(VotingStoreContext);
  if (!context) {
    throw new Error('useVotingStore must be used within a VotingStoreProvider');
  }
  return context;
}
