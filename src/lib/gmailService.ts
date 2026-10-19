import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Auth Provider with requested Gmail scopes
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://mail.google.com/');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.compose');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');

// In-memory token storage (NEVER stored in localStorage or sessionStorage per security guidelines)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface GmailUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  senderName?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Initialize Auth State Listener
 */
export const initGmailAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

/**
 * Google Sign In with Gmail Scopes
 */
export const signInWithGoogleGmail = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve OAuth access token from Google');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Gmail Sign In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Get current in-memory access token
 */
export const getGmailAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Set in-memory token directly (if provided via auth hook)
 */
export const setCachedGmailAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

/**
 * Sign out from Google Auth
 */
export const logoutGmail = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Helper to encode UTF-8 string to Base64URL (RFC 4648)
 */
function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Build RFC 2822 email string
 */
function buildRFC2822Message({
  to,
  subject,
  htmlBody,
  textBody,
  senderName = 'KUPSA Electoral Commission',
}: SendEmailParams): string {
  const boundary = `__boundary_${Date.now().toString(16)}__`;
  const cleanSubject = subject.replace(/[\r\n]/g, ' ');

  const headers = [
    `To: ${to}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(cleanSubject)))}?=`,
    `From: "${senderName}" <me>`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ];

  const plain = textBody || htmlBody.replace(/<[^>]+>/g, '');

  const bodyParts = [
    `--${boundary}`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: 7bit`,
    '',
    plain,
    '',
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: 7bit`,
    '',
    htmlBody,
    '',
    `--${boundary}--`,
  ];

  return [...headers, '', ...bodyParts].join('\r\n');
}

/**
 * Send an email directly via the official Gmail API
 */
export const sendEmailViaGmail = async (
  params: SendEmailParams
): Promise<SendEmailResult> => {
  const token = await getGmailAccessToken();
  if (!token) {
    return {
      success: false,
      error: 'Gmail account not connected. Please connect your Google account with Gmail permission.',
    };
  }

  try {
    const rawRfcMessage = buildRFC2822Message(params);
    const base64UrlMessage = toBase64Url(rawRfcMessage);

    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: base64UrlMessage,
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.error?.message || response.statusText;
      return {
        success: false,
        error: `Gmail API Error (${response.status}): ${errMsg}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.id,
    };
  } catch (err: any) {
    console.error('Failed to send email via Gmail:', err);
    return {
      success: false,
      error: err.message || 'An unexpected error occurred while contacting Gmail API.',
    };
  }
};

/**
 * Branded HTML template for voter authentication credentials
 */
export function generateVoterAuthEmailHtml({
  studentName,
  recipientEmail,
  password,
  yearOfStudy,
}: {
  studentName: string;
  recipientEmail: string;
  password: string;
  yearOfStudy: string;
}): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your KUPSA Election Portal Password</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f6f2; margin: 0; padding: 24px; color: #1c1917; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e7e5e4; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .header { background: #12100e; padding: 28px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
    .header p { margin: 6px 0 0; font-size: 13px; color: #a8a29e; text-transform: uppercase; letter-spacing: 0.08em; }
    .body { padding: 32px 28px; }
    .greeting { font-size: 18px; font-weight: 600; margin-bottom: 12px; }
    .text { font-size: 14px; line-height: 1.6; color: #44403c; margin-bottom: 20px; }
    .credential-box { background: #fafaf9; border: 2px dashed #d6d3d1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
    .credential-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #78716c; margin-bottom: 8px; font-weight: 600; }
    .password-code { font-family: monospace; font-size: 26px; font-weight: 800; letter-spacing: 0.15em; color: #ea580c; background: #ffffff; padding: 10px 18px; border-radius: 8px; border: 1px solid #e7e5e4; display: inline-block; }
    .badge { display: inline-block; padding: 4px 10px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-top: 10px; }
    .cta-btn { display: block; text-align: center; background: #12100e; color: #ffffff !important; text-decoration: none; padding: 14px 24px; border-radius: 9999px; font-weight: 600; font-size: 14px; margin-top: 24px; }
    .footer { padding: 20px 28px; background: #f5f5f4; border-top: 1px solid #e7e5e4; font-size: 12px; color: #78716c; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>KUPSA Electoral Commission</h1>
      <p>Official Student Polling Access Pass · 2026</p>
    </div>
    <div class="body">
      <div class="greeting">Hello, ${studentName}</div>
      <p class="text">
        Your student accreditation for the <strong>2026 KUPSA General Elections</strong> has been verified for <strong>${yearOfStudy}</strong>. Below is your official one-time access password to enter the voting portal:
      </p>

      <div class="credential-box">
        <div class="credential-label">Your Secret Portal Password</div>
        <div class="password-code">${password}</div>
        <div>
          <span class="badge">Accredited: ${recipientEmail}</span>
        </div>
      </div>

      <p class="text" style="font-size: 13px; color: #78716c;">
        <strong>Important Security Advice:</strong><br/>
        • Your ballot is 100% secret and protected by statutory cryptographic isolation.<br/>
        • Once you cast your ballot, this account will be permanently locked from voting again.<br/>
        • Do not share this passkey with anyone.
      </p>

      <a href="https://verve.n.co/auth" class="cta-btn">Enter Voting Portal</a>
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
 * Branded HTML template for official results broadcast
 */
export function generateResultsBroadcastEmailHtml({
  totalVotes,
  totalRegistered,
  turnoutPct,
  declarationStatement,
  officesSummary,
  timestamp,
}: {
  totalVotes: number;
  totalRegistered: number;
  turnoutPct: number;
  declarationStatement: string;
  officesSummary: Array<{
    officeTitle: string;
    winnerName: string;
    winnerVotes: number;
    winnerPct: number;
  }>;
  timestamp: string;
}): string {
  const summaryRows = officesSummary
    .map(
      (o) => `
      <tr style="border-bottom: 1px solid #e7e5e4;">
        <td style="padding: 12px 8px; font-weight: 600; font-size: 13px; color: #1c1917;">${o.officeTitle}</td>
        <td style="padding: 12px 8px; font-weight: 700; font-size: 14px; color: #ea580c;">${o.winnerName}</td>
        <td style="padding: 12px 8px; text-align: right; font-family: monospace; font-size: 13px; color: #44403c;">
          ${o.winnerVotes} votes (${o.winnerPct}%)
        </td>
      </tr>
    `
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Official KUPSA 2026 Election Results Declaration</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f6f2; margin: 0; padding: 24px; color: #1c1917; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e7e5e4; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .header { background: #12100e; padding: 28px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
    .header p { margin: 6px 0 0; font-size: 12px; color: #ea580c; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; }
    .body { padding: 32px 28px; }
    .stat-grid { display: flex; gap: 12px; margin: 20px 0; }
    .stat-card { flex: 1; background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 10px; padding: 14px; text-align: center; }
    .stat-val { font-size: 22px; font-weight: 800; color: #1c1917; }
    .stat-lbl { font-size: 11px; text-transform: uppercase; color: #78716c; margin-top: 4px; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    .cert-seal { background: #fff7ed; border: 1px solid #ffedd5; border-radius: 12px; padding: 16px; margin: 24px 0; font-size: 13px; color: #9a3412; }
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
      <div style="font-size: 14px; color: #78716c; margin-bottom: 8px;">Gazetted: ${timestamp}</div>
      <h2 style="font-size: 18px; margin: 0 0 16px;">Certified Executive Leadership Outcomes</h2>

      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-val">${totalVotes}</div>
          <div class="stat-lbl">Votes Cast</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">${totalRegistered}</div>
          <div class="stat-lbl">Registered Voters</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">${turnoutPct}%</div>
          <div class="stat-lbl">Official Turnout</div>
        </div>
      </div>

      <div class="cert-seal">
        <strong>Commission Certification:</strong><br/>
        "${declarationStatement}"
      </div>

      <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #78716c; margin-top: 24px;">Office Winners Summary</h3>
      <table>
        <thead>
          <tr style="border-bottom: 2px solid #1c1917; text-align: left;">
            <th style="padding: 8px; font-size: 11px; text-transform: uppercase; color: #78716c;">Office</th>
            <th style="padding: 8px; font-size: 11px; text-transform: uppercase; color: #78716c;">Elected Candidate</th>
            <th style="padding: 8px; font-size: 11px; text-transform: uppercase; color: #78716c; text-align: right;">Tallies</th>
          </tr>
        </thead>
        <tbody>
          ${summaryRows}
        </tbody>
      </table>

      <div style="text-align: center; margin-top: 28px;">
        <a href="https://verve.n.co/results" style="display: inline-block; background: #12100e; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-weight: 600; font-size: 13px;">View Full Official Results Portal</a>
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
