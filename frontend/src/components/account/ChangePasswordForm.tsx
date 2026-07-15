"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, type ChangePasswordValues } from "@/lib/validation";
import { changePassword } from "@/lib/api/auth";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/client";

export function ChangePasswordForm() {
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({ resolver: zodResolver(changePasswordSchema) });

  async function onSubmit(values: ChangePasswordValues) {
    setFormError(null);
    setSaved(false);
    try {
      await changePassword(values);
      setSaved(true);
      reset();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="profile-form">
      <h2 className="account-page-subheading">Change password</h2>

      <PasswordInput
        id="currentPassword"
        label="Current password"
        autoComplete="current-password"
        error={errors.currentPassword?.message}
        {...register("currentPassword")}
      />
      <PasswordInput
        id="newPassword"
        label="New password"
        autoComplete="new-password"
        hint="At least 8 characters, one uppercase letter and one number."
        error={errors.newPassword?.message}
        {...register("newPassword")}
      />
      <PasswordInput
        id="confirmNewPassword"
        label="Confirm new password"
        autoComplete="new-password"
        error={errors.confirmNewPassword?.message}
        {...register("confirmNewPassword")}
      />

      {formError && (
        <p role="alert" className="auth-form-error">
          {formError}
        </p>
      )}
      {saved && (
        <p className="profile-form-success" role="status">
          Password updated.
        </p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
