import React from 'react';

const STEP_LABELS = [
  'Loan Type',
  'Personal',
  'Address',
  'Employment',
  'Loan Details',
  'Affordability',
  'Review',
  'Confirmation',
];

interface ProgressBarProps {
  currentStep: number;
}

export function ProgressBar({ currentStep }: ProgressBarProps) {
  if (currentStep === 8) return null;

  return (
    <div style={styles.container}>
      <div style={styles.barTrack}>
        <div style={{ ...styles.barFill, width: `${((currentStep) / 7) * 100}%` }} />
      </div>
      <div style={styles.labels}>
        {STEP_LABELS.slice(0, 7).map((label, i) => (
          <span
            key={label}
            style={{
              ...styles.label,
              fontWeight: i + 1 === currentStep ? 700 : 400,
              color: i + 1 <= currentStep ? 'var(--color-primary)' : 'var(--color-text-light)',
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { marginBottom: 32 },
  barTrack: {
    height: 6,
    background: 'var(--color-border)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    height: '100%',
    background: 'var(--color-primary)',
    borderRadius: 3,
    transition: 'width 0.3s ease',
  },
  labels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 11,
  },
  label: {
    textAlign: 'center' as const,
  },
};
