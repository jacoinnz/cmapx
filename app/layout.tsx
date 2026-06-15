import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const SITE = "https://cmap-theta.vercel.app";
const TITLE = "Cybersecurity Maturity Health Check — for NZ Businesses";
const DESCRIPTION =
  "A free, private cybersecurity maturity health check for New Zealand businesses. Plain-English and technical paths, mapped to NZ standards. Nothing leaves your device.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "cybersecurity",
    "maturity assessment",
    "New Zealand",
    "NZISM",
    "Essential Eight",
    "cyber insurance",
    "SMB security",
    "self-assessment",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_NZ",
    url: SITE,
    siteName: "Cybersecurity Maturity Health Check",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NZ">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
