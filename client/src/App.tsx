import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LoanTypeStep } from './steps/LoanTypeStep';
import { PersonalDetailsStep } from './steps/PersonalDetailsStep';
import { AddressStep } from './steps/AddressStep';
import { EmploymentStep } from './steps/EmploymentStep';
import { LoanDetailsStep } from './steps/LoanDetailsStep';
import { AffordabilityStep } from './steps/AffordabilityStep';
import { ReviewStep } from './steps/ReviewStep';
import { ConfirmationStep } from './steps/ConfirmationStep';
import { DashboardShell } from './dashboard/DashboardShell';

export function App() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  if (isDashboard) {
    return <DashboardShell />;
  }

  return (
    <div>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <h2 style={styles.logo}>UK Loan Application</h2>
          <Link to="/dashboard" style={styles.dashLink}>Staff Dashboard</Link>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<LoanTypeStep />} />
          <Route path="/personal-details" element={<PersonalDetailsStep />} />
          <Route path="/address" element={<AddressStep />} />
          <Route path="/employment" element={<EmploymentStep />} />
          <Route path="/loan-details" element={<LoanDetailsStep />} />
          <Route path="/affordability" element={<AffordabilityStep />} />
          <Route path="/review" element={<ReviewStep />} />
          <Route path="/confirmation" element={<ConfirmationStep />} />
        </Routes>
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <p style={styles.footerText}>
            Your home may be repossessed if you do not keep up repayments on your mortgage.
          </p>
          <p style={styles.footerSmall}>
            This is a demonstration application and does not constitute a real financial product.
          </p>
        </div>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    background: 'var(--color-primary)',
    color: 'var(--color-white)',
    padding: '16px 0',
  },
  headerInner: {
    maxWidth: 'var(--max-width)',
    margin: '0 auto',
    padding: '0 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: 18,
    fontWeight: 700,
  },
  dashLink: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    textDecoration: 'none',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: 6,
    padding: '6px 14px',
  },
  footer: {
    background: 'var(--color-white)',
    borderTop: '1px solid var(--color-border)',
    padding: '24px 0',
    marginTop: 40,
  },
  footerInner: {
    maxWidth: 'var(--max-width)',
    margin: '0 auto',
    padding: '0 16px',
    textAlign: 'center' as const,
  },
  footerText: {
    fontSize: 13,
    color: 'var(--color-text)',
    fontWeight: 600,
    marginBottom: 8,
  },
  footerSmall: {
    fontSize: 12,
    color: 'var(--color-text-light)',
  },
};
