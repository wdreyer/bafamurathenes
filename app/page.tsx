"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import type { Formation } from "@/lib/types";

// Helpers dates & labels
const normalizeDate = (value: any): string => {
  if (!value) return "";
  if (typeof value === "string") return value;

  if (typeof value.toDate === "function") {
    const d: Date = value.toDate();
    return d.toISOString().slice(0, 10);
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value);
};

const parseDateSafe = (value: string | undefined | null): Date | null => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatDateRangeFr = (start?: string, end?: string): string => {
  const dStart = parseDateSafe(start ?? "");
  const dEnd = parseDateSafe(end ?? "");

  if (!dStart || !dEnd) return "";

  const dayStart = String(dStart.getDate()).padStart(2, "0");
  const dayEnd = String(dEnd.getDate()).padStart(2, "0");
  const month = String(dStart.getMonth() + 1).padStart(2, "0");
  const year = dStart.getFullYear();

  if (dStart.getMonth() === dEnd.getMonth()) {
    return `${dayStart}–${dayEnd}/${month}/${year}`;
  }

  const monthEnd = String(dEnd.getMonth() + 1).padStart(2, "0");
  return `${dayStart}/${month}/${year} – ${dayEnd}/${monthEnd}/${year}`;
};

const monthNamesFr = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

const getMonthYearLabelFr = (dateStr?: string): string => {
  const d = parseDateSafe(dateStr ?? "");
  if (!d) return "";
  return `${monthNamesFr[d.getMonth()]} ${d.getFullYear()}`;
};

const typeShortLabel: Record<string, string> = {
  formation_generale: "BAFA Base",
  approfondissement_sejour_etranger: "BAFA Appro",
};

const typeLongLabel: Record<string, string> = {
  formation_generale: "Formation générale",
  approfondissement_sejour_etranger:
    "Approfondissement séjour à l'étranger / échange de jeunes",
};

export default function HomePage() {
  const [formations, setFormations] = useState<Formation[]>([]);

  // Récupérer les formations depuis Firestore
  useEffect(() => {
    const q = query(collection(db, "formations"), orderBy("startDate", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Formation[] = snapshot.docs.map((doc) => {
        const d = doc.data() as any;
        return {
          id: doc.id,
          ...d,
          startDate: normalizeDate(d.startDate),
          endDate: normalizeDate(d.endDate),
        } as Formation;
      });

      setFormations(data);
    });

    return () => unsubscribe();
  }, []);

  // filtrer sur les prochaines formations (>= aujourd'hui)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingFormations = formations
    .map((f) => {
      const d = parseDateSafe(f.startDate);
      return { ...f, _startDateObj: d };
    })
    .filter((f) => f._startDateObj && f._startDateObj >= today)
    .sort(
      (a, b) =>
        (a._startDateObj?.getTime() ?? 0) - (b._startDateObj?.getTime() ?? 0)
    );

  const heroFormations = upcomingFormations.slice(0, 2);
  const calendarFormations = upcomingFormations.slice(0, 4);

  const calendarYears = Array.from(
    new Set(
      calendarFormations
        .map((f) => parseDateSafe(f.startDate)?.getFullYear())
        .filter(Boolean)
    )
  ) as number[];

  const calendarYearLabel =
    calendarYears.length === 0
      ? ""
      : calendarYears.length === 1
      ? `${calendarYears[0]}`
      : `${Math.min(...calendarYears)}–${Math.max(...calendarYears)}`;

  return (
    <>
      {/* HERO */}
      <section
        id="hero"
        className="relative w-full bg-slate-950 min-h-[60vh] md:min-h-[65vh]"
      >
        {/* Image de fond */}
        <Image
          src="/hero-bafa.jpg"
          alt="Jeunes en formation BAFA dans un cadre nature"
          fill
          priority
          className="object-cover"
        />

        {/* Dégradé + voile sombre */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-950/70 via-slate-950/40 to-slate-900/10" />

        {/* Contenu */}
        <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center px-4 py-12 md:px-6">
          <div className="flex w-full flex-col gap-10 md:flex-row md:items-start md:justify-between">
            {/* Colonne gauche : intro */}
            <div className="max-w-md space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-sky-100 ring-1 ring-sky-400/40 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-300" />
                Formations BAFA en Auvergne
              </div>

              <div className="space-y-3">
                <h1 className="font-display text-3xl md:text-4xl font-semibold leading-tight text-white">
                  BAFA Murathènes
                </h1>
                <p className="text-sm md:text-base text-slate-100/90">
                  Des formations BAFA exigeantes et bienveillantes, dans un
                  cadre nature en Auvergne, pour préparer ton premier job
                  d&apos;anim&apos; avec une vraie équipe pédagogique.
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-100/80">
                <div className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 ring-1 ring-white/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Encadrement expérimenté</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 ring-1 ring-white/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  <span>Petits groupes</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 ring-1 ring-white/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                  <span>Immersion vie de colo</span>
                </div>
              </div>
            </div>

            {/* Colonne droite : timeline des prochaines sessions */}
            <div className="mt-4 max-w-md md:mt-0">
              <h2 className="font-display text-lg md:text-xl font-semibold text-white">
                Les prochaines formations
              </h2>
              <p className="mt-2 text-xs text-slate-100/85">
                {heroFormations.length > 0
                  ? "Voici les prochaines dates de formation générale et d'approfondissement."
                  : "Les prochaines dates arrivent très bientôt."}
              </p>
              <div className="mt-6 flex">
  {/* Colonne timeline */}
  <div className="relative mr-5 flex flex-col items-center pt-1">
    <div className="absolute top-3 bottom-3 w-[2px] bg-gradient-to-b from-sky-400/80 via-sky-300/60 to-sky-200/30" />
    <div className="relative z-10 flex h-full flex-col justify-between gap-10">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-400 shadow-[0_0_0_3px_rgba(15,23,42,0.8)] ring-2 ring-sky-200">
        <span className="h-2.5 w-2.5 rounded-full bg-white" />
      </span>
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-300 shadow-[0_0_0_3px_rgba(15,23,42,0.8)] ring-2 ring-sky-100">
        <span className="h-2.5 w-2.5 rounded-full bg-white" />
      </span>
    </div>
  </div>

  {/* Cartes sessions */}
  <div className="flex-1 space-y-4">
    {heroFormations.length === 0 && (
      <article className="rounded-xl bg-black/55 px-4 py-3 backdrop-blur-md ring-1 ring-white/10">
        <p className="text-xs text-slate-100/85">
          Le calendrier des formations sera mis en ligne très prochainement. Tu
          peux déjà jeter un œil aux infos générales plus bas.
        </p>
      </article>
    )}

    {heroFormations.map((f, index) => {
      const isFG = f.type === "formation_generale";

      const badgeColor = isFG ? "text-sky-200" : "text-amber-200";
      const buttonClasses = isFG
        ? "shrink-0 rounded-md bg-sky-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-400"
        : "shrink-0 rounded-md border border-amber-300/80 bg-amber-400/90 px-4 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-amber-300";

      // 🔹 début de la vraie description
      const rawDescription = f.description ?? "";
      const firstLine =
        typeof rawDescription === "string"
          ? rawDescription
              .split("\n")
              .map((line) => line.trim())
              .find((line) => line.length > 0) ?? ""
          : "";

      return (
        <Link key={f.id} href={`/formations/${f.id}`} className="block group">
          <article className="rounded-xl bg-black/55 px-4 py-3 backdrop-blur-md ring-1 ring-white/10 transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:bg-black/70 hover:shadow-xl">
            <header className="mb-2 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p
                  className={`text-[11px] font-semibold uppercase tracking-wide ${badgeColor}`}
                >
                  {getMonthYearLabelFr(f.startDate)} ·{" "}
                  {typeShortLabel[f.type] ?? f.type}
                </p>
                <p className="text-sm font-semibold text-white">
                  {typeLongLabel[f.type] ?? f.type}
                </p>
              </div>
              <button className={buttonClasses}>
                {index === 0 ? "Je m'inscris" : "Voir les détails"}
              </button>
            </header>

            <p className="text-xs text-slate-100/85">
              <span className="font-medium">
                {formatDateRangeFr(f.startDate, f.endDate)}
              </span>
              <br />
              {firstLine ||
                "Une formation BAFA centrée sur la pratique et la vie de colo."}
              <br />
              <span className="text-[11px] italic text-slate-200">
                Plus de détails en cliquant sur le bouton.
              </span>
            </p>
          </article>
        </Link>
      );
    })}
  </div>
</div>



            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1 : Présentation BAFA */}
      <section
        id="programme"
        className="border-t border-slate-100 bg-amber-50/70"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row md:items-start md:justify-between md:px-6">
          <div className="max-w-xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-800">
              Le BAFA avec Murathènes
            </p>
            <h2 className="font-display text-xl md:text-2xl font-semibold text-slate-900">
              Un BAFA vivant, engagé et ancré dans la réalité du terrain
            </h2>
            <p className="text-sm text-slate-700">
              On ne te récite pas un manuel : on part de situations vécues, de
              jeux, de mises en scène et de la vraie vie de colo. L&apos;idée,
              c&apos;est que tu repartes avec des outils concrets et une posture
              pro, tout en restant toi-même.
            </p>

            <div className="flex flex-wrap gap-3 text-xs text-slate-700">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Approche bienveillante mais exigeante
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                Cohésion de groupe et entraide
              </span>
            </div>

            <div className="pt-2">
  <Link
    href="/bafa"
    className="group relative inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold uppercase tracking-wide text-sky-900 hover:text-sky-700"
  >
    En savoir plus sur le BAFA

    {/* flèche */}
    <span className="transition-transform duration-300 group-hover:translate-x-1">
      →
    </span>

    {/* underline animé */}
  </Link>
</div>

          </div>

          <div className="grid w-full max-w-md gap-4 text-sm text-slate-800 md:text-xs">
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md">
              <div className="absolute left-0 top-0 h-1 w-16 bg-sky-500" />
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Pédagogie active
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                On apprend en faisant, pas en restant assis 7 heures.
              </p>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
              <div className="absolute left-0 top-0 h-1 w-16 bg-emerald-500" />
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Cadre sécurisant
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                Un cadre clair, des règles expliquées, un vrai accompagnement.
              </p>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md">
              <div className="absolute left-0 top-0 h-1 w-16 bg-amber-500" />
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Esprit colo
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                Tu vis une vraie mini-colo, avec veillées, services, vie
                collective.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 : Calendrier dynamique */}
{/* SECTION : TIMELINE V2 */}
<section id="timeline" className="border-t border-slate-100 bg-white">
  <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
    {/* HEADER */}
    <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 whitespace-nowrap">
          Calendrier {calendarYearLabel || "des formations"}
        </p>
        <h2 className="font-display text-xl md:text-2xl font-semibold text-slate-900">
          Les prochaines sessions en un coup d&apos;œil
        </h2>
        <p className="mt-1 text-sm text-slate-700 max-w-xl">
          Un aperçu rapide des prochaines dates. Le calendrier détaillé est accessible sur la page dédiée.
        </p>
      </div>

      <Link
        href="/formations"
        className="mt-2 inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-sky-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-900 hover:bg-sky-200 transition"
      >
        Voir le calendrier complet
        <span className="text-sm">→</span>
      </Link>
    </header>

    {calendarFormations.length === 0 ? (
      <p className="text-sm text-slate-600">
        Les prochaines dates seront affichées ici dès qu&apos;elles sont confirmées.
      </p>
    ) : (
      <div className="grid gap-5 md:grid-cols-2">
        {calendarFormations.map((f) => {
          const isFG = f.type === "formation_generale";
          const chipBg = isFG
            ? "bg-sky-100 text-sky-800"
            : "bg-amber-100 text-amber-800";
          const borderColor = isFG
            ? "border-sky-100 hover:border-sky-300"
            : "border-amber-100 hover:border-amber-300";
          const emoji = isFG ? "🌱" : "🌍";

          // 📝 On récupère le début du vrai texte de description
          const rawDescription = f.description ?? "";
          const firstLine =
            typeof rawDescription === "string"
              ? (rawDescription
                  .split("\n")
                  .map((line) => line.trim())
                  .find((line) => line.length > 0) ?? "")
              : "";

          return (
            <Link key={f.id} href={`/formations/${f.id}`} className="group">
              <article
                className={`flex flex-col gap-3 rounded-2xl border bg-slate-50/80 px-4 py-4 text-sm transition-transform duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-md ${borderColor}`}
              >
                {/* Ligne haut : icône + type + mois */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-lg">
                    <span className="translate-y-[1px]">{emoji}</span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                        {getMonthYearLabelFr(f.startDate)}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${chipBg}`}
                      >
                        {typeShortLabel[f.type] ?? f.type}
                      </span>
                    </div>
                    <h3 className="mt-1 font-display text-sm md:text-base font-semibold text-slate-900">
                      {typeLongLabel[f.type] ?? f.type}
                    </h3>
                  </div>
                </div>

                {/* Dates bien visibles */}
                <p className="text-sm font-medium text-slate-800">
                  📅 {formatDateRangeFr(f.startDate, f.endDate)}
                </p>

                {/* Prix */}
                <p className="text-xs text-slate-600">
                  💶 <span className="font-semibold">{f.price} €</span> — hors transport
                </p>

                {/* 🔥 Début du vrai texte de la formation */}
                <p className="text-xs text-slate-600">
                  {firstLine || "La description détaillée de cette formation arrive bientôt."}
                </p>

                {/* Ligne “voir les détails” */}
                <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-sky-700 group-hover:text-sky-900">
                  Voir les détails
                  <span className="transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    )}
  </div>
</section>




      {/* SECTION 3 : Infos pratiques plus fun */}
      <section
        id="infos"
        className="relative border-t border-slate-100 bg-gradient-to-b from-sky-50 via-amber-50/70 to-rose-50/70"
      >
        <div className="pointer-events-none absolute -top-6 left-0 right-0 h-6 bg-[radial-gradient(ellipse_at_top,_rgba(15,23,42,0.12),_transparent)]" />

        <div className="relative mx-auto max-w-6xl px-4 py-10 md:px-6">
          <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-xl space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Infos pratiques
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-slate-900">
                Un séjour tout compris, avec un pack transport pensé pour toi
              </h2>
              <p className="text-sm text-slate-700">
                On sait que se déplacer jusqu&apos;au lieu de formation peut
                être un casse-tête. Du coup on a fait simple :{" "}
                <span className="font-medium text-slate-900">
                  transport organisé, hébergement, bouffe, animations
                </span>
                . Tu te concentres sur ta formation, on s&apos;occupe du reste.
              </p>

              <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium text-slate-700">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 shadow-sm ring-1 ring-sky-200">
                  <span className="text-base">🚌</span>
                  Départs groupés depuis Lyon & Paris
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 shadow-sm ring-1 ring-emerald-200">
                  <span className="text-base">🍽️</span>
                  Pension complète sur place
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 shadow-sm ring-1 ring-amber-200">
                  <span className="text-base">🛏️</span>
                  Chambres partagées façon colo
                </span>
              </div>

              <div className="pt-4">
                <Link
                  href="/#reservation"
                  className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-sm transition hover:bg-rose-400"
                >
                  Voir les modalités d&apos;inscription
                  <span className="text-sm">→</span>
                </Link>
              </div>
            </div>

            <div className="grid w-full max-w-md gap-4 text-xs text-slate-700 md:text-sm">
              <div className="group relative overflow-hidden rounded-2xl border border-sky-100 bg-white/90 px-4 py-4 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:border-sky-300 hover:shadow-md">
                <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-sky-100/80" />
                <div className="relative flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-lg">
                    <span className="translate-y-[1px] text-white">🚌</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700">
                      Pack transport
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900">
                      Trajets organisés depuis les grandes villes
                    </p>
                    <p className="mt-1 text-xs text-slate-700">
                      Départs groupés depuis Lyon et Paris, pour arriver ensemble
                      sur le lieu de formation, encadrés par l&apos;équipe.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white/90 px-4 py-4 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md">
                <div className="absolute -right-5 -top-5 h-16 w-16 rounded-full bg-emerald-100/80" />
                <div className="relative flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-lg">
                    <span className="translate-y-[1px] text-white">🏡</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                      Hébergement & repas
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900">
                      Pension complète sur place
                    </p>
                    <p className="mt-1 text-xs text-slate-700">
                      Chambres partagées, repas équilibrés et temps conviviaux :
                      bref, une vraie vie de colo pendant ta formation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-amber-100 bg-white/90 px-4 py-4 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:border-amber-300 hover:shadow-md">
                <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-amber-100/80" />
                <div className="relative flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-lg">
                    <span className="translate-y-[1px] text-slate-900">💸</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                      Budget maîtrisé
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900">
                      Un tarif clair, sans mauvaise surprise
                    </p>
                    <p className="mt-1 text-xs text-slate-700">
                      Le pack inclut la formation, l&apos;hébergement, les repas
                      et le transport organisé. Les détails précis sont indiqués
                      au moment de l&apos;inscription.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-white/80 px-4 py-3 text-[11px] text-slate-700 shadow-sm md:flex md:items-center md:justify-between">
            <div className="mb-2 flex items-center gap-2 md:mb-0">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-lg">
                <span className="translate-y-[1px] text-white">✨</span>
              </span>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-slate-800">
                Ambiance colo garantie
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 text-white px-3 py-1">
                🎤 Veillées & grands jeux
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 text-sky-900 px-3 py-1">
                🤝 Cohésion de groupe
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-900 px-3 py-1">
                🧠 Posture pro & bienveillance
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
