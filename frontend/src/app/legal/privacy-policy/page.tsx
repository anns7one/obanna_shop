import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — OBA Atelier",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="legal-page">
      <h1 className="legal-page-title">Privacy Policy</h1>
      <p className="legal-page-updated">Last updated: 2026</p>

      <section className="legal-page-section">
        <h2>What we collect</h2>
        <p>
          When you create an account or place an order, we collect your name, email address, phone number,
          delivery address, and — if you save one — a card&apos;s brand, last 4 digits and expiry date. We
          never store or transmit your full card number or CVC.
        </p>
      </section>

      <section className="legal-page-section">
        <h2>How we use it</h2>
        <p>
          Your information is used to create and manage your account, process and deliver orders, and contact
          you about them. We don&apos;t sell your personal data to third parties.
        </p>
      </section>

      <section className="legal-page-section">
        <h2>How we protect it</h2>
        <p>
          Passwords are stored as one-way hashes, never as plain text. Saved payment methods never include a
          full card number or CVC — there is nothing sensitive to steal even if our database were compromised.
        </p>
      </section>

      <section className="legal-page-section">
        <h2>Your choices</h2>
        <p>
          You can review and update your personal data, saved addresses and saved cards at any time from your
          account, or ask us to delete your account entirely by contacting{" "}
          <a href="mailto:hello@obaatelier.com">hello@obaatelier.com</a>.
        </p>
      </section>
    </div>
  );
}
