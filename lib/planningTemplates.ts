import type { Formation, PlanActivity } from "@/lib/types";

type TemplateItem = [number, string, string, string, PlanActivity["color"]];

const general: TemplateItem[] = [
  [1,"17:50","19:00","Accueil, installation et règles de vie","mint"],[1,"20:30","22:00","Présentation BAFA et jeux de connaissance","sky"],
  [2,"09:00","10:30","Starter, cursus BAFA et commissions","mint"],[2,"10:45","12:00","Fonctions et aptitudes de l'animateur·ice","sky"],[2,"14:00","16:00","Besoins des stagiaires et éducation populaire","lilac"],[2,"16:30","18:20","Projet collectif et journal du BAFA","lemon"],[2,"20:30","22:00","Imaginaire et bilan du jour","coral"],
  [3,"09:00","12:00","Connaissance des publics et commissions","sky"],[3,"14:00","16:00","Jeux sportifs et préparation des activités","mint"],[3,"16:30","18:20","Réglementation et travail en équipe","lilac"],[3,"20:30","22:00","Préparation des jeux et bilan","lemon"],
  [4,"09:00","12:00","Connaissance des publics et violences ordinaires","coral"],[4,"14:00","16:00","Quiz et jeux sportifs","mint"],[4,"16:30","18:20","Sensibilisation aux handicaps","sky"],[4,"20:30","22:00","Préparation du grand jeu","lemon"],
  [5,"09:00","12:00","Rôles, responsabilités et temps de vie quotidienne","sky"],[5,"14:00","16:00","Évaluation de mi-stage et préparation","lilac"],[5,"16:30","18:20","Projet collectif et réglementation","mint"],[5,"20:30","22:00","Préparation de la veillée","coral"],
  [6,"09:00","12:00","Méthode du grand jeu et réglementation","lilac"],[6,"14:00","16:00","Grand jeu","mint"],[6,"16:30","18:20","Vie quotidienne et projet d'animation","sky"],[6,"20:30","22:00","Veillée et bilan","coral"],
  [7,"09:00","12:00","Sortie et découverte du territoire","mint"],[7,"14:00","16:00","Grand jeu et analyse","sky"],[7,"16:30","18:20","Gestion des conflits et communication non violente","lilac"],[7,"20:30","22:00","Veillée collective","coral"],
  [8,"09:00","12:00","Débats, réglementation et rôle d'assistant sanitaire","sky"],[8,"14:00","16:00","Projet collectif et préparation de la restitution","lemon"],[8,"16:30","18:20","Préparation de la représentation","mint"],[8,"20:30","22:00","Représentation collective","coral"],
  [9,"09:00","12:00","Stage pratique, bilan et rangement","lilac"],[9,"14:00","16:00","Évaluations individuelles et clôture","mint"],
];

const appro: TemplateItem[] = [
  [1,"18:00","19:00","Accueil des stagiaires","mint"],[1,"20:30","22:00","Présentations, cursus et projet de session","sky"],
  [2,"09:00","12:00","Chants, visite du domaine et commissions","mint"],[2,"14:00","16:00","Hygiène, repas et gestion du budget","lemon"],[2,"16:30","18:20","Courses et préparation des repas","sky"],[2,"20:30","22:00","Veillée imaginaire et théâtre","coral"],
  [3,"09:00","12:00","Dispositifs à l'étranger et projet de jeunes","lilac"],[3,"14:00","16:00","Retour des stages pratiques","sky"],[3,"16:30","18:20","Répartition des grands jeux","mint"],[3,"20:30","22:00","Violences ordinaires et maltraitance","coral"],
  [4,"09:00","12:00","Préparation du grand jeu et entretiens mi-stage","lemon"],[4,"14:00","16:00","Visite et découverte du territoire","mint"],[4,"16:30","18:20","Réglementation et transports","sky"],[4,"20:30","22:00","Veillée expression artistique","coral"],
  [5,"09:00","12:00","Handicap et activités multilingues","lilac"],[5,"14:00","16:00","Grand jeu et public préadolescent","mint"],[5,"16:30","18:20","Activités multilingues","sky"],[5,"20:30","22:00","Veillée conte interculturel","coral"],
  [6,"09:00","12:00","Gestion des conflits, sanctions et VSS","lilac"],[6,"14:00","16:00","Grand jeu sportif 3-5 ans","mint"],[6,"16:30","18:20","Activités multilingues","sky"],[6,"20:30","22:00","Veillée de clôture","coral"],
  [7,"09:00","12:00","Rangement, bilans et évaluations individuelles","lemon"],[7,"14:00","15:00","Clôture de la session","mint"],
];

export function buildPlanningTemplate(formation: Formation): PlanActivity[] {
  const items = formation.type === "formation_generale" ? general : appro;
  const dayCount = formation.type === "formation_generale" ? 9 : 7;
  const recurring: TemplateItem[] = Array.from({ length: dayCount - 2 }, (_, index) => index + 2)
    .flatMap((day) => [
      [day, "10:30", "10:45", "Pause", "neutral"],
      [day, "12:00", "14:00", "Repas", "neutral"],
      [day, "16:00", "16:30", "Pause", "neutral"],
      [day, "19:00", "20:30", "Repas", "neutral"],
    ] as TemplateItem[]);
  return [...items, ...recurring].map(([day,start,end,title,color], index) => ({
    id: `template-${index}`,
    day, start, end, title, color, content: "", trainerIds: [],
  }));
}
