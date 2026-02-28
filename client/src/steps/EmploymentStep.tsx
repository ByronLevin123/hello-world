import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplication } from '../context/ApplicationContext';
import { StepLayout } from '../components/StepLayout';
import { FormField } from '../components/FormField';
import { EmploymentStatus, EMPLOYMENT_STATUS_LABELS } from '../types/loan';

const STATUSES: EmploymentStatus[] = ['employed', 'self_employed', 'part_time', 'retired', 'unemployed', 'student'];
const REQUIRES_EMPLOYER: EmploymentStatus[] = ['employed', 'self_employed', 'part_time'];

export function EmploymentStep() {
  const { formData, updateFormData, setCurrentStep } = useApplication();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const showEmployer = formData.employmentStatus && REQUIRES_EMPLOYER.includes(formData.employmentStatus);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!formData.employmentStatus) errs.employmentStatus = 'Please select your employment status';
    if (showEmployer && !formData.employerName) errs.employerName = 'Employer name is required';
    if (formData.annualIncome == null || formData.annualIncome <= 0) errs.annualIncome = 'Please enter a valid annual income';
    if (formData.monthlyOutgoings == null || formData.monthlyOutgoings < 0) errs.monthlyOutgoings = 'Monthly outgoings cannot be negative';
    if (formData.annualIncome && formData.monthlyOutgoings != null && formData.monthlyOutgoings >= formData.annualIncome / 12) {
      errs.monthlyOutgoings = 'Monthly outgoings cannot exceed your monthly income';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) {
      setCurrentStep(5);
      navigate('/loan-details');
    }
  }

  function handleChange(field: string, value: string | number | null) {
    updateFormData({ [field]: value });
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  }

  return (
    <StepLayout
      step={4}
      title="Your employment and income"
      onBack={() => { setCurrentStep(3); navigate('/address'); }}
    >
      <form onSubmit={handleSubmit}>
        <FormField label="Employment status" error={errors.employmentStatus}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {STATUSES.map(status => (
              <label key={status} style={styles.radio}>
                <input
                  type="radio"
                  name="employmentStatus"
                  checked={formData.employmentStatus === status}
                  onChange={() => handleChange('employmentStatus', status)}
                  style={{ marginRight: 8 }}
                />
                {EMPLOYMENT_STATUS_LABELS[status]}
              </label>
            ))}
          </div>
        </FormField>

        {showEmployer && (
          <FormField label="Employer name" error={errors.employerName}>
            <input
              type="text"
              value={formData.employerName}
              onChange={e => handleChange('employerName', e.target.value)}
            />
          </FormField>
        )}

        <FormField label="Annual income (before tax)" error={errors.annualIncome} hint="Your total yearly income in GBP">
          <div style={styles.currencyWrap}>
            <span style={styles.currencySymbol}>&pound;</span>
            <input
              type="number"
              min="0"
              step="100"
              value={formData.annualIncome ?? ''}
              onChange={e => handleChange('annualIncome', e.target.value ? parseFloat(e.target.value) : null)}
              style={{ paddingLeft: 28 }}
            />
          </div>
        </FormField>

        <FormField label="Monthly outgoings" error={errors.monthlyOutgoings} hint="Include rent/mortgage, bills, existing loans, living costs">
          <div style={styles.currencyWrap}>
            <span style={styles.currencySymbol}>&pound;</span>
            <input
              type="number"
              min="0"
              step="50"
              value={formData.monthlyOutgoings ?? ''}
              onChange={e => handleChange('monthlyOutgoings', e.target.value ? parseFloat(e.target.value) : null)}
              style={{ paddingLeft: 28 }}
            />
          </div>
        </FormField>

        <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
          Continue
        </button>
      </form>
    </StepLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  radio: {
    cursor: 'pointer',
    fontSize: 15,
  },
  currencyWrap: {
    position: 'relative' as const,
  },
  currencySymbol: {
    position: 'absolute' as const,
    left: 10,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--color-text-light)',
    fontWeight: 600,
  },
};
