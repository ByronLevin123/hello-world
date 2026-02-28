import React, { Suspense, lazy } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy-load route components for code splitting
const LoanTypeStep = lazy(() => import('./steps/LoanTypeStep').then(m => ({ default: m.LoanTypeStep })));
const PersonalDetailsStep = lazy(() => import('./steps/PersonalDetailsStep').then(m => ({ default: m.PersonalDetailsStep })));
const AddressStep = lazy(() => import('./steps/AddressStep').then(m => ({ default: m.AddressStep })));
const EmploymentStep = lazy(() => import('./steps/EmploymentStep').then(m => ({ default: m.EmploymentStep })));
const LoanDetailsStep = lazy(() => import('./steps/LoanDetailsStep').then(m => ({ default: m.LoanDetailsStep })));
const AffordabilityStep = lazy(() => import('./steps/AffordabilityStep').then(m => ({ default: m.AffordabilityStep })));
const ReviewStep = lazy(() => import('./steps/ReviewStep').then(m => ({ default: m.ReviewStep })));
const ConfirmationStep = lazy(() => import('./steps/ConfirmationStep').then(m => ({ default: m.ConfirmationStep })));
const DashboardShell = lazy(() => import('./dashboard/DashboardShell').then(m => ({ default: m.DashboardShell })));

function LoadingFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
      <p style={{ color: 'var(--color-text-light)', fontSize: 14 }}>Loading...</p>
    </div>
  );
}

export function App() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  if (isDashboard) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <DashboardShell />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <div>
      <a href="#main-content" style={styles.skipLink}>Skip to main content</a>

      <header style={styles.header} role="banner">
        <div style={styles.headerInner}>
          <h2 style={styles.logo}>UK Loan Application</h2>
          <Link to="/dashboard" style={styles.dashLink}>Staff Dashboard</Link>
        </div>
      </header>

      <main id="main-content" aria-label="Loan application form">
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
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
          </Suspense>
        </ErrorBoundary>
      </main>

      <footer style={styles.footer} role="contentinfo">
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
  skipLink: {
    position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px',
    overflow: 'hidden', zIndex: 9999, background: 'var(--color-primary)', color: '#fff',
    padding: '8px 16px', textDecoration: 'none',
  },
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
  logo: { fontSize: 18, fontWeight: 700 },
  dashLink: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    textDecoration: 'none',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: 6,
    padding: '6px 14px',
    minHeight: 44,
    display: 'inline-flex',
    alignItems: 'center',
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
  footerText: { fontSize: 13, color: 'var(--color-text)', fontWeight: 600, marginBottom: 8 },
  footerSmall: { fontSize: 12, color: 'var(--color-text-light)' },
};
