"use client";

import { usePathname } from "next/navigation";
import ContactWidget from "@/components/ContactWidget";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollHint from "@/components/ScrollHint";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdmin) {
    return <>{children}</>;
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
