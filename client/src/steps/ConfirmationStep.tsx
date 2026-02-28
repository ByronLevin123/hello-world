import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplication } from '../context/ApplicationContext';
import { StepLayout } from '../components/StepLayout';

export function ConfirmationStep() {
  const { formData, resetForm } = useApplication();
  const navigate = useNavigate();

  function handleNewApplication() {
    resetForm();
    navigate('/');
  }

  return (
    <StepLayout step={8} title="Application submitted">
      <div style={styles.refBox} role="status" aria-live="polite">
        <p style={styles.refLabel} id="ref-label">Your reference number</p>
        <p style={styles.refNumber} aria-labelledby="ref-label">{formData.reference}</p>
      </div>

      <div style={styles.nextSteps}>
        <h3 style={styles.nextTitle}>What happens next</h3>
        <ul style={styles.list}>
          <li>We will review your application within 2 working days</li>
          <li>You will receive a confirmation email at <strong>{formData.email}</strong></li>
          <li>We may contact you if we need further information</li>
          <li>Keep your reference number safe for future enquiries</li>
        </ul>
      </div>

      <button className="btn btn-secondary" style={{ marginTop: 24, minHeight: 44 }} onClick={handleNewApplication}>
        Start a new application
      </button>
    </StepLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  refBox: {
    background: '#eafaf1',
    borderRadius: 'var(--radius)',
    padding: 24,
    textAlign: 'center' as const,
    marginBottom: 24,
  },
  refLabel: {
    fontSize: 14,
    color: 'var(--color-text-light)',
    marginBottom: 8,
  },
  refNumber: {
    fontSize: 28,
    fontWeight: 700,
    color: 'var(--color-primary)',
    letterSpacing: 2,
  },
  nextSteps: {
    background: '#f0f7fb',
    borderRadius: 'var(--radius)',
    padding: 20,
  },
  nextTitle: {
    fontSize: 16,
    marginBottom: 12,
    color: 'var(--color-primary)',
  },
  list: {
    paddingLeft: 20,
    fontSize: 14,
    lineHeight: 1.8,
  },
};
