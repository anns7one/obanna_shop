/**
 * Strips any character that isn't a digit, +, space, hyphen or parenthesis
 * as the user types. Deliberately not a fixed-position mask (like
 * +D (DDD) DDD-DD-DD) — OBA Atelier's customers aren't limited to one country's
 * dialing format, so this only keeps input free of stray/unsafe symbols
 * without assuming a particular number shape.
 */
export function sanitizePhoneInput(value: string): string {
  return value.replace(/[^0-9+()\-\s]/g, "");
}
