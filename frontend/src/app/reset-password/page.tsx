import { Suspense } from "react";
import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { BlurText } from "@/components/motion/BlurText";

export const metadata: Metadata = {
  title: "Change password — Obanna",
};

export default function ResetPasswordPage() {
  return (
    <div className="auth-banner">
      <div className="login-page">
        <h1 className="login-page-title">
          <BlurText text="Set a new password" />
        </h1>
        <p className="login-page-subtitle">Confirm your email and choose a new password below.</p>
        <div className="login-page-card liquid-glass">
          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
