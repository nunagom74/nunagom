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
  title: {
    template: '%s | Nuna Gom',
    default: 'Nuna Gom - Handmade Knitted Bears',
  },
  description: 'Handcrafted knitted bears with warmth in every loop. Custom orders available.',
  openGraph: {
    title: 'Nuna Gom',
    description: 'Handcrafted knitted bears with warmth in every loop.',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Nuna Gom',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: '/brand-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Nuna Gom - Handcrafted Knitted Bears',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nuna Gom',
    description: 'Handcrafted knitted bears with warmth in every loop.',
    images: ['/brand-image.jpg'],
  },
}
import { AnalyticsTracker } from "@/components/analytics-tracker";

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
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}
