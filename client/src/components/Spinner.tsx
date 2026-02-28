import React from 'react';

interface SpinnerProps {
  size?: number;
  label?: string;
}

export function Spinner({ size = 32, label = 'Loading...' }: SpinnerProps) {
  return (
    <div style={styles.container} role="status" aria-live="polite">
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        style={styles.svg}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" stroke="var(--color-border)" strokeWidth="3" />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="var(--color-primary)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {label && <span style={styles.label}>{label}</span>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  svg: {
    animation: 'spin 1s linear infinite',
  },
  label: {
    fontSize: 14,
    color: 'var(--color-text-light)',
  },
};
