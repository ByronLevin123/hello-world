import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplication } from '../context/ApplicationContext';
import { StepLayout } from '../components/StepLayout';
import { FormField } from '../components/FormField';
import { FCADisclosure } from '../components/FCADisclosure';
import { REPRESENTATIVE_APRS } from '../types/loan';
import { formatGBP, formatGBPNoPence, calculateMonthlyRepayment } from '../utils/formatters';

const TERMS = [12, 24, 36, 48, 60];

export function LoanDetailsStep() {
  const { formData, updateFormData, setCurrentStep } = useApplication();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const amount = formData.loanAmount ?? 5000;
  const term = formData.loanTermMonths ?? 36;
  const apr = formData.loanType ? REPRESENTATIVE_APRS[formData.loanType] : 6.9;
  const monthly = calculateMonthlyRepayment(amount, apr, term);
  const total = monthly * term;
  const totalInterest = total - amount;

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (amount < 1000 || amount > 25000) errs.loanAmount = 'Loan amount must be between £1,000 and £25,000';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) {
      updateFormData({
        loanAmount: amount,
        loanTermMonths: term,
      });
      setCurrentStep(6);
      navigate('/affordability');
    }
  }

  return (
    <StepLayout
      step={5}
      title="How much would you like to borrow?"
      onBack={() => { setCurrentStep(4); navigate('/employment'); }}
    >
      <form onSubmit={handleSubmit}>
        <FormField label={`Loan amount: ${formatGBPNoPence(amount)}`} error={errors.loanAmount}>
          <input
            type="range"
            min="1000"
            max="25000"
            step="500"
            value={amount}
            onChange={e => updateFormData({ loanAmount: parseInt(e.target.value) })}
            style={{ width: '100%' }}
          />
          <div style={styles.rangeLabels}>
            <span>£1,000</span>
            <span>£25,000</span>
          </div>
        </FormField>

        <FormField label="Loan term">
          <div style={styles.termGrid}>
            {TERMS.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => updateFormData({ loanTermMonths: t })}
                style={{
                  ...styles.termBtn,
                  background: term === t ? 'var(--color-primary)' : 'var(--color-white)',
                  color: term === t ? 'var(--color-white)' : 'var(--color-text)',
                  borderColor: term === t ? 'var(--color-primary)' : 'var(--color-border)',
                }}
              >
                {t / 12} {t === 12 ? 'year' : 'years'}
              </button>
            ))}
          </div>
        </FormField>

        <div style={styles.preview}>
          <h3 style={styles.previewTitle}>Your repayment summary</h3>
          <div style={styles.previewRow}>
            <span>Monthly repayment</span>
            <strong>{formatGBP(monthly)}</strong>
          </div>
          <div style={styles.previewRow}>
            <span>Total amount repayable</span>
            <strong>{formatGBP(total)}</strong>
          </div>
          <div style={styles.previewRow}>
            <span>Total cost of credit</span>
            <strong>{formatGBP(totalInterest)}</strong>
          </div>
          <div style={styles.previewRow}>
            <span>Representative APR</span>
            <strong>{apr}%</strong>
          </div>
        </div>

        <FCADisclosure apr={apr} />

        <button type="submit" className="btn btn-primary" style={{ marginTop: 24 }}>
          Continue
        </button>
      </form>
    </StepLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  rangeLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 13,
    color: 'var(--color-text-light)',
    marginTop: 4,
  },
  termGrid: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap' as const,
  },
  termBtn: {
    padding: '10px 20px',
    border: '2px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
    transition: 'all 0.2s',
  },
  preview: {
    background: '#f0f7fb',
    borderRadius: 'var(--radius)',
    padding: 20,
    marginTop: 24,
  },
  previewTitle: {
    fontSize: 16,
    marginBottom: 12,
    color: 'var(--color-primary)',
  },
  previewRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid var(--color-border)',
    fontSize: 15,
  },
};
