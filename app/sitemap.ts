import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/siteUrl";
import type { Formation } from "@/lib/types";
import { getFormationSlug } from "@/lib/formationSlugs";

type FirestoreValue = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  timestampValue?: string;
  arrayValue?: { values?: FirestoreValue[] };
  mapValue?: { fields?: Record<string, FirestoreValue> };
};

type FirestoreDocument = {
  name: string;
  fields?: Record<string, FirestoreValue>;
};

type FirestoreListResponse = {
  documents?: FirestoreDocument[];
};

const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents/formations`;

function readFirestoreValue(value: FirestoreValue): unknown {
  if ("stringValue" in value) return value.stringValue ?? "";
  if ("integerValue" in value) return Number(value.integerValue ?? 0);
  if ("doubleValue" in value) return value.doubleValue ?? 0;
  if ("timestampValue" in value) return value.timestampValue ?? "";
  if ("arrayValue" in value) return (value.arrayValue?.values ?? []).map(readFirestoreValue);
  if ("mapValue" in value) {
    return Object.fromEntries(
      Object.entries(value.mapValue?.fields ?? {}).map(([key, nestedValue]) => [
        key,
        readFirestoreValue(nestedValue),
      ]),
    );
  }
  return null;
}

function normalizeDate(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function mapFirestoreDocument(document: FirestoreDocument): Formation {
  const id = document.name.split("/").pop() ?? "";
  const data = Object.fromEntries(
    Object.entries(document.fields ?? {}).map(([key, value]) => [key, readFirestoreValue(value)]),
  ) as Record<string, unknown>;

  return {
    ...data,
    id,
    startDate: normalizeDate(data.startDate),
    endDate: normalizeDate(data.endDate),
  } as Formation;
}

async function fetchAllFormations(): Promise<Formation[]> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) return [];

  const response = await fetch(`${FIRESTORE_BASE_URL}?key=${apiKey}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) return [];

  const data = (await response.json()) as FirestoreListResponse;
  return (data.documents ?? []).map(mapFirestoreDocument);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const formations = await fetchAllFormations();

  return [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/formations`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/infos-pratiques`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/bafa`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/murathenes`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...formations.map((formation) => ({
      url: `${siteUrl}/formations/${getFormationSlug(formation)}`,
      lastModified: formation.updatedAt ?? now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
  ];
}
