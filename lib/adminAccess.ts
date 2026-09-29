export const ADMIN_TRAINERS = [
  {
    id: "zE1LYEEyooedqV3YyGsTVJA3FcJ3",
    email: "bafa@murathenes.org",
    firstName: "Équipe",
    lastName: "Murathènes",
  },
  {
    id: "AIXQKYuqrTeRxHG4lie73EGCpmk2",
    email: "lorette.k@murathenes.org",
    firstName: "Lorette",
    lastName: "K.",
  },
] as const;

export const ADMIN_EMAILS = ADMIN_TRAINERS.map((admin) => admin.email);
export const ADMIN_TRAINER_IDS = ADMIN_TRAINERS.map((admin) => admin.id);
export const ADMIN_TRAINER_NAMES = Object.fromEntries(
  ADMIN_TRAINERS.map((admin) => [admin.id, `${admin.firstName} ${admin.lastName}`]),
);

export function isAdminEmail(email: string | null | undefined): boolean {
  const normalizedEmail = (email ?? "").trim().toLowerCase();
  return ADMIN_EMAILS.some((adminEmail) => adminEmail === normalizedEmail);
}

export function isAdminUid(uid: string | null | undefined): boolean {
  return ADMIN_TRAINER_IDS.some((adminUid) => adminUid === uid);
}
