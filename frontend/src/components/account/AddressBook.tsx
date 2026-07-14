"use client";

import { useState } from "react";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useAddresses, useCreateAddress, useDeleteAddress, useUpdateAddress } from "@/hooks/useAddresses";
import type { AddressFormValues } from "@/lib/validation";
import type { Address } from "@/lib/types";
import { AddressForm } from "@/components/account/AddressForm";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type Mode = { kind: "closed" } | { kind: "adding" } | { kind: "editing"; address: Address };

export function AddressBook() {
  const { data: addresses, isLoading, isError, refetch } = useAddresses();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const [mode, setMode] = useState<Mode>({ kind: "closed" });

  function handleSubmit(values: AddressFormValues) {
    if (mode.kind === "editing") {
      updateAddress.mutate(
        { id: mode.address.id, input: values },
        { onSuccess: () => setMode({ kind: "closed" }) },
      );
    } else {
      createAddress.mutate(values, { onSuccess: () => setMode({ kind: "closed" }) });
    }
  }

  return (
    <div className="account-page">
      <div className="account-page-header">
        <div>
          <h1 className="account-page-title">Address</h1>
          <p className="account-page-hint">Saved addresses used at checkout.</p>
        </div>
      </div>

      {isError && (
        <div className="data-error" role="alert">
          <p>We couldn&apos;t load your addresses.</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      {isLoading && <p className="account-loading">Loading…</p>}

      {!isLoading && !isError && (
        <>
          {addresses && addresses.length > 0 && (
            <ul className="address-list">
              {addresses.map((address) => (
                <li key={address.id} className="address-card">
                  <div className="address-card-head">
                    <span className="address-card-label">
                      <MapPin size={14} aria-hidden />
                      {address.label}
                    </span>
                    {address.isDefault && <Badge tone="blush">Default</Badge>}
                  </div>
                  <p className="address-card-name">{address.fullName}</p>
                  <p className="address-card-lines">
                    {address.address}, {address.city} {address.postalCode}, {address.country}
                  </p>
                  <p className="address-card-lines">{address.phone}</p>
                  <div className="address-card-actions">
                    <button
                      type="button"
                      className="address-card-action"
                      onClick={() => setMode({ kind: "editing", address })}
                    >
                      <Pencil size={14} aria-hidden />
                      Edit
                    </button>
                    <button
                      type="button"
                      className="address-card-action address-card-action-danger"
                      onClick={() => deleteAddress.mutate(address.id)}
                    >
                      <Trash2 size={14} aria-hidden />
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {addresses && addresses.length === 0 && mode.kind === "closed" && (
            <p className="account-empty-hint">No saved addresses yet.</p>
          )}

          {mode.kind === "closed" && (
            <Button variant="secondary" onClick={() => setMode({ kind: "adding" })}>
              <Plus size={16} aria-hidden />
              Add address
            </Button>
          )}

          {mode.kind !== "closed" && (
            <AddressForm
              key={mode.kind === "editing" ? mode.address.id : "new"}
              initial={mode.kind === "editing" ? mode.address : undefined}
              submitting={createAddress.isPending || updateAddress.isPending}
              onSubmit={handleSubmit}
              onCancel={() => setMode({ kind: "closed" })}
            />
          )}
        </>
      )}
    </div>
  );
}
