import React from 'react';

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  title: string;
  formatValue?: (v: number) => string;
}

export function BarChart({ data, title, formatValue }: BarChartProps) {
  const max = Math.max(...data.map(d => d.value), 1);
  const fmt = formatValue || ((v: number) => String(v));

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>{title}</h3>
      <div style={styles.chart}>
        {data.map((d, i) => (
          <div key={i} style={styles.row}>
            <span style={styles.label}>{d.label}</span>
            <div style={styles.barTrack}>
              <div style={{
                ...styles.barFill,
                width: `${(d.value / max) * 100}%`,
                background: d.color || 'var(--color-primary)',
              }} />
            </div>
            <span style={styles.value}>{fmt(d.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: { background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  title: { fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--color-primary)' },
  chart: { display: 'flex', flexDirection: 'column' as const, gap: 10 },
  row: { display: 'flex', alignItems: 'center', gap: 8 },
  label: { fontSize: 12, color: 'var(--color-text-light)', minWidth: 90, textTransform: 'capitalize' as const },
  barTrack: { flex: 1, height: 20, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4, transition: 'width 0.3s' },
  value: { fontSize: 13, fontWeight: 600, minWidth: 50, textAlign: 'right' as const },
};
