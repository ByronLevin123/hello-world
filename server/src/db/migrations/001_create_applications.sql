CREATE TABLE IF NOT EXISTS applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference       VARCHAR(12) UNIQUE NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'submitted',

  -- Loan details
  loan_type       VARCHAR(30) NOT NULL,
  loan_amount     INTEGER NOT NULL,
  loan_term_months INTEGER NOT NULL,
  representative_apr NUMERIC(5,2) NOT NULL,
  monthly_repayment INTEGER NOT NULL,

  -- Personal details
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  date_of_birth   DATE NOT NULL,
  email           VARCHAR(255) NOT NULL,
  phone           VARCHAR(20) NOT NULL,

  -- Address
  address_line_1  VARCHAR(255) NOT NULL,
  address_line_2  VARCHAR(255),
  city            VARCHAR(100) NOT NULL,
  county          VARCHAR(100),
  postcode        VARCHAR(10) NOT NULL,

  -- Employment
  employment_status VARCHAR(30) NOT NULL,
  employer_name     VARCHAR(255),
  annual_income     INTEGER NOT NULL,
  monthly_outgoings INTEGER NOT NULL,

  -- Affordability
  affordability_passed BOOLEAN NOT NULL,
  terms_accepted  BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_reference ON applications(reference);
CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(email);
