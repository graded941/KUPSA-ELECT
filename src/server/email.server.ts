import nodemailer, { Transporter } from 'nodemailer';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import dotenv from 'dotenv';

dotenv.config();

export interface SmtpCredentials {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

export interface VoterPassPayload {
  to: string;
  studentName: string;
  regNo: string;
  yearOfStudy: string;
  passwordCode: string;
  pollingStation?: string;
  portalUrl?: string;
}

export interface ElectionResultsPayload {
  to: string;
  recipientName?: string;
  declarationStatement: string;
  officesSummary: Array<{
    officeTitle: string;
    winnerName: string;
    winnerVotes: number;
    winnerPct: number;
  }>;
  totalVotes: number;
  totalRegistered: number;
  turnoutPct: number;
  gazettedTimestamp: string;
  portalUrl?: string;
}

/**
 * Resolves SMTP credentials from environment variables.
 * Automatically cleans all whitespace/spaces from Google App Passwords.
 */
export function resolveSmtpCredentials(): SmtpCredentials | null {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  // Accept multiple environment variable aliases
  const rawUser = process.env.SMTP_USER || process.env.GMAIL_USER || '';
  const rawPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '';
  const rawFrom = process.env.EMAIL_FROM || `"KUPSA Electoral Commission" <${rawUser.trim()}>`;

  if (!rawUser.trim() || !rawPass.trim()) {
    return null;
  }

  return {
    host: host.trim(),
    port,
    secure,
    user: rawUser.trim(),
    // Clean all internal and trailing spaces from 16-character Google App Password
    pass: rawPass.replace(/\s+/g, ''),
    from: rawFrom.trim(),
  };
}

let cachedTransporter: Transporter | null = null;

export function getSmtpTransporter(): Transporter | null {
  const creds = resolveSmtpCredentials();
  if (!creds) return null;

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: creds.host,
      port: creds.port,
      secure: creds.secure, // true for 465 (SSL), false for 587 (STARTTLS)
      auth: {
        user: creds.user,
        pass: creds.pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 15000,
    });
  }

  return cachedTransporter;
}

/**
 * Generates an RFC 5545 iCalendar (.ics) string for Polling Day
 */
export function generateElectionCalendarInvite(params: {
  eventTitle: string;
  description: string;
  location: string;
  startUtc: string; // e.g. "20261106T050000Z" (8:00 AM EAT)
  endUtc: string;   // e.g. "20261106T140000Z" (5:00 PM EAT)
}): string {
  const nowUtc = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const uid = `kupsa-election-2026-${Date.now()}@kabarak.ac.ke`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//KUPSA Independent Electoral Commission//Elections Portal//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART:${params.startUtc}`,
    `DTEND:${params.endUtc}`,
    `SUMMARY:${params.eventTitle}`,
    `DESCRIPTION:${params.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${params.location}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'BEGIN:VALARM',
    'TRIGGER:-P1D', // 24 hours prior
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: KUPSA General Polling Opens in 24 Hours',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Generates an official PDF Voter Polling Card (Voter-Pass-[REG].pdf) using jsPDF
 */
export async function generateVoterPassPdf(data: {
  studentName: string;
  regNo: string;
  yearOfStudy: string;
  passwordCode: string;
  pollingStation: string;
}): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [148, 105], // A6 Card size
  });

  // Background Header
  doc.setFillColor(11, 27, 61); // Obsidian / Navy
  doc.rect(0, 0, 105, 28, 'F');

  // Gold accent bar
  doc.setFillColor(212, 160, 23); // Sun Gold
  doc.rect(0, 28, 105, 2, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('KUPSA ELECTORAL COMMISSION', 52.5, 11, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(212, 160, 23);
  doc.text('OFFICIAL VOTER POLLING PASS · 2026', 52.5, 17, { align: 'center' });
  doc.setTextColor(220, 220, 220);
  doc.text('Chapter Six Statutory Accreditation', 52.5, 22, { align: 'center' });

  // Body content
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('ACCREDITED STUDENT DETAILS', 12, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Full Name:  ${data.studentName}`, 12, 45);
  doc.text(`Reg Number: ${data.regNo}`, 12, 51);
  doc.text(`Cohort:     ${data.yearOfStudy}`, 12, 57);
  doc.text(`Station:    ${data.pollingStation}`, 12, 63);

  // Secret Password Box
  doc.setFillColor(247, 246, 242);
  doc.setDrawColor(212, 160, 23);
  doc.roundedRect(12, 70, 81, 20, 3, 3, 'FD');

  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('ONE-TIME VOTING PORTAL PASSCODE', 52.5, 76, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('courier', 'bold');
  doc.setTextColor(194, 65, 12); // Deep Amber
  doc.text(data.passwordCode, 52.5, 84, { align: 'center' });

  // Security Note
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(110, 110, 110);
  doc.text('Present this pass or your credentials at the polling desk.', 52.5, 96, { align: 'center' });
  doc.text('Ballot selections are 100% secret under Article 41(3).', 52.5, 100, { align: 'center' });

  // Footer bar
  doc.setFillColor(240, 240, 240);
  doc.rect(0, 140, 105, 8, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(120, 120, 120);
  doc.text('Kabarak University Pharmacy Students Association · Verified Roll', 52.5, 145, { align: 'center' });

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}

/**
 * Dispatch an official Voter Passcard Email with:
 * 1. Branded responsive HTML
 * 2. Inline CID-embedded QR code (barcode verification at polling desk)
 * 3. Attached PDF Voter Card (Voter-Pass-[REG].pdf)
 * 4. Attached RFC 5545 iCalendar invite with 24-hr VALARM
 * 5. Schema.org JSON-LD EventReservation for native card display in Gmail
 */
export async function sendVoterPassEmail(payload: VoterPassPayload): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const creds = resolveSmtpCredentials();
  const transporter = getSmtpTransporter();

  if (!creds || !transporter) {
    return {
      success: false,
      error: 'SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS in .env.',
    };
  }

  try {
    const portalUrl = payload.portalUrl || process.env.SITE_URL || 'https://kabarak.ac.ke';
    const pollingStation = payload.pollingStation || 'School of Pharmacy Complex, Kabarak University';

    // 1. Generate QR Code Buffer for inline CID embedding
    const qrData = `KUPSA-VOTER:${payload.regNo}:${payload.passwordCode}`;
    const qrBuffer = await QRCode.toBuffer(qrData, {
      width: 260,
      margin: 1,
      color: { dark: '#0B1B3D', light: '#FFFFFF' },
    });

    // 2. Generate PDF Voter Card Pass
    const pdfBuffer = await generateVoterPassPdf({
      studentName: payload.studentName,
      regNo: payload.regNo,
      yearOfStudy: payload.yearOfStudy,
      passwordCode: payload.passwordCode,
      pollingStation,
    });

    // 3. Generate iCalendar RFC 5545 Invite
    const icsContent = generateElectionCalendarInvite({
      eventTitle: 'KUPSA General Elections 2026/2027',
      description: `Official student polling for the Kabarak University Pharmacy Students Association. Your Voter Passcode is ${payload.passwordCode}.`,
      location: pollingStation,
      startUtc: '20261106T050000Z', // 08:00 EAT
      endUtc: '20261106T140000Z',   // 17:00 EAT
    });

    // 4. Schema.org JSON-LD microdata for interactive Gmail card
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'EventReservation',
      reservationNumber: `KUP-${payload.regNo.replace(/[^a-zA-Z0-9]/g, '')}`,
      reservationStatus: 'https://schema.org/Confirmed',
      underName: {
        '@type': 'Person',
        name: payload.studentName,
      },
      reservationFor: {
        '@type': 'Event',
        name: 'KUPSA General Elections 2026/2027',
        startDate: '2026-11-06T08:00:00+03:00',
        endDate: '2026-11-06T17:00:00+03:00',
        location: {
          '@type': 'Place',
          name: pollingStation,
          address: 'Kabarak University Main Campus, Nakuru, Kenya',
        },
      },
    };

    // 5. Build Multipart HTML Body
    const cleanRegCode = payload.regNo.replace(/[^a-zA-Z0-9]/g, '-');
    const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Official KUPSA Election Voter Pass</title>
  <script type="application/ld+json">
    ${JSON.stringify(jsonLd)}
  </script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f6f2; margin: 0; padding: 24px; color: #1c1917; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e7e5e4; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .header { background: #0b1b3d; padding: 28px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
    .header p { margin: 6px 0 0; font-size: 13px; color: #d4a017; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; }
    .body { padding: 32px 28px; }
    .greeting { font-size: 18px; font-weight: 600; margin-bottom: 12px; color: #0b1b3d; }
    .text { font-size: 14px; line-height: 1.6; color: #44403c; margin-bottom: 20px; }
    .pass-box { background: #fafaf9; border: 2px dashed #d4a017; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
    .pass-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #78716c; margin-bottom: 8px; font-weight: 600; }
    .pass-code { font-family: monospace; font-size: 28px; font-weight: 800; letter-spacing: 0.15em; color: #c2410c; background: #ffffff; padding: 10px 20px; border-radius: 8px; border: 1px solid #e7e5e4; display: inline-block; }
    .qr-container { margin: 20px 0 8px; text-align: center; }
    .qr-container img { width: 140px; height: 140px; border-radius: 8px; border: 1px solid #e7e5e4; }
    .badge { display: inline-block; padding: 4px 12px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-top: 10px; }
    .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
    .details-table td { padding: 8px 0; border-bottom: 1px solid #f0eee9; }
    .details-label { color: #78716c; width: 40%; font-weight: 500; }
    .details-val { color: #1c1917; font-weight: 600; font-family: monospace; }
    .cta-btn { display: block; text-align: center; background: #0b1b3d; color: #ffffff !important; text-decoration: none; padding: 14px 24px; border-radius: 9999px; font-weight: 600; font-size: 14px; margin-top: 24px; }
    .footer { padding: 20px 28px; background: #f5f5f4; border-top: 1px solid #e7e5e4; font-size: 12px; color: #78716c; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>KUPSA Electoral Commission</h1>
      <p>Official Student Polling Access Pass · 2026/2027</p>
    </div>
    <div class="body">
      <div class="greeting">Hello, ${payload.studentName}</div>
      <p class="text">
        Your student accreditation for the <strong>2026 KUPSA General Elections</strong> has been verified. Below is your official one-time access passcode and polling check-in pass:
      </p>

      <div class="pass-box">
        <div class="pass-label">Your Secret Portal Password</div>
        <div class="pass-code">${payload.passwordCode}</div>
        <div>
          <span class="badge">Accredited: ${payload.regNo}</span>
        </div>

        <div class="qr-container">
          <img src="cid:voter-qr" alt="Voter Check-in QR Code" />
          <p style="font-size: 11px; color: #78716c; margin: 6px 0 0;">Scan at Physical Desk or Enter Online</p>
        </div>
      </div>

      <table class="details-table">
        <tr>
          <td class="details-label">Student Name:</td>
          <td class="details-val">${payload.studentName}</td>
        </tr>
        <tr>
          <td class="details-label">Reg Number:</td>
          <td class="details-val">${payload.regNo}</td>
        </tr>
        <tr>
          <td class="details-label">Academic Cohort:</td>
          <td class="details-val">${payload.yearOfStudy}</td>
        </tr>
        <tr>
          <td class="details-label">Polling Station:</td>
          <td class="details-val">${pollingStation}</td>
        </tr>
      </table>

      <p class="text" style="font-size: 13px; color: #78716c;">
        <strong>Constitutional Privacy Notice:</strong><br/>
        • Your ballot is 100% secret and detached from your student identity under Article 41(3).<br/>
        • Once you cast your ballot, this access passcode is permanently sealed.<br/>
        • A PDF copy of your polling card and an election calendar reminder are attached to this email.
      </p>

      <a href="${portalUrl}" class="cta-btn">Enter Voting Portal</a>
    </div>
    <div class="footer">
      Kabarak University Pharmacy Students Association (KUPSA)<br/>
      Independent Electoral Commission · Chapter Six Statutory Authority
    </div>
  </div>
</body>
</html>`;

    // 6. Send Mail via Nodemailer Transporter
    const info = await transporter.sendMail({
      from: creds.from,
      to: payload.to,
      subject: `Official KUPSA Election Voter Pass — ${payload.studentName} (${payload.regNo})`,
      html: htmlBody,
      text: `Hello ${payload.studentName},\n\nYour KUPSA General Election passcode is: ${payload.passwordCode}\nReg Number: ${payload.regNo}\nCohort: ${payload.yearOfStudy}\nStation: ${pollingStation}\n\nLogin at: ${portalUrl}`,
      attachments: [
        {
          filename: 'voter-checkin-qr.png',
          content: qrBuffer,
          cid: 'voter-qr', // matches <img src="cid:voter-qr" />
        },
        {
          filename: `Voter-Pass-${cleanRegCode}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
        {
          filename: 'KUPSA-Polling-Day.ics',
          content: Buffer.from(icsContent, 'utf-8'),
          contentType: 'text/calendar; charset=utf-8; method=REQUEST',
        },
      ],
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error('Error dispatching voter pass email:', error);
    return {
      success: false,
      error: error.message || 'SMTP dispatch failed',
    };
  }
}

/**
 * Dispatch an official Certified Election Results Gazettement Bulletin
 */
export async function sendElectionResultsEmail(payload: ElectionResultsPayload): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const creds = resolveSmtpCredentials();
  const transporter = getSmtpTransporter();

  if (!creds || !transporter) {
    return {
      success: false,
      error: 'SMTP credentials not configured.',
    };
  }

  try {
    const portalUrl = payload.portalUrl || process.env.SITE_URL || 'https://kabarak.ac.ke';

    const rows = payload.officesSummary
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

    const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Official KUPSA Election Results Gazettement</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f6f2; margin: 0; padding: 24px; color: #1c1917; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e7e5e4; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .header { background: #0b1b3d; padding: 28px; text-align: center; color: #ffffff; }
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
      <h1>KUPSA Electoral Commission</h1>
      <p>Official Results Gazettement & Declaration · 2026</p>
    </div>
    <div class="body">
      <div style="font-size: 13px; color: #78716c; margin-bottom: 8px;">Gazetted: ${payload.gazettedTimestamp}</div>
      <h2 style="font-size: 18px; margin: 0 0 16px; color: #0b1b3d;">Certified Executive Leadership Outcomes</h2>

      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-val">${payload.totalVotes}</div>
          <div class="stat-lbl">Votes Cast</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">${payload.totalRegistered}</div>
          <div class="stat-lbl">Registered Voters</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">${payload.turnoutPct}%</div>
          <div class="stat-lbl">Official Turnout</div>
        </div>
      </div>

      <div class="cert-seal">
        <strong>Commission Certification:</strong><br/>
        "${payload.declarationStatement}"
      </div>

      <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #78716c; margin-top: 24px;">Office Winners Summary</h3>
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
        <a href="${portalUrl}" style="display: inline-block; background: #0b1b3d; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-weight: 600; font-size: 13px;">View Live Results Portal</a>
      </div>
    </div>
    <div class="footer">
      Kabarak University Pharmacy Students Association (KUPSA)<br/>
      Supervised under the Dean of Pharmacy & Returning Officers
    </div>
  </div>
</body>
</html>`;

    const info = await transporter.sendMail({
      from: creds.from,
      to: payload.to,
      subject: `Official Certified KUPSA Election Results Gazettement — 2026/2027`,
      html: htmlBody,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error('Error sending election results email:', error);
    return {
      success: false,
      error: error.message || 'SMTP results dispatch failed',
    };
  }
}

export interface CommissionNoticePayload {
  to: string;
  headline: string;
  bodyText: string;
  urgency?: 'routine' | 'urgent' | 'critical';
  issuedBy?: string;
  portalUrl?: string;
}

/**
 * Dispatch an official Commission Statutory Gazette Bulletin
 */
export async function sendCommissionNoticeEmail(payload: CommissionNoticePayload): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const creds = resolveSmtpCredentials();
  const transporter = getSmtpTransporter();

  if (!creds || !transporter) {
    return {
      success: false,
      error: 'SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS in .env.',
    };
  }

  try {
    const portalUrl = payload.portalUrl || process.env.SITE_URL || 'https://kabarak.ac.ke';
    const urgency = payload.urgency || 'urgent';
    const badgeColor = urgency === 'critical' ? '#dc2626' : urgency === 'urgent' ? '#ea580c' : '#2563eb';
    const issuedBy = payload.issuedBy || 'KUPSA Independent Electoral Commission';
    const timestamp = new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' }) + ' EAT';

    const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>KUPSA Electoral Commission Gazette Notice</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f6f2; margin: 0; padding: 24px; color: #1c1917; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e7e5e4; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .header { background: #0b1b3d; padding: 28px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; }
    .header p { margin: 6px 0 0; font-size: 12px; color: #d4a017; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; }
    .body { padding: 32px 28px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #ffffff; background-color: ${badgeColor}; margin-bottom: 16px; }
    .headline { font-size: 20px; font-weight: 700; color: #0b1b3d; margin: 0 0 16px; }
    .content { font-size: 14px; line-height: 1.6; color: #44403c; white-space: pre-line; }
    .signoff { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-size: 12px; color: #78716c; }
    .cta-btn { display: inline-block; background: #0b1b3d; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-weight: 600; font-size: 13px; margin-top: 20px; }
    .footer { padding: 20px 28px; background: #f5f5f4; border-top: 1px solid #e7e5e4; font-size: 12px; color: #78716c; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>KUPSA Electoral Commission</h1>
      <p>Official Statutory Gazette Notice · 2026</p>
    </div>
    <div class="body">
      <div><span class="badge">${urgency.toUpperCase()} NOTICE</span></div>
      <h2 class="headline">${payload.headline}</h2>
      <div class="content">${payload.bodyText}</div>

      <div class="signoff">
        <strong>Issued by:</strong> ${issuedBy}<br/>
        <strong>Date & Time:</strong> ${timestamp}
      </div>

      <div style="text-align: center;">
        <a href="${portalUrl}" class="cta-btn">Open Electoral Portal</a>
      </div>
    </div>
    <div class="footer">
      Kabarak University Pharmacy Students Association (KUPSA)<br/>
      Independent Electoral Commission · Chapter Six Statutory Authority
    </div>
  </div>
</body>
</html>`;

    const info = await transporter.sendMail({
      from: creds.from,
      to: payload.to,
      subject: `[KUPSA Election Gazette] ${payload.headline}`,
      html: htmlBody,
      text: `${payload.headline}\n\n${payload.bodyText}\n\nIssued by: ${issuedBy}\nVisit portal: ${portalUrl}`,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error('Error sending commission notice email:', error);
    return {
      success: false,
      error: error.message || 'SMTP notice dispatch failed',
    };
  }
}

/**
 * Diagnostic tool to verify SMTP connection status
 */
export async function verifySmtpConnection(): Promise<{ success: boolean; message: string; user?: string; host?: string; port?: number }> {
  const creds = resolveSmtpCredentials();
  if (!creds) {
    return {
      success: false,
      message: 'SMTP credentials missing. Please set SMTP_USER and SMTP_PASS in .env.',
    };
  }

  const transporter = getSmtpTransporter();
  if (!transporter) {
    return {
      success: false,
      message: 'Failed to instantiate SMTP transporter.',
    };
  }

  try {
    await transporter.verify();
    return {
      success: true,
      message: `SMTP connection established successfully to ${creds.host}:${creds.port} as ${creds.user}.`,
      user: creds.user,
      host: creds.host,
      port: creds.port,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `SMTP verification failed: ${err.message}`,
      user: creds.user,
      host: creds.host,
      port: creds.port,
    };
  }
}

