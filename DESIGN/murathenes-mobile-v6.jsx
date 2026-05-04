// Mobile (375px) versions of all Murathènes pages.
// Same DA as desktop V3 — Familjen Grotesk + Fraunces + Caveat, M palette.
// Touch-first: 16px min text, ≥44px hit targets, tab bar at bottom.

const MM = {
  paper: "#fff8ec",
  paperDeep: "#f4ede0",
  cream: "#fefcf5",
  ink: "#1a1530",
  inkSoft: "#3d3550",
  violet: "#6668C6",
  violetDeep: "#4a4ba8",
  violetSoft: "#e8e9f8",
  red: "#B13A4A",
  ochre: "#caa53d", // legacy name — now a deep gold (fits institutional feel)
  sage: "#7a8c5d", // muted sage as 3rd accent
  goldDeep: "#a8801a", // even deeper gold for type accents
  yellow: "#ffd23f",
  pink: "#ff6b9d",
  green: "#5fb56b",
  sky: "#5ba3d4",
};

// Mobile header — logo + burger (matches the repo)
function MobHeader({ bg = MM.paper }) {
  return (
    <div style={{ background: bg, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${MM.ink}33` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <MuraLogo color={MM.violet} size={32} />
        <div style={{ lineHeight: 1 }}>
          <div className="mono" style={{ fontSize: 9, letterSpacing: 1.5, color: MM.sky, fontWeight: 600 }}>FORMATIONS BAFA</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: MM.violet, marginTop: 2, textTransform: "uppercase", letterSpacing: -0.3 }}>Murathènes</div>
        </div>
      </div>
      <button style={{ width: 40, height: 40, borderRadius: 999, background: "rgba(255,255,255,0.7)", border: `1px solid ${MM.ink}33`, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, width: 16 }}>
          <span style={{ height: 2, background: MM.ink, borderRadius: 1 }} />
          <span style={{ height: 2, background: MM.ink, borderRadius: 1 }} />
          <span style={{ height: 2, background: MM.ink, borderRadius: 1 }} />
        </div>
      </button>
    </div>
  );
}

// Sticky bottom callback bar — fits in the iPhone safe area
function MobCallbackBar({ compact = false }) {
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: MM.violet, color: MM.cream, padding: compact ? "10px 12px 18px" : "12px 14px 22px", borderTop: `2px solid ${MM.ink}`, zIndex: 30 }}>
      <button style={{ width: "100%", background: MM.yellow, color: MM.ink, border: "none", borderRadius: 999, padding: "13px 16px", fontSize: 14, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <span>☎</span>
        <span>Soyez rappelé·e en 30 min</span>
        <span>→</span>
      </button>
      <div className="mono" style={{ fontSize: 9, opacity: 0.85, textAlign: "center", marginTop: 6, letterSpacing: 1 }}>
        GRATUIT · LUN–SAM 9H–19H
      </div>
    </div>
  );
}

// Floating callback button (FAB) — appears on long pages
function MobCallbackFAB() {
  return (
    <div style={{ position: "absolute", bottom: 90, right: 16, zIndex: 25 }}>
      <button style={{ width: 56, height: 56, borderRadius: "50%", background: MM.ochre, color: MM.ink, border: `2.5px solid ${MM.ink}`, boxShadow: `2px 2px 0 ${MM.ink}`, fontSize: 24, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        ☎
      </button>
    </div>
  );
}

// =============== HOME MOBILE ===============
function MobHome() {
  return (
    <div className="mura" style={{ background: MM.cream, color: MM.ink, minHeight: "100%", paddingBottom: 110, position: "relative" }}>
      <MobHeader />
      {/* Hero */}
      <div style={{ position: "relative", background: MM.ink, color: MM.cream, padding: "24px 18px 36px", overflow: "hidden", minHeight: 580 }}>
        {/* Vidéo hero mobile */}
        <video
          src="public/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(26,21,48,0.3) 0%, rgba(26,21,48,0.85) 100%)" }} />

        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-flex", background: MM.yellow, color: MM.ink, padding: "5px 12px", borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", border: `2px solid ${MM.ink}`, marginBottom: 100 }}>
            ✦ BAFA AURA · 2026
          </div>

          <div className="hand" style={{ fontSize: 26, color: MM.yellow, transform: "rotate(-1.5deg)", marginBottom: -6, marginLeft: 4 }}>passe votre</div>
          <h1 style={{ fontSize: 88, fontWeight: 700, letterSpacing: -4, lineHeight: 0.85, margin: 0, color: MM.cream }}>
            BAFA<br />
            <span className="ed" style={{ color: MM.ochre, fontStyle: "italic", fontWeight: 600 }}>cet été.</span>
          </h1>
          <p style={{ fontSize: 15, marginTop: 18, color: MM.cream, opacity: 0.9, lineHeight: 1.4 }}>
            Formations BAFA dans le Cantal au domaine de Gravières.
          </p>

          {/* Citation manifeste */}
          <div style={{ marginTop: 22, paddingLeft: 12, borderLeft: `3px solid ${MM.yellow}` }}>
            <p className="ed" style={{ fontSize: 16, fontStyle: "italic", lineHeight: 1.35, color: MM.cream, margin: 0, marginBottom: 6, fontWeight: 500 }}>
              "Créer des espaces de joie et de paix où chaque jeune existe, compte et est valorisé."
            </p>
            <div className="mono" style={{ fontSize: 9, color: MM.yellow, letterSpacing: 1.5, fontWeight: 700, textTransform: "uppercase", opacity: 0.9 }}>
              — Manifeste Murathènes
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 18, flexWrap: "wrap" }}>
            {[{ t: "Éducation populaire", c: MM.violet }, { t: "Vie en collectivité", c: MM.sky }].map((tag, i) => (
              <span key={i} style={{ background: tag.c, color: MM.cream, padding: "5px 11px", borderRadius: 999, fontSize: 11, fontWeight: 600, border: `1.5px solid ${MM.cream}`, transform: `rotate(${[-1, 1][i]}deg)` }}>
                {tag.t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Quick callback card */}
      <div style={{ padding: "18px 16px", background: MM.cream }}>
        <div style={{ background: MM.ink, color: MM.cream, borderRadius: 16, padding: 18, border: `2px solid ${MM.violet}`, boxShadow: `2px 2px 0 ${MM.violet}` }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: 1.5, color: MM.yellow, marginBottom: 6 }}>⚡ RAPPEL EN 30 MIN</div>
          <div className="ed" style={{ fontSize: 24, fontWeight: 600, fontStyle: "italic", lineHeight: 1.05, marginBottom: 14 }}>
            Une question ? On vous appelle.
          </div>
          <input placeholder="Votre numéro" style={{ width: "100%", background: "transparent", border: `1.5px solid ${MM.cream}33`, borderRadius: 8, padding: "12px 14px", color: MM.cream, fontSize: 15, fontFamily: "inherit", marginBottom: 10, boxSizing: "border-box" }} />
          <button style={{ width: "100%", background: MM.yellow, color: MM.ink, border: "none", borderRadius: 999, padding: "14px", fontSize: 14, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
            Demander un rappel →
          </button>
        </div>
      </div>

      {/* Calendrier */}
      <div style={{ padding: "32px 16px 24px", background: MM.cream }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: 2, color: MM.red, fontWeight: 700, marginBottom: 10 }}>📅 CALENDRIER 2026</div>
        <h2 style={{ fontSize: 44, fontWeight: 700, letterSpacing: -2, lineHeight: 0.95, margin: 0, marginBottom: 20 }}>
          On part <span className="ed" style={{ fontStyle: "italic", color: MM.violet }}>quand ?</span>
        </h2>
        <div className="hand" style={{ fontSize: 18, color: MM.ink, opacity: 0.7, marginBottom: 20, transform: "rotate(-1deg)" }}>réservez vite ↓</div>

        {[
          { tag: "FG", title: "Formation Générale", from: "05–12 avril", year: "2026", price: 500, was: 550, color: MM.sky },
          { tag: "FG", title: "Formation Générale", from: "26 juin → 4 juil.", year: "2026", price: 550, color: MM.violet, featured: true },
          { tag: "APPRO", title: "Séjour à l'étranger", from: "28 juin → 4 juil.", year: "2026", price: 450, color: MM.ochre },
        ].map((s, i) => (
          <div key={i} style={{
            background: s.featured ? MM.violet : MM.paper,
            color: s.featured ? MM.cream : MM.ink,
            border: `2px solid ${MM.ink}`,
            borderRadius: 18,
            padding: 18,
            boxShadow: s.featured ? `5px 5px 0 ${MM.ochre}` : `4px 4px 0 ${MM.ink}`,
            marginBottom: 14,
          }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ background: s.featured ? MM.yellow : s.color, color: s.featured ? MM.ink : MM.cream, padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: 1.2 }}>{s.tag}</span>
              {s.featured && <span style={{ background: MM.ochre, color: MM.ink, padding: "2px 8px", borderRadius: 4, fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>POPULAIRE</span>}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1, lineHeight: 1, marginBottom: 4 }}>{s.from}</div>
            <h3 className="ed" style={{ fontSize: 18, fontWeight: 600, fontStyle: "italic", margin: 0, marginBottom: 14, lineHeight: 1.2 }}>{s.title}</h3>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div>
                {s.was && <span style={{ fontSize: 13, opacity: 0.6, textDecoration: "line-through", marginRight: 6 }}>{s.was} €</span>}
                <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>{s.price} €</span>
              </div>
              <button style={{ background: s.featured ? MM.yellow : MM.ink, color: s.featured ? MM.ink : MM.cream, border: "none", borderRadius: 999, padding: "10px 16px", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", minHeight: 44 }}>
                Détails →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pédagogie en accordéon stack */}
      <div style={{ background: MM.violetSoft, padding: "32px 16px", borderTop: `1.5px solid ${MM.ink}` }}>
        <div className="mono" style={{ fontSize: 10, color: MM.violet, letterSpacing: 2, fontWeight: 700, marginBottom: 10 }}>§ LA PÉDAGOGIE</div>
        <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1, margin: 0, marginBottom: 24 }}>
          Une pédagogie <span className="ed" style={{ fontStyle: "italic", color: MM.violet }}>émancipatrice</span>.
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { color: MM.violet, icon: "flame", title: "On apprend en faisant.", text: "Pas de cours magistraux. Mises en situation, débats, terrain dès le 1er jour." },
            { color: MM.ochre, icon: "people", title: "Vie en collectivité 24/7.", text: "Pension complète, repas partagés, veillées. Le BAFA se vit autant qu'il s'apprend." },
            { color: MM.red, icon: "heart", title: "Pédagogie émancipatrice.", text: "Animation, vie quotidienne, mais aussi violences sexistes, neuroatypie, handicap." },
            { color: MM.green, icon: "leaf", title: "Au cœur du Cantal.", text: "Domaine de Gravières, Lanobre. Forêts, lac, immersion totale." },
          ].map((v, i) => (
            <div key={i} style={{ background: MM.paper, border: `1.5px solid ${MM.ink}`, borderRadius: 14, padding: 16, display: "flex", gap: 14 }}>
              <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 12, background: v.color, color: MM.cream, display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${MM.ink}`, transform: "rotate(-1.5deg)" }}>
                <Picto kind={v.icon} size={22} color={MM.cream} />
              </div>
              <div>
                <div className="ed" style={{ fontSize: 18, fontWeight: 600, fontStyle: "italic", letterSpacing: -0.3, lineHeight: 1.15, color: MM.ink, marginBottom: 4 }}>{v.title}</div>
                <div style={{ fontSize: 13, lineHeight: 1.5, color: MM.ink, opacity: 0.78 }}>{v.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA final */}
      <div style={{ background: MM.ochre, padding: "36px 16px", borderTop: `2px solid ${MM.ink}` }}>
        <div className="hand" style={{ fontSize: 22, color: MM.ink, marginBottom: -4 }}>alors,</div>
        <h2 style={{ fontSize: 56, fontWeight: 700, letterSpacing: -2.5, lineHeight: 0.9, margin: 0, color: MM.ink, marginBottom: 24 }}>
          On se voit<br />en juin ?
        </h2>
        <button style={{ width: "100%", background: MM.ink, color: MM.cream, border: "none", borderRadius: 999, padding: "16px", fontSize: 14, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", marginBottom: 10 }}>
          Voir le calendrier complet →
        </button>
      </div>

      <MobCallbackFAB />
      <MobCallbackBar />
    </div>
  );
}

// =============== BAFA MOBILE ===============
function MobBafa() {
  return (
    <div className="mura" style={{ background: MM.cream, color: MM.ink, minHeight: "100%", paddingBottom: 110, position: "relative" }}>
      <MobHeader />

      {/* Hero */}
      <div style={{ position: "relative", background: MM.ink, color: MM.cream, padding: "24px 18px 32px", overflow: "hidden", minHeight: 360 }}>
        <Photo src="public/photos/fg-04.png" alt="BAFA Murathenes" ratio="auto" style={{ position: "absolute", inset: 0, height: "100%", aspectRatio: "auto" }} objectPosition="center 30%" />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(26,21,48,0.4), rgba(26,21,48,0.88))" }} />
        <div style={{ position: "relative" }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: 2, color: MM.yellow, marginBottom: 14 }}>§ LE BAFA, C'EST QUOI ?</div>
          <h1 style={{ fontSize: 60, fontWeight: 700, letterSpacing: -2.5, lineHeight: 0.9, margin: 0 }}>
            Votre premier pas dans <span className="ed" style={{ fontStyle: "italic", color: MM.ochre }}>l'animation.</span>
          </h1>
          <p style={{ fontSize: 14, marginTop: 18, opacity: 0.9, lineHeight: 1.5 }}>
            Le Brevet d'Aptitude aux Fonctions d'Animateur·ice. Pour encadrer enfants et ados en colos, centres de loisirs.
          </p>
        </div>
      </div>

      {/* En quelques mots */}
      <div style={{ padding: "32px 16px", background: MM.cream }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: 2, color: MM.red, fontWeight: 700, marginBottom: 10 }}>§ EN QUELQUES MOTS</div>
        <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1, margin: 0, marginBottom: 16 }}>
          Pour <span className="ed" style={{ fontStyle: "italic", color: MM.violet }}>encadrer</span> enfants et ados.
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.6, opacity: 0.85, marginBottom: 14 }}>
          Avec le BAFA, vous donnez vie au collectif : vous construisez des projets <strong>avec</strong> et <strong>pour</strong> les jeunes.
        </p>
        <p style={{ fontSize: 15, lineHeight: 1.6, opacity: 0.85, marginBottom: 18 }}>
          C'est aussi le travail en équipe, la vie en collectivité et la gestion de groupe.
        </p>
        <div style={{ background: MM.yellow, padding: "12px 16px", borderRadius: 999, border: `2px solid ${MM.ink}`, display: "inline-flex", alignItems: "center", gap: 10, transform: "rotate(-1deg)" }}>
          <span style={{ fontSize: 18 }}>🎓</span>
          <span style={{ fontSize: 13, fontWeight: 700 }}>Inscription dès 16 ans révolus.</span>
        </div>
      </div>

      {/* Photo grid */}
      <div style={{ padding: "0 16px 32px", background: MM.cream }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div style={{ gridColumn: "1 / 3", border: `2px solid ${MM.ink}`, borderRadius: 14, overflow: "hidden", boxShadow: `2px 2px 0 ${MM.violet}` }}>
            <Photo src="public/photos/fg-05.png" alt="Domaine" ratio="16/9" />
          </div>
          <div style={{ border: `2px solid ${MM.ink}`, borderRadius: 14, overflow: "hidden", transform: "rotate(-1deg)" }}><Photo src="public/photos/fg-02.png" alt="journaling" ratio="1/1" /></div>
          <div style={{ border: `2px solid ${MM.ink}`, borderRadius: 14, overflow: "hidden", transform: "rotate(1deg)" }}><Photo src="public/photos/fg-06.png" alt="grand jeu" ratio="1/1" /></div>
        </div>
      </div>

      {/* 3 étapes */}
      <div style={{ background: MM.violetSoft, padding: "32px 16px", borderTop: `1.5px solid ${MM.ink}` }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: 2, color: MM.violet, fontWeight: 700, marginBottom: 10 }}>§ LES 3 ÉTAPES</div>
        <h2 style={{ fontSize: 38, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1, margin: 0, marginBottom: 24 }}>
          Étape <span className="ed" style={{ fontStyle: "italic", color: MM.violet }}>par étape.</span>
        </h2>
        {[
          { num: "01", color: MM.sky, title: "Formation Générale", duration: "9 jours", text: "Bases du métier d'animateur·ice. Posture, gestion de groupe, animations.", progress: "33%" },
          { num: "02", color: MM.green, title: "Stage pratique", duration: "14 jours", text: "Sur le terrain. Centre de loisirs, séjour, périscolaire — accompagné·e par notre réseau." },
          { num: "03", color: MM.ochre, title: "Approfondissement", duration: "8 jours", text: "Dernière semaine pour valider votre BAFA. Approfondissement d'une thématique." },
        ].map((s, i) => (
          <div key={i} style={{ background: MM.paper, border: `1.5px solid ${MM.ink}`, borderRadius: 18, padding: 18, marginBottom: 12, boxShadow: `2px 2px 0 ${MM.ink}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.color, color: MM.cream, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, border: `1.5px solid ${MM.ink}`, flexShrink: 0 }}>{s.num}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 className="ed" style={{ fontSize: 22, fontWeight: 600, fontStyle: "italic", margin: 0, letterSpacing: -0.5, lineHeight: 1.1 }}>{s.title}</h3>
                <div className="mono" style={{ fontSize: 10, opacity: 0.6, letterSpacing: 1, marginTop: 2 }}>{s.duration}</div>
              </div>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.55, margin: 0, opacity: 0.8, marginBottom: 12 }}>{s.text}</p>
          </div>
        ))}
      </div>

      <MobCallbackFAB />
      <MobCallbackBar />
    </div>
  );
}

// =============== FORMATION FG MOBILE ===============
function MobFormationFG() {
  return (
    <div className="mura" style={{ background: MM.cream, color: MM.ink, minHeight: "100%", paddingBottom: 110, position: "relative" }}>
      <MobHeader />
      <div className="mono" style={{ display: "flex", justifyContent: "space-between", padding: "8px 16px", fontSize: 9, color: MM.ink, opacity: 0.6, borderBottom: `1px dashed ${MM.ink}`, background: MM.paper }}>
        <span>← FORMATIONS</span>
        <span>SESSION 02 · 8/16 PLACES</span>
      </div>

      {/* Hero violet */}
      <div style={{ background: MM.violet, color: MM.cream, padding: "24px 18px 28px", borderBottom: `2px solid ${MM.ink}` }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          <span style={{ background: MM.cream, color: MM.ink, padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: 1.2, border: `1.5px solid ${MM.ink}` }}>FORMATION GÉNÉRALE</span>
          <span style={{ background: MM.yellow, color: MM.ink, padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: 1.2, border: `1.5px solid ${MM.ink}` }}>SESSION ÉTÉ</span>
        </div>
        <div className="hand" style={{ fontSize: 28, color: MM.yellow, marginBottom: -8 }}>du</div>
        <h1 style={{ fontSize: 60, fontWeight: 700, letterSpacing: -2.5, lineHeight: 0.9, margin: 0 }}>
          26 juin<br />
          <span className="ed" style={{ fontStyle: "italic", fontSize: 36 }}>au 4 juillet</span><br />
          2026
        </h1>
        <div style={{ marginTop: 20, padding: 14, background: MM.ink, color: MM.cream, borderRadius: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="mono" style={{ fontSize: 9, color: MM.yellow, letterSpacing: 1.5, marginBottom: 2 }}>TARIF</div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1 }}>550 €</div>
          </div>
          <button style={{ background: MM.ochre, color: MM.ink, border: `2px solid ${MM.cream}`, borderRadius: 999, padding: "12px 18px", fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
            Je m'inscris →
          </button>
        </div>
      </div>

      {/* Photo collage */}
      <div style={{ padding: "20px 16px 0", background: MM.cream }}>
        <div style={{ position: "relative", marginBottom: 28 }}>
          <div style={{ border: `3px solid ${MM.ink}`, borderRadius: 8, boxShadow: `2px 2px 0 ${MM.ink}`, transform: "rotate(1deg)", overflow: "hidden" }}>
            <PhotoPlaceholder label="Panneau Murathènes" ratio="4/3" color="#8a6f4d" />
          </div>
          <div style={{ position: "absolute", bottom: -20, right: -8, width: 100, transform: "rotate(-4deg)", border: `2px solid ${MM.ink}`, borderRadius: 6, boxShadow: `2px 2px 0 ${MM.ink}`, overflow: "hidden" }}>
            <PhotoPlaceholder label="atelier" ratio="1/1" color={MM.red} />
          </div>
        </div>
      </div>

      {/* Contenu en 5 étapes */}
      <div style={{ padding: "20px 16px 32px", background: MM.cream }}>
        <div className="mono" style={{ fontSize: 10, color: MM.red, letterSpacing: 2, fontWeight: 700, marginBottom: 10 }}>§ LE CONTENU</div>
        <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1, margin: 0, marginBottom: 8 }}>
          8 jours pour devenir <span className="ed" style={{ fontStyle: "italic", color: MM.ochre }}>animateur·rice.</span>
        </h2>
        <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.85, marginBottom: 20 }}>Tout au long, vous aurez l'occasion de :</p>
        <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {[
            { title: "Découvrir le monde des ACM", text: "Séjours, centres de loisirs. Cadre légal et débouchés." },
            { title: "Créer une animation de A à Z", text: "Veillée, grand jeu — imaginer, monter, animer en vrai." },
            { title: "Comprendre l'enfant", text: "Besoins par tranche d'âge, handicap, neuroatypie." },
            { title: "Gérer un groupe", text: "Conflits, dynamique, posture d'adulte référent." },
            { title: "Aborder les sujets difficiles", text: "Violences sexistes, laïcité, responsabilité légale." },
          ].map((item, i) => (
            <li key={i} style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 14, padding: "16px 0", borderBottom: i < 4 ? `1px dashed ${MM.ink}` : "none" }}>
              <span className="ed" style={{ fontSize: 28, fontWeight: 400, fontStyle: "italic", color: MM.violet, lineHeight: 1 }}>0{i + 1}.</span>
              <div>
                <h4 className="ed" style={{ fontSize: 19, fontWeight: 600, margin: 0, marginBottom: 4, letterSpacing: -0.3, lineHeight: 1.15 }}>{item.title}</h4>
                <p style={{ fontSize: 13, lineHeight: 1.55, margin: 0, opacity: 0.78 }}>{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Practical box */}
      <div style={{ padding: "0 16px 32px", background: MM.cream }}>
        <div style={{ background: MM.yellow, padding: 22, borderRadius: 18, border: `2px solid ${MM.ink}`, boxShadow: `3px 3px 0 ${MM.ink}` }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: 2, fontWeight: 700, color: MM.ink, marginBottom: 14 }}>📋 EN PRATIQUE</div>
          {[
            { k: "Durée", v: "8 jours · ven. soir → sam." },
            { k: "Hébergement", v: "Internat pension complète" },
            { k: "Lieu", v: "Domaine de Gravières · Lanobre, Cantal" },
            { k: "Effectif", v: "16 stagiaires · 8 places restantes" },
          ].map((row) => (
            <div key={row.k} style={{ borderBottom: `1.5px dashed ${MM.ink}`, paddingBottom: 10, marginBottom: 10 }}>
              <div className="mono" style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: MM.ink, opacity: 0.6, marginBottom: 3 }}>{row.k}</div>
              <div style={{ fontSize: 13, color: MM.ink, lineHeight: 1.4 }}>{row.v}</div>
            </div>
          ))}
          <button style={{ width: "100%", marginTop: 14, background: MM.ink, color: MM.cream, border: "none", borderRadius: 999, padding: "14px", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
            Ouvrir le formulaire ↗
          </button>
        </div>
      </div>

      <MobCallbackFAB />
      <MobCallbackBar />
    </div>
  );
}

// =============== FORMATION APPRO MOBILE ===============
function MobFormationAppro() {
  return (
    <div className="mura" style={{ background: MM.cream, color: MM.ink, minHeight: "100%", paddingBottom: 110, position: "relative" }}>
      <MobHeader />
      <div className="mono" style={{ display: "flex", justifyContent: "space-between", padding: "8px 16px", fontSize: 9, color: MM.ink, opacity: 0.6, borderBottom: `1px dashed ${MM.ink}`, background: MM.paper }}>
        <span>← FORMATIONS</span>
        <span>SESSION 03 · 6/12 PLACES</span>
      </div>

      {/* Hero ochre */}
      <div style={{ background: MM.ochre, color: MM.ink, padding: "24px 18px 28px", borderBottom: `2px solid ${MM.ink}`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, opacity: 0.18 }}>
          <Picto kind="globe" size={140} color={MM.ink} />
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
            <span style={{ background: MM.violet, color: MM.cream, padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: 1.2, border: `1.5px solid ${MM.ink}` }}>APPROFONDISSEMENT</span>
            <span style={{ background: MM.cream, color: MM.ink, padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: 1.2, border: `1.5px solid ${MM.ink}` }}>SÉJOUR ÉTRANGER</span>
          </div>
          <div className="hand" style={{ fontSize: 28, color: MM.red, marginBottom: -8, transform: "rotate(-1deg)" }}>direction</div>
          <h1 style={{ fontSize: 60, fontWeight: 700, letterSpacing: -2.5, lineHeight: 0.88, margin: 0 }}>
            28 juin<br />
            <span className="ed" style={{ fontStyle: "italic", fontSize: 36 }}>au 4 juillet</span><br />
            2026
          </h1>
          <p style={{ fontSize: 14, marginTop: 18, lineHeight: 1.5, opacity: 0.9 }}>
            6 jours pour les futur·es animateur·rices qui veulent encadrer des séjours à l'étranger et des échanges interculturels.
          </p>
          <div style={{ marginTop: 18, padding: 12, background: MM.ink, color: MM.cream, borderRadius: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div className="mono" style={{ fontSize: 9, color: MM.ochre, letterSpacing: 1.5, marginBottom: 2 }}>TARIF</div>
              <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -1 }}>450 €</div>
            </div>
            <button style={{ background: MM.yellow, color: MM.ink, border: "none", borderRadius: 999, padding: "12px 18px", fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
              Je m'inscris →
            </button>
          </div>
        </div>
      </div>

      {/* Pré-requis */}
      <div style={{ background: MM.ink, color: MM.cream, padding: "18px 16px" }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: 2, color: MM.yellow, fontWeight: 700, marginBottom: 6 }}>§ PRÉ-REQUIS</div>
        <div style={{ fontSize: 14, lineHeight: 1.5 }}>
          Vous devez avoir validé votre <strong style={{ color: MM.ochre }}>formation générale</strong> + un <strong style={{ color: MM.ochre }}>stage pratique de 14 jours</strong>.
        </div>
      </div>

      {/* Passport card */}
      <div style={{ padding: "24px 16px 0", background: MM.cream }}>
        <div style={{ background: MM.cream, padding: 12, borderRadius: 12, border: `2.5px dashed ${MM.ink}`, boxShadow: `3px 3px 0 ${MM.ink}` }}>
          <div className="mono" style={{ fontSize: 9, color: MM.ink, opacity: 0.6, letterSpacing: 1.2, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
            <span>★ PASSEPORT MURATHÈNES</span>
            <span>FR · 2026</span>
          </div>
          <Photo src="public/photos/fg-01.png" alt="Atelier scénette" ratio="4/3" />
          <div style={{ marginTop: 8, padding: 10, background: MM.paper, borderRadius: 6, border: `1px solid ${MM.ink}` }}>
            <div className="hand" style={{ fontSize: 18, color: MM.violet, lineHeight: 1, transform: "rotate(-1deg)" }}>destination : ailleurs</div>
            <div className="mono" style={{ fontSize: 8, color: MM.ink, opacity: 0.6, letterSpacing: 1, marginTop: 4 }}>★★★ INTERCULTURALITÉ · MOBILITÉ ★★★</div>
          </div>
        </div>
      </div>

      {/* Bloc A : Affiner posture */}
      <div style={{ padding: "32px 16px 16px", background: MM.cream }}>
        <div className="mono" style={{ fontSize: 10, color: MM.red, letterSpacing: 2, fontWeight: 700, marginBottom: 10 }}>§ LE CONTENU</div>
        <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1, margin: 0, marginBottom: 18 }}>
          Deux faces, <span className="ed" style={{ fontStyle: "italic", color: MM.ochre }}>une formation.</span>
        </h2>

        <div style={{ background: MM.paper, border: `2px solid ${MM.ink}`, borderRadius: 18, padding: 18, marginBottom: 14, boxShadow: `2px 2px 0 ${MM.violet}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: MM.violet, color: MM.cream, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, border: `1.5px solid ${MM.ink}` }}>A</div>
            <h3 className="ed" style={{ fontSize: 20, fontWeight: 600, fontStyle: "italic", margin: 0, letterSpacing: -0.5, lineHeight: 1.1 }}>Affiner votre posture</h3>
          </div>
          <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 12, lineHeight: 1.5 }}>Approfondir les acquis de la FG.</p>
          {[
            { t: "Expérimenter & analyser", d: "Grands jeux, veillées, projets collectifs." },
            { t: "Échanger", d: "Partage d'expériences entre stagiaires." },
            { t: "Approfondir & questionner", d: "Gestion de groupe, sensibiliser, prévenir." },
          ].map((it, i) => (
            <div key={i} style={{ background: MM.cream, padding: 12, borderRadius: 10, border: `1px solid ${MM.ink}`, marginBottom: 8 }}>
              <div className="mono" style={{ fontSize: 9, color: MM.violet, fontWeight: 700, letterSpacing: 1.2, marginBottom: 3 }}>0{i + 1}.</div>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{it.t}</div>
              <div style={{ fontSize: 12, opacity: 0.75, lineHeight: 1.45 }}>{it.d}</div>
            </div>
          ))}
        </div>

        <div style={{ background: MM.paper, border: `2px solid ${MM.ink}`, borderRadius: 18, padding: 18, boxShadow: `2px 2px 0 ${MM.ochre}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: MM.ochre, color: MM.ink, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, border: `1.5px solid ${MM.ink}` }}>B</div>
            <h3 className="ed" style={{ fontSize: 20, fontWeight: 600, fontStyle: "italic", margin: 0, letterSpacing: -0.5, lineHeight: 1.1 }}>Séjour à l'étranger</h3>
          </div>
          <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 12, lineHeight: 1.5 }}>Spécialisation interculturelle.</p>
          {[
            { t: "Gestion logistique", d: "Transports, réglementation, hébergement, budget." },
            { t: "Activités spécifiques", d: "Multilingues, multiculturelles, peu de matériel." },
            { t: "Publics & partenaires", d: "Ados France/Europe, partenaires monde entier." },
            { t: "Immersion pratique", d: "Menus, animations type séjour, intervenants." },
          ].map((it, i) => (
            <div key={i} style={{ background: MM.cream, padding: 12, borderRadius: 10, border: `1px solid ${MM.ink}`, marginBottom: 8 }}>
              <div className="mono" style={{ fontSize: 9, color: MM.ochre, fontWeight: 700, letterSpacing: 1.2, marginBottom: 3 }}>0{i + 1}.</div>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{it.t}</div>
              <div style={{ fontSize: 12, opacity: 0.75, lineHeight: 1.45 }}>{it.d}</div>
            </div>
          ))}
        </div>
      </div>

      <MobCallbackFAB />
      <MobCallbackBar />
    </div>
  );
}

// =============== INFOS PRATIQUES MOBILE ===============
function MobInfos() {
  const tabs = [
    { key: "programme", label: "Programme", emoji: "📚", active: true },
    { key: "inscription", label: "Inscription", emoji: "✅" },
    { key: "tarifs", label: "Tarifs", emoji: "💶" },
    { key: "lieu", label: "Lieu", emoji: "📍" },
    { key: "infopack", label: "Guide", emoji: "📦" },
  ];
  return (
    <div className="mura" style={{ background: MM.cream, color: MM.ink, minHeight: "100%", paddingBottom: 110, position: "relative" }}>
      <MobHeader />

      <div style={{ position: "relative", background: MM.ink, color: MM.cream, padding: "24px 18px 28px", overflow: "hidden", minHeight: 280 }}>
        <Photo src="public/photos/fg-05.png" alt="Domaine de Gravieres" ratio="auto" style={{ position: "absolute", inset: 0, height: "100%", aspectRatio: "auto" }} objectPosition="center 50%" />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(26,21,48,0.4), rgba(26,21,48,0.88))" }} />
        <div style={{ position: "relative" }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: 2, color: MM.yellow, marginBottom: 14 }}>§ INFOS PRATIQUES</div>
          <h1 style={{ fontSize: 56, fontWeight: 700, letterSpacing: -2.5, lineHeight: 0.9, margin: 0 }}>
            Tout ce qu'il faut <span className="ed" style={{ fontStyle: "italic", color: MM.ochre }}>savoir.</span>
          </h1>
          <p style={{ fontSize: 14, marginTop: 14, opacity: 0.9, lineHeight: 1.5 }}>
            Programme, inscription, tarifs, transport, guide d'arrivée.
          </p>
        </div>
      </div>

      {/* Onglets scrollables */}
      <div style={{ background: MM.cream, padding: "12px 16px", borderBottom: `1.5px solid ${MM.ink}33`, overflowX: "auto", whiteSpace: "nowrap", display: "flex", gap: 6 }}>
        {tabs.map((t) => (
          <button key={t.key} style={{
            background: t.active ? MM.violet : "transparent",
            color: t.active ? MM.cream : MM.ink,
            border: t.active ? "none" : `1.5px solid ${MM.ink}33`,
            padding: "10px 14px",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase",
            cursor: "pointer",
            fontFamily: "inherit",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
            minHeight: 40,
          }}>
            <span style={{ fontSize: 13 }}>{t.emoji}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Programme */}
      <div style={{ padding: "24px 16px", background: MM.cream }}>
        <div className="mono" style={{ fontSize: 10, color: MM.red, fontWeight: 700, letterSpacing: 2, marginBottom: 10 }}>📚 PROGRAMME</div>
        <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: -1.2, lineHeight: 1, margin: 0, marginBottom: 24 }}>
          8 jours pour comprendre les <span className="ed" style={{ fontStyle: "italic", color: MM.violet }}>rôles</span>.
        </h2>
        {[
          { day: "J1", title: "Arrivée & accueil", text: "Vendredi soir. Présentation du lieu, du groupe, jeu d'inter-connaissance." },
          { day: "J2-J3", title: "Le monde des ACM", text: "Découvrir séjours, centres de loisirs, mini-camps. Cadre légal, posture." },
          { day: "J4-J5", title: "Animer concrètement", text: "Veillée, grand jeu, atelier — imaginer, monter, animer en vrai." },
          { day: "J6", title: "Comprendre l'enfant", text: "Tranches d'âge, besoins, neuroatypies, handicap." },
          { day: "J7", title: "Sujets sensibles", text: "Violences sexistes, laïcité, responsabilité civile et pénale." },
          { day: "J8", title: "Bilan & projet", text: "Retours sur la semaine, réseau Murathènes pour la suite." },
        ].map((d, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 14, padding: "16px 0", borderBottom: i < 5 ? `1px dashed ${MM.ink}` : "none" }}>
            <div className="ed" style={{ fontSize: 24, fontWeight: 600, fontStyle: "italic", color: MM.violet, lineHeight: 1 }}>{d.day}</div>
            <div>
              <h4 className="ed" style={{ fontSize: 18, fontWeight: 600, margin: 0, marginBottom: 4, letterSpacing: -0.3, lineHeight: 1.15 }}>{d.title}</h4>
              <p style={{ fontSize: 13, lineHeight: 1.5, margin: 0, opacity: 0.78 }}>{d.text}</p>
            </div>
          </div>
        ))}
      </div>

      <MobCallbackFAB />
      <MobCallbackBar />
    </div>
  );
}

// =============== QUI SOMMES-NOUS MOBILE ===============
function MobQui() {
  const tabs = [
    { key: "association", label: "L'association", emoji: "🫶", active: true },
    { key: "projet", label: "Projet éducatif", emoji: "📄" },
    { key: "equipes", label: "Équipes", emoji: "👥" },
  ];
  return (
    <div className="mura" style={{ background: MM.cream, color: MM.ink, minHeight: "100%", paddingBottom: 110, position: "relative" }}>
      <MobHeader />

      <div style={{ position: "relative", background: MM.ink, color: MM.cream, padding: "24px 18px 28px", overflow: "hidden", minHeight: 280 }}>
        <Photo src="public/photos/fg-03.png" alt="Murathenes - groupe" ratio="auto" style={{ position: "absolute", inset: 0, height: "100%", aspectRatio: "auto" }} objectPosition="center 40%" />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(26,21,48,0.4), rgba(26,21,48,0.88))" }} />
        <div style={{ position: "relative" }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: 2, color: MM.yellow, marginBottom: 14 }}>§ MURATHÈNES</div>
          <h1 style={{ fontSize: 56, fontWeight: 700, letterSpacing: -2.5, lineHeight: 0.9, margin: 0 }}>
            Qui sommes <span className="ed" style={{ fontStyle: "italic", color: MM.ochre }}>-nous ?</span>
          </h1>
          <p style={{ fontSize: 14, marginTop: 14, opacity: 0.9, lineHeight: 1.5 }}>
            Une association d'éducation populaire — France et Europe.
          </p>
        </div>
      </div>

      <div style={{ background: MM.cream, padding: "12px 16px", borderBottom: `1.5px solid ${MM.ink}33`, overflowX: "auto", whiteSpace: "nowrap", display: "flex", gap: 6 }}>
        {tabs.map((t) => (
          <button key={t.key} style={{
            background: t.active ? MM.violet : "transparent",
            color: t.active ? MM.cream : MM.ink,
            border: t.active ? "none" : `1.5px solid ${MM.ink}33`,
            padding: "10px 14px",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase",
            cursor: "pointer",
            fontFamily: "inherit",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
            minHeight: 40,
          }}>
            <span style={{ fontSize: 13 }}>{t.emoji}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Manifeste */}
      <div style={{ background: MM.violet, color: MM.cream, padding: "36px 18px", borderTop: `1.5px solid ${MM.ink}`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -40, top: -20, opacity: 0.12 }}>
          <MuraLogo color={MM.cream} size={220} />
        </div>
        <div style={{ position: "relative" }}>
          <div className="mono" style={{ fontSize: 10, color: MM.ochre, letterSpacing: 2, marginBottom: 18 }}>§ NOTRE PARTI PRIS</div>
          <p className="ed" style={{ fontSize: 28, fontWeight: 400, lineHeight: 1.15, letterSpacing: -0.5, margin: 0, fontStyle: "italic" }}>
            "Murathènes défend des principes <span style={{ background: MM.ochre, color: MM.ink, padding: "0 6px", fontStyle: "normal", fontWeight: 600 }}>d'éducation populaire</span> à travers une pédagogie active et émancipatrice."
          </p>
          <div className="mono" style={{ fontSize: 10, opacity: 0.8, letterSpacing: 1.5, marginTop: 24, paddingTop: 16, borderTop: `1px solid ${MM.cream}33` }}>
            — L'ÉQUIPE PÉDAGOGIQUE · DEPUIS 2019
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: MM.cream, padding: "24px 16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { num: "240+", label: "animateur·rices formé·es", color: MM.violet },
            { num: "7 ans", label: "d'expérience BAFA", color: MM.ochre },
            { num: "12+", label: "partenaires institutionnels", color: MM.red },
          ].map((s, i) => (
            <div key={i} style={{ background: MM.paper, border: `2px solid ${MM.ink}`, borderRadius: 18, padding: "20px 22px", display: "flex", alignItems: "center", gap: 18 }}>
              <div className="ed" style={{ fontSize: 50, fontWeight: 600, fontStyle: "italic", color: s.color, lineHeight: 1, letterSpacing: -2, flexShrink: 0 }}>{s.num}</div>
              <div className="mono" style={{ fontSize: 11, color: MM.ink, opacity: 0.7, letterSpacing: 1.5, lineHeight: 1.3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <MobCallbackFAB />
      <MobCallbackBar />
    </div>
  );
}

Object.assign(window, { MobHome, MobBafa, MobFormationFG, MobFormationAppro, MobInfos, MobQui });
