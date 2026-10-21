-- Migration: KUPSA Notification Outbox Table
-- Guarantees resilient asynchronous email delivery with deduplication and exponential retries

CREATE TABLE IF NOT EXISTS public.notification_outbox (
  id UUID PRIMARY KEY,
  dedupe_key TEXT UNIQUE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp')),
  notification_type TEXT NOT NULL,
  recipient TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'processing', 'accepted', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  provider_message_id TEXT,
  provider_status TEXT,
  provider_response JSONB,
  last_error TEXT,
  available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  locked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notification_outbox_due_idx
  ON public.notification_outbox (status, available_at, created_at);

COMMENT ON TABLE public.notification_outbox IS 'Transactional outbox for reliable asynchronous KUPSA election email dispatch';
