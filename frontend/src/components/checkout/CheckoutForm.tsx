"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { CreditCard, MapPin, Plus, Wallet } from "lucide-react";
import { checkoutContactSchema, type CheckoutContactValues, type AddressFormValues } from "@/lib/validation";
import { createOrder } from "@/lib/api/orders";
import { useCartStore, selectCartTotal } from "@/store/cartStore";
import { useAddresses, useCreateAddress } from "@/hooks/useAddresses";
import { useCreatePaymentMethod, usePaymentMethods } from "@/hooks/usePaymentMethods";
import type { PaymentMethodInput } from "@/lib/api/paymentMethods";
import { sanitizePhoneInput } from "@/lib/phone";
import { AddressForm } from "@/components/account/AddressForm";
import { PaymentMethodForm } from "@/components/account/PaymentMethodForm";
import { Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn, formatPrice } from "@/lib/utils";

// Mirrors the "Free shipping on orders over $75" banner in the header, and
// backend/app/routers/orders.py's own threshold — the backend recomputes
// the authoritative total, this is just a live estimate for the summary.
const FREE_SHIPPING_THRESHOLD = 75;
const STANDARD_SHIPPING_COST = 8;

const brandLabel: Record<string, string> = { visa: "Visa", mastercard: "Mastercard", amex: "Amex", other: "Card" };

interface CheckoutFormProps {
  /** Called right after a successful order placement, before the cart is
   * cleared — lets the page know not to fall into its "empty cart" state
   * while the inline success message below is showing. */
  onOrderPlaced?: () => void;
}

export function CheckoutForm({ onOrderPlaced }: CheckoutFormProps) {
  const items = useCartStore((s) => s.items);
  const total = useCartStore(selectCartTotal);
  const clearCart = useCartStore((s) => s.clear);

  const { data: addresses, isLoading: addressesLoading } = useAddresses();
  const { data: paymentMethods, isLoading: paymentMethodsLoading } = usePaymentMethods();
  const createAddress = useCreateAddress();
  const createPaymentMethod = useCreatePaymentMethod();

  // Rather than syncing a "default selection" into state via an effect
  // (which would cascade an extra render every time the query resolves),
  // the default is derived directly from the loaded data on every render;
  // `*Override` only holds a value once the person actually makes a choice.
  const [selectedAddressIdOverride, setSelectedAddressIdOverride] = useState<string | null>(null);
  const [addingAddressOverride, setAddingAddressOverride] = useState<boolean | null>(null);
  const [paymentChoiceOverride, setPaymentChoiceOverride] = useState<string | "cod" | null>(null);
  const [addingCard, setAddingCard] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const defaultAddressId =
    addresses && addresses.length > 0 ? (addresses.find((a) => a.isDefault) ?? addresses[0]).id : null;
  const selectedAddressId = selectedAddressIdOverride ?? defaultAddressId;
  const addingAddress = addingAddressOverride ?? (addresses !== undefined && addresses.length === 0);

  const defaultPaymentChoice =
    paymentMethods === undefined
      ? null
      : paymentMethods.length > 0
        ? (paymentMethods.find((m) => m.isDefault) ?? paymentMethods[0]).id
        : "cod";
  const paymentChoice = paymentChoiceOverride ?? defaultPaymentChoice;

  function selectAddress(id: string) {
    setSelectedAddressIdOverride(id);
    setAddingAddressOverride(false);
  }

  function selectPayment(choice: string | "cod") {
    setPaymentChoiceOverride(choice);
    setAddingCard(false);
  }

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutContactValues>({ resolver: zodResolver(checkoutContactSchema), defaultValues: { consent: false } });

  const phoneField = register("phone");
  const shippingCost = total >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
  const grandTotal = total + shippingCost;

  function handleAddressSubmit(values: AddressFormValues) {
    createAddress.mutate(values, {
      onSuccess: (created) => selectAddress(created.id),
    });
  }

  function handleCardSubmit(values: PaymentMethodInput) {
    createPaymentMethod.mutate(values, {
      onSuccess: (created) => selectPayment(created.id),
    });
  }

  async function onSubmit(values: CheckoutContactValues) {
    setFormError(null);
    const address = addresses?.find((a) => a.id === selectedAddressId);
    if (!address) {
      setFormError("Please select or add a delivery address.");
      return;
    }

    try {
      await createOrder({
        items,
        shipping: {
          fullName: address.fullName,
          address: address.address,
          city: address.city,
          postalCode: address.postalCode,
          country: address.country,
          phone: address.phone,
        },
        contactFullName: values.fullName,
        contactPhone: values.phone,
        contactEmail: values.email || undefined,
        orderComment: values.comment || undefined,
        paymentMethodId: paymentChoice && paymentChoice !== "cod" ? paymentChoice : undefined,
      });
      onOrderPlaced?.();
      clearCart();
      reset({ fullName: "", phone: "", email: "", comment: "", consent: false });
      setSubmitted(true);
    } catch {
      setFormError("We couldn't place your order. Please try again.");
    }
  }

  if (submitted) {
    return (
      <div className="checkout-success" role="status" aria-live="polite">
        <h2 className="checkout-success-title">Thank you — your order has been placed.</h2>
        <p className="checkout-success-hint">You&apos;ll find it under your orders any time.</p>
        <Button href="/account/orders" size="lg">
          View my orders
        </Button>
      </div>
    );
  }

  // Deliberately a <div>, not a <form>: AddressForm/PaymentMethodForm below
  // are each their own independent <form> (with their own "Save" action),
  // and HTML doesn't allow a <form> nested inside another <form> — nesting
  // them breaks React's onSubmit handling and falls back to a native
  // full-page form submission. "Place order" is a plain button that
  // triggers this form's own validated submit instead.
  return (
    <div className="checkout-form">
      <div className="checkout-form-fields">
        <fieldset className="checkout-form-fieldset">
          <legend className="checkout-form-legend">Delivery address</legend>

          {addressesLoading && <p className="account-loading">Loading saved addresses…</p>}

          {addresses && addresses.length > 0 && (
            <div className="checkout-picker" role="radiogroup" aria-label="Delivery address">
              {addresses.map((a) => (
                <label
                  key={a.id}
                  className={cn("checkout-picker-option", selectedAddressId === a.id && "checkout-picker-option-selected")}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === a.id}
                    onChange={() => selectAddress(a.id)}
                  />
                  <span className="checkout-picker-icon">
                    <MapPin size={16} aria-hidden />
                  </span>
                  <span className="checkout-picker-body">
                    <span className="checkout-picker-label">
                      {a.label}
                      {a.isDefault && <Badge tone="blush">Default</Badge>}
                    </span>
                    <span className="checkout-picker-detail">
                      {a.fullName} · {a.address}, {a.city} {a.postalCode}, {a.country}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          )}

          {!addingAddress && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setAddingAddressOverride(true)}>
              <Plus size={14} aria-hidden />
              Add new address
            </Button>
          )}

          {addingAddress && (
            <AddressForm
              idPrefix="checkout-"
              submitting={createAddress.isPending}
              onSubmit={handleAddressSubmit}
              onCancel={() => setAddingAddressOverride(false)}
            />
          )}
        </fieldset>

        <fieldset className="checkout-form-fieldset">
          <legend className="checkout-form-legend">Payment method</legend>

          {paymentMethodsLoading && <p className="account-loading">Loading saved cards…</p>}

          <div className="checkout-picker" role="radiogroup" aria-label="Payment method">
            {paymentMethods?.map((m) => (
              <label
                key={m.id}
                className={cn("checkout-picker-option", paymentChoice === m.id && "checkout-picker-option-selected")}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentChoice === m.id}
                  onChange={() => selectPayment(m.id)}
                />
                <span className="checkout-picker-icon">
                  <CreditCard size={16} aria-hidden />
                </span>
                <span className="checkout-picker-body">
                  <span className="checkout-picker-label">
                    {brandLabel[m.brand]} •••• {m.last4}
                    {m.isDefault && <Badge tone="blush">Default</Badge>}
                  </span>
                  <span className="checkout-picker-detail">
                    Expires {String(m.expMonth).padStart(2, "0")}/{String(m.expYear).slice(-2)}
                  </span>
                </span>
              </label>
            ))}

            <label className={cn("checkout-picker-option", paymentChoice === "cod" && "checkout-picker-option-selected")}>
              <input
                type="radio"
                name="payment"
                checked={paymentChoice === "cod"}
                onChange={() => selectPayment("cod")}
              />
              <span className="checkout-picker-icon">
                <Wallet size={16} aria-hidden />
              </span>
              <span className="checkout-picker-body">
                <span className="checkout-picker-label">Cash on delivery</span>
              </span>
            </label>
          </div>

          {!addingCard && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setAddingCard(true)}>
              <Plus size={14} aria-hidden />
              Add new card
            </Button>
          )}

          {addingCard && (
            <PaymentMethodForm
              submitting={createPaymentMethod.isPending}
              onSubmit={handleCardSubmit}
              onCancel={() => setAddingCard(false)}
            />
          )}
        </fieldset>

        <fieldset className="checkout-form-fieldset">
          <legend className="checkout-form-legend">Contact details</legend>
          <Input id="fullName" label="Full name" autoComplete="name" error={errors.fullName?.message} {...register("fullName")} />
          <Input
            id="phone"
            label="Phone"
            type="tel"
            autoComplete="tel"
            error={errors.phone?.message}
            {...phoneField}
            onChange={(e) => {
              e.target.value = sanitizePhoneInput(e.target.value);
              phoneField.onChange(e);
            }}
          />
          <Input
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            hint="Optional — only used to send an order confirmation."
            error={errors.email?.message}
            {...register("email")}
          />
          <Textarea
            id="comment"
            label="Order comment"
            hint="Optional — anything we should know about your order."
            rows={3}
            error={errors.comment?.message}
            {...register("comment")}
          />
        </fieldset>

        <div className="field">
          <label className="auth-form-checkbox">
            <input type="checkbox" onChange={(e) => setValue("consent", e.target.checked, { shouldValidate: true })} />
            I agree to the processing of my personal data and confirm that I&apos;ve read the{" "}
            <Link href="/legal/data-consent" target="_blank" className="auth-form-link">
              Personal Data Processing Consent
            </Link>{" "}
            and{" "}
            <Link href="/legal/privacy-policy" target="_blank" className="auth-form-link">
              Privacy Policy
            </Link>
            .
          </label>
          {errors.consent && (
            <p role="alert" className="field-error">
              {errors.consent.message}
            </p>
          )}
        </div>

        {formError && (
          <p role="alert" className="checkout-form-error">
            {formError}
          </p>
        )}
      </div>

      <div className="checkout-form-summary">
        <div className="checkout-form-summary-head">
          <h2 className="checkout-form-title">Your order</h2>
          <Link href="/cart" className="checkout-form-edit">
            Edit
          </Link>
        </div>
        <ul className="checkout-form-items">
          {items.map((item) => (
            <li key={`${item.productId}-${item.size}-${item.color}`} className="checkout-form-item">
              <Link href={`/product/${item.slug}`} className="checkout-form-item-link">
                {item.title} × {item.quantity}
              </Link>
              <span className="checkout-form-price">{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="checkout-form-row">
          <span>Subtotal</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="checkout-form-row">
          <span>Shipping</span>
          <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
        </div>
        <div className="checkout-form-total">
          <span>Total</span>
          <span>{formatPrice(grandTotal)}</span>
        </div>
        <Button
          type="button"
          size="lg"
          fullWidth
          className="checkout-form-submit"
          disabled={isSubmitting || items.length === 0}
          onClick={handleSubmit(onSubmit)}
        >
          {isSubmitting ? "Placing order…" : "Place order"}
        </Button>
      </div>
    </div>
  );
}
