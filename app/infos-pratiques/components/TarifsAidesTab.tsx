"use client";

import React from "react";
import AidesLeadForm from "@/components/AidesLeadForm";
import { MIN_PRICE_AFTER_AIDS } from "@/lib/offers";

const INK = "#1a1530";
const PAPER = "#fff8ec";
const CREAM = "#fefcf5";
const VIOLET = "#792BB9";
const VIOLET_SOFT = "#f0e8f8";
const YELLOW = "#F5EF72";

function openContactWidget() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("contact-widget:open", { detail: { mode: "message" } }));
}

function VioletBtn({
  href,
  onClick,
  external,
  children,
}: {
  href?: string;
  onClick?: () => void;
  external?: boolean;
  children: React.ReactNode;
}) {
  const style: React.CSSProperties = {
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
    transition: "transform 160ms ease, box-shadow 160ms ease",
  };

  if (href) {
    return (
      <a href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} style={style}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} style={style}>
      {children}
    </button>
  );
}

function PriceLine({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, border: `1.5px solid ${INK}22`, borderRadius: 14, background: CREAM, padding: "14px 18px" }}>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: INK }}>{label}</p>
      <p className="ed" style={{ margin: 0, fontSize: 24, fontWeight: 700, color: VIOLET, fontStyle: "normal" }}>{value}</p>
    </div>
  );
}

function DeptAccordion({ name, lines, sourceHref }: { name: string; lines: string[]; sourceHref: string }) {
  return (
    <details style={{ border: `1.5px solid ${INK}22`, borderRadius: 14, background: PAPER, overflow: "hidden" }}>
      <summary style={{ cursor: "pointer", listStyle: "none", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, userSelect: "none" }}>
        <span style={{ fontWeight: 700, color: INK, fontSize: 14 }}>{name}</span>
        <span style={{ width: 28, height: 28, borderRadius: "50%", background: VIOLET_SOFT, display: "flex", alignItems: "center", justifyContent: "center", color: VIOLET, fontSize: 18, flexShrink: 0 }}>›</span>
      </summary>
      <div style={{ padding: "0 18px 16px", borderTop: `1.5px dashed ${INK}22` }}>
        <ul style={{ margin: "12px 0 14px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
          {lines.map((t) => (
            <li key={t} style={{ fontSize: 13, lineHeight: 1.65, color: INK, opacity: 0.8 }}>• {t}</li>
          ))}
        </ul>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <VioletBtn href={sourceHref} external>Voir la source ↗</VioletBtn>
          <VioletBtn onClick={openContactWidget}>Aide rapide →</VioletBtn>
        </div>
      </div>
    </details>
  );
}

function SubSection({
  title,
  kicker,
  flushTop = false,
  children,
}: {
  title: string;
  kicker: string;
  flushTop?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ borderTop: flushTop ? "none" : `1.5px solid ${INK}18`, paddingTop: flushTop ? 0 : 40, paddingBottom: 8 }}>
      <p className="mura-mono" style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2.5, color: VIOLET }}>
        {kicker}
      </p>
      <h3 className="ed" style={{ margin: "0 0 20px", fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 700, lineHeight: 1.1, color: INK, fontStyle: "normal" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function TarifsAidesTab() {
  const cafNationalLink = "https://www.caf.fr/allocataires/actualites/actualites-nationales/une-aide-de-200-eu-pour-passer-le-bafa";
  const cantalCafLink = "https://www.caf.fr/allocataires/caf-du-cantal/offre-de-service/vie-professionnelle/bafa/bafa-aide-locale";
  const cantalDeptPdf = "https://www.cantal.fr/wp-content/uploads/2025/09/dossier-bafa-2.pdf";
  const msaAuvergneLink = "https://auvergne.msa.fr/lfp/les-aides-aux-formations-bafa-et-bafd";
  const acLyonAuraLink = "https://www.ac-lyon.fr/les-aides-bafa-et-bafd-en-region-auvergne-rhone-alpes-123256";

  const auraDepts = [
    { name: "Cantal (15)", lines: ["Aide locale CAF : jusqu'à 400€ (FG) et 300€ (étape 3 approfondissement) selon conditions.", "Complément possible si thématique handicap (selon conditions).", "Aides possibles du Conseil départemental (selon dossier).", "Aides possibles MSA (selon éligibilité)."] },
    { name: "Puy-de-Dôme (63)", lines: ["Aides possibles CAF selon quotient.", "Aides possibles du Conseil départemental.", "Aides possibles MSA (selon éligibilité)."] },
    { name: "Haute-Loire (43)", lines: ["Aides possibles CAF (montants variables selon conditions/thématique).", "Aides possibles du Conseil départemental.", "Aides possibles MSA (selon éligibilité)."] },
    { name: "Ain (01)", lines: ["Aides possibles CAF (FG / étape 3 approfondissement).", "Aides locales possibles intercos/communes.", "Aides possibles MSA (selon éligibilité)."] },
    { name: "Allier (03)", lines: ["Aides possibles CAF (plafond / conditions).", "Aides locales possibles (selon territoire).", "Aides possibles MSA (selon éligibilité)."] },
    { name: "Ardèche (07)", lines: ["Aides possibles CAF (avec variantes selon thématique).", "Aides locales possibles selon territoire."] },
    { name: "Drôme (26)", lines: ["Aides variables selon communes/intercos.", "Pense à vérifier les dispositifs locaux + CAF."] },
    { name: "Isère (38)", lines: ["Aides possibles CAF (FG / étape 3 approfondissement).", "Aides locales possibles intercos/communes (selon conditions)."] },
    { name: "Loire (42)", lines: ["Aides possibles CAF selon quotient.", "Aides possibles du Conseil départemental.", "Aides locales possibles communes/intercos."] },
    { name: "Rhône (69)", lines: ["Aides locales possibles communes/intercos.", "Aides possibles MSA (selon éligibilité)."] },
    { name: "Savoie (73)", lines: ["Aides possibles CAF (montant variable).", "Aides locales possibles intercos/communes."] },
    { name: "Haute-Savoie (74)", lines: ["Aides possibles CAF (FG / étape 3 approfondissement, selon conditions).", "Aides possibles du Conseil départemental.", "Aides locales possibles communes/intercos."] },
  ];

  return (
    <section style={{ width: "100%", paddingBottom: 16 }}>
      {/* En-tête */}
      <header style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 8px" }} className="md:px-12">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1fr)_360px] md:items-end">
          <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left", minWidth: 0 }}>
            <p className="mura-mono" style={{ margin: 0, fontSize: 11, letterSpacing: 2.5, color: VIOLET, fontWeight: 800 }}>
              💶 TARIFS &amp; AIDES
            </p>
            <h2 className="ed" style={{ margin: 0, fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 700, letterSpacing: -2, lineHeight: 1, color: INK, fontStyle: "normal" }}>
              Tarifs &amp; aides
            </h2>
            <p style={{ margin: 0, maxWidth: 580, fontSize: 15, lineHeight: 1.65, color: INK, opacity: 0.75 }}>
              Les prix des formations + les aides les plus fréquentes (CAF nationale, CAF locale, Département, MSA, aides régionales).
            </p>
          </div>

          <div style={{ border: `2px solid ${INK}`, borderRadius: 16, background: VIOLET_SOFT, padding: "16px 20px", width: "100%", justifySelf: "stretch" }}>
            <p className="mura-mono" style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, color: VIOLET }}>
              Besoin d&apos;un coup de main ?
            </p>
            <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: INK }}>
              Nous vous aidons à repérer les aides possibles
            </p>
            <VioletBtn onClick={openContactWidget}>Nous contacter →</VioletBtn>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 40px" }} className="md:px-12">
        {/* Tarifs */}
        <SubSection kicker="Tarifs 2026" title="Tarifs des formations" flushTop>
          <div style={{ display: "grid", gap: 16 }} className="md:grid-cols-[1.1fr_0.9fr] md:items-start">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <PriceLine label="Formation Générale" value={`dès ${MIN_PRICE_AFTER_AIDS} € — tarif plein : 550 €`} />
              <PriceLine label="Étape 3 · Approfondissement" value={`dès ${MIN_PRICE_AFTER_AIDS} € — tarif plein : 450 €`} />
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: INK, opacity: 0.7 }}>
                Le tarif inclut la formation, l&apos;encadrement, l&apos;hébergement et les repas. Les détails précis sont indiqués au moment de l&apos;inscription.
              </p>
            </div>

            <div style={{ border: `2px solid ${INK}`, borderRadius: 18, background: PAPER, padding: "22px 20px", boxShadow: `4px 4px 0 ${YELLOW}` }}>
              <p className="mura-mono" style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, color: VIOLET }}>
                Aide nationale CAF
              </p>
              <p className="ed" style={{ margin: "0 0 8px", fontSize: 42, fontWeight: 700, color: INK, lineHeight: 1, fontStyle: "normal" }}>
                200 €
              </p>
              <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.65, color: INK, opacity: 0.75 }}>
                Une aide nationale CAF annoncée à <strong>200€</strong> pour passer le BAFA. Les conditions peuvent varier.
              </p>
              <VioletBtn href={cafNationalLink} external>Page CAF 200€ ↗</VioletBtn>
            </div>
          </div>
        </SubSection>

        {/* Cantal */}
        <SubSection kicker="Aides locales" title="Tu viens du Cantal ?">
          <p style={{ margin: "0 0 20px", fontSize: 14, lineHeight: 1.65, color: INK, opacity: 0.75 }}>
            En plus de l&apos;aide CAF nationale, tu peux souvent cumuler des aides locales (selon profil) : CAF du Cantal, Conseil départemental, MSA.
          </p>
          <div style={{ display: "grid", gap: 14 }} className="md:grid-cols-3">
            <div style={{ border: `2px solid ${INK}`, borderRadius: 18, background: PAPER, padding: "20px 18px" }}>
              <p className="mura-mono" style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, color: VIOLET }}>CAF du Cantal</p>
              <ul style={{ margin: "0 0 14px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                <li style={{ fontSize: 13, lineHeight: 1.6, color: INK, opacity: 0.8 }}>• Aide locale annoncée jusqu&apos;à <strong>400€</strong> (FG) et <strong>300€</strong> (étape 3 approfondissement), selon conditions.</li>
                <li style={{ fontSize: 13, lineHeight: 1.6, color: INK, opacity: 0.8 }}>• Les critères et la procédure peuvent varier : vérifier sur la page officielle.</li>
              </ul>
              <VioletBtn href={cantalCafLink} external>Voir l&apos;aide CAF ↗</VioletBtn>
            </div>

            <div style={{ border: `2px solid ${INK}`, borderRadius: 18, background: PAPER, padding: "20px 18px" }}>
              <p className="mura-mono" style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, color: VIOLET }}>Conseil départemental</p>
              <ul style={{ margin: "0 0 14px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                <li style={{ fontSize: 13, lineHeight: 1.6, color: INK, opacity: 0.8 }}>• <strong>16 à 25 ans</strong> et domicilié fiscalement dans le Cantal.</li>
                <li style={{ fontSize: 13, lineHeight: 1.6, color: INK, opacity: 0.8 }}>• Montant selon revenu fiscal : <strong>120€</strong>, <strong>100€</strong> ou <strong>80€</strong>.</li>
                <li style={{ fontSize: 13, lineHeight: 1.6, color: INK, opacity: 0.8 }}>• Versement <strong>à l&apos;issue</strong> de la formation avec pièces justificatives.</li>
              </ul>
              <VioletBtn href={cantalDeptPdf} external>Dossier (PDF) ↗</VioletBtn>
            </div>

            <div style={{ border: `2px solid ${INK}`, borderRadius: 18, background: PAPER, padding: "20px 18px" }}>
              <p className="mura-mono" style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, color: VIOLET }}>MSA Auvergne</p>
              <ul style={{ margin: "0 0 14px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                <li style={{ fontSize: 13, lineHeight: 1.6, color: INK, opacity: 0.8 }}>• Aide possible si tu dépends du régime MSA (assuré·e / ayant-droit).</li>
                <li style={{ fontSize: 13, lineHeight: 1.6, color: INK, opacity: 0.8 }}>• Montants sur dossier, dans la limite des frais réels / selon conditions.</li>
              </ul>
              <VioletBtn href={msaAuvergneLink} external>Voir MSA Auvergne ↗</VioletBtn>
            </div>
          </div>

          <div style={{ marginTop: 14, border: `1.5px solid ${INK}22`, borderRadius: 14, background: VIOLET_SOFT, padding: "16px 18px" }}>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: INK }}>
              <strong>Bon réflexe :</strong> ta commune, ta communauté de communes, la mission locale ou ton établissement peuvent aussi proposer des aides BAFA. Le plus simple : les contacter directement et demander {'"'}aide au financement BAFA{'"'}.
            </p>
          </div>
        </SubSection>

        {/* AURA */}
        <SubSection kicker="Auvergne-Rhône-Alpes" title="Aides par département (AURA)">
          <p style={{ margin: "0 0 20px", fontSize: 14, lineHeight: 1.65, color: INK, opacity: 0.75 }}>
            Plusieurs aides existent selon ton département : CAF, Département, MSA, dispositifs locaux. Ouvre ton département ci-dessous pour voir un résumé, puis la source officielle.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {auraDepts.map((d) => (
              <DeptAccordion key={d.name} name={d.name} lines={d.lines} sourceHref={acLyonAuraLink} />
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
            <VioletBtn href={acLyonAuraLink} external>Page complète AURA ↗</VioletBtn>
            <VioletBtn onClick={openContactWidget}>J&apos;ai besoin d&apos;un résumé →</VioletBtn>
          </div>
        </SubSection>

        {/* France entière */}
        <SubSection kicker="France entière" title="Et partout en France">
          <div style={{ display: "grid", gap: 20, alignItems: "start" }} className="md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: INK, opacity: 0.75 }}>
                Il existe souvent d&apos;autres aides : communes, intercos, missions locales, CE, associations, etc. Ça dépend énormément du territoire et parfois de l&apos;âge / quotient / régime CAF ou MSA.
              </p>
            </div>
            <div style={{ border: `2px solid ${INK}`, borderRadius: 18, background: PAPER, padding: "20px 18px", boxShadow: `4px 4px 0 ${VIOLET}` }}>
              <p className="mura-mono" style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, color: VIOLET }}>Nous te guidons vite</p>
              <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.65, color: INK, opacity: 0.8 }}>
                Envoie-nous ton département + ta situation (CAF/MSA, étudiant·e, etc.) : nous te disons où chercher en priorité.
              </p>
              <VioletBtn onClick={openContactWidget}>Ouvrir le contact →</VioletBtn>
            </div>
          </div>
        </SubSection>
      </div>

      {/* Formulaire estimation personnalisée */}
      <div style={{ borderTop: `1.5px solid ${INK}18`, background: PAPER }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }} className="md:px-12">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr] items-start">
            <div>
              <p className="mura-mono" style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2.5, color: VIOLET }}>
                Estimation personnalisée
              </p>
              <h3 className="ed" style={{ margin: "0 0 16px", fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 700, lineHeight: 1.1, color: INK, fontStyle: "normal" }}>
                Calculez votre reste à charge
              </h3>
              <p style={{ margin: "0 0 20px", fontSize: 14, lineHeight: 1.7, color: INK, opacity: 0.75 }}>
                Les tableaux ci-dessus donnent une vue d&apos;ensemble. Mais le montant réel dépend de votre situation précise. Laissez vos coordonnées — nous vous recontactons avec les aides disponibles pour vous.
              </p>
              {[
                "CAF nationale : 200 € (tous les stagiaires)",
                "CAF départementale : jusqu'à 400 € selon le QF",
                "Conseil Régional AURA : 80 – 120 €",
                "MSA, aides locales : selon éligibilité",
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8, fontSize: 13, color: INK, opacity: 0.75 }}>
                  <span style={{ marginTop: 2, flexShrink: 0, width: 18, height: 18, borderRadius: "50%", background: VIOLET, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: CREAM, fontWeight: 800 }}>✓</span>
                  {item}
                </div>
              ))}

            </div>
            <div style={{ background: CREAM, border: `2px solid ${INK}`, borderRadius: 20, padding: "28px 28px 24px", boxShadow: `4px 4px 0 ${INK}` }}>
              <p className="mura-mono" style={{ margin: "0 0 18px", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: VIOLET }}>
                Estimation gratuite
              </p>
              <AidesLeadForm source="Infos pratiques – Tarifs & aides" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
