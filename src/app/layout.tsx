import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KavachAI — Defensive Shield Against Digital Arrest & Social Engineering",
  description:
    "Real-time, context-aware defensive AI assistant protecting Indian citizens from Digital Arrest scams, fake police/CBI coercion, and voice phishing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#09090b] text-zinc-100 antialiased selection:bg-teal-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
