import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./sections.css";
import { site } from "@/content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${site.name} — Informatics Engineering, ITS`,
  description:
    "Personal portfolio of Hisyam Syafa Raditya, an Informatics Engineering student at Institut Teknologi Sepuluh Nopember. Python, SQL, data analysis, machine learning, and team leadership.",
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.name,
  keywords: [
    "Hisyam Syafa Raditya",
    "Informatics Engineering",
    "ITS",
    "Institut Teknologi Sepuluh Nopember",
    "portfolio",
    "Python",
    "SQL",
    "machine learning",
  ],
  openGraph: {
    title: `${site.name} — Informatics Engineering, ITS`,
    description:
      "Informatics Engineering student at ITS. Python, SQL, data analysis, machine learning, and team leadership.",
    type: "website",
    locale: "en_US",
    siteName: site.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Informatics Engineering, ITS`,
    description:
      "Informatics Engineering student at ITS. Python, SQL, data analysis, machine learning, and team leadership.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#050507",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/anybody-variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/fraunces-italic.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/dm-mono-400.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
