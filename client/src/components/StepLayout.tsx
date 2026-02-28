import React from 'react';
import { ProgressBar } from './ProgressBar';

interface StepLayoutProps {
  step: number;
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
}

export function StepLayout({ step, title, children, onBack }: StepLayoutProps) {
  return (
    <div style={styles.wrapper}>
      <ProgressBar currentStep={step} />
      <div style={styles.card}>
        {onBack && (
          <button onClick={onBack} style={styles.backBtn}>
            &larr; Back
          </button>
        )}
        <h1 style={styles.title}>{title}</h1>
        {children}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    maxWidth: 'var(--max-width)',
    margin: '0 auto',
    padding: '24px 16px',
  },
  card: {
    background: 'var(--color-white)',
    borderRadius: 'var(--radius)',
    padding: 32,
    boxShadow: 'var(--shadow)',
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    color: 'var(--color-primary)',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-primary-light)',
    fontSize: 14,
    marginBottom: 12,
    padding: 0,
    cursor: 'pointer',
  },
};
