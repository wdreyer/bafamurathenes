"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";

const INK = "#1a1530";
const PAPER = "#fff8ec";
const CREAM = "#fefcf5";
const VIOLET = "#792BB9";
const VIOLET_SOFT = "#f0e8f8";

function VioletBtn({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: VIOLET,
        color: CREAM,
        border: `2px solid ${INK}`,
        borderRadius: 999,
        padding: "9px 16px",
        fontSize: 11,
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        textDecoration: "none",
        cursor: "pointer",
      }}
    >
      {children}
    </a>
  );
}

function SoftCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ border: `2px solid ${INK}`, borderRadius: 18, background: PAPER, overflow: "hidden" }}>
      {children}
    </div>
  );
}

function SubSection({ kicker, title, children }: { kicker: string; title: string; children: React.ReactNode }) {
  return (
    <section style={{ borderTop: `1.5px solid ${INK}18`, paddingTop: 40, paddingBottom: 8 }}>
      <p className="mura-mono" style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2.5, color: VIOLET }}>
        {kicker}
      </p>
      <h2 className="ed" style={{ margin: "0 0 24px", fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 700, lineHeight: 1.1, color: INK, fontStyle: "normal" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function MiniCarousel({ images, heightClass = "h-64 md:h-[420px]" }: { images: { src: string; alt: string }[]; heightClass?: string }) {
  const [i, setI] = useState(0);
  const hasMany = images.length > 1;
  const prev = () => setI((v) => (v - 1 + images.length) % images.length);
  const next = () => setI((v) => (v + 1) % images.length);

  return (
    <div style={{ position: "relative", border: `2px solid ${INK}`, borderRadius: 18, overflow: "hidden" }}>
      <div className={`relative w-full ${heightClass}`}>
        <Image src={images[i].src} alt={images[i].alt} fill className="object-cover" />
      </div>
      {hasMany && (
        <>
          <button type="button" onClick={prev} aria-label="Photo précédente" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.88)", border: `1.5px solid ${INK}`, borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, cursor: "pointer", color: INK, fontWeight: 700 }}>‹</button>
          <button type="button" onClick={next} aria-label="Photo suivante" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.88)", border: `1.5px solid ${INK}`, borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, cursor: "pointer", color: INK, fontWeight: 700 }}>›</button>
        </>
      )}
      <div style={{ position: "absolute", bottom: 12, left: 12, background: "rgba(255,255,255,0.88)", border: `1.5px solid ${INK}`, borderRadius: 999, padding: "5px 12px", fontSize: 11, fontWeight: 800, color: INK, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: VIOLET, display: "inline-block" }} />
        {i + 1}/{images.length}
      </div>
    </div>
  );
}

function Photo({ src, alt, h = "h-64 md:h-[380px]", contain = false }: { src: string; alt: string; h?: string; contain?: boolean }) {
  return (
    <div style={{ border: `2px solid ${INK}`, borderRadius: 18, overflow: "hidden" }}>
      <div className={`relative w-full ${h}`}>
        <Image src={src} alt={alt} fill className={contain ? "object-contain" : "object-cover"} sizes="(min-width: 768px) 50vw, 100vw" />
      </div>
    </div>
  );
}

export default function LieuTransportTab() {
  const mapsLink = useMemo(() => "https://www.google.com/maps/search/?api=1&query=Domaine%20de%20Gravi%C3%A8res%20Lanobre", []);

  const pix = useMemo(() => ({
    domaine: "/optimized/PIX/2.webp",
    cantal: "/optimized/PIX/3.webp",
    cuisine: "/optimized/PIX/cuisine.webp",
    salle: "/optimized/PIX/50.webp",
    dehors: "/optimized/PIX/60.webp",
    domaine1: "/optimized/infos.webp",
  }), []);

  const carouselImages = useMemo(() => [
    { src: pix.domaine1, alt: "Paysages du Cantal" },
    { src: pix.domaine, alt: "Le domaine" },
    { src: pix.salle, alt: "Salle d'activité" },
  ], [pix]);

  const driveTimes = [
    { city: "Clermont-Ferrand", time: "≈ 1h15", km: "74 km" },
    { city: "Aurillac", time: "≈ 1h30", km: "≈ 84 km" },
    { city: "Ussel", time: "≈ 30 min", km: "≈ 29 km" },
    { city: "Lyon", time: "≈ 3h30", km: "≈ 290 km" },
  ];

  return (
    <div style={{ width: "100%" }}>
      {/* En-tête */}
      <header style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 0" }} className="md:px-12">
        <div style={{ display: "grid", gap: 24, alignItems: "center" }} className="md:grid-cols-[1.15fr_0.85fr]">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <p className="mura-mono" style={{ margin: "0 0 8px", fontSize: 11, letterSpacing: 2.5, color: VIOLET, fontWeight: 800 }}>
                📍 LIEU &amp; TRANSPORT
              </p>
              <h1 className="ed" style={{ margin: 0, fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 700, letterSpacing: -2, lineHeight: 1, color: INK, fontStyle: "normal" }}>
                Lieu &amp; transport
              </h1>
            </div>
            <p style={{ margin: 0, maxWidth: 500, fontSize: 14, lineHeight: 1.65, color: INK, opacity: 0.75 }}>
              Nos formations BAFA se déroulent au Domaine de Gravières, un lieu mis à la disposition de l&apos;association Murathènes.
            </p>
            <address style={{ fontStyle: "normal", fontSize: 14, lineHeight: 1.6, color: INK }}>
              <strong>Domaine de Gravières</strong><br />
              15270 Lanobre (Cantal)
            </address>
            <div>
              <VioletBtn href={mapsLink} external>Ouvrir sur Maps ↗</VioletBtn>
            </div>
          </div>

          <div style={{ border: `2px solid ${INK}`, borderRadius: 18, overflow: "hidden", background: INK }}>
            <video
              src="/optimized/videos/lieu-transport.mp4"
              poster="/optimized/PIX/2.webp"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="h-full max-h-56 w-full object-cover md:max-h-[380px]"
            />
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 48px" }} className="md:px-12">
        {/* Transport */}
        <SubSection kicker="Transport" title="Comment venir">
          {/* Train */}
          <SoftCard>
            <div style={{ padding: "22px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 18 }} aria-hidden>🚆</span>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: INK }}>Venir en train</h3>
              </div>
              <div style={{ display: "grid", gap: 16 }} className="md:grid-cols-2">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: INK, opacity: 0.8 }}>
                    Les gares les plus pratiques pour rejoindre le Domaine de Gravières sont <strong>Clermont-Ferrand</strong>, <strong>Aurillac</strong> et <strong>Ussel</strong>.
                  </p>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: INK, opacity: 0.8 }}>
                    Selon ton point de départ, l&apos;arrivée se fait via l&apos;une de ces gares, puis une correspondance jusqu&apos;à <strong>Lanobre</strong>.
                  </p>
                </div>
                <div style={{ borderTop: `1.5px dashed ${INK}22`, paddingTop: 16, display: "flex", flexDirection: "column", gap: 8 }} className="md:border-t-0 md:border-l md:pt-0 md:pl-5">
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: INK, opacity: 0.8 }}>
                    🚌 Depuis <strong>Clermont-Ferrand</strong>, tu peux rejoindre Lanobre en bus via la <strong>ligne P47</strong>.
                  </p>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: INK, opacity: 0.8 }}>
                    Si tu arrives en train ou en bus, nous pouvons <strong>coordonner la suite du trajet</strong> jusqu&apos;au domaine : contacte-nous à l&apos;avance.
                  </p>
                  <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: INK, opacity: 0.6 }}>
                    📍 Le domaine se situe à environ <strong>8 km</strong> de Lanobre.
                  </p>
                </div>
              </div>
            </div>
          </SoftCard>

          {/* Voiture */}
          <div style={{ marginTop: 14 }}>
            <SoftCard>
              <div style={{ padding: "22px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }} aria-hidden>🚗</span>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: INK }}>Venir en voiture</h3>
                  </div>
                  <VioletBtn href={mapsLink} external>Ouvrir sur Maps ↗</VioletBtn>
                </div>
                <div style={{ border: `1.5px solid ${INK}22`, borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.8fr 0.8fr", padding: "10px 16px", background: VIOLET_SOFT, borderBottom: `1.5px solid ${INK}22` }}>
                    <p className="mura-mono" style={{ margin: 0, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, color: VIOLET }}>Ville</p>
                    <p className="mura-mono" style={{ margin: 0, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, color: VIOLET }}>Durée</p>
                    <p className="mura-mono" style={{ margin: 0, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, color: VIOLET }}>Distance</p>
                  </div>
                  {driveTimes.map((t, i) => (
                    <div key={t.city} style={{ display: "grid", gridTemplateColumns: "1.4fr 0.8fr 0.8fr", padding: "10px 16px", borderBottom: i < driveTimes.length - 1 ? `1px solid ${INK}12` : undefined }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: INK }}>{t.city}</p>
                      <p style={{ margin: 0, fontSize: 13, color: INK, opacity: 0.8 }}>{t.time}</p>
                      <p style={{ margin: 0, fontSize: 13, color: INK, opacity: 0.6 }}>{t.km}</p>
                    </div>
                  ))}
                </div>
                <p style={{ margin: "10px 0 0", fontSize: 12, color: INK, opacity: 0.55 }}>
                  ℹ️ Indications données à titre informatif : vérifie l&apos;itinéraire selon l&apos;horaire et la circulation.
                </p>
              </div>
            </SoftCard>
          </div>
        </SubSection>

        {/* Le lieu */}
        <SubSection kicker="Le lieu" title="Le Domaine de Gravières">
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {/* Texte + photo */}
            <div style={{ display: "grid", gap: 20, alignItems: "center" }} className="md:grid-cols-12">
              <div className="md:col-span-5" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: INK, opacity: 0.8 }}>
                  📍 Le Domaine de Gravières est situé dans la commune de <strong>Lanobre</strong>, un village auvergnat situé au nord du département du <strong>Cantal</strong>. Ce site se trouve au cœur du parc naturel régional des <strong>Volcans d&apos;Auvergne</strong>, sur le plateau de l&apos;Artense.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {["Cadre paisible", "Volcans d'Auvergne", "Plateau de l'Artense"].map((tag) => (
                    <span key={tag} style={{ border: `1.5px solid ${VIOLET}44`, borderRadius: 999, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: VIOLET, background: VIOLET_SOFT }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="md:col-span-7">
                <Photo src={pix.cantal} alt="Paysage du Cantal" h="h-64 md:h-[420px]" />
              </div>
            </div>

            {/* Photo + texte */}
            <div style={{ display: "grid", gap: 20, alignItems: "center" }} className="md:grid-cols-12">
              <div className="md:col-span-6">
                <Photo src={pix.domaine} alt="Extérieur du domaine" h="h-64 md:h-[420px]" />
              </div>
              <div className="md:col-span-6" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: INK, opacity: 0.8 }}>
                  🏡 Le Domaine de Gravières est équipé pour offrir un confort optimal dans un cadre paisible. Accessible par route goudronnée, il dispose d&apos;un parking.
                </p>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: INK, opacity: 0.8 }}>
                  ♿ Établissement recevant du public (ERP) accessible PMR, idéal pour accueillir des groupes, séjours et évènements.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {["ERP", "PMR", "Parking", "Groupes"].map((tag) => (
                    <span key={tag} style={{ border: `1.5px solid ${INK}22`, borderRadius: 999, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: INK, background: CREAM }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Activités + carousel */}
            <div style={{ display: "grid", gap: 20, alignItems: "center" }} className="md:grid-cols-12">
              <div className="md:col-span-5" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: INK, opacity: 0.8 }}>
                  🌿 Nombreuses activités à proximité en toute saison :
                </p>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    "🥾 Randonnées dans les Monts d'Auvergne.",
                    "🌊 Baignade au lac de Bort-les-Orgues.",
                    "🌋 Visite de Vulcania et sites culturels.",
                    "🎿 Ski alpin et randonnée au Mont-Dore et Super Besse.",
                  ].map((item) => (
                    <li key={item} style={{ fontSize: 13, lineHeight: 1.6, color: INK, opacity: 0.8 }}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="md:col-span-7">
                <MiniCarousel images={carouselImages} heightClass="h-64 md:h-[420px]" />
              </div>
            </div>

            {/* Les espaces */}
            <SoftCard>
              <div style={{ padding: "22px 22px" }}>
                <p className="mura-mono" style={{ margin: "0 0 20px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, color: VIOLET }}>
                  🧩 Les espaces sur place
                </p>
                <div style={{ display: "grid", gap: 20 }} className="md:grid-cols-12">
                  {/* Salle */}
                  <div className="md:col-span-5">
                    <Photo src={pix.salle} alt="Salle d'activité" h="h-56 md:h-64" />
                  </div>
                  <div className="md:col-span-7" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: INK }}>🎭 Salle d&apos;activité</p>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: INK, opacity: 0.8 }}>
                      Spacieuse et lumineuse, conçue pour accueillir animations, ateliers de groupe, réunions et séminaires.
                    </p>
                  </div>

                  <div className="md:col-span-12" style={{ borderTop: `1.5px dashed ${INK}22` }} />

                  {/* Réfectoire + cuisine */}
                  <div className="md:col-span-6" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: INK }}>🍽️ Réfectoire</p>
                      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: INK, opacity: 0.8 }}>Espace dédié aux repas collectifs, conçu pour une atmosphère conviviale et agréable, adapté aux groupes.</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: INK }}>👩‍🍳 Cuisine</p>
                      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: INK, opacity: 0.8 }}>Entièrement équipée avec installations professionnelles pour la préparation de repas de qualité.</p>
                    </div>
                  </div>
                  <div className="md:col-span-6">
                    <Photo src={pix.cuisine} alt="Cuisine" h="h-56 md:h-64" />
                  </div>

                  <div className="md:col-span-12" style={{ borderTop: `1.5px dashed ${INK}22` }} />

                  {/* Dortoirs */}
                  <div className="md:col-span-5">
                    <Photo src={pix.dehors} alt="Extérieur" h="h-64 md:h-[360px]" />
                  </div>
                  <div className="md:col-span-7" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: INK }}>🧺 Buanderie</p>
                      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: INK, opacity: 0.8 }}>Équipements professionnels : machines à laver, séchoirs et dispositifs de repassage de haute qualité.</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: INK }}>🛏️ Dortoirs</p>
                      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: INK, opacity: 0.8 }}>
                        Modulables, jusqu&apos;à soixante personnes. Accessibles PMR, chaque chambre dispose d&apos;une salle de bain et toilettes privatives.
                      </p>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {["Jusqu'à 60 personnes", "PMR", "Salle de bain privative"].map((tag) => (
                        <span key={tag} style={{ border: `1.5px solid ${VIOLET}44`, borderRadius: 999, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: VIOLET, background: VIOLET_SOFT }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </SoftCard>
          </div>
        </SubSection>
      </div>
    </div>
  );
}
