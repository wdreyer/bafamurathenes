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
  { id: "sky", name: "Bleu", swatch: "bg-sky-500", surface: "border-sky-400 bg-sky-50 text-sky-950", fill: "bg-sky-200 text-sky-950" },
  { id: "mint", name: "Vert", swatch: "bg-emerald-500", surface: "border-emerald-400 bg-emerald-50 text-emerald-950", fill: "bg-emerald-200 text-emerald-950" },
  { id: "lilac", name: "Mauve", swatch: "bg-violet-500", surface: "border-violet-400 bg-violet-50 text-violet-950", fill: "bg-violet-200 text-violet-950" },
  { id: "lemon", name: "Jaune", swatch: "bg-amber-400", surface: "border-amber-400 bg-amber-50 text-amber-950", fill: "bg-amber-200 text-amber-950" },
  { id: "coral", name: "Corail", swatch: "bg-rose-400", surface: "border-rose-400 bg-rose-50 text-rose-950", fill: "bg-rose-200 text-rose-950" },
  { id: "neutral", name: "Gris", swatch: "bg-slate-400", surface: "border-slate-300 bg-slate-50 text-slate-800", fill: "bg-slate-200 text-slate-800" },
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
