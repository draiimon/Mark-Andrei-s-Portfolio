import "@/app/globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body"
});

const displayFont = Sora({
  subsets: ["latin"],
  variable: "--font-display"
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mark-andrei-portfolio.onrender.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "To the clouds. - Mark Andrei Castillo",
  description:
    "Entry-level Cloud and Developer portfolio of Mark Andrei Castillo focused on reliable systems and practical applications.",
  openGraph: {
    title: "Mark Andrei - To the clouds.",
    description:
      "Entry-level Cloud and Developer portfolio focused on practical projects, DevOps growth, and reliable delivery.",
    url: "/",
    siteName: "Mark Andrei Portfolio",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Mark Andrei Portfolio Preview"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Mark Andrei - To the clouds.",
    description:
      "Entry-level Cloud and Developer portfolio focused on practical projects, DevOps growth, and reliable delivery.",
    images: ["/twitter-image"]
  },
  icons: {
    icon: [{ url: "/icon", type: "image/png" }],
    shortcut: ["/icon"],
    apple: [{ url: "/icon", type: "image/png" }]
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${displayFont.variable} font-body antialiased`}>{children}</body>
    </html>
  );
}
