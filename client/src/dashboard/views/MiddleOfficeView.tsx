import React, { useEffect, useState, useCallback } from 'react';
import { ApplicationSummary } from '../types';
import { fetchApplications, fetchDashboardStats } from '../api';
import { ApplicationTable } from '../components/ApplicationTable';
import { ApplicationDetailPanel } from '../components/ApplicationDetailPanel';
import { StatCard } from '../components/StatCard';
import { DashboardStats } from '../types';

export function MiddleOfficeView() {
  const [apps, setApps] = useState<ApplicationSummary[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [queueFilter, setQueueFilter] = useState('under_review');
  const [riskFilter, setRiskFilter] = useState('');
  const [selected, setSelected] = useState<ApplicationSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (queueFilter) params.status = queueFilter;
    if (riskFilter) params.riskBand = riskFilter;
    Promise.all([
      fetchApplications(params),
      fetchDashboardStats(),
    ]).then(([r, s]) => {
      setApps(r.applications);
      setStats(s);
    }).finally(() => setLoading(false));
  }, [queueFilter, riskFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <h2 style={{ fontSize: 20, marginBottom: 20 }}>Underwriting Queue</h2>

      {stats && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <StatCard label="Awaiting Review" value={stats.submitted + stats.underReview} color="#e65100" />
          <StatCard label="Referred" value={stats.referred} color="#7b1fa2" />
          <StatCard label="Approved" value={stats.approved} color="#2e7d32" />
          <StatCard label="Declined" value={stats.declined} color="#c62828" />
          <StatCard label="Avg Risk Score" value={stats.avgRiskScore} color={stats.avgRiskScore >= 600 ? '#2e7d32' : '#e65100'} />
        </div>
      )}

      <div style={styles.filterBar}>
        <div style={styles.tabs}>
          {[
            { value: 'submitted', label: 'New' },
            { value: 'under_review', label: 'In Review' },
            { value: 'referred', label: 'Referred' },
            { value: 'approved', label: 'Approved' },
            { value: 'declined', label: 'Declined' },
            { value: '', label: 'All' },
          ].map(t => (
            <button key={t.value} onClick={() => setQueueFilter(t.value)}
              style={{
                ...styles.tab,
                background: queueFilter === t.value ? 'var(--color-primary)' : '#fff',
                color: queueFilter === t.value ? '#fff' : 'var(--color-text)',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} style={styles.select}>
          <option value="">All risk bands</option>
          <option value="low">Low risk</option>
          <option value="medium">Medium risk</option>
          <option value="high">High risk</option>
        </select>
      </div>

      <div style={styles.layout}>
        <div style={{ flex: selected ? 1 : 1 }}>
          <div style={styles.tableCard}>
            {loading ? <p style={{ padding: 20, textAlign: 'center' }}>Loading...</p> : (
              <ApplicationTable applications={apps} onSelect={setSelected} showRisk />
            )}
          </div>
        </div>
        {selected && (
          <div style={{ flex: 1, minWidth: 360 }}>
            <ApplicationDetailPanel
              applicationId={selected.id}
              onClose={() => setSelected(null)}
              role="underwriter"
              onUpdated={load}
            />
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  filterBar: { display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' as const, alignItems: 'center' },
  tabs: { display: 'flex', gap: 4, background: '#f0f0f0', borderRadius: 8, padding: 3 },
  tab: { border: 'none', borderRadius: 6, padding: '8px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' },
  select: { padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 14, background: '#fff' },
  layout: { display: 'flex', gap: 20, alignItems: 'flex-start' },
  tableCard: { background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' },
};
