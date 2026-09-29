export const ADMIN_EMAILS = [
  "bafa@murathenes.org",
  "lorette.k@murathenes.org",
] as const;

export function isAdminEmail(email: string | null | undefined): boolean {
  return ADMIN_EMAILS.includes((email ?? "").trim().toLowerCase() as (typeof ADMIN_EMAILS)[number]);
}
