import React from 'react';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  submitted: { bg: '#e8f4fd', text: '#1a73e8' },
  under_review: { bg: '#fff3e0', text: '#e65100' },
  approved: { bg: '#e8f5e9', text: '#2e7d32' },
  declined: { bg: '#fce4ec', text: '#c62828' },
  referred: { bg: '#f3e5f5', text: '#7b1fa2' },
  pending: { bg: '#e8f4fd', text: '#1a73e8' },
  in_progress: { bg: '#fff3e0', text: '#e65100' },
  cleared: { bg: '#e8f5e9', text: '#2e7d32' },
  flagged: { bg: '#fce4ec', text: '#c62828' },
};

const LABELS: Record<string, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  approved: 'Approved',
  declined: 'Declined',
  referred: 'Referred',
  pending: 'Pending',
  in_progress: 'In Progress',
  cleared: 'Cleared',
  flagged: 'Flagged',
};

export function StatusBadge({ status }: { status: string }) {
  const colors = STATUS_COLORS[status] || { bg: '#f5f5f5', text: '#666' };
  return (
    <span style={{
      background: colors.bg, color: colors.text,
      padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
      whiteSpace: 'nowrap' as const,
    }}>
      {LABELS[status] || status}
    </span>
  );
}
