import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Freeform Next App",
  description: "Very basic Next.js + React frame"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

