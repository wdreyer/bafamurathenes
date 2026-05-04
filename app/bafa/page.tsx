"use client";

import Image from "next/image";
import Link from "next/link";

const INK = "#1a1530";
const PAPER = "#fff8ec";
const CREAM = "#fefcf5";
const VIOLET = "#792BB9";
const VIOLET_SOFT = "#f0e8f8";
const YELLOW = "#F5EF72";
const PHONE_DISPLAY = "01 84 21 05 48";
const PHONE_TEL = "0184210548";

const openContact = (mode: "message" | "callback" = "callback") => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("contact-widget:open", { detail: { mode } }));
  }
};

export default function BafaPage() {
  return (
    <div className="mura-page" style={{ color: INK, background: CREAM }}>

      {/* ═══════════════════════════════════════
          HERO
      ═══════════════════════════════════════ */}
      <section style={{ position: "relative", background: INK, minHeight: "60vh", overflow: "hidden" }}>
        <Image src="/FGAVRIL2026/IMG_8209.JPG" alt="BAFA Murathènes" fill priority className="object-cover object-center" />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(26,21,48,.4) 0%,rgba(26,21,48,.88) 100%)" }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1100, margin: "0 auto", padding: "80px 24px 96px" }} className="md:px-12">
          <div className="mura-mono" style={{ fontSize: 11, letterSpacing: 2.5, color: YELLOW, marginBottom: 24 }}>LE BAFA, C&apos;EST QUOI ?</div>
          <h1 style={{ fontSize: 100, fontWeight: 700, letterSpacing: -5, lineHeight: .9, margin: 0, color: CREAM }} className="text-5xl md:text-[100px]">
            Votre premier pas dans{" "}
            <span className="ed" style={{ fontStyle: "italic", color: YELLOW }}>l&apos;animation.</span>
          </h1>
          <p style={{ fontSize: 18, marginTop: 28, maxWidth: 680, opacity: .9, lineHeight: 1.55, color: CREAM }}>
            Le Brevet d&apos;Aptitude aux Fonctions d&apos;Animateur·ice. Pour encadrer enfants et ados en colos, centres de loisirs, périscolaire. Avec Murathènes : pédagogie active, engagement, bienveillance.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
            <Link href="/formations" className="mura-pill mura-cta-secondary">
              Voir les formations
            </Link>
            <a href={`tel:${PHONE_TEL}`} className="mura-pill" style={{ background: CREAM, color: INK, cursor: "pointer", textDecoration: "none" }} aria-label={`Appeler Murathènes au ${PHONE_DISPLAY}`}>
              {PHONE_DISPLAY}
            </a>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 24, flexWrap: "wrap" }}>
            {["🎓 Formation Jeunesse & Sports","✨ 3 grandes étapes","📍 Cantal – Région AURA"].map((t) => (
              <span key={t} className="mura-mono" style={{ background: "rgba(255,255,255,0.12)", color: CREAM, padding: "7px 14px", borderRadius: 999, fontSize: 11, letterSpacing: 1, border: "1px solid rgba(255,255,255,0.2)" }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          LE BAFA EN QUELQUES MOTS
      ═══════════════════════════════════════ */}
      <section style={{ background: CREAM, borderBottom: `1.5px solid ${INK}`, padding: "80px 24px" }} className="md:px-12">
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gap: 56 }} className="grid-cols-1 md:grid-cols-2 md:items-start">
          <div>
            <div className="mura-mono" style={{ fontSize: 11, letterSpacing: 2.5, color: VIOLET, fontWeight: 700, marginBottom: 14 }}>LE BAFA EN QUELQUES MOTS</div>
            <h2 style={{ fontSize: 52, fontWeight: 700, letterSpacing: -2, lineHeight: 1, margin: "0 0 28px", color: INK }} className="text-3xl md:text-[52px]">
              Une formation pour{" "}
              <span className="ed" style={{ fontStyle: "italic", color: VIOLET }}>encadrer</span>{" "}
              enfants et ados.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.65, color: INK, opacity: .85, marginBottom: 16 }}>
              Le Brevet d&apos;Aptitude aux Fonctions d&apos;Animateur·ice te permet d&apos;encadrer, à titre occasionnel, des groupes d&apos;enfants et d&apos;adolescents en centres de loisirs, séjours de vacances, camps, périscolaire…
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.65, color: INK, opacity: .85, marginBottom: 16 }}>
              Avec le BAFA, tu donnes vie au collectif : tu construis des projets <strong>avec</strong> et <strong>pour</strong> les jeunes. Tu crées des souvenirs inoubliables, des moments de vie exceptionnels, en toute sécurité.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.65, color: INK, opacity: .85, marginBottom: 24 }}>
              C&apos;est aussi le travail en équipe, la vie en collectivité et la gestion de groupe.
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: YELLOW, borderRadius: 999, padding: "12px 20px", border: `2px solid ${INK}`, transform: "rotate(-1deg)" }}>
              <span style={{ fontSize: 20 }}>🎓</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>Inscription dès 16 ans révolus.</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "auto auto", gap: 12 }}>
            <div style={{ gridColumn: "1/3", border: `2px solid ${INK}`, borderRadius: 16, overflow: "hidden", boxShadow: `3px 3px 0 ${VIOLET}` }}>
              <div style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}>
                <Image src="/FGAVRIL2026/IMG_8287.JPG" alt="Groupe de stagiaires BAFA au soleil" fill className="object-cover" />
              </div>
            </div>
            <div style={{ border: `2px solid ${INK}`, borderRadius: 16, overflow: "hidden", transform: "rotate(-1deg)" }}>
              <div style={{ position: "relative", width: "100%", aspectRatio: "1/1" }}>
                <Image src="/FGAVRIL2026/IMG_8325.JPG" alt="Stagiaire BAFA en activité extérieure" fill className="object-cover" />
              </div>
            </div>
            <div style={{ border: `2px solid ${INK}`, borderRadius: 16, overflow: "hidden", transform: "rotate(1deg)" }}>
              <div style={{ position: "relative", width: "100%", aspectRatio: "1/1" }}>
                <Image src="/FGAVRIL2026/IMG_8451.JPG" alt="Portraits de stagiaires BAFA en extérieur" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          LES 3 ÉTAPES
      ═══════════════════════════════════════ */}
      <section style={{ background: VIOLET_SOFT, padding: "80px 24px", borderBottom: `1.5px solid ${INK}` }} className="md:px-12">
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="mura-mono" style={{ fontSize: 11, letterSpacing: 2.5, color: VIOLET, fontWeight: 700, marginBottom: 14 }}>LES 3 ÉTAPES DU BAFA</div>
          <h2 style={{ fontSize: 52, fontWeight: 700, letterSpacing: -2, lineHeight: 1, margin: "0 0 48px", color: INK }} className="text-3xl md:text-[52px]">
            Une formation complète,{" "}
            <span className="ed" style={{ fontStyle: "italic", color: VIOLET }}>étape par étape.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 24 }}>
            {[
              {
                num: "01", color: VIOLET, title: "Formation Générale", duration: "8 jours", progress: "33%",
                bullets: [
                  "Créer des animations de A à Z : veillées, grands jeux, ateliers, temps calmes…",
                  "Comprendre les besoins des différentes tranches d'âge (maternelles, enfance, préadolescence, adolescence)",
                  "Découvrir le fonctionnement des Accueils Collectifs de Mineurs (centres de loisirs, séjours, périscolaire)",
                  "Réfléchir à la posture d'animateur·ice : gestion de groupe, bienveillance, autorité, écoute, sécurité",
                ],
              },
              {
                num: "02", color: YELLOW, title: "Stage pratique", duration: "14 jours", progress: "66%",
                bullets: [
                  "Tu rejoins une équipe dans un centre de loisirs, un séjour ou un accueil périscolaire",
                  "Tu mets en pratique ce que tu as vu en formation : animations, vie quotidienne, sécurité, écoute",
                  "Tu apprends à travailler avec un·e directeur·rice, des collègues, des partenaires",
                  "Murathènes t'accompagne dans la recherche de stage via son réseau de structures partenaires",
                ],
              },
              {
                num: "03", color: VIOLET, title: "Étape 3 · Approfondissement", duration: "8 jours", progress: "100%",
                bullets: [
                  "Retours et analyses des stages pratiques — consolider tes acquis",
                  "Approfondir une thématique : séjour à l'étranger, échanges de jeunes, interculturalité, projets européens",
                  "Option qualification pour développer une compétence (canoë-kayak, surveillance de baignade…)",
                ],
              },
            ].map((s) => (
              <div key={s.num} style={{ background: PAPER, border: `2px solid ${INK}`, borderRadius: 24, padding: 28, boxShadow: `3px 3px 0 ${INK}`, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: s.color, color: s.color === YELLOW ? INK : CREAM, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, border: `2px solid ${INK}` }}>{s.num}</div>
                  <span className="mura-mono" style={{ fontSize: 11, color: INK, opacity: .6, letterSpacing: 1 }}>{s.duration}</span>
                </div>
                <h3 className="ed" style={{ fontSize: 26, fontWeight: 600, letterSpacing: -.8, margin: 0, color: INK, fontStyle: "italic" }}>{s.title}</h3>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                  {s.bullets.map((b) => (
                    <li key={b} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, lineHeight: 1.55, color: INK, opacity: .78 }}>
                      <span style={{ flexShrink: 0, marginTop: 3, width: 6, height: 6, borderRadius: "50%", background: s.color === YELLOW ? INK : s.color }} />
                      {b}
                    </li>
                  ))}
                </ul>
                {s.num === "03" && (
                  <Link href="/formations?type=approfondissement" style={{ display: "block", background: `${VIOLET}12`, padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${VIOLET}30`, textDecoration: "none" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: VIOLET }}>Étape 3 · Approfondissement séjour à l&apos;étranger →</div>
                    <div style={{ fontSize: 12, color: INK, opacity: .7, marginTop: 4 }}>Interculturalité, échanges de jeunes, projets européens</div>
                  </Link>
                )}
                <div style={{ marginTop: "auto", paddingTop: 12 }}>
                  <div style={{ height: 8, borderRadius: 999, background: `${INK}11`, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: s.progress, background: s.color, borderRadius: 999 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          POURQUOI MURATHÈNES ?
      ═══════════════════════════════════════ */}
      <section style={{ background: CREAM, padding: "80px 24px", borderBottom: `1.5px solid ${INK}` }} className="md:px-12">
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr]" style={{ gap: 56 }}>
            <div>
              <div className="mura-mono" style={{ fontSize: 11, letterSpacing: 2.5, color: VIOLET, fontWeight: 700, marginBottom: 14 }}>POURQUOI MURATHÈNES ?</div>
              <h2 style={{ fontSize: 48, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.05, margin: "0 0 28px", color: INK }} className="text-3xl md:text-[48px]">
                Une pédagogie active, engagée,{" "}
                <span className="ed" style={{ fontStyle: "italic", color: VIOLET }}>tournée vers les jeunes.</span>
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.65, color: INK, opacity: .85, marginBottom: 16 }}>
                Murathènes est une association d&apos;éducation populaire née en 2019 d&apos;un constat simple : tous les jeunes n&apos;ont pas accès aux mêmes opportunités de loisirs.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.65, color: INK, opacity: .85, marginBottom: 16 }}>
                Nos formations BAFA sont des espaces d&apos;émancipation : posture professionnelle, mais aussi confiance, esprit critique, créativité, capacité à faire groupe.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.65, color: INK, opacity: .85 }}>
                Créer des espaces de joie et de paix où chaque jeune existe, compte, est valorisé — peu importe son identité, son genre, ses origines, sa situation.
              </p>

              <div style={{ marginTop: 28, padding: "18px 22px", background: PAPER, borderRadius: 16, border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${VIOLET}` }}>
                <div className="mura-mono" style={{ fontSize: 10, color: VIOLET, letterSpacing: 1.5, marginBottom: 8 }}>NOTRE APPROCHE</div>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: INK, opacity: .85, margin: 0 }}>
                  Une attention particulière est portée sur la connaissance des différents publics, les particularismes de chaque enfant, et sur comment faire groupe avec des jeunes d&apos;horizons variés. L&apos;animation comme outil d&apos;éducation populaire et d&apos;action sociale.
                </p>
              </div>

              <div style={{ marginTop: 20, padding: "18px 22px", background: PAPER, borderRadius: 16, border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${YELLOW}` }}>
                <div className="mura-mono" style={{ fontSize: 10, color: VIOLET, letterSpacing: 1.5, marginBottom: 8 }}>ET APRÈS LA FORMATION ?</div>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: INK, opacity: .85, margin: "0 0 10px" }}>
                  Grâce à notre réseau, on t&apos;aide à trouver un stage pratique, puis à te projeter : engagement associatif, échanges européens, volontariat international, séjours et colos.
                </p>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: INK, opacity: .85, margin: 0, fontStyle: "italic" }}>
                  Tu ne repars pas juste avec un diplôme, mais avec une expérience de groupe forte et des pistes concrètes pour la suite.
                </p>
              </div>
            </div>
            <div>
              <div style={{ border: `2px solid ${INK}`, borderRadius: 20, overflow: "hidden", boxShadow: `4px 4px 0 ${YELLOW}` }}>
                <div style={{ position: "relative", width: "100%", aspectRatio: "3/4" }}>
                  <Image src="/FGAVRIL2026/IMG_8308.JPG" alt="Portrait de stagiaire BAFA Murathènes" fill className="object-cover" />
                </div>
              </div>
            </div>
          </div>

          {/* 4 mini-cartes */}
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 16, marginTop: 48 }}>
            {[
              { icon: "🎭", title: "Pédagogie de projet", text: "Création collective en fil rouge de la semaine." },
              { icon: "🤝", title: "Valeurs fortes", text: "Consentement, mixité, diversité, bienveillance." },
              { icon: "🏡", title: "Cadre de vie", text: "Internat, vie collective, temps de partage et de respiration." },
              { icon: "🌍", title: "Ouverture", text: "Échanges de jeunes, séjours à l'étranger, projets européens." },
            ].map((c) => (
              <div key={c.title} style={{ background: PAPER, padding: "20px 18px", border: `1.5px solid ${INK}`, borderRadius: 16 }}>
                <div style={{ fontSize: 26, marginBottom: 10 }}>{c.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: INK }}>{c.title}</div>
                <div style={{ fontSize: 13, color: INK, opacity: .75, lineHeight: 1.5 }}>{c.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CONDITIONS & CTAs
      ═══════════════════════════════════════ */}
      <section style={{ background: VIOLET_SOFT, padding: "64px 24px", borderBottom: `1.5px solid ${INK}` }} className="md:px-12">
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="mura-mono" style={{ fontSize: 11, color: VIOLET, fontWeight: 700, letterSpacing: 2.5, marginBottom: 14 }}>CONDITIONS &amp; ORGANISATION</div>
          <h2 style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.1, margin: "0 0 24px", color: INK }} className="text-2xl md:text-[40px]">
            Quelques points à retenir avant de te lancer
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 10 }}>
            <li style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 15, color: INK, opacity: .85 }}>
              <span style={{ flexShrink: 0, marginTop: 2, color: VIOLET, fontWeight: 700 }}>→</span>
              Tu dois avoir 16 ans révolus au premier jour de ta formation générale.
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 15, color: INK, opacity: .85 }}>
              <span style={{ flexShrink: 0, marginTop: 2, color: VIOLET, fontWeight: 700 }}>→</span>
              Une attestation de stage pratique d&apos;au moins 14 jours est demandée pour l&apos;étape 3 : l&apos;approfondissement ou la qualification.
            </li>
          </ul>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Link href="/formations" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: INK, color: CREAM, padding: "14px 24px", borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", textDecoration: "none", border: `2px solid ${INK}` }}>
              🗓️ Voir le calendrier →
            </Link>
            <Link href="/infos-pratiques" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: YELLOW, color: INK, padding: "14px 24px", borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", textDecoration: "none", border: `2px solid ${INK}` }}>
              ℹ️ Infos pratiques →
            </Link>
            <button onClick={() => openContact("message")} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: VIOLET, color: CREAM, padding: "14px 24px", borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              ☎ Une question ?
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
