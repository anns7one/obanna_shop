import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Sign in — Obanna",
};

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome back</h1>
      <p className={styles.subtitle}>Sign in to view your orders and saved pieces.</p>
      <div className={styles.card}>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
