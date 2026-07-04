import { Suspense } from "react";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create account — Obanna",
};

export default function RegisterPage() {
  return (
    <div className="register-page">
      <h1 className="register-page-title">Create your account</h1>
      <p className="register-page-subtitle">Save pieces, track orders, check out faster.</p>
      <div className="register-page-card">
        <Suspense fallback={null}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
