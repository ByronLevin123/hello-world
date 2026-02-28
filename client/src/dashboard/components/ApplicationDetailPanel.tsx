import React, { useEffect, useState } from 'react';
import { ApplicationDetail } from '../types';
import { StatusBadge } from './StatusBadge';
import { fetchApplicationDetail, updateApplication, addApplicationNote } from '../api';

interface Props {
  applicationId: string;
  onClose: () => void;
  role: string;
  onUpdated?: () => void;
}

const formatGBP = (n: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n);
const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export function ApplicationDetailPanel({ applicationId, onClose, role, onUpdated }: Props) {
  const [app, setApp] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchApplicationDetail(applicationId)
      .then(setApp)
      .catch(() => setError('Failed to load application details'))
      .finally(() => setLoading(false));
  }, [applicationId]);

  async function handleAction(action: Record<string, unknown>) {
    setActionLoading(true);
    setError(null);
    try {
      const updated = await updateApplication(applicationId, action);
      setApp(updated);
      onUpdated?.();
    } catch {
      setError('Action failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAddNote() {
    if (!noteText.trim()) return;
    try {
      await addApplicationNote(applicationId, noteText.trim());
      setNoteText('');
      const updated = await fetchApplicationDetail(applicationId);
      setApp(updated);
    } catch {
      setError('Failed to add note. Please try again.');
    }
  }

  if (loading) {
    return <div style={styles.panel}><p style={{ padding: 40, textAlign: 'center' }}>Loading...</p></div>;
  }

  if (error && !app) {
    return <div style={styles.panel}><p style={{ padding: 40, textAlign: 'center', color: '#c62828' }}>{error}</p></div>;
  }

  if (!app) {
    return <div style={styles.panel}><p style={{ padding: 40, textAlign: 'center' }}>Application not found</p></div>;
  }

  return (
    <div style={styles.panel}>
      {error && <div style={{ padding: '8px 20px', background: '#fce4ec', color: '#c62828', fontSize: 13 }}>{error}</div>}
      <div style={styles.panelHeader}>
        <div>
          <h2 style={styles.panelTitle}>{app.reference}</h2>
          <p style={styles.panelSubtitle}>{app.first_name} {app.last_name}</p>
        </div>
        <button onClick={onClose} style={styles.closeBtn}>Close</button>
      </div>

      <div style={styles.badges}>
        <StatusBadge status={app.status} />
        <StatusBadge status={app.compliance_status} />
        {app.risk_band && (
          <span style={{
            padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
            background: app.risk_band === 'high' ? '#fce4ec' : app.risk_band === 'medium' ? '#fff3e0' : '#e8f5e9',
            color: app.risk_band === 'high' ? '#c62828' : app.risk_band === 'medium' ? '#e65100' : '#2e7d32',
          }}>
            Risk: {app.risk_score} ({app.risk_band})
          </span>
        )}
      </div>

      {/* Summary sections */}
      <div style={styles.sections}>
        <Section title="Loan Details">
          <Row label="Type" value={app.loan_type.replace(/_/g, ' ')} />
          <Row label="Amount" value={formatGBP(app.loan_amount)} />
          <Row label="Term" value={`${app.loan_term_months} months`} />
          <Row label="APR" value={`${app.representative_apr}%`} />
          <Row label="Monthly Repayment" value={formatGBP(app.monthly_repayment)} />
          <Row label="Affordability" value={app.affordability_passed ? 'Passed' : 'Failed'} />
        </Section>

        <Section title="Personal Details">
          <Row label="Name" value={`${app.first_name} ${app.last_name}`} />
          <Row label="DOB" value={new Date(app.date_of_birth).toLocaleDateString('en-GB')} />
          <Row label="Email" value={app.email} />
          <Row label="Phone" value={app.phone} />
        </Section>

        <Section title="Address">
          <Row label="Address" value={[app.address_line_1, app.address_line_2, app.city, app.county, app.postcode].filter(Boolean).join(', ')} />
        </Section>

        <Section title="Employment & Income">
          <Row label="Status" value={app.employment_status.replace(/_/g, ' ')} />
          {app.employer_name && <Row label="Employer" value={app.employer_name} />}
          <Row label="Annual Income" value={formatGBP(app.annual_income)} />
          <Row label="Monthly Outgoings" value={formatGBP(app.monthly_outgoings)} />
        </Section>

        {/* Compliance section */}
        <Section title="Compliance Checks">
          <Row label="AML" value={app.aml_check_passed == null ? 'Not checked' : app.aml_check_passed ? 'Passed' : 'FAILED'} />
          <Row label="KYC" value={app.kyc_check_passed == null ? 'Not checked' : app.kyc_check_passed ? 'Passed' : 'FAILED'} />
          <Row label="Fraud" value={app.fraud_check_passed == null ? 'Not checked' : app.fraud_check_passed ? 'Passed' : 'FAILED'} />
          {app.compliance_reviewed_by && <Row label="Reviewed by" value={`${app.compliance_reviewed_by} on ${formatDate(app.compliance_reviewed_at!)}`} />}
        </Section>

        {app.decision && (
          <Section title="Decision">
            <Row label="Decision" value={app.decision} />
            {app.decision_by && <Row label="By" value={app.decision_by} />}
            {app.decision_at && <Row label="Date" value={formatDate(app.decision_at)} />}
            {app.decision_notes && <Row label="Notes" value={app.decision_notes} />}
          </Section>
        )}
      </div>

      {/* Action buttons based on role */}
      {role === 'underwriter' && app.status !== 'approved' && app.status !== 'declined' && (
        <div style={styles.actions}>
          <h3 style={styles.actionTitle}>Underwriting Actions</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {app.status === 'submitted' && (
              <button style={{ ...styles.actionBtn, background: '#e65100', color: '#fff' }}
                disabled={actionLoading}
                onClick={() => handleAction({ status: 'under_review', assignedTo: 'Staff User' })}>
                Start Review
              </button>
            )}
            <button style={{ ...styles.actionBtn, background: '#2e7d32', color: '#fff' }}
              disabled={actionLoading}
              onClick={() => handleAction({ status: 'approved', decision: 'approved', decisionBy: 'Staff User', decisionNotes: 'Application meets all criteria' })}>
              Approve
            </button>
            <button style={{ ...styles.actionBtn, background: '#c62828', color: '#fff' }}
              disabled={actionLoading}
              onClick={() => handleAction({ status: 'declined', decision: 'declined', decisionBy: 'Staff User', decisionNotes: 'Does not meet lending criteria' })}>
              Decline
            </button>
            <button style={{ ...styles.actionBtn, background: '#7b1fa2', color: '#fff' }}
              disabled={actionLoading}
              onClick={() => handleAction({ status: 'referred', assignedTo: 'Senior Underwriter' })}>
              Refer
            </button>
          </div>
        </div>
      )}

      {role === 'compliance' && (
        <div style={styles.actions}>
          <h3 style={styles.actionTitle}>Compliance Actions</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button style={{ ...styles.actionBtn, background: '#1a73e8', color: '#fff' }}
              disabled={actionLoading}
              onClick={() => handleAction({ complianceStatus: 'in_progress', complianceReviewedBy: 'Staff User' })}>
              Start Review
            </button>
            <button style={{ ...styles.actionBtn, background: '#2e7d32', color: '#fff' }}
              disabled={actionLoading}
              onClick={() => handleAction({ complianceStatus: 'cleared', amlCheckPassed: true, kycCheckPassed: true, fraudCheckPassed: true, complianceReviewedBy: 'Staff User' })}>
              Clear All Checks
            </button>
            <button style={{ ...styles.actionBtn, background: '#c62828', color: '#fff' }}
              disabled={actionLoading}
              onClick={() => handleAction({ complianceStatus: 'flagged', complianceReviewedBy: 'Staff User' })}>
              Flag for Review
            </button>
          </div>
        </div>
      )}

      {/* Notes */}
      <div style={styles.notesSection}>
        <h3 style={styles.actionTitle}>Notes ({app.notes.length})</h3>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            type="text" placeholder="Add a note..."
            value={noteText} onChange={e => setNoteText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddNote()}
            style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 14 }}
          />
          <button onClick={handleAddNote} style={{ ...styles.actionBtn, background: 'var(--color-primary)', color: '#fff' }}>Add</button>
        </div>
        {app.notes.map(n => (
          <div key={n.id} style={styles.note}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <strong style={{ fontSize: 13 }}>{n.author}</strong>
              <span style={{ fontSize: 11, color: 'var(--color-text-light)' }}>{formatDate(n.created_at)}</span>
            </div>
            <p style={{ fontSize: 13 }}>{n.content}</p>
          </div>
        ))}
      </div>

      {/* Audit trail */}
      <div style={styles.notesSection}>
        <h3 style={styles.actionTitle}>Audit Trail ({app.auditEvents.length})</h3>
        {app.auditEvents.map(e => (
          <div key={e.id} style={styles.auditRow}>
            <span style={{ fontSize: 11, color: 'var(--color-text-light)', minWidth: 130 }}>{formatDate(e.created_at)}</span>
            <span style={{ fontSize: 13 }}><strong>{e.performed_by}</strong>: {e.details}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h3 style={{ fontSize: 14, color: 'var(--color-primary)', marginBottom: 8, borderBottom: '1px solid var(--color-border)', paddingBottom: 4 }}>{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 13 }}>
      <span style={{ color: 'var(--color-text-light)' }}>{label}</span>
      <span style={{ textTransform: 'capitalize' as const }}>{value}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: { background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.12)', overflow: 'auto', maxHeight: 'calc(100vh - 160px)' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px 20px 12px', borderBottom: '1px solid var(--color-border)' },
  panelTitle: { fontSize: 20, color: 'var(--color-primary)' },
  panelSubtitle: { fontSize: 14, color: 'var(--color-text-light)' },
  closeBtn: { background: 'none', border: '1px solid var(--color-border)', borderRadius: 6, padding: '6px 16px', cursor: 'pointer', fontSize: 13 },
  badges: { display: 'flex', gap: 8, padding: '12px 20px', flexWrap: 'wrap' as const },
  sections: { padding: '0 20px' },
  actions: { padding: '16px 20px', borderTop: '1px solid var(--color-border)' },
  actionTitle: { fontSize: 14, fontWeight: 700, marginBottom: 10 },
  actionBtn: { border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  notesSection: { padding: '16px 20px', borderTop: '1px solid var(--color-border)' },
  note: { background: '#f8f9fa', borderRadius: 6, padding: '8px 12px', marginBottom: 8 },
  auditRow: { display: 'flex', gap: 12, padding: '6px 0', borderBottom: '1px solid #f0f0f0', alignItems: 'flex-start' },
};
