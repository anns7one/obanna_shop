import { Suspense } from "react";
import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { BlurText } from "@/components/motion/BlurText";

export const metadata: Metadata = {
  title: "Recover password — OBA Atelier",
};

export default function ForgotPasswordPage() {
  return (
    <div className="auth-banner">
      <div className="login-page">
        <h1 className="login-page-title">
          <BlurText text="Forgot your password?" />
        </h1>
        <p className="login-page-subtitle">
          Enter the email on your account and we&apos;ll send you a link to reset it.
        </p>
        <div className="login-page-card liquid-glass">
          <Suspense fallback={null}>
            <ForgotPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
