"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import type { Formation } from "@/lib/types";
import {
  APRIL_FG_PROMO,
  getDisplayedFormationPrice,
  getReferenceFormationPrice,
  isAprilFgPromoFormation,
} from "@/lib/offers";

// Helpers dates & labels
const normalizeDate = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") return value;

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate?: () => Date }).toDate === "function"
  ) {
    const d = (value as { toDate: () => Date }).toDate();
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

  const sameMonth =
    dStart.getMonth() === dEnd.getMonth() &&
    dStart.getFullYear() === dEnd.getFullYear();

  if (sameMonth) {
    const monthLabel = monthNamesFr[dStart.getMonth()];
    const year = dStart.getFullYear();
    // ✅ 05–12 avril 2026
    return `${dayStart}–${dayEnd} ${monthLabel} ${year}`;
  }

  // si ça traverse un mois : 28 mars – 02 avril 2026 (et si année diff, on l'affiche)
  const startMonth = monthNamesFr[dStart.getMonth()];
  const endMonth = monthNamesFr[dEnd.getMonth()];
  const startYear = dStart.getFullYear();
  const endYear = dEnd.getFullYear();

  if (startYear === endYear) {
    return `${dayStart} ${startMonth} – ${dayEnd} ${endMonth} ${startYear}`;
  }
  return `${dayStart} ${startMonth} ${startYear} – ${dayEnd} ${endMonth} ${endYear}`;
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
  formation_generale: "BAFA FG",
  approfondissement_sejour_etranger: "BAFA Appro",
};

const typeLongLabel: Record<string, string> = {
  formation_generale: "Formation générale",
  approfondissement_sejour_etranger:
    "Approfondissement séjour à l'étranger / échange de jeunes",
};

const openContactWidget = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("contact-widget:open"));
};

export default function HomePage() {
  const [formations, setFormations] = useState<Formation[]>([]);

  // Récupérer les formations depuis Firestore
  useEffect(() => {
    const q = query(collection(db, "formations"), orderBy("startDate", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Formation[] = snapshot.docs.map((doc) => {
        const d = doc.data() as Omit<Formation, "id" | "startDate" | "endDate"> & {
          startDate?: unknown;
          endDate?: unknown;
        };
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

  const aprilPromoFormation = upcomingFormations.find((f) =>
    isAprilFgPromoFormation(f)
  );

  const aprilPromoHref = aprilPromoFormation
    ? `/formations/${aprilPromoFormation.id}`
    : "/formations?type=formation_generale";

  return (
    <>
      {/* HERO – on ne touche pas */}
      <section
        id="hero"
        className="relative w-full  min-h-[50vh] md:min-h-[50vh]"
      >
        {/* Image de fond */}
        <Image
          src="/bafa.jpg"
          alt="Jeunes en formation BAFA dans un cadre nature"
          fill
          priority
          className="object-cover"
        />

        {/* Dégradé + voile sombre */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-950/70 via-slate-950/40 to-slate-900/10" />

        {/* Contenu */}
        <div className="relative z-10  mx-auto flex h-full max-w-6xl items-center px-4 py-12 md:px-6">
          <div className="flex w-full flex-col gap-10 md:flex-row md:items-start md:justify-between">
            {/* Colonne gauche : intro */}
            <div className="max-w-md space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-sky-100 ring-1 ring-sky-400/40 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-300" />
                Formations BAFA en AURA
              </div>

              <div className="space-y-3">
                <h1 className="font-display text-3xl md:text-4xl font-semibold leading-tight text-white">
                  <Image
                    src="/bafa.png"
                    alt="BAFA Murathènes"
                    width={530}
                    height={120}
                    className="w-[230px] md:w-[320px] h-auto"
                  />
                  <span className="sr-only">BAFA Murathènes</span>
                </h1>

                <p className="text-sm md:text-base text-slate-100/90">
                  Formations BAFA dans le Cantal au domaine de Gravières
                </p>
              </div>

              <div className="mt-4 flex flex-col w-1/2  flex-wrap gap-3 text-xs text-slate-100/80">
                <div className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 ring-1 ring-white/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Education populaire</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 ring-1 ring-white/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  <span>Vie en collectivité</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 ring-1 ring-white/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                  <span>Pedagogie émancipatrice</span>
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

              <div className="mt-6">
                {heroFormations.length === 0 && (
                  <article className="rounded-xl bg-black/55 px-4 py-3 backdrop-blur-md ring-1 ring-white/10">
                    <p className="text-xs text-slate-100/85">
                      Le calendrier des formations sera mis en ligne très
                      prochainement. Tu peux déjà jeter un œil aux infos
                      générales plus bas.
                    </p>
                  </article>
                )}

                {heroFormations.length > 0 && (
                  <div className="space-y-4">
                    {heroFormations.map((f, index) => {
                      const isFG = f.type === "formation_generale";
                      const badgeColor = isFG
                        ? "text-sky-200"
                        : "text-amber-200";

                      // Tous les boutons = style jaune (comme le 2e) + pointer
                      const buttonClasses =
                        "shrink-0 rounded-md border border-amber-300/80 bg-amber-400/90 px-4 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-amber-300 cursor-pointer hover:cursor-pointer";

                      const rawDescription = f.description ?? "";
                      const firstLine =
                        typeof rawDescription === "string"
                          ? rawDescription
                              .split("\n")
                              .map((line) => line.trim())
                              .find((line) => line.length > 0) ?? ""
                          : "";
                      const isAprilPromo = isAprilFgPromoFormation(f);
                      const displayedPrice = getDisplayedFormationPrice(f);
                      const referencePrice = getReferenceFormationPrice(f);

                      const isLast = index === heroFormations.length - 1;
                      const isSecond = index === 1;

                      return (
                        <Link
                          key={f.id}
                          href={`/formations/${f.id}`}
                          className="block group"
                        >
                          <div className="flex gap-4">
                            {/* Colonne timeline */}
                            <div className="relative flex flex-col items-center pt-1">
                              {!isLast && (
                                <div className="timeline-line absolute top-5 bottom-[-18px] w-[2px] bg-gradient-to-b from-sky-300/80 via-sky-200/60 to-sky-100/20" />
                              )}

                              {isSecond && (
                                <div className="timeline-segment absolute top-5 h-24 w-[2px] rounded-full bg-gradient-to-b from-sky-300/90 via-sky-200/70 to-transparent" />
                              )}

                              <span className="timeline-dot-wrapper relative z-10 flex h-5 w-5 items-center justify-center rounded-full bg-sky-400 shadow-[0_0_0_3px_rgba(15,23,42,0.85)] ring-2 ring-sky-200">
                                <span className="timeline-dot h-2.5 w-2.5 rounded-full bg-white" />
                              </span>
                            </div>

                            {/* Carte session */}
                            <article className="flex-1 rounded-xl bg-black/55 px-4 py-3 backdrop-blur-md ring-1 ring-white/10 transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:bg-black/70 hover:shadow-xl">
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
                                <button
                                  className={buttonClasses}
                                  type="button"
                                  
                                >
                                  Voir les détails
                                </button>
                              </header>

                              <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px]">
                                {isAprilPromo && (
                                  <span className="rounded-full bg-rose-400/90 px-2 py-1 font-semibold uppercase tracking-wide text-slate-950">
                                    Dernieres places
                                  </span>
                                )}
                                <span className="rounded-full bg-white/90 px-2.5 py-1 font-semibold text-slate-900">
                                  {referencePrice && (
                                    <span className="mr-1 text-slate-500 line-through">
                                      {referencePrice} €
                                    </span>
                                  )}
                                  {displayedPrice} €
                                </span>
                              </div>

                              <p className="text-xs text-slate-100/85">
                                <span className="font-medium">
                                  {formatDateRangeFr(f.startDate, f.endDate)}
                                </span>
                                <br />
                                {firstLine ||
                                  "Une formation BAFA centrée sur la pratique et la vie de colo."}
                              </p>
                              {isAprilPromo && (
                                <p className="mt-2 text-[11px] font-medium text-rose-100">
                                  Aides + paiement en plusieurs fois: contacte-nous pour
                                  un plan de financement rapide.
                                </p>
                              )}
                            </article>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1 : Présentation BAFA – reprise de la DA « infos pratiques » */}
      <section className="border-t border-slate-200 bg-rose-50/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-700">
              Session FG avril 2026
            </p>
            <h2 className="font-display text-xl font-semibold text-slate-900">
              Dernieres places: 500 € au lieu de {APRIL_FG_PROMO.regularPrice} €
            </h2>
            <p className="text-sm text-slate-700">
              Aides possibles + paiement en plusieurs fois. Contacte-nous et on
              te guide rapidement sur le financement.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={aprilPromoHref}
              className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-sm transition hover:bg-rose-500 hover:cursor-pointer"
            >
              Voir la FG avril
              <span className="text-sm">-&gt;</span>
            </Link>
            <button
              type="button"
              onClick={openContactWidget}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-sm transition hover:bg-slate-800 hover:cursor-pointer"
            >
              Nous contacter pour les aides
            </button>
          </div>
        </div>
      </section>

      <section id="programme" className="relative border-t border-slate-200   ">
        <div className="pointer-events-none absolute -top-6 left-0 right-0 bg-[radial-gradient(ellipse_at_top,_rgba(15,23,42,0.12),_transparent)]" />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row md:items-start md:justify-between md:px-6">
          <div className="max-w-xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Le BAFA avec Murathènes
            </p>
            <h2 className="font-display text-xl md:text-2xl font-semibold text-slate-900">
              Le BAFA dans un environnement incroyable et une pédagogie
              émancipatrice
            </h2>
            <p className="text-base text-slate-700">
              Murathènes, défend des principes d&apos;éducation populaire à
              travers l&apos;utilisation de{" "}
              <span className="font-semibold">
                pédagogies actives et émancipatrices
              </span>
              . Animations, grands jeux, veillées, débats, chaque module et
              chaque temps de la formation est réfléchi pour qu&apos;il{" "}
              <span className="font-semibold">
                favorise l&apos;apprentissage
              </span>
              . Nous proposons tout au long de l&apos;année des{" "}
              <span className="font-semibold">formations générales</span> et des{" "}
              <span className="font-semibold">
                approfondissements &quot;échanges de jeunes et séjours à
                l&apos;étranger&quot;
              </span>
              .
            </p>

            <div className="flex flex-wrap gap-3 text-sm text-slate-700">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 shadow-sm ring-1 ring-emerald-100">
                <span className="text-base">🤝</span>
                Approche bienveillante
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 shadow-sm ring-1 ring-sky-100">
                <span className="text-base">🌈</span>
                Cohésion de groupe et entraide
              </span>
            </div>

            <div className="pt-2">
              <Link
                href="/bafa"
                className="group relative inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold uppercase tracking-wide text-sky-900 hover:text-sky-700"
              >
                En savoir plus sur le BAFA
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Cartes pédagogie dans la même DA que "infos pratiques" */}
          <div className="grid w-full max-w-md gap-4 text-sm text-slate-700 md:text-sm">
            <div className="group relative overflow-hidden rounded-2xl border border-sky-100 bg-white/90 px-4 py-4 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:border-sky-300 hover:shadow-md">
              <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-sky-100/80" />
              <div className="relative flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-lg">
                  <span className="translate-y-[1px] text-white">🎲</span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700">
                    Pédagogie active
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    On apprend en faisant, et en experimentant.
                  </p>
                  <p className="mt-1 text-xs text-slate-700">
                    Jeux de rôles, mises en situation, analyses de pratiques,
                    supports vidéos et audio, débats, animations seront au
                    programme de ton stage.
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white/90 px-4 py-4 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md">
              <div className="absolute -right-5 -top-5 h-16 w-16 rounded-full bg-emerald-100/80" />
              <div className="relative flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-lg">
                  <span className="translate-y-[1px] text-white">🛟</span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                    Un contenu diversifié
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    Des bases de l&apos;animation jusqu&apos;aux problématiques
                    individuelles de chaque enfant
                  </p>
                  <p className="mt-1 text-xs text-slate-700">
                    Animation, vie quotidienne, mais également lutte contre les
                    violences sexistes et sexuelles, maltraitance, handicap,
                    responsabilité civile et pénal, discrimination,
                    réglementation et bien d&apos;autres sujets seront au programme
                    de ta semaine.
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-amber-100 bg-white/90 px-4 py-4 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:border-amber-300 hover:shadow-md">
              <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-amber-100/80" />
              <div className="relative flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-lg">
                  <span className="translate-y-[1px] text-slate-900">🏕️</span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                    Vie collective
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    Au delà de la formation, la vie en collectivité !
                  </p>
                  <p className="mt-1 text-xs text-slate-700">
                    Veillées, vie quotidienne en groupe, ta formation en
                    internat te permet de vivre ce que tu vivras ensuite avec le
                    public. Mais également des rencontres et un cadre favorisant
                    l&apos;apprentissage
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 : Calendrier dynamique – version pastel */}
      <section
        id="timeline"
        className="relative border-t border-slate-200  "
      >
        <div className="pointer-events-none absolute -top-6 left-0 right-0 bg-[radial-gradient(ellipse_at_top,_rgba(15,23,42,0.10),_transparent)]" />

        <div className="relative mx-auto max-w-6xl px-4 py-10 md:px-6">
          {/* HEADER */}
          <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 whitespace-nowrap">
                Calendrier {calendarYearLabel || "des formations"}
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-slate-900">
                Les prochaines sessions en un coup d&apos;œil
              </h2>
              <p className="mt-1 max-w-xl text-base text-slate-700">
                Un aperçu rapide des prochaines dates. Pour tous les détails
                (programme, lieu, transport), tu peux ouvrir chaque formation ou
                consulter le calendrier complet.
              </p>
            </div>

            <Link
              href="/formations"
              className="mt-2 inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-50 shadow-sm transition hover:bg-slate-800 hover:cursor-pointer"
            >
              Voir le calendrier complet
              <span className="text-sm">→</span>
            </Link>
          </header>

          {calendarFormations.length === 0 ? (
            <p className="text-sm text-slate-600">
              Les prochaines dates seront affichées ici dès qu&apos;elles sont
              confirmées.
            </p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {calendarFormations.map((f) => {
                const isFG = f.type === "formation_generale";

                const typeShort = isFG
                  ? "Formation générale"
                  : "Approfondissement";
                const typePillClasses = isFG
                  ? "bg-sky-50 text-sky-800 border border-slate-200"
                  : "bg-amber-50 text-amber-900 border border-amber-200";

                const icon = isFG ? "🎲" : "🌍";

                const cardHoverClasses = isFG
                  ? "hover:bg-sky-50 hover:ring-sky-200"
                  : "hover:bg-amber-50 hover:ring-amber-200";

                const rawDescription = f.description ?? "";
                const firstLine =
                  typeof rawDescription === "string"
                    ? rawDescription
                        .split("\n")
                        .map((line) => line.trim())
                        .find((line) => line.length > 0) ?? ""
                    : "";
                const isAprilPromo = isAprilFgPromoFormation(f);
                const displayedPrice = getDisplayedFormationPrice(f);
                const referencePrice = getReferenceFormationPrice(f);

                return (
                  <Link
                    key={f.id}
                    href={`/formations/${f.id}`}
                    className="group"
                  >
                    <article
                      className={[
                        "flex h-full flex-col justify-between rounded-2xl bg-white/95 p-4 text-sm shadow-[0_8px_18px_rgba(15,23,42,0.04)]",
                        "ring-1 ring-slate-100 transition-transform transition-shadow transition-colors duration-200",
                        "hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(15,23,42,0.10)]",
                        cardHoverClasses,
                      ].join(" ")}
                    >
                      {/* En-tête : icône + type + mois + titre + prix */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5">
                          {/* Icône + pill type */}
                          <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50">
                              <span className="text-xl">{icon}</span>
                            </div>

                            <span
                              className={[
                                "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]",
                                typePillClasses,
                              ].join(" ")}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                              {typeShort}
                            </span>
                          </div>

                          {/* Mois + titre */}
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            {getMonthYearLabelFr(f.startDate)}
                          </p>
                          <h3 className="font-display text-sm md:text-base font-semibold text-slate-900">
                            {typeLongLabel[f.type] ?? f.type}
                          </h3>
                        </div>

                        {/* Prix en pill à droite */}
                        <div className="flex flex-col items-end gap-1 text-xs">
                          {isAprilPromo && (
                            <span className="rounded-full bg-rose-100 px-2 py-1 font-semibold uppercase tracking-wide text-rose-700">
                              Dernieres places
                            </span>
                          )}
                          <span className="rounded-full bg-sky-600 px-3 py-1 font-semibold text-white shadow-sm whitespace-nowrap">
                            {referencePrice && (
                              <span className="mr-1 text-sky-100 line-through">
                                {referencePrice} €
                              </span>
                            )}
                            {displayedPrice} €
                          </span>
                        </div>
                      </div>

                      {/* Dates bien visibles */}
                      <p className="mt-3 text-sm font-medium text-slate-800">
                        📅 {formatDateRangeFr(f.startDate, f.endDate)}
                      </p>

                      {/* Début du vrai texte de la formation */}
                      <p className="mt-1 text-sm text-slate-600">
                        {firstLine ||
                          "La description détaillée de cette formation arrive bientôt."}
                      </p>

                      {/* Lien “voir les détails” */}
                      {isAprilPromo && (
                        <p className="mt-2 text-xs font-medium text-rose-700">
                          Aides + paiement en plusieurs fois: contacte-nous,
                          on te repond vite.
                        </p>
                      )}
                      <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-sky-400 group-hover:bg-sky-500" />
                          <span className="font-medium">
                            Voir le détail de la session
                          </span>
                        </span>
                        <span className="text-base transition-transform group-hover:translate-x-1">
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

      {/* SECTION 3 : Infos pratiques */}
      <section
        id="infos"
        className="relative border-t border-slate-200"
      >
        <div className="pointer-events-none absolute -top-6 left-0 right-0 bg-[radial-gradient(ellipse_at_top,_rgba(15,23,42,0.12),_transparent)]" />

        <div className="relative mx-auto max-w-6xl px-4 py-10 md:px-6">
          <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-stretch md:justify-between">
            {/* Colonne gauche : texte */}
            <div className="max-w-xl space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Infos pratiques
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-slate-900">
                Une formation accessible pour tous et toutes
              </h2>
              <p className="text-base text-slate-700">
                Nos formations se déroulent dans le Cantal{" "}
                <span className="font-semibold">au domaine de Gravières</span> ,
                ce qui a beaucoup d&apos;avantages, mais demande un peu
                d&apos;organisation. Pour plus de facilité , nous proposons{" "}
                <span className="font-medium text-slate-900">
                  un transport organisé
                </span>
                . Sur place, l&apos;hébergement et la restauration sont pensés
                pour te mettre dans les meilleures conditions
                d&apos;apprentissage.
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
                  Chambres tout confort
                </span>
              </div>

              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-700">
                  Frein budget ? On t&apos;aide
                </p>
                <p className="mt-1 text-sm text-slate-800">
                  Aides CAF/locales + paiement en plusieurs fois possible.
                  Contacte-nous et on regarde ta situation avec toi.
                </p>
                <button
                  type="button"
                  onClick={openContactWidget}
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-sm transition hover:bg-rose-500 hover:cursor-pointer"
                >
                  Nous contacter pour le financement
                  <span className="text-sm">-&gt;</span>
                </button>
              </div>

              <div className="pt-4">
                <Link
                  href="/infos-pratiques"
                  className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-900 shadow-sm transition hover:bg-amber-400"
                >
                  Voir les modalités d&apos;inscription
                  <span className="text-sm">→</span>
                </Link>
              </div>
            </div>

            {/* Colonne droite : photo plein pot */}
            {/* Colonne droite : photo plein pot */}
            <div className="relative w-full max-w-md md:flex-1">
              <div className="relative h-72 md:h-96 lg:h-[26rem] w-full overflow-hidden  ring-1 ring-slate-100">
                <Image
                  src="/fanion.jpg"
                  alt="Vie de colo au Domaine de Gravières"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 440px, (min-width: 768px) 360px, 100vw"
                  priority={false}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
