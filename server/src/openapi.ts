import { Router, Request, Response } from 'express';

export const docsRouter = Router();

const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'UK Lending Platform API',
    version: '1.0.0',
    description: 'REST API for the UK Retail Loan Journey — supporting customer applications, affordability checks, and staff management workflows.',
    contact: { name: 'UK Lending Platform Team' },
  },
  servers: [
    { url: '/api', description: 'API base path' },
  ],
  paths: {
    '/health/live': {
      get: {
        summary: 'Liveness check',
        tags: ['Health'],
        responses: { '200': { description: 'Service is alive', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'ok' } } } } } } },
      },
    },
    '/health/ready': {
      get: {
        summary: 'Readiness check (includes database)',
        tags: ['Health'],
        responses: {
          '200': { description: 'Service is ready', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, database: { type: 'string' }, timestamp: { type: 'string', format: 'date-time' } } } } } },
          '503': { description: 'Service degraded' },
        },
      },
    },
    '/applications': {
      post: {
        summary: 'Submit a loan application',
        tags: ['Applications'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateApplication' } } },
        },
        responses: {
          '201': { description: 'Application created', content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/ApplicationResult' } } } } } },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/applications/{reference}': {
      get: {
        summary: 'Get application by reference',
        tags: ['Applications'],
        parameters: [{ name: 'reference', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Application details' },
          '404': { description: 'Application not found' },
        },
      },
    },
    '/affordability-check': {
      post: {
        summary: 'Run affordability check',
        tags: ['Applications'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/AffordabilityCheck' } } },
        },
        responses: {
          '200': { description: 'Affordability result', content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/AffordabilityResult' } } } } } },
          '400': { description: 'Validation error' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Staff login',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['username', 'password'], properties: { username: { type: 'string' }, password: { type: 'string' } } } } },
        },
        responses: {
          '200': { description: 'Login successful — returns JWT token' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        summary: 'Refresh JWT token',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['refreshToken'], properties: { refreshToken: { type: 'string' } } } } },
        },
        responses: {
          '200': { description: 'New token returned' },
          '401': { description: 'Invalid refresh token' },
        },
      },
    },
    '/staff/dashboard': {
      get: {
        summary: 'Get dashboard statistics',
        tags: ['Staff'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Dashboard statistics' },
          '401': { description: 'Authentication required' },
        },
      },
    },
    '/staff/applications': {
      get: {
        summary: 'List applications (with filtering)',
        tags: ['Staff'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['submitted', 'under_review', 'approved', 'declined', 'completed'] } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50, maximum: 100 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
        ],
        responses: {
          '200': { description: 'Application list with pagination metadata' },
          '401': { description: 'Authentication required' },
        },
      },
    },
    '/staff/applications/{id}': {
      get: {
        summary: 'Get application detail (with notes & audit log)',
        tags: ['Staff'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Application detail' },
          '404': { description: 'Application not found' },
        },
      },
      patch: {
        summary: 'Update application (approve/decline/compliance)',
        tags: ['Staff'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateApplication' } } },
        },
        responses: {
          '200': { description: 'Updated application' },
          '400': { description: 'Validation error' },
          '403': { description: 'Insufficient permissions (requires underwriter/compliance/admin)' },
        },
      },
    },
    '/staff/applications/{id}/notes': {
      post: {
        summary: 'Add a note to an application',
        tags: ['Staff'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['author', 'role', 'content'], properties: { author: { type: 'string' }, role: { type: 'string' }, content: { type: 'string', maxLength: 2000 } } } } },
        },
        responses: {
          '201': { description: 'Note added' },
          '400': { description: 'Validation error' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      CreateApplication: {
        type: 'object',
        required: ['loanType', 'firstName', 'lastName', 'dateOfBirth', 'email', 'phone', 'addressLine1', 'city', 'postcode', 'employmentStatus', 'annualIncome', 'monthlyOutgoings', 'loanAmount', 'loanTermMonths', 'termsAccepted'],
        properties: {
          loanType: { type: 'string', enum: ['personal_loan', 'car_loan', 'home_improvement', 'debt_consolidation'] },
          firstName: { type: 'string', minLength: 2, maxLength: 50 },
          lastName: { type: 'string', minLength: 2, maxLength: 50 },
          dateOfBirth: { type: 'string', format: 'date' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string', description: 'UK phone number' },
          addressLine1: { type: 'string' },
          addressLine2: { type: 'string' },
          city: { type: 'string' },
          county: { type: 'string' },
          postcode: { type: 'string', description: 'UK postcode (e.g. SW1A 1AA)' },
          employmentStatus: { type: 'string', enum: ['employed', 'self_employed', 'part_time', 'retired', 'unemployed', 'student'] },
          employerName: { type: 'string' },
          annualIncome: { type: 'number', minimum: 0 },
          monthlyOutgoings: { type: 'number', minimum: 0 },
          loanAmount: { type: 'number', minimum: 1000, maximum: 25000 },
          loanTermMonths: { type: 'integer', enum: [12, 24, 36, 48, 60] },
          termsAccepted: { type: 'boolean', enum: [true] },
        },
      },
      ApplicationResult: {
        type: 'object',
        properties: {
          reference: { type: 'string', example: 'UK-2024-000001' },
          status: { type: 'string', example: 'submitted' },
        },
      },
      AffordabilityCheck: {
        type: 'object',
        required: ['annualIncome', 'monthlyOutgoings', 'loanAmount', 'loanTermMonths', 'loanType'],
        properties: {
          annualIncome: { type: 'number', minimum: 0 },
          monthlyOutgoings: { type: 'number', minimum: 0 },
          loanAmount: { type: 'number', minimum: 1000, maximum: 25000 },
          loanTermMonths: { type: 'integer', enum: [12, 24, 36, 48, 60] },
          loanType: { type: 'string', enum: ['personal_loan', 'car_loan', 'home_improvement', 'debt_consolidation'] },
        },
      },
      AffordabilityResult: {
        type: 'object',
        properties: {
          affordabilityPassed: { type: 'boolean' },
          monthlyRepayment: { type: 'number' },
          totalRepayable: { type: 'number' },
          representativeApr: { type: 'number' },
          disposableIncome: { type: 'number' },
          reason: { type: 'string' },
        },
      },
      UpdateApplication: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['submitted', 'under_review', 'approved', 'declined', 'completed'] },
          decision: { type: 'string', enum: ['approved', 'declined', 'referred'] },
          decisionBy: { type: 'string' },
          decisionNotes: { type: 'string', maxLength: 1000 },
          complianceStatus: { type: 'string', enum: ['pending', 'cleared', 'flagged'] },
          riskScore: { type: 'integer', minimum: 0, maximum: 999 },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string' },
              details: { type: 'array', items: { type: 'object' } },
              requestId: { type: 'string', format: 'uuid' },
            },
          },
        },
      },
    },
  },
};

docsRouter.get('/docs', (_req: Request, res: Response) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UK Lending Platform — API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({ url: '/api/docs/spec', dom_id: '#swagger-ui', deepLinking: true });
  </script>
</body>
</html>`;
  res.type('html').send(html);
});

docsRouter.get('/docs/spec', (_req: Request, res: Response) => {
  res.json(openApiSpec);
});
