import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  auth,
  signInWithGoogleGmail,
  logoutGmail,
  sendEmailViaGmail,
  generateVoterAuthEmailHtml,
  generateResultsBroadcastEmailHtml,
  setCachedGmailAccessToken,
  getGmailAccessToken,
} from '../lib/gmailService';

interface GmailContextType {
  isGmailConnected: boolean;
  googleUser: User | null;
  isConnecting: boolean;
  lastSentMessageId: string | null;
  lastSendError: string | null;
  connectGmail: () => Promise<boolean>;
  disconnectGmail: () => Promise<void>;
  sendPasswordEmail: (params: {
    studentName: string;
    recipientEmail: string;
    password: string;
    yearOfStudy: string;
  }) => Promise<{ success: boolean; error?: string; messageId?: string }>;
  sendBroadcastResults: (params: {
    recipients: string[];
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
    timestamp: string;
  }) => Promise<{ successCount: number; failureCount: number; errors: string[] }>;
}

const GmailContext = createContext<GmailContextType | undefined>(undefined);

export function GmailProvider({ children }: { children: React.ReactNode }) {
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastSentMessageId, setLastSentMessageId] = useState<string | null>(null);
  const [lastSendError, setLastSendError] = useState<string | null>(null);

  // Sync auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setGoogleUser(user);
      if (!user) {
        setCachedGmailAccessToken(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const connectGmail = async (): Promise<boolean> => {
    setIsConnecting(true);
    setLastSendError(null);
    try {
      const res = await signInWithGoogleGmail();
      if (res) {
        setGoogleUser(res.user);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Failed to authenticate with Google Gmail:', err);
      setLastSendError(err.message || 'Authentication failed');
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectGmail = async (): Promise<void> => {
    await logoutGmail();
    setGoogleUser(null);
    setLastSentMessageId(null);
    setLastSendError(null);
  };

  const sendPasswordEmail = async ({
    studentName,
    recipientEmail,
    password,
    yearOfStudy,
  }: {
    studentName: string;
    recipientEmail: string;
    password: string;
    yearOfStudy: string;
  }) => {
    setLastSendError(null);

    const token = await getGmailAccessToken();
    if (!token) {
      return {
        success: false,
        error: 'Commission Gmail account not connected. Connect Gmail to send actual emails.',
      };
    }

    const htmlBody = generateVoterAuthEmailHtml({
      studentName,
      recipientEmail,
      password,
      yearOfStudy,
    });

    const subject = `Your KUPSA Election Portal Access Password [${password}]`;

    const result = await sendEmailViaGmail({
      to: recipientEmail,
      subject,
      htmlBody,
      senderName: 'KUPSA Electoral Commission',
    });

    if (result.success) {
      setLastSentMessageId(result.messageId || 'sent');
      return { success: true, messageId: result.messageId };
    } else {
      setLastSendError(result.error || 'Failed to dispatch email');
      return { success: false, error: result.error };
    }
  };

  const sendBroadcastResults = async ({
    recipients,
    declarationStatement,
    officesSummary,
    totalVotes,
    totalRegistered,
    turnoutPct,
    timestamp,
  }: {
    recipients: string[];
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
    timestamp: string;
  }) => {
    setLastSendError(null);
    const token = await getGmailAccessToken();
    if (!token) {
      return {
        successCount: 0,
        failureCount: recipients.length,
        errors: ['Gmail account not connected. Please authenticate with Gmail first.'],
      };
    }

    const htmlBody = generateResultsBroadcastEmailHtml({
      totalVotes,
      totalRegistered,
      turnoutPct,
      declarationStatement,
      officesSummary,
      timestamp,
    });

    const subject = `OFFICIAL GAZETTEMENT: 2026 KUPSA Election Certified Results`;

    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    // Send emails sequentially or in small controlled batches to respect rate limits
    for (const recipient of recipients) {
      try {
        const res = await sendEmailViaGmail({
          to: recipient,
          subject,
          htmlBody,
          senderName: 'KUPSA Electoral Commission',
        });
        if (res.success) {
          successCount++;
        } else {
          failureCount++;
          if (res.error) errors.push(`${recipient}: ${res.error}`);
        }
      } catch (err: any) {
        failureCount++;
        errors.push(`${recipient}: ${err.message}`);
      }
    }

    return {
      successCount,
      failureCount,
      errors,
    };
  };

  return (
    <GmailContext.Provider
      value={{
        isGmailConnected: !!googleUser,
        googleUser,
        isConnecting,
        lastSentMessageId,
        lastSendError,
        connectGmail,
        disconnectGmail,
        sendPasswordEmail,
        sendBroadcastResults,
      }}
    >
      {children}
    </GmailContext.Provider>
  );
}

export function useGmail() {
  const context = useContext(GmailContext);
  if (!context) {
    throw new Error('useGmail must be used within a GmailProvider');
  }
  return context;
}
