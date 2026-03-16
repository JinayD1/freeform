import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resale List — AI Listing Generator",
  description: "Generate resale listings from product photos"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

