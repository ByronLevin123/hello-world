const gbpFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
});

const gbpFormatterNoPence = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatGBP(amount: number): string {
  return gbpFormatter.format(amount);
}

export function formatGBPNoPence(amount: number): string {
  return gbpFormatterNoPence.format(amount);
}

export function calculateMonthlyRepayment(principal: number, annualRate: number, termMonths: number): number {
  if (annualRate === 0) {
    return principal / termMonths;
  }
  const monthlyRate = annualRate / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, termMonths);
  return (principal * monthlyRate * factor) / (factor - 1);
}
