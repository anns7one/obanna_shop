import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in — Obanna",
};

export default function LoginPage() {
  return (
    <div className="login-page">
      <h1 className="login-page-title">Welcome back</h1>
      <p className="login-page-subtitle">Sign in to view your orders and saved pieces.</p>
      <div className="login-page-card">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
