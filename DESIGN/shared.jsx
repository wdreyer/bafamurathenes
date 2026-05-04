// Placeholder image component — diagonal stripes with mono explainer label
function PhotoPlaceholder({ label, ratio = "16/9", color = "#c8b8a8", style }) {
  return (
    <div style={{
      aspectRatio: ratio,
      width: "100%",
      backgroundColor: color,
      backgroundImage: `repeating-linear-gradient(135deg, rgba(0,0,0,0.06) 0 12px, rgba(0,0,0,0) 12px 24px)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "rgba(0,0,0,0.55)",
      fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
      fontSize: 11,
      letterSpacing: 0.5,
      textTransform: "uppercase",
      ...style,
    }}>
      [ {label} ]
    </div>
  );
}

// The Murathènes M logo, stylized — we recreate the wave-shape M
function MuraLogo({ color = "#6b5bd6", size = 36 }) {
  return (
    <svg width={size} height={size * 1.05} viewBox="0 0 40 42" fill="none" aria-label="Murathènes">
      <path
        d="M2 38 C 2 18, 6 4, 12 4 C 16 4, 18 12, 20 22 C 22 12, 24 4, 28 4 C 34 4, 38 18, 38 38"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="2" cy="38" r="2.2" fill={color} />
      <circle cx="38" cy="38" r="2.2" fill={color} />
    </svg>
  );
}

// Hand-drawn squiggly underline
function Squiggle({ color = "#f5a623", width = 200, height = 14, strokeWidth = 4 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 200 14" preserveAspectRatio="none" style={{ display: "block" }}>
      <path d="M2 8 Q 20 0, 40 8 T 80 8 T 120 8 T 160 8 T 198 8" stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
    </svg>
  );
}

// Simple iconographic pictogram, hand-drawn feel
function Picto({ kind, size = 28, color = "currentColor" }) {
  const s = { width: size, height: size, fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (kind) {
    case "tent":
      return (<svg viewBox="0 0 24 24" {...s}><path d="M12 4 L3 20 H21 Z" /><path d="M12 4 L12 20" /><path d="M8 20 L12 14 L16 20" /></svg>);
    case "flame":
      return (<svg viewBox="0 0 24 24" {...s}><path d="M12 3 C 14 7, 18 8, 18 14 a6 6 0 0 1 -12 0 c 0 -3, 2 -4, 3 -7 c 1 4, 3 4, 3 1 c 0 -2, 0 -3, 0 -5 z" /></svg>);
    case "sun":
      return (<svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="4" /><path d="M12 2 V5 M12 19 V22 M2 12 H5 M19 12 H22 M4.5 4.5 L6.5 6.5 M17.5 17.5 L19.5 19.5 M4.5 19.5 L6.5 17.5 M17.5 6.5 L19.5 4.5" /></svg>);
    case "heart":
      return (<svg viewBox="0 0 24 24" {...s}><path d="M12 20 C 4 14, 2 10, 5 6 c 2 -3, 6 -1, 7 2 c 1 -3, 5 -5, 7 -2 c 3 4, 1 8, -7 14 z" /></svg>);
    case "star":
      return (<svg viewBox="0 0 24 24" {...s}><path d="M12 3 L14.5 9.5 L21 10 L16 14.5 L17.5 21 L12 17.5 L6.5 21 L8 14.5 L3 10 L9.5 9.5 Z" /></svg>);
    case "speech":
      return (<svg viewBox="0 0 24 24" {...s}><path d="M4 5 H20 V16 H13 L8 20 V16 H4 Z" /></svg>);
    case "compass":
      return (<svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9" /><path d="M15 9 L11 11 L9 15 L13 13 Z" /></svg>);
    case "leaf":
      return (<svg viewBox="0 0 24 24" {...s}><path d="M5 19 C 5 9, 13 4, 20 4 C 20 12, 15 19, 5 19 Z" /><path d="M5 19 L13 11" /></svg>);
    case "arrow":
      return (<svg viewBox="0 0 24 24" {...s}><path d="M4 12 H20 M14 6 L20 12 L14 18" /></svg>);
    case "calendar":
      return (<svg viewBox="0 0 24 24" {...s}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10 H21 M8 3 V7 M16 3 V7" /></svg>);
    case "mountain":
      return (<svg viewBox="0 0 24 24" {...s}><path d="M2 20 L9 8 L13 14 L16 10 L22 20 Z" /><circle cx="9" cy="6" r="1.5" /></svg>);
    case "people":
      return (<svg viewBox="0 0 24 24" {...s}><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2" /><path d="M3 20 c 1 -4, 4 -6, 6 -6 s 5 2, 6 6 M14 20 c 0 -3, 1 -5, 3 -5 s 3 2, 3 5" /></svg>);
    case "globe":
      return (<svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9" /><path d="M3 12 H21 M12 3 C 8 7, 8 17, 12 21 M12 3 C 16 7, 16 17, 12 21" /></svg>);
    default:
      return null;
  }
}

// Real photo with same API surface as PhotoPlaceholder (style/ratio passthrough)
function Photo({ src, alt = "", ratio = "16/9", style, objectPosition = "center" }) {
  const isAuto = ratio === "auto";
  return (
    <div style={{
      width: "100%",
      aspectRatio: isAuto ? undefined : ratio,
      overflow: "hidden",
      background: "#1a1530",
      ...style,
    }}>
      <img src={src} alt={alt} loading="lazy" style={{
        width: "100%", height: "100%", objectFit: "cover", objectPosition, display: "block",
      }} />
    </div>
  );
}

Object.assign(window, { PhotoPlaceholder, Photo, MuraLogo, Squiggle, Picto });
