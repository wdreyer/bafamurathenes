import type { Metadata } from "next";
import { TeamShell } from "@/components/planning/TeamShell";

export const metadata: Metadata = {
  title: "Équipe pédagogique | Murathènes",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function PlanningLayout({ children }: { children: React.ReactNode }) {
  return <TeamShell>{children}</TeamShell>;
}
