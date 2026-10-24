import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { NotificationOutbox } from './notification-outbox.js';
import { verifySmtpConnection, resolveSmtpCredentials } from './email.server.js';

dotenv.config();

const app = express();

app.use(express.json());

// Enable permissive CORS for API requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Initialize Supabase admin client
const rawSupabaseUrl = (process.env.VITE_SUPABASE_URL || '').trim();
const supabaseUrl = rawSupabaseUrl
  .replace(/\/rest\/v1\/?$/i, '')
  .replace(/\/+$/, '');
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const anonKey = (process.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && (serviceRoleKey || anonKey)
    ? createClient(supabaseUrl, serviceRoleKey || anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

// Initialize Notification Outbox with Supabase client (with direct fallback if table is not yet created)
NotificationOutbox.init(supabaseAdmin);

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

// ==========================================
// SYSTEM HEALTH & DIAGNOSTICS ENDPOINTS
// ==========================================

app.get(['/api/health', '/api/ping'], async (_req: Request, res: Response) => {
  const startTime = Date.now();
  let dbStatus = 'disconnected';
  let dbError: string | null = null;
  let counts: any = null;

  if (supabaseAdmin) {
    try {
      const [settingsRes, officesRes, candsRes, votersRes, ballotsRes, auditRes] = await Promise.all([
        supabaseAdmin.from('election_settings').select('*', { count: 'exact' }).limit(1),
        supabaseAdmin.from('offices').select('*', { count: 'exact' }),
        supabaseAdmin.from('candidates').select('*', { count: 'exact' }),
        supabaseAdmin.from('voters').select('*', { count: 'exact' }),
        supabaseAdmin.from('ballots').select('*', { count: 'exact' }),
        supabaseAdmin.from('audit_logs').select('*', { count: 'exact' }),
      ]);

      dbStatus = 'connected';
      counts = {
        settings: settingsRes.count ?? settingsRes.data?.length ?? 0,
        offices: officesRes.count ?? officesRes.data?.length ?? 0,
        candidates: candsRes.count ?? candsRes.data?.length ?? 0,
        voters: votersRes.count ?? votersRes.data?.length ?? 0,
        ballots: ballotsRes.count ?? ballotsRes.data?.length ?? 0,
        auditLogs: auditRes.count ?? auditRes.data?.length ?? 0,
      };
    } catch (e: any) {
      dbStatus = 'degraded';
      dbError = e.message || 'Supabase query error';
    }
  }

  const smtpInfo = NotificationOutbox.getSmtpStatus();

  return res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    latencyMs: Date.now() - startTime,
    service: 'KUPSA Independent Electoral Commission API',
    database: {
      status: dbStatus,
      url: supabaseUrl || 'not_configured',
      configured: Boolean(supabaseAdmin),
      error: dbError,
    },
    counts: counts || {
      settings: 0,
      offices: 0,
      candidates: 0,
      voters: 0,
      ballots: 0,
      auditLogs: 0,
    },
    smtp: {
      configured: smtpInfo.configured,
      user: smtpInfo.user || null,
      host: smtpInfo.host || null,
      port: smtpInfo.port || null,
      hasPassword: Boolean(process.env.SMTP_PASS?.trim()),
    },
    runtime: {
      node: process.version,
      platform: process.platform,
      isVercel: Boolean(process.env.VERCEL),
      siteUrl: process.env.SITE_URL || 'https://kupsaelect.vercel.app',
    },
  });
});

// Full Election State Retrieval (Atomic snapshot)
app.get('/api/election/state', async (_req: Request, res: Response) => {
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Supabase database not configured' });
  }

  try {
    const [settingsRes, officesRes, candsRes, votersRes, ballotsRes] = await Promise.all([
      supabaseAdmin.from('election_settings').select('*').limit(1).maybeSingle(),
      supabaseAdmin.from('offices').select('*').order('display_order', { ascending: true }),
      supabaseAdmin.from('candidates').select('*').order('created_at', { ascending: true }),
      supabaseAdmin.from('voters').select('*').order('full_name', { ascending: true }),
      supabaseAdmin.from('ballots').select('*').order('cast_at', { ascending: false }),
    ]);

    return res.json({
      settings: settingsRes.data || {
        is_results_live: true,
        election_phase: 'polling-live',
        announcement_banner: '',
      },
      offices: officesRes.data || [],
      candidates: candsRes.data || [],
      voters: votersRes.data || [],
      ballots: ballotsRes.data || [],
    });
  } catch (err: any) {
    console.error('Error fetching election state:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Cast Anonymized Ballot
app.post('/api/ballot/cast', async (req: Request, res: Response) => {
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Database service unavailable' });
  }

  const { voterEmail, voterReg, selections, verificationHash, clientTimestamp } = req.body;

  if (!voterEmail || !selections || !verificationHash) {
    return res.status(400).json({ error: 'Missing required ballot parameters' });
  }

  try {
    // 1. Verify election settings (must be in polling-live)
    const { data: settings } = await supabaseAdmin.from('election_settings').select('election_phase').limit(1).maybeSingle();
    if (settings && settings.election_phase !== 'polling-live') {
      return res.status(403).json({
        error: `Voting is currently locked. Statutory Election Phase: ${settings.election_phase}`,
      });
    }

    // 2. Fetch voter record to verify eligibility and ensure they haven't voted
    const { data: voter, error: voterFetchErr } = await supabaseAdmin
      .from('voters')
      .select('*')
      .ilike('email', voterEmail.trim())
      .maybeSingle();

    if (voterFetchErr || !voter) {
      return res.status(404).json({ error: 'Voter not found in official accredited voter roll' });
    }

    if (voter.has_voted) {
      return res.status(409).json({
        error: 'Vote already recorded. Constitutional rules prohibit duplicate ballots.',
        receiptCode: voter.receipt_code,
      });
    }

    // 3. Generate Anonymous Receipt Code
    const cleanHash = verificationHash.substring(0, 8).toUpperCase();
    const receiptCode = `KUP-2026-${cleanHash}`;

    // 4. Record Ballot anonymously
    const { data: ballotData, error: ballotErr } = await supabaseAdmin
      .from('ballots')
      .insert({
        receipt_code: receiptCode,
        verification_hash: verificationHash,
        selections: selections,
        cast_at: clientTimestamp || new Date().toISOString(),
      })
      .select()
      .single();

    if (ballotErr) {
      console.error('Failed to insert ballot:', ballotErr);
      return res.status(500).json({ error: 'Failed to securely seal ballot in database' });
    }

    // 5. Mark Voter as voted
    const { error: voterUpdateErr } = await supabaseAdmin
      .from('voters')
      .update({
        has_voted: true,
        voted_at: new Date().toISOString(),
        receipt_code: receiptCode,
      })
      .eq('id', voter.id);

    if (voterUpdateErr) {
      console.error('Error updating voter status:', voterUpdateErr);
    }

    // 6. Record Audit Log entry
    await supabaseAdmin.from('audit_logs').insert({
      officer_email: 'system.cryptography@kabarak.ac.ke',
      officer_role: 'Automated Cryptographic Sealer',
      action_type: 'BALLOT_SEALED',
      details: {
        receiptCode,
        yearOfStudy: voter.year_of_study,
        timestamp: new Date().toISOString(),
      },
    });

    return res.json({
      success: true,
      receiptCode,
      ballotId: ballotData?.id,
      timestamp: ballotData?.cast_at || new Date().toISOString(),
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
    if (typeof notes === 'string') updatePayload.clearance_notes = notes;
    if (name) updatePayload.name = name;
    if (nickname) updatePayload.nickname = nickname;
    if (photoUrl) updatePayload.photo_url = photoUrl;
    if (manifestoSummary) updatePayload.manifesto_summary = manifestoSummary;

    const { error: updateErr } = await supabaseAdmin
      .from('candidates')
      .update(updatePayload)
      .eq('id', candidateId);

    if (updateErr) {
      return res.status(500).json({ error: updateErr.message });
    }

    // Audit Log
    await supabaseAdmin.from('audit_logs').insert({
      officer_email: officerEmail || 'commissioner@kabarak.ac.ke',
      officer_role: officerRole || 'Returning Officer',
      action_type: 'CANDIDATE_CLEARANCE_UPDATED',
      details: {
        candidateId,
        ...updatePayload,
        timestamp: new Date().toISOString(),
      },
    });

    return res.json({ success: true, candidateId, updated: updatePayload });
  } catch (err: any) {
    console.error('Update clearance error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Voter Accreditation Toggle
app.post('/api/voter/accredit', async (req: Request, res: Response) => {
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Database service unavailable' });
  }

  const { voterId, email, newStatus, officerEmail, officerRole } = req.body;

  try {
    let query = supabaseAdmin.from('voters').update({ accreditation_status: newStatus });
    if (voterId) {
      query = query.eq('id', voterId);
    } else if (email) {
      query = query.ilike('email', email);
    } else {
      return res.status(400).json({ error: 'voterId or email required' });
    }

    const { error } = await query;
    if (error) throw error;

    await supabaseAdmin.from('audit_logs').insert({
      officer_email: officerEmail || 'commissioner@kabarak.ac.ke',
      officer_role: officerRole || 'Accreditation Officer',
      action_type: 'VOTER_ACCREDITATION_MODIFIED',
      details: { voterId, email, newStatus, timestamp: new Date().toISOString() },
    });

    return res.json({ success: true, status: newStatus });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Voter Signup / Registration
app.post('/api/voter/signup', async (req: Request, res: Response) => {
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Database service unavailable' });
  }

  const { fullName, email, yearOfStudy } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanEmail.endsWith('@kabarak.ac.ke')) {
    return res.status(400).json({ error: 'Only official Kabarak University emails (@kabarak.ac.ke) are permitted' });
  }

  try {
    const { data: existing } = await supabaseAdmin
      .from('voters')
      .select('id, email, accreditation_status, has_voted')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({
        error: 'This email is already registered in the KUPSA voter roll.',
        accreditationStatus: existing.accreditation_status,
      });
    }

    const regSuffix = Math.floor(1000 + Math.random() * 9000);
    const regNo = `PHARM/2026/${regSuffix}`;
    const generatedPassword = `KUP-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    let authUserId: string | null = null;
    try {
      const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: generatedPassword,
        email_confirm: true,
        user_metadata: { full_name: fullName, year_of_study: yearOfStudy, reg_no: regNo },
      });

      if (authUser?.user?.id) {
        authUserId = authUser.user.id;
      } else if (authErr) {
        console.warn('Auth user creation warning:', authErr);
      }
    } catch (e) {
      console.error('Supabase Auth error:', e);
    }

    const voterRecordId = authUserId || `voter-${Date.now()}`;

    const { error: insertErr } = await supabaseAdmin.from('voters').insert({
      id: voterRecordId,
      reg_no: regNo,
      email: cleanEmail,
      full_name: fullName.trim(),
      year_of_study: yearOfStudy || 'Year 1',
      accreditation_status: 'Eligible',
      has_voted: false,
    });

    if (insertErr) {
      throw insertErr;
    }

    await supabaseAdmin.from('audit_logs').insert({
      officer_email: 'self-service.registration@kabarak.ac.ke',
      officer_role: 'Automated Registrar',
      action_type: 'VOTER_REGISTERED',
      details: { email: cleanEmail, regNo, yearOfStudy, timestamp: new Date().toISOString() },
    });

    return res.json({
      success: true,
      voterId: voterRecordId,
      email: cleanEmail,
      regNo,
      password: generatedPassword,
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Reset Ballots for Polling Day
app.post('/api/election/reset-votes', async (req: Request, res: Response) => {
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Database service unavailable' });
  }

  const { officerEmail, officerRole, confirmSecret } = req.body;
  if (confirmSecret !== 'RESET-KUPSA-2026') {
    return res.status(401).json({ error: 'Invalid confirmation secret key' });
  }

  try {
    await supabaseAdmin.from('ballots').delete().neq('id', 0);
    await supabaseAdmin.from('voters').update({ has_voted: false, voted_at: null, receipt_code: null }).neq('id', 'placeholder');

    await supabaseAdmin.from('audit_logs').insert({
      officer_email: officerEmail || 'commissioner@kabarak.ac.ke',
      officer_role: officerRole || 'Chief Returning Officer',
      action_type: 'BALLOTS_RESET_FOR_POLLING_DAY',
      details: { timestamp: new Date().toISOString() },
    });

    return res.json({ success: true, message: 'All ballots cleared and voter statuses reset for live polling.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Diagnostic SMTP status check
app.get('/api/email/status', async (_req: Request, res: Response) => {
  const status = NotificationOutbox.getSmtpStatus();
  return res.json({
    configured: status.configured,
    user: status.user,
    host: status.host,
    port: status.port,
    hasPassword: Boolean(process.env.SMTP_PASS?.trim()),
    from: process.env.EMAIL_FROM || `"KUPSA Electoral Commission" <${status.user}>`,
  });
});

// Test SMTP connection directly
app.post('/api/email/test-smtp', async (_req: Request, res: Response) => {
  const result = await verifySmtpConnection();
  return res.json(result);
});

// Enqueue and dispatch Voter Passcard Email
app.post('/api/email/voter-pass', async (req: Request, res: Response) => {
  const { studentName, regNo, yearOfStudy, email, passwordCode, pollingStation } = req.body;
  const recipient = (email || '').trim().toLowerCase();

  if (!recipient || !studentName || !passwordCode) {
    return res.status(400).json({ error: 'email, studentName, and passwordCode are required' });
  }

  const portalUrl = (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).trim();

  const dispatchResult = await NotificationOutbox.enqueueAndDispatch(
    {
      channel: 'email',
      type: 'voter_pass',
      recipient,
      payload: {
        to: recipient,
        studentName,
        regNo: regNo || 'PHARM/2026/PROV',
        yearOfStudy: yearOfStudy || 'Year 1',
        passwordCode,
        portalUrl,
        pollingStation: pollingStation || 'School of Pharmacy Complex, Kabarak University',
      },
    },
    `voter-pass:${recipient}`
  );

  return res.json(dispatchResult);
});

// Enqueue and dispatch Live Election Results Broadcast
app.post('/api/email/results-broadcast', async (req: Request, res: Response) => {
  const { recipientEmail, electionPhase, totalTurnout, registeredVoters, turnoutPercentage, results } = req.body;
  const recipient = (recipientEmail || '').trim().toLowerCase();

  if (!recipient || !results) {
    return res.status(400).json({ error: 'recipientEmail and results are required' });
  }

  const portalUrl = (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).trim();

  const dispatchResult = await NotificationOutbox.enqueueAndDispatch(
    {
      channel: 'email',
      type: 'results_broadcast',
      recipient,
      payload: {
        to: recipient,
        electionPhase: electionPhase || 'Live Results',
        totalTurnout: totalTurnout || 0,
        registeredVoters: registeredVoters || 0,
        turnoutPercentage: turnoutPercentage || 0,
        portalUrl,
        results,
      },
    },
    `results-broadcast:${recipient}:${Date.now()}`
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

export default app;
