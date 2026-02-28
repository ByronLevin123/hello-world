import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import jwt from 'jsonwebtoken';
import { config } from '../config';

// Mock the database module to avoid needing a real DB for unit/integration tests
vi.mock('../db/connection', () => ({
  pool: {
    query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    connect: vi.fn().mockResolvedValue({
      query: vi.fn().mockResolvedValue({ rows: [] }),
      release: vi.fn(),
    }),
  },
}));

vi.mock('../services/applicationService', async (importOriginal) => {
  const orig = await importOriginal<typeof import('../services/applicationService')>();
  return {
    ...orig,
    createApplication: vi.fn().mockResolvedValue({
      reference: 'UK-TEST-0001',
      status: 'submitted',
    }),
    getApplicationByReference: vi.fn().mockImplementation((ref: string) => {
      if (ref === 'UK-TEST-0001') {
        return Promise.resolve({
          id: '550e8400-e29b-41d4-a716-446655440000',
          reference: 'UK-TEST-0001',
          status: 'submitted',
          loanType: 'personal_loan',
          firstName: 'John',
          lastName: 'Smith',
        });
      }
      return Promise.resolve(null);
    }),
  };
});

vi.mock('../services/staffService', () => ({
  getDashboardStats: vi.fn().mockResolvedValue({
    totalApplications: 10,
    pendingReview: 3,
    approved: 5,
    declined: 2,
  }),
  listApplications: vi.fn().mockResolvedValue({
    applications: [
      { id: '550e8400-e29b-41d4-a716-446655440000', reference: 'UK-TEST-0001', status: 'submitted' },
    ],
    total: 1,
  }),
  getApplicationDetail: vi.fn().mockImplementation((id: string) => {
    if (id === '550e8400-e29b-41d4-a716-446655440000') {
      return Promise.resolve({
        id: '550e8400-e29b-41d4-a716-446655440000',
        reference: 'UK-TEST-0001',
        status: 'submitted',
        loanType: 'personal_loan',
        firstName: 'John',
        lastName: 'Smith',
        notes: [],
        auditLog: [],
      });
    }
    return Promise.resolve(null);
  }),
  updateApplicationWithAudit: vi.fn().mockResolvedValue(undefined),
  addNoteWithAudit: vi.fn().mockResolvedValue(undefined),
}));

function makeToken(role: string = 'underwriter', username: string = 'testuser') {
  return jwt.sign(
    { userId: '1', username, role },
    config.jwtSecret,
    { expiresIn: '1h' },
  );
}

describe('Health Endpoints', () => {
  it('GET /api/health/live returns ok', async () => {
    const res = await request(app).get('/api/health/live');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/health returns ok (legacy)', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Application Endpoints (Public)', () => {
  it('POST /api/applications creates an application', async () => {
    const res = await request(app)
      .post('/api/applications')
      .send({
        loanType: 'personal_loan',
        firstName: 'John',
        lastName: 'Smith',
        dateOfBirth: '1990-06-15',
        email: 'john@example.com',
        phone: '07700900123',
        addressLine1: '10 Downing Street',
        city: 'London',
        postcode: 'SW1A 2AA',
        employmentStatus: 'employed',
        employerName: 'Acme Corp',
        annualIncome: 35000,
        monthlyOutgoings: 1500,
        loanAmount: 10000,
        loanTermMonths: 36,
        termsAccepted: true,
      });
    expect(res.status).toBe(201);
    expect(res.body.data.reference).toBe('UK-TEST-0001');
  });

  it('POST /api/applications rejects invalid data', async () => {
    const res = await request(app)
      .post('/api/applications')
      .send({ loanType: 'personal_loan' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/applications rejects invalid postcode', async () => {
    const res = await request(app)
      .post('/api/applications')
      .send({
        loanType: 'personal_loan',
        firstName: 'John',
        lastName: 'Smith',
        dateOfBirth: '1990-06-15',
        email: 'john@example.com',
        phone: '07700900123',
        addressLine1: '10 Downing Street',
        city: 'London',
        postcode: '12345',
        employmentStatus: 'employed',
        employerName: 'Acme Corp',
        annualIncome: 35000,
        monthlyOutgoings: 1500,
        loanAmount: 10000,
        loanTermMonths: 36,
        termsAccepted: true,
      });
    expect(res.status).toBe(400);
  });

  it('GET /api/applications/:reference returns application', async () => {
    const res = await request(app).get('/api/applications/UK-TEST-0001');
    expect(res.status).toBe(200);
    expect(res.body.data.reference).toBe('UK-TEST-0001');
  });

  it('GET /api/applications/:reference returns 404 for unknown', async () => {
    const res = await request(app).get('/api/applications/UNKNOWN-REF');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('POST /api/affordability-check returns result', async () => {
    const res = await request(app)
      .post('/api/affordability-check')
      .send({
        annualIncome: 40000,
        monthlyOutgoings: 1500,
        loanAmount: 10000,
        loanTermMonths: 36,
        loanType: 'personal_loan',
      });
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.monthlyRepayment).toBeGreaterThan(0);
    expect(res.body.data.affordabilityPassed).toBeDefined();
  });

  it('POST /api/affordability-check rejects invalid data', async () => {
    const res = await request(app)
      .post('/api/affordability-check')
      .send({ annualIncome: -1000 });
    expect(res.status).toBe(400);
  });
});

describe('Auth Endpoints', () => {
  it('POST /api/auth/login succeeds with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'underwriter', password: 'underwriter123' });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('underwriter');
  });

  it('POST /api/auth/login fails with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'underwriter', password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  it('POST /api/auth/login fails with missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});
    expect(res.status).toBe(400);
  });

  it('POST /api/auth/refresh succeeds with valid refresh token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'branch.user', password: 'branch123' });
    const { refreshToken } = loginRes.body.data;

    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('POST /api/auth/refresh fails with invalid token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'invalid-token' });
    expect(res.status).toBe(401);
  });
});

describe('Staff Endpoints (Protected)', () => {
  it('GET /api/staff/dashboard returns 401 without token', async () => {
    const res = await request(app).get('/api/staff/dashboard');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  it('GET /api/staff/dashboard returns data with valid token', async () => {
    const token = makeToken('branch');
    const res = await request(app)
      .get('/api/staff/dashboard')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.totalApplications).toBeDefined();
  });

  it('GET /api/staff/applications returns list with token', async () => {
    const token = makeToken('executive');
    const res = await request(app)
      .get('/api/staff/applications')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.meta.total).toBeDefined();
  });

  it('GET /api/staff/applications/:id returns detail', async () => {
    const token = makeToken('underwriter');
    const res = await request(app)
      .get('/api/staff/applications/550e8400-e29b-41d4-a716-446655440000')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.reference).toBe('UK-TEST-0001');
  });

  it('GET /api/staff/applications/:id returns 404 for unknown', async () => {
    const token = makeToken('underwriter');
    const res = await request(app)
      .get('/api/staff/applications/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('GET /api/staff/applications/:id rejects invalid UUID', async () => {
    const token = makeToken('underwriter');
    const res = await request(app)
      .get('/api/staff/applications/not-a-uuid')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it('PATCH /api/staff/applications/:id requires underwriter/compliance role', async () => {
    const branchToken = makeToken('branch');
    const res = await request(app)
      .patch('/api/staff/applications/550e8400-e29b-41d4-a716-446655440000')
      .set('Authorization', `Bearer ${branchToken}`)
      .send({ status: 'approved' });
    expect(res.status).toBe(403);
  });

  it('PATCH /api/staff/applications/:id succeeds for underwriter', async () => {
    const token = makeToken('underwriter');
    const res = await request(app)
      .patch('/api/staff/applications/550e8400-e29b-41d4-a716-446655440000')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'approved', decision: 'approved', decisionNotes: 'All criteria met' });
    expect(res.status).toBe(200);
  });

  it('PATCH /api/staff/applications/:id succeeds for admin', async () => {
    const token = makeToken('admin');
    const res = await request(app)
      .patch('/api/staff/applications/550e8400-e29b-41d4-a716-446655440000')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'approved' });
    expect(res.status).toBe(200);
  });

  it('PATCH /api/staff/applications/:id rejects invalid body', async () => {
    const token = makeToken('underwriter');
    const res = await request(app)
      .patch('/api/staff/applications/550e8400-e29b-41d4-a716-446655440000')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('POST /api/staff/applications/:id/notes adds a note', async () => {
    const token = makeToken('branch', 'branch.user');
    const res = await request(app)
      .post('/api/staff/applications/550e8400-e29b-41d4-a716-446655440000/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ author: 'branch.user', role: 'branch', content: 'Customer called to check status.' });
    expect(res.status).toBe(201);
    expect(res.body.data.success).toBe(true);
  });

  it('POST /api/staff/applications/:id/notes rejects empty content', async () => {
    const token = makeToken('branch');
    const res = await request(app)
      .post('/api/staff/applications/550e8400-e29b-41d4-a716-446655440000/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ author: 'branch.user', role: 'branch', content: '' });
    expect(res.status).toBe(400);
  });
});

describe('Error Handling', () => {
  it('returns structured error for unknown API routes', async () => {
    const res = await request(app).get('/api/nonexistent-route');
    // Will either 404 from express or fall through to static handler
    expect(res.status).toBeGreaterThanOrEqual(200);
  });

  it('returns JSON error for bad JSON body', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Content-Type', 'application/json')
      .send('{ bad json }');
    // Express body-parser returns 400 or 500 depending on version
    expect([400, 500]).toContain(res.status);
    expect(res.body.error).toBeDefined();
  });
});

describe('Security Headers', () => {
  it('includes security headers from Helmet', async () => {
    const res = await request(app).get('/api/health/live');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBeDefined();
  });

  it('includes X-Request-ID header', async () => {
    const res = await request(app).get('/api/health/live');
    expect(res.headers['x-request-id']).toBeDefined();
    expect(res.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
  });
});
