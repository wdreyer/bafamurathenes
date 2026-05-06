// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Fraunces, Caveat, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactWidget from "@/components/ContactWidget";
import ScrollHint from "@/components/ScrollHint";
import { getSiteUrl } from "@/lib/siteUrl";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-caveat",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
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
          strategy="lazyOnload"
        />
        <Script id="google-ads-gtag" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17976361031');
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

        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <ContactWidget />
        <ScrollHint />
      </body>
    </html>
  );
}
