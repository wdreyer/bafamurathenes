export type TrainingScope = "general" | "appro" | "both";
export type GuideCategory = "animation" | "cooperation" | "organisation" | "posture" | "repere";

export type TrainerResource = {
  id: string;
  title: string;
  description: string;
  useWhen: string;
  category: GuideCategory;
  scope: TrainingScope;
  kind: "pdf" | "docx";
  pages?: number;
  href: string;
};

const root = "/formateurs/ressources";

export const guideCategories: { id: GuideCategory; title: string; subtitle: string }[] = [
  { id: "repere", title: "Repères de formation", subtitle: "Construire et ajuster le déroulé pédagogique" },
  { id: "animation", title: "Animation & créativité", subtitle: "Faire vivre le groupe et créer ensemble" },
  { id: "cooperation", title: "Coopération & interculturel", subtitle: "Travailler entre équipes et au-delà des langues" },
  { id: "organisation", title: "Organisation du séjour", subtitle: "Préparer les temps de vie et les déplacements" },
  { id: "posture", title: "Posture & protection", subtitle: "Écouter, prévenir et accompagner" },
];

export const trainerResources: TrainerResource[] = [
  {
    id: "temps-indicatifs", title: "Temps de formation indicatifs", category: "repere", scope: "both", kind: "docx",
    description: "Référentiel des thèmes et mises en situation à prévoir selon la formation.",
    useWhen: "Pour préparer la progression de session et repérer les temps à compléter.",
    href: `${root}/temps-formation-indicatifs.docx`,
  },
  {
    id: "inventer-jouer-oser", title: "Inventer, jouer, oser", category: "animation", scope: "both", kind: "pdf", pages: 3,
    description: "Atelier d'imaginaire et d'expression orale à partir d'objets et de mises en scène.",
    useWhen: "Pour lancer une veillée, travailler l'aisance devant un groupe ou nourrir un projet d'animation.",
    href: `${root}/inventer-jouer-oser.pdf`,
  },
  {
    id: "choregraphie-cooperative", title: "La choré coopérative", category: "animation", scope: "general", kind: "pdf", pages: 1,
    description: "Projet collectif ritualisé mêlant mouvement, transmission et décision partagée.",
    useWhen: "Pour un fil rouge sur plusieurs jours, avec une création commune en fin de session.",
    href: `${root}/choregraphie-cooperative.pdf`,
  },
  {
    id: "activite-inter-equipe", title: "Activité inter-équipe", category: "cooperation", scope: "appro", kind: "pdf", pages: 2,
    description: "Mise en situation de coopération entre équipes d'animation de structures différentes.",
    useWhen: "Pour préparer un partenariat ou un échange de jeunes avec plusieurs équipes.",
    href: `${root}/activite-inter-equipe.pdf`,
  },
  {
    id: "activites-multilingues", title: "Activités multilingues", category: "cooperation", scope: "appro", kind: "pdf", pages: 2,
    description: "Concevoir et tester une activité compréhensible sans langue commune.",
    useWhen: "Pour préparer les séjours internationaux et exercer la communication non verbale.",
    href: `${root}/activites-multilingues.pdf`,
  },
  {
    id: "repas-budget", title: "Préparation des repas et gestion du budget", category: "organisation", scope: "appro", kind: "pdf", pages: 3,
    description: "Organisation collective des menus, des courses, des rôles et du budget.",
    useWhen: "Pour préparer un repas de groupe et suivre un fil rouge logistique pendant la semaine.",
    href: `${root}/repas-budget.pdf`,
  },
  {
    id: "gestion-transports", title: "Gestion des transports", category: "organisation", scope: "appro", kind: "pdf", pages: 2,
    description: "Check-list et mises en situation autour des déplacements collectifs et des imprévus.",
    useWhen: "Avant une sortie, un transfert ou un séjour avec plusieurs modes de transport.",
    href: `${root}/gestion-transports.pdf`,
  },
  {
    id: "communication-non-violente", title: "Communication non violente (CNV)", category: "posture", scope: "both", kind: "pdf", pages: 2,
    description: "Écoute active, reformulation et expression des besoins par des exercices en binôme.",
    useWhen: "Pour travailler la gestion des tensions et la communication dans l'équipe.",
    href: `${root}/communication-non-violente.pdf`,
  },
  {
    id: "reparation-educative", title: "Réparation éducative", category: "posture", scope: "both", kind: "pdf", pages: 3,
    description: "Différencier punition, sanction et réparation par des situations concrètes.",
    useWhen: "Pour préparer le temps sur l'autorité, les conflits et la posture éducative.",
    href: `${root}/reparation-educative.pdf`,
  },
  {
    id: "temps-maltraitance", title: "Temps maltraitance", category: "posture", scope: "both", kind: "pdf", pages: 4,
    description: "Support d'animation sur les violences faites aux enfants, l'écoute et l'alerte.",
    useWhen: "Pour un temps sensible à préparer avec l'équipe et le cadre de protection de la session.",
    href: `${root}/temps-maltraitance.pdf`,
  },
];
