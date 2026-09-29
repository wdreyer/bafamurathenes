import type { PlanActivity, PlanTheme } from "@/lib/types";

export const defaultThemes: PlanTheme[] = [
  { id: "theme-theorie", name: "Apport théorique", color: "lilac" },
  { id: "theme-quotidien", name: "Vie quotidienne", color: "sky" },
  { id: "theme-pratique", name: "Mise en pratique", color: "coral" },
  { id: "theme-preparation", name: "Préparation", color: "lemon" },
];

// Plannings made before the 4-theme reorganisation reference the old six themes: map them onto the new ones.
const legacyThemeIds: Record<string, string> = {
  "theme-sky": "theme-theorie", "theme-lilac": "theme-theorie",
  "theme-mint": "theme-pratique", "theme-coral": "theme-pratique",
  "theme-lemon": "theme-preparation", "theme-neutral": "theme-quotidien",
};
const legacyColorThemes: Record<PlanTheme["color"], string> = {
  sky: "theme-theorie", lilac: "theme-theorie", mint: "theme-pratique",
  coral: "theme-pratique", lemon: "theme-preparation", neutral: "theme-quotidien",
};

/** Saved plan themes → the 4 default themes (keeping renames/recolours) plus any custom theme; the old six are dropped. */
export function normalizeThemes(saved?: PlanTheme[] | null): PlanTheme[] {
  const list = saved || [];
  return [
    ...defaultThemes.map((theme) => ({ ...theme, ...list.find((item) => item.id === theme.id) })),
    ...list.filter((item) => !legacyThemeIds[item.id] && !defaultThemes.some((theme) => theme.id === item.id)),
  ];
}

export const themeColors: { id: PlanTheme["color"]; name: string; swatch: string; surface: string; fill: string }[] = [
  { id: "lilac", name: "Violet", swatch: "bg-[#8a2be2]", surface: "border-[#8a2be2] bg-[#f1e4ff] text-[#2e0b52]", fill: "bg-[#9d4edd] text-white" },
  { id: "sky", name: "Turquoise", swatch: "bg-[#00b4d8]", surface: "border-[#00b4d8] bg-[#dcf6fc] text-[#063845]", fill: "bg-[#48cae4] text-[#062b36]" },
  { id: "coral", name: "Corail", swatch: "bg-[#ff4d6d]", surface: "border-[#ff4d6d] bg-[#ffe3e8] text-[#5a0d1c]", fill: "bg-[#ff758f] text-[#3d0612]" },
  { id: "lemon", name: "Jaune", swatch: "bg-[#ffd000]", surface: "border-[#ffd000] bg-[#fff7cc] text-[#473a00]", fill: "bg-[#ffe03d] text-[#2e2600]" },
  { id: "mint", name: "Vert", swatch: "bg-[#06d6a0]", surface: "border-[#06d6a0] bg-[#d9fbf1] text-[#053d2e]", fill: "bg-[#3ee6b8] text-[#04382a]" },
  { id: "neutral", name: "Gris", swatch: "bg-[#6c6485]", surface: "border-[#6c6485] bg-[#ecebf2] text-[#26222f]", fill: "bg-[#a7a1bb] text-[#1f1b29]" },
];

export function themeForActivity(activity: PlanActivity, themes: PlanTheme[]): PlanTheme {
  const legacyId = (activity.themeId && legacyThemeIds[activity.themeId]) || legacyColorThemes[activity.color];
  return themes.find((theme) => theme.id === activity.themeId)
    || themes.find((theme) => theme.id === legacyId)
    || defaultThemes.find((theme) => theme.id === legacyId)
    || defaultThemes[0];
}

export function themeSurface(color: PlanTheme["color"]) {
  return themeColors.find((item) => item.id === color)?.surface || themeColors.find((item) => item.id === "neutral")!.surface;
}

export function themeFill(color: PlanTheme["color"]) {
  return themeColors.find((item) => item.id === color)?.fill || themeColors.find((item) => item.id === "neutral")!.fill;
}

export function themeSwatch(color: PlanTheme["color"]) {
  return themeColors.find((item) => item.id === color)?.swatch || themeColors.find((item) => item.id === "neutral")!.swatch;
}
