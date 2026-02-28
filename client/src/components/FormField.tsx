import React from 'react';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

export function FormField({ label, htmlFor, error, hint, children }: FormFieldProps) {
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;
  const hintId = htmlFor ? `${htmlFor}-hint` : undefined;

  return (
    <div style={{ marginBottom: 20 }}>
      <label htmlFor={htmlFor} style={styles.label}>{label}</label>
      {hint && <p id={hintId} style={styles.hint}>{hint}</p>}
      {children}
      {error && (
        <p id={errorId} className="error-text" role="alert" aria-live="assertive">
          {error}
        </p>
      )}
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
