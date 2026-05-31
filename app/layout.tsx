import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aron's ESAT Thing",
  description: "ESAT prep tracker — time every question, track every mistake.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
