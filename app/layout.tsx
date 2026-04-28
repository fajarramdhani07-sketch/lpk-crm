import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LPK Candidate CRM",
  description: "Frontend prototype for LPK candidate CRM and CV generation"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
