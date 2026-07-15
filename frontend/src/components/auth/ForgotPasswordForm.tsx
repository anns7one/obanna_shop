"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validation";
import { forgotPassword, AuthError } from "@/lib/api/auth";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function ForgotPasswordForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordValues) {
    setFormError(null);
    try {
      await forgotPassword(values.email);
      setSent(true);
    } catch (err) {
      setFormError(err instanceof AuthError ? err.message : "Something went wrong. Please try again.");
    }
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

      {sent && (
        <p className="auth-form-notice" role="status" aria-live="polite">
          If an account exists for that email, we&apos;ve sent instructions and your account details. Please wait
          for the email — a fresh link is generated every time you submit this form.
        </p>
      )}

      {formError && (
        <p role="alert" className="auth-form-error">
          {formError}
        </p>
      )}

      <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Recover password"}
      </Button>

      <p className="auth-form-footer">
        <Link href="/login" className="auth-form-link">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
