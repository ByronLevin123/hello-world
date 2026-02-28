const STORAGE_KEY = 'uk_loan_journey_form';

export function saveFormState(data: Record<string, unknown>): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // sessionStorage full or unavailable — silently fail
  }
}

export function loadFormState(): Record<string, unknown> | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearFormState(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function hasFormState(): boolean {
  try {
    return !!sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}
