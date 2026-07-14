"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileValues } from "@/lib/validation";
import { useAuthStore } from "@/store/authStore";
import { useUpdateProfile } from "@/hooks/useProfile";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/client";

export function ProfileForm() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: user?.firstName ?? "", lastName: user?.lastName ?? "" },
  });

  if (!user) return null;

  async function onSubmit(values: ProfileValues) {
    setFormError(null);
    setSaved(false);
    try {
      await updateProfile.mutateAsync(values);
      setSaved(true);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="profile-form">
      <div className="profile-form-row">
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

      <Input id="email" label="Email" defaultValue={user.email} disabled hint="Email can't be changed yet." />

      {formError && (
        <p role="alert" className="auth-form-error">
          {formError}
        </p>
      )}
      {saved && !isDirty && (
        <p className="profile-form-success" role="status">
          Saved.
        </p>
      )}

      <Button type="submit" disabled={isSubmitting || !isDirty}>
        {isSubmitting ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
