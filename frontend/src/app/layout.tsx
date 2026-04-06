import type { Metadata } from "next";
import { DM_Sans, Quicksand } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/features/auth/auth-context";
import { StandaloneBanner } from "@/features/layout/standalone-banner";

import "./globals.css";

const fontSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fontDisplay = Quicksand({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Dog Shelter | Canine Adoption",
  description: "Find your next companion — browse adoptable dogs and AI-powered profiles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontSans.variable} ${fontDisplay.variable} min-h-screen font-sans antialiased`}
      >
        <AuthProvider>
          <StandaloneBanner />
          {children}
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
