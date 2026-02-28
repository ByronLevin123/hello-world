import { pool } from './connection';
import { generateReference } from '../services/referenceGenerator';
import { calculateMonthlyRepayment } from '../services/applicationService';

const LOAN_TYPES = ['personal_loan', 'car_loan', 'home_improvement', 'debt_consolidation'] as const;
const APRS: Record<string, number> = { personal_loan: 6.9, car_loan: 5.9, home_improvement: 4.5, debt_consolidation: 7.9 };
const STATUSES = ['submitted', 'under_review', 'approved', 'declined', 'referred'] as const;
const COMPLIANCE = ['pending', 'in_progress', 'cleared', 'flagged'] as const;
const RISK_BANDS = ['low', 'medium', 'high'] as const;
const EMPLOYMENT = ['employed', 'self_employed', 'part_time', 'retired'] as const;
const CHANNELS = ['online', 'branch', 'phone'] as const;

const FIRST_NAMES = ['James', 'Emma', 'Oliver', 'Sophie', 'William', 'Amelia', 'Harry', 'Isla', 'George', 'Mia', 'Thomas', 'Charlotte', 'Jack', 'Emily', 'Oscar', 'Lily', 'Henry', 'Ava', 'Noah', 'Grace'];
const LAST_NAMES = ['Smith', 'Jones', 'Williams', 'Taylor', 'Brown', 'Davies', 'Evans', 'Wilson', 'Thomas', 'Roberts', 'Johnson', 'Lewis', 'Walker', 'Robinson', 'Wood', 'Thompson', 'White', 'Watson', 'Jackson', 'Wright'];
const CITIES = ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Liverpool', 'Edinburgh', 'Bristol', 'Cardiff', 'Sheffield'];
const POSTCODES = ['SW1A 1AA', 'M1 1AE', 'B1 1BB', 'LS1 1UR', 'G1 1XQ', 'L1 0AA', 'EH1 1YZ', 'BS1 1AA', 'CF10 1EP', 'S1 2BJ'];
const STAFF = ['Sarah Mitchell', 'David Chen', 'Rachel Kumar', 'Mark Thompson', 'Anna Kowalski'];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysBack: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  d.setHours(rand(8, 18), rand(0, 59), rand(0, 59));
  return d;
}

async function seed() {
  console.log('Seeding test data...');

  for (let i = 0; i < 35; i++) {
    const loanType = pick(LOAN_TYPES);
    const apr = APRS[loanType];
    const loanAmount = rand(1, 25) * 1000;
    const termMonths = pick([12, 24, 36, 48, 60]);
    const monthly = calculateMonthlyRepayment(loanAmount, apr, termMonths);
    const annualIncome = rand(20, 120) * 1000;
    const monthlyOutgoings = rand(500, 3000);
    const status = pick(STATUSES);
    const compStatus = status === 'submitted' ? 'pending' : pick(COMPLIANCE);
    const riskScore = rand(200, 950);
    const riskBand = riskScore >= 700 ? 'low' : riskScore >= 450 ? 'medium' : 'high';
    const cityIdx = rand(0, CITIES.length - 1);
    const createdAt = randomDate(90);
    const reference = generateReference();
    const affordPassed = (annualIncome / 12 - monthlyOutgoings - monthly) > (annualIncome / 12 * 0.1);

    const hasDecision = status === 'approved' || status === 'declined';
    const decisionBy = hasDecision ? pick(STAFF) : null;
    const decisionAt = hasDecision ? new Date(createdAt.getTime() + rand(1, 5) * 86400000) : null;
    const assignedTo = status !== 'submitted' ? pick(STAFF) : null;

    await pool.query(
      `INSERT INTO applications (
        reference, loan_type, loan_amount, loan_term_months, representative_apr, monthly_repayment,
        first_name, last_name, date_of_birth, email, phone,
        address_line_1, city, postcode,
        employment_status, annual_income, monthly_outgoings,
        affordability_passed, terms_accepted, status,
        risk_score, risk_band, decision, decision_by, decision_at,
        assigned_to, compliance_status, aml_check_passed, kyc_check_passed, fraud_check_passed,
        compliance_reviewed_by, compliance_reviewed_at, source_channel, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        $12, $13, $14,
        $15, $16, $17,
        $18, $19, $20,
        $21, $22, $23, $24, $25,
        $26, $27, $28, $29, $30,
        $31, $32, $33, $34
      )`,
      [
        reference, loanType, Math.round(loanAmount * 100), termMonths, apr, Math.round(monthly * 100),
        pick(FIRST_NAMES), pick(LAST_NAMES),
        `${rand(1960, 2000)}-${String(rand(1, 12)).padStart(2, '0')}-${String(rand(1, 28)).padStart(2, '0')}`,
        `${pick(FIRST_NAMES).toLowerCase()}.${pick(LAST_NAMES).toLowerCase()}@example.co.uk`,
        `07${rand(100, 999)}${rand(100000, 999999)}`,
        `${rand(1, 200)} ${pick(['High Street', 'Station Road', 'Church Lane', 'Mill Lane', 'Park Avenue', 'Queen Street', 'Victoria Road'])}`,
        CITIES[cityIdx], POSTCODES[cityIdx],
        pick(EMPLOYMENT), Math.round(annualIncome * 100), Math.round(monthlyOutgoings * 100),
        affordPassed, true, status,
        riskScore, riskBand, hasDecision ? status : null, decisionBy, decisionAt,
        assignedTo, compStatus,
        compStatus !== 'pending' ? Math.random() > 0.1 : null,
        compStatus !== 'pending' ? Math.random() > 0.05 : null,
        compStatus !== 'pending' ? Math.random() > 0.15 : null,
        compStatus !== 'pending' ? pick(STAFF) : null,
        compStatus !== 'pending' ? new Date(createdAt.getTime() + rand(0, 3) * 86400000) : null,
        pick(CHANNELS), createdAt,
      ]
    );
  }

  // Add some audit events
  const apps = await pool.query('SELECT id, status, created_at FROM applications ORDER BY created_at');
  for (const app of apps.rows) {
    await pool.query(
      `INSERT INTO audit_events (application_id, event_type, performed_by, role, details, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [app.id, 'application_submitted', 'System', 'system', 'Application submitted via online channel', app.created_at]
    );
    if (app.status !== 'submitted') {
      await pool.query(
        `INSERT INTO audit_events (application_id, event_type, performed_by, role, details, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [app.id, 'status_changed', pick(STAFF), 'underwriter', `Status changed to ${app.status}`,
         new Date(new Date(app.created_at).getTime() + rand(1, 3) * 86400000)]
      );
    }
  }

  // Add some notes
  const reviewedApps = await pool.query("SELECT id FROM applications WHERE status != 'submitted' LIMIT 15");
  for (const app of reviewedApps.rows) {
    await pool.query(
      `INSERT INTO application_notes (application_id, author, role, content)
       VALUES ($1, $2, $3, $4)`,
      [app.id, pick(STAFF), pick(['underwriter', 'compliance', 'branch']),
       pick([
         'Income verified against payslips. All consistent.',
         'Address confirmed via utility bill.',
         'Employer confirmed via Companies House check.',
         'Debt-to-income ratio within acceptable limits.',
         'Referred for senior review due to high loan amount.',
         'AML screening complete — no adverse findings.',
         'Customer called to confirm employment details.',
         'Credit file reviewed — no CCJs or defaults.',
         'Affordability assessment completed satisfactorily.',
         'Additional documentation requested from applicant.',
       ])]
    );
  }

  await pool.end();
  console.log('Seeding complete — 35 applications with audit events and notes.');
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
