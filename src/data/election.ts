export * from './mockData';
export * from './candidateData';
import { ElectionMilestone } from '../types';

/**
 * Returns the exact Date for the first Friday of November of a given year (or current year)
 * as mandated by Article 41(1) of the KUPSA Constitution:
 * "General elections shall be held on the first Friday of November each academic year."
 */
export function getElectionPollingDate(referenceDate: Date = new Date()): Date {
  const currentYear = referenceDate.getFullYear();
  // Fixed constitutional election date: Friday, 6th of November 2026 at 08:00 EAT (Article 41(1))
  const targetDate = new Date(currentYear, 10, 6, 8, 0, 0, 0);

  // If the date in current year has already elapsed by more than 7 days, target next cycle
  if (referenceDate.getTime() > targetDate.getTime() + 1000 * 60 * 60 * 24 * 7) {
    const nextYear = currentYear + 1;
    return new Date(nextYear, 10, 6, 8, 0, 0, 0);
  }

  return targetDate;
}

export const ELECTION_MILESTONES: ElectionMilestone[] = [
  {
    id: 'vetting-complete',
    title: 'Candidate Vetting & Gazette Notice',
    phase: 'pre-election',
    dateStr: 'Oct 24, 2026',
    timeStr: '17:00 EAT',
    article: 'Article 43',
    description: 'Statutory clearance of all nominated candidates by the Electoral Commission and School Patron.',
    badge: 'Completed'
  },
  {
    id: 'register-certified',
    title: 'Final Voter Register Publication',
    phase: 'pre-election',
    dateStr: 'Nov 02, 2026',
    timeStr: '12:00 EAT',
    article: 'Article 39',
    description: 'Voter roll locked and cryptographically signed across all pharmacy academic cohorts.',
    badge: 'Certified'
  },
  {
    id: 'polling-opens',
    title: 'Polling Stations Open (Election Day)',
    phase: 'polling-live',
    dateStr: 'Nov 06, 2026',
    timeStr: '08:00 EAT',
    article: 'Article 41(1)',
    description: 'In-person secret electronic and manual paper contingency balloting commences.',
    badge: 'Critical Milestone'
  },
  {
    id: 'polling-closes',
    title: 'Polls Close & Tallying Begins',
    phase: 'counting',
    dateStr: 'Nov 06, 2026',
    timeStr: '17:00 EAT',
    article: 'Article 45',
    description: 'Ballot boxes unsealed in presence of accredited candidate agents and independent observers.',
    badge: 'Scheduled'
  },
  {
    id: 'results-declared',
    title: 'Official Certified Declaration',
    phase: 'results-declared',
    dateStr: 'Nov 07, 2026',
    timeStr: '12:00 EAT',
    article: 'Article 46',
    description: 'Returning Officer publishes certified tally sheets countersigned by agents under Patron oversight.',
    badge: 'Statutory'
  }
];
