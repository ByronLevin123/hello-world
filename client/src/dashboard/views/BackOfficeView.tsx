import React, { useEffect, useState, useCallback } from 'react';
import { ApplicationSummary, DashboardStats } from '../types';
import { fetchApplications, fetchDashboardStats } from '../api';
import { ApplicationTable } from '../components/ApplicationTable';
import { ApplicationDetailPanel } from '../components/ApplicationDetailPanel';
import { StatCard } from '../components/StatCard';

export function BackOfficeView() {
  const [apps, setApps] = useState<ApplicationSummary[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [compFilter, setCompFilter] = useState('pending');
  const [selected, setSelected] = useState<ApplicationSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (compFilter) params.complianceStatus = compFilter;
    Promise.all([
      fetchApplications(params),
      fetchDashboardStats(),
    ]).then(([r, s]) => {
      setApps(r.applications);
      setStats(s);
    }).finally(() => setLoading(false));
  }, [compFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <h2 style={{ fontSize: 20, marginBottom: 20 }}>Compliance & AML Review</h2>

      {stats && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <StatCard label="Pending Review" value={stats.compliancePending} color="#e65100" />
          <StatCard label="Flagged" value={stats.complianceFlagged} color="#c62828" />
          <StatCard label="Total Applications" value={stats.totalApplications} />
        </div>
      )}

      {stats && stats.complianceFlagged > 0 && (
        <div style={styles.alertBanner}>
          <strong>{stats.complianceFlagged} application(s) flagged</strong> — requires immediate compliance review and potential SAR filing.
        </div>
      )}

      <div style={styles.filterBar}>
        <div style={styles.tabs}>
          {[
            { value: 'pending', label: 'Pending' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'flagged', label: 'Flagged' },
            { value: 'cleared', label: 'Cleared' },
            { value: '', label: 'All' },
          ].map(t => (
            <button key={t.value} onClick={() => setCompFilter(t.value)}
              style={{
                ...styles.tab,
                background: compFilter === t.value ? 'var(--color-primary)' : '#fff',
                color: compFilter === t.value ? '#fff' : 'var(--color-text)',
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* AML/KYC checklist legend */}
      <div style={styles.checklistCard}>
        <h3 style={styles.checklistTitle}>Required Compliance Checks</h3>
        <div style={styles.checklistGrid}>
          <div style={styles.checkItem}>
            <span style={styles.checkIcon}>AML</span>
            <span>Anti-Money Laundering screening</span>
          </div>
          <div style={styles.checkItem}>
            <span style={styles.checkIcon}>KYC</span>
            <span>Know Your Customer verification</span>
          </div>
          <div style={styles.checkItem}>
            <span style={styles.checkIcon}>Fraud</span>
            <span>Fraud detection screening</span>
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 8 }}>
          All checks must pass before an application can be cleared. Flagged applications require senior compliance officer review.
        </p>
      </div>

      <div style={styles.layout}>
        <div style={{ flex: selected ? 1 : 1 }}>
          <div style={styles.tableCard}>
            {loading ? <p style={{ padding: 20, textAlign: 'center' }}>Loading...</p> : (
              <ApplicationTable applications={apps} onSelect={setSelected} showCompliance showRisk />
            )}
          </div>
        </div>
        {selected && (
          <div style={{ flex: 1, minWidth: 360 }}>
            <ApplicationDetailPanel
              applicationId={selected.id}
              onClose={() => setSelected(null)}
              role="compliance"
              onUpdated={load}
            />
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  alertBanner: {
    background: '#fce4ec', border: '1px solid #ef9a9a', borderRadius: 8,
    padding: '12px 16px', marginBottom: 16, fontSize: 14, color: '#c62828',
  },
  filterBar: { display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' as const },
  tabs: { display: 'flex', gap: 4, background: '#f0f0f0', borderRadius: 8, padding: 3 },
  tab: { border: 'none', borderRadius: 6, padding: '8px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' },
  checklistCard: {
    background: '#fff', borderRadius: 8, padding: 16, marginBottom: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid var(--color-border)',
  },
  checklistTitle: { fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--color-primary)' },
  checklistGrid: { display: 'flex', gap: 24, flexWrap: 'wrap' as const },
  checkItem: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 },
  checkIcon: {
    background: 'var(--color-primary)', color: '#fff', padding: '2px 8px',
    borderRadius: 4, fontSize: 11, fontWeight: 700,
  },
  layout: { display: 'flex', gap: 20, alignItems: 'flex-start' },
  tableCard: { background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' },
};
