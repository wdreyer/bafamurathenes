// Public site pause switch, stored in Firestore at siteSettings/public (readable by all, written by admins).
export const SITE_SETTINGS_COLLECTION = "siteSettings";
export const SITE_SETTINGS_DOC = "public";

// Text shown alone on the black pause screen (field `endText`; the older `message` field is no longer used).
export const DEFAULT_END_TEXT = "Fin…";

export type SitePause = {
  paused: boolean;
  text: string;
};

export const SITE_ONLINE: SitePause = { paused: false, text: DEFAULT_END_TEXT };

export function endTextOrDefault(text: string | null | undefined) {
  return (text ?? "").trim() || DEFAULT_END_TEXT;
}
