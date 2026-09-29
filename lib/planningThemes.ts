import type { PlanActivity, PlanTheme } from "@/lib/types";

export const defaultThemes: PlanTheme[] = [
  { id: "theme-sky", name: "Apports & repères", color: "sky" },
  { id: "theme-mint", name: "Mises en pratique", color: "mint" },
  { id: "theme-lilac", name: "Échanges & réflexion", color: "lilac" },
  { id: "theme-lemon", name: "Projets & préparation", color: "lemon" },
  { id: "theme-coral", name: "Animation & veillées", color: "coral" },
  { id: "theme-neutral", name: "Vie quotidienne", color: "neutral" },
];

export const themeColors: { id: PlanTheme["color"]; name: string; swatch: string; surface: string; fill: string }[] = [
  { id: "sky", name: "Bleu", swatch: "bg-[#3aaed8]", surface: "border-[#3aaed8] bg-[#d8f1fa] text-[#12384a]", fill: "bg-[#89d2ec] text-[#102f3d]" },
  { id: "mint", name: "Vert", swatch: "bg-[#299b78]", surface: "border-[#299b78] bg-[#d7f2e8] text-[#153d32]", fill: "bg-[#7ed3b8] text-[#15362d]" },
  { id: "lilac", name: "Mauve", swatch: "bg-[#792bb9]", surface: "border-[#792bb9] bg-[#eee1f8] text-[#381153]", fill: "bg-[#bd8be0] text-[#281039]" },
  { id: "lemon", name: "Jaune", swatch: "bg-[#d6c900]", surface: "border-[#d6c900] bg-[#fffbd0] text-[#443f00]", fill: "bg-[#f5ef72] text-[#332f00]" },
  { id: "coral", name: "Corail", swatch: "bg-[#e85d68]", surface: "border-[#e85d68] bg-[#ffe1e3] text-[#56191f]", fill: "bg-[#f49aa1] text-[#46151a]" },
  { id: "neutral", name: "Gris", swatch: "bg-[#625d70]", surface: "border-[#837d91] bg-[#eceaf0] text-[#292532]", fill: "bg-[#bbb6c5] text-[#292532]" },
];

export function themeForActivity(activity: PlanActivity, themes: PlanTheme[]): PlanTheme {
  return themes.find((theme) => theme.id === activity.themeId)
    || themes.find((theme) => theme.id === `theme-${activity.color}`)
    || themes.find((theme) => theme.color === activity.color)
    || defaultThemes.find((theme) => theme.color === activity.color)
    || defaultThemes[0];
}

export function themeSurface(color: PlanTheme["color"]) {
  return themeColors.find((item) => item.id === color)?.surface || themeColors[5].surface;
}

export function themeFill(color: PlanTheme["color"]) {
  return themeColors.find((item) => item.id === color)?.fill || themeColors[5].fill;
}

export function themeSwatch(color: PlanTheme["color"]) {
  return themeColors.find((item) => item.id === color)?.swatch || themeColors[5].swatch;
}
