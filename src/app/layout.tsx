import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/theme-context";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Analytics } from "@vercel/analytics/react";
import { Suspense } from "react";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://aletheia.intel'),
  title: {
    default: "Aletheia | Agentic Truth Engine",
    template: "%s | Aletheia"
  },
  description: "Advanced AI-powered intelligence orchestration and automated threat investigation platform. Generate comprehensive dossiers and biographical timelines in seconds.",
  keywords: ["Aletheia", "OSINT", "threat intelligence", "cybersecurity", "open source intelligence", "automated investigations", "digital footprint", "agentic OSINT"],
  authors: [{ name: "Aletheia Intelligence" }],
  creator: "Aletheia",
  publisher: "Aletheia",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Aletheia | Agentic Truth Engine",
    description: "Advanced intelligence synthesis and investigation management platform.",
    url: "https://aletheia.intel",
    siteName: "Aletheia",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Aletheia Interface Snapshot"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Aletheia | Intelligence Accelerator",
    description: "Run automated threat intelligence sweeps and compile comprehensive dossiers instantly.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Aletheia',
  },
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen bg-background text-text-primary`}
      >
        <ThemeProvider>
          <Suspense fallback={null}>
            <main className="min-h-screen">
              {children}
            </main>
          </Suspense>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
