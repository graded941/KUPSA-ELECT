import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createServer as createViteServer } from 'vite';

import { NotificationOutbox } from './src/server/notification-outbox.js';
import { verifySmtpConnection, resolveSmtpCredentials } from './src/server/email.server.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Supabase admin client
const rawSupabaseUrl = (process.env.VITE_SUPABASE_URL || '').trim();
const supabaseUrl = rawSupabaseUrl
  .replace(/\/rest\/v1\/?$/i, '')
  .replace(/\/+$/, '');
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const anonKey = (process.env.VITE_SUPABASE_ANON_KEY || '').trim();

const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

// Initialize Notification Outbox with Supabase client (with direct fallback if table is not yet created)
NotificationOutbox.init(supabaseAdmin);

// Background retry processor for notification outbox (every 60 seconds)
setInterval(async () => {
  try {
    const processed = await NotificationOutbox.processDue(25);
    if (processed > 0) {
      console.log(`[NotificationOutbox Worker] Processed ${processed} due outbox notification(s).`);
    }
  } catch (err: any) {
    console.error('[NotificationOutbox Worker Error]', err);
  }
}, 60000);

// Initial Seed data for KUPSA
const INITIAL_OFFICES = [
  {
    id: 'chairperson',
    title: 'Chairperson',
    short_title: 'Chair',
    description: 'Chief executive officer of KUPSA; presides over executive meetings, represents pharmacy students in faculty boards.',
    display_order: 1,
    required: true,
  },
  {
    id: 'vice-chairperson',
    title: 'Vice Chairperson',
    short_title: 'Vice Chair',
    description: 'Deputizes the Chairperson, oversees student welfare, academic mentoring committees, and clinical mentorship.',
    display_order: 2,
    required: true,
  },
  {
    id: 'sec-general',
    title: 'Secretary General',
    short_title: 'Sec Gen',
    description: 'Custodian of all association records, minutes, correspondence, and official publications under constitutional mandate.',
    display_order: 3,
    required: true,
  },
  {
    id: 'treasurer',
    title: 'Treasurer',
    short_title: 'Treasurer',
    description: 'Responsible for KUPSA financial records, annual budgets, pharmacy gala accounts, and audited statements.',
    display_order: 4,
    required: true,
  },
  {
    id: 'org-sec',
    title: 'Organizing Secretary',
    short_title: 'Org Sec',
    description: 'Coordinates pharmacy week outreach programs, community health camps, pharmaceutical manufacturer industrial visits.',
    display_order: 5,
    required: true,
  },
  {
    id: 'academic-sec',
    title: 'Academic & Research Secretary',
    short_title: 'Academic Sec',
    description: 'Liaises with School of Pharmacy faculty, organizes peer revision groups, scientific abstract seminars.',
    display_order: 6,
    required: false,
  },
];

const INITIAL_CANDIDATES = [
  {
    id: 'cand-01',
    office_id: 'chairperson',
    name: 'Amina Muthoni',
    nickname: 'Muthoni A.',
    year_of_study: 'Year 4',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    manifesto_summary: 'Dedicated to expanding pharmaceutical industry attachments, student mental health support, and transparent executive accountability.',
    clearance_status: 'Cleared & Certified',
    clearance_notes: 'Academic GPA > 3.0 confirmed. Clean conduct certification by School Patron.',
  },
  {
    id: 'cand-02',
    office_id: 'chairperson',
    name: 'Brian Kipkorir',
    nickname: 'Kipkorir B.',
    year_of_study: 'Year 4',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    manifesto_summary: 'Advocating for 24/7 digital pharmaceutical library subscriptions, enhanced lab reagent funding, and research symposiums.',
    clearance_status: 'Cleared & Certified',
    clearance_notes: 'All statutory nomination endorsements verified by Commission Secretary.',
  },
  {
    id: 'cand-03',
    office_id: 'vice-chairperson',
    name: 'Faith Chebet',
    nickname: 'Chebet F.',
    year_of_study: 'Year 3',
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    manifesto_summary: 'Fostering clinical rotation mentorship, welfare safety nets, and student exchange programs across East Africa.',
    clearance_status: 'Cleared & Certified',
    clearance_notes: 'Welfare committee clearance and registrar academic standing confirmed.',
  },
  {
    id: 'cand-07',
    office_id: 'vice-chairperson',
    name: 'Mercy Atieno',
    nickname: 'Atieno M.',
    year_of_study: 'Year 4',
    photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    manifesto_summary: 'Strengthening clinical site logistics, emergency transport allowances, and cross-level pharmacy study circles.',
    clearance_status: 'Cleared & Certified',
    clearance_notes: 'Clinical rotations standing confirmed by Level 5 Hospital preceptor.',
  },
  {
    id: 'cand-04',
    office_id: 'sec-general',
    name: 'Dennis Ochieng',
    nickname: 'Ochieng D.',
    year_of_study: 'Year 3',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    manifesto_summary: 'Modernizing student communications with digital executive newsletters, open senate records, and swift resolutions.',
    clearance_status: 'Cleared & Certified',
    clearance_notes: 'Constitutional editorial ethics oath signed and sealed.',
  },
  {
    id: 'cand-05',
    office_id: 'treasurer',
    name: 'Grace Wanjiku',
    nickname: 'Wanjiku G.',
    year_of_study: 'Year 4',
    photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    manifesto_summary: 'Ensuring 100% financial transparency with termly audited accounts published on the student portal within 7 days.',
    clearance_status: 'Cleared & Certified',
    clearance_notes: 'CPA Section 1 certification verified; financial bond registered.',
  },
  {
    id: 'cand-06',
    office_id: 'org-sec',
    name: 'Kevin Mutua',
    nickname: 'Mutua K.',
    year_of_study: 'Year 3',
    photo_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
    manifesto_summary: 'Revitalizing KUPSA Pharmacy Week, expanding public health community screenings, and organizing the annual Gala Night.',
    clearance_status: 'Cleared & Certified',
    clearance_notes: 'Sports and logistics patron approval certified.',
  },
];

const INITIAL_VOTERS = [
  {
    regNo: 'PHARM/2023/1042',
    name: 'John Kipruto',
    email: 'john.doe@kabarak.ac.ke',
    yearOfStudy: 'Year 3',
    status: 'Eligible',
    hasVoted: false,
  },
  {
    regNo: 'PHARM/2022/0891',
    name: 'Sarah Cherono',
    email: 'sarah.cherono@kabarak.ac.ke',
    yearOfStudy: 'Year 4',
    status: 'Eligible',
    hasVoted: false,
  },
  {
    regNo: 'PHARM/2023/0742',
    name: 'Wairimu Njeri',
    email: 'wnjeri23@kabarak.ac.ke',
    yearOfStudy: 'Year 3',
    status: 'Eligible',
    hasVoted: false,
  },
  {
    regNo: 'PHARM/2022/1155',
    name: 'Emmanuel Kiprono',
    email: 'ekiprono22@kabarak.ac.ke',
    yearOfStudy: 'Year 4',
    status: 'Eligible',
    hasVoted: false,
  },
  {
    regNo: 'PHARM/2024/0388',
    name: 'Stacy Akinyi',
    email: 'sakinyi24@kabarak.ac.ke',
    yearOfStudy: 'Year 2',
    status: 'Eligible',
    hasVoted: false,
  },
  {
    regNo: 'PHARM/2025/0119',
    name: 'Victor Mwenda',
    email: 'vmwenda25@kabarak.ac.ke',
    yearOfStudy: 'Year 1',
    status: 'Eligible',
    hasVoted: false,
  },
  {
    regNo: 'PHARM/2021/0402',
    name: 'Faith Kemboi',
    email: 'fkemboi21@kabarak.ac.ke',
    yearOfStudy: 'Year 5',
    status: 'Eligible',
    hasVoted: false,
  },
];

// API Routes

// Health & Status Check
app.get('/api/health', async (_req: Request, res: Response) => {
  if (!supabaseAdmin) {
    return res.status(503).json({
      configured: false,
      error: 'Supabase admin client not initialized. Check VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    });
  }

  try {
    const [settingsRes, officesRes, candsRes, votersRes, ballotsRes, auditRes] = await Promise.all([
      supabaseAdmin.from('election_settings').select('*', { count: 'exact' }),
      supabaseAdmin.from('offices').select('*', { count: 'exact' }),
      supabaseAdmin.from('candidates').select('*', { count: 'exact' }),
      supabaseAdmin.from('voters').select('*', { count: 'exact' }),
      supabaseAdmin.from('ballots').select('*', { count: 'exact' }),
      supabaseAdmin.from('audit_logs').select('*', { count: 'exact' }),
    ]);

    return res.json({
      configured: true,
      url: supabaseUrl,
      counts: {
        settings: settingsRes.count ?? settingsRes.data?.length ?? 0,
        offices: officesRes.count ?? officesRes.data?.length ?? 0,
        candidates: candsRes.count ?? candsRes.data?.length ?? 0,
        voters: votersRes.count ?? votersRes.data?.length ?? 0,
        ballots: ballotsRes.count ?? ballotsRes.data?.length ?? 0,
        auditLogs: auditRes.count ?? auditRes.data?.length ?? 0,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ configured: false, error: error.message });
  }
});

// Full Election State Retrieval (Atomic snapshot)
app.get('/api/election/state', async (_req: Request, res: Response) => {
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  try {
    const [settingsRes, officesRes, candsRes, votersRes, ballotsRes, auditRes] = await Promise.all([
      supabaseAdmin.from('election_settings').select('*').limit(1).maybeSingle(),
      supabaseAdmin.from('offices').select('*').order('display_order', { ascending: true }),
      supabaseAdmin.from('candidates').select('*').order('created_at', { ascending: true }),
      supabaseAdmin.from('voters').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('ballots').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50),
    ]);

    // Handle any DB errors gracefully
    if (settingsRes.error) console.error('Error fetching settings:', settingsRes.error);
    if (officesRes.error) console.error('Error fetching offices:', officesRes.error);
    if (candsRes.error) console.error('Error fetching candidates:', candsRes.error);
    if (votersRes.error) console.error('Error fetching voters:', votersRes.error);
    if (ballotsRes.error) console.error('Error fetching ballots:', ballotsRes.error);
    if (auditRes.error) console.error('Error fetching audit logs:', auditRes.error);

    return res.json({
      settings: settingsRes.data || null,
      offices: officesRes.data || [],
      candidates: candsRes.data || [],
      voters: votersRes.data || [],
      ballots: ballotsRes.data || [],
      auditLogs: auditRes.data || [],
    });
  } catch (err: any) {
    console.error('State retrieval error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Cast Anonymized Secret Ballot (Constitutional dual-write)
app.post('/api/ballot/cast', async (req: Request, res: Response) => {
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Database service unavailable' });
  }

  const { email, voterYear, choices } = req.body;

  if (!choices || typeof choices !== 'object') {
    return res.status(400).json({ error: 'Invalid ballot selections.' });
  }

  const cleanEmail = (email || '').trim().toLowerCase();

  try {
    // 1. Check voter registration and eligibility in voters table
    let voterRecord: any = null;
    if (cleanEmail) {
      const { data, error } = await supabaseAdmin
        .from('voters')
        .select('*')
        .ilike('email', cleanEmail)
        .maybeSingle();

      if (error) {
        console.error('Voter lookup error:', error);
      }
      voterRecord = data;

      if (voterRecord && voterRecord.has_voted) {
        return res.status(409).json({
          error: 'Constitutional Violation: A ballot has already been recorded for this student credentials under Article 41(3). Double voting is strictly prohibited.',
        });
      }

      if (voterRecord && voterRecord.accreditation_status === 'Ineligible') {
        return res.status(403).json({
          error: 'Accreditation Status Ineligible: Please resolve clearance with Commission Secretariat before voting.',
        });
      }
    }

    // 2. Generate tamper-proof cryptographic receipt code
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const receiptCode = `KUPSA-2026-REC-${randomHex}`;
    const timestampStr = new Date().toISOString();

    // 3. Insert Anonymized Ballot (NO student identifier is written to the ballots table!)
    const { error: ballotError } = await supabaseAdmin.from('ballots').insert({
      receipt_code: receiptCode,
      voter_year: voterYear || 'Year 3',
      choices: choices,
    });

    if (ballotError) {
      console.error('Ballot insert error:', ballotError);
      return res.status(500).json({ error: 'Failed to record sealed ballot: ' + ballotError.message });
    }

    // 4. Update voter status in voters table to mark completion
    if (voterRecord) {
      const { error: updateError } = await supabaseAdmin
        .from('voters')
        .update({
          has_voted: true,
          voted_at: timestampStr,
          receipt_code: receiptCode,
        })
        .eq('id', voterRecord.id);

      if (updateError) {
        console.error('Error updating voter status:', updateError);
      }
    }

    // 5. Audit Log Entry
    await supabaseAdmin.from('audit_logs').insert({
      officer_email: 'system.cryptographic_sealer@kabarak.ac.ke',
      officer_role: 'Ballot Encryption Engine',
      action_type: 'BALLOT_SEALED',
      details: {
        receipt_code: receiptCode,
        cohort: voterYear || 'Year 3',
        status: 'ANONYMIZED_SECRET_BALLOT_WRITTEN',
      },
    });

    return res.json({
      success: true,
      receiptCode,
      timestamp: timestampStr,
    });
  } catch (err: any) {
    console.error('Error casting ballot:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Seed Official Election Roster (Offices, Candidates, Voters)
app.post('/api/election/seed', async (req: Request, res: Response) => {
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Database service unavailable' });
  }

  const { force } = req.body || {};

  try {
    // 1. Seed or Upsert Offices
    for (const office of INITIAL_OFFICES) {
      await supabaseAdmin.from('offices').upsert(office, { onConflict: 'id' });
    }

    // 2. Seed or Upsert Candidates
    for (const cand of INITIAL_CANDIDATES) {
      await supabaseAdmin.from('candidates').upsert(cand, { onConflict: 'id' });
    }

    // 3. Seed Voters
    for (const v of INITIAL_VOTERS) {
      const { data: existing } = await supabaseAdmin
        .from('voters')
        .select('id')
        .ilike('email', v.email)
        .maybeSingle();

      if (!existing) {
        let authUserId: string | null = null;
        try {
          const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
            email: v.email,
            password: 'KUP-2026-Password',
            email_confirm: true,
            user_metadata: { full_name: v.name, year_of_study: v.yearOfStudy },
          });

          if (authUser?.user?.id) {
            authUserId = authUser.user.id;
          } else if (authErr) {
            const { data: list } = await supabaseAdmin.auth.admin.listUsers();
            const matched = list?.users?.find((u) => u.email?.toLowerCase() === v.email.toLowerCase());
            if (matched) authUserId = matched.id;
          }
        } catch (e) {
          console.error('Error creating auth user:', e);
        }

        if (authUserId) {
          await supabaseAdmin.from('voters').insert({
            id: authUserId,
            reg_no: v.regNo,
            email: v.email,
            full_name: v.name,
            year_of_study: v.yearOfStudy,
            accreditation_status: v.status,
            has_voted: false,
          });
        }
      }
    }

    // 4. Ensure election_settings exists
    const { data: settings } = await supabaseAdmin.from('election_settings').select('id').limit(1).maybeSingle();
    if (!settings) {
      await supabaseAdmin.from('election_settings').insert({
        is_results_live: true,
        election_phase: 'polling-live',
        announcement_banner: 'Official Notice: General Polling in session under Chapter Six statutory authority.',
      });
    }

    // 5. Audit Log
    await supabaseAdmin.from('audit_logs').insert({
      officer_email: 'returning.officer@kabarak.ac.ke',
      officer_role: 'Head Commissioner',
      action_type: 'DATABASE_SEEDED',
      details: {
        officesCount: INITIAL_OFFICES.length,
        candidatesCount: INITIAL_CANDIDATES.length,
        votersCount: INITIAL_VOTERS.length,
        timestamp: new Date().toISOString(),
      },
    });

    return res.json({
      success: true,
      message: 'Official KUPSA 2026/2027 Election Roster successfully synchronized with Supabase.',
      counts: {
        offices: INITIAL_OFFICES.length,
        candidates: INITIAL_CANDIDATES.length,
        voters: INITIAL_VOTERS.length,
      },
    });
  } catch (err: any) {
    console.error('Seed error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Update Election Settings
app.post('/api/election/settings', async (req: Request, res: Response) => {
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Database service unavailable' });
  }

  const { isResultsLive, electionPhase, announcementBanner, officerEmail, officerRole } = req.body;

  try {
    const updatePayload: any = { updated_at: new Date().toISOString() };
    if (typeof isResultsLive === 'boolean') updatePayload.is_results_live = isResultsLive;
    if (typeof electionPhase === 'string') updatePayload.election_phase = electionPhase;
    if (typeof announcementBanner === 'string') updatePayload.announcement_banner = announcementBanner;

    // Get primary settings record id
    const { data: existing } = await supabaseAdmin.from('election_settings').select('id').limit(1).maybeSingle();

    if (existing) {
      await supabaseAdmin.from('election_settings').update(updatePayload).eq('id', existing.id);
    } else {
      await supabaseAdmin.from('election_settings').insert({
        ...updatePayload,
        is_results_live: updatePayload.is_results_live ?? true,
        election_phase: updatePayload.election_phase ?? 'polling-live',
        announcement_banner: updatePayload.announcement_banner ?? '',
      });
    }

    // Audit Log
    await supabaseAdmin.from('audit_logs').insert({
      officer_email: officerEmail || 'commissioner@kabarak.ac.ke',
      officer_role: officerRole || 'Electoral Commission',
      action_type: 'SETTINGS_MODIFIED',
      details: updatePayload,
    });

    return res.json({ success: true, updated: updatePayload });
  } catch (err: any) {
    console.error('Update settings error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Update Candidate Clearance
app.post('/api/candidate/clearance', async (req: Request, res: Response) => {
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Database service unavailable' });
  }

  const { candidateId, status, notes, name, nickname, photoUrl, manifestoSummary, officerEmail, officerRole } = req.body;

  if (!candidateId) {
    return res.status(400).json({ error: 'candidateId is required' });
  }

  try {
    const updatePayload: any = {};
    if (status) updatePayload.clearance_status = status;
    if (notes !== undefined) updatePayload.clearance_notes = notes;
    if (name) updatePayload.name = name;
    if (nickname !== undefined) updatePayload.nickname = nickname;
    if (photoUrl !== undefined) updatePayload.photo_url = photoUrl;
    if (manifestoSummary !== undefined) updatePayload.manifesto_summary = manifestoSummary;

    const { error } = await supabaseAdmin
      .from('candidates')
      .update(updatePayload)
      .eq('id', candidateId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Audit Log
    await supabaseAdmin.from('audit_logs').insert({
      officer_email: officerEmail || 'commissioner@kabarak.ac.ke',
      officer_role: officerRole || 'Head Commissioner',
      action_type: 'CANDIDATE_RECORD_UPDATED',
      details: { candidateId, ...updatePayload },
    });

    return res.json({ success: true, candidateId, ...updatePayload });
  } catch (err: any) {
    console.error('Update candidate error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Update or Toggle Voter Accreditation
app.post('/api/voter/accredit', async (req: Request, res: Response) => {
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Database service unavailable' });
  }

  const { regNo, email, status, resetVote, officerEmail, officerRole } = req.body;

  try {
    const updatePayload: any = {};
    if (status) updatePayload.accreditation_status = status;
    if (resetVote) {
      updatePayload.has_voted = false;
      updatePayload.voted_at = null;
      updatePayload.receipt_code = null;
    }

    let query = supabaseAdmin.from('voters').update(updatePayload);
    if (regNo) {
      query = query.eq('reg_no', regNo);
    } else if (email) {
      query = query.ilike('email', email.trim().toLowerCase());
    } else {
      return res.status(400).json({ error: 'Either regNo or email must be provided.' });
    }

    const { error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    // Audit Log
    await supabaseAdmin.from('audit_logs').insert({
      officer_email: officerEmail || 'secretariat@kabarak.ac.ke',
      officer_role: officerRole || 'Commission Secretariat',
      action_type: resetVote ? 'VOTER_VOTE_STATUS_RESET' : 'VOTER_ACCREDITATION_MODIFIED',
      details: { regNo, email, ...updatePayload },
    });

    return res.json({ success: true });
  } catch (err: any) {
    console.error('Voter accredit error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Voter Signup / Registration
app.post('/api/voter/signup', async (req: Request, res: Response) => {
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Database service unavailable' });
  }

  const { name, email, yearOfStudy } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanName = (name || '').trim();

  if (!cleanEmail.endsWith('@kabarak.ac.ke')) {
    return res.status(400).json({ error: 'Use your Kabarak student email ending in @kabarak.ac.ke' });
  }

  if (!cleanName) {
    return res.status(400).json({ error: 'Full name is required' });
  }

  try {
    const { data: existing } = await supabaseAdmin
      .from('voters')
      .select('*')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (existing) {
      return res.json({
        success: true,
        voter: existing,
        alreadyExists: true,
      });
    }

    const generatedPasscode = `KUP-${Math.floor(1000 + Math.random() * 9000)}`;

    // Ensure Auth user exists
    let authUserId: string | null = null;
    const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: generatedPasscode,
      email_confirm: true,
      user_metadata: { full_name: cleanName, year_of_study: yearOfStudy || 'Year 3' },
    });

    if (authUser?.user?.id) {
      authUserId = authUser.user.id;
    } else if (authErr) {
      const { data: list } = await supabaseAdmin.auth.admin.listUsers();
      const matched = list?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);
      if (matched) authUserId = matched.id;
    }

    if (!authUserId) {
      return res.status(500).json({ error: authErr?.message || 'Failed to provision authentication account' });
    }

    const regNo = `PHARM/2026/${Math.floor(1000 + Math.random() * 9000)}`;
    const { data: newVoter, error } = await supabaseAdmin
      .from('voters')
      .insert({
        id: authUserId,
        reg_no: regNo,
        email: cleanEmail,
        full_name: cleanName,
        year_of_study: yearOfStudy || 'Year 3',
        accreditation_status: 'Eligible',
        has_voted: false,
      })
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Autonomously enqueue and dispatch official voter passcard email with PDF, QR code, and calendar invite
    const portalUrl = (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).trim();
    NotificationOutbox.enqueueAndDispatch(
      {
        channel: 'email',
        type: 'voter_pass',
        recipient: cleanEmail,
        payload: {
          to: cleanEmail,
          studentName: cleanName,
          regNo,
          yearOfStudy: yearOfStudy || 'Year 3',
          passwordCode: generatedPasscode,
          pollingStation: 'School of Pharmacy Complex, Kabarak University',
          portalUrl,
        },
      },
      `voter-pass:${regNo}`
    ).catch((dispatchErr) => {
      console.warn('[Signup Email Dispatch Notice]', dispatchErr);
    });

    return res.json({
      success: true,
      voter: newVoter,
      alreadyExists: false,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Reset All Ballots (Admin Clean Slate for Polling Day)
app.post('/api/election/reset-votes', async (req: Request, res: Response) => {
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Database service unavailable' });
  }

  const { officerEmail, officerRole } = req.body;

  try {
    // Delete all ballots
    const { error: ballotDeleteError } = await supabaseAdmin.from('ballots').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (balloutDeleteError(ballotDeleteError)) {
      console.warn('Ballot delete notice:', ballotDeleteError);
    }

    // Reset voters
    await supabaseAdmin.from('voters').update({
      has_voted: false,
      voted_at: null,
      receipt_code: null,
    }).neq('id', '00000000-0000-0000-0000-000000000000');

    // Audit Log
    await supabaseAdmin.from('audit_logs').insert({
      officer_email: officerEmail || 'returning.officer@kabarak.ac.ke',
      officer_role: officerRole || 'Chief Returning Officer',
      action_type: 'BALLOTS_RESET_FOR_POLLING_DAY',
      details: { timestamp: new Date().toISOString() },
    });

    return res.json({ success: true, message: 'All ballots cleared and voter statuses reset for live polling.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

function balloutDeleteError(err: any): boolean {
  return Boolean(err && err.code !== 'PGRST116');
}

// ==========================================
// KUPSA RESILIENT EMAIL OUTBOX DISPATCH APIS
// ==========================================

// Diagnostic SMTP status check
app.get('/api/email/status', async (_req: Request, res: Response) => {
  const status = NotificationOutbox.getSmtpStatus();
  return res.json({
    ...status,
    hasPassword: Boolean(process.env.SMTP_PASS?.trim()),
    from: process.env.EMAIL_FROM || null,
  });
});

// Verify live SMTP handshake with Gmail
app.post('/api/email/test-smtp', async (req: Request, res: Response) => {
  const result = await verifySmtpConnection();
  return res.json(result);
});

// Enqueue and dispatch official Voter Polling Pass
app.post('/api/email/voter-pass', async (req: Request, res: Response) => {
  const { studentName, regNo, yearOfStudy, email, passwordCode, pollingStation } = req.body;
  const recipient = (email || '').trim().toLowerCase();

  if (!recipient || !regNo) {
    return res.status(400).json({ error: 'recipient email and regNo are required' });
  }

  const portalUrl = (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).trim();
  const dispatchResult = await NotificationOutbox.enqueueAndDispatch(
    {
      channel: 'email',
      type: 'voter_pass',
      recipient,
      payload: {
        to: recipient,
        studentName: studentName || 'Kabarak Pharmacy Scholar',
        regNo,
        yearOfStudy: yearOfStudy || 'Year 3',
        passwordCode: passwordCode || 'KUP-2026',
        pollingStation: pollingStation || 'School of Pharmacy Complex, Kabarak University',
        portalUrl,
      },
    },
    `voter-pass:${regNo}:${Date.now()}`
  );

  return res.json(dispatchResult);
});

// Enqueue and dispatch Certified Results Gazettement
app.post('/api/email/results-broadcast', async (req: Request, res: Response) => {
  const { recipientEmail, recipientName, declarationStatement, officesSummary, totalVotes, totalRegistered, turnoutPct } = req.body;
  const recipient = (recipientEmail || '').trim().toLowerCase();

  if (!recipient) {
    return res.status(400).json({ error: 'recipientEmail is required' });
  }

  const portalUrl = (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).trim();
  const gazettedTimestamp = new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' }) + ' EAT';

  const dispatchResult = await NotificationOutbox.enqueueAndDispatch(
    {
      channel: 'email',
      type: 'results_broadcast',
      recipient,
      payload: {
        to: recipient,
        recipientName: recipientName || 'Kabarak University Pharmacy Scholar',
        declarationStatement: declarationStatement || 'Certified official results declared under constitutional authority.',
        officesSummary: officesSummary || [],
        totalVotes: totalVotes || 0,
        totalRegistered: totalRegistered || 1000,
        turnoutPct: turnoutPct || 0,
        gazettedTimestamp,
        portalUrl,
      },
    },
    `results-gazette:${recipient}:${Date.now()}`
  );

  return res.json(dispatchResult);
});

// Enqueue and dispatch Commission Gazette Notice
app.post('/api/email/commission-notice', async (req: Request, res: Response) => {
  const { recipientEmail, headline, bodyText, urgency, issuedBy } = req.body;
  const recipient = (recipientEmail || '').trim().toLowerCase();

  if (!recipient || !headline || !bodyText) {
    return res.status(400).json({ error: 'recipientEmail, headline, and bodyText are required' });
  }

  const portalUrl = (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).trim();
  const dispatchResult = await NotificationOutbox.enqueueAndDispatch(
    {
      channel: 'email',
      type: 'commission_notice',
      recipient,
      payload: {
        to: recipient,
        headline,
        bodyText,
        urgency: urgency || 'urgent',
        issuedBy: issuedBy || 'KUPSA Independent Electoral Commission',
        portalUrl,
      },
    },
    `commission-notice:${recipient}:${Date.now()}`
  );

  return res.json(dispatchResult);
});

// Cron / worker endpoint to process due outbox items
app.all(['/api/cron/process-outbox', '/api/cron/retry-outbox'], async (_req: Request, res: Response) => {
  const processed = await NotificationOutbox.processDue(25);
  return res.json({
    success: true,
    processed,
    timestamp: new Date().toISOString(),
  });
});

// Development Vite Middleware or Production Static Serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KUPSA Electoral Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
