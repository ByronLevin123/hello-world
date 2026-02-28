import React from 'react';
import { ApplicationSummary } from '../types';
import { StatusBadge } from './StatusBadge';
import { LOAN_TYPE_LABELS } from '../../types/loan';

interface ApplicationTableProps {
  applications: ApplicationSummary[];
  onSelect: (app: ApplicationSummary) => void;
  showCompliance?: boolean;
  showRisk?: boolean;
}

export function ApplicationTable({ applications, onSelect, showCompliance, showRisk }: ApplicationTableProps) {
  const formatGBP = (n: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n);
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  if (applications.length === 0) {
    return <p style={{ padding: 20, textAlign: 'center', color: 'var(--color-text-light)' }}>No applications found</p>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Reference</th>
            <th style={styles.th}>Applicant</th>
            <th style={styles.th}>Type</th>
            <th style={styles.th}>Amount</th>
            <th style={styles.th}>Status</th>
            {showRisk && <th style={styles.th}>Risk</th>}
            {showCompliance && <th style={styles.th}>Compliance</th>}
            <th style={styles.th}>Channel</th>
            <th style={styles.th}>Date</th>
          </tr>
        </thead>
        <tbody>
          {applications.map(app => (
            <tr key={app.id} onClick={() => onSelect(app)} style={styles.row}>
              <td style={styles.td}><strong>{app.reference}</strong></td>
              <td style={styles.td}>{app.first_name} {app.last_name}</td>
              <td style={styles.td}>{LOAN_TYPE_LABELS[app.loan_type as keyof typeof LOAN_TYPE_LABELS] || app.loan_type}</td>
              <td style={styles.td}>{formatGBP(app.loan_amount)}</td>
              <td style={styles.td}><StatusBadge status={app.status} /></td>
              {showRisk && (
                <td style={styles.td}>
                  {app.risk_score != null && (
                    <span style={{ color: app.risk_band === 'high' ? 'var(--color-danger)' : app.risk_band === 'medium' ? 'var(--color-warning)' : 'var(--color-success)' }}>
                      {app.risk_score} ({app.risk_band})
                    </span>
                  )}
                </td>
              )}
              {showCompliance && (
                <td style={styles.td}><StatusBadge status={app.compliance_status} /></td>
              )}
              <td style={styles.td} className="capitalize">{app.source_channel}</td>
              <td style={styles.td}>{formatDate(app.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: 14 },
  th: {
    textAlign: 'left' as const, padding: '10px 12px', borderBottom: '2px solid var(--color-border)',
    fontSize: 12, textTransform: 'uppercase' as const, color: 'var(--color-text-light)', letterSpacing: 0.5,
  },
  td: { padding: '10px 12px', borderBottom: '1px solid var(--color-border)' },
  row: { cursor: 'pointer', transition: 'background 0.15s' },
};
