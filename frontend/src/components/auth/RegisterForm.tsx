"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { registerSchema, type RegisterValues } from "@/lib/validation";
import { registerUser, AuthError } from "@/lib/api/auth";
import { useAuthStore } from "@/store/authStore";
import { sanitizePhoneInput } from "@/lib/phone";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { PasswordCat } from "@/components/auth/PasswordCat";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema), defaultValues: { consent: false } });

  const passwordField = register("password");
  const phoneField = register("phone");

  async function onSubmit(values: RegisterValues) {
    setFormError(null);
    try {
      const user = await registerUser(values);
      setUser(user);
      router.push(searchParams.get("redirect") || "/account");
    } catch (err) {
      setFormError(err instanceof AuthError ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="auth-form">
      <PasswordCat active={isPasswordFocused} label="Sign up" />
      <div className="auth-form-row">
        <Input
          id="firstName"
          label="First name"
          autoComplete="given-name"
          error={errors.firstName?.message}
          {...register("firstName")}
        />
        <Input
          id="lastName"
          label="Last name"
          autoComplete="family-name"
          error={errors.lastName?.message}
          {...register("lastName")}
        />
      </div>
      <Input
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
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
        id="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters, one uppercase letter and one number."
        error={errors.password?.message}
        {...passwordField}
        onFocus={() => setIsPasswordFocused(true)}
        onBlur={(e) => {
          setIsPasswordFocused(false);
          passwordField.onBlur(e);
        }}
      />
      <Input
        id="confirmPassword"
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <div className="field">
        <label className="auth-form-checkbox">
          <input
            type="checkbox"
            onChange={(e) => setValue("consent", e.target.checked, { shouldValidate: true })}
          />
          I agree to the processing of my personal data.
        </label>
        {errors.consent && (
          <p role="alert" className="field-error">
            {errors.consent.message}
          </p>
        )}
      </div>

      {formError && (
        <p role="alert" className="auth-form-error">
          {formError}
        </p>
      )}

      <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "Creating account…" : "Create account"}
      </Button>

      <p className="auth-form-footer">
        Already have an account?{" "}
        <Link href="/login" className="auth-form-link">
          Sign in
        </Link>
      </p>
    </form>
  );
}
