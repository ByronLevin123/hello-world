import React, { useEffect, useState } from 'react';
import { DashboardStats } from '../types';
import { fetchDashboardStats } from '../api';
import { StatCard } from '../components/StatCard';
import { BarChart } from '../components/BarChart';

const LOAN_TYPE_LABELS: Record<string, string> = {
  personal_loan: 'Personal', car_loan: 'Car', home_improvement: 'Home', debt_consolidation: 'Debt Consol.',
};
const RISK_COLORS: Record<string, string> = { low: '#2e7d32', medium: '#e65100', high: '#c62828', unscored: '#999' };
const CHANNEL_COLORS: Record<string, string> = { online: '#1a73e8', branch: '#2e7d32', phone: '#e65100' };

const fmtGBP = (n: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n);

export function ExecutiveView() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return <p style={{ padding: 40, textAlign: 'center' }}>Loading dashboard...</p>;

  return (
    <div>
      <h2 style={styles.heading}>Portfolio Overview</h2>

      {/* KPI cards */}
      <div style={styles.statsGrid}>
        <StatCard label="Total Applications" value={stats.totalApplications} />
        <StatCard label="Pipeline Value" value={fmtGBP(stats.totalPipelineValue)} />
        <StatCard label="Avg Loan Size" value={fmtGBP(stats.avgLoanAmount)} />
        <StatCard label="Approval Rate" value={`${stats.approvalRate}%`} color={stats.approvalRate >= 60 ? '#2e7d32' : '#e65100'} />
        <StatCard label="Avg Risk Score" value={stats.avgRiskScore} color={stats.avgRiskScore >= 600 ? '#2e7d32' : '#e65100'} />
      </div>

      {/* Status pipeline */}
      <div style={styles.pipelineCard}>
        <h3 style={styles.sectionTitle}>Application Pipeline</h3>
        <div style={styles.pipeline}>
          <PipelineStage label="Submitted" count={stats.submitted} color="#1a73e8" total={stats.totalApplications} />
          <PipelineStage label="Under Review" count={stats.underReview} color="#e65100" total={stats.totalApplications} />
          <PipelineStage label="Referred" count={stats.referred} color="#7b1fa2" total={stats.totalApplications} />
          <PipelineStage label="Approved" count={stats.approved} color="#2e7d32" total={stats.totalApplications} />
          <PipelineStage label="Declined" count={stats.declined} color="#c62828" total={stats.totalApplications} />
        </div>
      </div>

      {/* Compliance alerts */}
      {(stats.compliancePending > 0 || stats.complianceFlagged > 0) && (
        <div style={styles.alertCard}>
          <h3 style={{ ...styles.sectionTitle, color: '#c62828' }}>Compliance Alerts</h3>
          <div style={{ display: 'flex', gap: 24 }}>
            <div><span style={styles.alertNum}>{stats.compliancePending}</span> pending compliance review</div>
            {stats.complianceFlagged > 0 && (
              <div><span style={{ ...styles.alertNum, color: '#c62828' }}>{stats.complianceFlagged}</span> flagged for investigation</div>
            )}
          </div>
        </div>
      )}

      {/* Charts row */}
      <div style={styles.chartsGrid}>
        <BarChart
          title="By Loan Type"
          data={stats.byLoanType.map(d => ({
            label: LOAN_TYPE_LABELS[d.loan_type] || d.loan_type,
            value: d.count,
            color: 'var(--color-primary)',
          }))}
        />
        <BarChart
          title="By Risk Band"
          data={stats.byRiskBand.map(d => ({
            label: d.risk_band,
            value: d.count,
            color: RISK_COLORS[d.risk_band] || '#999',
          }))}
        />
        <BarChart
          title="By Channel"
          data={stats.byChannel.map(d => ({
            label: d.source_channel,
            value: d.count,
            color: CHANNEL_COLORS[d.source_channel] || '#999',
          }))}
        />
      </div>

      {/* Monthly trend */}
      {stats.byMonth.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <BarChart
            title="Monthly Application Volume"
            data={stats.byMonth.map(d => ({
              label: d.month,
              value: d.count,
              color: 'var(--color-primary-light)',
            }))}
          />
        </div>
      )}

      {/* Lending value by type */}
      <div style={{ marginTop: 20 }}>
        <BarChart
          title="Lending Value by Product"
          data={stats.byLoanType.map(d => ({
            label: LOAN_TYPE_LABELS[d.loan_type] || d.loan_type,
            value: d.total_value,
            color: '#1a5276',
          }))}
          formatValue={fmtGBP}
        />
      </div>
    </div>
  );
}

function PipelineStage({ label, count, color, total }: { label: string; count: number; color: string; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ flex: 1, textAlign: 'center' as const }}>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{count}</div>
      <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 2 }}>{label}</div>
      <div style={{ fontSize: 11, color: 'var(--color-text-light)' }}>{pct}%</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading: { fontSize: 20, marginBottom: 20 },
  statsGrid: { display: 'flex', gap: 16, flexWrap: 'wrap' as const, marginBottom: 20 },
  pipelineCard: { background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--color-primary)' },
  pipeline: { display: 'flex', gap: 8 },
  alertCard: { background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 8, padding: 16, marginBottom: 20 },
  alertNum: { fontWeight: 700, fontSize: 18, color: '#e65100', marginRight: 4 },
  chartsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 },
};
