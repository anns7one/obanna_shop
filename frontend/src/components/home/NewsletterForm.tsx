"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import styles from "./NewsletterForm.module.css";

export function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return <p className={styles.confirm}>You&apos;re on the list — thank you.</p>;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className={styles.form}
    >
      <label htmlFor="newsletter-email" className={styles.srOnly}>
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        placeholder="you@example.com"
        className={styles.input}
      />
      <Button type="submit" size="md" className={styles.submit}>
        Subscribe
      </Button>
    </form>
  );
}
