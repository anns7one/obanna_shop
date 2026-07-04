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

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    try {
      const user = await loginUser(values);
      setUser(user);
      router.push(searchParams.get("redirect") || "/account");
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
      <Input
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />

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
