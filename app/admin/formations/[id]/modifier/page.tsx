"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FormationForm } from "@/components/admin/formations/FormationForm";
import type { Formation } from "@/lib/types";

export default function EditFormationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [formation, setFormation] = useState<Formation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => onSnapshot(doc(db, "formations", id), (snapshot) => {
    setFormation(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Formation : null);
    setLoading(false);
  }, () => setLoading(false)), [id]);

  if (loading) return <p className="text-sm text-slate-500">Chargement de la formation...</p>;
  if (!formation) return <p className="text-sm text-rose-700">Formation introuvable.</p>;

  return <main className="space-y-5">
    <Link href={`/admin/formations/${id}`} className="text-sm text-emerald-800 underline underline-offset-2">Retour à la formation</Link>
    <h1 className="text-2xl font-semibold">Modifier la mise en vente</h1>
    <FormationForm initialData={formation} formationId={id} onSaved={() => router.push(`/admin/formations/${id}`)} />
  </main>;
}
