"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return <p className="newsletter-confirm">You&apos;re on the list — thank you.</p>;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="newsletter-form"
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        placeholder="you@example.com"
        className="newsletter-input"
      />
      <Button type="submit" size="md" className="newsletter-submit">
        Subscribe
      </Button>
    </form>
  );
}
