export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function isValidPassword(password: string): { isValid: boolean; message?: string } {
  if (!password || password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters' };
  }
  return { isValid: true };
}

export function isValidPhone(phone: string): boolean {
  // Allow international and Nigerian phone numbers: 080..., +234...
  const clean = phone.replace(/[\s\-()]/g, '');
  return clean.length >= 10 && clean.length <= 15;
}
