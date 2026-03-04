import "@/app/globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import ClientTabMeta from "@/components/ClientTabMeta";
import { prisma } from "@/lib/prisma";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body"
});

const displayFont = Sora({
  subsets: ["latin"],
  variable: "--font-display"
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mark-andrei-portfolio.onrender.com";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  let profile: {
    tabTitle: string | null;
    faviconUrl: string | null;
    socialImageUrl: string | null;
    brandName: string | null;
    fullName: string;
    about: string;
  } | null = null;

  try {
    profile = await prisma.profile.findFirst({
      select: {
        tabTitle: true,
        faviconUrl: true,
        socialImageUrl: true,
        brandName: true,
        fullName: true,
        about: true
      }
    });
  } catch {
    profile = null;
  }

  const title = profile?.tabTitle || "To the clouds. - Mark Andrei Castillo";
  const profileName = profile?.fullName || "Mark Andrei";
  const ogTitle = profile?.brandName ? `${profileName}, ${profile.brandName}` : "Mark Andrei, To the clouds.";
  const description =
    profile?.about ||
    "Entry-level DevOps and Software Developer portfolio of Mark Andrei Castillo focused on practical applications and reliable systems.";
  const socialImage = profile?.socialImageUrl || "/opengraph-image";
  const favicon = profile?.faviconUrl || "/icon";

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    openGraph: {
      title: ogTitle,
      description,
      url: siteUrl,
      siteName: "Mark Andrei Portfolio",
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: "Portfolio Preview"
        }
      ],
      locale: "en_US",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [socialImage]
    },
    icons: {
      icon: [{ url: favicon }],
      shortcut: [favicon],
      apple: [{ url: favicon }]
    }
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${displayFont.variable} font-body antialiased`}>
        <ClientTabMeta />
        {children}
      </body>
    </html>
  );
}
