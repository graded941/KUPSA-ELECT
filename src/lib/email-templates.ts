/**
 * Email Templates for KUPSA Independent Electoral Commission
 * Provides responsive HTML email markup with Schema.org JSON-LD microdata,
 * inline CID-embedded styling, and dark-mode compatibility.
 */

export interface RenderVoterPassOptions {
  studentName: string;
  regNo: string;
  yearOfStudy: string;
  passwordCode: string;
  pollingStation: string;
  portalUrl: string;
}

export interface RenderResultsOptions {
  gazettedTimestamp: string;
  declarationStatement: string;
  totalVotes: number;
  totalRegistered: number;
  turnoutPct: number;
  officesSummary: Array<{
    officeTitle: string;
    winnerName: string;
    winnerVotes: number;
    winnerPct: number;
  }>;
  portalUrl: string;
}

export interface RenderCommissionNoticeOptions {
  headline: string;
  bodyText: string;
  urgency: 'routine' | 'urgent' | 'critical';
  issuedBy: string;
  portalUrl: string;
  timestamp: string;
}

/**
 * Renders the responsive HTML for the official Voter Polling Pass email
 */
export function renderVoterPassEmailHtml(data: RenderVoterPassOptions): string {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EventReservation',
    reservationNumber: `KUP-${data.regNo.replace(/[^a-zA-Z0-9]/g, '')}`,
    reservationStatus: 'https://schema.org/Confirmed',
    underName: {
      '@type': 'Person',
      name: data.studentName,
    },
    reservationFor: {
      '@type': 'Event',
      name: 'KUPSA General Elections 2026/2027',
      startDate: '2026-11-06T08:00:00+03:00',
      endDate: '2026-11-06T17:00:00+03:00',
      location: {
        '@type': 'Place',
        name: data.pollingStation,
        address: 'Kabarak University Main Campus, Nakuru, Kenya',
      },
    },
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Official KUPSA Election Voter Pass</title>
  <script type="application/ld+json">
    ${JSON.stringify(jsonLd)}
  </script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f6f2; margin: 0; padding: 24px; color: #1c1917; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e7e5e4; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
    .header { background: #0b1b3d; padding: 28px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
    .header p { margin: 6px 0 0; font-size: 12px; color: #d4a017; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; }
    .body { padding: 32px 28px; }
    .greeting { font-size: 18px; font-weight: 700; margin-bottom: 12px; color: #0b1b3d; }
    .text { font-size: 14px; line-height: 1.6; color: #44403c; margin-bottom: 20px; }
    .pass-box { background: #fafaf9; border: 2px dashed #d4a017; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
    .pass-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #78716c; margin-bottom: 8px; font-weight: 700; }
    .pass-code { font-family: 'Courier New', Courier, monospace; font-size: 28px; font-weight: 800; letter-spacing: 0.15em; color: #c2410c; background: #ffffff; padding: 10px 20px; border-radius: 8px; border: 1px solid #e7e5e4; display: inline-block; }
    .qr-container { margin: 20px 0 8px; text-align: center; }
    .qr-container img { width: 140px; height: 140px; border-radius: 8px; border: 1px solid #e7e5e4; }
    .badge { display: inline-block; padding: 4px 12px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-top: 10px; }
    .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
    .details-table td { padding: 8px 0; border-bottom: 1px solid #f0eee9; }
    .details-label { color: #78716c; width: 40%; font-weight: 500; }
    .details-val { color: #1c1917; font-weight: 600; font-family: monospace; }
    .notice-box { background: #fffbeb; border: 1px solid #fef3c7; border-radius: 10px; padding: 14px 16px; margin: 20px 0; font-size: 12px; line-height: 1.5; color: #92400e; }
    .cta-btn { display: block; text-align: center; background: #0b1b3d; color: #ffffff !important; text-decoration: none; padding: 14px 24px; border-radius: 9999px; font-weight: 700; font-size: 14px; margin-top: 24px; box-shadow: 0 2px 6px rgba(11,27,61,0.25); }
    .footer { padding: 20px 28px; background: #f5f5f4; border-top: 1px solid #e7e5e4; font-size: 12px; color: #78716c; text-align: center; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>KUPSA ELECTORAL COMMISSION</h1>
      <p>Official Student Polling Access Pass · 2026/2027</p>
    </div>
    <div class="body">
      <div class="greeting">Hello, ${data.studentName}</div>
      <p class="text">
        Your student accreditation for the <strong>2026 KUPSA General Elections</strong> has been verified. Below is your official one-time access passcode and polling check-in pass:
      </p>

      <div class="pass-box">
        <div class="pass-label">Your Secret Portal Passcode</div>
        <div class="pass-code">${data.passwordCode}</div>
        <div>
          <span class="badge">Accredited: ${data.regNo}</span>
        </div>

        <div class="qr-container">
          <img src="cid:voter-qr" alt="Voter Check-in QR Code" />
          <p style="font-size: 11px; color: #78716c; margin: 6px 0 0;">Scan at Physical Desk or Enter Online</p>
        </div>
      </div>

      <table class="details-table">
        <tr>
          <td class="details-label">Student Name:</td>
          <td class="details-val">${data.studentName}</td>
        </tr>
        <tr>
          <td class="details-label">Reg Number:</td>
          <td class="details-val">${data.regNo}</td>
        </tr>
        <tr>
          <td class="details-label">Academic Cohort:</td>
          <td class="details-val">${data.yearOfStudy}</td>
        </tr>
        <tr>
          <td class="details-label">Polling Station:</td>
          <td class="details-val">${data.pollingStation}</td>
        </tr>
      </table>

      <div class="notice-box">
        <strong>Constitutional Privacy Safeguard (Article 41):</strong><br/>
        • Your ballot is 100% secret and detached from your student registration number.<br/>
        • Once you cast your ballot, this access passcode is permanently retired.<br/>
        • A PDF copy of your polling card and an election calendar reminder are attached to this email.
      </div>

      <a href="${data.portalUrl}" class="cta-btn">Enter Voting Portal</a>
    </div>
    <div class="footer">
      Kabarak University Pharmacy Students Association (KUPSA)<br/>
      Independent Electoral Commission · Chapter Six Statutory Authority
    </div>
  </div>
</body>
</html>`;
}

/**
 * Renders the responsive HTML for the certified election results gazettement email
 */
export function renderResultsGazettementEmailHtml(data: RenderResultsOptions): string {
  const rows = data.officesSummary
    .map(
      (o) => `
      <tr style="border-bottom: 1px solid #e7e5e4;">
        <td style="padding: 12px 8px; font-weight: 600; font-size: 13px; color: #0b1b3d;">${o.officeTitle}</td>
        <td style="padding: 12px 8px; font-weight: 700; font-size: 14px; color: #c2410c;">${o.winnerName}</td>
        <td style="padding: 12px 8px; text-align: right; font-family: monospace; font-size: 13px; color: #44403c;">
          <strong>${o.winnerVotes}</strong> votes (${o.winnerPct}%)
        </td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Official KUPSA Election Results Gazettement</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f6f2; margin: 0; padding: 24px; color: #1c1917; }
    .card { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e7e5e4; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
    .header { background: #0b1b3d; padding: 28px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
    .header p { margin: 6px 0 0; font-size: 12px; color: #d4a017; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; }
    .body { padding: 32px 28px; }
    .stat-grid { display: flex; gap: 12px; margin: 20px 0; }
    .stat-card { flex: 1; background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 10px; padding: 14px; text-align: center; }
    .stat-val { font-size: 22px; font-weight: 800; color: #0b1b3d; }
    .stat-lbl { font-size: 11px; text-transform: uppercase; color: #78716c; margin-top: 4px; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    .cert-seal { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 16px; margin: 24px 0; font-size: 13px; color: #9a3412; }
    .footer { padding: 20px 28px; background: #f5f5f4; border-top: 1px solid #e7e5e4; font-size: 12px; color: #78716c; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>KUPSA ELECTORAL COMMISSION</h1>
      <p>Official Results Gazettement & Declaration · 2026/2027</p>
    </div>
    <div class="body">
      <div style="font-size: 12px; color: #78716c; margin-bottom: 8px;">Gazetted: ${data.gazettedTimestamp}</div>
      <h2 style="font-size: 18px; margin: 0 0 16px; color: #0b1b3d;">Certified Executive Leadership Outcomes</h2>

      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-val">${data.totalVotes}</div>
          <div class="stat-lbl">Votes Cast</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">${data.totalRegistered}</div>
          <div class="stat-lbl">Registered Voters</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">${data.turnoutPct}%</div>
          <div class="stat-lbl">Official Turnout</div>
        </div>
      </div>

      <div class="cert-seal">
        <strong>Commission Certification:</strong><br/>
        "${data.declarationStatement}"
      </div>

      <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #78716c; margin-top: 24px;">Office Winners Summary</h3>
      <table>
        <thead>
          <tr style="border-bottom: 2px solid #0b1b3d; text-align: left;">
            <th style="padding: 8px; font-size: 11px; text-transform: uppercase; color: #78716c;">Office</th>
            <th style="padding: 8px; font-size: 11px; text-transform: uppercase; color: #78716c;">Elected Candidate</th>
            <th style="padding: 8px; font-size: 11px; text-transform: uppercase; color: #78716c; text-align: right;">Tallies</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <div style="text-align: center; margin-top: 28px;">
        <a href="${data.portalUrl}" style="display: inline-block; background: #0b1b3d; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-weight: 700; font-size: 13px;">View Live Results Portal</a>
      </div>
    </div>
    <div class="footer">
      Kabarak University Pharmacy Students Association (KUPSA)<br/>
      Supervised under the Dean of Pharmacy & Returning Officers
    </div>
  </div>
</body>
</html>`;
}

/**
 * Renders the responsive HTML for a Commission Official Gazette Notice
 */
export function renderCommissionNoticeEmailHtml(data: RenderCommissionNoticeOptions): string {
  const badgeColor =
    data.urgency === 'critical' ? '#dc2626' : data.urgency === 'urgent' ? '#ea580c' : '#2563eb';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KUPSA Electoral Commission Gazette Notice</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f6f2; margin: 0; padding: 24px; color: #1c1917; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e7e5e4; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
    .header { background: #0b1b3d; padding: 28px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
    .header p { margin: 6px 0 0; font-size: 12px; color: #d4a017; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; }
    .body { padding: 32px 28px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #ffffff; background-color: ${badgeColor}; margin-bottom: 16px; }
    .headline { font-size: 20px; font-weight: 700; color: #0b1b3d; margin: 0 0 16px; line-height: 1.3; }
    .content { font-size: 14px; line-height: 1.7; color: #44403c; white-space: pre-line; }
    .signoff { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-size: 12px; color: #78716c; }
    .cta-btn { display: inline-block; background: #0b1b3d; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-weight: 700; font-size: 13px; margin-top: 20px; }
    .footer { padding: 20px 28px; background: #f5f5f4; border-top: 1px solid #e7e5e4; font-size: 12px; color: #78716c; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>KUPSA ELECTORAL COMMISSION</h1>
      <p>Official Statutory Gazette Notice · 2026</p>
    </div>
    <div class="body">
      <div><span class="badge">${data.urgency.toUpperCase()} NOTICE</span></div>
      <h2 class="headline">${data.headline}</h2>
      <div class="content">${data.bodyText}</div>

      <div class="signoff">
        <strong>Issued by:</strong> ${data.issuedBy}<br/>
        <strong>Date & Time:</strong> ${data.timestamp}
      </div>

      <div style="text-align: center;">
        <a href="${data.portalUrl}" class="cta-btn">Open Electoral Portal</a>
      </div>
    </div>
    <div class="footer">
      Kabarak University Pharmacy Students Association (KUPSA)<br/>
      Independent Electoral Commission · Chapter Six Statutory Authority
    </div>
  </div>
</body>
</html>`;
}
