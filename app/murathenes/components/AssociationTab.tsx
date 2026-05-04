"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

const INK = "#1a1530";
const PAPER = "#fff8ec";
const CREAM = "#fefcf5";
const VIOLET = "#792BB9";
const YELLOW = "#F5EF72";

type Project = {
  id: string;
  datePlace: string;
  theme: string;
  title: string;
  partner?: string;
  paragraphs: string[];
  image: string;
};

function ProjectsCarousel({ items }: { items: Project[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center", containScroll: "trimSnaps" });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => { emblaApi.off("select", onSelect); emblaApi.off("reInit", onSelect); };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div style={{ width: "100%" }}>
      {/* Mobile nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 16 }} className="md:hidden">
        <button type="button" onClick={scrollPrev} aria-label="Projet precedent" style={{ width: 40, height: 40, borderRadius: "50%", border: `2px solid ${INK}`, background: PAPER, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: INK }}>
          ‹
        </button>
        <div style={{ display: "flex", gap: 6 }}>
          {items.map((_, i) => (
            <div key={i} style={{ height: 6, borderRadius: 999, background: i === selected ? VIOLET : `${INK}33`, width: i === selected ? 24 : 6, transition: "all 0.3s" }} />
          ))}
        </div>
        <button type="button" onClick={scrollNext} aria-label="Projet suivant" style={{ width: 40, height: 40, borderRadius: "50%", border: `2px solid ${INK}`, background: PAPER, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: INK }}>
          ›
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button type="button" onClick={scrollPrev} aria-label="Projet precedent" style={{ width: 52, height: 52, borderRadius: "50%", border: `2px solid ${INK}`, background: PAPER, cursor: "pointer", display: "none", alignItems: "center", justifyContent: "center", fontSize: 24, color: INK, flexShrink: 0, boxShadow: `3px 3px 0 ${INK}` }} className="hidden md:flex">
          ‹
        </button>

        <div ref={emblaRef} style={{ flex: 1, overflow: "hidden", borderRadius: 22, cursor: "grab" }}>
          <div style={{ display: "flex" }}>
            {items.map((p, i) => {
              const active = i === selected;
              return (
                <article
                  key={p.id}
                  style={{
                    flexShrink: 0,
                    width: "100%",
                    padding: "0 8px",
                    transition: "transform 0.3s, opacity 0.3s",
                    transform: active ? "scale(1)" : "scale(0.98)",
                    opacity: active ? 1 : 0.45,
                  }}
                  className="md:w-[920px]"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-[1.18fr_0.82fr]" style={{ border: `2px solid ${INK}`, borderRadius: 22, overflow: "hidden", background: PAPER, boxShadow: active ? `6px 6px 0 ${VIOLET}` : `2px 2px 0 ${INK}44` }}>
                    <div style={{ position: "relative", minHeight: "clamp(340px, 45vw, 540px)", background: INK }}>
                      <Image src={p.image} alt={p.title} fill className="object-cover" />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(26,21,48,.42), transparent 48%)" }} />
                      <div style={{ position: "absolute", bottom: 16, left: 16, right: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
                        <div style={{ background: YELLOW, border: `2px solid ${INK}`, borderRadius: 999, padding: "8px 13px", boxShadow: `2px 2px 0 ${INK}` }}>
                          <p className="mura-mono" style={{ margin: 0, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, color: VIOLET }}>{p.datePlace}</p>
                        </div>
                        <div style={{ background: "rgba(254,252,245,0.94)", border: `2px solid ${INK}`, borderRadius: 999, padding: "8px 13px", boxShadow: `2px 2px 0 ${INK}` }}>
                          <p className="mura-mono" style={{ margin: 0, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.2, color: INK, opacity: 0.78 }}>{p.theme}</p>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "28px 26px" }}>
                      <p className="mura-mono" style={{ margin: "0 0 14px", fontSize: 10, fontWeight: 850, textTransform: "uppercase", letterSpacing: 2, color: VIOLET }}>
                        Projet {String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                      </p>
                      <h4 className="ed" style={{ margin: "0 0 16px", fontSize: "clamp(28px, 3.8vw, 44px)", fontWeight: 700, color: INK, lineHeight: 1, letterSpacing: -1.3 }}>{p.title}</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {p.paragraphs.map((t, idx) => (
                          <p key={idx} style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: INK, opacity: 0.82 }}>{t}</p>
                        ))}
                      </div>
                      {p.partner && (
                        <p className="mura-mono" style={{ margin: "18px 0 0", paddingTop: 14, borderTop: `1.5px dashed ${INK}33`, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, color: VIOLET }}>
                          Partenaire : {p.partner}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <button type="button" onClick={scrollNext} aria-label="Projet suivant" style={{ width: 52, height: 52, borderRadius: "50%", border: `2px solid ${INK}`, background: PAPER, cursor: "pointer", display: "none", alignItems: "center", justifyContent: "center", fontSize: 24, color: INK, flexShrink: 0, boxShadow: `3px 3px 0 ${INK}` }} className="hidden md:flex">
          ›
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
        {items.map((p, i) => {
          const active = i === selected;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => emblaApi?.scrollTo(i)}
              aria-label={`Voir le projet ${p.title}`}
              style={{
                position: "relative",
                minHeight: 92,
                overflow: "hidden",
                border: `2px solid ${active ? VIOLET : INK}`,
                borderRadius: 14,
                background: INK,
                padding: 0,
                cursor: "pointer",
                boxShadow: active ? `3px 3px 0 ${YELLOW}` : "none",
              }}
            >
              <Image src={p.image} alt="" fill sizes="160px" className="object-cover" />
              <span style={{ position: "absolute", inset: 0, background: active ? "rgba(121,43,185,0.02)" : "rgba(26,21,48,0.38)" }} />
              <span className="mura-mono" style={{ position: "absolute", left: 8, right: 8, bottom: 8, color: CREAM, fontSize: 9, fontWeight: 850, letterSpacing: 1, lineHeight: 1.2, textAlign: "left", textTransform: "uppercase", textShadow: "0 1px 6px rgba(0,0,0,0.55)" }}>
                {p.datePlace.split("·")[0].trim()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AssociationTab() {
  const projects = useMemo<Project[]>(() => [
    { id: "mew-2019", datePlace: "Avril 2019 · Athènes", theme: "chant · instruments · pop · musique trad", title: "Première Murathènes European Week", partner: "Project Elea (Grèce)", image: "/MT/mew19.jpg", paragraphs: ["30 jeunes du Cantal (lycées professionnels et généraux, musicien·nes et non musicien·nes), 30 jeunes résident·es du camp de réfugié·es Eleonas, à Athènes (origines afghanes, syriennes, congolaises, entre autres).", "Musicien·nes et non musicien·nes ont préparé pendant 6 mois et à distance un programme musical commun. Ils ont partagé une semaine ensemble durant laquelle ils ont enregistré leurs morceaux, rejoint des ensembles musicaux locaux et vécu une excursion sur une île grecque.", "Une semaine magique, un projet émouvant qui a donné à chacun·e une place et une voix, dans un collectif uni par la musique et les rires."] },
    { id: "mew-2022", datePlace: "Avril 2022 · Athènes", theme: "chant · pop", title: "Murathènes European Week 2022", image: "/MT/mew22.jpeg", paragraphs: ["On prend les mêmes et on recommence !", "Le renouvellement du partenariat avec l'ONG Project Elea a permis d'aller plus loin encore dans l'expérience : plus de préparation, plus d'opportunités.", "La semaine de rencontre fut exceptionnelle grâce à de nombreux nouveaux partenaires associatifs internationaux."] },
    { id: "euroteam-2023", datePlace: "Août 2023 · Maramureș", theme: "interculturalité · ruralité européenne", title: "EUROTEAM Cantal - Maramureș", partner: "Team For Youth (Roumanie)", image: "/MT/euroteam.JPG", paragraphs: ["Une dizaine de jeunes du Cantal, une dizaine de jeunes de la région du Maramureș, en Roumanie.", "Pour s'y rendre, les jeunes français ont traversé l'Europe en train : Suisse, Autriche, Hongrie, Roumanie.", "Sur place : parenthèse culturelle saisissante, danses, langue, activités culinaires, randonnées."] },
    { id: "mew-2024", datePlace: "Avril 2024 · Chypre", theme: "instruments · orchestre symphonique · chant", title: "Murathènes European Week 2024", image: "/MT/mew24.jpg", paragraphs: ["20 jeunes musicien·nes du Cantal, 10 jeunes résident·es d'un foyer chypriote et 30 élèves de Sistema Cyprus.", "Les jeunes ont répété toute l'année pour le concert final au théâtre municipal de Nicosie : salle comble et souvenirs magiques.", "Un petit chœur a aussi composé et chanté ; l'une des chansons, en arabe syrien, est devenue l'hymne du séjour."] },
    { id: "matal-2024", datePlace: "Août 2024 · Domaine de Gravières", theme: "interculturalité · ruralité européenne", title: "MATAL Youth Cultural Odyssey", image: "/MT/matal.JPG", paragraphs: ["Après s'être rencontré·es en 2023 en Roumanie, il était temps pour les Français·es d'accueillir les Roumain·es dans le Cantal.", "Les adolescent·es ont écrit eux-mêmes le dossier de subvention européenne, obtenu le financement, puis organisé entièrement le projet.", "Une semaine de découverte, d'échanges, d'activités culinaires, de jeux — et surtout, la création et l'organisation d'un bal trad."] },
    { id: "mew-2025", datePlace: "Février & juillet 2025 · Domaine de Gravières", theme: "création rap · hip-hop · RnB · pop", title: "Murathènes European Week 2025 — 4 KILTI", image: "/MT/mew25.png", paragraphs: ["Manifestation des richesses de la jeunesse francophone : Belgique, France, Guadeloupe, Cantal… Une cinquantaine de jeunes.", "2 étapes : résidence artistique en février au domaine de Gravières, puis concerts à Paris et Bruxelles en juillet.", "Projet porté par 4 associations pour rendre audible la jeunesse via des projets émancipateurs."] },
    { id: "curious-birds-2025", datePlace: "2025 · Domaine de Gravières", theme: "composition musicale · pop instrumentale · théâtre", title: "Curious Birds", image: "/MT/curiousbird10.png", paragraphs: ["Une vingtaine de jeunes tchèques et une vingtaine de jeunes français ont créé une œuvre artistique unique mêlant composition musicale et théâtre.", "À distance : histoire, mots, notes, percussions et la hâte de se retrouver. En juillet 2025 : rencontre et représentation.", "Une aventure accompagnée par Jean-Noël Godard, les coordinatrices de Na Slunci et les équipes de Murathènes."] },
  ], []);

  return (
    <section style={{ width: "100%" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 16px" }} className="md:px-12">
        <p className="mura-mono" style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2.5, color: VIOLET }}>
          L&apos;association
        </p>
        <h2 className="ed" style={{ margin: "0 0 28px", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, lineHeight: 1.1, color: INK, fontStyle: "normal" }}>
          Association loi 1901 d&apos;éducation populaire
        </h2>
      </div>

      {/* Intro */}
      <div style={{ borderTop: `1.5px solid ${INK}18` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }} className="md:px-12">
          <div style={{ maxWidth: 800, display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: INK, opacity: 0.82 }}>
              Fondée en 2019, l&apos;association Murathènes est une association d&apos;éducation populaire visant à promouvoir les rencontres interculturelles, le patrimoine, le vivre-ensemble et l&apos;émancipation à des échelles locales, nationales, européennes et internationales. L&apos;association promeut l&apos;art et la musique comme vecteurs sociaux d&apos;insertion et de cohésion.
            </p>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: INK, opacity: 0.82 }}>
              L&apos;association organise des activités de loisirs permettant aux jeunes de se rencontrer, d&apos;échanger, par-delà les cadres limitants et coercitifs qu&apos;elles et ils peuvent rencontrer dans leurs quotidiens.
            </p>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: INK, opacity: 0.82 }}>
              Murathènes, c&apos;est la jeunesse en action, pour que chaque jeune ait droit de se rencontrer et de vivre ensemble des expériences extra-ordinaires.
            </p>
          </div>
        </div>
      </div>

      {/* Erasmus + carousel */}
      <div style={{ borderTop: `1.5px solid ${INK}18` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 40px" }} className="md:px-12">
          <p className="mura-mono" style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2.5, color: VIOLET }}>
            Accréditation Erasmus+
          </p>
          <h3 className="ed" style={{ margin: "0 0 10px", fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 700, color: INK, fontStyle: "normal" }}>
            Échanges de jeunes
          </h3>
          <p style={{ margin: "0 0 28px", maxWidth: 640, fontSize: 14, lineHeight: 1.65, color: INK, opacity: 0.75 }}>
            L&apos;association organise chaque année plusieurs échanges de jeunes Erasmus+. Entre 20 et 60 jeunes européens se rencontrent pendant 1 à 2 semaines pour réaliser un projet commun.
          </p>
          <ProjectsCarousel items={projects} />
        </div>
      </div>
    </section>
  );
}
