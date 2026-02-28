import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplication } from '../context/ApplicationContext';
import { StepLayout } from '../components/StepLayout';
import { checkAffordability } from '../utils/api';
import { formatGBP } from '../utils/formatters';
import { AffordabilityCheckResponse } from '../types/loan';

export function AffordabilityStep() {
  const { formData, updateFormData, setCurrentStep } = useApplication();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AffordabilityCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!formData.loanType || !formData.annualIncome || !formData.loanAmount || !formData.loanTermMonths) {
      navigate('/');
      return;
    }

    setLoading(true);
    checkAffordability({
      annualIncome: formData.annualIncome,
      monthlyOutgoings: formData.monthlyOutgoings ?? 0,
      loanAmount: formData.loanAmount,
      loanTermMonths: formData.loanTermMonths,
      loanType: formData.loanType,
    })
      .then(data => {
        setResult(data);
        updateFormData({
          monthlyRepayment: data.monthlyRepayment,
          representativeApr: data.representativeApr,
          totalRepayable: data.totalRepayable,
          affordabilityPassed: data.affordabilityPassed,
        });
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <StepLayout step={6} title="Checking affordability...">
        <div style={styles.loading}>
          <p>Checking affordability...</p>
        </div>
      </StepLayout>
    );
  }

  if (error) {
    return (
      <StepLayout step={6} title="Affordability Check" onBack={() => { setCurrentStep(5); navigate('/loan-details'); }}>
        <div style={styles.errorBox}>
          <p>Something went wrong: {error}</p>
          <button className="btn btn-secondary" onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      </StepLayout>
    );
  }

  return (
    <StepLayout
      step={6}
      title="Affordability Check"
      onBack={() => { setCurrentStep(5); navigate('/loan-details'); }}
    >
      {result?.affordabilityPassed ? (
        <div>
          <div style={styles.passBox}>
            <h2 style={styles.passTitle}>Good news</h2>
            <p>Based on your income and outgoings, this loan appears affordable.</p>
          </div>
          <div style={styles.summary}>
            <div style={styles.summaryRow}>
              <span>Monthly repayment</span>
              <strong>{formatGBP(result.monthlyRepayment)}</strong>
            </div>
            <div style={styles.summaryRow}>
              <span>Disposable income remaining</span>
              <strong>{formatGBP(result.disposableIncome)}</strong>
            </div>
          </div>
          <button
            className="btn btn-primary"
            style={{ marginTop: 24 }}
            onClick={() => { setCurrentStep(7); navigate('/review'); }}
          >
            Continue to review
          </button>
        </div>
      ) : (
        <div>
          <div style={styles.failBox}>
            <h2 style={styles.failTitle}>Affordability concern</h2>
            <p>Based on the information provided, this loan may not be affordable.</p>
            {result?.reason && <p style={{ marginTop: 8, fontSize: 14 }}>{result.reason}</p>}
          </div>
          <p style={{ marginTop: 16, fontSize: 14, color: 'var(--color-text-light)' }}>
            You may wish to reduce your loan amount or extend the loan term.
          </p>
          <button
            className="btn btn-secondary"
            style={{ marginTop: 16 }}
            onClick={() => { setCurrentStep(5); navigate('/loan-details'); }}
          >
            Adjust your loan
          </button>
        </div>
      )}
    </StepLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loading: {
    textAlign: 'center' as const,
    padding: 40,
    color: 'var(--color-text-light)',
  },
  errorBox: {
    padding: 20,
    background: '#fdecea',
    borderRadius: 'var(--radius)',
    textAlign: 'center' as const,
  },
  passBox: {
    padding: 20,
    background: '#eafaf1',
    borderRadius: 'var(--radius)',
    borderLeft: '4px solid var(--color-success)',
  },
  passTitle: {
    color: 'var(--color-success)',
    fontSize: 18,
    marginBottom: 8,
  },
  failBox: {
    padding: 20,
    background: '#fef5e7',
    borderRadius: 'var(--radius)',
    borderLeft: '4px solid var(--color-warning)',
  },
  failTitle: {
    color: 'var(--color-warning)',
    fontSize: 18,
    marginBottom: 8,
  },
  summary: {
    marginTop: 20,
    background: '#f0f7fb',
    borderRadius: 'var(--radius)',
    padding: 16,
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid var(--color-border)',
    fontSize: 15,
  },
};
