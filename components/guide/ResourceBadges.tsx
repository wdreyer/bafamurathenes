import { FileText, Link2, NotebookText } from "lucide-react";
import { timeResources, type TrainingCatalogItem } from "@/lib/trainingCatalog";

/** "2 fiches · 1 document · 1 lien" badges for a training time. */
export function ResourceBadges({ item }: { item: TrainingCatalogItem }) {
  const resources = timeResources(item);
  const count = (kind: "sheet" | "file" | "link") => resources.filter((resource) => resource.kind === kind).length;
  const badges = [
    { kind: "sheet", icon: NotebookText, label: (n: number) => `${n} fiche${n > 1 ? "s" : ""}`, style: "bg-[#fff7cc] text-[#5c4b00]" },
    { kind: "file", icon: FileText, label: (n: number) => `${n} document${n > 1 ? "s" : ""}`, style: "bg-white text-[#66239d] ring-1 ring-[#e6d9f0]" },
    { kind: "link", icon: Link2, label: (n: number) => `${n} lien${n > 1 ? "s" : ""}`, style: "bg-white text-[#66239d] ring-1 ring-[#e6d9f0]" },
  ] as const;
  return <>{badges.map((badge) => {
    const n = count(badge.kind);
    if (!n) return null;
    const Icon = badge.icon;
    return <span key={badge.kind} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${badge.style}`}><Icon size={10} />{badge.label(n)}</span>;
  })}</>;
}
