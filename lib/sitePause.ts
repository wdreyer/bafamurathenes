// Public site pause switch, stored in Firestore at siteSettings/public (readable by all, written by admins).
export const SITE_SETTINGS_COLLECTION = "siteSettings";
export const SITE_SETTINGS_DOC = "public";

export const DEFAULT_PAUSE_MESSAGE =
  "Les veillées se sont tues. Les grands jeux sont rangés. Le dernier chant résonne encore quelque part dans le Cantal…\nMurathènes se retire dans les coulisses, le temps de préparer la suite. Ce n'est pas un adieu : c'est un entracte.";

export type SitePause = {
  paused: boolean;
  message: string;
};

export const SITE_ONLINE: SitePause = { paused: false, message: "" };
