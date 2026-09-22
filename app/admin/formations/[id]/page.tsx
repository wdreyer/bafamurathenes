"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { collection, doc, getDoc, onSnapshot, serverTimestamp, writeBatch } from "firebase/firestore";
import { CalendarDays, Check, ExternalLink, Pencil, Users } from "lucide-react";
import { db } from "@/lib/firebase";
import { getFormationPublicHref } from "@/lib/formationSlugs";
import { InscriptionsTable } from "@/components/admin/inscriptions/InscriptionsTable";
import type { Formation, Inscription, Trainer } from "@/lib/types";

const euro = (value: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
const dateLabel = (value: string) => value ? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${value.slice(0, 10)}T12:00:00`)) : "Date à préciser";
const trainerName = (trainer: Trainer) => `${trainer.firstName} ${trainer.lastName}`.trim();

export default function FormationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [formation, setFormation] = useState<Formation | null>(null);
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubFormation = onSnapshot(doc(db, "formations", id), (snapshot) => {
      setFormation(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Formation : null);
      setLoading(false);
    }, () => { setError("Impossible de charger la formation."); setLoading(false); });
    const unsubInscriptions = onSnapshot(collection(db, "inscriptions"), (snapshot) =>
      setInscriptions(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() } as Inscription))),
      () => setError("Impossible de charger les inscriptions."));
    const unsubTrainers = onSnapshot(collection(db, "trainers"), (snapshot) =>
      setTrainers(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() } as Trainer))
        .sort((a, b) => trainerName(a).localeCompare(trainerName(b), "fr"))),
      () => setError("Impossible de charger les formateurs."));
    return () => { unsubFormation(); unsubInscriptions(); unsubTrainers(); };
  }, [id]);

  const related = useMemo(() => inscriptions.filter((inscription) => inscription.formationId === id), [id, inscriptions]);
  const validated = related.filter((inscription) => inscription.validationStatus === "validated").length;
  const assigned = trainers.filter((trainer) => formation?.trainerIds?.includes(trainer.id));

  const toggleTrainer = async (trainerId: string) => {
    if (!formation) return;
    const nextIds = formation.trainerIds?.includes(trainerId)
      ? formation.trainerIds.filter((value) => value !== trainerId)
      : [...(formation.trainerIds || []), trainerId];
    setBusy(true);
    setError("");
    try {
      const planRef = doc(db, "formationPlans", id);
      const plan = await getDoc(planRef);
      const batch = writeBatch(db);
      batch.update(doc(db, "formations", id), { trainerIds: nextIds, updatedAt: serverTimestamp() });
      if (plan.exists()) batch.update(planRef, {
        trainerNames: Object.fromEntries(trainers.filter((trainer) => nextIds.includes(trainer.id))
          .map((trainer) => [trainer.id, trainerName(trainer)])),
      });
      await batch.commit();
    } catch {
      setError("Impossible de modifier l'équipe de cette formation.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p className="text-sm text-slate-500">Chargement de la formation...</p>;
  if (!formation) return <main className="space-y-3"><p className="text-rose-700">Formation introuvable.</p><Link href="/admin/formations" className="text-sm underline">Retour aux formations</Link></main>;

  return <main className="space-y-8 pb-10">
    <header className="border-b border-slate-200 pb-5">
      <Link href="/admin/formations" className="text-xs font-medium text-emerald-800 hover:underline">Formations</Link>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">{formation.title}</h1>
          <p className="mt-1 text-sm text-slate-600">{formation.type === "formation_generale" ? "Formation générale" : "Approfondissement"} · {dateLabel(formation.startDate)} au {dateLabel(formation.endDate)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/formations/${id}/modifier`} className="inline-flex h-9 items-center gap-2 rounded border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800"><Pencil size={15} />Modifier la vente</Link>
          <Link href={getFormationPublicHref(formation)} target="_blank" className="inline-flex h-9 items-center gap-2 rounded border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800">Page publique<ExternalLink size={15} /></Link>
        </div>
      </div>
    </header>

    {error && <p role="alert" className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}

    <section className="grid gap-px overflow-hidden rounded border border-slate-200 bg-slate-200 sm:grid-cols-3">
      <div className="bg-white p-4"><p className="text-xs font-medium text-slate-500">Inscriptions</p><p className="mt-1 text-2xl font-semibold">{related.length}</p></div>
      <div className="bg-white p-4"><p className="text-xs font-medium text-slate-500">Validées</p><p className="mt-1 text-2xl font-semibold">{validated}</p></div>
      <div className="bg-white p-4"><p className="text-xs font-medium text-slate-500">Formateurs affectés</p><p className="mt-1 text-2xl font-semibold">{assigned.length}</p></div>
    </section>

    <div className="grid gap-8 xl:grid-cols-2">
      <section className="min-w-0 border-t border-slate-200 pt-4">
        <h2 className="text-lg font-semibold">Mise en vente</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="text-xs font-medium text-slate-500">Tarif de base</dt><dd className="mt-1 font-semibold">{euro(formation.price)}</dd></div>
          <div><dt className="text-xs font-medium text-slate-500">Dates</dt><dd className="mt-1">{dateLabel(formation.startDate)} au {dateLabel(formation.endDate)}</dd></div>
          <div className="sm:col-span-2"><dt className="text-xs font-medium text-slate-500">Lien d&apos;inscription Yapla</dt><dd className="mt-1 break-all">{formation.imageUrl ? <a href={formation.imageUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-800 underline">{formation.imageUrl}</a> : "Non renseigné"}</dd></div>
          <div className="sm:col-span-2"><dt className="text-xs font-medium text-slate-500">Options de transport</dt><dd className="mt-1">{formation.transportOptions?.length ? formation.transportOptions.map((option) => `${option.label} (${euro(option.price)})`).join(" · ") : "Aucune"}</dd></div>
          <div className="sm:col-span-2"><dt className="text-xs font-medium text-slate-500">Description</dt><dd className="mt-1 whitespace-pre-wrap text-slate-700">{formation.description || "Non renseignée"}</dd></div>
        </dl>
      </section>

      <section className="min-w-0 border-t border-slate-200 pt-4">
        <div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="text-lg font-semibold">Équipe & planning</h2><p className="mt-1 text-sm text-slate-600">{assigned.map(trainerName).join(", ") || "Aucun formateur affecté"}</p></div><Link href="/admin/formateurs" className="text-sm font-medium text-emerald-800 underline">Gérer les formateurs</Link></div>
        <div className="mt-4 flex flex-wrap gap-2">{trainers.map((trainer) => <button key={trainer.id} type="button" disabled={busy} aria-pressed={formation.trainerIds?.includes(trainer.id) || false} onClick={() => void toggleTrainer(trainer.id)} className={`inline-flex min-h-9 items-center gap-1 rounded border px-3 text-sm disabled:opacity-50 ${formation.trainerIds?.includes(trainer.id) ? "border-emerald-700 bg-emerald-50 text-emerald-900" : "border-slate-300 bg-white text-slate-700"}`}>{formation.trainerIds?.includes(trainer.id) && <Check size={14} />}{trainerName(trainer)}</button>)}{!trainers.length && <p className="text-sm text-slate-500">Crée d&apos;abord un formateur dans l&apos;espace équipe.</p>}</div>
        <div className="mt-5 flex flex-wrap gap-3"><Link href={`/admin/formateurs?formation=${encodeURIComponent(id)}`} className="inline-flex items-center gap-2 text-sm font-medium text-emerald-800 underline"><CalendarDays size={16} />Ouvrir le planning admin</Link><Link href="/atelier/equipe-planning" target="_blank" className="inline-flex items-center gap-2 text-sm font-medium text-emerald-800 underline"><ExternalLink size={16} />Vue formateurs</Link></div>
      </section>
    </div>

    <section id="inscriptions" className="border-t border-slate-200 pt-5">
      <div className="mb-4 flex items-center gap-2"><Users size={19} className="text-emerald-800" /><h2 className="text-lg font-semibold">Inscriptions de cette formation</h2></div>
      <InscriptionsTable formationId={id} />
    </section>
  </main>;
}
