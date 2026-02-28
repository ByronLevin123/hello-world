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
      <form onSubmit={handleSubmit}>
        <FormField label="Address line 1" error={errors.addressLine1}>
          <input
            type="text"
            value={formData.addressLine1}
            onChange={e => handleChange('addressLine1', e.target.value)}
          />
        </FormField>

        <FormField label="Address line 2 (optional)">
          <input
            type="text"
            value={formData.addressLine2}
            onChange={e => handleChange('addressLine2', e.target.value)}
          />
        </FormField>

        <FormField label="Town / City" error={errors.city}>
          <input
            type="text"
            value={formData.city}
            onChange={e => handleChange('city', e.target.value)}
          />
        </FormField>

        <FormField label="County (optional)">
          <input
            type="text"
            value={formData.county}
            onChange={e => handleChange('county', e.target.value)}
          />
        </FormField>

        <FormField label="Postcode" error={errors.postcode} hint="e.g. SW1A 1AA">
          <input
            type="text"
            value={formData.postcode}
            onChange={e => handleChange('postcode', e.target.value.toUpperCase())}
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
