import "@/app/globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Mark Andrei Castillo | Cloud DevOps Portfolio",
  description: "Minimalist cloud-native portfolio of Mark Andrei R. Castillo"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-awsBlack text-white antialiased">
        {children}
      </body>
    </html>
  );
}

