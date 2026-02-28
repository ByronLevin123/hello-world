import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplication } from '../context/ApplicationContext';
import { StepLayout } from '../components/StepLayout';
import { FormField } from '../components/FormField';
import { isValidEmail, isValidPhone, isAtLeast18 } from '../utils/validators';

export function PersonalDetailsStep() {
  const { formData, updateFormData, setCurrentStep } = useApplication();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!formData.firstName || formData.firstName.length < 2) errs.firstName = 'First name is required (min 2 characters)';
    if (!formData.lastName || formData.lastName.length < 2) errs.lastName = 'Last name is required (min 2 characters)';
    if (!formData.dateOfBirth) errs.dateOfBirth = 'Date of birth is required';
    else if (!isAtLeast18(formData.dateOfBirth)) errs.dateOfBirth = 'You must be at least 18 years old';
    if (!formData.email) errs.email = 'Email is required';
    else if (!isValidEmail(formData.email)) errs.email = 'Please enter a valid email address';
    if (!formData.phone) errs.phone = 'Phone number is required';
    else if (!isValidPhone(formData.phone)) errs.phone = 'Please enter a valid UK phone number';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) {
      setCurrentStep(3);
      navigate('/address');
    }
  }

  function handleChange(field: string, value: string) {
    updateFormData({ [field]: value });
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  }

  return (
    <StepLayout
      step={2}
      title="Tell us about yourself"
      onBack={() => { setCurrentStep(1); navigate('/'); }}
    >
      <form onSubmit={handleSubmit} noValidate>
        <FormField label="First name" htmlFor="firstName" error={errors.firstName}>
          <input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={e => handleChange('firstName', e.target.value)}
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            autoComplete="given-name"
          />
        </FormField>

        <FormField label="Last name" htmlFor="lastName" error={errors.lastName}>
          <input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={e => handleChange('lastName', e.target.value)}
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            autoComplete="family-name"
          />
        </FormField>

        <FormField label="Date of birth" htmlFor="dateOfBirth" error={errors.dateOfBirth}>
          <input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={e => handleChange('dateOfBirth', e.target.value)}
            aria-invalid={!!errors.dateOfBirth}
            aria-describedby={errors.dateOfBirth ? 'dateOfBirth-error' : undefined}
            autoComplete="bday"
          />
        </FormField>

        <FormField label="Email address" htmlFor="email" error={errors.email}>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={e => handleChange('email', e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            autoComplete="email"
          />
        </FormField>

        <FormField label="Phone number" htmlFor="phone" error={errors.phone} hint="e.g. 07700 900123">
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={e => handleChange('phone', e.target.value)}
            aria-invalid={!!errors.phone}
            aria-describedby={[errors.phone ? 'phone-error' : '', 'phone-hint'].filter(Boolean).join(' ') || undefined}
            autoComplete="tel"
          />
        </FormField>

        <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
          Continue
        </button>
      </form>
    </StepLayout>
  );
}
