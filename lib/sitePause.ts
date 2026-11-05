// Public site pause switch, stored in Firestore at siteSettings/public (readable by all, written by admins).
export const SITE_SETTINGS_COLLECTION = "siteSettings";
export const SITE_SETTINGS_DOC = "public";

export const DEFAULT_PAUSE_MESSAGE =
  "On prépare la suite de nos formations BAFA. Le site revient très vite ! En attendant, on reste joignables par e-mail et par téléphone.";

export type SitePause = {
  paused: boolean;
  message: string;
};

export const SITE_ONLINE: SitePause = { paused: false, message: "" };
