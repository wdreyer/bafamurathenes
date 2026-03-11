// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Poppins, Nunito } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactWidget from "@/components/ContactWidget";
import ScrollHint from "@/components/ScrollHint";
import { getSiteUrl } from "@/lib/siteUrl";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();
const socialImagePath = "/hero-bafa.jpg";
const socialImageUrl = `${siteUrl}${socialImagePath}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BAFA Murathenes | Formations en Auvergne",
    template: "%s | BAFA Murathenes",
  },
  description:
    "Formations BAFA en Auvergne avec Murathenes : formation generale, approfondissement, infos pratiques et accompagnement.",
  alternates: {
    canonical: "/",
  },
  applicationName: "BAFA Murathenes",
  keywords: [
    "BAFA",
    "formation BAFA",
    "BAFA Auvergne",
    "Murathenes",
    "animateur",
    "animation jeunesse",
  ],
  authors: [{ name: "Murathenes" }],
  creator: "Murathenes",
  publisher: "Murathenes",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: "BAFA Murathenes",
    title: "BAFA Murathenes | Formations en Auvergne",
    description:
      "Formations BAFA en Auvergne avec Murathenes : formation generale, approfondissement, infos pratiques et accompagnement.",
    images: [
      {
        url: socialImagePath,
        width: 1200,
        height: 630,
        alt: "Groupe en formation BAFA Murathenes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BAFA Murathenes | Formations en Auvergne",
    description:
      "Formations BAFA en Auvergne avec Murathenes : formation generale, approfondissement et infos pratiques.",
    images: [socialImageUrl],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      name: "Murathenes",
      url: siteUrl,
      logo: `${siteUrl}/icons/icon-512.png`,
      email: "bafa@murathenes.org",
      sameAs: ["https://www.instagram.com/murathenes.asso"],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "BAFA Murathenes",
      url: siteUrl,
      inLanguage: "fr-FR",
    },
  ];

  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable}`}
    >
      <body
        className={`${poppins.className} antialiased min-h-screen flex flex-col bg-amber-50 text-slate-900`}
      >
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17976361031"
          strategy="afterInteractive"
        />
        <Script id="google-ads-gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17976361031');
          `}
        </Script>
        <Script
          src="https://scripts.simpleanalyticscdn.com/latest.js"
          strategy="afterInteractive"
        />
        <Script
          id="structured-data"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify(structuredData)}
        </Script>

        <Header />
        <main className="flex-1 bg-gradient-to-b from-rose-50/70 via-amber-50/70 to-sky-50/70">
          {children}
        </main>
        <Footer />
        <ContactWidget />
        <ScrollHint />
      </body>
    </html>
  );
}
