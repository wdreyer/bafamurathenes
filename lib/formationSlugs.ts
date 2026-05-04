import type { Formation } from "@/lib/types";

const MONTHS_FR_SLUG = [
  "janvier",
  "fevrier",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "aout",
  "septembre",
  "octobre",
  "novembre",
  "decembre",
];

const TYPE_SLUG: Record<Formation["type"], string> = {
  formation_generale: "formation-generale-bafa",
  approfondissement_sejour_etranger: "etape-3-approfondissement-bafa-sejour-etranger",
};

const LEGACY_TYPE_SLUGS: Partial<Record<Formation["type"], string[]>> = {
  approfondissement_sejour_etranger: ["approfondissement-bafa-sejour-etranger"],
};

export function normalizeSlugSegment(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "-")
    .replace(/&/g, " et ")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .toLowerCase();
}

function parseDate(value?: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateSlug(startDate?: string, endDate?: string): string {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (!start || !end) return "";

  const startDay = start.getDate();
  const endDay = end.getDate();
  const startMonth = MONTHS_FR_SLUG[start.getMonth()];
  const endMonth = MONTHS_FR_SLUG[end.getMonth()];
  const year = end.getFullYear();

  if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
    return `du-${startDay}-au-${endDay}-${endMonth}-${year}`;
  }

  return `du-${startDay}-${startMonth}-au-${endDay}-${endMonth}-${year}`;
}

function buildFormationSlug(
  formation: Pick<Formation, "type" | "startDate" | "endDate">,
  typeSlug: string,
): string {
  const date = formatDateSlug(formation.startDate, formation.endDate);
  return normalizeSlugSegment([typeSlug, date].filter(Boolean).join("-"));
}

export function getFormationSlug(formation: Pick<Formation, "type" | "startDate" | "endDate">): string {
  const type = TYPE_SLUG[formation.type] ?? "formation-bafa";
  return buildFormationSlug(formation, type);
}

export function getFormationLegacySlugs(
  formation: Pick<Formation, "type" | "startDate" | "endDate">,
): string[] {
  return (LEGACY_TYPE_SLUGS[formation.type] ?? []).map((typeSlug) =>
    buildFormationSlug(formation, typeSlug),
  );
}

export function getFormationPublicHref(formation: Pick<Formation, "type" | "startDate" | "endDate">): string {
  return `/formations/${getFormationSlug(formation)}`;
}
