import "@/app/globals.css";
import type { ReactNode } from "react";
import { Manrope, Sora } from "next/font/google";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body"
});

const displayFont = Sora({
  subsets: ["latin"],
  variable: "--font-display"
});

export const metadata = {
  title: "To the clouds. - Mark Andrei Castillo",
  description:
    "Cloud and DevOps portfolio of Mark Andrei Castillo with animated modern UI and project highlights."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${displayFont.variable} font-body antialiased`}>{children}</body>
    </html>
  );
}
