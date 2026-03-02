import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplication } from '../context/ApplicationContext';
import { StepLayout } from '../components/StepLayout';
import { FCADisclosure } from '../components/FCADisclosure';
import { LOAN_TYPE_LABELS, EMPLOYMENT_STATUS_LABELS } from '../types/loan';
import { formatGBP } from '../utils/formatters';
import { submitApplication } from '../utils/api';

function Section({ title, onEdit, editLabel, children }: { title: string; onEdit: () => void; editLabel: string; children: React.ReactNode }) {
  return (
    <div style={sectionStyles.section}>
      <div style={sectionStyles.header}>
        <h3 style={sectionStyles.title}>{title}</h3>
        <button onClick={onEdit} style={sectionStyles.editBtn} aria-label={editLabel}>Edit</button>
      </div>
      <dl style={{ margin: 0 }}>{children}</dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={sectionStyles.row}>
      <dt style={sectionStyles.rowLabel}>{label}</dt>
      <dd style={{ margin: 0 }}>{value}</dd>
    </div>
  );
}

const sectionStyles: Record<string, React.CSSProperties> = {
  section: { marginBottom: 24, borderBottom: '1px solid var(--color-border)', paddingBottom: 16 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 16, color: 'var(--color-primary)' },
  editBtn: {
    background: 'none', border: 'none', color: 'var(--color-primary-light)', cursor: 'pointer',
    fontSize: 14, textDecoration: 'underline', minHeight: 44, minWidth: 44,
  },
  row: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14 },
  rowLabel: { color: 'var(--color-text-light)', margin: 0 },
};

export function ReviewStep() {
  const { formData, updateFormData, setCurrentStep } = useApplication();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function goToStep(step: number, path: string) {
    setCurrentStep(step);
    navigate(path);
  }

  async function handleSubmit() {
    if (!formData.termsAccepted) return;
    setSubmitting(true);
    setError(null);

    try {
      const result = await submitApplication({
        loanType: formData.loanType,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        email: formData.email,
        phone: formData.phone,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2 || undefined,
        city: formData.city,
        county: formData.county || undefined,
        postcode: formData.postcode,
        employmentStatus: formData.employmentStatus,
        employerName: formData.employerName || undefined,
        annualIncome: formData.annualIncome,
        monthlyOutgoings: formData.monthlyOutgoings,
        loanAmount: formData.loanAmount,
        loanTermMonths: formData.loanTermMonths,
        termsAccepted: formData.termsAccepted,
      });

      updateFormData({ reference: result.reference });
      setCurrentStep(8);
      navigate('/confirmation');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <StepLayout
      step={7}
      title="Review your application"
      onBack={() => { setCurrentStep(6); navigate('/affordability'); }}
    >
      <Section title="Loan type" onEdit={() => goToStep(1, '/')} editLabel="Edit loan type">
        <Row label="Type" value={formData.loanType ? LOAN_TYPE_LABELS[formData.loanType] : ''} />
        <Row label="Representative APR" value={`${formData.representativeApr}%`} />
      </Section>

      <Section title="Personal details" onEdit={() => goToStep(2, '/personal-details')} editLabel="Edit personal details">
        <Row label="Name" value={`${formData.firstName} ${formData.lastName}`} />
        <Row label="Date of birth" value={formData.dateOfBirth} />
        <Row label="Email" value={formData.email} />
        <Row label="Phone" value={formData.phone} />
      </Section>

      <Section title="Address" onEdit={() => goToStep(3, '/address')} editLabel="Edit address">
        <Row label="Address" value={[formData.addressLine1, formData.addressLine2, formData.city, formData.county, formData.postcode].filter(Boolean).join(', ')} />
      </Section>

      <Section title="Employment & income" onEdit={() => goToStep(4, '/employment')} editLabel="Edit employment details">
        <Row label="Employment status" value={formData.employmentStatus ? EMPLOYMENT_STATUS_LABELS[formData.employmentStatus] : ''} />
        {formData.employerName && <Row label="Employer" value={formData.employerName} />}
        <Row label="Annual income" value={formatGBP(formData.annualIncome ?? 0)} />
        <Row label="Monthly outgoings" value={formatGBP(formData.monthlyOutgoings ?? 0)} />
      </Section>

      <Section title="Loan details" onEdit={() => goToStep(5, '/loan-details')} editLabel="Edit loan details">
        <Row label="Loan amount" value={formatGBP(formData.loanAmount ?? 0)} />
        <Row label="Term" value={`${(formData.loanTermMonths ?? 0) / 12} year${(formData.loanTermMonths ?? 0) > 12 ? 's' : ''}`} />
        <Row label="Monthly repayment" value={formatGBP(formData.monthlyRepayment ?? 0)} />
        <Row label="Total repayable" value={formatGBP(formData.totalRepayable ?? 0)} />
      </Section>

      <div style={{ marginBottom: 20 }}>
        <label style={{ cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <input
            id="termsAccepted"
            type="checkbox"
            checked={formData.termsAccepted}
            onChange={e => updateFormData({ termsAccepted: e.target.checked })}
            style={{ marginTop: 3, minWidth: 20, minHeight: 20 }}
          />
          <span>
            I confirm that the information I have provided is accurate and I accept the terms and conditions.
          </span>
        </label>
      </div>

      <FCADisclosure apr={formData.representativeApr ?? undefined} />

      {error && <p className="error-text" role="alert" style={{ marginTop: 12 }}>{error}</p>}

      <button
        className="btn btn-primary"
        style={{ marginTop: 24, width: '100%', minHeight: 44 }}
        disabled={!formData.termsAccepted || submitting}
        onClick={handleSubmit}
        aria-busy={submitting}
      >
        {submitting ? 'Submitting...' : 'Submit application'}
      </button>
    </StepLayout>
  );
}
