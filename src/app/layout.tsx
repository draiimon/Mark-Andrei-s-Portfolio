import "@/app/globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "To the clouds. - Mark Andrei Castillo",
  description:
    "Cloud and DevOps portfolio of Mark Andrei Castillo with animated modern UI and project highlights."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-awsBlack text-white antialiased">{children}</body>
    </html>
  );
}
