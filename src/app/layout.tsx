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
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col noise-bg">{children}</body>
    </html>
  );
}
