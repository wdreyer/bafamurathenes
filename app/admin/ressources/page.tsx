"use client";

import { ExternalLink } from "lucide-react";
import { TrainingTimesAdmin } from "@/components/admin/TrainingTimesAdmin";

export default function AdminResourcesPage() {
  return <div className="mx-auto max-w-[1500px] space-y-5 pb-12">
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
      <div><p className="text-xs font-semibold uppercase text-[#792bb9]">Espace formateur·ices</p><h1 className="mt-1 text-2xl font-semibold">Guide des temps de formation</h1></div>
      <a href="/equipe/guide" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-[#66239d] underline"><ExternalLink size={15} />Voir le guide</a>
    </div>
    <TrainingTimesAdmin />
  </div>;
}
