"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { checkoutSchema, type CheckoutValues } from "@/lib/validation";
import { createOrder } from "@/lib/api/orders";
import { useAuthStore } from "@/store/authStore";
import { useCartStore, selectCartTotal } from "@/store/cartStore";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import styles from "./CheckoutForm.module.css";

export function CheckoutForm() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const items = useCartStore((s) => s.items);
  const total = useCartStore(selectCartTotal);
  const clearCart = useCartStore((s) => s.clear);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutValues>({ resolver: zodResolver(checkoutSchema) });

  async function onSubmit(values: CheckoutValues) {
    if (!user) return;
    setFormError(null);
    try {
      // Payment is a stub for this stage — no card data is sent anywhere,
      // it only satisfies form validation ahead of a real payment provider.
      await createOrder({
        userId: user.id,
        items,
        shipping: {
          fullName: values.fullName,
          address: values.address,
          city: values.city,
          postalCode: values.postalCode,
          country: values.country,
          phone: values.phone,
        },
      });
      clearCart();
      router.push("/account/orders?success=1");
    } catch {
      setFormError("We couldn't place your order. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.container}>
      <div className={styles.fields}>
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Shipping details</legend>
          <Input id="fullName" label="Full name" autoComplete="name" error={errors.fullName?.message} {...register("fullName")} />
          <Input id="address" label="Address" autoComplete="street-address" error={errors.address?.message} {...register("address")} />
          <div className={styles.row}>
            <Input id="city" label="City" autoComplete="address-level2" error={errors.city?.message} {...register("city")} />
            <Input id="postalCode" label="Postal code" autoComplete="postal-code" error={errors.postalCode?.message} {...register("postalCode")} />
          </div>
          <div className={styles.row}>
            <Input id="country" label="Country" autoComplete="country-name" error={errors.country?.message} {...register("country")} />
            <Input id="phone" label="Phone" type="tel" autoComplete="tel" error={errors.phone?.message} {...register("phone")} />
          </div>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Payment</legend>
          <p className={styles.hint}>
            Demo checkout — no real payment is processed and card details are not transmitted.
          </p>
          <Input id="cardName" label="Name on card" autoComplete="cc-name" error={errors.cardName?.message} {...register("cardName")} />
          <Input
            id="cardNumber"
            label="Card number"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="4242 4242 4242 4242"
            error={errors.cardNumber?.message}
            {...register("cardNumber")}
          />
          <div className={styles.row}>
            <Input id="expiry" label="Expiry (MM/YY)" autoComplete="cc-exp" placeholder="MM/YY" error={errors.expiry?.message} {...register("expiry")} />
            <Input id="cvc" label="CVC" inputMode="numeric" autoComplete="cc-csc" error={errors.cvc?.message} {...register("cvc")} />
          </div>
        </fieldset>

        {formError && (
          <p role="alert" className={styles.error}>
            {formError}
          </p>
        )}
      </div>

      <div className={styles.summary}>
        <h2 className={styles.title}>Order summary</h2>
        <ul className={styles.items}>
          {items.map((item) => (
            <li key={`${item.productId}-${item.size}-${item.color}`} className={styles.item}>
              <span>
                {item.title} × {item.quantity}
              </span>
              <span className={styles.price}>{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className={styles.total}>
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        <Button
          type="submit"
          size="lg"
          fullWidth
          className={styles.submit}
          disabled={isSubmitting || items.length === 0}
        >
          {isSubmitting ? "Placing order…" : "Place order"}
        </Button>
      </div>
    </form>
  );
}
