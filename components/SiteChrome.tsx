"use client";

import { usePathname } from "next/navigation";
import ContactWidget from "@/components/ContactWidget";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollHint from "@/components/ScrollHint";
import SitePausedPage from "@/components/SitePausedPage";
import type { SitePause } from "@/lib/sitePause";

export default function SiteChrome({ children, sitePause }: { children: React.ReactNode; sitePause: SitePause }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/auth/") || pathname.startsWith("/atelier/") || pathname === "/equipe" || pathname.startsWith("/equipe/");

  if (isAdmin) {
    return <>{children}</>;
  }

  // Admin and trainer spaces stay reachable while the public site is paused.
  if (sitePause.paused) {
    return <SitePausedPage />;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ContactWidget />
      <ScrollHint />
    </>
  );
}
