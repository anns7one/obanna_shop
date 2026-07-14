import { apiFetch } from "@/lib/api/client";
import type { CardBrand, PaymentMethod } from "@/lib/types";

/**
 * Deliberately the only shape this function accepts — brand/last4/expiry.
 * There is no cardNumber or cvv field anywhere in this type, so it's not
 * possible to accidentally wire a raw card number into a request from
 * this function's call site.
 */
export interface PaymentMethodInput {
  brand: CardBrand;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  return apiFetch<PaymentMethod[]>("/payment-methods");
}

export async function createPaymentMethod(input: PaymentMethodInput): Promise<PaymentMethod> {
  return apiFetch<PaymentMethod>("/payment-methods", { method: "POST", body: JSON.stringify(input) });
}

export async function deletePaymentMethod(id: string): Promise<void> {
  return apiFetch<void>(`/payment-methods/${id}`, { method: "DELETE" });
}
