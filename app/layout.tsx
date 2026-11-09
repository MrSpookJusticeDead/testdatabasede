import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Global Pulse - Global Social Chat",
  description: "Simple global chat powered by Next.js, Turso, and Better Auth.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}