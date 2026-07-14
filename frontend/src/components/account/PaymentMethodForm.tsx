"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cardFormSchema, type CardFormValues } from "@/lib/validation";
import { detectCardBrand, lastFourDigits } from "@/lib/card";
import type { PaymentMethodInput } from "@/lib/api/paymentMethods";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

interface PaymentMethodFormProps {
  submitting?: boolean;
  onSubmit: (values: PaymentMethodInput) => void;
  onCancel: () => void;
}

export function PaymentMethodForm({ submitting = false, onSubmit, onCancel }: PaymentMethodFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CardFormValues>({ resolver: zodResolver(cardFormSchema) });

  function handleValid(values: CardFormValues) {
    // values.cardNumber and values.cvc exist only in this closure — only
    // the derived, non-sensitive fields below are ever sent to the API.
    const [month, year] = values.expiry.split("/").map(Number);
    onSubmit({
      brand: detectCardBrand(values.cardNumber),
      last4: lastFourDigits(values.cardNumber),
      expMonth: month,
      expYear: 2000 + year,
      isDefault: false,
    });
  }

  return (
    <form onSubmit={handleSubmit(handleValid)} noValidate className="payment-form">
      <p className="payment-form-note">
        We never store or transmit your full card number or CVC — only the card brand, its last 4
        digits and expiry are saved, so there is nothing sensitive to steal even if our database
        were ever compromised.
      </p>

      <Input id="cardName" label="Name on card" error={errors.cardName?.message} {...register("cardName")} />
      <Input
        id="cardNumber"
        label="Card number"
        inputMode="numeric"
        autoComplete="cc-number"
        placeholder="4242 4242 4242 4242"
        error={errors.cardNumber?.message}
        {...register("cardNumber")}
      />

      <div className="payment-form-row">
        <Input
          id="expiry"
          label="Expiry"
          placeholder="MM/YY"
          autoComplete="cc-exp"
          error={errors.expiry?.message}
          {...register("expiry")}
        />
        <Input
          id="cvc"
          label="CVC"
          inputMode="numeric"
          autoComplete="cc-csc"
          placeholder="123"
          error={errors.cvc?.message}
          {...register("cvc")}
        />
      </div>

      <div className="payment-form-actions">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save card"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
