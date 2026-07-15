"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressFormSchema, type AddressFormValues } from "@/lib/validation";
import type { Address } from "@/lib/types";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

interface AddressFormProps {
  initial?: Address;
  submitting?: boolean;
  onSubmit: (values: AddressFormValues) => void;
  onCancel: () => void;
  /** Distinguishes this form's field ids from another form on the same
   * page — e.g. checkout also has its own "Full name"/"Phone" fields. */
  idPrefix?: string;
}

export function AddressForm({ initial, submitting = false, onSubmit, onCancel, idPrefix = "" }: AddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: initial
      ? {
          label: initial.label,
          fullName: initial.fullName,
          address: initial.address,
          city: initial.city,
          postalCode: initial.postalCode,
          country: initial.country,
          phone: initial.phone,
          isDefault: initial.isDefault,
        }
      : { isDefault: false },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="address-form">
      <div className="address-form-row">
        <Input
          id={`${idPrefix}label`}
          label="Label"
          placeholder="Home, Work…"
          error={errors.label?.message}
          {...register("label")}
        />
        <Input
          id={`${idPrefix}addressFullName`}
          label="Full name"
          error={errors.fullName?.message}
          {...register("fullName")}
        />
      </div>

      <Input id={`${idPrefix}address`} label="Address" error={errors.address?.message} {...register("address")} />

      <div className="address-form-row">
        <Input id={`${idPrefix}city`} label="City" error={errors.city?.message} {...register("city")} />
        <Input
          id={`${idPrefix}postalCode`}
          label="Postal code"
          error={errors.postalCode?.message}
          {...register("postalCode")}
        />
      </div>

      <div className="address-form-row">
        <Input id={`${idPrefix}country`} label="Country" error={errors.country?.message} {...register("country")} />
        <Input
          id={`${idPrefix}addressPhone`}
          label="Phone"
          error={errors.phone?.message}
          {...register("phone")}
        />
      </div>

      <label className="address-form-default">
        <input type="checkbox" {...register("isDefault")} />
        Use as default address
      </label>

      <div className="address-form-actions">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save address"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
