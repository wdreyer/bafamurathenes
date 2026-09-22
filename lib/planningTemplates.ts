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

// Source: "Planning 21-27 avril 2025 APPRO .xlsx", Feuille 1; days are relative to the session.
const appro: TemplateItem[] = [
  [1,"18:00","18:45","Accueil stagiaires","neutral"],
  [1,"19:00","20:30","Pause repas","neutral"],
  [1,"20:30","22:00","Présentations (équipes, stagiaires, cursus)","neutral"],

  [2,"09:00","09:15","Chants/Danses formatrices","sky"],
  [2,"09:15","10:00","Visite du domaine","sky"],
  [2,"10:00","10:15","Pause","neutral"],
  [2,"10:15","11:00","Prépa Commissions (Map, Inventaire, Aménagement, Règles de vie, Planning)","sky"],
  [2,"11:00","11:45","Restitutions commissions","sky"],
  [2,"12:00","14:00","Pause repas","neutral"],
  [2,"14:00","14:30","Starters formatrices","sky"],
  [2,"14:30","15:15","HACCP - règles hygiène repas","sky"],
  [2,"15:15","16:00","Préparation des repas / Gestion de budget","coral"],
  [2,"16:00","16:30","Goûter","neutral"],
  [2,"16:30","18:00","Courses (Bort les orgues)","neutral"],
  [2,"18:00","18:45","Préparation repas","coral"],
  [2,"19:00","20:30","Pause repas","neutral"],
  [2,"20:30","22:00","Veillée imaginaire / Théâtre","sky"],

  [3,"09:00","09:15","Chants / Danses stagiaires","lemon"],
  [3,"09:15","10:00","Présentation des dispositifs à l'étranger","sky"],
  [3,"10:00","10:15","Pause","neutral"],
  [3,"10:15","11:00","Projet jeune fil rouge (intervenantes exterieures)","mint"],
  [3,"11:00","11:45","Prépa repas / Prépa projet jeune","coral"],
  [3,"12:00","14:00","Pause repas","neutral"],
  [3,"14:00","14:30","Starters stagiaires","lemon"],
  [3,"14:30","16:00","Retour stages pratiques","sky"],
  [3,"16:00","16:30","Goûter","neutral"],
  [3,"16:30","17:15","PSADRAFRA SIOU","sky"],
  [3,"17:15","18:00","Repartition Grand jeux","sky"],
  [3,"18:00","18:45","Prépa repas / prépa projet jeunes","coral"],
  [3,"19:00","20:30","Pause repas","neutral"],
  [3,"20:30","22:00","Violences ordinaires / maltraitance","sky"],

  [4,"09:00","09:15","Chants / Danses stagiaires","lemon"],
  [4,"09:15","10:00","Prépa Grand jeux","lilac"],
  [4,"10:00","10:15","Pause","neutral"],
  [4,"10:15","11:45","Prépa Grand jeux / Entretiens mi-stage","lilac"],
  [4,"12:00","14:00","repas exterieur","neutral"],
  [4,"14:00","15:15","Visite Chateau de Val","mint"],
  [4,"15:15","16:00","Reperage Bort les Orgues","lemon"],
  [4,"16:00","16:30","Goûter","neutral"],
  [4,"16:30","17:15","Reglementation","sky"],
  [4,"17:15","18:00","Remobilisation","sky"],
  [4,"18:00","18:45","Gestion des transports","sky"],
  [4,"19:00","20:30","Pause repas","neutral"],
  [4,"20:30","22:00","Veillée expression artistique 6-9ans","lemon"],

  [5,"09:00","09:15","Chants / Danses stagiaires","lemon"],
  [5,"09:15","10:00","Situations de handicapes","sky"],
  [5,"10:00","10:15","Pause","neutral"],
  [5,"10:15","11:00","Prépa activités multilingues","lilac"],
  [5,"11:00","11:45","Prépa repas / Prépa projet jeune","coral"],
  [5,"12:00","14:00","Pause repas","neutral"],
  [5,"14:00","16:00","Grand jeux (Bort les Orgues) pré-ado","lemon"],
  [5,"16:00","16:30","Goûter","neutral"],
  [5,"16:30","17:15","Activités multilingues","lemon"],
  [5,"17:15","18:00","Activités multilingues","lemon"],
  [5,"18:00","18:45","Prépa repas / prépa projet jeunes","coral"],
  [5,"19:00","20:30","Pause repas","neutral"],
  [5,"20:30","22:00","Veillée conte (ado, interculturel)","lemon"],

  [6,"09:00","09:15","Chants / Danses stagiaires","lemon"],
  [6,"09:15","10:00","Sanction / Punition Gestion de conflit (mises en situations)","sky"],
  [6,"10:00","10:15","Pause","neutral"],
  [6,"10:15","11:00","VSS","sky"],
  [6,"11:00","11:45","Prépa repas / Prépa projet jeune","coral"],
  [6,"12:00","14:00","Pause repas","neutral"],
  [6,"14:00","14:30","starters stagiaires","lemon"],
  [6,"14:30","16:00","Grand jeu sportif 3-5ans","lemon"],
  [6,"16:00","16:30","Goûter","neutral"],
  [6,"16:30","17:15","Activités multilingues","lemon"],
  [6,"17:15","18:00","Activités multilingues","lemon"],
  [6,"18:00","18:45","Prépa repas / prépa projet jeunes","coral"],
  [6,"19:00","20:30","Pause repas","neutral"],
  [6,"20:30","22:00","Veillée clotûre (spectacle interactif)","lemon"],

  [7,"09:00","09:15","Chants / Danses stagiaires","lemon"],
  [7,"09:15","10:00","Rangement","neutral"],
  [7,"10:00","10:15","Pause","neutral"],
  [7,"10:15","11:00","Evaluations individuelles","sky"],
  [7,"11:00","11:45","Bilan de fin de formation","sky"],
  [7,"12:00","14:00","Pause repas","neutral"],
  [7,"14:00","14:30","Clotûre de session","sky"],
];

export function buildPlanningTemplate(formation: Formation): PlanActivity[] {
  const isGeneral = formation.type === "formation_generale";
  const items = isGeneral ? general : appro;
  const recurring: TemplateItem[] = (isGeneral ? Array.from({ length: 7 }, (_, index) => index + 2) : [])
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
