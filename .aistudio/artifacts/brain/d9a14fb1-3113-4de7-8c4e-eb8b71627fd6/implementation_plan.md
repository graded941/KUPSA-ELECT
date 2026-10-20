# Supabase Live Data Synchronization & Real-Time Migration

Transition the KUPSA (Kabarak University Pharmacy Students Association) Electoral Commission portal and student voting system from simulated in-memory mock datasets to production Supabase database synchronizations with real-time websocket subscriptions and constitutional secret balloting.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed in Phase 1 and govern the database migration:

- **Confirmed Decision 1: Ballot Privacy & Anonymity**: Cast ballots are stored completely detached from voter student identities in an anonymized `ballots` table (storing timestamp, cohort year, and office choices). Simultaneously, the student's entry in the `voters` table is updated atomically to mark `has_voted = true`, timestamp of voting, and a unique cryptographic receipt verification code for the student's personal records. No join key exists between a student's identity and their specific candidate selections.
- **Confirmed Decision 2: Real-Time Synchronization**: Live vote tallies, turnout percentages, and official commission announcements utilize Supabase Realtime websocket channels (`postgres_changes` on `ballots` and `election_settings`) for zero-latency live updates without manual page refreshes.
- **Confirmed Decision 3: Strict Database Mode**: The application operates in strict database mode. If tables are empty or connection fails, the interface presents authentic empty states (e.g., "Awaiting candidate nominations from Electoral Commission") and clear error banners with retry triggers rather than falling back to simulated placeholder data.

---

### 1. Overview & Core Concept

- **What It Does**: Replaces mock fixtures (`mockData.ts`, simulated local storage user lists, and hardcoded vote arrays) with real, reactive queries to the user's provisioned Supabase PostgreSQL backend. Provides real-time live election tallies, authentic voter authentication and accreditation checks, commissioner administrative status updates, candidate clearance logging, and immutable dispute tracking.
- **Target Audience / Persona**: 
  - *Kabarak University Pharmacy Students*: Securely authenticate, verify accreditation eligibility, and cast confidential single-use ballots.
  - *Electoral Commissioners & Returning Officers*: Manage candidate vetting, open/close polling phases, declare certified results, and audit system integrity.
  - *Patron & Dean of Pharmacy*: Review dispute petitions and oversee constitutional compliance.
- **Key Value**: Guarantees institutional credibility, non-repudiation, and tamper-resistant student elections backed by PostgreSQL Row Level Security (RLS) and real-time verification.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. *Student Authentication & Accreditation Flow*: Student signs in with campus email (`@kabarak.ac.ke`) -> Supabase verifies voter accreditation and eligibility status -> Redirects to Ballot if eligible and not yet voted, or displays personalized voting receipt if already voted.
  2. *Confidential Ballot Submission*: Voter reviews certified candidates per constitutional post -> Selects choices -> Clicks "Confirm & Seal Ballot" -> Database atomically writes anonymized vote and marks voter completed -> Generates tamper-proof cryptographic receipt code.
  3. *Live Results & Turnout Stream*: Observers and students view live bar tallies and turnout percentages updating in real-time as ballots stream into Supabase -> Instant majority winner calculation according to KUPSA constitutional thresholds.
  4. *Commission Operations & Clearance*: Returning Officers toggle candidate vetting statuses, publish campus-wide emergency notices, and review dispute logs with immediate persistence in Supabase.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Institutional, solemn, and high-trust academic governance. Clean structural contrast, subtle hairline borders, and zero-pill typographic clarity.
  - *Color Palette & Mood*: Deep university navy (`#0B1B3D`), pure slate structural cards (`#0F172A` / `#FFFFFF`), dignified gold accent (`#D97706`), and restrained emerald indicators (`#16A34A`).
  - *Typography & Hierarchy*: High-contrast display headings (`Plus Jakarta Sans` / `Outfit`), clean body text (`Public Sans`), and strictly tabular monospace numerals (`tabular-nums` / `font-mono`) for vote percentages, turnout counters, and audit hashes.
  - *Component Styling & Layout*: High-density data tables ($36\text{px}$–$44\text{px}$ row height), single-elevation flat cards with 1px border lines, and zero static pill capsules.
- **Interactive Feedback & Motion**:
  - Live pulse micro-indicators on real-time connected feeds.
  - Authentic skeleton loaders during table fetching ($\le 2\text{px}$ geometry variance).
  - Explicit empty state cards with actionable guidance when candidate rosters or dispute queues are unpopulated.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Client-Side Supabase Service Layer vs Component Spaghetti**
  - *Chosen Approach*: Implement a centralized, type-safe data access layer (`src/lib/electionService.ts`) wrapping Supabase client operations, error handling, and subscription teardowns.
  - *Why*: Decouples UI components from raw SQL/REST calls, provides clean error boundary hooks, and makes testing and offline diagnostic banners clean and maintainable.
  - *Alternatives Considered*: Direct `supabase.from()` calls in individual React views, which creates duplicate queries, leaky subscription handles, and inconsistent error handling.
- **Decision 2: Anonymous Ballot Storage Architecture**
  - *Chosen Approach*: Decoupled dual-write transaction: `ballots` record containing `{ id, choices, voter_year, created_at, receipt_hash }` without student identifiers; `voters` table updated with `{ has_voted: true, voted_at: NOW(), receipt_code }`.
  - *Why*: Upholds Article 38 constitutional secret ballot guarantees—even a database administrator cannot correlate a student's identity with their individual candidate preferences.
  - *Alternatives Considered*: Storing voter email foreign key directly on ballots, which violates election privacy norms.
- **Decision 3: Realtime Subscriptions & Aggregated Tally Cache**
  - *Chosen Approach*: Combine direct Supabase Realtime channel subscription on `ballots` table with client-side reactive aggregation for instant visual tally updates without hammering the database with heavy aggregate queries on every vote.
  - *Why*: Delivers 60fps instant tally transitions while maintaining zero extra server infrastructure.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        KUPSA Electoral Frontend                        │
├─────────────────┬──────────────────┬─────────────────┬─────────────────┤
│  Student Auth   │   Ballot View    │  Results View   │ Commission Desk │
│ (Accreditation) │ (Secret Ballot)  │  (Live Tally)   │ (Clearances)    │
└────────┬────────┴────────┬─────────┴────────┬────────┴────────┬────────┘
         │                 │                  │                 │
         ▼                 ▼                  ▼                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 Centralized Election Service Layer                     │
│                     (src/lib/electionService.ts)                       │
├────────────────────────────────────────────────────────────────────────┤
│ • fetchOfficesAndCandidates()       • streamLiveBallots() (Realtime)   │
│ • authenticateVoter()               • updateCandidateClearance()       │
│ • castSecretBallot()                • fetchElectionSettings()          │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Supabase PostgreSQL DB                          │
├─────────────────────────┬────────────────────────┬─────────────────────┤
│  election_settings      │  offices & candidates  │  voters & students  │
├─────────────────────────┼────────────────────────┼─────────────────────┤
│  ballots (anonymized)   │  audit_logs            │  disputes           │
└─────────────────────────┴────────────────────────┴─────────────────────┘
```

- **Data Model & State Mapping**:
  - `election_settings`: `{ id, phase, is_results_live, announcement_banner, polling_opened_at, polling_closed_at }`
  - `offices`: `{ id, title, description, seats, constitutional_article, term }`
  - `candidates`: `{ id, name, initials, office_id, year_of_study, vetting_status, manifesto_summary, manifesto_pillars, compliance_checklist, clearance_notes }`
  - `voters`: `{ id, reg_no, name, email, year_of_study, status, dues_cleared, has_voted, voted_at, receipt_code }`
  - `ballots`: `{ id, choices, voter_year, created_at, receipt_code }`
  - `audit_logs`: `{ id, timestamp, actor_role, action, hash_proof, status }`
  - `disputes`: `{ id, complainant_name, office_contested, constitutional_grounds, status, patron_notified, resolution_notes }`

- **Interactive State Transitions & Error Recovery**:
  - *Network Interruption*: Global banner displays "Live connection paused. Reconnecting to Electoral Database..." with automatic exponential backoff.
  - *Empty State Presentation*: Tailored empty tables with instructions for Returning Officers to initialize candidates or accreditation rosters.
  - *Voting Idempotency*: Double-voting attempts are rejected at the database level via voter `has_voted` validation before ballot insertion.
