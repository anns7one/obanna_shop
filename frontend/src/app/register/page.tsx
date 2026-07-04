import { Suspense } from "react";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Create account — Obanna",
};

export default function RegisterPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create your account</h1>
      <p className={styles.subtitle}>Save pieces, track orders, check out faster.</p>
      <div className={styles.card}>
        <Suspense fallback={null}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
