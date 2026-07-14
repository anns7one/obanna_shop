import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPaymentMethod,
  deletePaymentMethod,
  fetchPaymentMethods,
  type PaymentMethodInput,
} from "@/lib/api/paymentMethods";

export function usePaymentMethods() {
  return useQuery({ queryKey: ["payment-methods"], queryFn: fetchPaymentMethods });
}

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PaymentMethodInput) => createPaymentMethod(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payment-methods"] }),
  });
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePaymentMethod(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payment-methods"] }),
  });
}
