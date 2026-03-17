import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Addition Calculator",
  description: "A simple calculator that adds two numbers together.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased">{children}</body>
    </html>
  );
}
