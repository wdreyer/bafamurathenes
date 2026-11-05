import { getFirebaseApiKey } from "@/lib/firebaseApiKey";
import { endTextOrDefault, SITE_ONLINE, SITE_SETTINGS_COLLECTION, SITE_SETTINGS_DOC, type SitePause } from "@/lib/sitePause";

// Read through Firestore's REST API so the server needs no admin credentials.
// Cached for 30 s; the admin switch purges the cache right after a change.
export async function getSitePause(): Promise<SitePause> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) return SITE_ONLINE;

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${SITE_SETTINGS_COLLECTION}/${SITE_SETTINGS_DOC}?key=${getFirebaseApiKey()}`;

  try {
    const response = await fetch(url, { next: { revalidate: 30 } });
    // Missing document or rules not deployed yet: the site stays online.
    if (!response.ok) return SITE_ONLINE;

    const data = (await response.json()) as {
      fields?: { paused?: { booleanValue?: boolean }; endText?: { stringValue?: string } };
    };
    return {
      paused: data.fields?.paused?.booleanValue === true,
      text: endTextOrDefault(data.fields?.endText?.stringValue),
    };
  } catch {
    return SITE_ONLINE;
  }
}
