import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://viruspumptoken.vercel.app"),
  title: "Viruspump Token | The Virus is Spreading",
  description:
    "A digital pathogen on the Solana blockchain. Every buy is an infection. Every holder is a carrier. There is no cure.",
  icons: {
    icon: "/images/logo.jpg",
    apple: "/images/logo.jpg",
  },
  openGraph: {
    title: "Viruspump Token",
    description: "The virus is spreading on Solana. Get infected.",
    images: ["/images/logo.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Viruspump Token",
    description: "The virus is spreading on Solana. Get infected.",
    images: ["/images/logo.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen font-sans noise-bg antialiased">{children}</body>
    </html>
  );
}
