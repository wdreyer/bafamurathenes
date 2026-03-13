import type { Formation } from "@/lib/types";

export const APRIL_FG_PROMO = {
  year: 2026,
  monthIndex: 3, // April
  regularPrice: 550,
  promoPrice: 500,
} as const;

type DateLike =
  | string
  | number
  | Date
  | null
  | undefined
  | { toDate?: () => Date };

type FormationLike = Pick<Formation, "type" | "startDate" | "price">;

export function toDateSafe(value: DateLike): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "object" && typeof value.toDate === "function") {
    return value.toDate();
  }

  const d = new Date(value as string | number);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function isAprilFgPromoFormation(
  formation: Pick<Formation, "type" | "startDate">
): boolean {
  if (formation.type !== "formation_generale") return false;
  const d = toDateSafe(formation.startDate as DateLike);
  if (!d) return false;

  return (
    d.getFullYear() === APRIL_FG_PROMO.year &&
    d.getMonth() === APRIL_FG_PROMO.monthIndex
  );
}

export function getDisplayedFormationPrice(formation: FormationLike): number {
  return isAprilFgPromoFormation(formation)
    ? APRIL_FG_PROMO.promoPrice
    : formation.price;
}

export function getReferenceFormationPrice(
  formation: Pick<Formation, "type" | "startDate">
): number | null {
  return isAprilFgPromoFormation(formation) ? APRIL_FG_PROMO.regularPrice : null;
}
