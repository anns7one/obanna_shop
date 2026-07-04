import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Obanna — Soft-spoken everyday clothing",
  description:
    "A quiet, considered showroom of women's, men's and accessory pieces in a soft pastel palette.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital@0;1&display=swap"
        />
      </head>
      <body>
        <Providers>
          <Header />
          <main className="main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
