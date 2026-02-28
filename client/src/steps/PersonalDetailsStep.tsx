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
      <form onSubmit={handleSubmit}>
        <FormField label="First name" error={errors.firstName}>
          <input
            type="text"
            value={formData.firstName}
            onChange={e => handleChange('firstName', e.target.value)}
          />
        </FormField>

        <FormField label="Last name" error={errors.lastName}>
          <input
            type="text"
            value={formData.lastName}
            onChange={e => handleChange('lastName', e.target.value)}
          />
        </FormField>

        <FormField label="Date of birth" error={errors.dateOfBirth}>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={e => handleChange('dateOfBirth', e.target.value)}
          />
        </FormField>

        <FormField label="Email address" error={errors.email}>
          <input
            type="email"
            value={formData.email}
            onChange={e => handleChange('email', e.target.value)}
          />
        </FormField>

        <FormField label="Phone number" error={errors.phone} hint="e.g. 07700 900123">
          <input
            type="tel"
            value={formData.phone}
            onChange={e => handleChange('phone', e.target.value)}
          />
        </FormField>

        <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
          Continue
        </button>
      </form>
    </StepLayout>
  );
}
