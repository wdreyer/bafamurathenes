// app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import { getSiteUrl } from "@/lib/siteUrl";

// Fonts are self-hosted (latin, variable files in app/fonts) so builds never depend on Google Fonts:
// Google sometimes serves "l/font?kit=…&skey=…" URLs that Turbopack can't resolve, which broke deployments.
const geistSans = localFont({
  src: [{ path: "./fonts/geist.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: [{ path: "./fonts/geist-mono.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-geist-mono",
  display: "swap",
});

const fraunces = localFont({
  src: [
    { path: "./fonts/fraunces.woff2", weight: "100 900", style: "normal" },
    { path: "./fonts/fraunces-italic.woff2", weight: "100 900", style: "italic" },
  ],
  variable: "--font-fraunces",
  display: "swap",
});

const caveat = localFont({
  src: [{ path: "./fonts/caveat.woff2", weight: "400 700", style: "normal" }],
  variable: "--font-caveat",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: [{ path: "./fonts/jetbrains-mono.woff2", weight: "100 800", style: "normal" }],
  variable: "--font-jetbrains",
  display: "swap",
});

const siteUrl = getSiteUrl();
const socialImagePath = "/hero-bafa.jpg";
const socialImageUrl = `${siteUrl}${socialImagePath}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BAFA Murathènes | Formations en Auvergne",
    template: "%s | BAFA Murathènes",
  },
  description:
    "Formations BAFA dans le Cantal au domaine de Gravières avec Murathènes : formation générale, approfondissement séjour à l'étranger, dans un cadre unique !",
  alternates: {
    canonical: "/",
  },
  applicationName: "BAFA Murathènes",
  keywords: [
    "BAFA",
    "formation BAFA",
    "BAFA Cantal",
    "BAFA Auvergne",
    "BAFA Puy-de-Dôme",
    "BAFA Corrèze",
    "Murathènes",
    "domaine de Gravières",
    "animateur",
    "animation jeunesse",
    "BAFA Lanobre",
  ],
  authors: [{ name: "Murathènes" }],
  creator: "Murathènes",
  publisher: "Murathènes",
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
    siteName: "BAFA Murathènes",
    title: "BAFA Murathènes | Formations en Auvergne",
    description:
      "Formations BAFA dans le Cantal au domaine de Gravières avec Murathènes : formation générale, approfondissement séjour à l'étranger, dans un cadre unique !",
    images: [
      {
        url: socialImagePath,
        width: 1200,
        height: 630,
        alt: "Groupe en formation BAFA Murathènes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BAFA Murathènes | Formations en Auvergne",
    description:
      "Formations BAFA dans le Cantal au domaine de Gravières avec Murathènes : formation générale, approfondissement séjour à l'étranger, dans un cadre unique !",
    images: [socialImageUrl],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
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
      name: "Murathènes",
      url: siteUrl,
      logo: `${siteUrl}/icons/icon-512.png`,
      email: "bafa@murathenes.org",
      sameAs: ["https://www.instagram.com/murathenes.asso"],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "BAFA Murathènes",
      url: siteUrl,
      inLanguage: "fr-FR",
    },
  ];

  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${caveat.variable} ${jetbrainsMono.variable}`}
    >
      <body
        className="antialiased min-h-screen flex flex-col bg-[#fefcf5] text-[#1a1530]"
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
            gtag('config', 'G-FRBE18HE5Z');
          `}
        </Script>
        <Script
          src="https://scripts.simpleanalyticscdn.com/latest.js"
          strategy="lazyOnload"
        />
        <Script
          id="structured-data"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify(structuredData)}
        </Script>

        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
