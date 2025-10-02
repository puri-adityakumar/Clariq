import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/layout/Header";
import BackgroundFX from "../components/layout/BackgroundFX";
import { fontClasses } from "../lib/fonts";

export const metadata: Metadata = {
  title: "CLARIQ - AI-Powered Sales Intelligence",
  description: "Revolutionize your sales preparation and execution with deep research, intelligent reports, and voice agent integration that empowers both AI and human sales teams.",
  keywords: "AI sales, sales intelligence, voice agents, sales automation, prospect research, sales enablement",
  authors: [{ name: "CLARIQ Team" }],
  openGraph: {
    title: "CLARIQ - AI-Powered Sales Intelligence",
    description: "Revolutionize your sales preparation and execution with deep research, intelligent reports, and voice agent integration.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CLARIQ - AI-Powered Sales Intelligence",
    description: "Revolutionize your sales preparation and execution with deep research, intelligent reports, and voice agent integration.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark scroll-smooth ${fontClasses}`}>
      <body className="antialiased font-body bg-background text-foreground relative noise-bg">
        <BackgroundFX />
        <Header />
        {children}
      </body>
    </html>
  );
}
