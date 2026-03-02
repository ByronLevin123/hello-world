import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ApplicationFormData } from '../types/loan';
import { saveFormState, loadFormState, clearFormState } from '../utils/storage';

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

function getInitialData(): ApplicationFormData {
  const saved = loadFormState();
  if (saved) {
    return { ...initialFormData, ...saved } as ApplicationFormData;
  }
  return initialFormData;
}

export function ApplicationProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<ApplicationFormData>(getInitialData);
  const [currentStep, setCurrentStep] = useState(1);

  // Persist form state on every change
  useEffect(() => {
    if (formData.reference) return; // Don't persist after submission
    saveFormState(formData as unknown as Record<string, unknown>);
  }, [formData]);

  const updateFormData = useCallback((partial: Partial<ApplicationFormData>) => {
    setFormData(prev => ({ ...prev, ...partial }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setCurrentStep(1);
    clearFormState();
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
