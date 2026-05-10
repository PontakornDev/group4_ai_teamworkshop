import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "Pawnder",
  description: "Find your perfect dog match",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background text-on-background font-sans">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
