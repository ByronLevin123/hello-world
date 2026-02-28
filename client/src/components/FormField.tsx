import React from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

export function FormField({ label, error, hint, children }: FormFieldProps) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={styles.label}>{label}</label>
      {hint && <p style={styles.hint}>{hint}</p>}
      {children}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  label: {
    display: 'block',
    fontWeight: 600,
    marginBottom: 6,
    fontSize: 14,
  },
  hint: {
    fontSize: 13,
    color: 'var(--color-text-light)',
    marginBottom: 6,
    marginTop: -2,
  },
};
