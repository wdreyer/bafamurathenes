// Direction A — "Colo Bold"
// Aesthetic: oversized type, bold flat color blocks, sticker-like rotated tags,
// hand-drawn squiggles, BIG dates, photo-first hero. Inspired by colo / camp posters.

const A = {
  cream: "#fef3e2",
  paper: "#fff8ec",
  ink: "#1a1530",
  violet: "#6b5bd6",
  violetDeep: "#4a3db5",
  violetSoft: "#e8e3ff",
  orange: "#ff8a3d",
  yellow: "#ffd23f",
  pink: "#ff6b9d",
  green: "#5fb56b",
  red: "#e63946",
};

const aFonts = `
@import url('https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@400;500;600;700&family=Caveat:wght@500;700&family=Instrument+Serif:ital@0;1&display=swap');
.dirA, .dirA * { font-family: 'Familjen Grotesk', system-ui, sans-serif; box-sizing: border-box; }
.dirA .hand { font-family: 'Caveat', cursive; }
.dirA .serif { font-family: 'Instrument Serif', serif; font-weight: 400; }
`;

function ANav() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 48px", background: A.cream, borderBottom: `1.5px solid ${A.ink}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <MuraLogo color={A.violet} size={38} />
        <div style={{ lineHeight: 1 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: A.violet, fontWeight: 600 }}>FORMATIONS BAFA</div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, color: A.ink, marginTop: 2 }}>MURATHÈNES</div>
        </div>
      </div>
      <nav style={{ display: "flex", gap: 36, fontSize: 14, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: A.ink }}>
        <span>Accueil</span>
        <span>Le BAFA</span>
        <span style={{ position: "relative", color: A.red }}>
          Nos formations 2026
          <Squiggle color={A.orange} width={140} height={8} strokeWidth={3} />
        </span>
        <span>Infos pratiques ▾</span>
        <span>Qui sommes-nous ? ▾</span>
      </nav>
    </div>
  );
}

// HERO — full bleed photo, oversized BAFA type, stickers
function AHero() {
  return (
    <div style={{ position: "relative", background: A.ink, color: A.cream, overflow: "hidden", minHeight: 720 }}>
      <PhotoPlaceholder
        label="Photo grand format — jeunes en cercle, terrain, lumière dorée"
        ratio="auto"
        color="#3d3550"
        style={{ position: "absolute", inset: 0, height: "100%", aspectRatio: "auto" }}
      />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(26,21,48,0.2) 0%, rgba(26,21,48,0.65) 100%)" }} />

      {/* tag top-left */}
      <div style={{ position: "absolute", top: 40, left: 48, zIndex: 2, transform: "rotate(-2deg)" }}>
        <div style={{ background: A.yellow, color: A.ink, padding: "8px 18px", borderRadius: 999, fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", border: `2px solid ${A.ink}`, display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Picto kind="mountain" size={16} color={A.ink} /> Formations BAFA en AURA · été 2026
        </div>
      </div>

      {/* big title */}
      <div style={{ position: "absolute", bottom: 80, left: 48, zIndex: 2, maxWidth: 760 }}>
        <div className="hand" style={{ fontSize: 38, color: A.yellow, transform: "rotate(-3deg)", marginBottom: -10, marginLeft: 8 }}>passe ton</div>
        <h1 style={{ fontSize: 168, fontWeight: 700, letterSpacing: -8, lineHeight: 0.85, margin: 0, color: A.cream }}>
          BAFA<br />
          <span style={{ color: A.orange, fontStyle: "italic" }}>cet été.</span>
        </h1>
        <div style={{ display: "flex", gap: 10, marginTop: 32, flexWrap: "wrap" }}>
          {["Éducation populaire", "Vie en collectivité", "Pédagogie émancipatrice"].map((t, i) => (
            <span key={t} style={{
              background: [A.violet, A.pink, A.green][i],
              color: A.cream,
              padding: "8px 16px",
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 600,
              border: `2px solid ${A.cream}`,
              transform: `rotate(${[-1, 1, -1][i]}deg)`,
            }}>{t}</span>
          ))}
        </div>
      </div>

      {/* sticker bottom-right */}
      <div style={{ position: "absolute", top: 48, right: 48, zIndex: 2, width: 160, height: 160, borderRadius: "50%", background: A.orange, color: A.ink, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", border: `3px solid ${A.ink}`, transform: "rotate(8deg)", boxShadow: `6px 6px 0 ${A.ink}` }}>
        <div className="hand" style={{ fontSize: 22, lineHeight: 1, marginBottom: 4 }}>dans le</div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1, lineHeight: 1 }}>CANTAL</div>
        <div style={{ fontSize: 11, marginTop: 4, fontWeight: 500 }}>domaine de Gravières</div>
      </div>
    </div>
  );
}

// Big dates module — the conversion magnet
function ADates() {
  const sessions = [
    { tag: "FG", color: A.violet, title: "Formation Générale", date: "26 juin → 4 juillet", price: "550 €", desc: "8 jours pour comprendre les rôles et fonctions de l'animateur·rice", spots: "12 places restantes" },
    { tag: "APPRO", color: A.pink, title: "Séjour à l'étranger / échange de jeunes", date: "28 juin → 4 juillet", price: "450 €", desc: "Approfondissement BAFA, juste avant les grands départs", spots: "6 places restantes" },
    { tag: "FG", color: A.violet, title: "Formation Générale — automne", date: "24 → 31 octobre", price: "550 €", desc: "Session vacances de la Toussaint", spots: "Inscriptions ouvertes" },
  ];
  return (
    <div style={{ background: A.cream, padding: "100px 48px", borderTop: `1.5px solid ${A.ink}` }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 48 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: 3, color: A.violet, fontWeight: 700, marginBottom: 12 }}>📅 PROCHAINES SESSIONS</div>
          <h2 style={{ fontSize: 84, fontWeight: 700, letterSpacing: -3, lineHeight: 0.95, margin: 0, color: A.ink, maxWidth: 900 }}>
            On part <span className="serif" style={{ fontStyle: "italic", color: A.violet }}>quand ?</span>
          </h2>
        </div>
        <div className="hand" style={{ fontSize: 28, color: A.ink, transform: "rotate(-2deg)", maxWidth: 280, textAlign: "right" }}>
          réserve vite — les places<br />partent en quelques semaines ↓
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        {sessions.map((s, i) => (
          <div key={i} style={{
            background: A.paper,
            border: `2px solid ${A.ink}`,
            borderRadius: 24,
            padding: 28,
            boxShadow: `8px 8px 0 ${A.ink}`,
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <span style={{ background: s.color, color: A.cream, padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>{s.tag}</span>
              <span style={{ fontSize: 13, color: A.green, fontWeight: 600 }}>● {s.spots}</span>
            </div>

            <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: -2, lineHeight: 1, color: A.ink, marginBottom: 8 }}>
              {s.date.split(" → ")[0]}
            </div>
            <div style={{ fontSize: 18, color: A.ink, opacity: 0.7, marginBottom: 24 }}>
              → {s.date.split(" → ")[1]}
            </div>

            <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0, marginBottom: 12, color: A.ink, letterSpacing: -0.5 }}>{s.title}</h3>
            <p style={{ fontSize: 14, color: A.ink, opacity: 0.75, lineHeight: 1.5, margin: 0, marginBottom: 24, flex: 1 }}>{s.desc}</p>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 20, borderTop: `1.5px dashed ${A.ink}` }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: A.ink, letterSpacing: -1 }}>{s.price}</div>
              <button style={{ background: A.orange, color: A.ink, border: `2px solid ${A.ink}`, borderRadius: 999, padding: "12px 22px", fontSize: 14, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                Je m'inscris →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Pédagogie / valeurs — colorful blocks, no boxed-in feel
function APedagogie() {
  const values = [
    { color: A.violet, icon: "flame", title: "On apprend en faisant", text: "Jeux de rôles, mises en situation, analyses de pratiques. Pas de cours magistraux — le terrain." },
    { color: A.orange, icon: "people", title: "Vie en collectivité 24/7", text: "Pension complète, dortoirs, repas ensemble. Le BAFA, ça se vit autant que ça s'apprend." },
    { color: A.pink, icon: "heart", title: "Pédagogie émancipatrice", text: "Animation, vie quotidienne, mais aussi luttes contre les violences sexistes, handicap, laïcité." },
    { color: A.green, icon: "leaf", title: "Au cœur du Cantal", text: "Domaine de Gravières, Lanobre. Forêts, lac, immersion nature — loin de tout sauf de l'essentiel." },
  ];
  return (
    <div style={{ background: A.violetSoft, padding: "100px 48px", borderTop: `1.5px solid ${A.ink}` }}>
      <div style={{ maxWidth: 700, marginBottom: 56 }}>
        <div style={{ fontSize: 12, letterSpacing: 3, color: A.violet, fontWeight: 700, marginBottom: 12 }}>LE BAFA AVEC MURATHÈNES</div>
        <h2 style={{ fontSize: 72, fontWeight: 700, letterSpacing: -2.5, lineHeight: 1, margin: 0, color: A.ink }}>
          Un environnement <span className="serif" style={{ fontStyle: "italic", color: A.violet }}>incroyable</span> & une pédagogie qui <span className="hand" style={{ color: A.orange, fontSize: 84 }}>émancipe</span>.
        </h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 0, border: `2px solid ${A.ink}`, borderRadius: 24, overflow: "hidden", background: A.paper }}>
        {values.map((v, i) => (
          <div key={i} style={{
            padding: 36,
            borderRight: i % 2 === 0 ? `1.5px solid ${A.ink}` : "none",
            borderBottom: i < 2 ? `1.5px solid ${A.ink}` : "none",
            background: A.paper,
          }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: v.color, color: A.cream, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, transform: "rotate(-3deg)", border: `2px solid ${A.ink}` }}>
              <Picto kind={v.icon} size={28} color={A.cream} />
            </div>
            <h3 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1, margin: 0, marginBottom: 12, color: A.ink }}>{v.title}</h3>
            <p style={{ fontSize: 15, lineHeight: 1.55, margin: 0, color: A.ink, opacity: 0.8 }}>{v.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Témoignages — big, polaroid-style
function ATestimonials() {
  const ts = [
    { name: "Léa, 19 ans", role: "BAFA Général · 2025", color: A.yellow, quote: "Franchement, j'ai jamais autant ri ni autant appris en 8 jours. Le groupe, les formateurs, le lieu — tout colle. Je repars avec des potes pour la vie.", rotate: -2 },
    { name: "Yannis, 22 ans", role: "BAFA Appro · 2024", color: A.pink, quote: "L'appro échange de jeunes m'a fait passer un cap. Concrètement utile pour ma colo l'été d'après. Et la pédagogie de Murathènes, c'est pas du flan.", rotate: 1.5 },
    { name: "Camille, 17 ans", role: "BAFA Général · 2025", color: A.green, quote: "Premier truc que je faisais loin de chez moi. Je flippais. Et finalement c'est devenu une des meilleures semaines de ma vie. Foncez.", rotate: -1 },
  ];
  return (
    <div style={{ background: A.ink, padding: "100px 48px", color: A.cream }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 56 }}>
        <h2 style={{ fontSize: 84, fontWeight: 700, letterSpacing: -3, lineHeight: 0.95, margin: 0, maxWidth: 800 }}>
          Ils & elles l'ont fait <span className="serif" style={{ fontStyle: "italic", color: A.yellow }}>avant toi.</span>
        </h2>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{ fontSize: 56, fontWeight: 700, color: A.yellow, letterSpacing: -2 }}>240+</span>
          <span style={{ fontSize: 14, opacity: 0.7, maxWidth: 140 }}>animateur·rices formé·es depuis 2019</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
        {ts.map((t, i) => (
          <div key={i} style={{ transform: `rotate(${t.rotate}deg)` }}>
            <div style={{ background: A.paper, padding: 18, paddingBottom: 22, borderRadius: 4, boxShadow: `0 12px 32px rgba(0,0,0,0.4)`, border: `1.5px solid ${A.ink}` }}>
              <PhotoPlaceholder label={`portrait — ${t.name}`} ratio="4/5" color={t.color} />
              <div style={{ paddingTop: 18, color: A.ink }}>
                <p className="serif" style={{ fontSize: 19, lineHeight: 1.4, margin: 0, marginBottom: 16, fontStyle: "italic" }}>"{t.quote}"</p>
                <div style={{ borderTop: `1px dashed ${A.ink}`, paddingTop: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.6 }}>{t.role}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Final CTA band
function ACTA() {
  return (
    <div style={{ background: A.orange, padding: "100px 48px", borderTop: `2px solid ${A.ink}`, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -40, right: 60, transform: "rotate(15deg)" }}>
        <Picto kind="sun" size={120} color={A.ink} />
      </div>
      <div style={{ maxWidth: 900 }}>
        <div className="hand" style={{ fontSize: 36, color: A.ink, marginBottom: -8 }}>alors,</div>
        <h2 style={{ fontSize: 128, fontWeight: 700, letterSpacing: -5, lineHeight: 0.9, margin: 0, color: A.ink }}>
          On se voit<br />en juin ?
        </h2>
        <div style={{ marginTop: 40, display: "flex", gap: 16, alignItems: "center" }}>
          <button style={{ background: A.ink, color: A.cream, border: "none", borderRadius: 999, padding: "20px 36px", fontSize: 16, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer" }}>
            Voir le calendrier complet →
          </button>
          <span style={{ fontSize: 15, color: A.ink, opacity: 0.8 }}>ou écris-nous · contact@murathenes.fr</span>
        </div>
      </div>
    </div>
  );
}

// FORMATION DETAIL PAGE — direction A
function AFormationPage() {
  return (
    <div style={{ background: A.cream }}>
      <ANav />

      {/* Hero with sticker date */}
      <div style={{ background: A.violet, color: A.cream, padding: "60px 48px", position: "relative", borderBottom: `2px solid ${A.ink}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
              <span style={{ background: A.cream, color: A.ink, padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, border: `2px solid ${A.ink}` }}>FORMATION GÉNÉRALE</span>
              <span style={{ background: A.yellow, color: A.ink, padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, border: `2px solid ${A.ink}` }}>SESSION ÉTÉ</span>
            </div>
            <div className="hand" style={{ fontSize: 42, color: A.yellow, marginBottom: -12 }}>du</div>
            <h1 style={{ fontSize: 124, fontWeight: 700, letterSpacing: -5, lineHeight: 0.9, margin: 0 }}>
              26 juin<br />
              <span className="serif" style={{ fontStyle: "italic", fontSize: 64 }}>au 4 juillet</span><br />
              2026
            </h1>
            <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
              <button style={{ background: A.orange, color: A.ink, border: `2px solid ${A.ink}`, borderRadius: 999, padding: "16px 28px", fontSize: 15, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer", boxShadow: `4px 4px 0 ${A.ink}` }}>
                Je m'inscris (550 €) →
              </button>
              <button style={{ background: "transparent", color: A.cream, border: `2px solid ${A.cream}`, borderRadius: 999, padding: "16px 28px", fontSize: 15, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer" }}>
                Le programme ↓
              </button>
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <PhotoPlaceholder label="Panneau Murathènes en bois" ratio="4/3" color="#8a6f4d" style={{ transform: "rotate(2deg)", border: `3px solid ${A.ink}`, borderRadius: 8, boxShadow: `8px 8px 0 ${A.ink}` }} />
            {/* small overlay photos */}
            <div style={{ position: "absolute", bottom: -40, left: -30, width: 180, transform: "rotate(-6deg)" }}>
              <PhotoPlaceholder label="atelier" ratio="1/1" color="#c8736a" style={{ border: `3px solid ${A.ink}`, borderRadius: 6, boxShadow: `4px 4px 0 ${A.ink}` }} />
            </div>
            <div style={{ position: "absolute", top: -30, right: -20, width: 160, transform: "rotate(5deg)" }}>
              <PhotoPlaceholder label="groupe" ratio="1/1" color="#6b9b7a" style={{ border: `3px solid ${A.ink}`, borderRadius: 6, boxShadow: `4px 4px 0 ${A.ink}` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Content section — 2 col, no boxes within boxes */}
      <div style={{ padding: "100px 48px", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 80 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: 3, color: A.violet, fontWeight: 700, marginBottom: 12 }}>LE CONTENU DE LA FORMATION</div>
          <h2 style={{ fontSize: 56, fontWeight: 700, letterSpacing: -2, lineHeight: 1, margin: 0, marginBottom: 32, color: A.ink }}>
            8 jours pour devenir <span className="serif" style={{ fontStyle: "italic", color: A.orange }}>animateur·rice.</span>
          </h2>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: A.ink, opacity: 0.85, marginBottom: 40 }}>
            Tout au long de la formation tu auras l'occasion de :
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {[
              { icon: "compass", title: "Découvrir le monde des ACM", text: "Séjours, centres de loisirs, mini-camps. Le cadre légal, les acteurs, et où tu pourras bosser après." },
              { icon: "star", title: "Créer une animation de A à Z", text: "Veillée, grand jeu, atelier — tu apprends à imaginer, monter et animer. En vrai, devant le groupe." },
              { icon: "heart", title: "Comprendre l'enfant", text: "Besoins selon les tranches d'âge, spécificités, handicap, neuroatypies. La théorie qui sert sur le terrain." },
              { icon: "people", title: "Gérer un groupe", text: "Conflits, dynamique, posture d'adulte référent. Mises en situation toute la semaine." },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: [A.violet, A.orange, A.pink, A.green][i], color: A.cream, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `2px solid ${A.ink}` }}>
                  <Picto kind={item.icon} size={24} color={A.cream} />
                </div>
                <div>
                  <h4 style={{ fontSize: 22, fontWeight: 700, margin: 0, marginBottom: 6, color: A.ink, letterSpacing: -0.5 }}>{item.title}</h4>
                  <p style={{ fontSize: 15, lineHeight: 1.55, margin: 0, color: A.ink, opacity: 0.75 }}>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* sidebar — flat info, no card */}
        <div>
          <div style={{ background: A.yellow, padding: 36, borderRadius: 24, border: `2px solid ${A.ink}`, boxShadow: `8px 8px 0 ${A.ink}`, position: "sticky", top: 24 }}>
            <div style={{ fontSize: 12, letterSpacing: 3, fontWeight: 700, color: A.ink, marginBottom: 20 }}>📋 EN PRATIQUE</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {[
                { k: "Durée", v: "8 jours · arrivée vendredi, départ samedi suivant" },
                { k: "Hébergement", v: "Internat en pension complète, dortoirs avec sdb privative" },
                { k: "Lieu", v: "Domaine de Gravières · Lanobre, Cantal · Auvergne" },
                { k: "Tarif", v: "550 € (transport en option)" },
                { k: "Places", v: "12 personnes max — restent 8 places" },
              ].map((row) => (
                <div key={row.k} style={{ borderBottom: `1.5px dashed ${A.ink}`, paddingBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: A.ink, opacity: 0.6, marginBottom: 4 }}>{row.k}</div>
                  <div style={{ fontSize: 15, color: A.ink, lineHeight: 1.4 }}>{row.v}</div>
                </div>
              ))}
            </div>
            <button style={{ width: "100%", marginTop: 24, background: A.ink, color: A.cream, border: "none", borderRadius: 999, padding: "16px", fontSize: 14, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer" }}>
              Ouvrir le formulaire d'inscription ↗
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DirectionAHome() {
  return (
    <>
      <style>{aFonts}</style>
      <div className="dirA" style={{ background: A.cream, color: A.ink, width: "100%" }}>
        <ANav />
        <AHero />
        <ADates />
        <APedagogie />
        <ATestimonials />
        <ACTA />
      </div>
    </>
  );
}

function DirectionAFormation() {
  return (
    <>
      <style>{aFonts}</style>
      <div className="dirA" style={{ background: A.cream, color: A.ink, width: "100%" }}>
        <AFormationPage />
      </div>
    </>
  );
}

Object.assign(window, { DirectionAHome, DirectionAFormation });
