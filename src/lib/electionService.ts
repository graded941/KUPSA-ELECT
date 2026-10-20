import { supabase, isSupabaseConfigured } from './supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface DbElectionSettings {
  id?: number;
  is_results_live: boolean;
  election_phase: 'pre-election' | 'polling-live' | 'counting' | 'results-declared';
  announcement_banner: string;
  polls_open_at?: string | null;
  polls_close_at?: string | null;
  updated_at?: string;
}

export interface DbOffice {
  id: string;
  title: string;
  short_title?: string;
  description: string;
  display_order: number;
  required?: boolean;
}

export interface DbCandidate {
  id: string;
  office_id: string;
  name: string;
  nickname?: string;
  year_of_study: string;
  photo_url?: string;
  manifesto_summary: string;
  clearance_status: 'Cleared & Certified' | 'Under Review' | 'Provisional';
  clearance_notes?: string;
  created_at?: string;
}

export interface DbVoter {
  id: string;
  reg_no: string;
  email: string;
  full_name: string;
  year_of_study: string;
  accreditation_status: 'Eligible' | 'Action Required' | 'Ineligible';
  has_voted: boolean;
  voted_at?: string | null;
  receipt_code?: string | null;
  created_at?: string;
}

export interface DbBallot {
  id: string;
  receipt_code: string;
  voter_year: string;
  choices: Record<string, string>; // office_id -> candidate_id | 'abstain'
  created_at: string;
}

export interface DbAuditLog {
  id: string;
  officer_email: string;
  officer_role: string;
  action_type: string;
  details: any;
  created_at: string;
}

export interface ElectionFullState {
  settings: DbElectionSettings | null;
  offices: DbOffice[];
  candidates: DbCandidate[];
  voters: DbVoter[];
  ballots: DbBallot[];
  auditLogs: DbAuditLog[];
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

/**
 * Fetch complete live election state from server / database
 */
export async function fetchLiveElectionState(): Promise<ElectionFullState> {
  const response = await fetch('/api/election/state');
  if (!response.ok) {
    throw new Error(`Failed to fetch election state: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Cast an anonymized secret ballot into the database
 */
export async function castSecretBallotApi(payload: {
  email: string;
  voterYear: string;
  choices: Record<string, string>;
}): Promise<{ success: boolean; receiptCode: string; timestamp: string }> {
  const response = await fetch('/api/ballot/cast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to seal ballot.');
  }
  return data;
}

/**
 * Seed official KUPSA 2026/2027 election data into Supabase
 */
export async function seedElectionDatabaseApi(): Promise<{
  success: boolean;
  message: string;
  counts: { offices: number; candidates: number; voters: number };
}> {
  const response = await fetch('/api/election/seed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ force: true }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to seed database.');
  }
  return data;
}

/**
 * Update election settings (phase, live toggle, announcement banner)
 */
export async function updateElectionSettingsApi(payload: {
  isResultsLive?: boolean;
  electionPhase?: 'pre-election' | 'polling-live' | 'counting' | 'results-declared';
  announcementBanner?: string;
  officerEmail?: string;
  officerRole?: string;
}): Promise<{ success: boolean }> {
  const response = await fetch('/api/election/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to update settings.');
  }
  return data;
}

/**
 * Update candidate vetting and clearance
 */
export async function updateCandidateClearanceApi(payload: {
  candidateId: string;
  status?: 'Cleared & Certified' | 'Under Review' | 'Provisional';
  notes?: string;
  name?: string;
  nickname?: string;
  photoUrl?: string;
  manifestoSummary?: string;
  officerEmail?: string;
  officerRole?: string;
}): Promise<{ success: boolean }> {
  const response = await fetch('/api/candidate/clearance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to update candidate record.');
  }
  return data;
}

/**
 * Toggle accreditation or reset a voter's ballot completion
 */
export async function updateVoterAccreditationApi(payload: {
  regNo?: string;
  email?: string;
  status?: 'Eligible' | 'Action Required' | 'Ineligible';
  resetVote?: boolean;
  officerEmail?: string;
  officerRole?: string;
}): Promise<{ success: boolean }> {
  const response = await fetch('/api/voter/accredit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to modify voter accreditation.');
  }
  return data;
}

/**
 * Register a new voter in Supabase
 */
export async function registerVoterApi(payload: {
  name: string;
  email: string;
  yearOfStudy: string;
}): Promise<{ success: boolean; voter: DbVoter; alreadyExists: boolean }> {
  const response = await fetch('/api/voter/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to register student voter.');
  }
  return data;
}

/**
 * Clear all ballots for Polling Day
 */
export async function resetAllBallotsApi(payload: {
  officerEmail?: string;
  officerRole?: string;
}): Promise<{ success: boolean; message: string }> {
  const response = await fetch('/api/election/reset-votes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to reset ballots.');
  }
  return data;
}

/**
 * Subscribe to Supabase Realtime channel for live ballots, turnouts, and announcements
 */
export function subscribeToElectionRealtime(callbacks: {
  onBallotInserted?: (ballot: DbBallot) => void;
  onSettingsUpdated?: (settings: DbElectionSettings) => void;
  onCandidateUpdated?: (candidate: DbCandidate) => void;
  onVoterUpdated?: (voter: DbVoter) => void;
  onStatusChange?: (status: ConnectionStatus) => void;
}): () => void {
  if (!supabase || !isSupabaseConfigured()) {
    callbacks.onStatusChange?.('disconnected');
    return () => {};
  }

  callbacks.onStatusChange?.('connecting');

  const channel: RealtimeChannel = supabase
    .channel('kupsa_election_live_channel')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'ballots' },
      (payload) => {
        if (payload.new && callbacks.onBallotInserted) {
          callbacks.onBallotInserted(payload.new as DbBallot);
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'election_settings' },
      (payload) => {
        if (payload.new && callbacks.onSettingsUpdated) {
          callbacks.onSettingsUpdated(payload.new as DbElectionSettings);
        }
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'candidates' },
      (payload) => {
        if (payload.new && callbacks.onCandidateUpdated) {
          callbacks.onCandidateUpdated(payload.new as DbCandidate);
        }
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'voters' },
      (payload) => {
        if (payload.new && callbacks.onVoterUpdated) {
          callbacks.onVoterUpdated(payload.new as DbVoter);
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        callbacks.onStatusChange?.('connected');
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        callbacks.onStatusChange?.('error');
      } else if (status === 'CLOSED') {
        callbacks.onStatusChange?.('disconnected');
      }
    });

  return () => {
    if (supabase) {
      supabase.removeChannel(channel);
    }
  };
}
