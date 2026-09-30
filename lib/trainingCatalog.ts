import type { FormationType, PlanActivity, TrainingTimeCategory, TrainingTimeScope } from "@/lib/types";
import { trainerResources } from "@/lib/trainerGuide";
import type { GuideResourceRecord } from "@/lib/guideLibrary";

export type CatalogCategory = TrainingTimeCategory;
export type TrainingCatalogItem = {
  id: string;
  title: string;
  category: CatalogCategory;
  scope: TrainingTimeScope;
  content: string;
  color: PlanActivity["color"];
  resourceId?: string;
  /** "Temps théorique" or "Mise en situation pratique", as in the indicative times document. */
  kind?: TrainingTimeKind;
  /** Admin removed it from the guide (built-in times can't be deleted, only hidden). */
  hidden?: boolean;
};

export type TrainingTimeKind = "theorie" | "pratique";
export const trainingTimeKinds: { id: TrainingTimeKind; label: string }[] = [
  { id: "theorie", label: "Temps théorique" },
  { id: "pratique", label: "Mise en situation pratique" },
];

export const catalogCategories: { id: CatalogCategory; label: string }[] = [
  { id: "cadre", label: "Cadre & BAFA" },
  { id: "pedagogie", label: "Pédagogie & posture" },
  { id: "animation", label: "Animation & pratique" },
  { id: "vie", label: "Vie collective" },
  { id: "interculturel", label: "Interculturel & voyage" },
  { id: "bilan", label: "Bilans & évaluations" },
];

const builtInCatalog: TrainingCatalogItem[] = [
  { id: "regles-vie", title: "Règles de vie", category: "cadre", scope: "both", content: "Construire le cadre de vie et les règles du groupe.", color: "mint" },
  { id: "presentation-formation", title: "Présentation de la formation", category: "cadre", scope: "both", content: "Présenter le déroulé, les objectifs et les attentes de la session.", color: "sky" },
  { id: "criteres-evaluation", title: "Critères d'évaluation", category: "cadre", scope: "both", content: "Partager les critères et modalités d'évaluation du stage.", color: "sky" },
  { id: "commissions", title: "Commissions", category: "cadre", scope: "both", content: "Planning, repérage, rangement et inventaire.", color: "mint" },
  { id: "cursus-bafa", title: "Cursus et critères BAFA", category: "cadre", scope: "general", content: "Étapes du cursus BAFA et critères de validation.", color: "sky" },
  { id: "role-animateur", title: "Rôle de l'animateur·ice", category: "cadre", scope: "general", content: "Fonctions, aptitudes et responsabilités de l'animation.", color: "sky" },
  { id: "acm", title: "Différents types d'ACM", category: "cadre", scope: "both", content: "Panorama des accueils collectifs de mineurs.", color: "sky" },
  { id: "reglementation", title: "Réglementation en ACM", category: "cadre", scope: "both", content: "Cadre réglementaire et responsabilités de l'équipe.", color: "sky" },
  { id: "responsabilites", title: "Responsabilités civile et pénale", category: "cadre", scope: "both", content: "Repères sur la responsabilité civile et pénale en ACM.", color: "lilac" },
  { id: "laicite", title: "Laïcité et valeurs de la République", category: "cadre", scope: "both", content: "Échanger sur les valeurs et leur traduction en animation.", color: "lilac" },
  { id: "cee", title: "CEE et contrats", category: "cadre", scope: "both", content: "Comprendre le contrat d'engagement éducatif.", color: "sky" },
  { id: "droits-enfants", title: "Droits des enfants", category: "cadre", scope: "both", content: "Droits de l'enfant et responsabilité éducative.", color: "lilac" },
  { id: "connaissance-publics", title: "Connaissance des publics", category: "pedagogie", scope: "both", content: "Les différentes tranches d'âge et leurs besoins.", color: "sky" },
  { id: "vie-quotidienne", title: "Vie quotidienne", category: "pedagogie", scope: "both", content: "Journée type et organisation des différents temps de la vie quotidienne.", color: "mint" },
  { id: "projets", title: "Projets éducatif, pédagogique et d'animation", category: "pedagogie", scope: "both", content: "Projets éducatif, pédagogique, d'animation et d'activité.", color: "lilac" },
  { id: "education-populaire", title: "Éducation populaire", category: "pedagogie", scope: "both", content: "Repères et pratiques de l'éducation populaire.", color: "lilac" },
  { id: "objectifs-pedagogiques", title: "Intentions et objectifs pédagogiques", category: "pedagogie", scope: "both", content: "Formuler des intentions et objectifs pour une activité.", color: "sky" },
  { id: "gestion-conflits", title: "Gestion des conflits / CNV", category: "pedagogie", scope: "both", content: "Écoute active, reformulation et besoins dans les tensions du groupe.", color: "lilac", resourceId: "communication-non-violente" },
  { id: "autorite-sanction", title: "Autorité, sanction ou punition ?", category: "pedagogie", scope: "both", content: "Choisir une réponse éducative proportionnée et réparatrice.", color: "coral", resourceId: "reparation-educative" },
  { id: "violence-maltraitance", title: "Violence et maltraitance", category: "pedagogie", scope: "both", content: "Prévention, écoute et alerte dans le cadre de protection de l'enfance.", color: "coral", resourceId: "temps-maltraitance" },
  { id: "consentement", title: "Consentement en ACM", category: "pedagogie", scope: "both", content: "Consentement en ACM : en transversal et sur un temps formel.", color: "coral" },
  { id: "discriminations", title: "Discriminations et harcèlement", category: "pedagogie", scope: "both", content: "Identifier et prévenir les discriminations et le harcèlement.", color: "coral" },
  { id: "handicaps", title: "Différences et handicaps", category: "pedagogie", scope: "both", content: "Adapter les activités aux besoins et capacités de chacun.", color: "sky" },
  { id: "travail-equipe", title: "Travail en équipe", category: "pedagogie", scope: "both", content: "Coopération, communication et répartition des rôles.", color: "mint" },
  { id: "starter", title: "Starter", category: "animation", scope: "both", content: "Savoir animer un petit jeu d'attente : mise en place rapide, pas ou peu de matériel, règles simples.", color: "mint" },
  { id: "chant", title: "Chant", category: "animation", scope: "both", content: "Savoir animer un chant, le faire apprendre, répéter et donner vie aux paroles.", color: "mint" },
  { id: "activite-intermediaire", title: "Temps d'animation intermédiaire", category: "animation", scope: "general", content: "Savoir animer seul·e ou en petite équipe une activité de 30 min environ : créer un imaginaire, respecter le PSAADRAFRA SIOU.", color: "sky" },
  { id: "grand-jeu", title: "Grand jeu / veillée", category: "animation", scope: "both", content: "Savoir animer un grand jeu et une veillée en grande équipe (4 ou 5 stagiaires) en respectant le PSAADRAFRA SIOU.", color: "coral" },
  { id: "journal-stage", title: "Journal du stage", category: "animation", scope: "both", content: "Savoir animer une présentation ludique de la journée d'activité (journal, saynète, journal TV…).", color: "lemon" },
  { id: "activites-manuelles", title: "Activités manuelles", category: "animation", scope: "general", content: "Savoir animer seul·e ou en équipe une activité manuelle.", color: "mint" },
  { id: "fil-rouge", title: "Fil rouge / projet", category: "animation", scope: "both", content: "Savoir animer seul·e ou en équipe un projet fédérateur sur toute la durée du stage (création artistique collective, spectacle, jeu par étapes…).", color: "lemon" },
  { id: "choregraphie", title: "La choré coopérative", category: "animation", scope: "general", content: "Projet collectif mêlant mouvement, transmission et décision partagée.", color: "coral", resourceId: "choregraphie-cooperative" },
  { id: "imaginaire", title: "Imaginaire et expression", category: "animation", scope: "both", content: "Atelier d'imaginaire et d'expression à partir d'objets et de mises en scène.", color: "coral", resourceId: "inventer-jouer-oser" },
  { id: "analyser", title: "Analyser une activité", category: "animation", scope: "both", content: "Savoir analyser seul·e et en équipe un grand jeu ou un temps de vie collective.", color: "sky" },
  { id: "repas", title: "Gestion des repas", category: "vie", scope: "both", content: "Savoir préparer en groupe un repas collectif en respectant les normes d'hygiène en vigueur.", color: "lemon" },
  { id: "budget-repas", title: "Repas et budget", category: "vie", scope: "appro", content: "Menus, courses, rôles et suivi du budget collectif.", color: "lemon", resourceId: "repas-budget" },
  { id: "transports", title: "Gestion des transports", category: "vie", scope: "appro", content: "Déplacements collectifs, imprévus et sécurité du groupe.", color: "sky", resourceId: "gestion-transports" },
  { id: "interculturalite", title: "Interculturalité et multiculturalisme", category: "interculturel", scope: "appro", content: "Freins et leviers de la rencontre interculturelle.", color: "lilac" },
  { id: "projet-jeunes", title: "Échanges de jeunes et projet collectif", category: "interculturel", scope: "appro", content: "Construire une création collective dans un échange de jeunes.", color: "lilac" },
  { id: "activite-interculturelle", title: "Activité favorisant l'interculturalité", category: "interculturel", scope: "appro", content: "Imaginer une activité qui crée des interactions et mobilise les cultures du groupe.", color: "mint", resourceId: "activite-inter-equipe" },
  { id: "groupes-multiculturels", title: "Gestion de groupes multiculturels", category: "interculturel", scope: "appro", content: "Langue, respect et vie quotidienne dans un groupe multiculturel.", color: "lilac" },
  { id: "activites-multilingues", title: "Activités multilingues", category: "interculturel", scope: "appro", content: "Concevoir une activité compréhensible sans langue commune.", color: "sky", resourceId: "activites-multilingues" },
  { id: "programmes-internationaux", title: "Programmes internationaux", category: "interculturel", scope: "appro", content: "Participer à des rencontres internationales ou en créer.", color: "sky" },
  { id: "logistique-etranger", title: "Logistique d'un séjour à l'étranger", category: "interculturel", scope: "appro", content: "Transports, hébergement, visas, CEAM et urgences.", color: "lemon", resourceId: "gestion-transports" },
  { id: "retour-stage-pratique", title: "Retour de stage pratique", category: "bilan", scope: "appro", content: "Partager les expériences vécues en stage pratique.", color: "sky" },
  { id: "auto-evaluation", title: "Auto-évaluation mi-stage et fin de stage", category: "bilan", scope: "both", content: "Faire le point sur sa progression et ses besoins.", color: "mint" },
  { id: "entretiens", title: "Entretiens individuels", category: "bilan", scope: "both", content: "Préparer les entretiens de début, milieu ou fin de stage.", color: "sky" },
  { id: "evaluation-finale", title: "Évaluation de fin de stage", category: "bilan", scope: "both", content: "Clore la session et formaliser les évaluations.", color: "mint" },
  { id: "sexualite", title: "Sexualité en ACM", category: "pedagogie", scope: "general", content: "Aborder la vie affective et sexuelle des jeunes accueilli·es et la posture de l'équipe.", color: "coral" },
  { id: "alcool-drogues-tabac", title: "Alcool, drogues et tabac", category: "pedagogie", scope: "both", content: "Prévention et réduction des risques, cadre légal et posture en ACM.", color: "coral" },
  { id: "types-grands-jeux", title: "Les types de grands jeux", category: "animation", scope: "general", content: "Panorama des grands jeux et de leurs intentions éducatives.", color: "coral" },
  { id: "organiser-activite", title: "Organiser une activité : PSAADRAFRA SIOU", category: "animation", scope: "both", content: "Préparation, sensibilisation, aménagement, accueil, déroulement, rythme, animation, fin, rangement, analyse, sécurité, imaginaire, objectif pédagogique, urgence.", color: "sky" },
  { id: "trouver-stage", title: "Trouver un stage pratique", category: "cadre", scope: "general", content: "Où chercher, CV et lettres de motivation.", color: "sky" },
  { id: "presentation-appro", title: "Présentation de l'appro échanges de jeunes", category: "interculturel", scope: "appro", content: "Présenter l'approfondissement « Échanges de jeunes et séjours à l'étranger » et la rencontre interculturelle.", color: "sky" },
  { id: "animation-appro", title: "Temps d'animation appro", category: "animation", scope: "appro", content: "Mener un projet d'animation et d'activité favorisant l'interculturalité.", color: "mint" },
];

// Mises en situation pratiques from the indicative times document; everything else is theory.
const practicalIds = new Set(["starter", "chant", "activite-intermediaire", "grand-jeu", "journal-stage", "activites-manuelles",
  "fil-rouge", "choregraphie", "analyser", "repas", "budget-repas", "activite-interculturelle", "activites-multilingues", "animation-appro"]);

export const trainingCatalog: TrainingCatalogItem[] = builtInCatalog.map((item) => ({ ...item, kind: practicalIds.has(item.id) ? "pratique" : "theorie" }));

export function catalogForFormation(type: FormationType) {
  const scope = type === "formation_generale" ? "general" : "appro";
  return trainingCatalog.filter((item) => item.scope === "both" || item.scope === scope);
}

/** Built-in times with admin edits applied (same id), plus times added from plannings or by admins; hidden ones removed. */
export function allCatalogTimes(customTimes: TrainingCatalogItem[]) {
  const merged = new Map(trainingCatalog.map((item) => [item.id, item]));
  customTimes.forEach((item) => merged.set(item.id, { ...merged.get(item.id), ...item }));
  return Array.from(merged.values()).filter((item) => !item.hidden).sort((a, b) =>
    catalogCategories.findIndex((item) => item.id === a.category) - catalogCategories.findIndex((item) => item.id === b.category)
    || a.title.localeCompare(b.title, "fr"));
}

export function catalogForFormationWithCustom(type: FormationType, customTimes: TrainingCatalogItem[]) {
  const scope = type === "formation_generale" ? "general" : "appro";
  return allCatalogTimes(customTimes).filter((item) => item.scope === "both" || item.scope === scope);
}

export function resourceForActivity(activity: Pick<PlanActivity, "resourceId">, resources?: GuideResourceRecord[]) {
  const dynamic = resources?.find((resource) => resource.id === activity.resourceId && resource.fileUrl);
  if (dynamic) return {
    id: dynamic.id,
    title: dynamic.title,
    href: dynamic.fileUrl!,
    kind: dynamic.fileType || "pdf",
  };
  return trainerResources.find((resource) => resource.id === activity.resourceId);
}
