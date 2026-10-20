import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { SHARED_OFFICES, SHARED_CANDIDATES } from '../data/candidateData';
import {
  fetchLiveElectionState,
  castSecretBallotApi,
  seedElectionDatabaseApi,
  updateElectionSettingsApi,
  updateCandidateClearanceApi,
  updateVoterAccreditationApi,
  registerVoterApi,
  resetAllBallotsApi,
  subscribeToElectionRealtime,
  DbOffice,
  DbCandidate,
  DbVoter,
  DbBallot,
  ConnectionStatus,
} from '../lib/electionService';

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

  // Supabase Database Status
  isLoadingDb: boolean;
  dbError: string | null;
  isRealtimeConnected: boolean;
  lastSyncTime: string | null;
  refreshDbState: () => Promise<void>;
  seedOfficialRoster: () => Promise<{ success: boolean; message: string }>;
  resetAllBallots: () => Promise<void>;

  // Dynamic DB entities
  dbOffices: DbOffice[];
  dbCandidates: DbCandidate[];

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
  updateCandidateClearance: (
    candidateId: string,
    status: 'Cleared & Certified' | 'Under Review' | 'Provisional',
    notes: string,
    extra?: {
      name?: string;
      photoUrl?: string;
      manifestoSummary?: string;
    }
  ) => void;

  // Voter Roll & Accreditation Management
  accreditationList: StudentAccreditationRecord[];
  toggleAccreditation: (regNo: string) => void;
  resetUserVoteStatus: (email: string) => void;

  // Auth actions
  signUp: (name: string, email: string, yearOfStudy: string) => Promise<{ success: boolean; error?: string; password?: string; user?: VoterUser }>;
  login: (email: string, password: string) => { success: boolean; error?: string; user?: VoterUser };
  logout: () => void;
  castVote: (choices: Record<string, string>) => Promise<{ success: boolean; receiptCode: string; timestamp: string }>;
  simulateIncomingVote: () => CastVote;
  resetVotesToSeed: () => void;
  getSimulatedEmail: (email: string) => SimulatedEmail | undefined;
  resendEmail: (email: string) => boolean;
}

const USERS_STORAGE_KEY = 'kupsa_voters_v5';
const SESSION_STORAGE_KEY = 'kupsa_session_v5';
const EMAILS_STORAGE_KEY = 'kupsa_emails_v5';

const VotingStoreContext = createContext<VotingStoreContextType | null>(null);

export const VotingStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // DB Connection & Status States
  const [isLoadingDb, setIsLoadingDb] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Entities synced with Supabase
  const [dbOffices, setDbOffices] = useState<DbOffice[]>([]);
  const [dbCandidates, setDbCandidates] = useState<DbCandidate[]>([]);
  const [votes, setVotes] = useState<CastVote[]>([]);
  const [lastCastVote, setLastCastVote] = useState<CastVote | null>(null);

  // Settings
  const [isResultsLive, setIsResultsLiveState] = useState<boolean>(true);
  const [electionPhase, setElectionPhaseState] = useState<'pre-election' | 'polling-live' | 'counting' | 'results-declared'>('polling-live');
  const [announcementBanner, setAnnouncementBannerState] = useState<string>(
    'Official Notice: General Polling in session under Chapter Six statutory authority.'
  );

  // Clearances & Accreditation lists
  const [candidateClearances, setCandidateClearances] = useState<Record<string, CandidateClearanceRecord>>({});
  const [accreditationList, setAccreditationList] = useState<StudentAccreditationRecord[]>([]);

  // Local/Session Users
  const [users, setUsers] = useState<VoterUser[]>(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
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
        hasVoted: false,
      },
    ];
  });

  const [currentUser, setCurrentUser] = useState<VoterUser | null>(() => {
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

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

  // Convert DbBallot to internal CastVote
  const formatDbBallot = useCallback((b: DbBallot): CastVote => {
    const d = b.created_at ? new Date(b.created_at) : new Date();
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const fullTimeStr = `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ${timeStr} EAT`;

    return {
      id: b.id || `ballot-${b.receipt_code}`,
      timestamp: timeStr,
      fullTimestamp: fullTimeStr,
      choices: b.choices || {},
      voterYear: b.voter_year || 'Year 3',
      receiptCode: b.receipt_code,
    };
  }, []);

  // Fetch full state from Supabase
  const refreshDbState = useCallback(async () => {
    setIsLoadingDb(true);
    setDbError(null);
    try {
      const state = await fetchLiveElectionState();

      // 1. Settings
      if (state.settings) {
        setIsResultsLiveState(state.settings.is_results_live ?? true);
        if (state.settings.election_phase) {
          setElectionPhaseState(state.settings.election_phase);
        }
        if (state.settings.announcement_banner) {
          setAnnouncementBannerState(state.settings.announcement_banner);
        }
      }

      // 2. Offices
      setDbOffices(state.offices || []);

      // 3. Candidates & Clearances
      setDbCandidates(state.candidates || []);
      const clearanceMap: Record<string, CandidateClearanceRecord> = {};
      (state.candidates || []).forEach((c) => {
        clearanceMap[c.id] = {
          status: c.clearance_status || 'Cleared & Certified',
          notes: c.clearance_notes || 'Nomination cleared under Chapter Six rules.',
          updatedAt: c.created_at ? new Date(c.created_at).toLocaleTimeString() : 'Certified',
        };
      });
      setCandidateClearances(clearanceMap);

      // 4. Voters & Accreditation
      if (state.voters && state.voters.length > 0) {
        const accList: StudentAccreditationRecord[] = state.voters.map((v) => ({
          regNo: v.reg_no,
          name: v.full_name,
          email: v.email,
          yearOfStudy: v.year_of_study,
          status: v.accreditation_status || 'Eligible',
          reason: v.accreditation_status === 'Eligible' ? 'Accredited by Commission Secretariat.' : 'Under review.',
          hasVoted: Boolean(v.has_voted),
        }));
        setAccreditationList(accList);

        // Sync currentUser hasVoted status if logged in
        if (currentUser) {
          const matched = state.voters.find((v) => v.email.toLowerCase() === currentUser.email.toLowerCase());
          if (matched && matched.has_voted !== currentUser.hasVoted) {
            setCurrentUser((prev) =>
              prev
                ? {
                    ...prev,
                    hasVoted: Boolean(matched.has_voted),
                    receiptCode: matched.receipt_code || prev.receiptCode,
                    votedAt: matched.voted_at || prev.votedAt,
                  }
                : null
            );
          }
        }
      }

      // 5. Ballots
      if (state.ballots) {
        const formattedVotes = state.ballots.map(formatDbBallot);
        setVotes(formattedVotes);
      }

      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err: any) {
      console.warn('Database fetch warning (strict DB mode):', err);
      setDbError(err.message || 'Unable to connect to Supabase database.');
    } finally {
      setIsLoadingDb(false);
    }
  }, [currentUser, formatDbBallot]);

  // Initial load
  useEffect(() => {
    refreshDbState();
  }, [refreshDbState]);

  // Supabase Realtime Subscription
  useEffect(() => {
    const unsubscribe = subscribeToElectionRealtime({
      onBallotInserted: (newBallot) => {
        const formatted = formatDbBallot(newBallot);
        setVotes((prev) => {
          if (prev.some((v) => v.receiptCode === formatted.receiptCode)) return prev;
          return [formatted, ...prev];
        });
        setLastCastVote(formatted);
      },
      onSettingsUpdated: (updatedSettings) => {
        if (typeof updatedSettings.is_results_live === 'boolean') {
          setIsResultsLiveState(updatedSettings.is_results_live);
        }
        if (updatedSettings.election_phase) {
          setElectionPhaseState(updatedSettings.election_phase);
        }
        if (updatedSettings.announcement_banner) {
          setAnnouncementBannerState(updatedSettings.announcement_banner);
        }
      },
      onCandidateUpdated: (updatedCandidate) => {
        setDbCandidates((prev) =>
          prev.map((c) => (c.id === updatedCandidate.id ? { ...c, ...updatedCandidate } : c))
        );
        if (updatedCandidate.clearance_status) {
          setCandidateClearances((prev) => ({
            ...prev,
            [updatedCandidate.id]: {
              status: updatedCandidate.clearance_status,
              notes: updatedCandidate.clearance_notes || prev[updatedCandidate.id]?.notes || '',
              updatedAt: 'Just now',
            },
          }));
        }
      },
      onVoterUpdated: (updatedVoter) => {
        setAccreditationList((prev) =>
          prev.map((v) =>
            v.email.toLowerCase() === updatedVoter.email.toLowerCase()
              ? {
                  ...v,
                  status: updatedVoter.accreditation_status || v.status,
                  hasVoted: Boolean(updatedVoter.has_voted),
                }
              : v
          )
        );

        if (currentUser && currentUser.email.toLowerCase() === updatedVoter.email.toLowerCase()) {
          setCurrentUser((prev) =>
            prev
              ? {
                  ...prev,
                  hasVoted: Boolean(updatedVoter.has_voted),
                  receiptCode: updatedVoter.receipt_code || prev.receiptCode,
                  votedAt: updatedVoter.voted_at || prev.votedAt,
                }
              : null
          );
        }
      },
      onStatusChange: (status: ConnectionStatus) => {
        setIsRealtimeConnected(status === 'connected');
      },
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser, formatDbBallot]);

  // Persist session & user list
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
      localStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(simulatedEmails));
    } catch (e) {
      console.error(e);
    }
  }, [simulatedEmails]);

  // Seed database action for commissioners
  const seedOfficialRoster = async () => {
    setIsLoadingDb(true);
    try {
      const result = await seedElectionDatabaseApi();
      await refreshDbState();
      return result;
    } finally {
      setIsLoadingDb(false);
    }
  };

  // Reset all ballots action
  const resetAllBallots = async () => {
    setIsLoadingDb(true);
    try {
      await resetAllBallotsApi({});
      setVotes([]);
      setLastCastVote(null);
      if (currentUser) {
        setCurrentUser((prev) => (prev ? { ...prev, hasVoted: false, receiptCode: undefined, votedAt: undefined } : null));
      }
      setAccreditationList((prev) => prev.map((s) => ({ ...s, hasVoted: false })));
    } finally {
      setIsLoadingDb(false);
    }
  };

  // Setter wrapper for Results Live (syncs to Supabase)
  const setIsResultsLive = (val: boolean) => {
    setIsResultsLiveState(val);
    updateElectionSettingsApi({ isResultsLive: val }).catch(console.error);
  };

  // Setter wrapper for Election Phase (syncs to Supabase)
  const setElectionPhase = (phase: 'pre-election' | 'polling-live' | 'counting' | 'results-declared') => {
    setElectionPhaseState(phase);
    updateElectionSettingsApi({ electionPhase: phase }).catch(console.error);
  };

  // Setter wrapper for Announcement Banner (syncs to Supabase)
  const setAnnouncementBanner = (text: string) => {
    setAnnouncementBannerState(text);
    updateElectionSettingsApi({ announcementBanner: text }).catch(console.error);
  };

  // Candidate clearance & profile update (syncs to Supabase)
  const updateCandidateClearance = (
    candidateId: string,
    status: 'Cleared & Certified' | 'Under Review' | 'Provisional',
    notes: string,
    extra?: {
      name?: string;
      photoUrl?: string;
      manifestoSummary?: string;
    }
  ) => {
    setCandidateClearances((prev) => ({
      ...prev,
      [candidateId]: {
        status,
        notes,
        updatedAt: 'Just now',
      },
    }));

    if (extra) {
      setDbCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId
            ? {
                ...c,
                clearance_status: status,
                clearance_notes: notes,
                name: extra.name || c.name,
                photo_url: extra.photoUrl !== undefined ? extra.photoUrl : c.photo_url,
                manifesto_summary: extra.manifestoSummary || c.manifesto_summary,
              }
            : c
        )
      );
    }

    updateCandidateClearanceApi({
      candidateId,
      status,
      notes,
      name: extra?.name,
      photoUrl: extra?.photoUrl,
      manifestoSummary: extra?.manifestoSummary,
    }).catch(console.error);
  };

  // Toggle accreditation (syncs to Supabase)
  const toggleAccreditation = (regNo: string) => {
    const student = accreditationList.find((s) => s.regNo === regNo);
    const nextStatus = student?.status === 'Eligible' ? 'Action Required' : 'Eligible';

    setAccreditationList((prev) =>
      prev.map((s) => (s.regNo === regNo ? { ...s, status: nextStatus } : s))
    );

    updateVoterAccreditationApi({
      regNo,
      status: nextStatus,
    }).catch(console.error);
  };

  // Reset user vote status (syncs to Supabase)
  const resetUserVoteStatus = (email: string) => {
    const clean = email.toLowerCase().trim();
    setUsers((prev) =>
      prev.map((u) => (u.email.toLowerCase() === clean ? { ...u, hasVoted: false, votedAt: undefined, receiptCode: undefined } : u))
    );

    if (currentUser && currentUser.email.toLowerCase() === clean) {
      setCurrentUser((prev) => (prev ? { ...prev, hasVoted: false, votedAt: undefined, receiptCode: undefined } : null));
    }

    setAccreditationList((prev) =>
      prev.map((s) => (s.email.toLowerCase() === clean ? { ...s, hasVoted: false } : s))
    );

    updateVoterAccreditationApi({
      email: clean,
      resetVote: true,
    }).catch(console.error);
  };

  // Sign up
  const signUp = async (name: string, email: string, yearOfStudy: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail.endsWith('@kabarak.ac.ke')) {
      return { success: false, error: 'Use your Kabarak student email ending in @kabarak.ac.ke' };
    }

    if (!cleanName) {
      return { success: false, error: 'Full name is required' };
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

    setUsers((prev) => [newUser, ...prev.filter((u) => u.email.toLowerCase() !== cleanEmail)]);
    setSimulatedEmails((prev) => [newEmail, ...prev]);

    // Register in Supabase database
    try {
      await registerVoterApi({
        name: cleanName,
        email: cleanEmail,
        yearOfStudy,
      });
      // Refresh voter roll
      refreshDbState();
    } catch (e) {
      console.warn('DB registration notice:', e);
    }

    return {
      success: true,
      password: generatedPassword,
      user: newUser,
    };
  };

  // Login
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

  // Logout
  const logout = () => {
    setCurrentUser(null);
  };

  // Cast Anonymized Secret Ballot (Constitutional dual-write into Supabase)
  const castVote = async (choices: Record<string, string>): Promise<{ success: boolean; receiptCode: string; timestamp: string }> => {
    if (!currentUser) {
      throw new Error('Voter authentication session required.');
    }

    // Call server to write anonymized ballot into DB and mark voter completed
    const result = await castSecretBallotApi({
      email: currentUser.email,
      voterYear: currentUser.yearOfStudy || 'Year 3',
      choices,
    });

    const updatedUser: VoterUser = {
      ...currentUser,
      hasVoted: true,
      votedAt: result.timestamp,
      receiptCode: result.receiptCode,
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.email.toLowerCase() === updatedUser.email.toLowerCase() ? updatedUser : u)));

    setAccreditationList((prev) =>
      prev.map((s) => (s.email.toLowerCase() === updatedUser.email.toLowerCase() ? { ...s, hasVoted: true } : s))
    );

    // Refresh state to ensure clean sync
    refreshDbState();

    return result;
  };

  // Simulate incoming vote for live dashboard demo / rehearsal
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

    const simReceipt = `KUPSA-2026-REC-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Also push to DB if possible
    castSecretBallotApi({
      email: `simulated.student.${Date.now()}@kabarak.ac.ke`,
      voterYear: randomYear,
      choices: simChoices,
    }).catch(console.warn);

    const simVote: CastVote = {
      id: `sim-vote-${Date.now()}`,
      timestamp: timeStr,
      fullTimestamp: fullTimeStr,
      choices: simChoices,
      voterYear: randomYear,
      receiptCode: simReceipt,
    };

    setVotes((prev) => [simVote, ...prev]);
    setLastCastVote(simVote);
    return simVote;
  };

  // Legacy reset votes for testing
  const resetVotesToSeed = () => {
    resetAllBallots();
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

  const totalRegistered = useMemo(() => {
    return Math.max(accreditationList.length, 384);
  }, [accreditationList]);

  return (
    <VotingStoreContext.Provider
      value={{
        currentUser,
        users,
        votes,
        simulatedEmails,
        lastCastVote,
        totalRegistered,
        isLoadingDb,
        dbError,
        isRealtimeConnected,
        lastSyncTime,
        refreshDbState,
        seedOfficialRoster,
        resetAllBallots,
        dbOffices,
        dbCandidates,
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
