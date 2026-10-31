/**
 * Official Candidate Portrait Images Configuration
 * ----------------------------------------------------
 * Kabarak University Pharmacy Students Association (KUPSA)
 * Electoral Commission · Official Candidates Roster
 *
 * HOW TO ADD OR UPDATE PICTURES:
 * ----------------------------------------------------
 * METHOD 1: Local Image Files in /public/candidates/ (RECOMMENDED)
 * 1. Place candidate photos into the `/public/candidates/` folder.
 * 2. Name the files by candidate ID or candidate slug, e.g.:
 *      /public/candidates/cand-pres-01.jpg
 *      /public/candidates/cand-pres-02.jpg
 * 3. Update the path in CANDIDATE_IMAGE_MAP below to match your filename.
 *    Any web format is supported: .jpg, .jpeg, .png, .webp, .svg.
 *
 * METHOD 2: External Hosted Image URLs
 * If images are hosted online (e.g. Google Drive direct link, Cloudinary, Imgur, Supabase Storage):
 *    'cand-pres-01': 'https://example.com/photos/wambua-titus.jpg'
 *
 * METHOD 3: Base64 Encoded Data URL
 * You can paste raw Base64 data strings:
 *    'cand-pres-01': 'data:image/jpeg;base64,...'
 */

export interface CandidateImageEntry {
  candidateId: string;
  candidateName: string;
  officeTitle: string;
  photoUrl: string;
  recommendedFileName: string;
}

export const CANDIDATE_IMAGE_MAP: Record<string, string> = {
  // 1. THE PRESIDENT
  'cand-pres-01': '/candidates/cand-pres-01.jpg', // Wambua Titus
  'cand-pres-02': '/candidates/cand-pres-02.jpg', // Mputhia Mark Mwenda

  // 2. VICE PRESIDENT (Unopposed)
  'cand-vp-01': '/candidates/cand-vp-01.jpg',     // Oire Valarie Bonareri

  // 3. SECRETARY GENERAL
  'cand-sg-01': '/candidates/cand-sg-01.jpg',     // Ndema Paul Antony
  'cand-sg-02': '/candidates/cand-sg-02.jpg',     // Isabell Njoki
  'cand-sg-03': '/candidates/cand-sg-03.jpg',     // Ian Mark Makokha

  // 4. DEPUTY SECRETARY GENERAL
  'cand-dsg-01': '/candidates/cand-dsg-01.jpg',   // Avyona Sarah Precious
  'cand-dsg-02': '/candidates/cand-dsg-02.jpg',   // Nicole Chebet

  // 5. TREASURER (Unopposed)
  'cand-tres-01': '/candidates/cand-tres-01.jpg', // Otieno Daniel Shukran

  // 6. MEDIA AND PUBLICATIONS OFFICER
  'cand-media-01': '/candidates/cand-media-01.jpg', // Jasmine Jeptoo Jepkosgei
  'cand-media-02': '/candidates/cand-media-02.jpg', // Oyabi Joan
  'cand-media-03': '/candidates/cand-media-03.jpg', // Victor Perur

  // 7. ORGANIZING SECRETARY
  'cand-org-01': '/candidates/cand-org-01.jpg',   // Nancy Njoroge Munjiru
  'cand-org-02': '/candidates/cand-org-02.jpg',   // Ibrahim Khalif
};

/**
 * Helper to retrieve candidate portrait URL by candidate ID.
 */
export function getCandidatePhotoUrl(candidateId: string): string {
  return CANDIDATE_IMAGE_MAP[candidateId] || '';
}

/**
 * Manifest table of all candidates with photo slots for easy inspection.
 */
export const CANDIDATE_ROSTER_MANIFEST: CandidateImageEntry[] = [
  {
    candidateId: 'cand-pres-01',
    candidateName: 'Wambua Titus',
    officeTitle: 'The President',
    photoUrl: CANDIDATE_IMAGE_MAP['cand-pres-01'],
    recommendedFileName: 'cand-pres-01.jpg (or wambua-titus.jpg)'
  },
  {
    candidateId: 'cand-pres-02',
    candidateName: 'Mputhia Mark Mwenda',
    officeTitle: 'The President',
    photoUrl: CANDIDATE_IMAGE_MAP['cand-pres-02'],
    recommendedFileName: 'cand-pres-02.jpg (or mputhia-mark-mwenda.jpg)'
  },
  {
    candidateId: 'cand-vp-01',
    candidateName: 'Oire Valarie Bonareri',
    officeTitle: 'Vice President',
    photoUrl: CANDIDATE_IMAGE_MAP['cand-vp-01'],
    recommendedFileName: 'cand-vp-01.jpg (or oire-valarie-bonareri.jpg)'
  },
  {
    candidateId: 'cand-sg-01',
    candidateName: 'Ndema Paul Antony',
    officeTitle: 'Secretary General',
    photoUrl: CANDIDATE_IMAGE_MAP['cand-sg-01'],
    recommendedFileName: 'cand-sg-01.jpg (or ndema-paul-antony.jpg)'
  },
  {
    candidateId: 'cand-sg-02',
    candidateName: 'Isabell Njoki',
    officeTitle: 'Secretary General',
    photoUrl: CANDIDATE_IMAGE_MAP['cand-sg-02'],
    recommendedFileName: 'cand-sg-02.jpg (or isabell-njoki.jpg)'
  },
  {
    candidateId: 'cand-sg-03',
    candidateName: 'Ian Mark Makokha',
    officeTitle: 'Secretary General',
    photoUrl: CANDIDATE_IMAGE_MAP['cand-sg-03'],
    recommendedFileName: 'cand-sg-03.jpg (or ian-mark-makokha.jpg)'
  },
  {
    candidateId: 'cand-dsg-01',
    candidateName: 'Avyona Sarah Precious',
    officeTitle: 'Deputy Secretary General',
    photoUrl: CANDIDATE_IMAGE_MAP['cand-dsg-01'],
    recommendedFileName: 'cand-dsg-01.jpg (or avyona-sarah-precious.jpg)'
  },
  {
    candidateId: 'cand-dsg-02',
    candidateName: 'Nicole Chebet',
    officeTitle: 'Deputy Secretary General',
    photoUrl: CANDIDATE_IMAGE_MAP['cand-dsg-02'],
    recommendedFileName: 'cand-dsg-02.jpg (or nicole-chebet.jpg)'
  },
  {
    candidateId: 'cand-tres-01',
    candidateName: 'Otieno Daniel Shukran',
    officeTitle: 'Treasurer',
    photoUrl: CANDIDATE_IMAGE_MAP['cand-tres-01'],
    recommendedFileName: 'cand-tres-01.jpg (or otieno-daniel-shukran.jpg)'
  },
  {
    candidateId: 'cand-media-01',
    candidateName: 'Jasmine Jeptoo Jepkosgei',
    officeTitle: 'Media and Publications Officer',
    photoUrl: CANDIDATE_IMAGE_MAP['cand-media-01'],
    recommendedFileName: 'cand-media-01.jpg (or jasmine-jeptoo-jepkosgei.jpg)'
  },
  {
    candidateId: 'cand-media-02',
    candidateName: 'Oyabi Joan',
    officeTitle: 'Media and Publications Officer',
    photoUrl: CANDIDATE_IMAGE_MAP['cand-media-02'],
    recommendedFileName: 'cand-media-02.jpg (or oyabi-joan.jpg)'
  },
  {
    candidateId: 'cand-media-03',
    candidateName: 'Victor Perur',
    officeTitle: 'Media and Publications Officer',
    photoUrl: CANDIDATE_IMAGE_MAP['cand-media-03'],
    recommendedFileName: 'cand-media-03.jpg (or victor-perur.jpg)'
  },
  {
    candidateId: 'cand-org-01',
    candidateName: 'Nancy Njoroge Munjiru',
    officeTitle: 'Organizing Secretary',
    photoUrl: CANDIDATE_IMAGE_MAP['cand-org-01'],
    recommendedFileName: 'cand-org-01.jpg (or nancy-njoroge-munjiru.jpg)'
  },
  {
    candidateId: 'cand-org-02',
    candidateName: 'Ibrahim Khalif',
    officeTitle: 'Organizing Secretary',
    photoUrl: CANDIDATE_IMAGE_MAP['cand-org-02'],
    recommendedFileName: 'cand-org-02.jpg (or ibrahim-khalif.jpg)'
  }
];
