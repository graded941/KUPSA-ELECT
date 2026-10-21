import { SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import {
  sendVoterPassEmail,
  sendElectionResultsEmail,
  sendCommissionNoticeEmail,
  VoterPassPayload,
  ElectionResultsPayload,
  CommissionNoticePayload,
  resolveSmtpCredentials,
} from './email.server';

export interface OutboxMessage {
  id: string;
  dedupe_key?: string | null;
  channel: 'email' | 'whatsapp';
  notification_type: 'voter_pass' | 'results_broadcast' | 'custom_notice' | 'commission_notice';
  recipient: string;
  payload: any;
  status: 'queued' | 'processing' | 'accepted' | 'failed';
  attempts: number;
  provider_message_id?: string | null;
  provider_status?: string | null;
  provider_response?: any;
  last_error?: string | null;
  available_at: string;
  locked_at?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Calculates exponential backoff delay in seconds for retry attempts
 */
export function notificationRetryDelaySeconds(attempt: number): number {
  return Math.min(3600, 30 * 2 ** Math.min(7, Math.max(0, attempt - 1)));
}

export class NotificationOutbox {
  private static supabaseAdmin: SupabaseClient | null = null;

  public static init(supabaseClient: SupabaseClient | null) {
    this.supabaseAdmin = supabaseClient;
  }

  /**
   * Enqueue a notification with deduplication, and immediately attempt dispatch.
   * Guarantees that critical database operations are never delayed or rolled back.
   */
  public static async enqueueAndDispatch(
    params: {
      channel: 'email' | 'whatsapp';
      type: 'voter_pass' | 'results_broadcast' | 'custom_notice' | 'commission_notice';
      recipient: string;
      payload: VoterPassPayload | ElectionResultsPayload | CommissionNoticePayload | any;
    },
    dedupeKey?: string
  ): Promise<{ success: boolean; outboxId: string; messageId?: string; directFallback?: boolean; error?: string }> {
    const outboxId = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    // 1. If Supabase admin client is available, try inserting into notification_outbox table
    let tableExists = false;
    if (this.supabaseAdmin) {
      try {
        const { error } = await this.supabaseAdmin.from('notification_outbox').insert({
          id: outboxId,
          dedupe_key: dedupeKey || `kupsa:${params.type}:${params.recipient}:${Date.now()}`,
          channel: params.channel,
          notification_type: params.type,
          recipient: params.recipient,
          payload: params.payload,
          status: 'queued',
          attempts: 0,
          available_at: nowIso,
          created_at: nowIso,
          updated_at: nowIso,
        });

        if (!error) {
          tableExists = true;
        } else if (error.code === '23505') {
          // Unique violation (dedupe key already processed)
          console.log(`[NotificationOutbox] Dedupe key already exists: ${dedupeKey}. Skipping duplicate.`);
          return { success: true, outboxId: 'deduped', messageId: 'already_enqueued' };
        } else {
          // Table doesn't exist (e.g. 42P01 or PGRST205)
          console.warn(`[NotificationOutbox] Notice: outbox table not yet created in Supabase (${error.message}). Executing direct authoritative SMTP dispatch.`);
        }
      } catch (err: any) {
        console.warn(`[NotificationOutbox] Fallback mode active: ${err.message}`);
      }
    }

    // 2. Dispatch the email using authoritative Nodemailer driver
    try {
      let dispatchResult: { success: boolean; messageId?: string; error?: string };

      if (params.type === 'voter_pass') {
        dispatchResult = await sendVoterPassEmail(params.payload as VoterPassPayload);
      } else if (params.type === 'results_broadcast') {
        dispatchResult = await sendElectionResultsEmail(params.payload as ElectionResultsPayload);
      } else if (params.type === 'commission_notice' || params.type === 'custom_notice') {
        dispatchResult = await sendCommissionNoticeEmail(params.payload as CommissionNoticePayload);
      } else {
        dispatchResult = await sendVoterPassEmail(params.payload as VoterPassPayload);
      }

      // 3. If outbox table exists, update record status
      if (tableExists && this.supabaseAdmin) {
        const updatePayload: any = {
          attempts: 1,
          updated_at: new Date().toISOString(),
          status: dispatchResult.success ? 'accepted' : 'failed',
          provider_message_id: dispatchResult.messageId || null,
          last_error: dispatchResult.error || null,
        };

        if (!dispatchResult.success) {
          const delaySec = notificationRetryDelaySeconds(1);
          updatePayload.available_at = new Date(Date.now() + delaySec * 1000).toISOString();
        }

        await this.supabaseAdmin.from('notification_outbox').update(updatePayload).eq('id', outboxId);
      }

      return {
        success: dispatchResult.success,
        outboxId,
        messageId: dispatchResult.messageId,
        directFallback: !tableExists,
        error: dispatchResult.error,
      };
    } catch (sendErr: any) {
      console.error('[NotificationOutbox] Dispatch error:', sendErr);
      return {
        success: false,
        outboxId,
        error: sendErr.message || 'Dispatch execution failed',
      };
    }
  }

  /**
   * Background processor: checks queued or failed items ready for delivery
   */
  public static async processDue(limit = 25): Promise<number> {
    if (!this.supabaseAdmin) return 0;

    try {
      const nowIso = new Date().toISOString();
      const { data: dueItems, error } = await this.supabaseAdmin
        .from('notification_outbox')
        .select('*')
        .in('status', ['queued', 'failed'])
        .lte('available_at', nowIso)
        .order('available_at', { ascending: true })
        .limit(limit);

      if (error || !dueItems || dueItems.length === 0) {
        return 0;
      }

      let processed = 0;
      for (const item of dueItems) {
        // Lock record
        await this.supabaseAdmin
          .from('notification_outbox')
          .update({ status: 'processing', locked_at: new Date().toISOString() })
          .eq('id', item.id);

        let res: { success: boolean; messageId?: string; error?: string };
        if (item.notification_type === 'voter_pass') {
          res = await sendVoterPassEmail(item.payload);
        } else if (item.notification_type === 'results_broadcast') {
          res = await sendElectionResultsEmail(item.payload);
        } else if (item.notification_type === 'commission_notice' || item.notification_type === 'custom_notice') {
          res = await sendCommissionNoticeEmail(item.payload);
        } else {
          res = await sendVoterPassEmail(item.payload);
        }

        const nextAttempts = (item.attempts || 0) + 1;
        const updatePayload: any = {
          attempts: nextAttempts,
          updated_at: new Date().toISOString(),
          status: res.success ? 'accepted' : 'failed',
          provider_message_id: res.messageId || item.provider_message_id,
          last_error: res.error || null,
        };

        if (!res.success) {
          const delaySec = notificationRetryDelaySeconds(nextAttempts);
          updatePayload.available_at = new Date(Date.now() + delaySec * 1000).toISOString();
        }

        await this.supabaseAdmin.from('notification_outbox').update(updatePayload).eq('id', item.id);
        processed++;
      }

      return processed;
    } catch (err: any) {
      console.error('[NotificationOutbox] processDue error:', err);
      return 0;
    }
  }

  /**
   * Check SMTP configuration status
   */
  public static getSmtpStatus(): { configured: boolean; user?: string; host?: string; port?: number } {
    const creds = resolveSmtpCredentials();
    if (!creds) {
      return { configured: false };
    }
    return {
      configured: true,
      user: creds.user,
      host: creds.host,
      port: creds.port,
    };
  }
}
