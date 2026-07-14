import { Suspense } from "react";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { BlurText } from "@/components/motion/BlurText";

export const metadata: Metadata = {
  title: "Create account — Obanna",
};

export default function RegisterPage() {
  return (
    <div className="auth-banner">
      <div className="register-page">
        <h1 className="register-page-title">
          <BlurText text="Create your account" />
        </h1>
        <p className="register-page-subtitle">Save pieces, track orders, check out faster.</p>
        <div className="register-page-card liquid-glass">
          <Suspense fallback={null}>
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
