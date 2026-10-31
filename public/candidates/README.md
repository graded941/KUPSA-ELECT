# Official Candidate Portrait Images Directory

Place candidate portrait photos into this folder: `/public/candidates/`

## File Naming Convention
You can name the image files using either the **Candidate ID** or the **Full Name slug**:

| Candidate ID | Office | Candidate Name | Recommended File Name |
| :--- | :--- | :--- | :--- |
| `cand-pres-01` | The President | Wambua Titus | `cand-pres-01.jpg` *(or `wambua-titus.jpg`)* |
| `cand-pres-02` | The President | Mputhia Mark Mwenda | `cand-pres-02.jpg` *(or `mputhia-mark-mwenda.jpg`)* |
| `cand-vp-01` | Vice President | Oire Valarie Bonareri | `cand-vp-01.jpg` *(or `oire-valarie-bonareri.jpg`)* |
| `cand-sg-01` | Secretary General | Ndema Paul Antony | `cand-sg-01.jpg` *(or `ndema-paul-antony.jpg`)* |
| `cand-sg-02` | Secretary General | Isabell Njoki | `cand-sg-02.jpg` *(or `isabell-njoki.jpg`)* |
| `cand-sg-03` | Secretary General | Ian Mark Makokha | `cand-sg-03.jpg` *(or `ian-mark-makokha.jpg`)* |
| `cand-dsg-01` | Deputy Secretary General | Avyona Sarah Precious | `cand-dsg-01.jpg` *(or `avyona-sarah-precious.jpg`)* |
| `cand-dsg-02` | Deputy Secretary General | Nicole Chebet | `cand-dsg-02.jpg` *(or `nicole-chebet.jpg`)* |
| `cand-tres-01` | Treasurer | Otieno Daniel Shukran | `cand-tres-01.jpg` *(or `otieno-daniel-shukran.jpg`)* |
| `cand-media-01` | Media & Publications Officer | Jasmine Jeptoo Jepkosgei | `cand-media-01.jpg` *(or `jasmine-jeptoo-jepkosgei.jpg`)* |
| `cand-media-02` | Media & Publications Officer | Oyabi Joan | `cand-media-02.jpg` *(or `oyabi-joan.jpg`)* |
| `cand-media-03` | Media & Publications Officer | Victor Perur | `cand-media-03.jpg` *(or `victor-perur.jpg`)* |
| `cand-org-01` | Organizing Secretary | Nancy Njoroge Munjiru | `cand-org-01.jpg` *(or `nancy-njoroge-munjiru.jpg`)* |
| `cand-org-02` | Organizing Secretary | Ibrahim Khalif | `cand-org-02.jpg` *(or `ibrahim-khalif.jpg`)* |

## Supported Formats
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- WebP (`.webp`)
- SVG (`.svg`)

## How to Customize Paths in Code
Open `/src/data/candidateImages.ts` and adjust the path or extension if needed:
```typescript
export const CANDIDATE_IMAGE_MAP: Record<string, string> = {
  'cand-pres-01': '/candidates/my-custom-photo.png',
  ...
};
```
If an image is not yet uploaded, the application automatically displays an elegant circular badge with the candidate's initials and official portfolio background color.
