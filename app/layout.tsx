import type { Metadata } from "next";
import "./globals.css";
import { ResaleBackground } from "@/components/ResaleBackground";

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
      <body className="antialiased">
        <div className="bg-cinematic-base" aria-hidden />
        <ResaleBackground />
        <div className="bg-grain" aria-hidden />
        {children}
      </body>
    </html>
  );
}

