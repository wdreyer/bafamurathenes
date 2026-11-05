// Public site pause switch, stored in Firestore at siteSettings/public (readable by all, written by admins).
export const SITE_SETTINGS_COLLECTION = "siteSettings";
export const SITE_SETTINGS_DOC = "public";

export type SitePause = {
  paused: boolean;
};

export const SITE_ONLINE: SitePause = { paused: false };
