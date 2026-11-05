// Public site pause switch, stored in Firestore at siteSettings/public (readable by all, written by admins).
export const SITE_SETTINGS_COLLECTION = "siteSettings";
export const SITE_SETTINGS_DOC = "public";

export const DEFAULT_PAUSE_MESSAGE =
  "Des veillées sous les étoiles du Cantal, des grands jeux à en perdre la voix, des chants qu'on fredonne encore… et surtout tant d'animateurs et d'animatrices formé·es avec le cœur.\nQuelle belle aventure. Merci à chaque stagiaire, à chaque formateur et formatrice, à chaque famille qui nous a fait confiance.";

// Earlier default texts were saved automatically with the switch; they are not a custom message.
const PREVIOUS_DEFAULT_MESSAGES = [
  "On prépare la suite de nos formations BAFA. Le site revient très vite ! En attendant, on reste joignables par e-mail et par téléphone.",
  "Les veillées se sont tues. Les grands jeux sont rangés. Le dernier chant résonne encore quelque part dans le Cantal…\nMurathènes se retire dans les coulisses, le temps de préparer la suite. Ce n'est pas un adieu : c'est un entracte.",
];

export function pauseMessageOrDefault(message: string | null | undefined) {
  const trimmed = (message ?? "").trim();
  return trimmed && !PREVIOUS_DEFAULT_MESSAGES.includes(trimmed) ? trimmed : DEFAULT_PAUSE_MESSAGE;
}

export type SitePause = {
  paused: boolean;
  message: string;
};

export const SITE_ONLINE: SitePause = { paused: false, message: "" };
