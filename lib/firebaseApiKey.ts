export function getFirebaseApiKey(): string {
  const configuredKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() ?? "";

  // The deployed environment briefly contained an accidental leading X.
  return configuredKey.startsWith("XAIza") ? configuredKey.slice(1) : configuredKey;
}
