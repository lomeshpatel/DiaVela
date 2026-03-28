import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${fraunces.variable} font-sans antialiased h-screen overflow-hidden`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
