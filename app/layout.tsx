import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DiaVela — AI Diabetes Care Assistant",
  description: "Manage your diabetes with AI-powered blood glucose tracking, nutrition lookup, medication reminders, and evidence-based education.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans antialiased h-screen overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}
