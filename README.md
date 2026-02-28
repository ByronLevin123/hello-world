# UK Retail Loan Journey

A full-stack loan application journey for the UK market, built with React, Node.js/Express, and PostgreSQL.

## Features

- **8-step loan application journey**: Loan type selection, personal details, UK address, employment & income, loan amount & term, affordability check, review & submit, confirmation
- **UK-specific validation**: UK postcode regex, UK phone number formats, GBP currency formatting
- **FCA-style disclosures**: Representative APR display, credit warnings
- **Affordability check**: Server-side calculation based on income vs outgoings
- **Live repayment preview**: Real-time monthly repayment calculation as user adjusts amount and term
- **Full data persistence**: PostgreSQL database for application storage

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, React Router, Vite |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL |
| Validation | Zod (server), custom validators (client) |
| Testing | Vitest, Supertest |

## Project Structure

```
├── client/          # React frontend (Vite)
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── steps/        # Journey step pages (1-8)
│       ├── context/      # Application form state (React Context)
│       ├── utils/        # Validators, formatters, API client
│       └── types/        # TypeScript types
├── server/          # Express backend
│   └── src/
│       ├── routes/       # API route definitions
│       ├── controllers/  # Request handlers
│       ├── services/     # Business logic (affordability, repayment calc)
│       ├── validation/   # Zod schemas
│       ├── middleware/    # Validation & error handling middleware
│       └── db/           # Database connection & migrations
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

## Setup

1. **Clone and install dependencies:**
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

2. **Set up the database:**
   ```bash
   createdb loan_journey
   cd server
   cp ../.env.example .env  # Edit DATABASE_URL if needed
   npm run db:migrate
   ```

3. **Start the development servers:**
   ```bash
   # Terminal 1 - Backend (port 3001)
   cd server && npm run dev

   # Terminal 2 - Frontend (port 5173)
   cd client && npm run dev
   ```

4. **Open** http://localhost:5173 in your browser.

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/applications` | Submit a loan application |
| `GET` | `/api/applications/:reference` | Get application by reference |
| `POST` | `/api/affordability-check` | Run affordability check |

## Running Tests

```bash
# All tests
cd server && npx vitest run
cd client && npx vitest run

# Or from root
npm run test:server
npm run test:client
```

## Loan Types & Representative APRs

| Loan Type | Representative APR |
|-----------|-------------------|
| Personal Loan | 6.9% |
| Car Loan | 5.9% |
| Home Improvement | 4.5% |
| Debt Consolidation | 7.9% |

## Disclaimer

This is a demonstration application and does not constitute a real financial product.
