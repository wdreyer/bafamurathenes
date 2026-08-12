﻿"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  MessageSquareText,
  PhoneCall,
  PlayCircle,
} from "lucide-react";
import type { Formation } from "@/lib/types";
import { getDisplayedFormationPrice, getReferenceFormationPrice, MIN_PRICE_AFTER_AIDS } from "@/lib/offers";
import { getFormationPublicHref } from "@/lib/formationSlugs";
import { AidesLeadSection } from "@/components/AidesLeadForm";

const INK = "#1a1530";
const PAPER = "#fff8ec";
const CREAM = "#fefcf5";
const VIOLET = "#792BB9";
const VIOLET_SOFT = "#f0e8f8";
const YELLOW = "#F5EF72";
const PHONE_DISPLAY = "01 84 21 05 48";
const PHONE_TEL = "0184210548";

const MONTHS_FR = [
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

type HomeSession = {
  id: string;
  href: string;
  type: Formation["type"];
  title: string;
  startDate: string;
  endDate: string;
  price: number;
  referencePrice?: number | null;
};

const FALLBACK_SESSIONS: HomeSession[] = [
  {
    id: "fg-toussaint-2026",
    href: "/formations",
    type: "formation_generale",
    title: "Formation Générale Toussaint",
    startDate: "2026-10-17",
    endDate: "2026-10-25",
    price: 550,
  },
  {
    id: "appro-toussaint-2026",
    href: "/formations",
    type: "approfondissement_sejour_etranger",
    title: "Approfondissement Toussaint",
    startDate: "2026-10-19",
    endDate: "2026-10-25",
    price: 450,
  },
];

const TESTIMONIALS = [
  {
    name: "Jade",
    role: "Bilan · FG avril 2026",
    photo: "/optimized/FGAVRIL2026/IMG_8293.webp",
    quote: `Je mets un solide 10/10 à cette expérience. Je ne retiens de la formation que du positif car c'était bien de rencontrer de potentiels futur.e.s collègues dans l'animation. L'équipe encadrante a été géniale et le séjour n'aurait clairement pas été le même sans un seul de ces éléments, alors merci à tout le monde et big up à Zouzou le Zèbre. 
- Jade. :)`,
  },
  {
    name: "Stagiaire",
    role: "Bilan · FG avril 2026",
    photo: "/optimized/FGAVRIL2026/IMG_8451.webp",
    quote:
      "C'était vraiment super, limite incroyable, donc je recommande à tout le monde de passer son BAFA avec Lorette, William et Martin à Murathènes !!!",
  },
  {
    name: "Stagiaire",
    role: "Bilan · FG avril 2026",
    photo: "/optimized/FGAVRIL2026/PXL_20260413_135152634.webp",
    quote:
      "La formation a était vraiment super grace au formateur qui ont su faire preuves d’une trés grand bienveillance.",
  },
];

const PEDAGOGY = [
  {
    num: "01",
    title: "On apprend en faisant.",
    text: "Jeux de rôles, mises en situation, analyses de pratiques, débats, animations. Pas de cours magistraux — le terrain dès le premier jour.",
    image: "/optimized/FGAVRIL2026/IMG_8307.webp",
  },
  {
    num: "02",
    title: "Un contenu complet.",
    text: "Animation, vie quotidienne, mais aussi violences sexistes, handicap, neuroatypie, discrimination, responsabilité civile et pénale, réglementation — des bases jusqu'aux problématiques individuelles.",
    image: "/optimized/FGAVRIL2026/PXL_20260413_095337635.MP.webp",
  },
  {
    num: "03",
    title: "Vie en collectivité 24/7.",
    text: "Veillées, dortoirs, repas partagés — ta formation en internat te prépare à vivre ce que tu vivras ensuite avec ton public.",
    image: "/optimized/FGAVRIL2026/PXL_20260411_155613137.webp",
  },
  {
    num: "04",
    title: "Au cœur du Cantal.",
    text: "Domaine de Gravières, Lanobre. Forêts, lac, immersion totale — loin de tout sauf de l'essentiel.",
    image: "/optimized/FGAVRIL2026/IMG_8212.webp",
  },
];

const normalizeDate = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate?: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString().slice(0, 10);
  }
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
};

const parseDateSafe = (value: string | undefined | null): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatRange = (start?: string, end?: string): string => {
  const s = parseDateSafe(start ?? "");
  const e = parseDateSafe(end ?? "");
  if (!s || !e) return "";

  const ds = String(s.getDate()).padStart(2, "0");
  const de = String(e.getDate()).padStart(2, "0");

  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${ds}–${de} ${MONTHS_FR[s.getMonth()]} ${s.getFullYear()}`;
  }
  if (s.getFullYear() === e.getFullYear()) {
    return `${ds} ${MONTHS_FR[s.getMonth()]} – ${de} ${MONTHS_FR[e.getMonth()]} ${s.getFullYear()}`;
  }
  return `${ds} ${MONTHS_FR[s.getMonth()]} ${s.getFullYear()} – ${de} ${MONTHS_FR[e.getMonth()]} ${e.getFullYear()}`;
};

const isFg = (session: Pick<HomeSession, "type">) => session.type === "formation_generale";

const sessionLabel = (session: Pick<HomeSession, "type" | "title">) =>
  isFg(session)
    ? "Formation Générale"
    : "Étape 3 · Approfondissement séjour à l'étranger";

const sessionTag = (session: Pick<HomeSession, "type">) => (isFg(session) ? "FG" : "ÉTAPE 3");
const sessionStep = (session: Pick<HomeSession, "type">) => (isFg(session) ? "ÉTAPE 1" : "APPROFONDISSEMENT");

const openContact = (mode: "message" | "callback" = "callback") => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("contact-widget:open", { detail: { mode } }));
  }
};

export default function HomePage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [showHeroVideo, setShowHeroVideo] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    const loadFormations = async () => {
      const [{ db }, firestore] = await Promise.all([
        import("@/lib/firebase"),
        import("firebase/firestore"),
      ]);
      if (cancelled) return;

      const q = firestore.query(firestore.collection(db, "formations"), firestore.orderBy("startDate", "asc"));
      unsubscribe = firestore.onSnapshot(q, (snap) => {
        setFormations(
          snap.docs.map((doc) => {
            const data = doc.data() as Omit<Formation, "id" | "startDate" | "endDate"> & {
              startDate?: unknown;
              endDate?: unknown;
            };
            return {
              id: doc.id,
              ...data,
              startDate: normalizeDate(data.startDate),
              endDate: normalizeDate(data.endDate),
            } as Formation;
          }),
        );
      });
    };

    loadFormations();
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!media.matches || reducedMotion.matches) return;

    const timeout = window.setTimeout(() => setShowHeroVideo(true), 2600);
    return () => window.clearTimeout(timeout);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = formations
    .map((formation) => ({ ...formation, _d: parseDateSafe(formation.startDate) }))
    .filter((formation) => formation._d && formation._d >= today)
    .sort((a, b) => (a._d?.getTime() ?? 0) - (b._d?.getTime() ?? 0));

  const sessions: HomeSession[] = upcoming.slice(0, 4).map((formation) => ({
    id: formation.id,
    href: getFormationPublicHref(formation),
    type: formation.type,
    title: formation.title,
    startDate: formation.startDate,
    endDate: formation.endDate,
    price: getDisplayedFormationPrice(formation),
    referencePrice: getReferenceFormationPrice(formation),
  }));

  const displaySessions = sessions.length > 0 ? sessions : FALLBACK_SESSIONS;
  const heroSessions = displaySessions.slice(0, 2);
  const nextDate = parseDateSafe(displaySessions[0]?.startDate ?? "");
  const nextMonth = nextDate ? MONTHS_FR[nextDate.getMonth()] : "";

  return (
    <div className="mura-page" style={{ color: INK, background: CREAM }}>
      <section style={{ position: "relative", minHeight: "86svh", overflow: "hidden", background: INK }}>
        <Image
          src="/optimized/FGAVRIL2026/home-hero-poster.webp"
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover"
          aria-hidden="true"
        />
        {showHeroVideo && (
          <video
            src="/optimized/videos/home-hero.mp4"
            poster="/optimized/FGAVRIL2026/home-hero-poster.webp"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(26,21,48,.58) 0%, rgba(26,21,48,.34) 50%, rgba(26,21,48,.12) 100%), linear-gradient(180deg, rgba(26,21,48,.05) 0%, rgba(26,21,48,.48) 100%)",
          }}
        />

        <div
          className="grid grid-cols-1 gap-8 px-6 py-24 md:px-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:py-32"
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1280,
            minHeight: "86svh",
            margin: "0 auto",
            alignItems: "center",
          }}
        >
          <div style={{ width: "100%", maxWidth: 720, minWidth: 0, color: CREAM }}>
            <div
              className="mura-mono"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                width: "fit-content",
                marginBottom: 18,
                padding: "8px 14px",
                borderRadius: 999,
                background: YELLOW,
                color: INK,
                fontSize: 11,
                fontWeight: 800,
                textTransform: "uppercase",
              }}
            >
              <PlayCircle size={15} strokeWidth={2.4} />
              Formations BAFA en AURA · 2026
            </div>

            <div className="hand" style={{ fontSize: 32, color: YELLOW, marginBottom: -4 }}>
              passez votre
            </div>
            <h1
              className="text-[64px] md:text-[112px]"
              style={{
                margin: 0,
                maxWidth: 760,
                color: CREAM,
                fontWeight: 800,
                lineHeight: 0.9,
                letterSpacing: 0,
              }}
            >
              BAFA <span className="ed block md:inline" style={{ color: YELLOW, fontStyle: "italic", fontWeight: 650 }}>cet automne.</span>
            </h1>

            <p style={{ margin: "22px 0 0", maxWidth: 560, color: CREAM, fontSize: 18, lineHeight: 1.55, overflowWrap: "break-word" }}>
              Formations BAFA dans le Cantal au domaine de Gravières.
            </p>

            <figure
              className="home-hero-manifesto"
              style={{
                margin: "26px 0 0",
                maxWidth: 640,
                color: CREAM,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto minmax(0, 1fr)",
                  gap: 14,
                  alignItems: "start",
                }}
              >
                <span
                  className="ed"
                  aria-hidden="true"
                  style={{
                    color: YELLOW,
                    fontSize: 76,
                    fontStyle: "italic",
                    fontWeight: 600,
                    lineHeight: 0.72,
                  }}
                >
                  &ldquo;
                </span>
                <div style={{ borderLeft: `3px solid ${YELLOW}`, paddingLeft: 16 }}>
                  <figcaption
                    className="mura-mono"
                    style={{
                      marginBottom: 8,
                      color: YELLOW,
                      fontSize: 10,
                      fontWeight: 850,
                      letterSpacing: 2.2,
                      textTransform: "uppercase",
                    }}
                  >
                    Manifeste Murathènes
                  </figcaption>
                  <blockquote style={{ margin: 0 }}>
                    <p
                      className="ed"
                      style={{
                        margin: 0,
                        color: CREAM,
                        fontSize: 21,
                        fontStyle: "italic",
                        fontWeight: 650,
                        lineHeight: 1.28,
                      }}
                    >
                      Créer des espaces de joie et de paix où chaque jeune existe, compte et est valorisé.
                    </p>
                  </blockquote>
                </div>
              </div>
            </figure>

            <div className="home-hero-actions" style={{ marginTop: 28 }}>
              <Link href="/formations" className="mura-pill mura-cta-secondary">
                <CalendarDays size={17} strokeWidth={2.5} />
                Voir les formations
              </Link>
              <button
                type="button"
                onClick={() => openContact("message")}
                className="mura-pill"
                style={{ background: CREAM, color: INK, cursor: "pointer" }}
              >
                <MessageSquareText size={17} strokeWidth={2.5} />
                Remplir le formulaire
              </button>
              <a
                href={`tel:${PHONE_TEL}`}
                className="mura-pill"
                style={{ background: YELLOW, color: INK, cursor: "pointer" }}
                aria-label={`Appeler Murathènes au ${PHONE_DISPLAY}`}
              >
                <PhoneCall size={17} strokeWidth={2.5} />
                {PHONE_DISPLAY}
              </a>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 24 }}>
              {["Éducation populaire", "Vie en collectivité", "Pédagogie émancipatrice"].map((tag) => (
                <span
                  key={tag}
                  style={{
                    border: `1.5px solid ${CREAM}`,
                    borderRadius: 999,
                    padding: "7px 14px",
                    background: "rgba(255,255,255,.08)",
                    color: CREAM,
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <aside
            className="home-hero-sessions"
            style={{
              width: "100%",
              maxWidth: "100%",
              minWidth: 0,
              boxSizing: "border-box",
              border: `2px solid ${INK}`,
              borderRadius: 18,
              background: PAPER,
              color: INK,
              boxShadow: `8px 8px 0 ${YELLOW}`,
              overflow: "hidden",
            }}
          >
            <div
              style={{ padding: "20px 20px 16px", borderBottom: `2px solid ${INK}` }}
            >
              <h2 className="ed" style={{ margin: "6px 0 0", fontSize: 28, fontWeight: 700, fontStyle: "italic", lineHeight: 1 }}>
                Prochaines formations
              </h2>
            </div>

            <div style={{ display: "grid" }}>
              {heroSessions.map((session, index) => (
                <Link
                  key={session.id}
                  href={session.href}
                  className="home-hero-session-link"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr)",
                    gap: 12,
                    padding: "16px 20px",
                    color: INK,
                    textDecoration: "none",
                    borderBottom: index < heroSessions.length - 1 ? `1.5px dashed ${INK}55` : undefined,
                  }}
                >
                  <div>
                    <span
                      className="mura-mono"
                      style={{
                        display: "inline-flex",
                        marginBottom: 8,
                        borderRadius: 999,
                        padding: "4px 9px",
                        background: isFg(session) ? VIOLET : INK,
                        color: CREAM,
                        fontSize: 10,
                        fontWeight: 800,
                      }}
                    >
                      {sessionTag(session)}
                    </span>
                    <span
                      className="mura-mono"
                      style={{
                        display: "inline-flex",
                        marginLeft: 6,
                        borderRadius: 999,
                        padding: "4px 9px",
                        background: isFg(session) ? "#f0e8f8" : "#F5EF72",
                        color: "#1a1530",
                        fontSize: 10,
                        fontWeight: 800,
                      }}
                    >
                      {sessionStep(session)}
                    </span>
                    <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.05 }}>{formatRange(session.startDate, session.endDate)}</div>
                    <div style={{ marginTop: 5, fontSize: 13, opacity: 0.72 }}>{sessionLabel(session)}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      {session.referencePrice && (
                        <div style={{ marginBottom: 2, fontSize: 11, opacity: 0.5, textDecoration: "line-through" }}>
                          {session.referencePrice} €
                        </div>
                      )}
                      <div style={{ fontSize: 20, fontWeight: 800 }}>dès {MIN_PRICE_AFTER_AIDS} €</div>
                      <div className="mura-mono" style={{ fontSize: 9, opacity: 0.55, marginTop: 1 }}>tarif plein : {session.price} €</div>
                    </div>
                    <ArrowRight size={18} strokeWidth={2.5} style={{ flex: "0 0 auto" }} />
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section style={{ background: INK, padding: "70px 24px", borderBottom: `2px solid ${INK}` }} className="md:px-12">
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ marginBottom: 34 }}>
            <h2
              className="home-testimonials-title"
              style={{
                margin: 0,
                color: CREAM,
                fontSize: "clamp(22px, 6vw, 54px)",
                fontWeight: 850,
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              <span className="ed" style={{ fontStyle: "italic" }}>Ils &amp; elles</span>{" "}
              <span style={{ color: YELLOW }}>l&apos;ont fait</span>{" "}
              <span className="hand" style={{ fontWeight: 600 }}>avant vous.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 22 }}>
            {TESTIMONIALS.map((testimonial) => (
              <article
                key={`${testimonial.name}-${testimonial.photo}`}
                className="home-testimonial-card mura-interactive-card"
                style={{
                  overflow: "hidden",
                  border: `2px solid ${INK}`,
                  borderRadius: 18,
                  background: PAPER,
                  color: INK,
                  boxShadow: `5px 5px 0 ${YELLOW}`,
                }}
              >
                <div style={{ position: "relative", width: "100%", aspectRatio: "4/3" }}>
                  <Image src={testimonial.photo} alt={testimonial.role} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                </div>
                <div style={{ padding: 20 }}>
                  <p className="ed" style={{ margin: "0 0 18px", fontSize: 17, fontStyle: "italic", lineHeight: 1.5, whiteSpace: "pre-line" }}>
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div style={{ borderTop: `1.5px dashed ${INK}66`, paddingTop: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{testimonial.name}</div>
                    <div className="mura-mono" style={{ marginTop: 3, fontSize: 10, color: VIOLET, fontWeight: 800, textTransform: "uppercase" }}>
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: CREAM, padding: "64px 24px 76px", borderBottom: `2px solid ${INK}` }} className="md:px-12">
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 22, marginBottom: 34 }} className="lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <div className="mura-mono" style={{ color: VIOLET, fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>
                Calendrier 2026
              </div>
              <h2 className="home-title-mixed" style={{ margin: "10px 0 0", color: INK }}>
                <span className="ed" style={{ fontStyle: "italic", color: VIOLET }}>Les prochaines dates,</span>{" "}
                <span className="hand" style={{ color: INK }}>en un coup d&apos;oeil.</span>
              </h2>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <button
                type="button"
                onClick={() => openContact("message")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  border: `2px solid ${INK}`,
                  borderRadius: 999,
                  background: PAPER,
                  color: INK,
                  padding: "13px 18px",
                  fontSize: 12,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                <MessageSquareText size={16} />
                Formulaire
              </button>
              <a
                href={`tel:${PHONE_TEL}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  border: `2px solid ${INK}`,
                  borderRadius: 999,
                  background: VIOLET,
                  color: CREAM,
                  padding: "13px 18px",
                  fontSize: 12,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  textDecoration: "none",
                }}
                aria-label={`Appeler Murathènes au ${PHONE_DISPLAY}`}
              >
                <PhoneCall size={16} />
                {PHONE_DISPLAY}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 18 }}>
            {displaySessions.map((session, index) => {
              const featured = index === 0;
              return (
                <Link key={session.id} href={session.href} style={{ textDecoration: "none", color: "inherit" }}>
                  <article
                    className="home-session-card mura-interactive-card"
                    style={{
                      minHeight: 190,
                      display: "grid",
                      gridTemplateColumns: "minmax(0,1fr) auto",
                      gap: 18,
                      alignItems: "center",
                      border: `2px solid ${INK}`,
                      borderRadius: 18,
                      background: featured ? VIOLET : PAPER,
                      color: featured ? CREAM : INK,
                      padding: "24px 22px",
                      boxShadow: featured ? `6px 6px 0 ${YELLOW}` : `5px 5px 0 ${INK}`,
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                        <span
                          className="mura-mono"
                          style={{
                            borderRadius: 999,
                            padding: "5px 12px",
                            background: featured ? YELLOW : isFg(session) ? VIOLET : INK,
                            color: featured ? INK : CREAM,
                            fontSize: 10,
                            fontWeight: 800,
                          }}
                        >
                          {sessionTag(session)}
                        </span>
                        <span
                          className="mura-mono"
                          style={{
                            borderRadius: 999,
                            padding: "5px 12px",
                            background: featured ? "rgba(26,21,48,0.15)" : isFg(session) ? "#f0e8f8" : "#F5EF72",
                            color: featured ? "#fefcf5" : "#1a1530",
                            fontSize: 10,
                            fontWeight: 800,
                          }}
                        >
                          {sessionStep(session)}
                        </span>
                        {featured && (
                          <span
                            className="mura-mono"
                            style={{
                              borderRadius: 999,
                              padding: "5px 12px",
                              background: CREAM,
                              color: INK,
                              fontSize: 10,
                              fontWeight: 800,
                            }}
                          >
                            Prochaine session
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 32, fontWeight: 850, lineHeight: 1.05 }}>{formatRange(session.startDate, session.endDate)}</div>
                      <h3 className="ed" style={{ margin: "8px 0 0", fontSize: 20, fontWeight: 650, fontStyle: "italic", lineHeight: 1.2 }}>
                        {sessionLabel(session)}
                      </h3>
                      {!isFg(session) && (
                        <p className="mura-mono" style={{ margin: "6px 0 0", fontSize: 10, color: featured ? "rgba(254,252,245,0.7)" : "#1a1530", opacity: 0.7, letterSpacing: 1.5 }}>
                          ÉTAPE 3 DU BAFA
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {session.referencePrice && (
                        <div style={{ marginBottom: 2, fontSize: 12, opacity: 0.5, textDecoration: "line-through" }}>
                          {session.referencePrice} €
                        </div>
                      )}
                      <div style={{ fontSize: 30, fontWeight: 850, lineHeight: 1 }}>dès {MIN_PRICE_AFTER_AIDS} €</div>
                      <div className="mura-mono" style={{ fontSize: 10, opacity: 0.55, marginTop: 3 }}>tarif plein : {session.price} €</div>
                      <span
                        data-session-arrow
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginTop: 14,
                          width: 42,
                          height: 42,
                          borderRadius: "50%",
                          background: featured ? YELLOW : INK,
                          color: featured ? INK : CREAM,
                        }}
                        aria-hidden="true"
                      >
                        <ArrowRight size={19} strokeWidth={2.6} />
                      </span>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>

        </div>
      </section>

      <div id="aides-lead-section">
        <AidesLeadSection theme="light" source="Page d'accueil" />
      </div>

      <section style={{ background: PAPER, borderBottom: `1.5px solid ${INK}22`, padding: "30px 24px" }}>
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ maxWidth: 1280, margin: "0 auto", gap: "22px 28px" }}>
          {[
            { num: "100%", label: "encadrement diplômé BAFD / BPJEPS" },
            { num: "Agréé", label: "Jeunesse & Sports · DRAJES Auvergne-Rhône-Alpes" },
            { num: "Cantal", label: "formations au domaine de Gravières" },
            { num: "AURA", label: "sessions en Auvergne-Rhône-Alpes" },
          ].map((item) => (
            <div key={item.label} className="mura-stat-card">
              <div style={{ color: VIOLET, fontSize: 30, fontWeight: 850, lineHeight: 1 }}>{item.num}</div>
              <div className="mura-mono" style={{ marginTop: 6, color: INK, fontSize: 10, lineHeight: 1.45, opacity: 0.7, textTransform: "uppercase" }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: VIOLET_SOFT, padding: "76px 24px", borderBottom: `2px solid ${INK}` }} className="md:px-12">
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ marginBottom: 34 }}>
            <div className="mura-mono" style={{ color: VIOLET, fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>
              Le BAFA avec Murathènes
            </div>
            <h2 className="home-title-mixed home-title-wide" style={{ margin: "10px 0 0", maxWidth: 980, color: INK }}>
              Un environnement <span className="ed" style={{ color: VIOLET, fontStyle: "italic", fontWeight: 650 }}>incroyable</span>{" "}
              <span style={{ color: INK }}>&amp; une pédagogie qui</span>{" "}
              <span className="hand" style={{ color: VIOLET, fontSize: "1.18em" }}>émancipe</span>.
            </h2>
          </div>

          {/* Intro + tags */}
          <div style={{ marginBottom: 40, maxWidth: 780 }}>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: INK, opacity: 0.85, marginBottom: 24, marginTop: 0 }}>
              Murathènes défend des principes d&apos;éducation populaire à travers l&apos;utilisation de pédagogies actives et émancipatrices. Animations, grands jeux, veillées, débats — chaque module est réfléchi pour favoriser l&apos;apprentissage. Nous proposons tout au long de l&apos;année des formations générales et des approfondissements <em>&quot;échanges de jeunes et séjours à l&apos;étranger&quot;</em>.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {["🤝 Approche bienveillante", "🌈 Cohésion de groupe et entraide", "🎲 Pédagogie active"].map((tag) => (
                <span
                  key={tag}
                  style={{ background: CREAM, border: `1.5px solid ${INK}33`, borderRadius: 999, padding: "9px 16px", fontSize: 13, fontWeight: 600, color: INK }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: 18 }}>
            {PEDAGOGY.map((item) => (
              <article
                key={item.num}
                className="home-pedagogy-card mura-interactive-card"
                style={{
                  overflow: "hidden",
                  border: `2px solid ${INK}`,
                  borderRadius: 18,
                  background: CREAM,
                  boxShadow: `4px 4px 0 ${INK}`,
                }}
              >
                <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", borderBottom: `2px solid ${INK}` }}>
                  <Image src={item.image} alt={item.title} fill sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
                </div>
                <div style={{ padding: 20 }}>
                  <div className="ed" style={{ color: VIOLET, fontSize: 34, fontStyle: "italic", lineHeight: 1, marginBottom: 12 }}>
                    {item.num}.
                  </div>
                  <h3 className="ed" style={{ margin: 0, color: INK, fontSize: 21, fontWeight: 700, lineHeight: 1.15 }}>
                    {item.title}
                  </h3>
                  <p style={{ margin: "10px 0 0", color: INK, fontSize: 14, lineHeight: 1.6, opacity: 0.78 }}>{item.text}</p>
                </div>
              </article>
            ))}
          </div>

          <div style={{ marginTop: 30, display: "flex", justifyContent: "center" }}>
            <Link
              href="/bafa"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                border: `2px solid ${INK}`,
                borderRadius: 999,
                background: INK,
                color: CREAM,
                padding: "14px 24px",
                fontSize: 12,
                fontWeight: 800,
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              En savoir plus sur le BAFA
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section style={{ background: YELLOW, padding: "76px 24px", borderBottom: `2px solid ${INK}` }} className="md:px-12">
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div className="hand" style={{ color: INK, fontSize: 30, marginBottom: 4 }}>
            alors,
          </div>
          <h2
            style={{
              margin: 0,
              color: INK,
              fontSize: "clamp(48px, 8vw, 92px)",
              fontWeight: 850,
              lineHeight: 0.95,
              letterSpacing: 0,
            }}
          >
            On se voit {nextMonth ? `en ${nextMonth}` : "bientôt"} ?
          </h2>
          <div style={{ marginTop: 30, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 12 }}>
            <Link
              href="/formations"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                border: `2px solid ${INK}`,
                borderRadius: 999,
                background: INK,
                color: CREAM,
                padding: "15px 24px",
                fontSize: 13,
                fontWeight: 800,
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              Voir le calendrier complet
              <ArrowRight size={16} />
            </Link>
            <button
              type="button"
              onClick={() => openContact("message")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                border: `2px solid ${INK}`,
                borderRadius: 999,
                background: CREAM,
                color: INK,
                padding: "15px 24px",
                fontSize: 13,
                fontWeight: 800,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              <MessageSquareText size={16} />
              Une question ?
            </button>
            <a
              href={`tel:${PHONE_TEL}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                border: `2px solid ${INK}`,
                borderRadius: 999,
                background: VIOLET,
                color: CREAM,
                padding: "15px 24px",
                fontSize: 13,
                fontWeight: 800,
                textTransform: "uppercase",
                cursor: "pointer",
                textDecoration: "none",
              }}
              aria-label={`Appeler Murathènes au ${PHONE_DISPLAY}`}
            >
              <PhoneCall size={16} />
              {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
