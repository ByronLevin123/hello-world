# UK Retail Loan Journey

A full-stack loan application journey for the UK market, built with React, Node.js/Express, and PostgreSQL. Includes a multi-step customer application form and a staff dashboard with front office, middle office (underwriting), back office (compliance/AML), and executive views.

## Features

### Customer Journey (8 steps)
- **Loan type selection** with representative APR display per FCA guidelines
- **Personal details** with UK-specific validation (age 18+, UK phone, email)
- **UK address** with postcode regex validation
- **Employment & income** with conditional fields
- **Loan amount & term** with live monthly repayment calculator
- **Server-side affordability check** based on disposable income threshold
- **Review & submit** with FCA credit warnings and T&C acceptance
- **Confirmation** with application reference number

### Staff Dashboard (4 roles)
- **Front Office (Branch/Sales)**: Application tracker with search and status filtering
- **Middle Office (Underwriting)**: Queue management with risk-based filtering, approve/decline/refer actions
- **Back Office (Compliance)**: AML/KYC/Fraud checklist, compliance status tracking, flagged application alerts
- **Executive (Head of Lending)**: KPI dashboard with pipeline stats, approval rates, charts by loan type/risk/channel/month

### UK-Specific Features
- UK postcode validation (regex)
- UK phone number formats (07xxx, +447xxx)
- GBP currency formatting (`Intl.NumberFormat`)
- Representative APR calculation (standard amortization)
- FCA-style disclosure banners
- Credit warning text

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, React Router, Vite |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL |
| Validation | Zod (server), custom validators (client) |
| Testing | Vitest (59 tests) |

## Project Structure

```
├── client/                # React frontend (Vite)
│   └── src/
│       ├── components/    # Reusable UI (ProgressBar, StepLayout, FormField, FCADisclosure)
│       ├── steps/         # Journey step pages (1-8)
│       ├── dashboard/     # Staff dashboard
│       │   ├── views/     # FrontOffice, MiddleOffice, BackOffice, Executive
│       │   ├── components/# ApplicationTable, DetailPanel, StatCard, BarChart
│       │   └── api.ts     # Staff API client
│       ├── context/       # Application form state (React Context)
│       ├── utils/         # Validators, formatters, API client
│       └── types/         # TypeScript types
├── server/                # Express backend
│   └── src/
│       ├── routes/        # Customer + staff API routes
│       ├── controllers/   # Request handlers
│       ├── services/      # Business logic (affordability, staff operations)
│       ├── validation/    # Zod schemas (application + staff)
│       ├── middleware/     # Validation & error handling
│       └── db/            # Connection, migrations, seed script
├── Dockerfile             # Multi-stage production build
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

## Quick Start

1. **Install dependencies:**
   ```bash
   cd client && npm install && cd ../server && npm install && cd ..
   ```

2. **Set up the database:**
   ```bash
   createdb loan_journey
   cd server
   echo 'DATABASE_URL=postgresql://localhost:5432/loan_journey' > .env
   npx tsx src/db/migrate.ts
   npx tsx src/db/seed.ts     # Optional: seeds 35 test applications
   ```

3. **Start development servers:**
   ```bash
   # Terminal 1 - Backend (port 3001)
   cd server && npm run dev

   # Terminal 2 - Frontend (port 5173, proxies /api to 3001)
   cd client && npm run dev
   ```

4. **Open** http://localhost:5173

### Production Mode (single server)

```bash
cd client && npx vite build
cd ../server
DATABASE_URL=postgresql://localhost:5432/loan_journey NODE_ENV=production npx tsx src/index.ts
# App available at http://localhost:3001
```

### Docker Deployment

```bash
docker build -t uk-loan-journey .
docker run -p 3001:3001 -e DATABASE_URL=postgresql://host:5432/loan_journey uk-loan-journey
```

### Deploy to Railway / Render / Fly.io

The app is configured for single-port deployment. Set these environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/dbname` |
| `PORT` | Server port (default: 3001) | `3001` |
| `NODE_ENV` | Environment | `production` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins (optional) | `https://yourdomain.com` |

## API Endpoints

### Customer API
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/applications` | Submit a loan application |
| `GET` | `/api/applications/:reference` | Get application by reference |
| `POST` | `/api/affordability-check` | Run affordability check |

### Staff API
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/staff/dashboard` | Dashboard statistics |
| `GET` | `/api/staff/applications` | List applications (with filters) |
| `GET` | `/api/staff/applications/:id` | Application detail with notes & audit trail |
| `PATCH` | `/api/staff/applications/:id` | Update status / decision / compliance |
| `POST` | `/api/staff/applications/:id/notes` | Add a note |

## Running Tests

```bash
# Server tests (40 tests)
cd server && npx vitest run

# Client tests (19 tests)
cd client && npx vitest run
```

## Loan Types & Representative APRs

| Loan Type | Representative APR |
|-----------|-------------------|
| Personal Loan | 6.9% |
| Car Loan | 5.9% |
| Home Improvement | 4.5% |
| Debt Consolidation | 7.9% |

## Architecture Notes

- Amounts stored in pence (integers) in database, converted to pounds in API responses
- Transactions used for update + audit event operations (atomic consistency)
- Connection pool with configurable size and idle/connection timeouts
- Graceful shutdown on SIGTERM/SIGINT
- Zod validation on all mutation endpoints
- UUID parameter validation on all `:id` routes
- JSON body size limit (100kb)

## Disclaimer

This is a demonstration application and does not constitute a real financial product.
