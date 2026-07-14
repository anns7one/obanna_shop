import { apiFetch } from "@/lib/api/client";
import type { Address } from "@/lib/types";

export interface AddressInput {
  label: string;
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export async function fetchAddresses(): Promise<Address[]> {
  return apiFetch<Address[]>("/addresses");
}

export async function createAddress(input: AddressInput): Promise<Address> {
  return apiFetch<Address>("/addresses", { method: "POST", body: JSON.stringify(input) });
}

export async function updateAddress(id: string, input: AddressInput): Promise<Address> {
  return apiFetch<Address>(`/addresses/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export async function deleteAddress(id: string): Promise<void> {
  return apiFetch<void>(`/addresses/${id}`, { method: "DELETE" });
}
