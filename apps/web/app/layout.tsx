import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Home Heroes - Turn Chores Into Adventures",
  description: "A family game where everyone earns XP, levels up, and unlocks badges by completing household tasks together. No punishment, just fun!",
  keywords: ["family", "tasks", "gamification", "kids", "chores", "rewards", "XP", "badges"],
  authors: [{ name: "Home Heroes" }],
  openGraph: {
    title: "Home Heroes - Turn Chores Into Adventures",
    description: "Transform household tasks into epic family adventures. Earn XP, unlock badges, and level up together!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
