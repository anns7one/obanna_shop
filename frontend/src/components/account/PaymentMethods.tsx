"use client";

import { useState } from "react";
import { CreditCard, ShieldCheck, Trash2 } from "lucide-react";
import { useCreatePaymentMethod, useDeletePaymentMethod, usePaymentMethods } from "@/hooks/usePaymentMethods";
import { PaymentMethodForm } from "@/components/account/PaymentMethodForm";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const brandLabel: Record<string, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
  other: "Card",
};

export function PaymentMethods() {
  const { data: methods, isLoading, isError, refetch } = usePaymentMethods();
  const createMethod = useCreatePaymentMethod();
  const deleteMethod = useDeletePaymentMethod();
  const [adding, setAdding] = useState(false);

  return (
    <div className="account-page">
      <div className="account-page-header">
        <div>
          <h1 className="account-page-title">Payment</h1>
          <p className="account-page-hint">Saved cards for faster checkout.</p>
        </div>
      </div>

      <p className="payment-security-note">
        <ShieldCheck size={16} aria-hidden />
        Card numbers and CVC codes are never stored — we only keep the brand, last 4 digits and
        expiry so you can recognise a saved card.
      </p>

      {isError && (
        <div className="data-error" role="alert">
          <p>We couldn&apos;t load your payment methods.</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      {isLoading && <p className="account-loading">Loading…</p>}

      {!isLoading && !isError && (
        <>
          {methods && methods.length > 0 && (
            <ul className="payment-list">
              {methods.map((method) => (
                <li key={method.id} className="payment-card">
                  <span className="payment-card-icon">
                    <CreditCard size={18} aria-hidden />
                  </span>
                  <div className="payment-card-details">
                    <p className="payment-card-brand">
                      {brandLabel[method.brand]} &middot;&middot;&middot;&middot; {method.last4}
                    </p>
                    <p className="payment-card-expiry">
                      Expires {String(method.expMonth).padStart(2, "0")}/{String(method.expYear).slice(-2)}
                    </p>
                  </div>
                  {method.isDefault && <Badge tone="blush">Default</Badge>}
                  <button
                    type="button"
                    className="payment-card-remove"
                    onClick={() => deleteMethod.mutate(method.id)}
                    aria-label="Remove card"
                  >
                    <Trash2 size={16} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {methods && methods.length === 0 && !adding && <p className="account-empty-hint">No saved cards yet.</p>}

          {!adding && (
            <Button variant="secondary" onClick={() => setAdding(true)}>
              Add card
            </Button>
          )}

          {adding && (
            <PaymentMethodForm
              submitting={createMethod.isPending}
              onSubmit={(values) => createMethod.mutate(values, { onSuccess: () => setAdding(false) })}
              onCancel={() => setAdding(false)}
            />
          )}
        </>
      )}
    </div>
  );
}
