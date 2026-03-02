import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplication } from '../context/ApplicationContext';
import { StepLayout } from '../components/StepLayout';
import { FormField } from '../components/FormField';
import { isValidPostcode } from '../utils/validators';

export function AddressStep() {
  const { formData, updateFormData, setCurrentStep } = useApplication();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!formData.addressLine1) errs.addressLine1 = 'Address line 1 is required';
    if (!formData.city) errs.city = 'Town/city is required';
    if (!formData.postcode) errs.postcode = 'Postcode is required';
    else if (!isValidPostcode(formData.postcode)) errs.postcode = 'Please enter a valid UK postcode (e.g. SW1A 1AA)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) {
      setCurrentStep(4);
      navigate('/employment');
    }
  }

  function handleChange(field: string, value: string) {
    updateFormData({ [field]: value });
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  }

  return (
    <StepLayout
      step={3}
      title="Where do you live?"
      onBack={() => { setCurrentStep(2); navigate('/personal-details'); }}
    >
      <form onSubmit={handleSubmit} noValidate>
        <FormField label="Address line 1" htmlFor="addressLine1" error={errors.addressLine1}>
          <input
            id="addressLine1"
            type="text"
            value={formData.addressLine1}
            onChange={e => handleChange('addressLine1', e.target.value)}
            aria-invalid={!!errors.addressLine1}
            aria-describedby={errors.addressLine1 ? 'addressLine1-error' : undefined}
            autoComplete="address-line1"
          />
        </FormField>

        <FormField label="Address line 2 (optional)" htmlFor="addressLine2">
          <input
            id="addressLine2"
            type="text"
            value={formData.addressLine2}
            onChange={e => handleChange('addressLine2', e.target.value)}
            autoComplete="address-line2"
          />
        </FormField>

        <FormField label="Town / City" htmlFor="city" error={errors.city}>
          <input
            id="city"
            type="text"
            value={formData.city}
            onChange={e => handleChange('city', e.target.value)}
            aria-invalid={!!errors.city}
            aria-describedby={errors.city ? 'city-error' : undefined}
            autoComplete="address-level2"
          />
        </FormField>

        <FormField label="County (optional)" htmlFor="county">
          <input
            id="county"
            type="text"
            value={formData.county}
            onChange={e => handleChange('county', e.target.value)}
            autoComplete="address-level1"
          />
        </FormField>

        <FormField label="Postcode" htmlFor="postcode" error={errors.postcode} hint="e.g. SW1A 1AA">
          <input
            id="postcode"
            type="text"
            value={formData.postcode}
            onChange={e => handleChange('postcode', e.target.value.toUpperCase())}
            aria-invalid={!!errors.postcode}
            aria-describedby={[errors.postcode ? 'postcode-error' : '', 'postcode-hint'].filter(Boolean).join(' ') || undefined}
            autoComplete="postal-code"
            style={{ maxWidth: 180 }}
          />
        </FormField>

        <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
          Continue
        </button>
      </form>
    </StepLayout>
  );
}
