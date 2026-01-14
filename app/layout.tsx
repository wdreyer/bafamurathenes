// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Poppins, Nunito } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactWidget from "@/components/ContactWidget"; // ✅ AJOUT
import ScrollHint from "@/components/ScrollHint";
import Script from "next/script";



// Police principale : Poppins
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Police "display" : un peu plus fun, mais moins ronde que Fredoka
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

// Tu peux garder Geist pour d'autres usages (code, etc.)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BAFA Murathènes",
  description: "Formations BAFA en Auvergne avec Murathènes",
   icons: {
    icon: '/murathenes.png',
  },
};




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable}`}
    >


      <body
        className={`${poppins.className} antialiased min-h-screen flex flex-col bg-amber-50 text-slate-900`}
      >
        <Header />
        <main className="flex-1 bg-gradient-to-b from-rose-50/70 via-amber-50/70 to-sky-50/70">{children}</main>
        <Footer />

        {/* ✅ Widget contact flottant */}
        <ContactWidget />
        <ScrollHint />
      </body>
            <Script src="https://scripts.simpleanalyticscdn.com/latest.js"  />


    </html>
  );
}
