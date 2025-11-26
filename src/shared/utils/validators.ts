export class Validators {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidBrazilianPhone(phone: string): boolean {
    const phoneRegex = /^(?:\+55)?(?:\d{2})?\s?(?:9\d{4}|\d{4})[-\s]?\d{4}$/;
    return phoneRegex.test(phone.replace(/[^\d+]/g, ""));
  }

  static isNotEmpty(value: string): boolean {
    return value !== null && value !== undefined && value.trim().length > 0;
  }

  static hasMinLength(value: string, min: number): boolean {
    return value.trim().length >= min;
  }

  static hasMaxLength(value: string, max: number): boolean {
    return value.trim().length <= max;
  }
}
