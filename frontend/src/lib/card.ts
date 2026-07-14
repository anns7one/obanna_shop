import type { CardBrand } from "@/lib/types";

/**
 * Everything here runs in the browser only. The full card number and CVV
 * are read from the form, used to derive the values below, and then
 * discarded — they are never included in any request body. See
 * components/account/PaymentMethodForm.tsx (the only caller) and
 * backend/app/schemas/payment_method.py (which has no field that could
 * accept a raw number even if a caller tried to send one).
 */

/** Luhn checksum — catches a mistyped number before it goes anywhere. */
export function isValidCardNumber(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 12 || digits.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function detectCardBrand(raw: string): CardBrand {
  const digits = raw.replace(/\D/g, "");
  if (/^4/.test(digits)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  return "other";
}

/** The only fragment of the number this app ever keeps or transmits. */
export function lastFourDigits(raw: string): string {
  return raw.replace(/\D/g, "").slice(-4);
}
