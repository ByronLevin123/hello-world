import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplication } from '../context/ApplicationContext';
import { StepLayout } from '../components/StepLayout';
import { FCADisclosure } from '../components/FCADisclosure';
import { LoanType, LOAN_TYPE_LABELS, REPRESENTATIVE_APRS } from '../types/loan';

const LOAN_TYPES: { type: LoanType; description: string }[] = [
  { type: 'personal_loan', description: 'For any personal expense — holidays, weddings, or big purchases.' },
  { type: 'car_loan', description: 'Finance your next vehicle with competitive rates.' },
  { type: 'home_improvement', description: 'Upgrade your home with our lowest rates.' },
  { type: 'debt_consolidation', description: 'Simplify your finances by combining existing debts.' },
];

export function LoanTypeStep() {
  const { formData, updateFormData, setCurrentStep } = useApplication();
  const navigate = useNavigate();

  function handleSelect(type: LoanType) {
    updateFormData({ loanType: type });
    setCurrentStep(2);
    navigate('/personal-details');
  }

  return (
    <StepLayout step={1} title="What would you like the loan for?">
      <div style={styles.grid}>
        {LOAN_TYPES.map(({ type, description }) => (
          <button
            key={type}
            onClick={() => handleSelect(type)}
            style={{
              ...styles.card,
              borderColor: formData.loanType === type ? 'var(--color-primary)' : 'var(--color-border)',
              background: formData.loanType === type ? '#eaf2f8' : 'var(--color-white)',
            }}
          >
            <h3 style={styles.cardTitle}>{LOAN_TYPE_LABELS[type]}</h3>
            <p style={styles.cardDesc}>{description}</p>
            <p style={styles.apr}>Representative {REPRESENTATIVE_APRS[type]}% APR</p>
          </button>
        ))}
      </div>
      <FCADisclosure />
    </StepLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },
  card: {
    border: '2px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    padding: 20,
    textAlign: 'left' as const,
    cursor: 'pointer',
    transition: 'border-color 0.2s, background 0.2s',
  },
  cardTitle: {
    fontSize: 16,
    marginBottom: 8,
    color: 'var(--color-primary)',
  },
  cardDesc: {
    fontSize: 13,
    color: 'var(--color-text-light)',
    marginBottom: 12,
  },
  apr: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text)',
  },
};
