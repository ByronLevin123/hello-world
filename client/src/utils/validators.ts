const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
const UK_PHONE_REGEX = /^(?:0|\+?44)\s?(?:\d\s?){9,10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidPostcode(postcode: string): boolean {
  return UK_POSTCODE_REGEX.test(postcode.trim());
}

export function isValidPhone(phone: string): boolean {
  return UK_PHONE_REGEX.test(phone.replace(/\s/g, ''));
}

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function isAtLeast18(dateStr: string): boolean {
  if (!dateStr) return false;
  const dob = new Date(dateStr);
  if (isNaN(dob.getTime())) return false;
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    return age - 1 >= 18;
  }
  return age >= 18;
}
