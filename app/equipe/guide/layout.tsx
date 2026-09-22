import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guide formateur·ices | Murathènes",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return children;
}
