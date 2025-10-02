import type { Metadata } from "next";
import { Karla, Inconsolata, Unica_One } from "next/font/google";
import "./globals.css";
import Header from "../components/layout/Header";
import BackgroundFX from "../components/layout/BackgroundFX";

const karla = Karla({
  subsets: ["latin"],
  variable: "--font-karla",
  weight: ["400", "600", "700"],
  display: "swap",
});

const inconsolata = Inconsolata({
  subsets: ["latin"],
  variable: "--font-inconsolata",
  weight: ["400", "500", "600"],
  display: "swap",
});

const unicaOne = Unica_One({
  subsets: ["latin"],
  variable: "--font-unica-one",
  weight: ["400"],
  display: "swap",
});

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
    <html lang="en" className="dark scroll-smooth">
      <body className={`${karla.variable} ${inconsolata.variable} ${unicaOne.variable} antialiased font-body bg-background text-foreground relative noise-bg`}>      
  <BackgroundFX />
  <Header />
        {children}
      </body>
    </html>
  );
}
