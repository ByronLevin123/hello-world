import React, { useEffect, useState, useCallback } from 'react';
import { ApplicationSummary } from '../types';
import { fetchApplications } from '../api';
import { ApplicationTable } from '../components/ApplicationTable';
import { ApplicationDetailPanel } from '../components/ApplicationDetailPanel';
import { StatCard } from '../components/StatCard';

export function FrontOfficeView() {
  const [apps, setApps] = useState<ApplicationSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<ApplicationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    fetchApplications(params)
      .then(r => { setApps(r.applications); setTotal(r.total); })
      .catch(() => setError('Failed to load applications'))
      .finally(() => setLoading(false));
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const submitted = apps.filter(a => a.status === 'submitted').length;
  const inProgress = apps.filter(a => a.status === 'under_review' || a.status === 'referred').length;

  return (
    <div>
      <h2 style={{ fontSize: 20, marginBottom: 20 }}>Application Tracker</h2>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <StatCard label="Total Applications" value={total} />
        <StatCard label="New (Submitted)" value={submitted} color="#1a73e8" />
        <StatCard label="In Progress" value={inProgress} color="#e65100" />
      </div>

      <div style={styles.filterBar}>
        <input
          type="text" placeholder="Search by name, reference, or email..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={styles.select}>
          <option value="">All statuses</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="referred">Referred</option>
          <option value="approved">Approved</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      <div style={styles.layout}>
        <div style={{ flex: selected ? 1 : 1 }}>
          <div style={styles.tableCard}>
            {loading ? <p style={{ padding: 20, textAlign: 'center' }}>Loading...</p> : error ? (
              <p style={{ padding: 20, textAlign: 'center', color: '#c62828' }}>{error}</p>
            ) : (
              <ApplicationTable applications={apps} onSelect={setSelected} showRisk showCompliance />
            )}
          </div>
        </div>
        {selected && (
          <div style={{ flex: 1, minWidth: 360 }}>
            <ApplicationDetailPanel
              applicationId={selected.id}
              onClose={() => setSelected(null)}
              role="branch"
              onUpdated={load}
            />
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  filterBar: { display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' as const },
  searchInput: { flex: 1, minWidth: 240, padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 14 },
  select: { padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 14, background: '#fff' },
  layout: { display: 'flex', gap: 20, alignItems: 'flex-start' },
  tableCard: { background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' },
};
