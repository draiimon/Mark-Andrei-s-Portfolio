import "@/app/globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "To the clouds. — Mark Andrei Castillo",
  description: "To the clouds. Cloud & DevOps portfolio. Mark Andrei builds in the cloud. Philippines. Available for work."
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

