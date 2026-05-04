// Direction B — "Affiche éducation populaire"
// Aesthetic: silkscreen-poster feel — risograph-style overprint, big editorial typography
// (serif italic + grotesk), grid-based but punctuated by large typographic statements.
// Uses violet primary on warm off-white, with ochre accent. Less stickers, more poster.

const B = {
  paper: "#f4ede0",        // warm off-white
  paperDeep: "#ebe1cf",
  ink: "#1c1a2e",
  violet: "#5b4fb8",
  violetDeep: "#3a2f8f",
  ochre: "#e89441",
  riso: "#dd5f3a",        // riso-overprint red-orange
  cream: "#fff9ec",
  green: "#3d7a5e",
};

const bFonts = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,800;1,9..144,400;1,9..144,600;1,9..144,800&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
.dirB, .dirB * { font-family: 'Space Grotesk', system-ui, sans-serif; box-sizing: border-box; }
.dirB .ed { font-family: 'Fraunces', Georgia, serif; }
.dirB .mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
`;

function BNav() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 56px", background: B.paper, borderBottom: `1px solid ${B.ink}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <MuraLogo color={B.violet} size={40} />
        <div style={{ lineHeight: 1 }}>
          <div className="mono" style={{ fontSize: 9, letterSpacing: 2, color: B.violet, fontWeight: 500 }}>FORMATIONS BAFA —</div>
          <div className="ed" style={{ fontSize: 24, fontWeight: 600, letterSpacing: -0.5, color: B.ink, marginTop: 2, fontStyle: "italic" }}>Murathènes</div>
        </div>
      </div>
      <nav style={{ display: "flex", gap: 32, fontSize: 13, fontWeight: 500, letterSpacing: 0.8, textTransform: "uppercase", color: B.ink }}>
        <span>Accueil</span>
        <span>Le BAFA</span>
        <span style={{ background: B.ink, color: B.paper, padding: "8px 14px", borderRadius: 4 }}>Formations 2026</span>
        <span>Infos pratiques ▾</span>
        <span>Qui sommes-nous ▾</span>
      </nav>
    </div>
  );
}

// Hero — typographic poster, photo on the side
function BHero() {
  return (
    <div style={{ background: B.paper, position: "relative", overflow: "hidden", borderBottom: `1px solid ${B.ink}` }}>
      {/* tiny meta strip */}
      <div className="mono" style={{ display: "flex", justifyContent: "space-between", padding: "12px 56px", fontSize: 11, color: B.ink, opacity: 0.6, borderBottom: `1px dashed ${B.ink}` }}>
        <span>N° 07 — PRINTEMPS / ÉTÉ 2026</span>
        <span>FORMATIONS BAFA EN AURA · DEPUIS 2019</span>
        <span>DOMAINE DE GRAVIÈRES · CANTAL</span>
      </div>

      <div style={{ padding: "60px 56px 80px", display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 56, alignItems: "center" }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: B.riso, letterSpacing: 2, marginBottom: 24 }}>
            ⟶ ÉDUCATION POPULAIRE · PÉDAGOGIE ÉMANCIPATRICE
          </div>
          <h1 style={{ margin: 0, fontSize: 156, fontWeight: 800, letterSpacing: -7, lineHeight: 0.85, color: B.ink }}>
            <span className="ed" style={{ fontStyle: "italic", fontWeight: 400, color: B.violet }}>Apprendre</span><br />
            à animer.<br />
            <span style={{ position: "relative", display: "inline-block" }}>
              <span style={{ color: B.riso }}>Apprendre</span>
              <Squiggle color={B.ochre} width={420} height={16} strokeWidth={5} />
            </span><br />
            <span className="ed" style={{ fontStyle: "italic", fontWeight: 400 }}>à émanciper.</span>
          </h1>
          <div style={{ marginTop: 40, display: "flex", alignItems: "center", gap: 24 }}>
            <button style={{ background: B.ink, color: B.paper, border: "none", borderRadius: 4, padding: "18px 28px", fontSize: 14, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10 }}>
              Voir les formations 2026 <span style={{ fontSize: 18 }}>↗</span>
            </button>
            <div className="mono" style={{ fontSize: 12, color: B.ink, opacity: 0.7, lineHeight: 1.4, maxWidth: 200 }}>
              3 sessions ouvertes · printemps, été, automne
            </div>
          </div>
        </div>

        <div style={{ position: "relative" }}>
          <div style={{ position: "relative", border: `1px solid ${B.ink}` }}>
            <PhotoPlaceholder label="Photo terrain — jeunes en cercle, Cantal" ratio="3/4" color={B.violet} />
            <div style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", background: `linear-gradient(to bottom, ${B.violet}33, ${B.riso}22)` }} />
          </div>
          {/* poster-style typographic stamp */}
          <div className="mono" style={{ position: "absolute", top: -14, left: -14, background: B.ochre, color: B.ink, padding: "8px 14px", fontSize: 11, fontWeight: 600, letterSpacing: 1.5, border: `1px solid ${B.ink}` }}>
            Nº 07 / 2026
          </div>
          <div style={{ position: "absolute", bottom: -20, right: -20, background: B.paper, border: `1px solid ${B.ink}`, padding: "16px 20px" }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: 1.5, color: B.ink, opacity: 0.6, marginBottom: 4 }}>PROCHAIN DÉPART</div>
            <div className="ed" style={{ fontSize: 32, fontWeight: 600, color: B.violet, lineHeight: 1, fontStyle: "italic" }}>26 juin</div>
          </div>
        </div>
      </div>

      {/* marquee strip */}
      <div style={{ background: B.ink, color: B.paper, padding: "16px 0", overflow: "hidden", borderTop: `1px solid ${B.ink}` }}>
        <div className="ed" style={{ display: "flex", gap: 40, fontSize: 28, fontStyle: "italic", whiteSpace: "nowrap", paddingLeft: 56 }}>
          <span>Formation Générale</span>
          <span style={{ color: B.ochre }}>✦</span>
          <span style={{ opacity: 0.5 }}>Approfondissement</span>
          <span style={{ color: B.ochre }}>✦</span>
          <span>Échanges de jeunes</span>
          <span style={{ color: B.ochre }}>✦</span>
          <span style={{ opacity: 0.5 }}>BAFA appro</span>
          <span style={{ color: B.ochre }}>✦</span>
          <span>Pédagogie émancipatrice</span>
          <span style={{ color: B.ochre }}>✦</span>
          <span style={{ opacity: 0.5 }}>Cantal · Lanobre</span>
        </div>
      </div>
    </div>
  );
}

// Calendar / sessions — editorial table-like layout
function BSessions() {
  const sessions = [
    { num: "01", tag: "FG", title: "Formation Générale", subtitle: "Session printemps", from: "15 avril", to: "22 avril 2026", price: "550 €", spots: 4, total: 16 },
    { num: "02", tag: "FG", title: "Formation Générale", subtitle: "Session été — la phare", from: "26 juin", to: "4 juillet 2026", price: "550 €", spots: 8, total: 16, featured: true },
    { num: "03", tag: "APPRO", title: "Séjour à l'étranger", subtitle: "Échange de jeunes", from: "28 juin", to: "4 juillet 2026", price: "450 €", spots: 6, total: 12 },
    { num: "04", tag: "FG", title: "Formation Générale", subtitle: "Toussaint", from: "24 oct.", to: "31 oct. 2026", price: "550 €", spots: 14, total: 16 },
  ];
  return (
    <div style={{ background: B.cream, padding: "100px 56px", borderBottom: `1px solid ${B.ink}` }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 64, marginBottom: 56, alignItems: "flex-end" }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: B.riso, letterSpacing: 2, marginBottom: 16 }}>§ 01 — CALENDRIER</div>
          <h2 className="ed" style={{ fontSize: 96, fontWeight: 600, lineHeight: 0.9, letterSpacing: -3, margin: 0, color: B.ink, fontStyle: "italic" }}>
            Quatre départs<br />en 2026.
          </h2>
        </div>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: B.ink, opacity: 0.75, margin: 0, maxWidth: 480, justifySelf: "end" }}>
          Sessions de Formation Générale et d'Approfondissement réparties sur l'année. Toutes en pension complète au domaine de Gravières, dans le Cantal. Inscription en ligne via formulaire sécurisé Yapla.
        </p>
      </div>

      {/* table-style list */}
      <div style={{ border: `1px solid ${B.ink}` }}>
        <div className="mono" style={{ display: "grid", gridTemplateColumns: "60px 100px 1.4fr 1fr 100px 140px 140px", padding: "14px 24px", fontSize: 10, letterSpacing: 1.5, color: B.ink, opacity: 0.6, borderBottom: `1px solid ${B.ink}`, background: B.paperDeep }}>
          <span>N°</span><span>TYPE</span><span>FORMATION</span><span>DATES</span><span>TARIF</span><span>PLACES</span><span></span>
        </div>
        {sessions.map((s, i) => (
          <div key={i} style={{
            display: "grid",
            gridTemplateColumns: "60px 100px 1.4fr 1fr 100px 140px 140px",
            padding: "28px 24px",
            alignItems: "center",
            borderBottom: i < sessions.length - 1 ? `1px solid ${B.ink}` : "none",
            background: s.featured ? B.violet : B.paper,
            color: s.featured ? B.cream : B.ink,
          }}>
            <span className="mono" style={{ fontSize: 14, fontWeight: 500, opacity: 0.7 }}>{s.num}</span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5 }}>
              <span style={{ background: s.featured ? B.ochre : B.ink, color: s.featured ? B.ink : B.paper, padding: "4px 10px", borderRadius: 2 }}>{s.tag}</span>
            </span>
            <div>
              <div className="ed" style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.8, lineHeight: 1.1, fontStyle: s.featured ? "italic" : "normal" }}>{s.title}</div>
              <div style={{ fontSize: 13, opacity: s.featured ? 0.85 : 0.6, marginTop: 4 }}>{s.subtitle}</div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 500 }}>
              <div className="ed" style={{ fontSize: 22, fontStyle: "italic" }}>{s.from}</div>
              <div className="mono" style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>→ {s.to}</div>
            </div>
            <div className="ed" style={{ fontSize: 26, fontWeight: 600, fontStyle: "italic" }}>{s.price}</div>
            <div>
              <div style={{ display: "flex", gap: 3, marginBottom: 6 }}>
                {Array.from({ length: s.total }).map((_, j) => (
                  <div key={j} style={{
                    width: 6, height: 14,
                    background: j < (s.total - s.spots) ? (s.featured ? B.cream : B.ink) : "transparent",
                    border: `1px solid ${s.featured ? B.cream : B.ink}`,
                  }} />
                ))}
              </div>
              <div className="mono" style={{ fontSize: 10, opacity: 0.7 }}>{s.spots} / {s.total} places</div>
            </div>
            <button style={{
              background: s.featured ? B.ochre : B.ink,
              color: s.featured ? B.ink : B.paper,
              border: "none",
              padding: "12px 16px",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: "uppercase",
              cursor: "pointer",
              borderRadius: 2,
              fontFamily: "inherit",
            }}>
              S'inscrire ↗
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Manifesto — big quoted statement, riso poster vibe
function BManifesto() {
  return (
    <div style={{ background: B.violet, color: B.cream, padding: "120px 56px", borderBottom: `1px solid ${B.ink}`, position: "relative", overflow: "hidden" }}>
      {/* big M watermark */}
      <div style={{ position: "absolute", right: -80, top: -40, opacity: 0.12 }}>
        <MuraLogo color={B.cream} size={520} />
      </div>

      <div style={{ position: "relative", maxWidth: 1100 }}>
        <div className="mono" style={{ fontSize: 11, color: B.ochre, letterSpacing: 2, marginBottom: 32 }}>§ 02 — NOTRE PARTI PRIS</div>
        <p className="ed" style={{ fontSize: 76, fontWeight: 400, lineHeight: 1.05, letterSpacing: -2, margin: 0, fontStyle: "italic" }}>
          "Murathènes défend des principes <span style={{ background: B.ochre, color: B.ink, padding: "0 12px", fontStyle: "normal", fontWeight: 600 }}>d'éducation populaire</span> à travers une pédagogie active et émancipatrice — animations, grands jeux, veillées, débats. Chaque temps est pensé pour favoriser <span style={{ textDecoration: "underline", textDecorationThickness: 4, textUnderlineOffset: 8, textDecorationColor: B.ochre }}>l'apprentissage par le faire</span>."
        </p>
        <div style={{ marginTop: 48, display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ width: 48, height: 1, background: B.cream, opacity: 0.5 }} />
          <span className="mono" style={{ fontSize: 12, letterSpacing: 1.5, opacity: 0.8 }}>L'ÉQUIPE PÉDAGOGIQUE — MURATHÈNES</span>
        </div>
      </div>
    </div>
  );
}

// Pédagogie blocks — flat columns, no nested cards
function BPedagogie() {
  const cols = [
    { num: "I.", icon: "flame", title: "On apprend en faisant.", text: "Pas de cours magistraux. Jeux de rôles, mises en situation, analyses de pratiques, supports vidéos, débats. Le terrain dès le premier jour." },
    { num: "II.", icon: "people", title: "Vie en collectivité.", text: "Pension complète, dortoirs, repas partagés, veillées. Le BAFA se vit autant qu'il s'apprend — c'est le cadre qui forme." },
    { num: "III.", icon: "heart", title: "Contenus diversifiés.", text: "Animation, vie quotidienne, mais aussi violences sexistes et sexuelles, neuroatypie, handicap, responsabilité civile et pénale, laïcité." },
    { num: "IV.", icon: "leaf", title: "Au cœur du Cantal.", text: "Domaine de Gravières, Lanobre. Forêts, lac, immersion nature totale — loin de tout sauf de l'essentiel : la formation." },
  ];
  return (
    <div style={{ background: B.paper, padding: "100px 56px", borderBottom: `1px solid ${B.ink}` }}>
      <div style={{ marginBottom: 64, maxWidth: 900 }}>
        <div className="mono" style={{ fontSize: 11, color: B.riso, letterSpacing: 2, marginBottom: 16 }}>§ 03 — LA PÉDAGOGIE</div>
        <h2 className="ed" style={{ fontSize: 76, fontWeight: 600, lineHeight: 0.95, letterSpacing: -2.5, margin: 0, color: B.ink }}>
          Quatre principes,<br />
          <span style={{ fontStyle: "italic", color: B.violet }}>une boussole.</span>
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, borderTop: `1px solid ${B.ink}`, borderBottom: `1px solid ${B.ink}` }}>
        {cols.map((c, i) => (
          <div key={i} style={{
            padding: "40px 28px",
            borderRight: i < cols.length - 1 ? `1px solid ${B.ink}` : "none",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span className="ed" style={{ fontSize: 56, fontWeight: 400, fontStyle: "italic", color: B.violet, lineHeight: 1 }}>{c.num}</span>
              <Picto kind={c.icon} size={28} color={B.ink} />
            </div>
            <h3 className="ed" style={{ fontSize: 32, fontWeight: 600, letterSpacing: -1, margin: 0, color: B.ink, lineHeight: 1.05 }}>{c.title}</h3>
            <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, color: B.ink, opacity: 0.75 }}>{c.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Témoignages — editorial pull-quotes
function BTestimonials() {
  return (
    <div style={{ background: B.paperDeep, padding: "120px 56px", borderBottom: `1px solid ${B.ink}` }}>
      <div className="mono" style={{ fontSize: 11, color: B.riso, letterSpacing: 2, marginBottom: 16 }}>§ 04 — VOIX D'ANCIEN·NES</div>
      <h2 className="ed" style={{ fontSize: 76, fontWeight: 600, lineHeight: 0.95, letterSpacing: -2.5, margin: 0, marginBottom: 64, color: B.ink }}>
        <span style={{ fontStyle: "italic" }}>240 personnes</span> sont passées par ici.
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 64, marginBottom: 64 }}>
        <div>
          <div className="ed" style={{ fontSize: 96, color: B.violet, lineHeight: 0.5, fontStyle: "italic" }}>"</div>
          <p className="ed" style={{ fontSize: 44, lineHeight: 1.15, fontWeight: 400, fontStyle: "italic", color: B.ink, margin: 0, marginTop: -20 }}>
            J'ai jamais autant ri ni autant appris en 8 jours. Le groupe, les formateurs, le lieu, tout colle. Je repars avec des potes pour la vie.
          </p>
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 32 }}>
            <PhotoPlaceholder label="" ratio="1/1" color={B.ochre} style={{ width: 56, height: 56, borderRadius: "50%", border: `1px solid ${B.ink}` }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: B.ink }}>Léa, 19 ans</div>
              <div className="mono" style={{ fontSize: 11, color: B.ink, opacity: 0.6, letterSpacing: 1 }}>BAFA GÉNÉRAL · ÉTÉ 2025</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <div style={{ borderLeft: `2px solid ${B.violet}`, paddingLeft: 24 }}>
            <p className="ed" style={{ fontSize: 22, lineHeight: 1.4, fontStyle: "italic", color: B.ink, margin: 0, marginBottom: 16 }}>
              L'appro échange de jeunes m'a fait passer un cap. Concrètement utile pour ma colo l'été d'après.
            </p>
            <div className="mono" style={{ fontSize: 11, letterSpacing: 1, color: B.ink, opacity: 0.6 }}>YANNIS, 22 ANS · BAFA APPRO 2024</div>
          </div>
          <div style={{ borderLeft: `2px solid ${B.ochre}`, paddingLeft: 24 }}>
            <p className="ed" style={{ fontSize: 22, lineHeight: 1.4, fontStyle: "italic", color: B.ink, margin: 0, marginBottom: 16 }}>
              Premier truc que je faisais loin de chez moi. Je flippais. Finalement, une des meilleures semaines de ma vie. Foncez.
            </p>
            <div className="mono" style={{ fontSize: 11, letterSpacing: 1, color: B.ink, opacity: 0.6 }}>CAMILLE, 17 ANS · BAFA GÉNÉRAL 2025</div>
          </div>
          <div style={{ borderLeft: `2px solid ${B.green}`, paddingLeft: 24 }}>
            <p className="ed" style={{ fontSize: 22, lineHeight: 1.4, fontStyle: "italic", color: B.ink, margin: 0, marginBottom: 16 }}>
              On a posé des questions auxquelles personne nous avait jamais répondu. Ça vaut bien plus que le diplôme.
            </p>
            <div className="mono" style={{ fontSize: 11, letterSpacing: 1, color: B.ink, opacity: 0.6 }}>SOFIANE, 18 ANS · BAFA GÉNÉRAL 2025</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// CTA — poster final
function BCTA() {
  return (
    <div style={{ background: B.ink, color: B.paper, padding: "120px 56px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "relative", zIndex: 1 }}>
        <div className="mono" style={{ fontSize: 11, color: B.ochre, letterSpacing: 2, marginBottom: 24 }}>§ FIN — INSCRIPTIONS OUVERTES</div>
        <h2 className="ed" style={{ fontSize: 200, fontWeight: 800, lineHeight: 0.85, letterSpacing: -8, margin: 0 }}>
          On t'attend<br />
          <span style={{ fontStyle: "italic", fontWeight: 400, color: B.ochre }}>en juin.</span>
        </h2>
        <div style={{ marginTop: 56, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <button style={{ background: B.ochre, color: B.ink, border: "none", borderRadius: 4, padding: "20px 32px", fontSize: 14, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}>
            Voir le calendrier 2026 ↗
          </button>
          <button style={{ background: "transparent", color: B.paper, border: `1.5px solid ${B.paper}`, borderRadius: 4, padding: "20px 32px", fontSize: 14, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}>
            Nous écrire
          </button>
          <span className="mono" style={{ fontSize: 12, opacity: 0.6, marginLeft: 12 }}>contact@murathenes.fr · 06 XX XX XX XX</span>
        </div>
      </div>
    </div>
  );
}

// FORMATION DETAIL PAGE — Direction B
function BFormationPage() {
  return (
    <div style={{ background: B.paper, color: B.ink }}>
      <BNav />

      {/* Breadcrumb meta */}
      <div className="mono" style={{ display: "flex", justifyContent: "space-between", padding: "12px 56px", fontSize: 11, color: B.ink, opacity: 0.6, borderBottom: `1px dashed ${B.ink}` }}>
        <span>← FORMATIONS / FORMATION GÉNÉRALE / FG ÉTÉ</span>
        <span>SESSION N° 02 / 2026</span>
      </div>

      {/* Hero */}
      <div style={{ padding: "72px 56px 96px", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 64, alignItems: "center", borderBottom: `1px solid ${B.ink}` }}>
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
            <span style={{ background: B.violet, color: B.paper, padding: "5px 12px", fontSize: 11, fontWeight: 600, letterSpacing: 1.5, borderRadius: 2 }}>FG GÉNÉRALE</span>
            <span style={{ background: B.ochre, color: B.ink, padding: "5px 12px", fontSize: 11, fontWeight: 600, letterSpacing: 1.5, borderRadius: 2 }}>SESSION ÉTÉ</span>
            <span className="mono" style={{ background: "transparent", border: `1px solid ${B.ink}`, color: B.ink, padding: "5px 12px", fontSize: 11, letterSpacing: 1.5, borderRadius: 2 }}>8 PLACES / 16</span>
          </div>
          <h1 className="ed" style={{ margin: 0, fontSize: 132, fontWeight: 600, letterSpacing: -5, lineHeight: 0.85, color: B.ink }}>
            <span style={{ fontStyle: "italic", color: B.violet }}>FG</span> Été<br />
            <span style={{ fontWeight: 400, fontStyle: "italic" }}>—</span> 2026.
          </h1>
          <div className="mono" style={{ marginTop: 32, fontSize: 14, color: B.ink, lineHeight: 1.8, display: "flex", flexDirection: "column", gap: 4 }}>
            <span><strong>DATES</strong> &nbsp;·&nbsp; 26 JUIN → 04 JUILLET 2026</span>
            <span><strong>LIEU</strong> &nbsp;·&nbsp; DOMAINE DE GRAVIÈRES, LANOBRE (CANTAL)</span>
            <span><strong>TARIF</strong> &nbsp;·&nbsp; 550 € · 2 OPTIONS TRANSPORT</span>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 40, flexWrap: "wrap" }}>
            <button style={{ background: B.ink, color: B.paper, border: "none", borderRadius: 4, padding: "18px 28px", fontSize: 14, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}>
              Je m'inscris (550 €) ↗
            </button>
            <button style={{ background: "transparent", color: B.ink, border: `1.5px solid ${B.ink}`, borderRadius: 4, padding: "18px 28px", fontSize: 14, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}>
              Découvrir le programme ↓
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "auto auto", gap: 12 }}>
          <div style={{ gridColumn: "1 / 3", border: `1px solid ${B.ink}`, position: "relative" }}>
            <PhotoPlaceholder label="Panneau Murathènes en bois" ratio="16/9" color="#8a6f4d" />
            <div style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", background: B.violet + "22" }} />
          </div>
          <div style={{ border: `1px solid ${B.ink}` }}>
            <PhotoPlaceholder label="atelier intérieur" ratio="1/1" color={B.riso} />
          </div>
          <div style={{ border: `1px solid ${B.ink}` }}>
            <PhotoPlaceholder label="groupe en extérieur" ratio="1/1" color={B.green} />
          </div>
        </div>
      </div>

      {/* Programme */}
      <div style={{ padding: "100px 56px", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 80, borderBottom: `1px solid ${B.ink}` }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: B.riso, letterSpacing: 2, marginBottom: 16 }}>§ A — LE CONTENU</div>
          <h2 className="ed" style={{ fontSize: 64, fontWeight: 600, letterSpacing: -2, lineHeight: 0.95, margin: 0, marginBottom: 12, color: B.ink }}>
            8 jours pour comprendre les rôles<br />
            <span style={{ fontStyle: "italic", color: B.violet }}>de l'animateur·rice.</span>
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: B.ink, opacity: 0.8, marginTop: 32 }}>
            Tout au long de la formation tu auras l'occasion de :
          </p>

          <ol style={{ listStyle: "none", padding: 0, margin: "32px 0 0", counterReset: "prog" }}>
            {[
              { title: "Découvrir le monde des ACM", text: "Séjours, centres de loisirs, mini-camps. Cadre légal, acteurs, débouchés." },
              { title: "Créer une animation de A à Z", text: "Veillée, grand jeu, atelier — imaginer, monter, animer en vrai." },
              { title: "Comprendre l'enfant", text: "Besoins par tranche d'âge, spécificités, handicap, neuroatypie." },
              { title: "Gérer un groupe", text: "Conflits, dynamique, posture d'adulte référent. Mises en situation." },
              { title: "Aborder les sujets difficiles", text: "Violences sexistes, laïcité, discrimination, responsabilité civile/pénale." },
            ].map((item, i) => (
              <li key={i} style={{
                counterIncrement: "prog",
                display: "grid",
                gridTemplateColumns: "60px 1fr",
                gap: 24,
                padding: "24px 0",
                borderBottom: `1px dashed ${B.ink}`,
              }}>
                <span className="ed" style={{ fontSize: 36, fontWeight: 400, fontStyle: "italic", color: B.violet, lineHeight: 1 }}>0{i + 1}.</span>
                <div>
                  <h4 className="ed" style={{ fontSize: 26, fontWeight: 600, margin: 0, marginBottom: 8, color: B.ink, letterSpacing: -0.5 }}>{item.title}</h4>
                  <p style={{ fontSize: 15, lineHeight: 1.55, margin: 0, color: B.ink, opacity: 0.75 }}>{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div style={{ position: "sticky", top: 24, alignSelf: "flex-start" }}>
          {/* Practical info — flat, label-driven, no nested cards */}
          <div className="mono" style={{ fontSize: 11, color: B.riso, letterSpacing: 2, marginBottom: 16 }}>§ B — INFOS PRATIQUES</div>
          <h3 className="ed" style={{ fontSize: 36, fontWeight: 600, letterSpacing: -1, margin: 0, marginBottom: 32, color: B.ink, fontStyle: "italic" }}>
            Immersion totale<br />en pension complète.
          </h3>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {[
              { k: "Durée", v: "8 jours · arrivée vendredi soir, départ samedi matin suivant" },
              { k: "Hébergement", v: "Internat, dortoirs avec sdb privative, pension complète" },
              { k: "Lieu", v: "Domaine de Gravières · Lanobre, Cantal · Auvergne" },
              { k: "Effectif", v: "16 stagiaires max · 3 formateur·rices permanent·es" },
              { k: "Transport", v: "2 options : depuis Lyon (40 €) ou Clermont-Ferrand (25 €)" },
              { k: "Inscription", v: "Formulaire sécurisé Yapla · convocation par mail" },
            ].map((row, i) => (
              <div key={row.k} style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 24, padding: "16px 0", borderBottom: `1px solid ${B.ink}` }}>
                <span className="mono" style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: B.ink, opacity: 0.6 }}>{row.k}</span>
                <span style={{ fontSize: 15, color: B.ink, lineHeight: 1.5 }}>{row.v}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 32, padding: 28, background: B.violet, color: B.cream }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: 1.5, opacity: 0.7, marginBottom: 8 }}>INSCRIPTION & CONVOCATION</div>
            <p style={{ fontSize: 14, lineHeight: 1.55, margin: 0, marginBottom: 20, opacity: 0.9 }}>
              L'inscription et le paiement se font via formulaire sécurisé Yapla. Une fois validée, tu reçois la convocation, les horaires précis et la liste à emporter par mail.
            </p>
            <button style={{ width: "100%", background: B.ochre, color: B.ink, border: "none", padding: "14px", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", borderRadius: 2 }}>
              Ouvrir le formulaire ↗
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DirectionBHome() {
  return (
    <>
      <style>{bFonts}</style>
      <div className="dirB" style={{ background: B.paper, color: B.ink, width: "100%" }}>
        <BNav />
        <BHero />
        <BSessions />
        <BManifesto />
        <BPedagogie />
        <BTestimonials />
        <BCTA />
      </div>
    </>
  );
}

function DirectionBFormation() {
  return (
    <>
      <style>{bFonts}</style>
      <div className="dirB" style={{ background: B.paper, color: B.ink, width: "100%" }}>
        <BFormationPage />
      </div>
    </>
  );
}

Object.assign(window, { DirectionBHome, DirectionBFormation });
