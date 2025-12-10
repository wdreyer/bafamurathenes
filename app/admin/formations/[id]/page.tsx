"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { Formation } from "@/lib/types";
import { FormationForm } from "@/components/admin/formations/FormationForm";

export default function EditFormationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [formation, setFormation] = useState<Formation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFormation = async () => {
      if (!id) return;
      const ref = doc(db, "formations", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setFormation({ id: snap.id, ...(snap.data() as any) } as Formation);
      }
      setLoading(false);
    };

    fetchFormation();
  }, [id]);

  if (loading) {
    return <p className="text-sm text-slate-500">Chargement de la formation...</p>;
  }

  if (!formation) {
    return (
      <main className="space-y-4">
        <p className="text-sm text-red-600">Formation introuvable.</p>
        <button
          onClick={() => router.push("/admin/formations")}
          className="text-sm text-slate-600 underline"
        >
          Retour à la liste des formations
        </button>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Modifier la formation
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Mettez à jour les informations de cette session.
        </p>
      </div>

      <FormationForm
        initialData={formation}
        formationId={id}
        onSaved={() => router.push("/admin/formations")}
      />
    </main>
  );
}
