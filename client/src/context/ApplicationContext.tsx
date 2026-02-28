import React, { createContext, useContext, useState, useCallback } from 'react';
import { ApplicationFormData } from '../types/loan';

const initialFormData: ApplicationFormData = {
  loanType: null,
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  county: '',
  postcode: '',
  employmentStatus: null,
  employerName: '',
  annualIncome: null,
  monthlyOutgoings: null,
  loanAmount: null,
  loanTermMonths: null,
  monthlyRepayment: null,
  representativeApr: null,
  totalRepayable: null,
  affordabilityPassed: null,
  termsAccepted: false,
  reference: null,
};

interface ApplicationContextValue {
  formData: ApplicationFormData;
  updateFormData: (partial: Partial<ApplicationFormData>) => void;
  resetForm: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

const ApplicationContext = createContext<ApplicationContextValue | null>(null);

export function ApplicationProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<ApplicationFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);

  const updateFormData = useCallback((partial: Partial<ApplicationFormData>) => {
    setFormData(prev => ({ ...prev, ...partial }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setCurrentStep(1);
  }, []);

  return (
    <ApplicationContext.Provider value={{ formData, updateFormData, resetForm, currentStep, setCurrentStep }}>
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplication() {
  const ctx = useContext(ApplicationContext);
  if (!ctx) throw new Error('useApplication must be used within ApplicationProvider');
  return ctx;
}
