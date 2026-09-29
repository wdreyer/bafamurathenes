import type { PlanActivity } from "@/lib/types";

/** `icon` value meaning "no icon on purpose" (undefined means "pick one from the title"). */
export const NO_ICON = "none";

export const planningIconGroups: { label: string; icons: { emoji: string; label: string }[] }[] = [
  { label: "Vie quotidienne", icons: [
    { emoji: "🍽️", label: "Repas" }, { emoji: "🥐", label: "Petit-déjeuner" }, { emoji: "☕", label: "Pause" },
    { emoji: "🍪", label: "Goûter" }, { emoji: "😴", label: "Repos" }, { emoji: "🚿", label: "Temps perso" },
    { emoji: "🧳", label: "Arrivée / départ" }, { emoji: "👋", label: "Accueil" },
  ] },
  { label: "Apprendre", icons: [
    { emoji: "📚", label: "Apport" }, { emoji: "✏️", label: "Atelier" }, { emoji: "💡", label: "Idées" },
    { emoji: "🧠", label: "Réflexion" }, { emoji: "📝", label: "Évaluation" }, { emoji: "🗣️", label: "Débat" },
    { emoji: "💬", label: "Échange" }, { emoji: "🎯", label: "Objectifs" }, { emoji: "📋", label: "Projet" },
    { emoji: "⚖️", label: "Cadre légal" }, { emoji: "🩹", label: "Sécurité / santé" },
  ] },
  { label: "Jouer & animer", icons: [
    { emoji: "🎲", label: "Jeu" }, { emoji: "🧩", label: "Jeu coopératif" }, { emoji: "🔥", label: "Grand jeu" },
    { emoji: "⚽", label: "Sport" }, { emoji: "🎨", label: "Activité manuelle" }, { emoji: "🎭", label: "Expression" },
    { emoji: "🎵", label: "Chant / musique" }, { emoji: "🌙", label: "Veillée" }, { emoji: "🌳", label: "Nature" },
    { emoji: "🏕️", label: "Camp" }, { emoji: "📖", label: "Conte" },
  ] },
  { label: "Groupe", icons: [
    { emoji: "🤝", label: "Coopération" }, { emoji: "👥", label: "Groupe" }, { emoji: "🌍", label: "Interculturel" },
    { emoji: "💜", label: "Bienveillance" }, { emoji: "⭐", label: "Bilan" }, { emoji: "🎉", label: "Fête" },
  ] },
];

// First match wins, so the more specific words come first.
const keywordIcons: [RegExp, string][] = [
  [/petit[- ]?d[ée]j/i, "🥐"],
  [/d[ée]jeuner|d[îi]ner|repas|souper/i, "🍽️"],
  [/go[ûu]ter/i, "🍪"],
  [/pause|caf[ée]/i, "☕"],
  [/veill[ée]e/i, "🌙"],
  [/grand[- ]jeu/i, "🔥"],
  [/jeu|ludique/i, "🎲"],
  [/chant|musique|danse|chor[ée]/i, "🎵"],
  [/sport|motricit/i, "⚽"],
  [/manuel|bricol|cr[ée]ati/i, "🎨"],
  [/th[ée][âa]tre|expression|impro/i, "🎭"],
  [/conte|lecture|histoire/i, "📖"],
  [/nature|balade|ext[ée]rieur|for[êe]t/i, "🌳"],
  [/bilan|[ée]valuation|retour/i, "⭐"],
  [/d[ée]bat|discussion|[ée]change|parole/i, "💬"],
  [/projet|pr[ée]paration|pr[ée]parer/i, "📋"],
  [/r[ée]glementation|l[ée]gisla|cadre|responsabilit/i, "⚖️"],
  [/s[ée]curit|sant[ée]|secours|soin/i, "🩹"],
  [/accueil|pr[ée]sentation|bienvenue/i, "👋"],
  [/d[ée]part|arriv[ée]e|installation|valise/i, "🧳"],
  [/coop[ée]ration|coop[ée]ratif/i, "🤝"],
  [/interculturel|monde/i, "🌍"],
  [/temps libre|repos|sieste/i, "😴"],
  [/atelier/i, "✏️"],
  [/apport|th[ée]orie|d[ée]couverte/i, "📚"],
];

export function iconForActivity(activity: Pick<PlanActivity, "title" | "icon">) {
  if (activity.icon === NO_ICON) return "";
  if (activity.icon) return activity.icon;
  return keywordIcons.find(([pattern]) => pattern.test(activity.title))?.[1] || "";
}
