-- Add workflow and decision fields to applications
ALTER TABLE applications ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(100);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS risk_score INTEGER;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS risk_band VARCHAR(20);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS decision VARCHAR(20);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS decision_by VARCHAR(100);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS decision_at TIMESTAMPTZ;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS decision_notes TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS compliance_status VARCHAR(20) NOT NULL DEFAULT 'pending';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS aml_check_passed BOOLEAN;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS kyc_check_passed BOOLEAN;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS fraud_check_passed BOOLEAN;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS compliance_reviewed_by VARCHAR(100);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS compliance_reviewed_at TIMESTAMPTZ;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS source_channel VARCHAR(30) NOT NULL DEFAULT 'online';

-- Audit events table
CREATE TABLE IF NOT EXISTS audit_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id),
  event_type  VARCHAR(50) NOT NULL,
  performed_by VARCHAR(100) NOT NULL,
  role        VARCHAR(30) NOT NULL,
  details     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_application ON audit_events(application_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_created ON audit_events(created_at);

-- Application notes table
CREATE TABLE IF NOT EXISTS application_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id),
  author      VARCHAR(100) NOT NULL,
  role        VARCHAR(30) NOT NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_application ON application_notes(application_id);
