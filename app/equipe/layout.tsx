import type { Metadata } from "next";
import { TeamShell } from "@/components/planning/TeamShell";
import { TeamAccess } from "@/components/team/TeamAccess";

export const metadata: Metadata = {
  title: "Équipe pédagogique | Murathènes",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function PlanningLayout({ children }: { children: React.ReactNode }) {
  return <TeamAccess><TeamShell>{children}</TeamShell></TeamAccess>;
}
