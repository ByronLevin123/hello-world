import { pool } from '../db/connection';
import { PoolClient } from 'pg';

export interface DashboardStats {
  totalApplications: number;
  submitted: number;
  underReview: number;
  approved: number;
  declined: number;
  referred: number;
  totalPipelineValue: number;
  avgLoanAmount: number;
  approvalRate: number;
  avgRiskScore: number;
  compliancePending: number;
  complianceFlagged: number;
  byLoanType: { loan_type: string; count: number; total_value: number }[];
  byRiskBand: { risk_band: string; count: number }[];
  byChannel: { source_channel: string; count: number }[];
  byMonth: { month: string; count: number; value: number }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [totals, byType, byRisk, byChannel, byMonth] = await Promise.all([
    pool.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'submitted')::int AS submitted,
        COUNT(*) FILTER (WHERE status = 'under_review')::int AS under_review,
        COUNT(*) FILTER (WHERE status = 'approved')::int AS approved,
        COUNT(*) FILTER (WHERE status = 'declined')::int AS declined,
        COUNT(*) FILTER (WHERE status = 'referred')::int AS referred,
        COALESCE(SUM(loan_amount), 0)::bigint AS total_pipeline,
        COALESCE(AVG(loan_amount), 0)::int AS avg_amount,
        COALESCE(AVG(risk_score), 0)::int AS avg_risk,
        COUNT(*) FILTER (WHERE compliance_status = 'pending')::int AS comp_pending,
        COUNT(*) FILTER (WHERE compliance_status = 'flagged')::int AS comp_flagged
      FROM applications
    `),
    pool.query(`
      SELECT loan_type, COUNT(*)::int AS count, SUM(loan_amount)::bigint AS total_value
      FROM applications GROUP BY loan_type ORDER BY count DESC
    `),
    pool.query(`
      SELECT COALESCE(risk_band, 'unscored') AS risk_band, COUNT(*)::int AS count
      FROM applications GROUP BY risk_band ORDER BY count DESC
    `),
    pool.query(`
      SELECT source_channel, COUNT(*)::int AS count
      FROM applications GROUP BY source_channel ORDER BY count DESC
    `),
    pool.query(`
      SELECT TO_CHAR(created_at, 'YYYY-MM') AS month, COUNT(*)::int AS count, SUM(loan_amount)::bigint AS value
      FROM applications GROUP BY month ORDER BY month
    `),
  ]);

  const t = totals.rows[0];
  const decided = t.approved + t.declined;
  return {
    totalApplications: t.total,
    submitted: t.submitted,
    underReview: t.under_review,
    approved: t.approved,
    declined: t.declined,
    referred: t.referred,
    totalPipelineValue: Number(t.total_pipeline) / 100,
    avgLoanAmount: t.avg_amount / 100,
    approvalRate: decided > 0 ? Math.round((t.approved / decided) * 100) : 0,
    avgRiskScore: t.avg_risk,
    compliancePending: t.comp_pending,
    complianceFlagged: t.comp_flagged,
    byLoanType: byType.rows.map(r => ({ ...r, total_value: Number(r.total_value) / 100 })),
    byRiskBand: byRisk.rows,
    byChannel: byChannel.rows,
    byMonth: byMonth.rows.map(r => ({ ...r, value: Number(r.value) / 100 })),
  };
}

export async function listApplications(filters: {
  status?: string;
  complianceStatus?: string;
  riskBand?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (filters.status) { conditions.push(`status = $${idx++}`); params.push(filters.status); }
  if (filters.complianceStatus) { conditions.push(`compliance_status = $${idx++}`); params.push(filters.complianceStatus); }
  if (filters.riskBand) { conditions.push(`risk_band = $${idx++}`); params.push(filters.riskBand); }
  if (filters.search) {
    conditions.push(`(first_name ILIKE $${idx} OR last_name ILIKE $${idx} OR reference ILIKE $${idx} OR email ILIKE $${idx})`);
    params.push(`%${filters.search}%`);
    idx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = filters.limit || 50;
  const offset = filters.offset || 0;

  const [rows, countResult] = await Promise.all([
    pool.query(
      `SELECT id, reference, status, loan_type, loan_amount, loan_term_months,
              first_name, last_name, email, risk_score, risk_band, compliance_status,
              decision, assigned_to, source_channel, created_at
       FROM applications ${where}
       ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset]
    ),
    pool.query(`SELECT COUNT(*)::int AS total FROM applications ${where}`, params),
  ]);

  return {
    applications: rows.rows.map(r => ({
      ...r,
      loan_amount: r.loan_amount / 100,
    })),
    total: countResult.rows[0].total,
  };
}

export async function getApplicationDetail(id: string) {
  const [app, notes, events] = await Promise.all([
    pool.query('SELECT * FROM applications WHERE id = $1', [id]),
    pool.query('SELECT * FROM application_notes WHERE application_id = $1 ORDER BY created_at DESC', [id]),
    pool.query('SELECT * FROM audit_events WHERE application_id = $1 ORDER BY created_at DESC', [id]),
  ]);

  if (app.rows.length === 0) return null;
  const r = app.rows[0];

  return {
    ...r,
    loan_amount: r.loan_amount / 100,
    monthly_repayment: r.monthly_repayment / 100,
    annual_income: r.annual_income / 100,
    monthly_outgoings: r.monthly_outgoings / 100,
    representative_apr: parseFloat(r.representative_apr),
    notes: notes.rows,
    auditEvents: events.rows,
  };
}

async function runInTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

function buildUpdateSets(update: Record<string, unknown>) {
  const sets: string[] = ['updated_at = NOW()'];
  const params: unknown[] = [];
  let idx = 1;

  if (update.status) { sets.push(`status = $${idx++}`); params.push(update.status); }
  if (update.decision) {
    sets.push(`decision = $${idx++}`); params.push(update.decision);
    sets.push(`decision_at = NOW()`);
  }
  if (update.decisionBy) { sets.push(`decision_by = $${idx++}`); params.push(update.decisionBy); }
  if (update.decisionNotes) { sets.push(`decision_notes = $${idx++}`); params.push(update.decisionNotes); }
  if (update.assignedTo) { sets.push(`assigned_to = $${idx++}`); params.push(update.assignedTo); }
  if (update.complianceStatus) { sets.push(`compliance_status = $${idx++}`); params.push(update.complianceStatus); }
  if (update.amlCheckPassed !== undefined) { sets.push(`aml_check_passed = $${idx++}`); params.push(update.amlCheckPassed); }
  if (update.kycCheckPassed !== undefined) { sets.push(`kyc_check_passed = $${idx++}`); params.push(update.kycCheckPassed); }
  if (update.fraudCheckPassed !== undefined) { sets.push(`fraud_check_passed = $${idx++}`); params.push(update.fraudCheckPassed); }
  if (update.complianceReviewedBy) {
    sets.push(`compliance_reviewed_by = $${idx++}`); params.push(update.complianceReviewedBy);
    sets.push(`compliance_reviewed_at = NOW()`);
  }
  if (update.riskScore !== undefined) { sets.push(`risk_score = $${idx++}`); params.push(update.riskScore); }
  if (update.riskBand) { sets.push(`risk_band = $${idx++}`); params.push(update.riskBand); }

  return { sets, params, nextIdx: idx };
}

export async function updateApplicationWithAudit(id: string, update: Record<string, unknown>) {
  return runInTransaction(async (client) => {
    const { sets, params, nextIdx } = buildUpdateSets(update);
    params.push(id);
    await client.query(`UPDATE applications SET ${sets.join(', ')} WHERE id = $${nextIdx}`, params);

    const events: string[] = [];
    if (update.status) events.push(`Status changed to ${update.status}`);
    if (update.decision) events.push(`Decision: ${update.decision}`);
    if (update.complianceStatus) events.push(`Compliance status: ${update.complianceStatus}`);
    if (update.assignedTo) events.push(`Assigned to ${update.assignedTo}`);

    if (events.length > 0) {
      await client.query(
        `INSERT INTO audit_events (application_id, event_type, performed_by, role, details) VALUES ($1, $2, $3, $4, $5)`,
        [
          id,
          update.decision ? 'decision_made' : 'status_changed',
          (update.decisionBy || update.complianceReviewedBy || 'Staff') as string,
          update.complianceStatus ? 'compliance' : 'underwriter',
          events.join('. '),
        ]
      );
    }
  });
}

export async function addNoteWithAudit(applicationId: string, author: string, role: string, content: string) {
  return runInTransaction(async (client) => {
    await client.query(
      `INSERT INTO application_notes (application_id, author, role, content) VALUES ($1, $2, $3, $4)`,
      [applicationId, author, role, content]
    );
    await client.query(
      `INSERT INTO audit_events (application_id, event_type, performed_by, role, details) VALUES ($1, $2, $3, $4, $5)`,
      [applicationId, 'note_added', author, role, `Note added: ${content.substring(0, 50)}...`]
    );
  });
}
