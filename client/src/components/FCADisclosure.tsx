import React from 'react';

interface FCADisclosureProps {
  apr?: number;
}

export function FCADisclosure({ apr }: FCADisclosureProps) {
  return (
    <div style={styles.box}>
      {apr != null && (
        <p style={styles.apr}>
          Representative <strong>{apr}% APR</strong> (variable)
        </p>
      )}
      <p style={styles.warning}>
        Credit is subject to status. Think carefully before securing other debts against your home.
        Your home may be repossessed if you do not keep up repayments on your mortgage.
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  box: {
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    padding: 16,
    background: '#fef9e7',
    marginTop: 24,
  },
  apr: {
    fontSize: 14,
    marginBottom: 8,
  },
  warning: {
    fontSize: 13,
    color: 'var(--color-text-light)',
    lineHeight: 1.5,
  },
};
