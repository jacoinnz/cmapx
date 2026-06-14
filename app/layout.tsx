import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CMAP — Cyber Maturity Check for NZ Businesses",
  description:
    "A free, private cybersecurity maturity self-check for New Zealand businesses. Nothing you enter is stored or sent anywhere.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NZ">
      <body>{children}</body>
    </html>
  );
}
