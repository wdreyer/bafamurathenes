"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const INK = "#1a1530";
const PAPER = "#fff8ec";
const VIOLET = "#792BB9";
const YELLOW = "#F5EF72";

function PersonCard({
  tone,
  role,
  name,
  bullets,
  children,
  photoSrc,
  photoAlt,
  photoClassName,
  photoStyle,
}: {
  tone: "violet" | "cream";
  role: string;
  name: string;
  bullets?: string[];
  children: React.ReactNode;
  photoSrc: string;
  photoAlt: string;
  photoClassName?: string;
  photoStyle?: React.CSSProperties;
}) {
  const headerBg = tone === "violet" ? VIOLET : YELLOW;
  const headerFg = tone === "violet" ? YELLOW : VIOLET;

  return (
    <article style={{ border: `2px solid ${INK}`, borderRadius: 22, overflow: "hidden", background: PAPER, boxShadow: `5px 5px 0 ${INK}` }}>
      <div style={{ background: headerBg, color: headerFg, padding: "16px 22px" }}>
        <p className="mura-mono" style={{ margin: 0, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, opacity: 0.9 }}>{role}</p>
        <h4 className="ed" style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 700, lineHeight: 1.1 }}>{name}</h4>
      </div>

      <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ position: "relative", height: 260, borderRadius: 14, overflow: "hidden", border: `1.5px solid ${INK}22` }}>
          <Image src={photoSrc} alt={photoAlt} fill sizes="(min-width: 768px) 50vw, 100vw" className={["object-cover", photoClassName ?? "object-center"].join(" ")} style={photoStyle} />
        </div>

        {bullets?.length ? (
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
            {bullets.map((b) => (
              <li key={b} style={{ fontSize: 13, lineHeight: 1.6, color: INK, paddingLeft: 14, position: "relative" }}>
                <span style={{ position: "absolute", left: 0, color: VIOLET }}>•</span>
                {b}
              </li>
            ))}
          </ul>
        ) : null}

        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14, lineHeight: 1.65, color: INK, opacity: 0.82 }}>
          {children}
        </div>
      </div>
    </article>
  );
}

export default function EquipesTab() {
  return (
    <section style={{ width: "100%" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 16px" }} className="md:px-12">
        <p className="mura-mono" style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2.5, color: VIOLET }}>
          Équipes
        </p>
        <h2 className="ed" style={{ margin: 0, fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, lineHeight: 1.1, color: INK, fontStyle: "normal" }}>
          Des formateur&middot;rices engage&middot;es, proches du terrain
        </h2>
      </div>

      {/* Intro */}
      <div style={{ borderTop: `1.5px solid ${INK}18` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }} className="md:px-12">
          <div style={{ maxWidth: 800, display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: INK, opacity: 0.82 }}>
              Murathènes forme et accompagne des formatrices et formateurs engagé&middot;es, aux expériences riches et diversifiées.
            </p>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: INK, opacity: 0.82 }}>
              Elles et ils ont une connaissance du terrain des mobilités, d&apos;une variété de publics et de types de séjours, et restent proches de l&apos;animation au quotidien.
            </p>
            <div style={{ marginTop: 8, border: `2px solid ${INK}`, borderRadius: 16, background: "#f0e8f8", padding: "18px 20px" }}>
              <p className="mura-mono" style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, color: VIOLET }}>Notre engagement</p>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: INK, opacity: 0.85 }}>
                Des équipes ancrées dans le terrain, une pédagogie active et collective, et une attention particulière portée aux publics accueillis, au groupe et à la vie de séjour.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Coordination */}
      <div style={{ borderTop: `1.5px solid ${INK}18` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 48px" }} className="md:px-12">
          <p className="mura-mono" style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2.5, color: VIOLET }}>
            Pôle de formation
          </p>
          <h3 className="ed" style={{ margin: "0 0 28px", fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 700, color: INK, fontStyle: "normal" }}>
            Coordination
          </h3>

          <div style={{ display: "grid", gap: 20 }} className="md:grid-cols-2">
            <PersonCard
              tone="violet"
              role="Coordination"
              name="Lorette Kuc"
              photoSrc="/optimized/lorette10.webp"
              photoAlt="Portrait de Lorette Kuc"
              photoClassName="object-[10%_5%]"
              photoStyle={{ filter: "brightness(1.14) contrast(1.08) saturate(1.06)" }}
              bullets={[
                "Titulaire du BAFA et du BAFD",
                "Formatrice BAFA depuis 2018",
                "Directrice des séjours et échanges de jeunes Erasmus+ (Murathènes)",
                "Responsable des activités européennes de Murathènes",
                "Animatrice socio-culturelle",
                "Ancienne éducatrice spécialisée auprès de mineurs non-accompagnés",
              ]}
            >
              <p>
                Lorette s&apos;engage depuis la création de l&apos;association pour l&apos;accessibilité des loisirs, et en particulier la pratique musicale collective, comme outil d&apos;émancipation et d&apos;action sociale.
              </p>
              <p>
                Elle a consacré son Master de recherche en Musique et Musicologie à l&apos;étude de l&apos;utilisation de l&apos;animation et de l&apos;éducation populaire comme outil de construction identitaire.
              </p>
              <p>
                Depuis 2019, elle spécialise ses interventions auprès de publics mineurs isolés, confrontés à des situations sociales et administratives coercitives et précarisantes.
              </p>
            </PersonCard>

            <PersonCard
              tone="cream"
              role="Coordination"
              name="William Dreyer"
              photoSrc="/william10.jpeg"
              photoAlt="Portrait de William Dreyer"
              photoClassName="object-[62%_10%]"
              photoStyle={{ filter: "brightness(1.06) contrast(1.06) saturate(1.02)" }}
              bullets={[
                "Diplômé d'un Master en Sciences de l'éducation",
                "Titulaire du BAFA et du BAFD",
                "Formateur BAFA et BAFD depuis 2016",
                "A dirigé plus d'une centaine de séjours",
                "Passionné d'éducation populaire et de sociologie",
                "À l'origine d'une partie de l'ingénierie pédagogique et des modules",
              ]}
            >
              <p>
                William est engagé depuis plus de 15 ans dans l&apos;éducation populaire, notamment via les séjours de vacances. Il considère le séjour collectif comme l&apos;un des rares espaces de vie où l&apos;émancipation peut réellement se construire.
              </p>
              <p>
                Il se mobilise pour l&apos;accès aux vacances pour toutes et tous, et pour un traitement équitable des jeunes, quel que soit leur milieu socio-économique.
              </p>
              <p style={{ fontSize: 13, opacity: 0.7 }}>
                Co-fondateur de{" "}
                <Link href="https://www.colocrew.com" target="_blank" rel="noreferrer" style={{ color: VIOLET, fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 3 }}>
                  ColoCrew
                </Link>
              </p>
            </PersonCard>
          </div>
        </div>
      </div>
    </section>
  );
}
