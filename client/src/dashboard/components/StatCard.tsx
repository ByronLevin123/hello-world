import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

export function StatCard({ label, value, subtitle, color }: StatCardProps) {
  return (
    <div style={styles.card}>
      <p style={styles.label}>{label}</p>
      <p style={{ ...styles.value, color: color || 'var(--color-primary)' }}>{value}</p>
      {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: '#fff', borderRadius: 8, padding: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)', flex: '1 1 0',
    minWidth: 140,
  },
  label: { fontSize: 12, color: 'var(--color-text-light)', marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  value: { fontSize: 28, fontWeight: 700, lineHeight: 1.2 },
  subtitle: { fontSize: 12, color: 'var(--color-text-light)', marginTop: 4 },
};
