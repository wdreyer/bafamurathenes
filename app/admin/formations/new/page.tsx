"use client";

import { useRouter } from "next/navigation";
import { FormationForm } from "@/components/admin/formations/FormationForm";

export default function NewFormationPage() {
  const router = useRouter();

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nouvelle formation</h1>
        <p className="text-sm text-slate-500 mt-1">
          Créez une nouvelle session de formation à ajouter à votre catalogue.
        </p>
      </div>

      <FormationForm
        onSaved={() => {
          router.push("/admin/formations");
        }}
      />
    </main>
  );
}
