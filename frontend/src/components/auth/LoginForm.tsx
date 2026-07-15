"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginSchema, type LoginValues } from "@/lib/validation";
import { loginUser, AuthError } from "@/lib/api/auth";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { PasswordCat } from "@/components/auth/PasswordCat";

const REMEMBERED_EMAIL_KEY = "obanna-remembered-email";

function getRememberedEmail(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? "";
}

interface LoginFormProps {
  /** Provided when rendered inside the header popup — closes the modal
   * instead of navigating. Omitted on the standalone /login page, which
   * keeps navigating (e.g. back to the page that required login). */
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const rememberedEmail = getRememberedEmail();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: rememberedEmail, rememberMe: Boolean(rememberedEmail) },
  });

  const passwordField = register("password");

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    try {
      const user = await loginUser(values);
      if (values.rememberMe) {
        window.localStorage.setItem(REMEMBERED_EMAIL_KEY, values.email);
      } else {
        window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }
      setUser(user);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(searchParams.get("redirect") || "/account");
      }
    } catch (err) {
      setFormError(err instanceof AuthError ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="auth-form">
      <PasswordCat active={isPasswordFocused} label="Sign in" />
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
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...passwordField}
        onFocus={() => setIsPasswordFocused(true)}
        onBlur={(e) => {
          setIsPasswordFocused(false);
          passwordField.onBlur(e);
        }}
      />

      <div className="auth-form-options">
        <label className="auth-form-checkbox">
          <input type="checkbox" {...register("rememberMe")} />
          Remember me
        </label>
        <Link href="/forgot-password" className="auth-form-link">
          Forgot password?
        </Link>
      </div>

      {formError && (
        <p role="alert" className="auth-form-error">
          {formError}
        </p>
      )}

      <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>

      <p className="auth-form-footer">
        New here?{" "}
        <Link href="/register" className="auth-form-link">
          Create an account
        </Link>
      </p>
    </form>
  );
}
