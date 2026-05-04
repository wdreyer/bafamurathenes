// Unified Murathènes design — best of A (bold type, big dates, playful) +
// B (editorial grid, no nested cards). Real content from the GitHub repo.

const M = {
  paper: "#fff8ec",       // amber-50-ish — header bg in the repo
  paperDeep: "#f4ede0",
  cream: "#fefcf5",
  ink: "#1a1530",
  inkSoft: "#3d3550",
  violet: "#6668C6",       // brand violet from repo
  violetDeep: "#4a4ba8",
  violetSoft: "#e8e9f8",
  red: "#B13A4A",          // FORMS_PURPLE in repo
  ochre: "#f5a623",
  yellow: "#ffd23f",
  pink: "#ff6b9d",
  green: "#5fb56b",
  sky: "#5ba3d4",
};

const muraFonts = `
@import url('https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,800;1,9..144,400;1,9..144,600&family=Caveat:wght@500;700&family=JetBrains+Mono:wght@400;500&display=swap');
.mura, .mura * { font-family: 'Familjen Grotesk', system-ui, sans-serif; box-sizing: border-box; }
.mura .ed { font-family: 'Fraunces', Georgia, serif; }
.mura .hand { font-family: 'Caveat', cursive; }
.mura .mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
`;

// Shared header (matches repo nav structure but redesigned)
function MNav() {
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 30, background: M.paper, borderBottom: `1.5px solid ${M.ink}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <MuraLogo color={M.violet} size={42} />
          <div style={{ lineHeight: 1 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: 2, color: M.sky, fontWeight: 600 }}>FORMATIONS BAFA</div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, color: M.violet, marginTop: 2, textTransform: "uppercase" }}>Murathènes</div>
          </div>
        </div>
        <nav style={{ display: "flex", gap: 28, fontSize: 13, fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase", color: M.ink, alignItems: "center" }}>
          <span>Accueil</span>
          <span>Le BAFA</span>
          <span style={{ background: M.red, color: M.cream, padding: "8px 14px", borderRadius: 999 }}>Nos formations 2026</span>
          <span>Infos pratiques ▾</span>
          <span>Qui sommes-nous ▾</span>
          <button style={{ background: M.ink, color: M.yellow, border: "none", borderRadius: 999, padding: "10px 18px", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            ☎ Sois rappelé·e
          </button>
        </nav>
      </div>
    </div>
  );
}

// Floating callback widget — quick contact
function CallbackWidget({ position = "br" }) {
  const pos = position === "br"
    ? { bottom: 24, right: 24 }
    : { bottom: 24, left: 24 };
  return (
    <div style={{ position: "absolute", ...pos, zIndex: 20, width: 360 }}>
      <div style={{ background: M.ink, color: M.cream, borderRadius: 20, padding: 22, boxShadow: `8px 8px 0 ${M.violet}`, border: `2px solid ${M.violet}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: 1.5, color: M.yellow, marginBottom: 4 }}>⚡ RAPPEL EN 30 MIN</div>
            <div className="ed" style={{ fontSize: 26, fontWeight: 600, lineHeight: 1.05, fontStyle: "italic" }}>
              Une question ?<br />On t'appelle.
            </div>
          </div>
          <span style={{ width: 28, height: 28, borderRadius: "50%", background: M.violet, color: M.cream, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer" }}>✕</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
          <input placeholder="Ton prénom" style={{ width: "100%", background: "transparent", border: `1px solid ${M.cream}33`, borderRadius: 8, padding: "10px 12px", color: M.cream, fontSize: 13, fontFamily: "inherit" }} />
          <input placeholder="Ton numéro" style={{ width: "100%", background: "transparent", border: `1px solid ${M.cream}33`, borderRadius: 8, padding: "10px 12px", color: M.cream, fontSize: 13, fontFamily: "inherit" }} />
          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
            {["Ce matin", "Cet aprem", "Ce soir"].map((t, i) => (
              <span key={t} style={{ flex: 1, textAlign: "center", padding: "7px 4px", borderRadius: 6, background: i === 1 ? M.yellow : "transparent", color: i === 1 ? M.ink : M.cream, fontSize: 11, fontWeight: 600, border: `1px solid ${i === 1 ? M.yellow : M.cream + "33"}`, cursor: "pointer" }}>{t}</span>
            ))}
          </div>
          <button style={{ background: M.yellow, color: M.ink, border: "none", borderRadius: 999, padding: "12px 16px", marginTop: 8, fontSize: 13, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer" }}>
            Demander un rappel →
          </button>
          <div className="mono" style={{ fontSize: 9, opacity: 0.6, textAlign: "center", marginTop: 6, letterSpacing: 1 }}>
            OU ÉCRIS-NOUS · contact@murathenes.fr · 06 XX XX XX XX
          </div>
        </div>
      </div>
    </div>
  );
}

// Sticky bottom CTA bar
function StickyCallbackBar() {
  return (
    <div style={{ position: "sticky", bottom: 0, zIndex: 25, background: M.violet, color: M.cream, padding: "14px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `2px solid ${M.ink}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ width: 40, height: 40, borderRadius: "50%", background: M.yellow, color: M.ink, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>☎</span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Pas sûr·e ? On t'aide à choisir.</div>
          <div className="mono" style={{ fontSize: 11, opacity: 0.85, letterSpacing: 1, marginTop: 2 }}>RAPPEL GRATUIT · RÉPONSE SOUS 30 MIN · LUN–SAM 9H–19H</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button style={{ background: "transparent", color: M.cream, border: `1.5px solid ${M.cream}`, borderRadius: 999, padding: "10px 18px", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}>
          ✉ Email
        </button>
        <button style={{ background: M.yellow, color: M.ink, border: "none", borderRadius: 999, padding: "10px 18px", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}>
          ☎ Sois rappelé·e en 30 min →
        </button>
      </div>
    </div>
  );
}

// =============== HOME PAGE ===============
function HomeHero() {
  return (
    <div style={{ position: "relative", background: M.ink, color: M.cream, overflow: "hidden", minHeight: 720, borderBottom: `1.5px solid ${M.ink}` }}>
      <Photo src="public/bafa30.jpg" alt="Murathènes — jeunes en cercle, terrain" ratio="auto" style={{ position: "absolute", inset: 0, height: "100%", aspectRatio: "auto" }} objectPosition="center 40%" />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(26,21,48,0.25) 0%, rgba(26,21,48,0.7) 100%)" }} />

      <div style={{ position: "absolute", top: 36, left: 48, zIndex: 2, transform: "rotate(-2deg)" }}>
        <div style={{ background: M.yellow, color: M.ink, padding: "8px 18px", borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", border: `2px solid ${M.ink}` }}>
          ✦ Formations BAFA en AURA · 2026
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 80, left: 48, zIndex: 2, maxWidth: 760 }}>
        <div className="hand" style={{ fontSize: 36, color: M.yellow, transform: "rotate(-3deg)", marginBottom: -8, marginLeft: 8 }}>passe ton</div>
        <h1 style={{ fontSize: 156, fontWeight: 700, letterSpacing: -7, lineHeight: 0.85, margin: 0, color: M.cream }}>
          BAFA<br />
          <span className="ed" style={{ color: M.ochre, fontStyle: "italic", fontWeight: 600 }}>cet été.</span>
        </h1>
        <p style={{ fontSize: 18, marginTop: 24, maxWidth: 520, color: M.cream, opacity: 0.9 }}>
          Formations BAFA dans le Cantal au domaine de Gravières.
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 28, flexWrap: "wrap" }}>
          {[{ t: "Éducation populaire", c: M.violet }, { t: "Vie en collectivité", c: M.sky }, { t: "Pédagogie émancipatrice", c: M.ochre }].map((tag, i) => (
            <span key={i} style={{ background: tag.c, color: M.cream, padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600, border: `2px solid ${M.cream}`, transform: `rotate(${[-1, 1, -0.5][i]}deg)` }}>
              {tag.t}
            </span>
          ))}
        </div>
      </div>

      <CallbackWidget />

      <div style={{ position: "absolute", top: 36, right: 420, zIndex: 2, width: 130, height: 130, borderRadius: "50%", background: M.ochre, color: M.ink, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", border: `3px solid ${M.ink}`, transform: "rotate(8deg)", boxShadow: `5px 5px 0 ${M.ink}` }}>
        <div className="hand" style={{ fontSize: 18, lineHeight: 1, marginBottom: 2 }}>dans le</div>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1 }}>CANTAL</div>
        <div style={{ fontSize: 10, marginTop: 3, fontWeight: 500 }}>Gravières · Lanobre</div>
      </div>
    </div>
  );
}

function HomeDates() {
  const sessions = [
    { tag: "FG", title: "Formation Générale", from: "05–12 avril", year: "2026", price: 500, was: 550, spots: "Promo printemps", color: M.sky, featured: false },
    { tag: "FG", title: "Formation Générale", from: "26 juin → 4 juillet", year: "2026", price: 550, spots: "8 places sur 16", color: M.violet, featured: true },
    { tag: "APPRO", title: "Séjour à l'étranger / échange de jeunes", from: "28 juin → 4 juillet", year: "2026", price: 450, spots: "6 places sur 12", color: M.ochre, featured: false },
    { tag: "FG", title: "Formation Générale", from: "24–31 octobre", year: "2026", price: 550, spots: "Inscriptions ouvertes", color: M.sky, featured: false },
  ];
  return (
    <div style={{ background: M.cream, padding: "100px 48px", borderBottom: `1.5px solid ${M.ink}` }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 56, gap: 32 }}>
        <div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: 2.5, color: M.red, fontWeight: 600, marginBottom: 14 }}>📅 CALENDRIER 2026</div>
          <h2 style={{ fontSize: 84, fontWeight: 700, letterSpacing: -3, lineHeight: 0.95, margin: 0, color: M.ink, maxWidth: 900 }}>
            On part <span className="ed" style={{ fontStyle: "italic", color: M.violet }}>quand ?</span>
          </h2>
        </div>
        <div className="hand" style={{ fontSize: 26, color: M.ink, transform: "rotate(-2deg)", maxWidth: 280, textAlign: "right" }}>
          réserve vite — les places<br />partent en quelques semaines ↓
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
        {sessions.map((s, i) => (
          <div key={i} style={{
            background: s.featured ? M.violet : M.paper,
            color: s.featured ? M.cream : M.ink,
            border: `2px solid ${M.ink}`,
            borderRadius: 24,
            padding: 32,
            boxShadow: s.featured ? `8px 8px 0 ${M.ochre}` : `6px 6px 0 ${M.ink}`,
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 20,
            alignItems: "center",
          }}>
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
                <span style={{ background: s.featured ? M.yellow : s.color, color: s.featured ? M.ink : M.cream, padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: 1.5 }}>{s.tag}</span>
                <span className="mono" style={{ fontSize: 11, opacity: s.featured ? 0.85 : 0.65, letterSpacing: 1 }}>● {s.spots}</span>
                {s.featured && <span style={{ background: M.ochre, color: M.ink, padding: "4px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>POPULAIRE</span>}
              </div>
              <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1, marginBottom: 6 }}>{s.from}</div>
              <div className="mono" style={{ fontSize: 12, opacity: s.featured ? 0.85 : 0.6, marginBottom: 16, letterSpacing: 1 }}>{s.year}</div>
              <h3 className="ed" style={{ fontSize: 22, fontWeight: 600, margin: 0, fontStyle: "italic", letterSpacing: -0.5, lineHeight: 1.2 }}>{s.title}</h3>
            </div>
            <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 14 }}>
              <div>
                {s.was && <div style={{ fontSize: 14, opacity: 0.6, textDecoration: "line-through" }}>{s.was} €</div>}
                <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1, lineHeight: 1 }}>{s.price} €</div>
              </div>
              <button style={{ background: s.featured ? M.yellow : M.ink, color: s.featured ? M.ink : M.cream, border: "none", borderRadius: 999, padding: "12px 20px", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>
                Voir les détails →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 48, padding: 28, background: M.violetSoft, borderRadius: 24, border: `2px solid ${M.ink}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: M.violet, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 }}>💸 FREIN BUDGET ? ON T'AIDE.</div>
          <div style={{ fontSize: 17, color: M.ink, fontWeight: 500, lineHeight: 1.4 }}>Aides CAF/locales, paiement en plusieurs fois, situations particulières — on regarde avec toi.</div>
        </div>
        <button style={{ background: M.red, color: M.cream, border: "none", borderRadius: 999, padding: "14px 22px", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap" }}>
          ☎ On en parle →
        </button>
      </div>
    </div>
  );
}

function HomePedagogie() {
  const values = [
    { color: M.violet, icon: "flame", title: "On apprend en faisant.", text: "Pas de cours magistraux. Jeux de rôles, mises en situation, supports vidéos, débats. Le terrain dès le premier jour." },
    { color: M.ochre, icon: "people", title: "Vie en collectivité 24/7.", text: "Pension complète, dortoirs, repas partagés, veillées. Le BAFA se vit autant qu'il s'apprend." },
    { color: M.red, icon: "heart", title: "Pédagogie émancipatrice.", text: "Animation, vie quotidienne, mais aussi violences sexistes, neuroatypie, handicap, laïcité." },
    { color: M.green, icon: "leaf", title: "Au cœur du Cantal.", text: "Domaine de Gravières, Lanobre. Forêts, lac, immersion totale — loin de tout sauf de l'essentiel." },
  ];
  return (
    <div style={{ background: M.violetSoft, padding: "100px 48px", borderBottom: `1.5px solid ${M.ink}` }}>
      <div style={{ maxWidth: 900, marginBottom: 56 }}>
        <div className="mono" style={{ fontSize: 11, color: M.violet, letterSpacing: 2.5, fontWeight: 700, marginBottom: 14 }}>§ LE BAFA AVEC MURATHÈNES</div>
        <h2 style={{ fontSize: 72, fontWeight: 700, letterSpacing: -2.5, lineHeight: 1, margin: 0, color: M.ink }}>
          Un environnement <span className="ed" style={{ fontStyle: "italic", color: M.violet }}>incroyable</span> & une pédagogie qui <span className="hand" style={{ color: M.ochre, fontSize: 84 }}>émancipe</span>.
        </h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderTop: `2px solid ${M.ink}`, borderBottom: `2px solid ${M.ink}` }}>
        {values.map((v, i) => (
          <div key={i} style={{ padding: 32, borderRight: i < values.length - 1 ? `1.5px solid ${M.ink}` : "none", display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span className="ed" style={{ fontSize: 48, fontWeight: 600, fontStyle: "italic", color: v.color, lineHeight: 1 }}>0{i + 1}.</span>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: v.color, color: M.cream, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${M.ink}`, transform: "rotate(-3deg)" }}>
                <Picto kind={v.icon} size={22} color={M.cream} />
              </div>
            </div>
            <h3 className="ed" style={{ fontSize: 26, fontWeight: 600, letterSpacing: -1, margin: 0, color: M.ink, lineHeight: 1.05 }}>{v.title}</h3>
            <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, color: M.ink, opacity: 0.78 }}>{v.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function HomeTestimonials() {
  const ts = [
    {
      name: "Jade",
      role: "BAFA Général · 2025",
      src: "public/bafa30.jpg",
      quote: "Je mets un solide 10/10 à cette expérience. Je ne retiens que du positif — c'était bien de rencontrer de potentiel·les futur·es collègues dans l'animation. L'équipe encadrante a été géniale.",
      rotate: -2,
    },
    {
      name: "Stagiaire",
      role: "BAFA Général · 2025",
      src: "public/MT/curiousbird1.jpg",
      quote: "C'était vraiment super, limite incroyable. Je recommande à tout le monde de passer son BAFA avec Lorette, William et Martin à Murathènes !",
      rotate: 1.5,
    },
    {
      name: "Stagiaire",
      role: "BAFA Appro · 2025",
      src: "public/bafa40.jpeg",
      quote: "On était tous différent·es et on s'est très bien entendu·es. On a beaucoup rigolé et parlé pendant cette semaine. J'ai vécu une très belle expérience.",
      rotate: -1,
    },
  ];
  return (
    <div style={{ background: M.ink, padding: "100px 48px", color: M.cream, borderBottom: `1.5px solid ${M.ink}` }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 56 }}>
        <h2 style={{ fontSize: 84, fontWeight: 700, letterSpacing: -3, lineHeight: 0.95, margin: 0, maxWidth: 800 }}>
          Ils & elles l'ont fait <span className="ed" style={{ fontStyle: "italic", color: M.yellow }}>avant toi.</span>
        </h2>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <span style={{ fontSize: 56, fontWeight: 700, color: M.yellow, letterSpacing: -2 }}>240+</span>
          <span style={{ fontSize: 13, opacity: 0.7, maxWidth: 140 }}>animateur·rices formé·es depuis 2019</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
        {ts.map((t, i) => (
          <div key={i} style={{ transform: `rotate(${t.rotate}deg)` }}>
            <div style={{ background: M.paper, padding: 18, paddingBottom: 22, borderRadius: 4, boxShadow: `0 12px 32px rgba(0,0,0,0.4)`, border: `1.5px solid ${M.ink}` }}>
              <Photo src={t.src} alt={t.name} ratio="4/5" />
              <div style={{ paddingTop: 18, color: M.ink }}>
                <p className="ed" style={{ fontSize: 18, lineHeight: 1.4, margin: 0, marginBottom: 16, fontStyle: "italic" }}>"{t.quote}"</p>
                <div style={{ borderTop: `1px dashed ${M.ink}`, paddingTop: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                  <div className="mono" style={{ fontSize: 11, opacity: 0.6, letterSpacing: 1 }}>{t.role}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HomeCTA() {
  return (
    <div style={{ background: M.ochre, padding: "100px 48px", borderBottom: `2px solid ${M.ink}`, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -40, right: 60, transform: "rotate(15deg)" }}>
        <Picto kind="sun" size={120} color={M.ink} />
      </div>
      <div style={{ position: "relative", maxWidth: 900 }}>
        <div className="hand" style={{ fontSize: 32, color: M.ink, marginBottom: -8 }}>alors,</div>
        <h2 style={{ fontSize: 120, fontWeight: 700, letterSpacing: -5, lineHeight: 0.9, margin: 0, color: M.ink }}>
          On se voit<br />en juin ?
        </h2>
        <div style={{ marginTop: 36, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button style={{ background: M.ink, color: M.cream, border: "none", borderRadius: 999, padding: "18px 32px", fontSize: 15, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}>
            Voir le calendrier complet →
          </button>
          <button style={{ background: M.cream, color: M.ink, border: `2px solid ${M.ink}`, borderRadius: 999, padding: "18px 32px", fontSize: 15, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}>
            ☎ Sois rappelé·e en 30 min
          </button>
        </div>
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <div className="mura" style={{ background: M.cream, color: M.ink, width: "100%" }}>
      <MNav />
      <HomeHero />
      <HomeDates />
      <HomePedagogie />
      <HomeTestimonials />
      <HomeCTA />
      <StickyCallbackBar />
    </div>
  );
}

// =============== LE BAFA PAGE ===============
function BafaPage() {
  const steps = [
    { num: "01", color: M.sky, title: "Formation Générale", duration: "9 jours", text: "Bases du métier d'animateur·ice. Création d'animations, compréhension des tranches d'âge, fonctionnement des ACM, posture professionnelle, gestion de groupe.", progress: "33%" },
    { num: "02", color: M.green, title: "Stage pratique", duration: "14 jours", text: "Sur le terrain, auprès d'un vrai public — centre de loisirs, séjour, périscolaire. Mise en pratique, travail en équipe. Murathènes t'accompagne via son réseau.", progress: "66%" },
    { num: "03", color: M.ochre, title: "Approfondissement", duration: "8 jours", text: "Dernière semaine pour valider ton BAFA. Retours sur stages, consolidation des acquis, approfondissement d'une thématique au choix.", progress: "100%" },
  ];
  return (
    <div className="mura" style={{ background: M.cream, color: M.ink, width: "100%" }}>
      <MNav />
      <div style={{ position: "relative", background: M.ink, color: M.cream, padding: "80px 48px 96px", overflow: "hidden", borderBottom: `1.5px solid ${M.ink}` }}>
        <Photo src="public/bafa40.jpeg" alt="pagebafa10" ratio="auto" style={{ position: "absolute", inset: 0, height: "100%", aspectRatio: "auto" }} objectPosition="center 30%" />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(26,21,48,0.4) 0%, rgba(26,21,48,0.85) 100%)" }} />
        <div style={{ position: "relative", maxWidth: 1100 }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: 2.5, color: M.yellow, marginBottom: 24 }}>§ LE BAFA, C'EST QUOI ?</div>
          <h1 style={{ fontSize: 124, fontWeight: 700, letterSpacing: -5, lineHeight: 0.9, margin: 0 }}>
            Ton premier pas dans <span className="ed" style={{ fontStyle: "italic", color: M.ochre }}>l'animation.</span>
          </h1>
          <p style={{ fontSize: 19, marginTop: 32, maxWidth: 720, opacity: 0.9, lineHeight: 1.5 }}>
            Le Brevet d'Aptitude aux Fonctions d'Animateur·ice. Pour encadrer enfants et ados en colos, centres de loisirs, périscolaire. Avec Murathènes : pédagogie active, engagement, bienveillance.
          </p>
        </div>
      </div>

      <div style={{ padding: "100px 48px", borderBottom: `1.5px solid ${M.ink}`, background: M.cream }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, maxWidth: 1280, alignItems: "flex-start" }}>
          <div>
            <div className="mono" style={{ fontSize: 11, letterSpacing: 2.5, color: M.red, fontWeight: 700, marginBottom: 14 }}>§ LE BAFA EN QUELQUES MOTS</div>
            <h2 style={{ fontSize: 60, fontWeight: 700, letterSpacing: -2, lineHeight: 1, margin: 0, marginBottom: 28, color: M.ink }}>
              Une formation pour <span className="ed" style={{ fontStyle: "italic", color: M.violet }}>encadrer</span> enfants et ados.
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: M.ink, opacity: 0.85, marginBottom: 18 }}>
              Avec le BAFA, tu donnes vie au collectif : tu construis des projets <strong>avec</strong> et <strong>pour</strong> les jeunes. Tu crées des souvenirs inoubliables, des moments de vie exceptionnels, en toute sécurité.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: M.ink, opacity: 0.85 }}>
              C'est aussi le travail en équipe, la vie en collectivité et la gestion de groupe.
            </p>
            <div style={{ marginTop: 32, padding: "16px 22px", background: M.yellow, borderRadius: 999, border: `2px solid ${M.ink}`, display: "inline-flex", alignItems: "center", gap: 10, transform: "rotate(-1deg)" }}>
              <span style={{ fontSize: 22 }}>🎓</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: M.ink }}>Tu peux t'inscrire dès tes 16 ans révolus.</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "auto auto", gap: 12 }}>
            <div style={{ gridColumn: "1 / 3", border: `2px solid ${M.ink}`, borderRadius: 16, overflow: "hidden", boxShadow: `5px 5px 0 ${M.violet}` }}>
              <Photo src="public/lorette10.jpeg" alt="Domaine de Gravières vu du ciel" ratio="16/9" />
            </div>
            <div style={{ border: `2px solid ${M.ink}`, borderRadius: 16, overflow: "hidden", transform: "rotate(-2deg)" }}><Photo src="public/bafa1.jpg" alt="atelier" ratio="1/1" /></div>
            <div style={{ border: `2px solid ${M.ink}`, borderRadius: 16, overflow: "hidden", transform: "rotate(2deg)" }}><Photo src="public/bafa40.jpeg" alt="groupe en mouvement" ratio="1/1" /></div>
          </div>
        </div>
      </div>

      <div style={{ background: M.violetSoft, padding: "100px 48px", borderBottom: `1.5px solid ${M.ink}` }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 2.5, color: M.violet, fontWeight: 700, marginBottom: 14 }}>§ LES 3 ÉTAPES DU BAFA</div>
        <h2 style={{ fontSize: 64, fontWeight: 700, letterSpacing: -2, lineHeight: 1, margin: 0, marginBottom: 56, color: M.ink, maxWidth: 900 }}>
          Une formation complète, <span className="ed" style={{ fontStyle: "italic", color: M.violet }}>étape par étape.</span>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ background: M.paper, border: `2px solid ${M.ink}`, borderRadius: 24, padding: 32, boxShadow: `6px 6px 0 ${M.ink}`, display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: s.color, color: M.cream, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, border: `2px solid ${M.ink}` }}>{s.num}</div>
                <span className="mono" style={{ fontSize: 11, color: M.ink, opacity: 0.6, letterSpacing: 1 }}>{s.duration}</span>
              </div>
              <h3 className="ed" style={{ fontSize: 30, fontWeight: 600, letterSpacing: -1, margin: 0, color: M.ink, fontStyle: "italic" }}>{s.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, color: M.ink, opacity: 0.78 }}>{s.text}</p>
              <div style={{ marginTop: "auto", paddingTop: 18 }}>
                <div style={{ height: 8, borderRadius: 999, background: M.ink + "11", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: s.progress, background: s.color, borderRadius: 999 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: M.cream, padding: "100px 48px", borderBottom: `1.5px solid ${M.ink}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 56, maxWidth: 1280 }}>
          <div>
            <div className="mono" style={{ fontSize: 11, letterSpacing: 2.5, color: M.red, fontWeight: 700, marginBottom: 14 }}>§ POURQUOI MURATHÈNES ?</div>
            <h2 style={{ fontSize: 60, fontWeight: 700, letterSpacing: -2, lineHeight: 1, margin: 0, marginBottom: 32, color: M.ink }}>
              Une pédagogie active, engagée, <span className="ed" style={{ fontStyle: "italic", color: M.violet }}>tournée vers les jeunes.</span>
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: M.ink, opacity: 0.85, marginBottom: 18 }}>
              Murathènes est une association d'éducation populaire née en 2019 d'un constat simple : tous les jeunes n'ont pas accès aux mêmes opportunités de loisirs.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: M.ink, opacity: 0.85, marginBottom: 18 }}>
              Nos formations BAFA sont des espaces d'émancipation : posture professionnelle, mais aussi confiance, esprit critique, créativité, capacité à faire groupe.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: M.ink, opacity: 0.85 }}>
              Créer des espaces de joie et de paix où chaque jeune existe, compte, est valorisé — peu importe son identité, son genre, son orientation, ses origines, sa situation.
            </p>
          </div>
          <div style={{ border: `2px solid ${M.ink}`, borderRadius: 24, overflow: "hidden", boxShadow: `8px 8px 0 ${M.ochre}` }}>
            <Photo src="public/bafa6.PNG" alt="musique — atelier" ratio="3/4" />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 56 }}>
          {[
            { icon: "🎭", title: "Pédagogie de projet", text: "Création collective en fil rouge de la semaine." },
            { icon: "🤝", title: "Valeurs fortes", text: "Consentement, mixité, diversité, bienveillance." },
            { icon: "🏡", title: "Cadre de vie", text: "Internat, vie collective, temps de partage." },
            { icon: "🌍", title: "Ouverture", text: "Échanges de jeunes, séjours à l'étranger, projets européens." },
          ].map((c, i) => (
            <div key={i} style={{ background: M.paper, padding: 22, border: `1.5px solid ${M.ink}`, borderRadius: 16 }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{c.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{c.title}</div>
              <div style={{ fontSize: 13, color: M.ink, opacity: 0.75, lineHeight: 1.5 }}>{c.text}</div>
            </div>
          ))}
        </div>
      </div>

      <StickyCallbackBar />
    </div>
  );
}

// =============== INFOS PRATIQUES PAGE ===============
function InfosPratiquesPage() {
  const tabs = [
    { key: "programme", label: "Programme", emoji: "📚", active: true },
    { key: "inscription", label: "Inscription", emoji: "✅" },
    { key: "tarifs", label: "Tarifs & aides", emoji: "💶" },
    { key: "lieu", label: "Lieu & transport", emoji: "📍" },
    { key: "infopack", label: "Guide d'arrivée", emoji: "📦" },
  ];
  return (
    <div className="mura" style={{ background: M.cream, color: M.ink, width: "100%" }}>
      <MNav />
      <div style={{ position: "relative", background: M.ink, color: M.cream, padding: "72px 48px 100px", overflow: "hidden", borderBottom: `1.5px solid ${M.ink}` }}>
        <Photo src="public/infos.jpg" alt="infos pratiques — ado au micro" ratio="auto" style={{ position: "absolute", inset: 0, height: "100%", aspectRatio: "auto" }} objectPosition="center 30%" />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(26,21,48,0.4), rgba(26,21,48,0.85))" }} />
        <div style={{ position: "relative", maxWidth: 1100 }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: 2.5, color: M.yellow, marginBottom: 24 }}>§ INFOS PRATIQUES</div>
          <h1 style={{ fontSize: 116, fontWeight: 700, letterSpacing: -5, lineHeight: 0.9, margin: 0 }}>
            Tout ce qu'il faut <span className="ed" style={{ fontStyle: "italic", color: M.ochre }}>savoir.</span>
          </h1>
          <p style={{ fontSize: 18, marginTop: 24, opacity: 0.9, maxWidth: 600 }}>Toutes les infos utiles au même endroit — programme, inscription, tarifs, transport, guide d'arrivée.</p>
        </div>
      </div>

      <div style={{ background: M.cream, padding: "0 48px", borderBottom: `1.5px solid ${M.ink}`, position: "sticky", top: 78, zIndex: 5 }}>
        <div style={{ display: "flex", gap: 4, overflow: "auto", padding: "16px 0" }}>
          {tabs.map((t) => (
            <button key={t.key} style={{
              background: t.active ? M.violet : "transparent",
              color: t.active ? M.cream : M.ink,
              border: t.active ? "none" : `1.5px solid ${M.ink}33`,
              padding: "10px 18px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}>
              <span style={{ fontSize: 14 }}>{t.emoji}</span>{t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "80px 48px", background: M.cream, borderBottom: `1.5px solid ${M.ink}` }}>
        <div className="mono" style={{ fontSize: 11, color: M.red, fontWeight: 700, letterSpacing: 2.5, marginBottom: 14 }}>📚 PROGRAMME</div>
        <h2 style={{ fontSize: 60, fontWeight: 700, letterSpacing: -2, lineHeight: 1, margin: 0, marginBottom: 48, maxWidth: 900 }}>
          8 jours pour comprendre les <span className="ed" style={{ fontStyle: "italic", color: M.violet }}>rôles & fonctions</span> de l'animateur·rice.
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 1280 }}>
          {[
            { day: "J1", title: "Arrivée & accueil", text: "Vendredi soir. Présentation du lieu, du groupe, des formateur·rices. Premier jeu d'inter-connaissance, dîner partagé, veillée de bienvenue." },
            { day: "J2-J3", title: "Le monde des ACM", text: "Découvrir séjours, centres de loisirs, mini-camps. Cadre légal, acteurs, débouchés. Posture d'animateur·rice." },
            { day: "J4-J5", title: "Animer concrètement", text: "Veillée, grand jeu, atelier — imaginer, monter, animer. Mises en situation devant le groupe avec retours collectifs." },
            { day: "J6", title: "Comprendre l'enfant", text: "Tranches d'âge, besoins, spécificités, neuroatypies, handicap. Aborder la diversité des publics." },
            { day: "J7", title: "Sujets sensibles", text: "Violences sexistes et sexuelles, laïcité, discrimination, responsabilité civile et pénale. Ce qu'il faut connaître." },
            { day: "J8", title: "Bilan & projet", text: "Retours sur la semaine, projection vers le stage pratique, mise en réseau, réseau Murathènes pour la suite." },
          ].map((d, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 24, padding: "24px 0", borderBottom: i < 5 ? `1px dashed ${M.ink}` : "none" }}>
              <div className="ed" style={{ fontSize: 48, fontWeight: 600, fontStyle: "italic", color: M.violet, lineHeight: 1 }}>{d.day}</div>
              <div>
                <h4 className="ed" style={{ fontSize: 26, fontWeight: 600, margin: 0, marginBottom: 8, letterSpacing: -0.5 }}>{d.title}</h4>
                <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, color: M.ink, opacity: 0.78 }}>{d.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <StickyCallbackBar />
    </div>
  );
}

// =============== QUI SOMMES-NOUS PAGE ===============
function QuiSommesNousPage() {
  const tabs = [
    { key: "association", label: "L'association", emoji: "🫶", active: true },
    { key: "projet", label: "Projet éducatif", emoji: "📄" },
    { key: "equipes", label: "Équipes", emoji: "👥" },
  ];
  return (
    <div className="mura" style={{ background: M.cream, color: M.ink, width: "100%" }}>
      <MNav />
      <div style={{ position: "relative", background: M.ink, color: M.cream, padding: "72px 48px 100px", overflow: "hidden", borderBottom: `1.5px solid ${M.ink}` }}>
        <Photo src="public/MT/mew22.jpeg" alt="orchestre Murathènes" ratio="auto" style={{ position: "absolute", inset: 0, height: "100%", aspectRatio: "auto" }} objectPosition="center 60%" />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(26,21,48,0.4), rgba(26,21,48,0.85))" }} />
        <div style={{ position: "relative", maxWidth: 1100 }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: 2.5, color: M.yellow, marginBottom: 24 }}>§ MURATHÈNES</div>
          <h1 style={{ fontSize: 116, fontWeight: 700, letterSpacing: -5, lineHeight: 0.9, margin: 0 }}>
            Qui sommes <span className="ed" style={{ fontStyle: "italic", color: M.ochre }}>-nous ?</span>
          </h1>
          <p style={{ fontSize: 18, marginTop: 24, opacity: 0.9, maxWidth: 700 }}>
            Une association d'éducation populaire qui crée des projets interculturels, artistiques et émancipateurs — en France et en Europe.
          </p>
        </div>
      </div>

      <div style={{ background: M.cream, padding: "0 48px", borderBottom: `1.5px solid ${M.ink}` }}>
        <div style={{ display: "flex", gap: 4, padding: "16px 0" }}>
          {tabs.map((t) => (
            <button key={t.key} style={{
              background: t.active ? M.violet : "transparent",
              color: t.active ? M.cream : M.ink,
              border: t.active ? "none" : `1.5px solid ${M.ink}33`,
              padding: "10px 18px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "inherit",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}>
              <span style={{ fontSize: 14 }}>{t.emoji}</span>{t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: M.violet, color: M.cream, padding: "120px 48px", borderBottom: `1.5px solid ${M.ink}`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -80, top: -40, opacity: 0.12 }}>
          <MuraLogo color={M.cream} size={520} />
        </div>
        <div style={{ position: "relative", maxWidth: 1100 }}>
          <div className="mono" style={{ fontSize: 11, color: M.ochre, letterSpacing: 2.5, marginBottom: 28 }}>§ NOTRE PARTI PRIS</div>
          <p className="ed" style={{ fontSize: 64, fontWeight: 400, lineHeight: 1.05, letterSpacing: -1.5, margin: 0, fontStyle: "italic" }}>
            "Murathènes défend des principes <span style={{ background: M.ochre, color: M.ink, padding: "0 12px", fontStyle: "normal", fontWeight: 600 }}>d'éducation populaire</span> à travers une pédagogie active et émancipatrice. Chaque temps est pensé pour favoriser <span style={{ textDecoration: "underline", textDecorationThickness: 4, textUnderlineOffset: 8, textDecorationColor: M.ochre }}>l'apprentissage par le faire</span>."
          </p>
          <div style={{ marginTop: 40, display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 48, height: 1, background: M.cream, opacity: 0.5 }} />
            <span className="mono" style={{ fontSize: 11, letterSpacing: 1.5, opacity: 0.8 }}>L'ÉQUIPE PÉDAGOGIQUE — DEPUIS 2019</span>
          </div>
        </div>
      </div>

      <div style={{ background: M.cream, padding: "80px 48px", borderBottom: `1.5px solid ${M.ink}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {[
            { num: "240+", label: "animateur·rices formé·es" },
            { num: "7 ans", label: "d'expérience BAFA" },
            { num: "12+", label: "partenaires institutionnels" },
          ].map((s, i) => (
            <div key={i} style={{ background: M.paper, border: `2px solid ${M.ink}`, borderRadius: 24, padding: 36, textAlign: "center" }}>
              <div className="ed" style={{ fontSize: 80, fontWeight: 600, fontStyle: "italic", color: [M.violet, M.ochre, M.red][i], lineHeight: 1, letterSpacing: -3 }}>{s.num}</div>
              <div className="mono" style={{ fontSize: 12, color: M.ink, opacity: 0.7, letterSpacing: 1.5, marginTop: 12 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <StickyCallbackBar />
    </div>
  );
}

// =============== FORMATION DETAIL PAGE ===============
function FormationDetailPage() {
  return (
    <div className="mura" style={{ background: M.cream, color: M.ink, width: "100%" }}>
      <MNav />

      <div className="mono" style={{ display: "flex", justifyContent: "space-between", padding: "12px 48px", fontSize: 11, color: M.ink, opacity: 0.6, borderBottom: `1px dashed ${M.ink}`, background: M.paper }}>
        <span>← FORMATIONS / FG ÉTÉ 2026</span>
        <span>SESSION N° 02 / 2026 · 8 PLACES SUR 16</span>
      </div>

      <div style={{ background: M.violet, color: M.cream, padding: "60px 48px", position: "relative", borderBottom: `2px solid ${M.ink}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
              <span style={{ background: M.cream, color: M.ink, padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, border: `2px solid ${M.ink}` }}>FORMATION GÉNÉRALE</span>
              <span style={{ background: M.yellow, color: M.ink, padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, border: `2px solid ${M.ink}` }}>SESSION ÉTÉ</span>
            </div>
            <div className="hand" style={{ fontSize: 38, color: M.yellow, marginBottom: -12 }}>du</div>
            <h1 style={{ fontSize: 116, fontWeight: 700, letterSpacing: -5, lineHeight: 0.9, margin: 0 }}>
              26 juin<br />
              <span className="ed" style={{ fontStyle: "italic", fontSize: 60 }}>au 4 juillet</span><br />
              2026
            </h1>
            <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
              <button style={{ background: M.ochre, color: M.ink, border: `2px solid ${M.ink}`, borderRadius: 999, padding: "16px 26px", fontSize: 14, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer", boxShadow: `4px 4px 0 ${M.ink}` }}>
                Je m'inscris (550 €) →
              </button>
              <button style={{ background: M.ink, color: M.cream, border: "none", borderRadius: 999, padding: "16px 26px", fontSize: 14, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer" }}>
                ☎ Sois rappelé·e
              </button>
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ border: `3px solid ${M.ink}`, borderRadius: 8, boxShadow: `8px 8px 0 ${M.ink}`, transform: "rotate(2deg)", overflow: "hidden" }}>
              <Photo src="public/lorette10.jpeg" alt="Domaine de Gravières" ratio="4/3" />
            </div>
            <div style={{ position: "absolute", bottom: -40, left: -30, width: 180, transform: "rotate(-6deg)", border: `3px solid ${M.ink}`, borderRadius: 6, boxShadow: `4px 4px 0 ${M.ink}`, overflow: "hidden" }}>
              <Photo src="public/bafa1.jpg" alt="atelier" ratio="1/1" />
            </div>
            <div style={{ position: "absolute", top: -30, right: -20, width: 160, transform: "rotate(5deg)", border: `3px solid ${M.ink}`, borderRadius: 6, boxShadow: `4px 4px 0 ${M.ink}`, overflow: "hidden" }}>
              <Photo src="public/FG/2.jpeg" alt="groupe BAFA" ratio="1/1" />
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "100px 48px", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 80, background: M.cream, borderBottom: `1.5px solid ${M.ink}` }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: M.red, letterSpacing: 2.5, fontWeight: 700, marginBottom: 14 }}>§ A — LE CONTENU</div>
          <h2 style={{ fontSize: 56, fontWeight: 700, letterSpacing: -2, lineHeight: 1, margin: 0, marginBottom: 32 }}>
            8 jours pour devenir <span className="ed" style={{ fontStyle: "italic", color: M.ochre }}>animateur·rice.</span>
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.6, opacity: 0.85, marginBottom: 32 }}>Tout au long de la formation tu auras l'occasion de :</p>
          <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {[
              { title: "Découvrir le monde des ACM", text: "Séjours, centres de loisirs, mini-camps. Cadre légal, acteurs, débouchés." },
              { title: "Créer une animation de A à Z", text: "Veillée, grand jeu, atelier — imaginer, monter, animer en vrai." },
              { title: "Comprendre l'enfant", text: "Besoins par tranche d'âge, spécificités, handicap, neuroatypie." },
              { title: "Gérer un groupe", text: "Conflits, dynamique, posture d'adulte référent. Mises en situation." },
              { title: "Aborder les sujets difficiles", text: "Violences sexistes, laïcité, discrimination, responsabilité civile/pénale." },
            ].map((item, i) => (
              <li key={i} style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 24, padding: "20px 0", borderBottom: `1px dashed ${M.ink}` }}>
                <span className="ed" style={{ fontSize: 36, fontWeight: 400, fontStyle: "italic", color: M.violet, lineHeight: 1 }}>0{i + 1}.</span>
                <div>
                  <h4 className="ed" style={{ fontSize: 24, fontWeight: 600, margin: 0, marginBottom: 6, letterSpacing: -0.5 }}>{item.title}</h4>
                  <p style={{ fontSize: 14, lineHeight: 1.55, margin: 0, opacity: 0.78 }}>{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div style={{ position: "sticky", top: 100, alignSelf: "flex-start" }}>
          <div style={{ background: M.yellow, padding: 32, borderRadius: 24, border: `2px solid ${M.ink}`, boxShadow: `8px 8px 0 ${M.ink}` }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: 2.5, fontWeight: 700, color: M.ink, marginBottom: 18 }}>📋 EN PRATIQUE</div>
            {[
              { k: "Durée", v: "8 jours · arrivée vendredi soir, départ samedi suivant" },
              { k: "Hébergement", v: "Internat en pension complète, dortoirs avec sdb privative" },
              { k: "Lieu", v: "Domaine de Gravières · Lanobre, Cantal" },
              { k: "Tarif", v: "550 € — transport optionnel (Lyon 40 € · Clermont 25 €)" },
              { k: "Effectif", v: "16 stagiaires max · 8 places restantes" },
              { k: "Inscription", v: "Formulaire sécurisé Yapla" },
            ].map((row) => (
              <div key={row.k} style={{ borderBottom: `1.5px dashed ${M.ink}`, paddingBottom: 12, marginBottom: 12 }}>
                <div className="mono" style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: M.ink, opacity: 0.6, marginBottom: 4 }}>{row.k}</div>
                <div style={{ fontSize: 14, color: M.ink, lineHeight: 1.4 }}>{row.v}</div>
              </div>
            ))}
            <button style={{ width: "100%", marginTop: 20, background: M.ink, color: M.cream, border: "none", borderRadius: 999, padding: "14px", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
              Ouvrir le formulaire ↗
            </button>
            <div style={{ marginTop: 16, padding: 14, background: M.ink, color: M.cream, borderRadius: 12 }}>
              <div className="mono" style={{ fontSize: 10, color: M.yellow, letterSpacing: 1, marginBottom: 6 }}>⚡ HÉSITES ?</div>
              <div style={{ fontSize: 13, marginBottom: 10 }}>Un appel de 10 min pour faire le point. Sans engagement.</div>
              <button style={{ width: "100%", background: M.ochre, color: M.ink, border: "none", borderRadius: 999, padding: "10px", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
                ☎ Demande un rappel
              </button>
            </div>
          </div>
        </div>
      </div>

      <StickyCallbackBar />
    </div>
  );
}

// =============== FORMATION APPRO DETAIL ===============
function FormationApproPage() {
  return (
    <div className="mura" style={{ background: M.cream, color: M.ink, width: "100%" }}>
      <MNav />

      <div className="mono" style={{ display: "flex", justifyContent: "space-between", padding: "12px 48px", fontSize: 11, color: M.ink, opacity: 0.6, borderBottom: `1px dashed ${M.ink}`, background: M.paper }}>
        <span>← FORMATIONS / APPRO ÉTÉ 2026</span>
        <span>SESSION N° 03 / 2026 · 6 PLACES SUR 12</span>
      </div>

      {/* Hero — accent ochre/orange + petit globe pour l'identité "international" */}
      <div style={{ background: M.ochre, color: M.ink, padding: "60px 48px", position: "relative", borderBottom: `2px solid ${M.ink}`, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, opacity: 0.18 }}>
          <Picto kind="globe" size={340} color={M.ink} />
        </div>
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
              <span style={{ background: M.violet, color: M.cream, padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, border: `2px solid ${M.ink}` }}>APPROFONDISSEMENT</span>
              <span style={{ background: M.cream, color: M.ink, padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, border: `2px solid ${M.ink}` }}>SÉJOUR À L'ÉTRANGER</span>
              <span style={{ background: M.yellow, color: M.ink, padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, border: `2px solid ${M.ink}` }}>ÉCHANGE DE JEUNES</span>
            </div>
            <div className="hand" style={{ fontSize: 38, color: M.red, marginBottom: -10, transform: "rotate(-3deg)" }}>direction</div>
            <h1 style={{ fontSize: 116, fontWeight: 700, letterSpacing: -5, lineHeight: 0.88, margin: 0 }}>
              28 juin<br />
              <span className="ed" style={{ fontStyle: "italic", fontSize: 60 }}>au 4 juillet</span><br />
              2026
            </h1>
            <p style={{ fontSize: 17, marginTop: 24, maxWidth: 560, lineHeight: 1.5, opacity: 0.9 }}>
              Pour les futur·es animateur·rices qui veulent encadrer des séjours à l'étranger, des échanges interculturels et des projets européens — 6 jours d'immersion, en français.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
              <button style={{ background: M.ink, color: M.yellow, border: "none", borderRadius: 999, padding: "16px 26px", fontSize: 14, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer", boxShadow: `4px 4px 0 ${M.cream}` }}>
                Je m'inscris (450 €) →
              </button>
              <button style={{ background: M.cream, color: M.ink, border: `2px solid ${M.ink}`, borderRadius: 999, padding: "16px 26px", fontSize: 14, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer" }}>
                ☎ Sois rappelé·e
              </button>
            </div>
          </div>
          {/* Visuel : carte/timbre style passeport */}
          <div style={{ position: "relative" }}>
            <div style={{ background: M.cream, padding: 14, borderRadius: 12, border: `3px dashed ${M.ink}`, boxShadow: `8px 8px 0 ${M.ink}`, transform: "rotate(2deg)", position: "relative" }}>
              <div className="mono" style={{ fontSize: 10, color: M.ink, opacity: 0.6, letterSpacing: 1.5, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                <span>★ PASSEPORT MURATHÈNES</span>
                <span>FR · 2026</span>
              </div>
              <Photo src="public/APPRO/1.jpeg" alt="APPRO — séjour international" ratio="4/3" />
              <div style={{ marginTop: 10, padding: 10, background: M.paper, borderRadius: 6, border: `1px solid ${M.ink}` }}>
                <div className="hand" style={{ fontSize: 22, color: M.violet, lineHeight: 1, transform: "rotate(-1deg)" }}>destination : ailleurs</div>
                <div className="mono" style={{ fontSize: 10, color: M.ink, opacity: 0.6, letterSpacing: 1, marginTop: 4 }}>★★★ INTERCULTURALITÉ · MOBILITÉ · LANGUES ★★★</div>
              </div>
            </div>
            <div style={{ position: "absolute", bottom: -36, left: -28, width: 140, transform: "rotate(-7deg)", border: `3px solid ${M.ink}`, borderRadius: 6, boxShadow: `4px 4px 0 ${M.ink}`, overflow: "hidden" }}>
              <Photo src="public/APPRO/2.jpeg" alt="APPRO 2" ratio="1/1" />
            </div>
            <div style={{ position: "absolute", top: -22, right: -30, transform: "rotate(8deg)" }}>
              <div style={{ width: 90, height: 90, borderRadius: "50%", background: M.red, color: M.cream, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `3px solid ${M.ink}`, boxShadow: `4px 4px 0 ${M.ink}`, textAlign: "center" }}>
                <span className="hand" style={{ fontSize: 18, lineHeight: 1 }}>en</span>
                <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: -1, lineHeight: 1 }}>FRANÇAIS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Différence vs FG bandeau */}
      <div style={{ background: M.ink, color: M.cream, padding: "40px 48px", borderBottom: `2px solid ${M.ink}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 32, alignItems: "center", maxWidth: 1280 }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: 2.5, color: M.yellow, fontWeight: 700, whiteSpace: "nowrap" }}>§ PRÉ-REQUIS</div>
          <div style={{ fontSize: 17, lineHeight: 1.5 }}>
            Cette formation est <strong>l'étape 3 du BAFA</strong>. Tu dois avoir validé ta <span style={{ color: M.ochre, fontWeight: 600 }}>formation générale</span> et un <span style={{ color: M.ochre, fontWeight: 600 }}>stage pratique d'au moins 14 jours</span> pour t'inscrire.
          </div>
          <a style={{ color: M.yellow, fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", borderBottom: `2px solid ${M.yellow}`, paddingBottom: 2, cursor: "pointer" }}>Voir la FG →</a>
        </div>
      </div>

      {/* Body : 2 thèmes (BAFA + Appro) côte à côte, puis sidebar sticky */}
      <div style={{ padding: "100px 48px", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 80, background: M.cream, borderBottom: `1.5px solid ${M.ink}` }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: M.red, letterSpacing: 2.5, fontWeight: 700, marginBottom: 14 }}>§ A — LE CONTENU</div>
          <h2 style={{ fontSize: 56, fontWeight: 700, letterSpacing: -2, lineHeight: 1, margin: 0, marginBottom: 32 }}>
            Deux faces, <span className="ed" style={{ fontStyle: "italic", color: M.ochre }}>une formation.</span>
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.6, opacity: 0.85, marginBottom: 40 }}>
            Tu approfondis tes acquis BAFA <strong>tout en</strong> te spécialisant sur les enjeux d'un séjour à l'étranger / échange de jeunes.
          </p>

          {/* Bloc 1 : Affiner ta posture */}
          <div style={{ background: M.paper, border: `2px solid ${M.ink}`, borderRadius: 24, padding: 28, marginBottom: 24, boxShadow: `5px 5px 0 ${M.violet}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: M.violet, color: M.cream, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, border: `2px solid ${M.ink}` }}>A</div>
              <h3 className="ed" style={{ fontSize: 28, fontWeight: 600, fontStyle: "italic", margin: 0, letterSpacing: -1 }}>Affiner ta posture d'animateur·rice</h3>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.85, marginBottom: 18 }}>Approfondir les acquis de la Formation Générale.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {[
                { t: "Expérimenter & analyser", d: "Grands jeux, veillées, situations d'animation, projets collectifs." },
                { t: "Échanger", d: "Avec les stagiaires, les formateur·rices : partage d'expériences." },
                { t: "Approfondir & questionner", d: "Gestion de groupe, sensibiliser, prévenir, rôle d'anim." },
              ].map((it, i) => (
                <div key={i} style={{ background: M.cream, padding: 16, borderRadius: 12, border: `1.5px solid ${M.ink}` }}>
                  <div className="mono" style={{ fontSize: 10, color: M.violet, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 }}>0{i + 1}.</div>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, letterSpacing: -0.2 }}>{it.t}</div>
                  <div style={{ fontSize: 12, opacity: 0.75, lineHeight: 1.5 }}>{it.d}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bloc 2 : Spécialisation séjour étranger */}
          <div style={{ background: M.paper, border: `2px solid ${M.ink}`, borderRadius: 24, padding: 28, boxShadow: `5px 5px 0 ${M.ochre}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: M.ochre, color: M.ink, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, border: `2px solid ${M.ink}` }}>B</div>
              <h3 className="ed" style={{ fontSize: 28, fontWeight: 600, fontStyle: "italic", margin: 0, letterSpacing: -1 }}>Comprendre les enjeux d'un séjour à l'étranger</h3>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.85, marginBottom: 18 }}>Spécialisation interculturelle et internationale.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              {[
                { t: "Gestion logistique", d: "Transports, réglementation, hébergement, alimentation, budget." },
                { t: "Activités spécifiques", d: "Multilingues, multiculturelles, peu de matériel, terrain inconnu." },
                { t: "Publics & partenaires", d: "Spécificités ados France/Europe, partenaires du monde entier, prépa à distance." },
                { t: "Immersion pratique", d: "Élaboration menus, mise en place d'animations type séjour, intervenants experts." },
              ].map((it, i) => (
                <div key={i} style={{ background: M.cream, padding: 16, borderRadius: 12, border: `1.5px solid ${M.ink}` }}>
                  <div className="mono" style={{ fontSize: 10, color: M.ochre, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 }}>0{i + 1}.</div>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, letterSpacing: -0.2 }}>{it.t}</div>
                  <div style={{ fontSize: 12, opacity: 0.75, lineHeight: 1.5 }}>{it.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ position: "sticky", top: 100, alignSelf: "flex-start" }}>
          <div style={{ background: M.violet, color: M.cream, padding: 32, borderRadius: 24, border: `2px solid ${M.ink}`, boxShadow: `8px 8px 0 ${M.ink}` }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: 2.5, fontWeight: 700, color: M.yellow, marginBottom: 18 }}>📋 EN PRATIQUE</div>
            {[
              { k: "Durée", v: "6 jours · arrivée dimanche, départ samedi suivant" },
              { k: "Hébergement", v: "Internat en pension complète, dortoirs avec sdb privative" },
              { k: "Lieu", v: "Domaine de Gravières · Lanobre, Cantal" },
              { k: "Tarif", v: "450 € — transport optionnel (Lyon 40 € · Clermont 25 €)" },
              { k: "Effectif", v: "12 stagiaires max · 6 places restantes" },
              { k: "Pré-requis", v: "Formation générale + 14 jours de stage pratique validés" },
            ].map((row) => (
              <div key={row.k} style={{ borderBottom: `1.5px dashed ${M.cream}55`, paddingBottom: 12, marginBottom: 12 }}>
                <div className="mono" style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: M.yellow, opacity: 0.85, marginBottom: 4 }}>{row.k}</div>
                <div style={{ fontSize: 14, lineHeight: 1.4 }}>{row.v}</div>
              </div>
            ))}
            <button style={{ width: "100%", marginTop: 20, background: M.yellow, color: M.ink, border: "none", borderRadius: 999, padding: "14px", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
              Ouvrir le formulaire ↗
            </button>
            <div style={{ marginTop: 16, padding: 14, background: M.ink, color: M.cream, borderRadius: 12 }}>
              <div className="mono" style={{ fontSize: 10, color: M.ochre, letterSpacing: 1, marginBottom: 6 }}>⚡ DES QUESTIONS ?</div>
              <div style={{ fontSize: 13, marginBottom: 10 }}>L'appro c'est plus rare : on prend 10 min pour répondre à toutes tes questions.</div>
              <button style={{ width: "100%", background: M.ochre, color: M.ink, border: "none", borderRadius: 999, padding: "10px", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
                ☎ Demande un rappel
              </button>
            </div>
          </div>
        </div>
      </div>

      <StickyCallbackBar />
    </div>
  );
}

Object.assign(window, { HomePage, BafaPage, InfosPratiquesPage, QuiSommesNousPage, FormationDetailPage, FormationApproPage });
