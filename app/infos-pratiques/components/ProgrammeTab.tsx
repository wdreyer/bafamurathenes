"use client";

import React, { useMemo, useState } from "react";
import { BlockKey } from "./ProgrammeParts";
import { ProgrammeModal } from "./ProgrammeModal";
import ContenuFG from "./contenuFG";
import ContenuAppro from "./contenuAppro";

const INK = "#1a1530";
const CREAM = "#fefcf5";
const VIOLET = "#792BB9";
const YELLOW = "#F5EF72";

function TrainingCard({
  tone,
  titleTop,
  title,
  duration,
  summary,
  onOpen,
}: {
  tone: BlockKey;
  titleTop: string;
  title: string;
  duration: string;
  summary: string;
  onOpen: () => void;
}) {
  const isFG = tone === "fg";

  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        background: isFG ? VIOLET : YELLOW,
        color: isFG ? CREAM : INK,
        border: `2px solid ${INK}`,
        borderRadius: 24,
        padding: 32,
        boxShadow: isFG ? `6px 6px 0 ${INK}` : `6px 6px 0 ${VIOLET}`,
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      className="hover:-translate-y-1 hover:shadow-xl active:translate-y-0"
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{
          background: isFG ? `${CREAM}22` : `${INK}11`,
          border: `1.5px solid ${isFG ? CREAM + "44" : INK + "22"}`,
          color: isFG ? CREAM : INK,
          padding: "4px 12px",
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.5,
          textTransform: "uppercase",
        }}>
          {titleTop}
        </span>
        <span className="mura-mono" style={{ fontSize: 11, opacity: 0.6, letterSpacing: 1 }}>{duration}</span>
      </div>

      <h3 className="ed" style={{ fontSize: 28, fontWeight: 600, fontStyle: "italic", margin: 0, letterSpacing: -1, lineHeight: 1.1 }}>{title}</h3>

      <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, opacity: 0.85 }}>{summary}</p>

      <div style={{
        marginTop: "auto",
        paddingTop: 16,
        borderTop: `1.5px dashed ${isFG ? CREAM + "44" : INK + "33"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span className="mura-mono" style={{ fontSize: 10, letterSpacing: 1.5, opacity: 0.75, textTransform: "uppercase" }}>Voir le programme</span>
        <span style={{ fontSize: 18 }}>›</span>
      </div>
    </button>
  );
}

export default function ProgrammeTab() {
  const [active, setActive] = useState<BlockKey | null>(null);

  const data = useMemo(() => {
    return {
      fg: {
        tone: "fg" as const,
        titleTop: "BAFA",
        title: "Formation Générale",
        duration: "8 jours",
        summary: "Découvrir les ACM, organiser des activités, assurer la sécurité, gérer la vie quotidienne et préparer ton stage pratique.",
      },
      appro: {
        tone: "appro" as const,
        titleTop: "Étape 3 · Approfondissement",
        title: "Séjours à l'étranger | Echanges de jeunes",
        duration: "6 jours",
        summary: "Encadrer des séjours à l'étranger, gérer les déplacements, animer en contexte interculturel et organiser le quotidien (budget, repas, vie de groupe).",
      },
    };
  }, []);

  const isOpen = active !== null;
  const current = active ? data[active] : null;

  return (
    <>
      <section style={{ borderTop: `1.5px solid ${INK}22`, background: CREAM }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }} className="px-4 py-12 md:px-12 md:py-16">
          <div className="mura-mono" style={{ fontSize: 11, color: VIOLET, letterSpacing: 2.5, fontWeight: 700, marginBottom: 14 }}>📚 PROGRAMME</div>
          <h2 style={{ fontWeight: 700, letterSpacing: -2, lineHeight: 1, margin: 0, marginBottom: 16 }} className="text-[36px] md:text-[56px]">
            8 jours pour comprendre les{" "}
            <span className="ed" style={{ fontStyle: "italic", color: VIOLET }}>rôles & fonctions</span>{" "}
            de l&apos;animateur·rice.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: INK, opacity: 0.8, marginBottom: 40, maxWidth: 640 }}>
            Deux temps de formation : la Formation Générale, puis l&apos;étape 3 · Approfondissement «&nbsp;Échanges de jeunes et séjours à l&apos;étranger&nbsp;». Cliquez pour voir le programme complet.
          </p>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <TrainingCard {...data.fg} onOpen={() => setActive("fg")} />
            <TrainingCard {...data.appro} onOpen={() => setActive("appro")} />
          </div>
        </div>
      </section>

      <ProgrammeModal
        open={isOpen}
        onClose={() => setActive(null)}
        tone={current?.tone ?? "fg"}
        titleTop={current?.titleTop ?? ""}
        title={current?.title ?? ""}
        duration={current?.duration ?? ""}
        summary={current?.summary ?? ""}
      >
        {active === "fg" ? <ContenuFG /> : null}
        {active === "appro" ? <ContenuAppro /> : null}
      </ProgrammeModal>
    </>
  );
}
