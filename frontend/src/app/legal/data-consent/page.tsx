import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personal Data Processing Consent — Obanna",
};

export default function DataConsentPage() {
  return (
    <div className="legal-page">
      <h1 className="legal-page-title">Personal Data Processing Consent</h1>
      <p className="legal-page-updated">Last updated: 2026</p>

      <section className="legal-page-section">
        <h2>What you&apos;re agreeing to</h2>
        <p>
          By checking the consent box during registration or checkout, you agree to let Obanna process the
          personal data you provide — name, email, phone number, delivery address, and order details — for
          the purpose of creating your account, processing your orders, and contacting you about them.
        </p>
      </section>

      <section className="legal-page-section">
        <h2>Scope</h2>
        <p>
          This consent covers only what&apos;s needed to run your account and fulfil your orders. It does not
          cover marketing communications, which — if ever introduced — would require a separate, explicit
          opt-in.
        </p>
      </section>

      <section className="legal-page-section">
        <h2>Withdrawing consent</h2>
        <p>
          You can withdraw this consent at any time by deleting your account, or by contacting{" "}
          <a href="mailto:hello@obanna.shop">hello@obanna.shop</a>. See our{" "}
          <a href="/legal/privacy-policy">Privacy Policy</a> for details on how your data is handled.
        </p>
      </section>
    </div>
  );
}
