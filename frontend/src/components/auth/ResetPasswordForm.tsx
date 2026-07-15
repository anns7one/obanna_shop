"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validation";
import { resetPassword, AuthError } from "@/lib/api/auth";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: searchParams.get("email") ?? "" },
  });

  async function onSubmit(values: ResetPasswordValues) {
    setFormError(null);
    if (!token) {
      setFormError("This reset link is missing its token. Please request a new one.");
      return;
    }
    try {
      await resetPassword({ ...values, token });
      setDone(true);
    } catch (err) {
      setFormError(err instanceof AuthError ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (done) {
    return (
      <div className="auth-form">
        <p className="auth-form-notice" role="status" aria-live="polite">
          Password successfully changed. Please sign in with your new password.
        </p>
        <Button href="/login" size="lg" fullWidth>
          Go to sign in
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="auth-form">
      <Input
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        id="password"
        label="New password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters, one uppercase letter and one number."
        error={errors.password?.message}
        {...register("password")}
      />
      <Input
        id="confirmPassword"
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      {formError && (
        <p role="alert" className="auth-form-error">
          {formError}
        </p>
      )}

      <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "Changing password…" : "Change password"}
      </Button>

      <p className="auth-form-footer">
        <Link href="/login" className="auth-form-link">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
